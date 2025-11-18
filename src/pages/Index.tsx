import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, AlertCircle, Car, Users, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { fetchEncounters, fetchConditions, fetchObservations, resolvePatients } from "@/utils/fhirClient";
import { calculateMetrics, groupByAgeGroup, groupBySex } from "@/utils/metricsCalculator";
import { groupByInjuryType } from "@/utils/snomedMapping";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { SexPieChart } from "@/components/dashboard/SexPieChart";
import { AgeBarChart } from "@/components/dashboard/AgeBarChart";
import { InjuryBarChart } from "@/components/dashboard/InjuryBarChart";
import { MortalityPieChart } from "@/components/dashboard/MortalityPieChart";
import { EncounterTable } from "@/components/dashboard/EncounterTable";
import { ConditionTable } from "@/components/dashboard/ConditionTable";

const Index = () => {
  const { toast } = useToast();
  const [date, setDate] = useState<{ from: Date; to: Date } | undefined>({
    from: new Date("2025-11-01"),
    to: new Date("2025-11-30")
  });

  // Fetch all data
  const { data: encountersData, isLoading: encountersLoading, refetch: refetchEncounters } = useQuery({
    queryKey: ["encounters", date],
    queryFn: async () => {
      try {
        if (!date) {
          return [];
        }
        const encounters = await fetchEncounters(
          format(date.from, "yyyy-MM-dd"),
          format(date.to, "yyyy-MM-dd")
        );
        return encounters;
      } catch (error) {
        toast({
          title: "Error fetching encounters",
          description: "Failed to load encounter data from FHIR server",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const { data: conditionsData, isLoading: conditionsLoading } = useQuery({
    queryKey: ["conditions", date],
    queryFn: async () => {
      try {
        if (!date) {
          return [];
        }
        const conditions = await fetchConditions(
          format(date.from, "yyyy-MM-dd"),
          format(date.to, "yyyy-MM-dd")
        );
        return conditions;
      } catch (error) {
        toast({
          title: "Error fetching conditions",
          description: "Failed to load condition data from FHIR server",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  // Fetch observations with SNOMED CT code 274215009 for Transport accident (event)
  const { data: transportAccidentData, isLoading: transportAccidentLoading } = useQuery({
    queryKey: ["transportAccidentObservations", date],
    queryFn: async () => {
      try {
        if (!date) {
          return [];
        }
        const observations = await fetchObservations(
          format(date.from, "yyyy-MM-dd"),
          format(date.to, "yyyy-MM-dd")
        );
        // Filter for SNOMED CT code for Transport accident (event)
        const transportAccidentObservations = observations.filter(obs => {
          try {
            return obs?.code?.coding?.some((coding: any) =>
              coding?.system === "http://snomed.info/sct/900000000000207008/version/20241001" &&
              coding?.code === "274215009"  // SNOMED CT code for Transport accident (event)
            );
          } catch (error) {
            console.warn("Error while filtering observation", error);
            return false;
          }
        });
        return transportAccidentObservations;
      } catch (error) {
        toast({
          title: "Error fetching observations",
          description: "Failed to load observation data from FHIR server",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const { data: patientsData, isLoading: patientsLoading } = useQuery({
    queryKey: ["patients", encountersData],
    queryFn: async () => {
      if (!encountersData || encountersData.length === 0) return new Map();
      try {
        const patients = await resolvePatients(encountersData);
        return patients;
      } catch (error) {
        toast({
          title: "Error resolving patients",
          description: "Failed to load patient data",
          variant: "destructive",
        });
        return new Map();
      }
    },
    enabled: !!encountersData && encountersData.length > 0,
  });

  const encounters = encountersData || [];
  const conditions = conditionsData || [];
  const transportAccidentObservations = transportAccidentData || [];
  const patients = patientsData || new Map();
  const isLoading = encountersLoading || conditionsLoading || patientsLoading;

  // Calculate metrics
  const [metrics, setMetrics] = useState<any>(null);
  const [injuryGroups, setInjuryGroups] = useState<Record<string, number>>({});
  const [ageGroups, setAgeGroups] = useState<Record<string, number>>({});
  const [sexGroups, setSexGroups] = useState<Record<string, number>>({});
  const [expiredCount, setExpiredCount] = useState<number>(0);
  const [survivedCount, setSurvivedCount] = useState<number>(0);
  const [transportAccidentCount, setTransportAccidentCount] = useState<number>(0);

  // Additional state for async processing
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  // Calculate metrics when data changes
  useEffect(() => {
    if (encounters.length > 0 || conditions.length > 0 || transportAccidentObservations.length > 0) {
      setIsMetricsLoading(true);

      const calculateAsyncMetrics = async () => {
        const calculatedMetrics = await calculateMetrics(encounters, conditions, patients);
        const calculatedInjuryGroups = groupByInjuryType(conditions);
        const calculatedAgeGroups = groupByAgeGroup(patients);
        const calculatedSexGroups = groupBySex(patients);

        // Calculate expired count using the async isExpired function
        const { isExpired } = await import("@/utils/metricsCalculator");
        const expiredPromises = encounters.map(enc => isExpired(enc));
        const expiredResults = await Promise.all(expiredPromises);
        const calculatedExpiredCount = expiredResults.filter(Boolean).length;
        const calculatedSurvivedCount = encounters.length - calculatedExpiredCount;

        // Calculate transport accident count
        const calculatedTransportAccidentCount = transportAccidentObservations.length;

        setMetrics(calculatedMetrics);
        setInjuryGroups(calculatedInjuryGroups);
        setAgeGroups(calculatedAgeGroups);
        setSexGroups(calculatedSexGroups);
        setExpiredCount(calculatedExpiredCount);
        setSurvivedCount(calculatedSurvivedCount);
        setTransportAccidentCount(calculatedTransportAccidentCount);
        setIsMetricsLoading(false);
      };

      calculateAsyncMetrics();
    }
  }, [encounters, conditions, transportAccidentObservations, patients]);

  const finalIsLoading = isLoading || isMetricsLoading || transportAccidentLoading;

  const handleRefresh = () => {
    refetchEncounters();
    toast({
      title: "Refreshing data",
      description: "Fetching latest data from FHIR server...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Road Safety Analytics Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                FHIR-based road safety medical and EMS data analytics
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center">
              {/* Date Range Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={(selectedRange) => {
                      // Validate that the date range is proper
                      if (selectedRange?.from && selectedRange?.to) {
                        if (selectedRange.from > selectedRange.to) {
                          toast({
                            title: "Invalid Date Range",
                            description: "Start date cannot be after end date.",
                            variant: "destructive",
                          });
                          return;
                        }
                      }
                      setDate(selectedRange);
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              <Button onClick={handleRefresh} variant="default">
                Refresh Data
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Key Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              title="Mortality Rate"
              value={metrics?.mortalityRate || 0}
              unit="per 100k"
              icon={AlertCircle}
              description="Traffic accident deaths per 100,000 population"
              tooltip="Number of traffic accident deaths per 100,000 people in the population during the selected date range"
              isLoading={finalIsLoading}
            />
            <MetricCard
              title="Deaths per 10k Vehicles"
              value={metrics?.deathsPer10kVehicles || 0}
              unit="per 10k"
              icon={Car}
              description="Road traffic deaths per 10,000 motor vehicles"
              tooltip="Number of road traffic deaths per 10,000 registered motor vehicles during the selected date range"
              isLoading={finalIsLoading}
            />
            <MetricCard
              title="Injury Rate"
              value={metrics?.injuryRate || 0}
              unit="per 100k"
              icon={TrendingUp}
              description="Non-fatal injuries per 100,000 population"
              tooltip="Number of non-fatal traffic-related injuries per 100,000 people in the population during the selected date range"
              isLoading={finalIsLoading}
            />
            <MetricCard
              title="Case Fatality Rate"
              value={metrics?.caseFatalityRate || 0}
              unit="%"
              icon={Activity}
              description="Percentage of accidents resulting in death"
              tooltip="Percentage of traffic accidents that resulted in death during the selected date range"
              isLoading={finalIsLoading}
            />
            <MetricCard
              title="Accidents per Vehicle"
              value={metrics?.accidentPerVehicle || 0}
              unit="per 10k"
              icon={Users}
              description="Reported accidents per 10,000 vehicles"
              tooltip="Number of reported traffic accidents per 10,000 registered vehicles during the selected date range"
              isLoading={finalIsLoading}
            />
            <MetricCard
              title="Transport Accidents"
              value={transportAccidentCount || 0}
              unit="#"
              icon={Activity}
              description="Observations with SNOMED CT code 274215009 (Transport accident)"
              tooltip="Number of FHIR Observation resources with SNOMED CT code 274215009 (Transport accident) during the selected date range"
              isLoading={finalIsLoading || transportAccidentLoading}
            />
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Analytics & Trends</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SexPieChart data={sexGroups} isLoading={finalIsLoading} />
            <AgeBarChart data={ageGroups} isLoading={finalIsLoading} />
            <InjuryBarChart data={injuryGroups} isLoading={finalIsLoading} />
            <div className="md:col-span-2 lg:col-span-1">
              <MortalityPieChart
                expired={expiredCount}
                survived={survivedCount}
                isLoading={finalIsLoading}
              />
            </div>

          </div>
        </section>

        {/* Data Tables */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Detailed Data</h2>
          <div className="space-y-6">
            <EncounterTable encounters={encounters} isLoading={isLoading} />
            <ConditionTable conditions={conditions} isLoading={isLoading} />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
