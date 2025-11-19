## MODIFIED Requirements

### Requirement: SNOMED CT Code Filtering 274215009
The system SHALL identify and count both Observation and Condition resources containing the SNOMED CT code `274215009` from the code system `http://snomed.info/sct` OR the versioned code system `http://snomed.info/sct/900000000000207008/version/20241001` in the `resource.code.coding` array.

#### Scenario: Filter resources by specific SNOMED CT code
- **GIVEN** 500 observation resources and 200 condition resources are fetched from the FHIR server
- **AND** resources include various code systems and SNOMED CT codes
- **WHEN** the system processes resources with code `274215009`
- **THEN** it checks each resource's `code.coding` array
- **AND** matches resources where:
  - `coding.code = "274215009"`
  - AND (`coding.system = "http://snomed.info/sct"` OR `coding.system = "http://snomed.info/sct/900000000000207008/version/20241001"`)
- **AND** returns the count of matching resources (observations + conditions)

#### Scenario: Observation with versioned SNOMED CT system
- **GIVEN** an observation resource with the following code structure:
```json
{
  "resourceType": "Observation",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct/900000000000207008/version/20241001",
        "code": "274215009",
        "display": "Transport accident (event)"
      }
    ]
  }
}
```
- **WHEN** the filtering logic checks this observation
- **THEN** it is counted in the transport accident metrics

#### Scenario: Condition with canonical SNOMED CT system
- **GIVEN** a condition resource with the following code structure:
```json
{
  "resourceType": "Condition",
  "code": {
    "coding": [
      {
        "system": "http://snomed.info/sct",
        "code": "274215009",
        "display": "Transport accident (event)"
      }
    ]
  }
}
```
- **WHEN** the filtering logic checks this condition
- **THEN** it is counted in the transport accident metrics

#### Scenario: Resource without matching SNOMED CT code
- **GIVEN** a resource with a different SNOMED CT code or different code system
- **WHEN** the filtering logic checks this resource
- **THEN** it is excluded from the count

### Requirement: Transport Accident Metrics Card
The dashboard SHALL display a metric card showing the combined count of observations and conditions matching SNOMED CT code 274215009, positioned in the Key Metrics section alongside other critical health metrics.

#### Scenario: Display transport accident count
- **GIVEN** the dashboard has loaded observations and conditions for the selected date range
- **AND** 35 observations match SNOMED CT code 274215009
- **AND** 15 conditions match SNOMED CT code 274215009
- **WHEN** the user views the Key Metrics section
- **THEN** a metric card displays:
  - Title: "Transport Accidents"
  - Value: 50 (35 observations + 15 conditions)
  - Unit: "#"
  - Icon: Activity (from lucide-react)
  - Description: "Observations and conditions with SNOMED CT code 274215009 (Transport accident)"
- **AND** date range filtering applies to both observations and conditions

#### Scenario: Zero transport accidents
- **GIVEN** no observations or conditions match SNOMED CT code 274215009 for the selected date range
- **WHEN** the metric card renders
- **THEN** it displays value "0" with neutral styling (not error state)
- **AND** the description indicates no transport accidents recorded

#### Scenario: Transport accident data loading state
- **GIVEN** observations and conditions are being fetched from the server
- **WHEN** the metrics are calculating
- **THEN** the Transport Accident card displays a skeleton loading state
- **AND** matches the loading behavior of existing metric cards
- **AND** updates to show real data once fetch and filtering complete

