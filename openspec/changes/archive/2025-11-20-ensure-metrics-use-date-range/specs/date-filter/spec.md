## MODIFIED Requirements

### Requirement: Date Range Filtering for FHIR Resources
The system SHALL filter all FHIR resources (Encounters, Conditions, Observations) to include only resources where the `meta.lastUpdated` timestamp falls within the selected date range. All downstream metric calculations (mortality rate, injury rate, case fatality rate, transport accident counts, and demographic breakdowns) SHALL explicitly validate that they are operating on date-filtered datasets.

#### Scenario: Metrics confirm date-filtered data source
- **GIVEN** 150 encounter resources exist in the FHIR server
- **AND** 50 encounters have `meta.lastUpdated` outside the selected date range (2025-11-17 to 2025-11-21)
- **AND** the `calculateMetrics()` function receives the `dateRange` parameter
- **WHEN** the dashboard loads with the selected date range
- **THEN** console logs confirm: "Metrics calculated for 100 encounters within date range [2025-11-17] to [2025-11-21]"
- **AND** all displayed metrics are calculated based on these 100 filtered encounters
- **AND** the system validates that traffic accident SNOMED CT filtering is applied to the date-filtered subset

#### Scenario: Transport accident SNOMED filtering with date range
- **GIVEN** 200 condition resources exist with SNOMED CT codes for transport accidents
- **AND** 75 conditions have `meta.lastUpdated` dates outside the selected range
- **WHEN** transport accident metrics are calculated
- **THEN** only 125 conditions within the date range are included in counts and rates
- **AND** console logging confirms the date filtering validation

#### Scenario: Mortality breakdown respects date range
- **GIVEN** encounter resources exist with various discharge dispositions
- **AND** encounters are filtered to date range 2025-11-17 to 2025-11-21
- **WHEN** mortality breakdown chart displays expired vs survived counts
- **THEN** the expired count includes only encounters with death disposition AND `meta.lastUpdated` in range
- **AND** the survived count includes only encounters with non-death disposition AND `meta.lastUpdated` in range
- **AND** the pie chart accurately reflects the 5-day analysis window

#### Scenario: Demographic breakdowns use date-filtered patient data
- **GIVEN** the dashboard displays sex and age breakdowns
- **AND** encounters are filtered to the 5-day date range
- **WHEN** demographic charts are rendered
- **THEN** the `groupByAgeGroup()` and `groupBySex()` functions receive and apply the date range parameter
- **AND** only patients with encounters in the date range are included in demographic counts
- **AND** patients without encounters in the range are excluded from demographic breakdowns
