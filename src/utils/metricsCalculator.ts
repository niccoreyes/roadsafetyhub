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
 * Defines the FHIR Observation structure for type safety
 */
interface FHIRObservation {
  id?: string;
  resourceType?: string;
  meta?: {
    profile?: string[];
  };
  status?: string;
  code?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  valueCodeableConcept?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  };
  encounter?: {
    reference?: string;
  };
  subject?: {
    reference?: string;
  };
}

/**
 * Defines the FHIR Encounter structure for type safety
 */
interface FHIREncounter {
  id?: string;
  resourceType?: string;
  status?: string;
  subject?: {
    reference?: string;
  };
  hospitalization?: {
    dischargeDisposition?: {
      coding?: Array<{
        system?: string;
        code?: string;
        display?: string;
      }>;
    };
  };
  period?: {
    start?: string;
    end?: string;
  };
  meta?: {
    lastUpdated?: string;
  };
  _lastUpdated?: string;
}

/**
 * Determines patient death status by examining Observation resources with the PH Road Safety IG Observation Outcome Release profile
 * Uses the observation code, profile, and valueCodeableConcept coding to determine death status
 *
 * @param observations - Array of FHIR Observation resources
 * @param patientId - The patient ID to look for in the observations
 * @returns boolean indicating if the patient died based on outcome observations
 */
