## MODIFIED Requirements

### Requirement: Patient Age Grouping

The system SHALL group patients by age groups for demographic analysis. Age groups SHALL include: 0-4, 5-14, 15-24, 25-34, 35-44, 45-54, 55-64, 65-74, and 75+. The grouping SHALL support optional date range filtering to only include patients associated with encounters within the specified date range.

#### Scenario: Group patients by age with date filtering
- **GIVEN** a collection of Patient resources
- **AND** a collection of Encounter resources with optional date range {from: Date, to: Date}
- **WHEN** the grouping function is called
- **THEN** patients are grouped into the defined age groups based on birthDate
- **AND** patients who have at least one encounter within the date range are included
- **AND** each unique **patient identifier** is counted only once per age group
- **AND** patients with multiple FHIR Patient resources but same identifier are deduplicated
- **AND** only patients meeting the date range criteria are included in the count

#### Scenario: Patient age grouping without date filtering
- **GIVEN** a collection of Patient resources
- **AND** a collection of Encounter resources
- **AND** no specified date range
- **WHEN** the grouping function is called without date range
- **THEN** all patients are grouped into age groups
- **AND** each unique **patient identifier** is counted only once per age group
- **AND** patients with multiple FHIR Patient resources but same identifier are deduplicated
- **AND** all patients in the collection are included regardless of encounter dates

#### Scenario: Handle duplicate patients with different FHIR IDs
- **GIVEN** multiple Patient resources with different FHIR IDs
- **AND** all Patient resources share the same identifier (e.g., PSA ID)
- **AND** the patients are in different age groups due to different birthDate values
- **WHEN** the grouping function is called
- **THEN** the system counts the patient in the age group based on the most recent birthDate (or first encountered)
- **OR** the system logs a warning about inconsistent data for the same identifier
- **AND** only counts the patient once total across all groups

### Requirement: Patient Sex Grouping

The system SHALL group patients by sex categories for demographic analysis. Sex categories SHALL include: male, female, other, and unknown. The grouping SHALL support optional date range filtering to only include patients associated with encounters within the specified date range.

#### Scenario: Group patients by sex with date filtering
- **GIVEN** a collection of Patient resources
- **AND** a collection of Encounter resources with optional date range {from: Date, to: Date}
- **WHEN** the grouping function is called
- **THEN** patients are grouped into the sex categories based on the gender field
- **AND** patients who have at least one encounter within the date range are included
- **AND** each unique **patient identifier** is counted only once per sex group
- **AND** patients with multiple FHIR Patient resources but same identifier are deduplicated
- **AND** only patients meeting the date range criteria are included in the count

#### Scenario: Patient sex grouping without date filtering
- **GIVEN** a collection of Patient resources
- **AND** a collection of Encounter resources
- **AND** no specified date range
- **WHEN** the grouping function is called without date range
- **THEN** all patients are grouped into sex categories
- **AND** each unique **patient identifier** is counted only once per sex group
- **AND** patients with multiple FHIR Patient resources but same identifier are deduplicated
- **AND** all patients in the collection are included regardless of encounter dates

#### Scenario: Handle inconsistent sex data for same identifier
- **GIVEN** multiple Patient resources with different FHIR IDs but same identifier
- **AND** the Patient resources have different gender values
- **WHEN** the grouping function is called
- **THEN** the system counts the patient in the sex group based on the most recent gender value (or first encountered)
- **OR** the system logs a warning about inconsistent demographic data
- **AND** only counts the patient once total across all groups
