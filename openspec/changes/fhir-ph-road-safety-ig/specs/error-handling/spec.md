# Error Handling and Performance

## ADDED Requirements

#### Requirement: FHIR_ERROR_BOUNDARY
**Capability:** Error Boundary for FHIR Components 
#### Scenario: Prevent crashes from FHIR data parsing errors

**Requirement:** The system SHALL implement React error boundaries around:
- Dashboard component
- Individual chart components
- Data tables
- FHIR fetch operations

**Acceptance Criteria:**
```
Given malformed FHIR data causes a JavaScript error
When the error boundary catches it
Then display fallback UI with error message instead of crashing

Given a chart component fails to render due to missing data
When the error occurs
Then show "Data unavailable" message in place of chart
```

**References:**
- React docs: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
- New: `src/components/error/ErrorBoundary.tsx`

---

#### Requirement: FETCH_RETRY_LOGIC
**Capability:** Exponential Backoff Retry 
#### Scenario: Automatically retry failed FHIR requests

**Requirement:** The system SHALL implement exponential backoff for failed requests:
- Base retry delay: 1 second
- Maximum retry attempts: 3
- Jitter to prevent thundering herd
- Distinguish retryable vs non-retryable errors

**Acceptance Criteria:**
```
Given a FHIR request fails with 502 Bad Gateway
When retry logic triggers
Then retry after 1s, 2s, 4s delays

Given a FHIR request fails with 401 Unauthorized
When retry logic evaluates error
Then halt retries and display auth error
```

**References:**
- IG requirement: Section 2.6 "Error Handling & Performance"
- New: Enhanced `src/utils/fhirClient.ts:61-63`

---

#### Requirement: USER_ERROR_MESSAGES
**Capability:** User-Friendly Error Messages 
#### Scenario: Display meaningful errors to end users

**Requirement:** The system SHALL provide user-friendly error messages for:
- Network timeouts
- Authentication failures
- FHIR server errors
- Missing data
- Unsupported features

**Acceptance Criteria:**
```
Given FHIR server returns 503 Service Unavailable
When error occurs
Then display: "The FHIR server is temporarily unavailable. Please try again in a few minutes."

Given a timeout occurs after 3 retry attempts
When finally failing
Then display: "Network timeout. Check your connection or try again later."
```

**References:**
- Current: `src/pages/Index.tsx:39-44` (basic error toasts)
- New: Centralized error message catalog in `src/utils/errorMessages.ts`

---

#### Requirement: PARTIAL_DATA_HANDLING
**Capability:** Graceful Partial Data Handling 
#### Scenario: Handle missing or incomplete FHIR data

**Requirement:** The system SHALL gracefully handle:
- Missing patient references in encounters
- Conditions/observations without codes
- Incomplete observation components
- Missing ValueSet expansions
- Null value handling in charts

**Acceptance Criteria:**
```
Given an encounter has no subject reference
When processing encounters
Then skip or flag it as "Unknown patient" without crashing

Given a condition has no code field
When calculating injury classifications
Then categorize as "Unspecified injury"

Given an observation has null effectiveDateTime
When sorting by date
Then place at end of list or filter out, not crash
```

**References:**
- IG requirement: Section 2.6 "Error Handling & Performance"
- Enhances: All data processing utilities

---

#### Requirement: LOGGING_FRAMEWORK
**Capability:** Debug Logging Framework 
#### Scenario: Enable detailed logging for troubleshooting

**Requirement:** The system SHALL implement debug logging with levels:
- ERROR: Unexpected failures
- WARN: Data quality issues, deprecated features
- INFO: Normal operations (FHIR queries, cache hits/misses)
- DEBUG: Detailed request/response data
- Configurable via environment variable: `VITE_LOG_LEVEL`

**Acceptance Criteria:**
```
Given VITE_LOG_LEVEL=debug
When the application makes FHIR requests
Then log request URLs, response times, and cache status

Given production build with VITE_LOG_LEVEL=warn
When the application runs
Then only log warnings and errors (no debug/info)
```

**References:**
- New: `src/utils/logger.ts` with console abstraction

---

#### Requirement: SKELETON_LOADING_ENHANCED
**Capability:** Enhanced Loading States 
#### Scenario: Provide better loading feedback for slow operations

**Requirement:** The system SHALL enhance skeleton loaders to show:
- Loading stage (e.g., "Fetching encounters...", "Resolving patients...")
- Progress indication when known
- Partial loading (show available data while loading rest)
- Animated placeholders matching chart layouts

**Acceptance Criteria:**
```
Given a slow FHIR query taking 10+ seconds
When data is loading
Then display loading text indicating current stage

Given encounters are loaded but patients still loading
When viewing the dashboard
Then show encounters table with patient columns as "Loading..."
```

**References:**
- Current: Basic isLoading flags in `src/pages/Index.tsx:91`
- New: Progressive loading state management

---

## MODIFIED Requirements

#### Requirement: TOAST_NOTIFICATIONS_ENHANCED
**Capability:** Enhanced Toast Notifications 
#### Scenario: Better error and success notifications

**Requirement:** The system SHALL enhance toast notifications to:
- Support different variants (success, error, warning, info)
- Include action buttons (e.g., "Retry", "View details")
- Auto-dismiss appropriate messages
- Queue multiple notifications
- Include error codes/tracing for support

**Acceptance Criteria:**
```
Given a FHIR fetch fails
When displaying error toast
Then include "Retry" button that re-runs the fetch

Given multiple errors occur in sequence
When toasts are displayed
Then queue them with appropriate delays between dismissals
```

**References:**
- Current: `src/hooks/use-toast.ts:1-191`
- New: Enhanced toast provider with action support

---

#### Requirement: DATA_VALIDATION
**Capability:** FHIR Data Validation 
#### Scenario: Validate FHIR resources against IG profiles

**Requirement:** The system SHALL validate FHIR resources received from server:
- Check required fields per IG profiles
- Validate code values are from expected ValueSets
- Warn on missing optional but recommended fields
- Schema validation for structure

**Acceptance Criteria:**
```
Given an encounter missing required dischargeDisposition
When validating
Then log a warning but don't crash

Given a condition with a code not in IG ValueSet
When validating
Then log Level.WARN with details but process anyway
```

**References:**
- IG validation: Optional best practice, not blocking
- New: `src/utils/fhirValidator.ts` with validation rules
