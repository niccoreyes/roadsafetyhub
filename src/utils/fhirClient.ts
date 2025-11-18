// FHIR Client Utilities for fetching and processing FHIR resources
import { logger } from './logger';
import { getAuthHeaders } from './fhirAuth';
import { valueSetCache } from '../cache/valueSetCache';

// Import config values (will be replaced with context later)
const FHIR_BASE_URL = import.meta.env.VITE_FHIR_BASE_URL || "https://cdr.fhirlab.net/fhir";
const FHIR_TIMEOUT = parseInt(import.meta.env.VITE_FHIR_TIMEOUT || '30000', 10) || 30000;
const FHIR_RETRY_ATTEMPTS = parseInt(import.meta.env.VITE_FHIR_RETRY_ATTEMPTS || '3', 10) || 3;

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
 * Fetches all pages of a FHIR Bundle by following pagination links with retry logic
 */
export async function fhirFetchAll(url: string): Promise<any[]> {
  const allResources: any[] = [];
  let nextUrl: string | null = url;
  let attempts = 0;

  while (nextUrl && attempts < FHIR_RETRY_ATTEMPTS) {
    try {
      // Get authentication headers
      const headers = getAuthHeaders({
        authType: (import.meta.env.VITE_FHIR_AUTH_TYPE as 'none' | 'bearer' | 'oauth') || 'none',
        authToken: import.meta.env.VITE_FHIR_AUTH_TOKEN
      });

      // Create a request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FHIR_TIMEOUT);

      const response = await fetch(nextUrl, {
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error(`FHIR fetch error: ${response.status} ${response.statusText} for URL: ${nextUrl}`);

        // Distinguish between client errors (4xx) and server errors (5xx)
        if (response.status >= 400 && response.status < 500) {
          // Client error - don't retry
          logger.warn(`Client error ${response.status}, not retrying: ${nextUrl}`);
          break;
        } else if (response.status >= 500) {
          // Server error - retry with exponential backoff
          attempts++;
          if (attempts >= FHIR_RETRY_ATTEMPTS) {
            logger.error(`Max retry attempts reached for: ${nextUrl}`);
            break;
          }

          // Exponential backoff: wait 1s, 2s, 4s, etc.
          const delay = Math.pow(2, attempts - 1) * 1000;
          logger.info(`Retrying after ${delay}ms (attempt ${attempts}/${FHIR_RETRY_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
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
        logger.warn("Fetched over 100k resources, stopping pagination");
        break;
      }

      // Reset attempts after successful fetch
      attempts = 0;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        logger.error(`Request timeout for: ${nextUrl}`);
        // For timeout, we might want to retry
        attempts++;
        if (attempts < FHIR_RETRY_ATTEMPTS) {
          const delay = Math.pow(2, attempts - 1) * 1000;
          logger.info(`Retrying after timeout, delay ${delay}ms (attempt ${attempts}/${FHIR_RETRY_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          logger.error(`Max retry attempts reached after timeout for: ${nextUrl}`);
          break;
        }
      } else {
        logger.error(`Error fetching FHIR data from ${nextUrl}:`, error);
        attempts++;
        if (attempts < FHIR_RETRY_ATTEMPTS) {
          const delay = Math.pow(2, attempts - 1) * 1000;
          logger.info(`Retrying after error, delay ${delay}ms (attempt ${attempts}/${FHIR_RETRY_ATTEMPTS})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          logger.error(`Max retry attempts reached after error for: ${nextUrl}`);
          break;
        }
      }
    }
  }

  return allResources;
}

/**
 * Fetches ValueSet expansion from the terminology server
 */
export async function fetchValueSetExpansion(valueSetUrl: string): Promise<any[]> {
  // Check if we have this ValueSet in cache
  const cached = valueSetCache.get(valueSetUrl);
  if (cached) {
    logger.info(`ValueSet ${valueSetUrl} retrieved from cache`);
    return cached.expansion;
  }

  const txServerUrl = "https://tx.fhirlab.net/fhir";
  const url = `${txServerUrl}/ValueSet/$expand?url=${encodeURIComponent(valueSetUrl)}`;

  try {
    const headers = getAuthHeaders({
      authType: (import.meta.env.VITE_FHIR_AUTH_TYPE as 'none' | 'bearer' | 'oauth') || 'none',
      authToken: import.meta.env.VITE_FHIR_AUTH_TOKEN
    });

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch ValueSet: ${response.status} ${response.statusText}`);
    }

    const valueSetExpansion = await response.json();

    // Extract the codes from the expansion
    const codes = valueSetExpansion.expansion?.contains || [];

    // Cache the result (TTL: 5 minutes as per spec)
    valueSetCache.set(valueSetUrl, codes, 5 * 60 * 1000);

    logger.info(`ValueSet ${valueSetUrl} fetched and cached`);
    return codes;
  } catch (error) {
    logger.error(`Error fetching ValueSet ${valueSetUrl}:`, error);
    // Return empty array if we can't fetch the ValueSet
    return [];
  }
}

/**
 * Checks if a coding matches any code in a ValueSet
 */
export async function isCodingInValueSet(coding: any, valueSetUrl: string): Promise<boolean> {
  if (!coding?.code) return false;

  const codes = await fetchValueSetExpansion(valueSetUrl);

  return codes.some((code: any) =>
    code.code === coding.code
  );
}

/**
 * Fetches encounters within a date range using PH Road Safety IG ValueSets
 */
export async function fetchEncounters(startDate: string, endDate: string): Promise<any[]> {
  // Use meta.lastUpdated for consistent date filtering across resources
  const url = `${FHIR_BASE_URL}/Encounter?_lastUpdated=ge${startDate}&_lastUpdated=le${endDate}&_count=200`;

  return fhirFetchAll(url);
}

/**
 * Fetches conditions within a date range (using meta.lastUpdated for consistency)
 */
export async function fetchConditions(startDate: string, endDate: string): Promise<any[]> {
  const url = `${FHIR_BASE_URL}/Condition?_lastUpdated=ge${startDate}&_lastUpdated=le${endDate}&_count=200`;
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

import { patientCache } from '../cache/patientCache';

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
    const cachedPatient = patientCache.get(patientId);
    if (!cachedPatient) {
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

  // Create a map with all the requested patients from cache
  const result = new Map<string, any>();
  patientIds.forEach(patientId => {
    const cachedPatient = patientCache.get(patientId);
    if (cachedPatient) {
      result.set(patientId, cachedPatient);
    }
  });

  return result;
}

/**
 * Clears the patient cache
 */
export function clearPatientCache(): void {
  patientCache.clear();
}
