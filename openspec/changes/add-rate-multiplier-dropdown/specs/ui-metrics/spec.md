## MODIFIED Requirements

### Requirement: Mortality Rate Display
The dashboard SHALL prominently display traffic accident mortality rates in a metric card, dynamically adjustable per population unit (per 100, per 1,000, per 10,000, per 100,000, or per 1,000,000 population). A dropdown selector SHALL enable interactive multiplier selection, with per-100,000 as the default. The displayed rate SHALL update reactively based on user selection. The mortality counts and population data SHALL be retrieved from the server as actual counts. The application SHALL NOT use mock or synthetic data and SHALL only display data from the FHIR server.

#### Scenario: Default display
- **GIVEN** the user loads the dashboard with no prior selection
- **WHEN** the mortality rate card is rendered
- **THEN** the rate shows deaths per 100,000 population
- **AND** the dropdown displays "per 100k" as the selected option

#### Scenario: User selects per 100
- **GIVEN** mortality rate shows 50 deaths per 100,000
- **WHEN** user changes dropdown to "per 100"
- **THEN** the displayed rate updates to 0.05 deaths per 100
- **AND** the unit suffix updates accordingly

#### Scenario: User selects per 1,000
- **GIVEN** mortality rate shows 50 deaths per 100,000
- **WHEN** user changes dropdown to "per 1k"
- **THEN** the displayed rate updates to 0.5 deaths per 1,000
- **AND** the unit suffix updates accordingly

#### Scenario: User selects per 10,000
- **GIVEN** mortality rate shows 50 deaths per 100,000
- **WHEN** user changes dropdown to "per 10k"
- **THEN** the displayed rate updates to 5 deaths per 10,000
- **AND** the unit suffix updates accordingly

#### Scenario: User selects per 1,000,000
- **GIVEN** mortality rate shows 50 deaths per 100,000
- **WHEN** user changes dropdown to "per 1M"
- **THEN** the displayed rate updates to 500 deaths per 1,000,000
- **AND** the unit suffix updates accordingly

### Requirement: Injury Rate Display
The dashboard SHALL prominently display non-fatal injury rates in a metric card, following the same dynamic multiplier pattern as mortality rate. A dropdown selector SHALL enable interactive multiplier selection, with per-100,000 as the default. The displayed rate SHALL update reactively based on user selection. The injury counts and population data SHALL be retrieved from the server as actual counts. The application SHALL NOT use mock or synthetic data and SHALL only display data from the FHIR server.

#### Scenario: Default display
- **GIVEN** the user loads the dashboard with no prior selection
- **WHEN** the injury rate card is rendered
- **THEN** the rate shows injuries per 100,000 population
- **AND** the dropdown displays "per 100k" as the selected option

#### Scenario: User changes multiplier
- **GIVEN** injury rate shows 200 injuries per 100,000
- **WHEN** user changes dropdown to "per 1k"
- **THEN** the displayed rate updates to 2 injuries per 1,000
- **AND** the unit suffix updates accordingly

### Requirement: Case Fatality Rate Display
The dashboard SHALL prominently display case fatality rate as a percentage value in a metric card. No multiplier options are needed for this percentage-based metric. The fatality and accident counts SHALL be retrieved from the server as actual counts. The application SHALL NOT use mock or synthetic data and SHALL only display data from the FHIR server.

#### Scenario: Display percentage
- **GIVEN** there are traffic accidents with fatalities
- **WHEN** the case fatality rate calculates
- **THEN** the rate displays as a percentage (e.g., 15.5%) without multiplier options
- **AND** the tooltip explains it as "percentage of accidents resulting in death"

### Requirement: Rate Calculation Accuracy
All rate calculations using population-based multipliers SHALL maintain mathematical accuracy when switching between per 100, per 1k, per 10k, per 100k, and per 1M options. Calculation variants SHALL preserve correct proportions relative to population at risk. Calculations SHALL be based on actual counts retrieved from the server.

#### Scenario: Accurate proportional calculation
- **GIVEN** 50 deaths in a population of 1,000,000 (50 per 1M)
- **WHEN** displaying in different multipliers
- **THEN** per 100 shows 0.005
- **AND** per 1k shows 0.05
- **AND** per 10k shows 0.5
- **AND** per 100k shows 5
- **AND** per 1M shows 50

### Requirement: Server Data Accuracy
All displayed metrics SHALL be calculated using actual counts retrieved from the server. The application SHALL NOT perform client-side calculations that could result in data inconsistencies. The application SHALL NOT use any mock or synthetic data.

#### Scenario: Data retrieval
- **GIVEN** user accesses the dashboard
- **WHEN** the page loads
- **THEN** the application requests actual counts from the server
- **AND** all displayed metrics are calculated based on this server data

### Requirement: Population Data Retrieval
The application SHALL retrieve population data from the server rather than using static placeholder values. The system SHALL NOT use any hardcoded population values (such as the current 1,000,000 placeholder) and SHALL fetch the actual population data from the server.

#### Scenario: Population data retrieval
- **GIVEN** user accesses the dashboard
- **WHEN** the page loads
- **THEN** the application requests actual population data from the server
- **AND** all rate calculations use the retrieved population data
