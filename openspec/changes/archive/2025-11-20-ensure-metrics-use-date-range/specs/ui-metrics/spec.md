## ADDED Requirements

### Requirement: Explicit Date Range Parameter for Metrics Calculation
The metrics calculation functions SHALL accept an optional `dateRange` parameter to ensure explicit awareness of the date filtering context.

#### Scenario: Metrics calculation receives date range parameter
- **GIVEN** dashboard has selected a date range from 2025-11-17 to 2025-11-21
- **AND** encounters and conditions are already filtered to this range
- **WHEN** `calculateMetrics()` is called with the `dateRange` parameter
- **THEN** the function signature includes `dateRange?: { from: Date; to: Date }`
- **AND** console logging confirms the date range being used for calculations
- **AND** all subsequent metric calculations (mortality rate, injury rate, case fatality rate) are documented to use the date-filtered dataset

#### Scenario: Metrics validation with date range logging
- **GIVEN** the dashboard calculates key metrics
- **WHEN** metrics are computed
- **THEN** console logs display: `Calculating metrics for date range: [startDate] to [endDate]`
- **AND** console logs display: `Total encounters in range: X, Total conditions in range: Y`
- **AND** console logs display: `Traffic accidents in range: Z, Traffic deaths in range: W`

## MODIFIED Requirements

### Requirement: Mortality Rate Metrics Card
The dashboard SHALL display a mortality rate metric card showing traffic accident deaths per 100,000 population. The calculation SHALL be based on encounters with conditions containing SNOMED CT codes 274215009 (Transport accident) OR 127348004 (Motor vehicle accident victim) WHERE the encounter's `meta.lastUpdated` timestamp falls within the selected date range.

#### Scenario: Display mortality rate with date-filtered data
- **GIVEN** dashboard has processed traffic-related fatalities within the date range 2025-11-17 to 2025-11-21
- **AND** 15 traffic-related deaths occurred in this period based on encounters with `meta.lastUpdated` in range
- **AND** population at risk is 1,000,000
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Mortality Rate"
  - Value: 1.50 (15 deaths per 1M population, displayed per 100k = 1.5)
  - Unit: "per 100k"
  - Data source clearly based on the 5-day period

#### Scenario: Mortality rate excludes data outside date range
- **GIVEN** the FHIR server contains 50 total traffic-related deaths
- **AND** only 15 deaths have encounters with `meta.lastUpdated` between 2025-11-17 and 2025-11-21
- **AND** the remaining 35 deaths have encounter dates outside this range
- **WHEN** the dashboard displays mortality rate for the date range
- **THEN** the mortality rate calculation uses only the 15 deaths within range
- **AND** the 35 deaths outside the range are excluded from the calculation

### Requirement: Injury Rate Metrics Card
The dashboard SHALL display an injury rate metric card showing non-fatal traffic-related injuries per 100,000 population calculated from conditions with `meta.lastUpdated` timestamps within the selected date range.

#### Scenario: Display injury rate with date filtering
- **GIVEN** dashboard has processed non-fatal traffic-related injuries within the date range
- **AND** 150 non-fatal injuries have conditions with `meta.lastUpdated` in the 5-day period
- **AND** population at risk is 1,000,000
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Value: 15.0 (150 injuries per 1M population, displayed per 100k = 15.0)
  - Unit: "per 100k"
  - Data source clearly based on the 5-day period

### Requirement: Case Fatality Rate Metrics Card
The dashboard SHALL display a case fatality rate metric card showing the percentage of traffic accidents resulting in death. The denominator SHALL use the same SNOMED CT codes (274215009 and 127348004) as the mortality rate calculation AND the denominator SHALL be filtered to include only encounters with `meta.lastUpdated` within the selected date range.

#### Scenario: Display case fatality rate with date-filtered denominator
- **GIVEN** dashboard has 15 traffic-related deaths within the date range
- **AND** dashboard has 385 traffic accidents (SNOMED CT encounters) within the same date range
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Value: 3.90% (15 deaths ÷ 385 accidents × 100)
  - Unit: "%"
  - Data source clearly based on the 5-day period

### Requirement: Transport Accident Count Display
The dashboard SHALL display the count of FHIR Observation and Condition resources with SNOMED CT codes for Transport accidents WHERE the resource's `meta.lastUpdated` timestamp falls within the selected date range.

#### Scenario: Transport accident count reflects date range
- **GIVEN** FHIR server contains 500 total transport accident observations from 2024-01-01 to 2025-11-30
- **AND** dashboard date range is set to 2025-11-17 to 2025-11-21
- **AND** 45 transport accidents have `meta.lastUpdated` within this 5-day period
- **WHEN** the user views the transport accident count metric
- **THEN** the metric displays: "Transport Accidents: 45 #"
- **AND** the count excludes the 455 transport accidents outside the date range
