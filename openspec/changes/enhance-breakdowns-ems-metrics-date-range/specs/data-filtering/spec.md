## ADDED Requirements

### Requirement: Date-Filtered Demographic Breakdowns
The system SHALL provide demographic breakdowns (sex, age, mortality) filtered by the selected date range.

#### Scenario: Sex breakdown updates with date range
- **GIVEN** a date range from "2025-11-01" to "2025-11-15" is selected in the dashboard
- **WHEN** the dashboard renders the sex pie chart
- **THEN** only encounters with `_lastUpdated` within that range are included in the calculation
- **AND** the chart shows sex distribution for encounters in that date range

#### Scenario: Age breakdown updates with date range
- **GIVEN** a date range from "2025-11-01" to "2025-11-15" is selected in the dashboard
- **WHEN** the dashboard renders the age bar chart
- **THEN** only encounters with `_lastUpdated` within that range are included in the calculation
- **AND** the chart shows age group distribution for that date range

#### Scenario: Mortality breakdown updates with date range
- **GIVEN** a date range from "2025-11-01" to "2025-11-15" is selected in the dashboard
- **WHEN** the dashboard renders the mortality pie chart
- **THEN** only encounters with `_lastUpdated` within that range are included in the calculation
- **AND** the chart shows expired vs survived distribution for that date range

### Requirement: EMS Response Metrics with Date Filtering
The system SHALL filter EMS Response Metrics by the selected date range.

#### Scenario: EMS metrics respect date filter
- **GIVEN** a date range is selected in the dashboard
- **WHEN** the EMS Response Metrics chart renders
- **THEN** it queries real data instead of using mock data
- **AND** only encounters with `_lastUpdated` within that range are included

## MODIFIED Requirements

### Requirement: Date Range Filtering
The system SHALL apply date range filtering to Encounters, Conditions, Sex breakdown, Age breakdown, Mortality breakdown, and EMS Response Metrics.

**Original:** The system SHALL apply date range filtering to Encounters and Conditions (line 42-48 in ai-description.md)

**Reason:** Extend date filtering to all charts and metrics for consistent UX

#### Scenario: Date range applies to all charts and tables
- **GIVEN** the user selects a date range from the dashboard date picker
- **WHEN** the dashboard refreshes
- **THEN** encounters are filtered by `_lastUpdated` query parameters
- **AND** conditions are filtered by encounter references
- **AND** all demographic breakdowns use the filtered encounter list
- **AND** EMS Response Metrics use the filtered encounter list
