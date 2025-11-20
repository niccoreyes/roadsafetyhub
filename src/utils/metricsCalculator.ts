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
 * @param encounters - Array of FHIR encounter resources
 * @param conditions - Array of FHIR condition resources
 * @param patients - Map of patient resources indexed by ID
 * @param populationAtRisk - Population at risk for calculating rates (default: 1,000,000)
 * @param motorVehiclesCount - Number of motor vehicles for accident per vehicle calculation (default: 50,000)
 * @param dateRange - Optional date range to validate metrics are calculated with filtered data
 */
export async function calculateMetrics(
  encounters: any[],
  conditions: any[],
  patients: Map<string, any>,
  populationAtRisk: number = 1000000, // Should be fetched from population registry API (currently a default for backward compatibility)
  motorVehiclesCount: number = 50000, // Should be fetched from vehicle registry API (currently a default for backward compatibility)
  dateRange?: { from: Date; to: Date }
): Promise<DashboardMetrics> {
  // Add console logging to confirm metrics are calculated with date-filtered data
  if (dateRange) {
    console.log(`Calculating metrics for date range: ${dateRange.from.toISOString()} to ${dateRange.to.toISOString()}`);
    console.log(`Total encounters in range: ${encounters.length}, Total conditions in range: ${conditions.length}`);
  } else {
    console.log("Calculating metrics without date range filter - using all available data");
  }

  // Filter for traffic-related encounters and conditions using specific SNOMED CT codes
  const trafficEncounters = [];
  const trafficPatients = new Set<string>(); // Track patients with traffic-related conditions

  for (const enc of encounters) {
    const patientId = enc.subject?.reference?.replace("Patient/", "");
    const patientConditions = conditions.filter(cond =>
      cond.subject?.reference?.replace("Patient/", "") === patientId
    );

    for (const condition of patientConditions) {
      if (isTrafficRelatedCondition(condition)) {
        trafficEncounters.push(enc);
        trafficPatients.add(patientId); // Add patient to track unique patients
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

  // A. Mortality Rate due to Traffic Accident - now calculated per unique patient
  // First, we identify all patients who had traffic-related encounters that resulted in death
  const patientDeathStatus = new Map<string, boolean>(); // Tracks if a patient died from a traffic accident

  for (const patientId of trafficPatients) {
    const patientEncounters = trafficEncounters.filter(enc =>
      enc.subject?.reference?.replace("Patient/", "") === patientId
    );

    // Check if any of the patient's traffic-related encounters resulted in death
    const expiredPromises = patientEncounters.map(enc => isExpired(enc));
    const expiredResults = await Promise.all(expiredPromises);
    const diedFromTrafficAccident = expiredResults.some(Boolean);

    // Record the death status for this patient
    patientDeathStatus.set(patientId, diedFromTrafficAccident);
  }

  // Count how many unique patients died from traffic accidents
  let trafficDeaths = 0;
  for (const died of patientDeathStatus.values()) {
    if (died) {
      trafficDeaths++;
    }
  }

  const baseMortalityRate = (trafficDeaths / populationAtRisk) * 100000; // Base rate per 100k

  // Console logging for key metric calculations to show date range context
  if (dateRange) {
    console.log(`Traffic deaths in range: ${trafficDeaths}`);
  }


  // C. Injury Rate by Traffic Accident
  // Calculate which patients had traffic-related encounters that did NOT result in death
  // This requires checking if each condition belongs to a patient that survived
  let nonFatalInjuries = 0;
  for (const cond of trafficConditions) {
    const patientId = cond.subject?.reference?.replace("Patient/", "");
    const patientDied = patientDeathStatus.get(patientId) || false;

    if (!patientDied) { // Count as non-fatal injury if the patient didn't die from the traffic accident
      nonFatalInjuries++;
    }
  }

  const baseInjuryRate = (nonFatalInjuries / populationAtRisk) * 100000; // Base rate per 100k

  // Console logging for injury metric to show date range context
  if (dateRange) {
    console.log(`Non-fatal injuries in range: ${nonFatalInjuries}`);
  }

  // D. Case Fatality Rate (deaths per traffic accident encounters)
  const totalAccidents = trafficEncounters.length || 1; // Prevent division by zero
  const caseFatalityRate = (trafficDeaths / totalAccidents) * 100;

  // Console logging for case fatality rate to show date range context
  if (dateRange) {
    console.log(`Total accidents in range: ${totalAccidents}`);
  }

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
 * Counts observations that match the PH Road Safety IG SNOMED CT codes for Transport accident
 * Includes both codes: 274215009 (Transport accident) and 127348004 (Motor vehicle accident victim)
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
        (coding?.code === "274215009" || coding?.code === "127348004")
      );
    } catch (error) {
      console.warn("Error while filtering observation", error);
      return false;
    }
  }).length;
}

/**
 * Checks if a condition matches the PH Road Safety IG SNOMED CT codes for Transport accident
 * Includes both codes: 274215009 (Transport accident) and 127348004 (Motor vehicle accident victim)
 */
export function isTransportAccidentCondition(condition: { code?: { coding?: Array<{ system?: string; code?: string }> } }): boolean {
  if (!condition?.code?.coding) {
    return false;
  }

  return condition.code.coding.some((coding) =>
    (coding?.system === "http://snomed.info/sct" ||
     coding?.system === "http://snomed.info/sct/900000000000207008/version/20241001") &&
    (coding?.code === "274215009" || coding?.code === "127348004")
  );
}

/**
 * Counts conditions that match the PH Road Safety IG SNOMED CT codes for Transport accident
 * Includes both codes: 274215009 (Transport accident) and 127348004 (Motor vehicle accident victim)
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

/**
 * Extracts unique patient IDs from conditions that have the specified SNOMED CT codes
 * Used to ensure patient deduplication when calculating mortality rates
 */
export function getUniquePatientsWithSnomedCodes(conditions: any[]): Set<string> {
  const patientIds = new Set<string>();

  for (const condition of conditions) {
    if (condition.subject?.reference && isTrafficRelatedCondition(condition)) {
      const patientId = condition.subject.reference.replace("Patient/", "");
      patientIds.add(patientId);
    }
  }

  return patientIds;
}
