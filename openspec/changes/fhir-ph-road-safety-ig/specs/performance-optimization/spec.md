# Performance Optimization

## ADDED Requirements

### Requirement: VALUES_CACHING
The system SHALL cache ValueSet expansions (TTL: 5 minutes). The system SHALL cache code lookup results (TTL: 1 hour). The system SHALL cache patient resources (current, enhanced TTL control). The system SHALL cache configuration values (TTL: session duration).

#### Scenario: Cache FHIR terminology resources
**Acceptance Criteria:**
```
Given a ValueSet expansion is performed
When the same ValueSet is needed within 5 minutes
Then return cached value instead of refetching

Given cache TTL expires
When accessing cached value
Then refetch from FHIR server
```

**References:**
- IG requirement: Section 2.6 "Error Handling & Performance"
- New: `src/cache/valueSetCache.ts`

---

### Requirement: BATCH_PATIENT_FETCH
The system SHALL batch patient fetches using `_search` endpoint with `POST` for large patient ID lists. The system SHALL batch patient fetches using maximum batch size of 100 IDs per request. The system SHALL batch patient fetches using parallel batch processing for >100 IDs. The system SHALL batch patient fetches using progress callback for large datasets.

#### Scenario: Fetch multiple patients in a single request
**Acceptance Criteria:**
```
Given 250 patient IDs to resolve from encounters
When resolving patients
Then make 3 batch requests: 100, 100, 50 in parallel

Given a batch request fails
When error occurs
Then retry the failed batch, not all patients
```

**References:**
- FHIR: https://www.hl7.org/fhir/http.html#search
- Enhances: `src/utils/fhirClient.ts:118-149`

---

### Requirement: LAZY_LOADING_CHARTS
The system SHALL implement lazy loading for chart components below the fold. The system SHALL implement lazy loading for data tables with large datasets. The system SHALL implement lazy loading for detailed views hidden behind tabs. The system SHALL implement lazy loading for images or large datasets.

#### Scenario: Defer chart rendering until in viewport
**Acceptance Criteria:**
```
Given a dashboard with multiple chart sections
When user loads the page
Then only render visible charts initially

Given user scrolls down to charts below fold
When they come into viewport
Then fetch data and render charts

Given 1000+ table rows
When viewing encounters table
Then use virtual scrolling or pagination for performance
```

**References:**
- New: React.lazy() with IntersectionObserver
- Library: Consider `react-window` for table virtualization

---

### Requirement: MEMOIZATION
The system SHALL use `React.memo()` for pure chart components. The system SHALL use `useMemo()` for expensive calculations (metrics, groupings). The system SHALL use `useCallback()` for event handlers. The system SHALL optimize recharts with custom `isEqual` comparison.

#### Scenario: Prevent unnecessary re-renders
**Acceptance Criteria:**
```
Given chart data has not changed
When parent component re-renders
Then chart should not re-render

Given metrics calculation returns same result
When dependencies haven't changed
Then use memoized value
```

**References:**
- React docs: https://react.dev/reference/react/memo
- Current: Charts lack memoization in `src/components/dashboard/`

---

### Requirement: DEBOUNCED_SEARCH
The system SHALL debounce search/filter operations with debounce delay of 300ms. The system SHALL debounce search/filter operations to cancel previous in-flight requests. The system SHALL debounce search/filter operations to show "Searching..." indicator during debounce.

#### Scenario: Improve performance of search/filter inputs
**Acceptance Criteria:**
```
Given user types in search field rapidly
When input changes multiple times within 300ms
Then only execute search once after user stops typing

Given debounced search in progress
When user navigates away
Then cancel the pending search request
```

**References:**
- New: `useDebounce()` hook and request cancellation

---

### Requirement: COMPRESSION
The system SHALL include `Accept-Encoding: gzip, deflate` in FHIR requests. The system SHALL handle compressed responses from FHIR server. The system SHALL display compressed vs uncompressed size in debug logs.

#### Scenario: Enable compression for large FHIR responses
**Acceptance Criteria:**
```
Given FHIR server supports gzip compression
When fetching large Bundle
Then receive compressed responses automatically

Given debug logging enabled
When response arrives
Then log: "Received 250KB (compressed from 1.2MB)"
```

**References:**
- HTTP spec: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding
- New: Fetch request headers enhancement

---

### Requirement: BACKGROUND_PREFETCH
The system SHALL prefetch next month's data when viewing current month. The system SHALL prefetch common ValueSets on app load. The system SHALL prefetch patient details when hovering over encounters. The system SHALL prefetch configuration values during idle time.

#### Scenario: Predictively load next data range
**Acceptance Criteria:**
```
Given user views January 2025 data
When January data loads
Then start fetching February data in background

Given user hovers over patient ID for 500ms
When hover occurs
Then fetch patient details

Given app is in idle state
When browser is idle
Then prefetch frequently used ValueSets
```

