// PH Road Safety IG ValueSet-based Code Mapping for Road Safety Analytics
import { fetchValueSetExpansion, isCodingInValueSet } from './fhirClient';

/**
 * URLs for PH Road Safety IG ValueSets
 */
export const VALUE_SET_URLS = {
  TRAFFIC_ENCOUNTER: 'http://fhir.ph/ValueSet/road-traffic-encounters',
  INJURY_MOI: 'http://fhir.ph/ValueSet/injury-mechanism-of-injury',
  OBSERVATION_CATEGORY: 'http://fhir.ph/ValueSet/observation-category',
  DISCHARGE_DISPOSITION: 'http://fhir.ph/ValueSet/discharge-disposition',
};

/**
 * Checks if a coding indicates a traffic accident using PH Road Safety IG ValueSet
 */
export async function isTrafficAccident(coding?: any): Promise<boolean> {
  if (!coding) return false;

  return await isCodingInValueSet(coding, VALUE_SET_URLS.TRAFFIC_ENCOUNTER);
}

/**
 * Checks if a condition is traffic-related using PH Road Safety IG ValueSets
 */
export async function isTrafficRelatedCondition(condition: any): Promise<boolean> {
  if (!condition.code?.coding) return false;

  for (const coding of condition.code.coding) {
    if (await isTrafficAccident(coding)) {
      return true;
    }
  }

  return false;
}

/**
 * Classify an injury based on PH Road Safety IG ValueSets
 */
export async function classifyInjuryMoi(condition: any): Promise<string> {
  if (!condition.code?.coding) return "Unknown";

  for (const coding of condition.code.coding) {
    if (await isCodingInValueSet(coding, VALUE_SET_URLS.INJURY_MOI)) {
      return coding.display || coding.code || "Injury";
    }
  }

  return "Other";
}

/**
 * Classifies a condition based on PH Road Safety IG ValueSets
 */
export async function classifyCondition(condition: any): Promise<string> {
  if (!condition.code?.coding) return "Unknown";

  for (const coding of condition.code.coding) {
    if (await isTrafficAccident(coding)) {
      // Further classify by injury mechanism of injury
      const moiClassification = await classifyInjuryMoi(condition);
      return moiClassification;
    }
  }

  return "Other condition";
}

/**
 * Injury classification categories based on PH Road Safety IG ValueSets
 */
export const INJURY_CATEGORIES = [
  "Motor vehicle accident",
  "Pedestrian accident",
  "Cyclist accident",
  "Road traffic accident",
  "Other transport accident",
  "Other condition",
];

/**
 * Groups conditions by injury classification using PH Road Safety IG ValueSets
 */
export async function groupByInjuryType(conditions: any[]): Promise<Record<string, number>> {
  const groups: Record<string, number> = {};

  INJURY_CATEGORIES.forEach(category => {
    groups[category] = 0;
  });

  for (const condition of conditions) {
    const category = await classifyCondition(condition);
    if (groups[category] !== undefined) {
      groups[category]++;
    } else {
      groups["Other condition"]++;
    }
  }

  return groups;
}
