// Metrics Calculation Utilities

import { isTrafficRelatedCondition } from "./snomedMapping";

export interface DashboardMetrics {
  mortalityRate: number;
  deathsPer10kVehicles: number;
  injuryRate: number;
  caseFatalityRate: number;
  accidentPerVehicle: number;
  totalEncounters: number;
  totalTrafficAccidents: number;
  totalFatalities: number;
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
 * Checks if an encounter resulted in death using PH Road Safety IG ValueSet
 */
export async function isExpired(encounter: any): Promise<boolean> {
  const dispositionCoding = encounter.hospitalization?.dischargeDisposition?.coding?.[0];
  if (!dispositionCoding) return false;

  // Check if the disposition code is in the discharge disposition ValueSet
  const { isCodingInValueSet } = await import('./fhirClient');
  const isDeathDisposition = await isCodingInValueSet(
    dispositionCoding,
    'http://fhir.ph/ValueSet/discharge-disposition'
  );

  // Additionally check for specific death codes
  const dispositionCode = dispositionCoding.code;
  const deathCodes = ['exp', 'expired', 'dead', 'death'];

  return isDeathDisposition || deathCodes.includes(dispositionCode);
}

/**
 * Gets the discharge disposition category using PH Road Safety IG ValueSet
 */
export async function getDispositionCategory(encounter: any): Promise<string> {
  const dispositionCoding = encounter.hospitalization?.dischargeDisposition?.coding?.[0];
  if (!dispositionCoding) return "unknown";

  // Check if the disposition code is in the discharge disposition ValueSet
  const { isCodingInValueSet } = await import('./fhirClient');
  const isValidDisposition = await isCodingInValueSet(
    dispositionCoding,
    'http://fhir.ph/ValueSet/discharge-disposition'
  );

  if (isValidDisposition) {
    return dispositionCoding.display || dispositionCoding.code || "other";
  }

  return "unknown";
}

/**
 * Calculates all dashboard metrics using PH Road Safety IG ValueSets
 */
export async function calculateMetrics(
  encounters: any[],
  conditions: any[],
  patients: Map<string, any>
): Promise<DashboardMetrics> {
  // Filter for traffic-related encounters and conditions using async function
  const trafficEncounters = [];

  for (const enc of encounters) {
    const patientId = enc.subject?.reference?.replace("Patient/", "");
    const patientConditions = conditions.filter(cond =>
      cond.subject?.reference?.replace("Patient/", "") === patientId
    );

    for (const condition of patientConditions) {
      if (await isTrafficRelatedCondition(condition)) {
        trafficEncounters.push(enc);
        break; // Found a traffic-related condition for this encounter, no need to check others
      }
    }
  }

  const trafficConditions = [];
  for (const condition of conditions) {
    if (await isTrafficRelatedCondition(condition)) {
      trafficConditions.push(condition);
    }
  }

  // A. Mortality Rate due to Traffic Accident
  const trafficExpiredPromises = trafficEncounters.map(enc => isExpired(enc));
  const trafficExpiredResults = await Promise.all(trafficExpiredPromises);
  const trafficDeaths = trafficExpiredResults.filter(Boolean).length;
  const mortalityRate = (trafficDeaths / POPULATION_AT_RISK) * 100000;

  // B. Deaths per 10,000 Motor Vehicles
  const deathsPer10kVehicles = (trafficDeaths / MOTOR_VEHICLES_COUNT) * 10000;

  // C. Injury Rate by Traffic Accident
  // Calculate which patients had expired encounters to identify non-fatal injuries
  let nonFatalInjuries = 0;
  for (const cond of trafficConditions) {
    const patientId = cond.subject?.reference?.replace("Patient/", "");
    const patientEncounters = trafficEncounters.filter(enc =>
      enc.subject?.reference?.replace("Patient/", "") === patientId
    );

    // Check if any of the patient's encounters resulted in death
    const expiredResults = await Promise.all(patientEncounters.map(enc => isExpired(enc)));
    if (!expiredResults.some(Boolean)) { // If none of the encounters were expired, it's a non-fatal injury
      nonFatalInjuries++;
    }
  }
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
    totalEncounters: encounters.length,
    totalTrafficAccidents: totalAccidents,
    totalFatalities: trafficDeaths,
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
 * Gets age group from age using PH Road Safety IG categories
 */
export function getAgeGroup(age: number): string {
  // Using more specific age groups as per PH Road Safety IG
  if (age < 5) return "0-4";
  if (age < 15) return "5-14";
  if (age < 25) return "15-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  if (age < 75) return "65-74";
  return "75+";
}

/**
 * Groups patients by age group
 */
export function groupByAgeGroup(patients: Map<string, any>): Record<string, number> {
  const groups: Record<string, number> = {
    "0-4": 0,
    "5-14": 0,
    "15-24": 0,
    "25-34": 0,
    "35-44": 0,
    "45-54": 0,
    "55-64": 0,
    "65-74": 0,
    "75+": 0,
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
 * Groups patients by sex using PH Road Safety IG categories
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
