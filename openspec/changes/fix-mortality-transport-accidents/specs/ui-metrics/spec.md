## MODIFIED Requirements

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
