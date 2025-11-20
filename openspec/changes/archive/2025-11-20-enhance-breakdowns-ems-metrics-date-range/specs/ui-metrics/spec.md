## MODIFIED Requirements

### Requirement: Simulated Data Transparency
The dashboard MUST display a prominent, dismissible banner when all data is simulated, and MUST NOT display monthly trends.

**Original:** Charts display simulated data with warnings in tooltips or below charts

**Reason:** Centralize simulated data warning at dashboard level for better UX and remove monthly trends which are entirely simulated

#### Scenario: Dashboard shows simulated data warning banner
- **GIVEN** the dashboard loads with simulated/mock data
- **WHEN** the page renders
- **THEN** a prominent amber/orange warning banner appears near the header
- **AND** the banner states "Note: All displayed data is simulated for demonstration purposes"
- **AND** the banner can be dismissed and remains dismissed across page reloads

#### Scenario: Remove component-level simulated warnings
- **GIVEN** the dashboard is rendered
- **WHEN** examining EMS Response Metrics and Trends charts
- **THEN** no "simulated" text appears in tooltips or chart areas
- **AND** the dashboard-level banner provides the warning instead

#### Scenario: Monthly trends are hidden
- **GIVEN** the dashboard is rendered
- **WHEN** examining the Analytics & Trends section
- **THEN** the TrendsChart component is not displayed
- **AND** no monthly trend data is shown anywhere on the dashboard

#### Scenario: User dismisses simulated data warning
- **GIVEN** the simulated data banner is visible
- **WHEN** the user clicks the dismiss button
- **THEN** the banner is hidden from view
- **AND** the preference is saved to localStorage
- **AND** the banner does not reappear on subsequent page loads

#### Scenario: User clears dismiss preference
-  **GIVEN** the user previously dismissed the simulated data warning
-  **WHEN** the user clears browser localStorage or uses a new browser
-  **THEN** the banner reappears on the next dashboard load
