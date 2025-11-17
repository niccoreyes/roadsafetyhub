import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, TrendingUp, AlertCircle, Car, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { fetchEncounters, fetchConditions, resolvePatients } from "@/utils/fhirClient";
import { calculateMetrics, groupByAgeGroup, groupBySex, isExpired } from "@/utils/metricsCalculator";
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
  const [startDate, setStartDate] = useState<Date>(new Date("2024-01-01"));
  const [endDate, setEndDate] = useState<Date>(new Date("2024-12-31"));

  // Fetch all data
  const { data: encountersData, isLoading: encountersLoading, refetch: refetchEncounters } = useQuery({
    queryKey: ["encounters", startDate, endDate],
    queryFn: async () => {
      try {
        const encounters = await fetchEncounters(
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
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
    queryKey: ["conditions", startDate, endDate],
    queryFn: async () => {
      try {
        const conditions = await fetchConditions(
          format(startDate, "yyyy-MM-dd"),
          format(endDate, "yyyy-MM-dd")
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
  const patients = patientsData || new Map();
  const isLoading = encountersLoading || conditionsLoading || patientsLoading;

  // Calculate metrics
  const metrics = calculateMetrics(encounters, conditions, patients);
  const ageGroups = groupByAgeGroup(patients);
  const sexGroups = groupBySex(patients);
  const injuryGroups = groupByInjuryType(conditions);

  // Mortality breakdown
  const expiredCount = encounters.filter(isExpired).length;
  const survivedCount = encounters.length - expiredCount;

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
              {/* Start Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              {/* End Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="pointer-events-auto"
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
              value={metrics.mortalityRate}
              unit="per 100k"
              icon={AlertCircle}
              description="Traffic accident deaths per 100,000 population"
              isLoading={isLoading}
            />
            <MetricCard
              title="Deaths per 10k Vehicles"
              value={metrics.deathsPer10kVehicles}
              unit="per 10k"
              icon={Car}
              description="Road traffic deaths per 10,000 motor vehicles"
              isLoading={isLoading}
            />
            <MetricCard
              title="Injury Rate"
              value={metrics.injuryRate}
              unit="per 100k"
              icon={TrendingUp}
              description="Non-fatal injuries per 100,000 population"
              isLoading={isLoading}
            />
            <MetricCard
              title="Case Fatality Rate"
              value={metrics.caseFatalityRate}
              unit="%"
              icon={Activity}
              description="Percentage of accidents resulting in death"
              isLoading={isLoading}
            />
            <MetricCard
              title="Accidents per Vehicle"
              value={metrics.accidentPerVehicle}
              unit="per 10k"
              icon={Users}
              description="Reported accidents per 10,000 vehicles"
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Charts */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Analytics & Trends</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <SexPieChart data={sexGroups} isLoading={isLoading} />
            <AgeBarChart data={ageGroups} isLoading={isLoading} />
            <InjuryBarChart data={injuryGroups} isLoading={isLoading} />
            <div className="md:col-span-2 lg:col-span-1">
              <MortalityPieChart 
                expired={expiredCount} 
                survived={survivedCount} 
                isLoading={isLoading} 
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
