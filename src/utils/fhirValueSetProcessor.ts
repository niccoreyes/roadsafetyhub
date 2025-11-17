// FHIR ValueSet Processing Utilities for PH Road Safety IG
import { logger } from './logger';

export interface Coding {
  system?: string;
  code?: string;
  display?: string;
}

export interface ValueSetExpansion {
  resourceType: 'ValueSet';
  expansion: {
    timestamp: string;
    contains: Coding[];
  };
}

/**
 * Process a ValueSet expansion to extract codes
 */
export function processValueSetExpansion(expansion: any): Coding[] {
  if (!expansion?.expansion?.contains) {
    logger.warn('ValueSet expansion does not contain expected structure', expansion);
    return [];
  }
  
  return expansion.expansion.contains as Coding[];
}

/**
 * Check if a coding matches any coding in a ValueSet
 */
export function codingInValueSet(coding: Coding, valueSetCodes: Coding[]): boolean {
  if (!coding?.code) return false;
  
  return valueSetCodes.some(vc => 
    vc.code === coding.code && 
    (!vc.system || !coding.system || vc.system === coding.system)
  );
}

/**
 * Filter resources based on ValueSet membership
 */
export function filterResourcesByValueSet(
  resources: any[], 
  valueSetCodes: Coding[],
  codingPath: string
): any[] {
  return resources.filter(resource => {
    // Navigate to the coding field using the path
    const codings = get(resource, codingPath);
    
    if (!codings || !Array.isArray(codings)) return false;
    
    // Check if any of the codings match the ValueSet
    return codings.some((resourceCoding: any) => 
      codingInValueSet(resourceCoding, valueSetCodes)
    );
  });
}

/**
 * Helper function to get nested property by path (e.g., 'code.coding')
 */
function get(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}