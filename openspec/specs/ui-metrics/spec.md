# ui-metrics Specification

## Purpose
Defines the user interface metrics display requirements for the road safety dashboard, including metric cards, data visualization, and user interaction patterns.
## Requirements
### Requirement: Transport Accident Metrics Card

The dashboard SHALL NOT display a "Deaths per 10k Vehicles" metric card.

#### Scenario: Dashboard no longer displays Deaths per 10k Vehicles metric

- BEFORE: The metric card was displayed with title "Deaths per 10k Vehicles"
- BEFORE: The metric card calculated and displayed using `metrics.deathsPer10kVehicles`
- AFTER: This card is completely removed from the dashboard UI
- Rationale: Metric relies on static motor vehicle count data that does not reflect actual road usage
- Validation: Visual confirmation that the card no longer appears on the dashboard

### Requirement: Mortality Rate Metrics Card
The dashboard SHALL display a mortality rate metric card showing traffic accident deaths per 100,000 population.

#### Scenario: Display mortality rate
- **GIVEN** dashboard has processed traffic-related fatalities
- **AND** population at risk is known (1,000,000)
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Mortality Rate"
  - Value: calculated rate (e.g., 12.5)
  - Unit: "per 100k"
  - Icon: AlertCircle (from lucide-react)
  - Description: "Traffic accident deaths per 100,000 population"
- **AND** tooltip provides detailed explanation of the metric

### Requirement: Injury Rate Metrics Card
The dashboard SHALL display an injury rate metric card showing non-fatal traffic-related injuries per 100,000 population.

#### Scenario: Display injury rate
- **GIVEN** dashboard has processed non-fatal traffic-related injuries
- **AND** population at risk is known (1,000,000)
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Injury Rate"
  - Value: calculated rate (e.g., 45.2)
  - Unit: "per 100k"
  - Icon: TrendingUp (from lucide-react)
  - Description: "Non-fatal injuries per 100,000 population"
- **AND** tooltip provides detailed explanation of the metric

### Requirement: Case Fatality Rate Metrics Card
The dashboard SHALL display a case fatality rate metric card showing the percentage of traffic accidents resulting in death.

#### Scenario: Display case fatality rate
- **GIVEN** dashboard has processed traffic accidents and fatalities
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Case Fatality Rate"
  - Value: calculated percentage (e.g., 3.2%)
  - Unit: "%"
  - Icon: Activity (from lucide-react)
  - Description: "Percentage of accidents resulting in death"
- **AND** tooltip provides detailed explanation of the metric

### Requirement: Accident Per Vehicle Metrics Card
The dashboard SHALL display an accident per vehicle metric card showing reported accidents per 10,000 vehicles.

#### Scenario: Display accident per vehicle rate
- **GIVEN** dashboard has processed traffic accidents
- **AND** motor vehicle count is known (50,000)
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Accidents per Vehicle"
  - Value: calculated rate (e.g., 12.4)
  - Unit: "per 10k"
  - Icon: Users (from lucide-react)
  - Description: "Reported accidents per 10,000 vehicles"
- **AND** tooltip provides detailed explanation of the metric

