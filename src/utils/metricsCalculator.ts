// Metrics Calculation Utilities

import { isTrafficRelatedCondition } from "./snomedMapping";

export interface DashboardMetrics {
  mortalityRate: number;
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
// const MOTOR_VEHICLES_COUNT = 50000; // Removed - now passed as parameter

/**
 * Checks if an encounter resulted in death using PH Road Safety IG ValueSet
 * Falls back to known death codes if ValueSet expansion fails
 */
export async function isExpired(encounter: any): Promise<boolean> {
  const dispositionCoding = encounter.hospitalization?.dischargeDisposition?.coding?.[0];
  if (!dispositionCoding) return false;

  try {
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
  } catch (error) {
    console.warn('ValueSet expansion failed for discharge disposition, using fallback logic:', error);

    // Fallback: just check for known death codes
    const dispositionCode = dispositionCoding.code;
    const deathCodes = ['exp', 'expired', 'dead', 'death'];

    return deathCodes.includes(dispositionCode?.toLowerCase());
  }
}

/**
 * Gets the discharge disposition category using PH Road Safety IG ValueSet
 * Falls back to known values if ValueSet expansion fails
 */
export async function getDispositionCategory(encounter: any): Promise<string> {
  const dispositionCoding = encounter.hospitalization?.dischargeDisposition?.coding?.[0];
  if (!dispositionCoding) return "unknown";

  try {
    // Check if the disposition code is in the discharge disposition ValueSet
    const { isCodingInValueSet } = await import('./fhirClient');
    const isValidDisposition = await isCodingInValueSet(
      dispositionCoding,
      'http://fhir.ph/ValueSet/discharge-disposition'
    );

    if (isValidDisposition) {
      return dispositionCoding.display || dispositionCoding.code || "other";
    }
  } catch (error) {
    console.warn('ValueSet expansion failed for discharge disposition, using fallback logic:', error);

    // Common FHIR discharge disposition codes
    const deathCodes = ['exp', 'expired', 'dead', 'death', 'home', 'oth', 'ama', 'tra'];
    if (deathCodes.includes(dispositionCoding.code?.toLowerCase())) {
      return dispositionCoding.display || dispositionCoding.code || "other";
    }
  }

  return "unknown";
}

/**
 * Calculates all dashboard metrics using known SNOMED CT codes for traffic accidents
 */
export async function calculateMetrics(
  encounters: any[],
  conditions: any[],
  patients: Map<string, any>,
  populationAtRisk: number = 1000000, // Should be fetched from population registry API (currently a default for backward compatibility)
  motorVehiclesCount: number = 50000 // Should be fetched from vehicle registry API (currently a default for backward compatibility)
): Promise<DashboardMetrics> {
  // Filter for traffic-related encounters and conditions
  const trafficEncounters = [];

  for (const enc of encounters) {
    const patientId = enc.subject?.reference?.replace("Patient/", "");
    const patientConditions = conditions.filter(cond =>
      cond.subject?.reference?.replace("Patient/", "") === patientId
    );

    for (const condition of patientConditions) {
      if (isTrafficRelatedCondition(condition)) {
        trafficEncounters.push(enc);
        break; // Found a traffic-related condition for this encounter, no need to check others
      }
    }
  }

  const trafficConditions = [];
  for (const condition of conditions) {
    if (isTrafficRelatedCondition(condition)) {
      trafficConditions.push(condition);
    }
  }

  // A. Mortality Rate due to Traffic Accident
  const trafficExpiredPromises = trafficEncounters.map(enc => isExpired(enc));
  const trafficExpiredResults = await Promise.all(trafficExpiredPromises);
  const trafficDeaths = trafficExpiredResults.filter(Boolean).length;
  const baseMortalityRate = (trafficDeaths / populationAtRisk) * 100000; // Base rate per 100k


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
  const baseInjuryRate = (nonFatalInjuries / populationAtRisk) * 100000; // Base rate per 100k

  // D. Case Fatality Rate
  const totalAccidents = trafficEncounters.length || 1; // Prevent division by zero
  const caseFatalityRate = (trafficDeaths / totalAccidents) * 100;

  // E. Accident per Vehicle
  const accidentPerVehicle = (totalAccidents / motorVehiclesCount) * 10000;

  // Count specific transport accident observations and conditions
  const totalTrafficAccidents = trafficEncounters.length;

  return {
    mortalityRate: baseMortalityRate, // This will be adjusted in the UI based on multiplier
    injuryRate: baseInjuryRate,       // This will be adjusted in the UI based on multiplier
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
export function groupByAgeGroup(
  patients: Map<string, any>,
  encounters: any[] = [],
  dateRange?: { from: Date; to: Date }
): Record<string, number> {
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

  // If date range is provided, only count patients associated with encounters in that range
  if (dateRange && encounters.length > 0) {
    // Filter encounters by date range using _lastUpdated field
    const filteredEncounterIds = encounters.filter(enc => {
      const encounterDate = new Date(enc._lastUpdated || enc.period?.start || enc.period?.end || enc.meta?.lastUpdated);
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      return encounterDate >= from && encounterDate <= to;
    }).map(enc => enc.id);

    // Only count patients who have encounters within the date range
    patients.forEach(patient => {
      const patientId = patient.id;
      const patientEncounters = encounters.filter(enc =>
        enc.subject?.reference?.replace("Patient/", "") === patientId
      );

      // If any encounter for this patient is within the date range, include the patient
      const hasEncounterInRange = patientEncounters.some(enc =>
        filteredEncounterIds.includes(enc.id)
      );

      if (hasEncounterInRange && patient.birthDate) {
        const age = calculateAge(patient.birthDate);
        const group = getAgeGroup(age);
        groups[group]++;
      }
    });
  } else {
    // If no date range, use all patients as before
    patients.forEach(patient => {
      if (patient.birthDate) {
        const age = calculateAge(patient.birthDate);
        const group = getAgeGroup(age);
        groups[group]++;
      }
    });
  }

  return groups;
}

/**
 * Groups patients by sex using PH Road Safety IG categories
 */
export function groupBySex(
  patients: Map<string, any>,
  encounters: any[] = [],
  dateRange?: { from: Date; to: Date }
): Record<string, number> {
  const groups: Record<string, number> = {
    male: 0,
    female: 0,
    other: 0,
    unknown: 0,
  };

  // If date range is provided, only count patients associated with encounters in that range
  if (dateRange && encounters.length > 0) {
    // Filter encounters by date range using _lastUpdated field
    const filteredEncounterIds = encounters.filter(enc => {
      const encounterDate = new Date(enc._lastUpdated || enc.period?.start || enc.period?.end || enc.meta?.lastUpdated);
      const from = new Date(dateRange.from);
      const to = new Date(dateRange.to);
      return encounterDate >= from && encounterDate <= to;
    }).map(enc => enc.id);

    // Only count patients who have encounters within the date range
    patients.forEach(patient => {
      const patientId = patient.id;
      const patientEncounters = encounters.filter(enc =>
        enc.subject?.reference?.replace("Patient/", "") === patientId
      );

      // If any encounter for this patient is within the date range, include the patient
      const hasEncounterInRange = patientEncounters.some(enc =>
        filteredEncounterIds.includes(enc.id)
      );

      if (hasEncounterInRange) {
        const gender = patient.gender?.toLowerCase() || "unknown";
        if (groups[gender] !== undefined) {
          groups[gender]++;
        } else {
          groups.unknown++;
        }
      }
    });
  } else {
    // If no date range, use all patients as before
    patients.forEach(patient => {
      const gender = patient.gender?.toLowerCase() || "unknown";
      if (groups[gender] !== undefined) {
        groups[gender]++;
      } else {
        groups.unknown++;
      }
    });
  }

  return groups;
}

/**
 * Counts observations that match the PH Road Safety IG SNOMED CT code 274215009 for Transport accident
 */
export function countTransportAccidents(observations: any[]): number {
  if (!Array.isArray(observations)) {
    console.warn("observations is not an array, returning 0");
    return 0;
  }

  return observations.filter(obs => {
    try {
      return obs?.code?.coding?.some((coding: any) =>
        (coding?.system === "http://snomed.info/sct" ||
         coding?.system === "http://snomed.info/sct/900000000000207008/version/20241001") &&
        coding?.code === "274215009"
      );
    } catch (error) {
      console.warn("Error while filtering observation", error);
      return false;
    }
  }).length;
}

/**
 * Checks if a condition matches the PH Road Safety IG SNOMED CT code 274215009 for Transport accident
 */
export function isTransportAccidentCondition(condition: { code?: { coding?: Array<{ system?: string; code?: string }> } }): boolean {
  if (!condition?.code?.coding) {
    return false;
  }

  return condition.code.coding.some((coding) =>
    (coding?.system === "http://snomed.info/sct" ||
     coding?.system === "http://snomed.info/sct/900000000000207008/version/20241001") &&
    coding?.code === "274215009"
  );
}

/**
 * Counts conditions that match the PH Road Safety IG SNOMED CT code 274215009 for Transport accident
 */
export function countTransportAccidentConditions(conditions: Array<{ code?: { coding?: Array<{ system?: string; code?: string }> } }>): number {
  if (!Array.isArray(conditions)) {
    console.warn("conditions is not an array, returning 0");
    return 0;
  }

  return conditions.filter(condition => {
    try {
      return isTransportAccidentCondition(condition);
    } catch (error) {
      console.warn("Error while filtering condition", error);
      return false;
    }
  }).length;
}

/**
 * Extracts SNOMED codes from Observation.code.coding array
 */
export function extractSnomedCodes(observation: any): Array<{ system: string; code: string; display?: string }> {
  if (!observation.code?.coding) {
    return [];
  }

  return observation.code.coding
    .filter((coding: any) => coding.system && coding.code)
    .map((coding: any) => ({
      system: coding.system,
      code: coding.code,
      display: coding.display
    }));
}
