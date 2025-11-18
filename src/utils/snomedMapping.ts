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
 * Checks if a coding is related to traffic/transport accidents by looking for keywords in display text
 */
export function isTrafficAccident(coding?: any): boolean {
  if (!coding) return false;

  // Check if the code or display text contains traffic/transport related keywords
  const code = coding.code?.toLowerCase() || '';
  const display = coding.display?.toLowerCase() || '';
  const textToCheck = `${code} ${display}`;

  // Look for traffic/transport related keywords
  const trafficKeywords = [
    'traffic', 'transport', 'accident', 'road', 'vehicle', 'collision', 'crash',
    'motor', 'car', 'truck', 'bus', 'bike', 'pedestrian', 'cyclist', 'driver',
    'passenger', 'highway', 'street', 'automobile', 'high-vehicle', 'mva', 'rt'
  ];

  return trafficKeywords.some(keyword => textToCheck.includes(keyword));
}

/**
 * Checks if a condition is traffic-related using known SNOMED CT codes
 */
export function isTrafficRelatedCondition(condition: any): boolean {
  if (!condition.code?.coding) return false;

  for (const coding of condition.code.coding) {
    if (isTrafficAccident(coding)) {
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
 * Groups conditions by injury classification based on their actual occurrence in the data
 */
export function groupByInjuryType(conditions: any[]): Record<string, number> {
  const groups: Record<string, number> = {};

  for (const condition of conditions) {
    // Extract display text from the condition code
    let category = "Other condition";

    if (condition.code?.coding) {
      for (const coding of condition.code.coding) {
        if (coding.display) {
          category = coding.display;
          break; // Use the first available display
        } else if (coding.code) {
          category = `Code: ${coding.code}`;
          break;
        }
      }
    }

    // Increment the count for this category
    if (groups[category]) {
      groups[category]++;
    } else {
      groups[category] = 1;
    }
  }

  return groups;
}

/**
 * Ranks condition types by frequency from the available Condition resources
 */
export function rankConditionTypes(conditions: any[]): Array<{ name: string; count: number; percentage: number }> {
  const conditionCounts: Record<string, number> = {};
  const totalConditions = conditions.length;

  for (const condition of conditions) {
    let conditionName = "Unknown condition";

    // Try to get a meaningful name from the condition
    if (condition.code?.coding) {
      // Look for the most descriptive coding
      for (const coding of condition.code.coding) {
        if (coding.display) {
          conditionName = coding.display;
          break;
        } else if (coding.code) {
          conditionName = `Code: ${coding.code}`;
        }
      }
    } else if (condition.code?.text) {
      conditionName = condition.code.text;
    }

    // Increment the count for this condition
    if (conditionCounts[conditionName]) {
      conditionCounts[conditionName]++;
    } else {
      conditionCounts[conditionName] = 1;
    }
  }

  // Convert to array and sort by count (descending)
  const rankedConditions = Object.entries(conditionCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalConditions > 0 ? (count / totalConditions) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count);

  return rankedConditions;
}
