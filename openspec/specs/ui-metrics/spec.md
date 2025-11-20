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

The dashboard SHALL display a mortality rate metric card showing traffic accident deaths per 100,000 population. The calculation SHALL be based on encounters with conditions containing SNOMED CT codes 274215009 (Transport accident) OR 127348004 (Motor vehicle accident victim).

#### Scenario: Display mortality rate with SNOMED-based traffic accident criteria
- **GIVEN** dashboard has processed traffic-related fatalities where:
  - Conditions include SNOMED CT code 274215009 OR 127348004
  - Death is identified via Encounter.disposition death codes
  - Population at risk is known (1,000,000)
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Mortality Rate"
  - Value: calculated rate (e.g., 12.5)
  - Unit: "per 100k"
  - Icon: AlertCircle (from lucide-react)
  - Description: "Traffic accident deaths per 100,000 population (SNOMED CT 274215009, 127348004)"
- **AND** tooltip provides detailed explanation of the metric
- **AND** the calculation counts per unique patient, not per encounter (patients with multiple encounters are counted once)

#### Scenario: Patient deduplication in mortality calculation
- **GIVEN** a patient has multiple encounters with traffic-related conditions (SNOMED CT 274215009 or 127348004)
- **AND** the patient died (Encounter.disposition indicates death)
- **WHEN** mortality rate is calculated
- **THEN** the patient is counted only once in the death count
- **AND** multiple encounters for the same patient do not inflate the mortality rate

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
The dashboard SHALL display a case fatality rate metric card showing the percentage of traffic accidents resulting in death. The denominator SHALL use the same SNOMED CT codes (274215009 and 127348004) as the mortality rate calculation.

#### Scenario: Display case fatality rate with SNOMED-based traffic accident criteria
- **GIVEN** dashboard has processed traffic accidents where conditions include SNOMED CT code 274215009 OR 127348004
- **AND** encounters include both deaths and survivals
- **WHEN** the user views Key Metrics section
- **THEN** a metric card displays:
  - Title: "Case Fatality Rate"
  - Value: calculated percentage (e.g., 3.2%)
  - Unit: "%"
  - Icon: Activity (from lucide-react)
  - Description: "Percentage of accidents (SNOMED CT 274215009, 127348004) resulting in death"
- **AND** tooltip provides detailed explanation of the metric
- **AND** the calculation uses the same traffic accident definition as mortality rate

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

### Requirement: DOH Branding Banner
The dashboard SHALL display a Department of Health (DOH) banner/logo using the SIL-PH-Icon.png image prominently in the header section of the application.

#### Scenario: Header displays DOH logo
- **GIVEN** the user navigates to the Road Safety dashboard
- **WHEN** the page loads and renders the header section
- **THEN** the SIL-PH-Icon.png image is displayed in the header
- **AND** the image is sourced from the public folder at /SIL-PH-Icon.png
- **AND** the logo is positioned prominently in the header banner area
- **AND** the logo is appropriately sized to maximize visibility while maintaining layout balance
- **AND** the image includes appropriate alt text for accessibility compliance
- **AND** the banner background color or styling complements the logo image
- **AND** the layout maintains responsiveness at different screen sizes

