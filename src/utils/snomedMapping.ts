// SNOMED-CT Code Mapping for Road Safety Analytics

/**
 * Known SNOMED CT codes for road traffic accidents and injuries
 */
export const TRAFFIC_ACCIDENT_CODES = [
  "116808009", // Motor vehicle accident
  "281647001", // Road traffic accident
  "422791008", // Multiple injuries due to trauma
  "26292008",  // Pedestrian injured
  "212438000", // Transport accident
  "242328002", // Collision involving motor vehicle
  "217043006", // Motor vehicle traffic accident
];

/**
 * Keywords to identify traffic/transport accidents
 */
export const TRAFFIC_KEYWORDS = [
  "traffic",
  "transport",
  "vehic",
  "collision",
  "mva",
  "road",
  "pedestrian",
  "crash",
  "motor vehicle",
];

/**
 * Checks if a SNOMED code or display text indicates a traffic accident
 */
export function isTrafficAccident(code?: string, display?: string): boolean {
  if (!code && !display) return false;

  const searchText = `${code || ""} ${display || ""}`.toLowerCase();
  
  // Check exact code matches
  if (code && TRAFFIC_ACCIDENT_CODES.includes(code)) {
    return true;
  }

  // Check keyword matches
  return TRAFFIC_KEYWORDS.some(keyword => searchText.includes(keyword));
}

/**
 * Classifies a condition based on SNOMED codes
 */
export function classifyCondition(condition: any): string {
  if (!condition.code?.coding) return "Unknown";

  for (const coding of condition.code.coding) {
    const codeStr = coding.code?.toLowerCase() || "";
    const display = coding.display?.toLowerCase() || "";

    if (isTrafficAccident(coding.code, coding.display)) {
      // Further classify by type
      if (display.includes("pedestrian") || codeStr.includes("26292008")) {
        return "Pedestrian injured";
      }
      if (display.includes("collision") || display.includes("crash")) {
        return "Vehicle collision";
      }
      if (display.includes("fall")) {
        return "Fall from vehicle";
      }
      if (display.includes("motor vehicle") || codeStr.includes("116808009")) {
        return "Motor vehicle accident";
      }
      return "Traffic accident";
    }
  }

  return "Transport accident unspecified";
}

/**
 * Injury classification categories
 */
export const INJURY_CATEGORIES = [
  "Traffic accident",
  "Transport accident unspecified",
  "Vehicle collision",
  "Pedestrian injured",
  "Fall from vehicle",
  "Motor vehicle accident",
];

/**
 * Groups conditions by injury classification
 */
export function groupByInjuryType(conditions: any[]): Record<string, number> {
  const groups: Record<string, number> = {};
  
  INJURY_CATEGORIES.forEach(category => {
    groups[category] = 0;
  });

  conditions.forEach(condition => {
    const category = classifyCondition(condition);
    if (groups[category] !== undefined) {
      groups[category]++;
    } else {
      groups["Transport accident unspecified"]++;
    }
  });

  return groups;
}
