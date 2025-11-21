import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FhirConfig {
  baseUrl: string;
  authType: 'none' | 'bearer' | 'oauth';
  authToken?: string;
  timeout: number;
  retryAttempts: number;
  paginationLimit: number;
  // ValueSet URLs for PH Road Safety IG
  trafficEncounterValueSetUrl: string;
  injuryMoiValueSetUrl: string;
  observationCategoryValueSetUrl: string;
  dischargeDispositionValueSetUrl: string;
  observationOutcomeValueSetUrl: string;
}

const defaultConfig: FhirConfig = {
  baseUrl: import.meta.env.VITE_FHIR_BASE_URL || 'https://cdr.fhirlab.net/fhir',
  authType: (import.meta.env.VITE_FHIR_AUTH_TYPE as 'none' | 'bearer' | 'oauth') || 'none',
  authToken: import.meta.env.VITE_FHIR_AUTH_TOKEN,
  timeout: parseInt(import.meta.env.VITE_FHIR_TIMEOUT || '30000', 10) || 30000,
  retryAttempts: parseInt(import.meta.env.VITE_FHIR_RETRY_ATTEMPTS || '3', 10) || 3,
  paginationLimit: parseInt(import.meta.env.VITE_FHIR_PAGINATION_LIMIT || '1000', 10) || 1000,
  trafficEncounterValueSetUrl: import.meta.env.VITE_FHIR_VS_TRAFFIC_ENCOUNTER_URL ||
    'http://fhir.ph/ValueSet/road-traffic-encounters',
  injuryMoiValueSetUrl: import.meta.env.VITE_FHIR_VS_INJURY_MOI_URL ||
    'http://fhir.ph/ValueSet/injury-mechanism-of-injury',
  observationCategoryValueSetUrl: import.meta.env.VITE_FHIR_VS_OBSERVATION_CATEGORY_URL ||
    'http://fhir.ph/ValueSet/observation-category',
  dischargeDispositionValueSetUrl: import.meta.env.VITE_FHIR_VS_DISCHARGE_DISPOSITION_URL ||
    'http://fhir.ph/ValueSet/discharge-disposition',
  observationOutcomeValueSetUrl: import.meta.env.VITE_FHIR_VS_OBSERVATION_OUTCOME_URL ||
    'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/ValueSet/rs-observation-outcome-release',
};

interface FhirConfigContextType {
  config: FhirConfig;
  updateConfig: (newConfig: Partial<FhirConfig>) => void;
}

const FhirConfigContext = createContext<FhirConfigContextType | undefined>(undefined);

export const FhirConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<FhirConfig>(defaultConfig);

  const updateConfig = (newConfig: Partial<FhirConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig
    }));
  };

  return (
    <FhirConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </FhirConfigContext.Provider>
  );
};

export const useFhirConfig = (): FhirConfigContextType => {
  const context = useContext(FhirConfigContext);
  if (context === undefined) {
    throw new Error('useFhirConfig must be used within a FhirConfigProvider');
  }
  return context;
};