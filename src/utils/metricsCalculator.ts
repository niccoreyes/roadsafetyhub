// Metrics Calculation Utilities

import { isTrafficAccident } from "./snomedMapping";

export interface DashboardMetrics {
  mortalityRate: number;
  deathsPer10kVehicles: number;
  injuryRate: number;
  caseFatalityRate: number;
  accidentPerVehicle: number;
}

/**
 * Static placeholder for motor vehicle count
 * In a real system, this would come from a vehicle registry API
 */
const MOTOR_VEHICLES_COUNT = 50000;

/**
 * Static placeholder for population at risk
 */
const POPULATION_AT_RISK = 1000000;

/**
 * Checks if an encounter resulted in death
 */
export function isExpired(encounter: any): boolean {
  const disposition = encounter.hospitalization?.dischargeDisposition?.coding?.[0]?.code;
  return disposition === "exp" || disposition === "expired";
}

/**
 * Checks if a condition is traffic-related
 */
export function isTrafficRelatedCondition(condition: any): boolean {
  if (!condition.code?.coding) return false;
  
  return condition.code.coding.some((coding: any) => 
    isTrafficAccident(coding.code, coding.display)
  );
}

/**
 * Calculates all dashboard metrics
 */
export function calculateMetrics(
  encounters: any[],
  conditions: any[],
  patients: Map<string, any>
): DashboardMetrics {
  // Filter for traffic-related encounters and conditions
  const trafficEncounters = encounters.filter(enc => {
    // Check if associated conditions are traffic-related
    const patientId = enc.subject?.reference?.replace("Patient/", "");
    const patientConditions = conditions.filter(cond => 
      cond.subject?.reference?.replace("Patient/", "") === patientId
    );
    return patientConditions.some(isTrafficRelatedCondition);
  });

  const trafficConditions = conditions.filter(isTrafficRelatedCondition);

  // A. Mortality Rate due to Traffic Accident
  const trafficDeaths = trafficEncounters.filter(isExpired).length;
  const mortalityRate = (trafficDeaths / POPULATION_AT_RISK) * 100000;

  // B. Deaths per 10,000 Motor Vehicles
  const deathsPer10kVehicles = (trafficDeaths / MOTOR_VEHICLES_COUNT) * 10000;

  // C. Injury Rate by Traffic Accident
  const nonFatalInjuries = trafficConditions.filter(cond => {
    const patientId = cond.subject?.reference?.replace("Patient/", "");
    const patientEncounters = trafficEncounters.filter(enc => 
      enc.subject?.reference?.replace("Patient/", "") === patientId
    );
    return !patientEncounters.some(isExpired);
  }).length;
  const injuryRate = (nonFatalInjuries / POPULATION_AT_RISK) * 100000;

  // D. Case Fatality Rate
  const totalAccidents = trafficEncounters.length || 1; // Prevent division by zero
  const caseFatalityRate = (trafficDeaths / totalAccidents) * 100;

  // E. Accident per Vehicle
  const accidentPerVehicle = (totalAccidents / MOTOR_VEHICLES_COUNT) * 10000;

  return {
    mortalityRate,
    deathsPer10kVehicles,
    injuryRate,
    caseFatalityRate,
    accidentPerVehicle,
  };
}

/**
 * Calculates age from birth date
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Gets age group from age
 */
export function getAgeGroup(age: number): string {
  if (age < 15) return "0-14";
  if (age < 25) return "15-24";
  if (age < 45) return "25-44";
  if (age < 65) return "45-64";
  return "65+";
}

/**
 * Groups patients by age group
 */
export function groupByAgeGroup(patients: Map<string, any>): Record<string, number> {
  const groups: Record<string, number> = {
    "0-14": 0,
    "15-24": 0,
    "25-44": 0,
    "45-64": 0,
    "65+": 0,
  };

  patients.forEach(patient => {
    if (patient.birthDate) {
      const age = calculateAge(patient.birthDate);
      const group = getAgeGroup(age);
      groups[group]++;
    }
  });

  return groups;
}

/**
 * Groups patients by sex
 */
export function groupBySex(patients: Map<string, any>): Record<string, number> {
  const groups: Record<string, number> = {
    male: 0,
    female: 0,
    other: 0,
    unknown: 0,
  };

  patients.forEach(patient => {
    const gender = patient.gender?.toLowerCase() || "unknown";
    if (groups[gender] !== undefined) {
      groups[gender]++;
    } else {
      groups.unknown++;
    }
  });

  return groups;
}
