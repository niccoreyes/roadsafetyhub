## ADDED Requirements

### Requirement: Observation Resource Fetching
The system SHALL provide functionality to fetch FHIR Observation resources from the FHIR server with support for date range filtering.

#### Scenario: Fetch observations within date range
- **GIVEN** the dashboard has a selected date range (e.g., 2024-01-01 to 2024-12-31)
- **WHEN** the fetchObservations function is called with start and end dates
- **THEN** the function constructs a FHIR search query to the Observation endpoint
- **AND** includes date parameters to filter observations by `meta.lastUpdated`
- **AND** returns all matching observations with their full resource content
- **AND** handles pagination to fetch all observation pages

#### Scenario: Handle empty observation results
- **GIVEN** no observations exist for the selected date range
- **WHEN** fetchObservations completes
- **THEN** an empty array is returned (no errors thrown)
- **AND** downstream components handle the empty state gracefully

### Requirement: SNOMED CT Code Filtering 274215009
The system SHALL identify and count Observation resources containing the SNOMED CT code `274215009` from the code system `http://snomed.info/sct/900000000000207008/version/20241001` in the `Observation.code.coding` array.

#### Scenario: Filter observations by specific SNOMED CT code
- **GIVEN** 500 observation resources are fetched from the FHIR server
- **AND** observations include various code systems and SNOMED CT codes
- **WHEN** the countObservationsByCode function processes the observations with code `274215009`
- **THEN** it checks each observation's `code.coding` array
- **AND** matches observations where:
  - `coding.system = "http://snomed.info/sct/900000000000207008/version/20241001"`
  - `coding.code = "274215009"`
- **AND** returns the count of matching observations

#### Scenario: Observation with matching SNOMED CT code
- **GIVEN** an observation resource with the following code structure:
```json
{
  "resourceType": "Observation",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct/900000000000207008/version/20241001",
        "code": "274215009",
        "display": "Vital Signs"
      }
    ]
  }
}
```
- **WHEN** the filtering logic checks this observation
- **THEN** it is counted in the observation metrics

#### Scenario: Observation without matching SNOMED CT code
- **GIVEN** an observation with a different SNOMED CT code or different code system
- **WHEN** the filtering logic checks this observation
- **THEN** it is excluded from the count

### Requirement: Vital Signs Assessment Metrics Card
The dashboard SHALL display a metric card showing the count of observations matching SNOMED CT code 274215009, positioned in the Key Metrics section alongside other critical health metrics.

#### Scenario: Display vital signs assessment count
- **GIVEN** the dashboard has loaded observations for the selected date range
- **AND** 42 observations match SNOMED CT code 274215009
- **WHEN** the user views the Key Metrics section
- **THEN** a metric card displays:
  - Title: "Vital Signs Assessments"
  - Value: 42
  - Unit: "assessments"
  - Icon: Heart pulse (from lucide-react)
  - Description: "Number of vital signs observations recorded"
- **AND** the loading state is shared with other metrics during data refresh

#### Scenario: Zero vital signs assessments
- **GIVEN** no observations match SNOMED CT code 274215009 for the selected date range
- **WHEN** the metric card renders
- **THEN** it displays value "0" with neutral styling (not error state)
- **AND** the description updates to indicate no assessments recorded

#### Scenario: Observation data loading state
- **GIVEN** observations are being fetched from the server
- **WHEN** the metrics are calculating
- **THEN** the Vital Signs Assessment card displays a skeleton loading state
- **AND** matches the loading behavior of existing metric cards
- **AND** updates to show real data once fetch and filtering complete

### Requirement: Observation Metrics Integration
The system SHALL process observation metrics calculations asynchronously alongside other dashboard metrics to ensure all data updates are synchronized when the date range changes.

#### Scenario: Date range change triggers refresh
- **GIVEN** the user selects a new date range
- **WHEN** the date range selection is confirmed
- **THEN** all metric cards enter loading state
- **AND** observation fetch executes with new date range parameters
- **AND** SNOMED CT filtering applies to the updated observations
- **AND** the Vital Signs Assessment card updates with new count
- **AND** all other metrics refresh simultaneously

#### Scenario: Parallel metric calculations
- **GIVEN** encounter, condition, patient, and observation data are all loading
- **WHEN** all fetch operations complete
- **THEN** metrics calculations run in parallel using Promise.all()
- **AND** the dashboard state updates atomically when all metrics are ready
- **AND** no partial updates create inconsistent UI states
