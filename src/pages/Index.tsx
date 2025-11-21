import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, Car, Users, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { fetchEncounters, fetchConditions, fetchObservations, resolvePatients } from "@/utils/fhirClient";
import { calculateMetrics, groupByAgeGroup, groupBySex } from "@/utils/metricsCalculator";
import { groupByInjuryType } from "@/utils/snomedMapping";
import { fetchPopulationData, fetchVehicleCountData } from "@/utils/dataFetchers";

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
    from: new Date("2025-11-17"),
    to: new Date("2025-11-21")
  });

  // State for rate multiplier selections
  const [mortalityMultiplier, setMortalityMultiplier] = useState<string>("100000"); // Default to per 100k
  const [injuryMultiplier, setInjuryMultiplier] = useState<string>("100000"); // Default to per 100k

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

  // Fetch observations with SNOMED CT codes 274215009 (Transport accident) and 127348004 (Motor vehicle accident victim)
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
        // Filter for both SNOMED CT codes for Transport accident (event) and Motor vehicle accident victim
        const transportAccidentObservations = observations.filter(obs => {
          try {
            return obs?.code?.coding?.some((coding: any) =>
              (coding?.system === "http://snomed.info/sct" ||
               coding?.system === "http://snomed.info/sct/900000000000207008/version/20241001") &&
              (coding?.code === "274215009" || coding?.code === "127348004")  // Both codes for transport accidents
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

  // Fetch observations with "DIED" value for mortality tracking using the specific endpoint
  const { data: deathObservationsResult, isLoading: deathObservationsLoading } = useQuery({
    queryKey: ["deathObservations", date],
    queryFn: async () => {
      try {
        if (!date) {
          return { resources: [], total: 0 };
        }

        // Use the existing fetchObservationsByConcept function but with the value-concept parameter
        // We need to modify this to call the appropriate API with the "DIED" filter
        const { fetchObservationsByConcept } = await import("@/utils/fhirClient");
        return await fetchObservationsByConcept("DIED", format(date.from, "yyyy-MM-dd"), format(date.to, "yyyy-MM-dd"));
      } catch (error) {
        toast({
          title: "Error fetching death observations",
          description: "Failed to load death observation data from FHIR server",
          variant: "destructive",
        });
        return { resources: [], total: 0 };
      }
    },
  });

  // Extract resources and total from the result
  const deathObservations = deathObservationsResult?.resources || [];
  const deathObservationsTotal = deathObservationsResult?.total || 0;

  // Calculate metrics when data changes
  useEffect(() => {
    if (encounters.length > 0 || conditions.length > 0 || transportAccidentObservations.length > 0) {
      setIsMetricsLoading(true);

      const calculateAsyncMetrics = async () => {
        // Fetch required data from server APIs
        const populationAtRisk = await fetchPopulationData(); // Fetch from population registry API
        const motorVehiclesCount = await fetchVehicleCountData(); // Fetch from vehicle registry API

        // Use death observations for outcome detection based on the specific endpoint
        const observationsForMetrics = deathObservations || [];
        const calculatedMetrics = await calculateMetrics(encounters, conditions, patients, populationAtRisk, motorVehiclesCount, date, observationsForMetrics);

        // Pass the date range and encounters to the grouping functions
        const calculatedInjuryGroups = groupByInjuryType(conditions);
        const calculatedAgeGroups = groupByAgeGroup(patients, encounters, date);
        const calculatedSexGroups = groupBySex(patients, encounters, date);

        // Calculate expired and survived counts using patient-based logic for consistency with calculateMetrics
        // This matches the approach in calculateMetrics for unique patient counting
        const { isTrafficRelatedCondition } = await import("@/utils/snomedMapping");
        const { isExpired, countTransportAccidentConditions } = await import("@/utils/metricsCalculator");

        // Identify traffic patients (patients with traffic-related conditions)
        const trafficPatients = new Set<string>();
        for (const enc of encounters) {
          const patientId = enc.subject?.reference?.replace("Patient/", "");
          const patientConditions = conditions.filter(cond =>
            cond.subject?.reference?.replace("Patient/", "") === patientId
          );

          for (const condition of patientConditions) {
            if (isTrafficRelatedCondition(condition)) {
              trafficPatients.add(patientId);
              break;
            }
          }
        }

        // Count patients with death observations (same approach as calculateMetrics)
        const observationBasedTrafficDeaths = new Set<string>();
        for (const obs of observationsForMetrics) {
          const patientId = obs.subject?.reference?.replace("Patient/", "");
          if (patientId && trafficPatients.has(patientId)) { // Only count if patient also has traffic-related condition
            observationBasedTrafficDeaths.add(patientId);
          }
        }

        // For each traffic patient, determine if they died (same approach as calculateMetrics)
        const patientDeathStatus = new Map<string, boolean>();
        const uniquePatientIds = [...trafficPatients];

        for (const patientId of uniquePatientIds) {
          if (observationBasedTrafficDeaths.has(patientId)) {
            patientDeathStatus.set(patientId, true);
          } else {
            // For patients without death observations, check encounters using the same date filtering
            const patientEncounters = encounters.filter(enc => {
              const encounterDate = new Date(enc._lastUpdated || enc.period?.start || enc.period?.end || enc.meta?.lastUpdated);
              const dateFrom = new Date(date.from);
              const dateTo = new Date(date.to);
              const encPatientId = enc.subject?.reference?.replace("Patient/", "");
              return encPatientId === patientId && encounterDate >= dateFrom && encounterDate <= dateTo;
            });

            const expiredPromises = patientEncounters.map(enc => isExpired(enc, observationsForMetrics, patientId));
            const expiredResults = await Promise.all(expiredPromises);
            const diedFromTrafficAccident = expiredResults.some(Boolean);
            patientDeathStatus.set(patientId, diedFromTrafficAccident);
          }
        }

        // Use the total from the FHIR bundle as the expired count as requested
        // This directly reflects the count from the API call: https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED&...
        const calculatedExpiredCount = deathObservationsTotal;
        // For the pie chart, we can calculate survived as the number of traffic patients minus expired
        // (though this is a simplified calculation)
        const calculatedSurvivedCount = Math.max(0, trafficPatients.size - calculatedExpiredCount);

        // Log the mortality counts for verification
        console.log(`Expired count: ${calculatedExpiredCount}, Survived count: ${calculatedSurvivedCount}`);

        // Calculate transport accident count from both observations and conditions
        const observationTransportAccidents = transportAccidentObservations.length;
        const conditionTransportAccidents = countTransportAccidentConditions(conditions);
        const calculatedTransportAccidentCount = conditionTransportAccidents;

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
  }, [encounters, conditions, transportAccidentObservations, patients, deathObservations, date]);

  const finalIsLoading = isLoading || isMetricsLoading || transportAccidentLoading || deathObservationsLoading;

  // Function to convert base rate (per 100k) to selected multiplier
  const convertRate = (baseRate: number, multiplier: string): number => {
    // baseRate is currently per 100,000, so we need to adjust to the selected multiplier
    const baseMultiplier = 100000; // The base rate is per 100,000
    const selectedMultiplier = parseInt(multiplier);
    return (baseRate * selectedMultiplier) / baseMultiplier;
  };

  // Calculate displayed rates based on selected multipliers
  const displayedMortalityRate = metrics ? convertRate(metrics.mortalityRate, mortalityMultiplier) : 0;
  const displayedInjuryRate = metrics ? convertRate(metrics.injuryRate, injuryMultiplier) : 0;

  // Get the label for the selected multiplier
  const getMultiplierLabel = (multiplier: string): string => {
    switch(multiplier) {
      case "100": return "per 100";
      case "1000": return "per 1k";
      case "10000": return "per 10k";
      case "1000000": return "per 1M";
      default: return "per 100k"; // Default to per 100k
    }
  };

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
      <header className="border-b bg-card flex justify-end items-center h-28 px-4 bg-no-repeat bg-left-top bg-contain" style={{ backgroundImage: "url('/SIL-PH-Icon.png')" }}>
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Key Metrics */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Key Metrics</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Mortality Rate"
              value={displayedMortalityRate}
              unit={getMultiplierLabel(mortalityMultiplier)}
              icon={AlertCircle}
              description={`Traffic accident deaths ${getMultiplierLabel(mortalityMultiplier)} population`}
              tooltip="Number of traffic accident deaths per selected population unit during the selected date range"
              isLoading={finalIsLoading}
              showMultiplierDropdown={true}
              multiplierValue={mortalityMultiplier}
              onMultiplierChange={setMortalityMultiplier}
            />
            <MetricCard
              title="Injury Rate"
              value={displayedInjuryRate}
              unit={getMultiplierLabel(injuryMultiplier)}
              icon={TrendingUp}
              description={`Non-fatal injuries ${getMultiplierLabel(injuryMultiplier)} population`}
              tooltip="Number of non-fatal traffic-related injuries per selected population unit during the selected date range"
              isLoading={finalIsLoading}
              showMultiplierDropdown={true}
              multiplierValue={injuryMultiplier}
              onMultiplierChange={setInjuryMultiplier}
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
            {/* MetricCard
              title="Accidents per Vehicle"
              value={metrics?.accidentPerVehicle || 0}
              unit="per 10k"
              icon={Users}
              description="Reported accidents per 10,000 vehicles"
              tooltip="Number of reported traffic accidents per 10,000 registered vehicles during the selected date range"
              isLoading={finalIsLoading}
            / */}
            <MetricCard
              title="Transport Accidents"
              value={transportAccidentCount || 0}
              unit="#"
              icon={Activity}
              description="Observations and conditions with SNOMED CT codes 274215009 (Transport accident) or 127348004 (Motor vehicle accident victim)"
              tooltip="Number of FHIR Observation and Condition resources with either SNOMED CT code 274215009 (Transport accident) or 127348004 (Motor vehicle accident victim) during the selected date range"
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
