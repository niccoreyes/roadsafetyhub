## MODIFIED Requirements

### Requirement: Patient Age Grouping

The system SHALL group patients by age groups for demographic analysis. Age groups SHALL include: 0-4, 5-14, 15-24, 25-34, 35-44, 45-54, 55-64, 65-74, and 75+. The grouping SHALL support optional date range filtering to only include patients associated with encounters within the specified date range.

#### Scenario: Group patients by age with date filtering and identifier deduplication
- **GIVEN** a collection of Patient resources with identifiers
- **AND** a collection of Encounter resources with optional date range {from: Date, to: Date}
- **WHEN** the grouping function is called
- **THEN** patients are grouped into the defined age groups based on birthDate
- **AND** patients who have at least one encounter within the date range are included
- **AND** each unique **patient identifier** is counted only once per age group
- **AND** patients with multiple FHIR Patient resources but same identifier are deduplicated
- **AND** only patients meeting the date range criteria are included in the count

#### Scenario: Patient age grouping with date filtering handles missing identifiers
- **GIVEN** a collection of Patient resources, some without identifiers
- **AND** a collection of Encounter resources with date range filtering
- **WHEN** the grouping function is called
- **THEN** patients with identifiers are deduplicated by identifier
- **AND** patients without identifiers fall back to deduplication by FHIR Patient ID
- **AND** a warning is logged for patients without identifiers indicating potential data quality issue

#### Scenario: Duplicate patients across date ranges
- **GIVEN** a patient with multiple FHIR Patient resources (same identifier)
- **AND** the patient has encounters in multiple date ranges
- **WHEN** dashboard filters to different periods
- **THEN** the patient is only counted once within each filtered cohort
- **AND** the patient appears in appropriate filtered results for each date range
- **AND** deduplication by identifier is maintained across all date filters

### Requirement: Patient Sex Grouping

The system SHALL group patients by sex categories for demographic analysis. Sex categories SHALL include: male, female, other, and unknown. The grouping SHALL support optional date range filtering to only include patients associated with encounters within the specified date range.

#### Scenario: Group patients by sex with date filtering and identifier deduplication
- **GIVEN** a collection of Patient resources with identifiers
- **AND** a collection of Encounter resources with optional date range {from: Date, to: Date}
- **WHEN** the grouping function is called
- **THEN** patients are grouped into sex categories based on the gender field
- **AND** patients who have at least one encounter within the date range are included
- **AND** each unique **patient identifier** is counted only once per sex group
- **AND** patients with multiple FHIR Patient resources but same identifier are deduplicated
- **AND** only patients meeting the date range criteria are included in the count

#### Scenario: Patient sex grouping with date filtering handles missing identifiers
- **GIVEN** a collection of Patient resources, some without identifiers
- **AND** a collection of Encounter resources with date range filtering
- **WHEN** the grouping function is called
- **THEN** patients with identifiers are deduplicated by identifier
- **AND** patients without identifiers fall back to deduplication by FHIR Patient ID
- **AND** a warning is logged for patients without identifiers indicating potential data quality issue