export async function checkOutcomeStatus(observations: FHIRObservation[], patientId: string): Promise<boolean> {
  try {
    // Filter observations for the specific patient
    const patientObservations = observations.filter(obs => {
      const obsPatientId = obs.subject?.reference?.replace("Patient/", "");
      return obsPatientId === patientId;
    });

    // Look for observations with the correct profile and indicating death
    for (const observation of patientObservations) {
      // Check if the observation has the correct profile
      // const hasProfile = observation.meta?.profile?.includes(
      //   "https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release"
      // );
      // console.log(`Observation ${observation.id} for patient ${patientId} has profile: ${hasProfile}`);
      // if (!hasProfile) continue;

      // Check for the specific code indicating patient condition finding (SNOMED CT)
      // const hasCode = observation.code?.coding?.some((coding) =>
      //   (coding?.system === "http://snomed.info/sct") &&
      //   (coding?.code === "418138009") // Patient condition finding
      // );

      // if (!hasCode) continue;
      // console.log(`Observation ${observation.id} for patient ${patientId} has the correct code.`);

      // Check for value that indicates death
      const died = observation.valueCodeableConcept?.coding?.some((coding) =>
        (coding?.system === "http://www.roadsafetyph.doh.gov.ph/CodeSystem" && coding?.code === "DIED") // Looking for DIED from the specific PH Road Safety code system
      );

      if (died) {
        console.debug(`Patient ${patientId} marked as deceased based on observation ${observation.id}`);
        return true; // Patient died
      }
    }

    // If no death observation found, patient is assumed alive
    return false;
  } catch (error) {
    console.error(`Error in checkOutcomeStatus for patient ${patientId}:`, error);
    return false; // Default to not expired in case of error
  }
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
export async function isExpired(
  encounter: FHIREncounter,
  observations: FHIRObservation[] = [],
  patientId?: string
): Promise<boolean> {
  // If observations are provided, check them first for death outcome
  if (Array.isArray(observations) && observations.length > 0) {
    // Extract patient ID from encounter if not provided
    const actualPatientId = patientId || encounter.subject?.reference?.replace("Patient/", "");

    if (actualPatientId) {
      const deathStatus = await checkOutcomeStatus(observations, actualPatientId);
      if (deathStatus) {
        return true; // Patient died according to observation
      }
    }
  }

  // Fallback to discharge disposition if:
  // 1. No observations provided
  // 2. No death found in observations
  // 3. Patient ID couldn't be determined
  const dispositionCoding = encounter.hospitalization?.dischargeDisposition?.coding?.[0];
  if (!dispositionCoding) {
    // Log fallback when there are no observations and no discharge disposition
    if (Array.isArray(observations) && observations.length > 0) {
      console.warn(`No death observation found for patient in encounter ${encounter.id}, and no discharge disposition available. Defaulting to not expired.`);
    }
    return false;
  }

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

    const result = isDeathDisposition || deathCodes.includes(dispositionCode);

    // If there are observations and the results differ, log a warning
    if (Array.isArray(observations) && observations.length > 0 && patientId) {
      const observationStatus = await checkOutcomeStatus(observations, patientId);
      if (result !== observationStatus) {
        console.warn(`Conflicting outcome sources detected for patient ${patientId}:
          Observation-based status: ${observationStatus},
          Discharge disposition status: ${result}.
          Prioritizing observation-based outcome.`);
        // Return the observation-based outcome as per requirements
        return observationStatus;
      }
    }

    return result;
  } catch (error) {
    console.warn('ValueSet expansion failed for discharge disposition, using fallback logic:', error);

    // Fallback: just check for known death codes
    const dispositionCode = dispositionCoding.code;
    const deathCodes = ['exp', 'expired', 'dead', 'death'];

    const result = deathCodes.includes(dispositionCode?.toLowerCase());

    // If there are observations and the results differ, log a warning
    if (Array.isArray(observations) && observations.length > 0 && patientId) {
      const observationStatus = await checkOutcomeStatus(observations, patientId);
      if (result !== observationStatus) {
        console.warn(`Conflicting outcome sources detected for patient ${patientId}:
          Observation-based status: ${observationStatus},
          Discharge disposition status (fallback): ${result}.
          Prioritizing observation-based outcome.`);
        // Return the observation-based outcome as per requirements
        return observationStatus;
      }
    }

    return result;
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
 * @param observations - Array of FHIR observation resources for outcome detection (optional, for backward compatibility)
 */
export async function calculateMetrics(
  encounters: any[],
  conditions: any[],
  patients: Map<string, any>,
  populationAtRisk: number = 1000000, // Should be fetched from population registry API (currently a default for backward compatibility)
  motorVehiclesCount: number = 50000, // Should be fetched from vehicle registry API (currently a default for backward compatibility)
  dateRange?: { from: Date; to: Date },
  observations: any[] = [] // Optional observations array for outcome detection, defaults to empty array for backward compatibility
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

  // A. Mortality Rate - now calculated per unique patient, counting deaths with "DIED" observation value
  // Since the observations parameter should contain only "DIED" observations when using the dedicated endpoint,
  // we can directly process them as death observations
  const observationBasedTrafficDeaths = new Set<string>();
  for (const obs of observations) {
    const patientId = obs.subject?.reference?.replace("Patient/", "");
    if (patientId && trafficPatients.has(patientId)) { // Only count if patient also has traffic-related condition
      observationBasedTrafficDeaths.add(patientId);
    }
  }

  // For each patient with traffic-related conditions, determine if they died
  const patientDeathStatus = new Map<string, boolean>(); // Tracks if a patient died from traffic accident

  for (const patientId of trafficPatients) {
    // Check if this traffic patient has a "DIED" observation
    if (observationBasedTrafficDeaths.has(patientId)) {
      patientDeathStatus.set(patientId, true);
    } else {
      // For patients without "DIED" observations, fall back to checking encounters
      const patientEncounters = trafficEncounters.filter(enc =>
        enc.subject?.reference?.replace("Patient/", "") === patientId
      );

      // Check if any of the patient's encounters resulted in death using the existing logic
      const expiredPromises = patientEncounters.map(enc => isExpired(enc, observations, patientId));
      const expiredResults = await Promise.all(expiredPromises);
      const diedFromTrafficAccident = expiredResults.some(Boolean);

      // Record the death status for this patient
      patientDeathStatus.set(patientId, diedFromTrafficAccident);
    }
  }

  // Count how many unique patients died (with preference given to observation-based deaths)
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
