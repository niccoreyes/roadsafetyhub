## MODIFIED Requirements
### Requirement: Default Date Range Configuration
The system SHALL initialize with a default date range of November 17, 2025 to November 21, 2025 to provide a focused 5-day analysis window for demonstration purposes.

#### Scenario: Dashboard initial load
- **GIVEN** a user loads the dashboard for the first time
- **WHEN** the dashboard initializes
- **THEN** the Date Range Picker displays "Nov 17, 2025 - Nov 21, 2025" as the selected range
- **AND** all metrics show data filtered to this 5-day period
- **AND** the user can modify the range without persistence (reset on page reload)

#### Scenario: User selects date range
- **GIVEN** the dashboard is loaded with default date range (2025-11-17 to 2025-11-21)
- **WHEN** the user clicks on the date picker button
- **THEN** a calendar popover displays showing both months side-by-side (when applicable)
- **AND** the currently selected date range is visually highlighted
- **AND** the start and end dates are clearly marked with distinct styling
- **WHEN** the user clicks on a start date
- **AND** clicks on an end date
- **THEN** the date range selection completes
- **AND** the button displays the formatted date range (e.g., "Jan 1, 2024 - Dec 31, 2024")
- **AND** all dashboard metrics refresh with data filtered to the new date range

#### Scenario: Date range validation
- **GIVEN** the user is selecting a date range
- **WHEN** the user attempts to select an end date earlier than the start date
- **THEN** the system prevents invalid selection
- **AND** maintains the previous valid date range
- **AND** displays a toast notification indicating the invalid selection attempt
