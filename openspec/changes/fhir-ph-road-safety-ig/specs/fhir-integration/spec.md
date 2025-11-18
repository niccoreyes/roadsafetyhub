# FHIR Integration Layer Enhancement

## ADDED Requirements

### Requirement: CONFIGURABLE_FHIR_SERVER
**Capability:** FHIR Server Configuration
#### Scenario: User configures FHIR server base URL and authentication credentials

**Requirement:** The system SHALL support configurable FHIR server parameters including base URL (default: `https://cdr.fhirlab.net/fhir`). The system SHALL support configurable FHIR server parameters including authentication credentials (Bearer token, OAuth, etc.). The system SHALL support configurable FHIR server parameters including timeout settings. The system SHALL support configurable FHIR server parameters including retry attempts. The system SHALL support configurable FHIR server parameters including pagination limits.

**Acceptance Criteria:**
```
Given I am deploying the application
When I set FHIR_BASE_URL environment variable or config value
Then the FHIR client should use that URL for all requests

Given I configure FHIR authentication credentials
When the application makes FHIR requests
Then it should include authentication headers
```

**References:**
- IG requirement: Section 1.1 "FHIR Integration"
- Current code: `src/utils/fhirClient.ts:3`

---

### Requirement: VALUESET_BASED_FILTERING
**Capability:** ValueSet-based Classification
#### Scenario: Filter encounters using PH Road Safety IG ValueSets instead of ad-hoc SNOMED codes

**Requirement:** The system SHALL use PH Road Safety IG-defined ValueSets for classifying road traffic encounters (instead of TRAFFIC_KEYWORDS). The system SHALL use PH Road Safety IG-defined ValueSets for classifying injury mechanisms (MOI). The system SHALL use PH Road Safety IG-defined ValueSets for classifying condition types. The system SHALL use PH Road Safety IG-defined ValueSets for classifying observation categories.

**Acceptance Criteria:**
```
Given FHIR data contains encounters with coded reasons
When classifying road traffic accidents
Then use ValueSet URLs from IG (e.g., "http://fhir.ph/ValueSet/road-traffic-encounters") instead of hardcoded keyword matching

Given a FHIR Condition resource
When determining mechanism of injury
Then match against IG-defined ValueSet for injury MOI
```

**References:**
- IG requirement: Section 2.1 "Resource Queries & Aggregations"
- To replace: `src/utils/snomedMapping.ts:19-29`

---

### Requirement: PAGINATION_SUPPORT
**Capability:** Paginated FHIR Fetching
#### Scenario: Retrieve large datasets efficiently using FHIR pagination

**Requirement:** The system SHALL implement FHIR Bundle pagination following `_count` parameter support. The system SHALL implement FHIR Bundle pagination following automatic `next` link following. The system SHALL implement FHIR Bundle pagination following configurable maximum result limits. The system SHALL implement FHIR Bundle pagination following progress indication for large queries.

**Acceptance Criteria:**
```
Given I query a date range with 10,000+ encounters
When the FHIR server returns paginated results
Then the system should follow all next links until complete or max limit reached

Given a pagination sequence with intermediate errors
When a page fetch fails
Then the system should retry or gracefully handle the partial dataset
```

**References:**
- IG requirement: Section 1.2 "FHIR Integration"
- Current: `src/utils/fhirClient.ts:22-66` needs enhancement

---

### Requirement: OBSERVATION_PROFILE_SUPPORT
**Capability:** PH Road Safety IG Observation Support
#### Scenario: Query and process observations per IG profiles

**Requirement:** The system SHALL fetch observations using IG-defined profile URLs. The system SHALL support ValueSet-based code filtering for observations. The system SHALL parse observation components per IG structure. The system SHALL extract EMS metrics (scene time, transport time, etc.).

**Acceptance Criteria:**
```
Given I fetch observations for a date range
When filtering by PH Road Safety IG observation profile
Then only observations conforming to that profile should be returned

Given an observation with EMS scene and transport times
When processing the observation
Then calculate response interval metrics as defined by IG
```

**References:**
- IG requirement: Section 2.1.3 "Observations"
- New code: Observation utilities in `src/utils/observationProcessor.ts`

---

## MODIFIED Requirements

### Requirement: ENHANCED_ERROR_HANDLING
**Capability:** Robust FHIR Error Handling
#### Scenario: Handle FHIR server errors gracefully with retry logic

**Requirement:** The system SHALL enhance error handling to implement exponential backoff for retries. The system SHALL enhance error handling to distinguish between client errors (4xx) and server errors (5xx). The system SHALL enhance error handling to provide user-friendly error messages via toast notifications. The system SHALL enhance error handling to log detailed error information for debugging.

**Acceptance Criteria:**
```
Given a FHIR request receives a 500 error
When the error occurs
Then retry up to 3 times with exponential backoff

Given a FHIR request receives a 401 authentication error
When the error occurs
Then display authentication error to user and stop retrying

Given network timeout
When timeout occurs
Then retry with increased timeout and inform user of delay
```

**References:**
- Enhances: `src/pages/Index.tsx:39-44`, `src/utils/fhirClient.ts:30-38`
- IG requirement: Section 2.6 "Error Handling & Performance"

---

### Requirement: FHIR_CACHING
**Capability:** FHIR Response Caching
#### Scenario: Cache resolved resources to avoid redundant FHIR calls

**Requirement:** The system SHALL cache resolved Patient resources (already partially implemented). The system SHALL cache ValueSet expansions (repeat lookups). The system SHALL cache encounter aggregations (within reasonable TTL). The system SHALL cache configuration values.

**Acceptance Criteria:**
```
Given a patient reference encountered multiple times in different contexts
When accessing that patient the second time
Then use cached value instead of refetching

Given a ValueSet has been expanded in the last 5 minutes
When the same ValueSet is needed again
Then use cached expansion

Given the date range changes
When query parameters change
Then invalidate cache for affected resources
```

**References:**
- Enhances: `src/utils/fhirClient.ts:113-156` (patient cache)
- New: ValueSet cache implementation
