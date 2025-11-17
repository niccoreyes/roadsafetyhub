// FHIR Client Utilities for fetching and processing FHIR resources

const FHIR_BASE_URL = "https://cdr.fhirlab.net/fhir";

export interface FHIRBundle {
  resourceType: "Bundle";
  type: string;
  total?: number;
  entry?: Array<{
    resource: any;
    fullUrl?: string;
  }>;
  link?: Array<{
    relation: string;
    url: string;
  }>;
}

/**
 * Fetches all pages of a FHIR Bundle by following pagination links
 */
export async function fhirFetchAll(url: string): Promise<any[]> {
  const allResources: any[] = [];
  let nextUrl: string | null = url;

  while (nextUrl) {
    try {
      const response = await fetch(nextUrl);
      
      if (!response.ok) {
        console.error(`FHIR fetch error: ${response.status} ${response.statusText}`);
        
        // If 400, might be unsupported search param - try without specific params
        if (response.status === 400) {
          console.warn("Received 400, might be unsupported search parameter");
        }
        
        break;
      }

      const bundle: FHIRBundle = await response.json();

      // Extract resources from this page
      if (bundle.entry) {
        const resources = bundle.entry
          .filter(entry => entry.resource)
          .map(entry => entry.resource);
        allResources.push(...resources);
      }

      // Find next page link
      const nextLink = bundle.link?.find(link => link.relation === "next");
      nextUrl = nextLink?.url || null;

      // Prevent infinite loops
      if (allResources.length > 100000) {
        console.warn("Fetched over 100k resources, stopping pagination");
        break;
      }
    } catch (error) {
      console.error("Error fetching FHIR data:", error);
      break;
    }
  }

  return allResources;
}

/**
 * Fetches encounters within a date range
 */
export async function fetchEncounters(startDate: string, endDate: string): Promise<any[]> {
  const url = `${FHIR_BASE_URL}/Encounter?date=ge${startDate}&date=le${endDate}&_count=200`;
  return fhirFetchAll(url);
}

/**
 * Fetches conditions within a date range (using recorded-date)
 */
export async function fetchConditions(startDate: string, endDate: string): Promise<any[]> {
  const url = `${FHIR_BASE_URL}/Condition?recorded-date=ge${startDate}&recorded-date=le${endDate}&_count=200`;
  return fhirFetchAll(url);
}

/**
 * Fetches observations within a date range
 */
export async function fetchObservations(startDate: string, endDate: string): Promise<any[]> {
  const url = `${FHIR_BASE_URL}/Observation?date=ge${startDate}&date=le${endDate}&_count=200`;
  return fhirFetchAll(url);
}

/**
 * Fetches a single patient by ID
 */
export async function fetchPatient(patientId: string): Promise<any> {
  try {
    const response = await fetch(`${FHIR_BASE_URL}/Patient/${patientId}`);
    if (!response.ok) {
      console.error(`Failed to fetch patient ${patientId}`);
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching patient ${patientId}:`, error);
    return null;
  }
}

/**
 * Cache for resolved patients
 */
const patientCache = new Map<string, any>();

/**
 * Resolves patient references with caching
 */
export async function resolvePatients(resources: any[]): Promise<Map<string, any>> {
  const patientIds = new Set<string>();
  
  // Extract all patient references
  resources.forEach(resource => {
    if (resource.subject?.reference) {
      const match = resource.subject.reference.match(/Patient\/(.+)/);
      if (match) {
        patientIds.add(match[1]);
      }
    }
  });

  // Fetch patients not in cache
  const fetchPromises: Promise<void>[] = [];
  
  patientIds.forEach(patientId => {
    if (!patientCache.has(patientId)) {
      fetchPromises.push(
        fetchPatient(patientId).then(patient => {
          if (patient) {
            patientCache.set(patientId, patient);
          }
        })
      );
    }
  });

  await Promise.all(fetchPromises);
  
  return new Map(patientCache);
}

/**
 * Clears the patient cache
 */
export function clearPatientCache(): void {
  patientCache.clear();
}