**References:**
- New: Service worker or background fetch API usage
- Consider: React Query prefetching features

---

### Requirement: WEB_WORKERS
The system SHALL use Web Workers for large dataset aggregations. The system SHALL use Web Workers for complex metrics calculations. The system SHALL use Web Workers for ValueSet expansion processing. The system SHALL use Web Workers for data transformation pipelines.

#### Scenario: Move expensive computations off main thread
**Acceptance Criteria:**
```
Given 10,000+ encounters to process
When calculating metrics
Then use Web Worker to avoid blocking UI thread

Given Web Worker completes calculation
When result is ready
Then update UI with Worker message
```

**References:**
- New: `src/workers/metricsWorker.ts`
- Usage: `src/hooks/useMetricsWorker.ts`

---

### Requirement: BUNDLE_SIZE_OPTIMIZATION
The system SHALL code-split chart components (Recharts). The system SHALL lazy load FHIR utilities. The system SHALL use dynamic imports for less-used features. The system SHALL analyze bundle size with `rollup-plugin-analyzer`.

#### Scenario: Reduce initial bundle size
**Acceptance Criteria:**
```
Given dashboard has multiple chart types
When initial page loads
Then only load Recharts library when first chart renders

Given user never views observation charts
When using the app
Then never download observation chart code

Given build process completes
When analyzing bundle
Then main bundle should be under 500KB (gzipped)
```

**References:**
- Library: Consider `rollup-plugin-analyzer`
- Current: Heavy bundle from Radix UI + shadcn/ui noted in project.md

---

### Requirement: FHIR_SEARCH_OPTIMIZATION
The system SHALL optimize queries to use `_include` and `_revinclude` to fetch related resources. The system SHALL optimize queries to fetch only necessary fields with `_elements`. The system SHALL optimize queries to use `_summary=true` when appropriate. The system SHALL optimize queries to batch multiple queries where possible.

#### Scenario: Reduce FHIR server load
**Acceptance Criteria:**
```
Given fetching encounters and patients
When using `_include=Encounter:patient`
Then receive encounters with patients in same bundle, avoiding 100s of separate patient fetches

Given fetching non-essential fields
When optimizing queries
Then exclude fields like `meta`, `text`, `contained` via `_elements`
```

**References:**
- FHIR: https://www.hl7.org/fhir/search.html#include
- Enhances: All `src/utils/fhirClient.ts` query functions

---

### Requirement: STORAGE_PERSISTENCE
The system SHALL persist to localStorage cached ValueSets (TTL enforced). The system SHALL persist to localStorage user preferences (date ranges, filters). The system SHALL persist to localStorage authentication tokens (secure). The system SHALL persist to localStorage last viewed dashboard data (stale after 1 hour).

#### Scenario: Cache data across browser sessions
**Acceptance Criteria:**
```
Given user sets custom date range
When they refresh the page
Then date range preference is restored from localStorage

Given cache data is older than TTL
When accessing cached data
Then fetch fresh data instead of using stale cache
```

**References:**
- New: `src/storage/localStorage.ts` with TTL management
- Security: Do not persist PII to localStorage

---

## MODIFIED Requirements

### Requirement: PATIENT_CACHE_ENHANCED
The system SHALL enhance patient caching with configurable TTL (default: 10 minutes). The system SHALL enhance patient caching with max cache size (default: 1000 patients). The system SHALL enhance patient caching with LRU eviction when max size reached. The system SHALL enhance patient caching with cache metrics (hit/miss tracking).

#### Scenario: Improve cache efficiency
**Acceptance Criteria:**
```
Given patient cache has 1000 entries
When adding patient #1001
Then remove least recently used patient from cache

Given debug logging enabled
When viewing logs
Then see cache hit ratio and eviction statistics
```

**References:**
- Modifies: `src/utils/fhirClient.ts:113-156`
- New: Cache with metrics tracking

---

### Requirement: REACT_QUERY_PERFORMANCE
The system SHALL tune React Query with default staleTime of 5 minutes. The system SHALL tune React Query with default cacheTime of 10 minutes. The system SHALL tune React Query to not refetch on window focus (for performance). The system SHALL tune React Query to disable default retry (use custom retry logic). The system SHALL tune React Query to enable parallel queries where possible.

#### Scenario: Optimize React Query settings
**Acceptance Criteria:**
```
Given queries for encounters, conditions, observations
When first loading dashboard
Then fetch all three in parallel, not sequentially

Given switching browser tabs and returning
When window regains focus
Then do not automatically refetch data
```

**References:**
- Current: `src/pages/Index.tsx:29-87` uses React Query
- React Query: https://tanstack.com/query/latest/docs/react/guides/important-defaults
