# Performance Optimization

## ADDED Requirements

#### Requirement: VALUES_CACHING
**Capability:** ValueSet and Code System Caching 
#### Scenario: Cache FHIR terminology resources

**Requirement:** The system SHALL cache:
- ValueSet expansions (TTL: 5 minutes)
- Code lookup results (TTL: 1 hour)
- Patient resources (current, enhanced TTL control)
- Configuration values (TTL: session duration)

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

#### Requirement: BATCH_PATIENT_FETCH
**Capability:** Batch Patient Resolution 
#### Scenario: Fetch multiple patients in a single request

**Requirement:** The system SHALL batch patient fetches using:
- `_search` endpoint with `POST` for large patient ID lists
- Maximum batch size: 100 IDs per request
- Parallel batch processing for >100 IDs
- Progress callback for large datasets

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

#### Requirement: LAZY_LOADING_CHARTS
**Capability:** Lazy Chart Loading 
#### Scenario: Defer chart rendering until in viewport

**Requirement:** The system SHALL implement lazy loading for:
- Chart components below the fold
- Data tables with large datasets
- Detailed views hidden behind tabs
- Images or large datasets

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

#### Requirement: MEMOIZATION
**Capability:** React Component Memoization 
#### Scenario: Prevent unnecessary re-renders

**Requirement:** The system SHALL use:
- `React.memo()` for pure chart components
- `useMemo()` for expensive calculations (metrics, groupings)
- `useCallback()` for event handlers
- Optimize recharts with custom `isEqual` comparison

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

#### Requirement: DEBOUNCED_SEARCH
**Capability:** Debounced Filter Search 
#### Scenario: Improve performance of search/filter inputs

**Requirement:** The system SHALL debounce search/filter operations:
- Debounce delay: 300ms
- Cancel previous in-flight requests
- Show "Searching..." indicator during debounce

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

#### Requirement: COMPRESSION
**Capability:** Response Compression 
#### Scenario: Enable compression for large FHIR responses

**Requirement:** The system SHALL:
- Include `Accept-Encoding: gzip, deflate` in FHIR requests
- Handle compressed responses from FHIR server
- Display compressed vs uncompressed size in debug logs

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

#### Requirement: BACKGROUND_PREFETCH
**Capability:** Background Data Prefetching 
#### Scenario: Predictively load next data range

**Requirement:** The system SHALL prefetch:
- Next month's data when viewing current month
- Common ValueSets on app load
- Patient details when hovering over encounters
- Configuration values during idle time

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

#### Requirement: WEB_WORKERS
**Capability:** Web Worker for Heavy Calculations 
#### Scenario: Move expensive computations off main thread

**Requirement:** The system SHALL use Web Workers for:
- Large dataset aggregations
- Complex metrics calculations
- ValueSet expansion processing
- Data transformation pipelines

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

#### Requirement: BUNDLE_SIZE_OPTIMIZATION
**Capability:** Code Splitting and Bundle Optimization 
#### Scenario: Reduce initial bundle size

**Requirement:** The system SHALL:
- Code-split chart components (Recharts)
- Lazy load FHIR utilities
- Use dynamic imports for less-used features
- Analyze bundle size with `rollup-plugin-analyzer`

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

#### Requirement: FHIR_SEARCH_OPTIMIZATION
**Capability:** Optimized FHIR Search Queries 
#### Scenario: Reduce FHIR server load

**Requirement:** The system SHALL optimize queries:
- Use `_include` and `_revinclude` to fetch related resources
- Fetch only necessary fields with `_elements`
- Use `_summary=true` when appropriate
- Batch multiple queries where possible

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

#### Requirement: STORAGE_PERSISTENCE
**Capability:** Local Storage Persistence 
#### Scenario: Cache data across browser sessions

**Requirement:** The system SHALL persist to localStorage:
- Cached ValueSets (TTL enforced)
- User preferences (date ranges, filters)
- Authentication tokens (secure)
- Last viewed dashboard data (stale after 1 hour)

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

#### Requirement: PATIENT_CACHE_ENHANCED
**Capability:** Enhanced Patient Caching 
#### Scenario: Improve cache efficiency

**Requirement:** The system SHALL enhance patient caching:
- Configurable TTL (default: 10 minutes)
- Max cache size (default: 1000 patients)
- LRU eviction when max size reached
- Cache metrics (hit/miss tracking)

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

#### Requirement: REACT_QUERY_PERFORMANCE
**Capability:** React Query Performance Tuning 
#### Scenario: Optimize React Query settings

**Requirement:** The system SHALL tune React Query:
- Default staleTime: 5 minutes
- Default cacheTime: 10 minutes
- Refetch on window focus: false (for performance)
- Retry: false (use custom retry logic)
- Parallel queries where possible

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
