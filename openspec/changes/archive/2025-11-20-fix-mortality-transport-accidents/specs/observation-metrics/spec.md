## REMOVED Requirements

### Requirement: SNOMED CT Code Filtering 274215009
**Reason**: Requirement is being replaced to include SNOMED CT code 127348004 in addition to 274215009, with different counting strategies for mortality vs. transport accident displays.

**Migration**: Update any references to use the new requirement "SNOMED CT Codes for Transport Accidents" which includes both codes.

## ADDED Requirements

### Requirement: SNOMED CT Codes for Transport Accidents
The system SHALL identify and count resources containing SNOMED CT codes 274215009 (Transport accident) OR 127348004 (Motor vehicle accident victim) from the code system `http://snomed.info/sct` OR the versioned code system `http://snomed.info/sct/900000000000207008/version/20241001` in the `resource.code.coding` array.

#### Scenario: Filter resources by both SNOMED CT codes
- **GIVEN** 500 observation resources and 200 condition resources are fetched from the FHIR server
- **AND** resources include various code systems and SNOMED CT codes
- **WHEN** the system processes resources with code 274215009 OR 127348004
- **THEN** it checks each resource's `code.coding` array
- **AND** matches resources where:
  - `coding.code = "274215009"` OR `coding.code = "127348004"`
  - AND (`coding.system = "http://snomed.info/sct"` OR `coding.system = "http://snomed.info/sct/900000000000207008/version/20241001"`)
- **AND** returns the count of matching resources

#### Scenario: Observation with motor vehicle accident victim code
- **GIVEN** an observation resource with the following code structure:
```json
{
  "resourceType": "Observation",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct/900000000000207008/version/20241001",
        "code": "127348004",
        "display": "Motor vehicle accident victim (person)"
      }
    ]
  }
}
```
- **WHEN** the filtering logic checks this observation
- **THEN** it is counted in the transport accident metrics

### Requirement: Mortality Calculation by Patient
The system SHALL calculate mortality rate based on unique patients rather than encounters to prevent overcounting of patients with multiple traffic-related encounters.

#### Scenario: Calculate deaths per unique patient
- **GIVEN** 1000 encounters for 800 unique patients
- **AND** 50 patients died (some with multiple encounters each)
- **WHEN** mortality rate is calculated
- **THEN** the death count is 50 (unique patients)
- **AND** calculation uses 50 as the numerator, not the total number of death encounters

#### Scenario: Patient-level traffic accident identification
- **GIVEN** a patient has 3 encounters
- **AND** 2 encounters have code 274215009 and 1 encounter has code 127348004
- **AND** the patient dies
- **WHEN** mortality calculation processes this patient
- **THEN** the patient is counted once in the traffic accident population
- **AND** the patient is counted once in the death count if expired

### Requirement: Transport Accident Counting by Encounter
The system SHALL count transport accidents for display purposes (e.g., metric cards, UI displays) on a per-encounter basis, where each encounter with a matching SNOMED CT code counts as one transport accident.

#### Scenario: Count encounters with transport accident codes
- **GIVEN** 250 encounters with SNOMED code 274215009 (Transport accident)
- **AND** 150 encounters with SNOMED code 127348004 (Motor vehicle accident victim)
- **WHEN** the transport accident count is calculated for display
- **THEN** the total count is 400 encounters
- **AND** the count includes both SNOMED codes

#### Scenario: Transport accidents card with both codes
- **GIVEN** the dashboard has loaded observations and conditions with both SNOMED codes
- **AND** 35 observations match code 274215009
- **AND** 15 observations match code 127348004
- **AND** 20 conditions match code 274215009
- **AND** 10 conditions match code 127348004
- **WHEN** the user views the Key Metrics section
- **THEN** the Transport Accidents card displays:
  - Title: "Transport Accidents"
  - Value: 80 (35 + 15 + 20 + 10)
  - Unit: "#"
  - Icon: Activity (from lucide-react)
  - Description: "Observations and conditions with SNOMED CT codes 274215009, 127348004"
