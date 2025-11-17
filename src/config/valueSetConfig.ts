// Configuration for PH Road Safety IG ValueSets

export interface ValueSetConfig {
  trafficEncounterValueSetUrl: string;
  injuryMoiValueSetUrl: string;
  observationCategoryValueSetUrl: string;
  dischargeDispositionValueSetUrl: string;
}

export const valueSetConfig: ValueSetConfig = {
  trafficEncounterValueSetUrl: import.meta.env.VITE_FHIR_VS_TRAFFIC_ENCOUNTER_URL || 
    'http://fhir.ph/ValueSet/road-traffic-encounters',
  injuryMoiValueSetUrl: import.meta.env.VITE_FHIR_VS_INJURY_MOI_URL || 
    'http://fhir.ph/ValueSet/injury-mechanism-of-injury',
  observationCategoryValueSetUrl: import.meta.env.VITE_FHIR_VS_OBSERVATION_CATEGORY_URL || 
    'http://fhir.ph/ValueSet/observation-category',
  dischargeDispositionValueSetUrl: import.meta.env.VITE_FHIR_VS_DISCHARGE_DISPOSITION_URL || 
    'http://fhir.ph/ValueSet/discharge-disposition',
};