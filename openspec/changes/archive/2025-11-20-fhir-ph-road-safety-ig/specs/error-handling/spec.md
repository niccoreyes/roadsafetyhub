# Error Handling and Performance

## ADDED Requirements

### Requirement: FHIR_ERROR_BOUNDARY
The system SHALL implement React error boundaries around dashboard component. The system SHALL implement React error boundaries around individual chart components. The system SHALL implement React error boundaries around data tables. The system SHALL implement React error boundaries around FHIR fetch operations.

#### Scenario: Prevent crashes from FHIR data parsing errors
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

### Requirement: FETCH_RETRY_LOGIC
The system SHALL implement exponential backoff for failed requests with base retry delay of 1 second. The system SHALL implement exponential backoff for failed requests with maximum retry attempts of 3. The system SHALL implement exponential backoff for failed requests with jitter to prevent thundering herd. The system SHALL implement exponential backoff for failed requests to distinguish retryable vs non-retryable errors.

#### Scenario: Automatically retry failed FHIR requests
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

### Requirement: USER_ERROR_MESSAGES
The system SHALL provide user-friendly error messages for network timeouts. The system SHALL provide user-friendly error messages for authentication failures. The system SHALL provide user-friendly error messages for FHIR server errors. The system SHALL provide user-friendly error messages for missing data. The system SHALL provide user-friendly error messages for unsupported features.

#### Scenario: Display meaningful errors to end users
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

### Requirement: PARTIAL_DATA_HANDLING
The system SHALL gracefully handle missing patient references in encounters. The system SHALL gracefully handle conditions/observations without codes. The system SHALL gracefully handle incomplete observation components. The system SHALL gracefully handle missing ValueSet expansions. The system SHALL gracefully handle null value handling in charts.

#### Scenario: Handle missing or incomplete FHIR data
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

### Requirement: LOGGING_FRAMEWORK
The system SHALL implement debug logging with ERROR level for unexpected failures. The system SHALL implement debug logging with WARN level for data quality issues, deprecated features. The system SHALL implement debug logging with INFO level for normal operations (FHIR queries, cache hits/misses). The system SHALL implement debug logging with DEBUG level for detailed request/response data. The system SHALL make debug logging configurable via environment variable: `VITE_LOG_LEVEL`.

#### Scenario: Enable detailed logging for troubleshooting
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

### Requirement: SKELETON_LOADING_ENHANCED
The system SHALL enhance skeleton loaders to show loading stage (e.g., "Fetching encounters...", "Resolving patients..."). The system SHALL enhance skeleton loaders to show progress indication when known. The system SHALL enhance skeleton loaders to show partial loading (show available data while loading rest). The system SHALL enhance skeleton loaders to show animated placeholders matching chart layouts.

#### Scenario: Provide better loading feedback for slow operations
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

### Requirement: TOAST_NOTIFICATIONS_ENHANCED
The system SHALL enhance toast notifications to support different variants (success, error, warning, info). The system SHALL enhance toast notifications to include action buttons (e.g., "Retry", "View details"). The system SHALL enhance toast notifications to auto-dismiss appropriate messages. The system SHALL enhance toast notifications to queue multiple notifications. The system SHALL enhance toast notifications to include error codes/tracing for support.

#### Scenario: Better error and success notifications
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

### Requirement: DATA_VALIDATION
The system SHALL validate FHIR resources received from server to check required fields per IG profiles. The system SHALL validate FHIR resources received from server to validate code values are from expected ValueSets. The system SHALL validate FHIR resources received from server to warn on missing optional but recommended fields. The system SHALL validate FHIR resources received from server to perform schema validation for structure.

#### Scenario: Validate FHIR resources against IG profiles
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
