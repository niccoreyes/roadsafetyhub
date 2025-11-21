# Capability: Outcome Observation Detection

## ADDED Requirements

### Requirement: Observation Outcome ValueSet Configuration
The system SHALL support configuration for the Observation Outcome Release profile URL from the PH Road Safety Implementation Guide. The configuration SHALL include a default value for the profile URL and support environment variable overrides.

#### Scenario: Observation profile URL is configured with default
Given the valueSet configuration file
When the application loads configuration without custom environment variables
Then it SHALL include observationOutcomeValueSetUrl
And it SHALL default to 'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/ValueSet/rs-observation-outcome-release'

#### Scenario: Environment variable override for observation outcome ValueSet
Given a custom environment variable VITE_FHIR_VS_OBSERVATION_OUTCOME_URL with a custom URL value
When the application loads configuration
Then observationOutcomeValueSetUrl SHALL use the custom URL from the environment variable

### Requirement: Outcome Status Detection from Observations
The system SHALL provide a function to determine patient death status by examining Observation resources with the PH Road Safety IG Observation Outcome Release profile. The function SHALL identify death outcomes based on the observation code, profile, and valueCodeableConcept coding.

#### Scenario: Patient with death observation using custom code system
Given an array of Observation resources
And an observation resource with:
- meta.profile containing 'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
- code.coding with system 'http://snomed.info/sct' and code '418138009'
- valueCodeableConcept.coding with system 'http://www.roadsafetyph.doh.gov.ph/CodeSystem' and code 'DIED'
When checkOutcomeStatus is called with the observations
Then it SHALL return true indicating the patient died

#### Scenario: Patient with alive/improved observation using SNOMED code
Given an array of Observation resources
And an observation resource with:
- meta.profile containing 'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release'
- code.coding with system 'http://snomed.info/sct' and code '418138009'
- valueCodeableConcept.coding with system 'http://snomed.info/sct' and code '268910001' (Improved)
When checkOutcomeStatus is called with the observations
Then it SHALL return false indicating the patient survived

#### Scenario: Patient with no outcome observations
Given an array of Observation resources
And no observations with the outcome observation profile or matching codes
When checkOutcomeStatus is called
Then it SHALL return false indicating the patient is assumed alive

### Requirement: Enhanced isExpired Function with Observation Support
The system SHALL enhance the existing isExpired function to support Observation-based death detection while maintaining backward compatibility with discharge disposition checking. The function SHALL prioritize Observation-based detection when observations are available.

#### Scenario: Encounter with matching death observation
Given an encounter resource
And an observations array containing a death outcome observation linked to the encounter's patient
When isExpired is called with the encounter and observations
Then it SHALL return true indicating the patient died

#### Scenario: Encounter without observations falls back to discharge disposition
Given an encounter resource with hospitalization.dischargeDisposition.coding indicating death (code 'exp')
And no observations array provided
When isExpired is called with only the encounter
Then it SHALL check dischargeDisposition and return true based on the disposition code

#### Scenario: Both observations and discharge disposition available with observation priority
Given an encounter resource with hospitalization.dischargeDisposition
And an observations array with death outcome observation
When isExpired is called with both parameters
Then it SHALL prioritize the observation-based detection
And it SHALL log a warning if observation and discharge disposition indicate different outcomes

### Requirement: calculateMetrics Integration with Observations
The system SHALL update the calculateMetrics function to accept an optional observations parameter and use observation-based death detection when available. The function SHALL maintain backward compatibility by falling back to discharge disposition checking when observations are not provided.

#### Scenario: Calculate metrics with observations data for death determination
Given arrays of encounters, conditions, patients, and observations
When calculateMetrics is called with all parameters including observations
Then it SHALL use observations to determine patient death status
And it SHALL return correct mortalityRate, caseFatalityRate, and totalFatalities metrics

#### Scenario: Calculate metrics without observations maintains backward compatibility
Given arrays of encounters, conditions, and patients
And no observations parameter provided
When calculateMetrics is called
Then it SHALL use discharge disposition as fallback for death determination
And it SHALL return correct metrics

### Requirement: Patient Deduplication with Observations
The system SHALL ensure patient deduplication by identifier is maintained when using observations for outcome detection. Multiple observations for the same patient SHALL be resolved to a single death status determination per unique patient identifier.

#### Scenario: Multiple observations for same patient deduplicated by identifier
Given observations array with multiple outcome observations for the same patient identifier
When death status is calculated for that patient
Then the patient SHALL be counted only once using identifier-based deduplication

#### Scenario: Observations across multiple encounters for same patient
Given observations linked to different encounters for the same patient identifier
When death status is calculated across all encounters
Then the patient death status SHALL be consistent and counted only once

### Requirement: ValueSet Integration for Observation Outcome
The system SHALL support ValueSet expansion for the observation outcome ValueSet when available, and fall back to explicit code checking when ValueSet expansion is not available or fails.

#### Scenario: ValueSet expansion available for observation outcome codes
Given a FHIR server with the observation outcome ValueSet accessible
When checkOutcomeStatus uses isCodingInValueSet for validation
Then it SHALL correctly identify death outcomes through ValueSet membership

#### Scenario: ValueSet expansion unavailable falls back to explicit code checking
Given no ValueSet expansion available or ValueSet expansion fails
When checkOutcomeStatus is called
Then it SHALL fall back to checking explicit codes for death indicators
And it SHALL log a warning about the fallback to explicit code checking

### Requirement: Performance Optimization with Observation Pre-filtering
The system SHALL optimize performance when processing large observation datasets by pre-filtering observations by patient and date range before outcome detection, and SHALL support indexed observation structures for efficient repeated lookups.

#### Scenario: Large observations dataset with pre-filtering
Given a large array of observations
When calculateMetrics is called before processing individual patients
Then it SHALL pre-filter observations by patient reference and date range
And it SHALL pass filtered observations to checkOutcomeStatus for efficiency

#### Scenario: Indexed observations structure for O(1) lookup
Given observations loaded into a Map or indexed structure keyed by patient ID
When checkOutcomeStatus is called repeatedly for different patients
Then it SHALL use the index for O(1) lookup instead of array filtering

### Requirement: Logging and Monitoring for Observation-Based Detection
The system SHALL provide appropriate logging for observation-based outcome detection, including debug logs for successful detection, warning logs for fallback scenarios, and warning logs for data source conflicts.

#### Scenario: Observation-based detection used successfully
Given valid observations are available for death status determination
When checkOutcomeStatus identifies a death through observations
Then it SHALL log a debug message indicating observation-based detection was used

#### Scenario: Fallback to discharge disposition logged as warning
Given no observations available in the data
When isExpired falls back to checking discharge disposition
Then it SHALL log a warning message about the fallback to legacy method

#### Scenario: Conflicting outcome sources detected
Given both observations and discharge disposition data
And they indicate different outcomes for the same patient
When death status is determined
Then it SHALL log a warning about conflicting data sources
And it SHALL prioritize the observation-based outcome
