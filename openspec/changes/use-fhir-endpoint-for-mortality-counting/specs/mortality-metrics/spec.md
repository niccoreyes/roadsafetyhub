# Capability: FHIR Endpoint-Based Mortality Metrics

## ADDED Requirements

### Requirement: Dedicated Endpoint for Death Observations
The system SHALL use the dedicated FHIR endpoint `https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED` to fetch death observations for mortality calculations. This approach SHALL provide server-side filtering to improve performance and reduce data transfer.

#### Scenario: Fetching death observations using dedicated endpoint
Given the FHIR server supports the value-concept parameter
When fetchObservationsByConcept is called with concept "DIED"
Then the URL SHALL be constructed as `${FHIR_BASE_URL}/Observation?value-concept=DIED&_lastUpdated=ge{startDate}&_lastUpdated=lt{endDate}`
And only observations with valueCodeableConcept containing code "DIED" SHALL be returned

#### Scenario: Fetching death observations with date range
Given a date range specified by startDate and endDate
When fetchObservationsByConcept is called with concept "DIED" and the date range
Then the date range SHALL be applied using _lastUpdated parameters
And only observations updated within the specified range SHALL be returned

### Requirement: Mortality Rate Calculation Using Optimized Endpoint
The system SHALL calculate mortality rate using death observations fetched from the dedicated endpoint. The mortality rate SHALL be calculated as (number of unique patients with death observations / population at risk) * 100,000.

#### Scenario: Mortality rate calculated with death observations from optimized endpoint
Given death observations fetched from the dedicated FHIR endpoint
And a population at risk value
When calculateMetrics is called
Then the mortality rate SHALL be calculated using only patients with death observations from the dedicated endpoint
And each unique patient SHALL be counted only once, even if they have multiple death observations
And the rate SHALL be calculated as (unique death patients / population at risk) * 100000

#### Scenario: Multiple death observations for same patient counted once
Given a patient with multiple death observations from the dedicated endpoint
When mortality rate is calculated
Then the patient SHALL be counted only once in the death statistics
And the mortality rate SHALL not be inflated by duplicate patient entries

### Requirement: Case Fatality Rate Calculation Using Optimized Endpoint
The system SHALL calculate case fatality rate using death observations from the dedicated endpoint. The case fatality rate SHALL be calculated as (number of unique patients with death observations / total traffic accidents) * 100.

#### Scenario: Case fatality rate calculated with optimized endpoint data
Given death observations fetched from the dedicated endpoint
And total traffic accidents count
When calculateMetrics is called
Then the case fatality rate SHALL be calculated as (unique death patients from endpoint / total accidents) * 100
And patient deduplication SHALL be applied to prevent overcounting

#### Scenario: Case fatality rate with zero traffic accidents
Given zero traffic accidents
And death observations from the dedicated endpoint
When calculateMetrics is called
Then the case fatality rate SHALL be 0 to prevent division by zero
And no error SHALL occur

### Requirement: Total Fatalities Count Using Optimized Endpoint
The system SHALL count total fatalities using death observations fetched from the dedicated endpoint. The total SHALL represent the number of unique patients with confirmed death observations.

#### Scenario: Total fatalities count from dedicated endpoint
Given death observations fetched from the dedicated FHIR endpoint
When calculateMetrics is called
Then totalFatalities SHALL equal the count of unique patients with death observations
And each patient SHALL be counted only once regardless of multiple death observations

#### Scenario: Total fatalities with no death observations
Given no death observations returned from the dedicated endpoint
When calculateMetrics is called
Then totalFatalities SHALL be 0
And no errors SHALL occur during calculation

### Requirement: Patient Deduplication with Optimized Endpoint
The system SHALL ensure patient deduplication is maintained when using the optimized endpoint. Multiple observations for the same patient SHALL result in the patient being counted only once in mortality metrics.

#### Scenario: Multiple death observations for same patient
Given a patient with multiple death observations from the dedicated endpoint
When mortality metrics are calculated
Then the patient SHALL be counted only once in all mortality metrics
And duplicate observations SHALL not inflate the mortality counts

#### Scenario: Patient with traffic-related conditions and death observations
Given a patient with traffic-related conditions and death observations from the dedicated endpoint
When calculateMetrics is called
Then the patient SHALL be included in mortality calculations only if they have both traffic-related conditions and death observations
And the patient SHALL be counted only once regardless of multiple related observations

### Requirement: Performance Optimization with Server-Side Filtering
The system SHALL demonstrate improved performance when using the dedicated endpoint compared to client-side filtering. The approach SHALL reduce data transfer and processing time.

#### Scenario: Reduced data transfer with dedicated endpoint
Given the system has access to the dedicated FHIR endpoint
When death observations are fetched for metrics calculation
Then the amount of data transferred SHALL be significantly less than fetching all observations
And client-side processing time for filtering SHALL be eliminated

#### Scenario: Faster metrics calculation with optimized endpoint
Given death observations are fetched using the dedicated endpoint
When calculateMetrics is called
Then the metrics calculation time SHALL be reduced compared to client-side filtering approach
And the user experience SHALL be improved due to faster loading times

### Requirement: Error Handling for Optimized Endpoint
The system SHALL handle errors appropriately when the dedicated endpoint is unavailable or returns unexpected results. Graceful fallback or error reporting SHALL be implemented.

#### Scenario: Error handling when dedicated endpoint fails
Given the dedicated FHIR endpoint is unavailable
When fetchObservationsByConcept is called
Then appropriate error handling SHALL occur
And the error SHALL be logged for debugging purposes
And the user SHALL receive appropriate feedback about the issue

#### Scenario: Empty results from dedicated endpoint
Given the dedicated endpoint returns no results
When calculateMetrics is called
Then the system SHALL handle the empty result gracefully
And mortality metrics SHALL be calculated correctly (likely showing 0 deaths)
And no errors SHALL occur in the application

## MODIFIED Requirements

### Requirement: Fetch Observations by Concept for Death Metrics
The existing `fetchObservationsByConcept` function SHALL be updated to use the value-concept parameter for server-side filtering of death observations.

#### Scenario: Updated fetchObservationsByConcept for value-concept
Given the updated implementation
When fetchObservationsByConcept is called with concept "DIED"
Then the function SHALL construct the URL with value-concept parameter
And the server SHALL filter observations server-side based on the concept value
And the function SHALL return only matching observations

### Requirement: Metrics Calculation Integration with Optimized Observations
The `calculateMetrics` function SHALL properly integrate with the optimized death observation fetching to ensure accurate mortality metrics.

#### Scenario: Metrics calculation with optimized observation data
Given death observations fetched from the dedicated endpoint
When calculateMetrics is called
Then the function SHALL correctly process the optimized observation data
And all mortality-related metrics SHALL be calculated accurately
And the performance benefit of server-side filtering SHALL be realized