## ADDED Requirements

### Requirement: Patient Identifier Extraction Function

The system SHALL provide a utility function to extract unique patient identifier values from Patient resources based on a given identifier system URL.

#### Scenario: Extract PSA identifier from patient
- **GIVEN** a patient resource with identifier system "https://psa.gov.ph/" and value "73-584789845-5"
- **WHEN** calling the extraction function with the PSA system URL
- **THEN** the function returns the identifier value "73-584789845-5"
- **AND** if multiple identifiers exist with the same system, only one is returned (deduplicated)

#### Scenario: Handle patients without matching identifier
- **GIVEN** a patient resource without an identifier matching the specified system URL
- **WHEN** calling the extraction function
- **THEN** the function returns null or undefined to indicate no identifier found

## MODIFIED Requirements

### Requirement: Mortality Rate Metrics Card

The dashboard SHALL display a mortality rate metric card showing traffic accident deaths per 100,000 population. The calculation SHALL be based on encounters with conditions containing SNOMED CT codes 274215009 (Transport accident) OR 127348004 (Motor vehicle accident victim).

#### Scenario: Display mortality rate with SNOMED-based traffic accident criteria
- **GIVEN** dashboard has processed traffic-related fatalities where:
  - Conditions include SNOMED CT code 274215009 OR 127348004
  - Death is identified via Encounter.disposition death codes
  - Population at risk is known (1,000,000)
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Mortality Rate"
  - Value: calculated rate (e.g., 12.5)
  - Unit: "per 100k"
  - Icon: AlertCircle (from lucide-react)
  - Description: "Traffic accident deaths per 100,000 population (SNOMED CT 274215009, 127348004)"
- **AND** tooltip provides detailed explanation of the metric
- **AND** the calculation counts per unique **patient identifier**, not per FHIR Patient ID (patients with different FHIR IDs but same identifier are counted once)

#### Scenario: Patient deduplication by identifier in mortality calculation
- **GIVEN** a patient has multiple FHIR Patient resources with different IDs
- **AND** all patient resources share the same identifier (e.g., PSA ID)
- **AND** the patient died in a traffic accident (Encounter.disposition indicates death)
- **WHEN** mortality rate is calculated
- **THEN** the patient is counted only once in the death count using their unique identifier
- **AND** multiple FHIR Patient resources for the same person do not inflate the mortality rate

#### Scenario: Handle missing patient identifiers
- **GIVEN** a patient resource without identifier matching the deduplication system
- **WHEN** the patient is processed for metrics
- **THEN** the system falls back to using FHIR Patient ID for counting
- **AND** logs a warning about missing identifier for audit purposes

