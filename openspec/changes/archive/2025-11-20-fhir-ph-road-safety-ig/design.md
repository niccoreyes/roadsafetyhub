# FHIR PH Road Safety IG Analytics Dashboard - Architecture Design

## Overview

This document describes the architecture for enhancing the existing Road Safety Analytics Dashboard to align with the PH Road Safety Implementation Guide (IG) from HL7 Philippines.

The system currently uses a generic FHIR-based approach. This redesign introduces IG-specific ValueSet-based classification, enhanced error handling, configuration management, and performance optimizations while maintaining backward compatibility.

## Key Architectural Decisions

### 1. ValueSet-Based Classification (vs. Ad-hoc SNOMED)

**Decision:** Replace hardcoded SNOMED code lists with IG-defined ValueSets

**Rationale:**
- Aligns with healthcare interoperability standards
- Allows configuration changes without code deployment
- Supports different FHIR servers with different code systems
- Future-proofs against IG updates

**Trade-offs:**
- ⚖️ Extra ValueSet expansion calls (cached)
- ⚖️ More complex code with Promise-based lookups
- ✅ Better maintainability
- ✅ Standard compliance

**Implementation:**
```typescript
// Before: Hardcoded keywords
const TRAFFIC_KEYWORDS = ["traffic", "transport", "vehic"];

// After: ValueSet-based classification
async function isTrafficAccident(resource: any): Promise<boolean> {
  const valueSet = await resolveValueSet(config.vsTrafficEncounters);
  return resource.code?.coding?.some(coding =>
    valueSet.has(coding.system + '#' + coding.code)
  );
}
```

---

### 2. Configuration Management Pattern

**Decision:** Use React Context + Environment Variables for Configuration

**Rationale:**
- Centralize configuration in one place
- Type-safe configuration with TypeScript
- Runtime configuration changes (React Query invalidation)
- Separation of config from code

**Trade-offs:**
- ⚖️ Adds Context hierarchy complexity
- ⚖️ Need to wrap app with providers
- ✅ Enables environment-specific configs
- ✅ Supports hot-reloading config during development

**Implementation:**
```typescript
// Configuration hierarchy:
// 1. Environment variables (.env file)
// 2. Runtime config (JSON)
// 3. Defaults in code

// Provider pattern:
<FhirConfigProvider>
  <App />
</FhirConfigProvider>

// Usage in components:
const config = useFhirConfig();
```

---

### 3. Caching Strategy

**Decision:** Multi-layer caching approach

**Rationale:**
- FHIR queries can be expensive (network + processing)
- ValueSet expansions rarely change
- Patient data is frequently accessed
- Reduces FHIR server load

**Cache Layers:**
1. **Runtime Cache** (Map): Patient resources, ValueSets (5min TTL)
2. **React Query**: Automatic stale/caching with query keys
3. **Local Storage**: Persist across sessions (user prefs, auth tokens)
4. **Service Worker**: Background prefetching (future enhancement)

**Caching Rules:**
- Patient resources: 10-minute TTL, LRU eviction
- ValueSet expansions: 5-minute TTL (can be stale)
- Query results: Stale after 5 minutes
- User preferences: Persist until cleared

---

### 4. Error Handling Strategy

**Decision:** Layered error handling with graceful degradation

**Rationale:**
- FHIR data quality can be inconsistent
- Network issues are common
- Don't let one component failure crash entire dashboard
- Provide actionable error messages

**Error Layers:**
1. **React Error Boundaries**: Component-level catch
2. **Async/Await try/catch**: Operation-level handling
3. **Network retry**: Exponential backoff for transient errors
4. **User notifications**: Toast messages with actions
5. **Debug logging**: Detailed logs for troubleshooting

**Error Classification:**
- **Authentication (401)**: Stop retries, show login prompt
- **Not found (404)**: Warning only, continue
- **Server error (5xx)**: Retry 3x with backoff
- **Timeout**: Retry with increased timeout
- **Client error (4xx)**: Warning, don't retry

---

### 5. Performance Optimization Patterns

**Decision:** Progressive enhancement with conditional features

**Rationale:**
- Dashboard users have varying device capabilities
- Large datasets (>10k resources) need optimization
- Balance between features and performance
- Measure first, optimize second

**Optimizations:**
- **Essential:**
  - React.memo() for all chart components
  - useMemo() for metrics calculations
  - Basic patient caching

- **Recommended:**
  - ValueSet caching
  - Debounced search
  - Bundle splitting for charts

- **Advanced:**
  - Web Workers for calculations
  - Virtual scrolling for tables
  - Background prefetching
  - Service worker caching

---

## Component Architecture

### High-Level Component Hierarchy

```
App (ErrorBoundary)
└── FhirConfigProvider
    └── DashboardLayout
        ├── Header
        │   ├── DateRangePicker (with config)
        │   └── RefreshButton
        └── DashboardContent
            └── React.Suspense
                ├── MetricsSection (memo)(ErrorBoundary)
                │   └── MetricCard[] (memo)
                ├── ChartsSection (ErrorBoundary)
                │   ├── SexPieChart (lazy)
                │   ├── AgeBarChart (lazy)
                │   ├── InjuryBarChart (lazy)
                │   ├── MortalityPieChart (lazy)
                │   ├── EmsMetricsChart (lazy)
                │   └── TrendsChart (lazy)
                └── TablesSection (ErrorBoundary)
                    ├── EncounterTable (virtual scroll)
                    └── ConditionTable (virtual scroll)
```

### Utility Layer Architecture

```
src/utils/
├── fhirClient.ts          # Core FHIR fetch, pagination
├── fhirAuth.ts            # Authentication logic
├── valueSetResolver.ts    # ValueSet expansion and resolution
├── observationProcessor.ts # EMS observation parsing
├── metricsCalculator.ts   # KPI calculations (enhanced)
├── logger.ts              # Debug logging
├── fhirValidator.ts       # IG profile validation
└── errorHandler.ts        # Error classification

src/cache/
├── patientCache.ts        # Patient resource caching
├── valueSetCache.ts       # ValueSet expansion caching
└── queryCache.ts          # React Query cache helpers

src/config/
├── valueSetConfig.ts      # ValueSet URL mappings
├── fhirConfig.ts          # FHIR server config
└── validation.ts          # Config validation

src/contexts/
└── FhirConfigContext.tsx  # React context for config

src/workers/
└── metricsWorker.ts       # Heavy calculations
```

### Data Flow

```
1. User changes date range
   ↓
2. React Query invalidates cache
   ↓
3. Query functions check runtime cache first
   ↓
4. If miss, check React Query cache
   ↓
5. If miss, fetch from FHIR server with auth
   ↓
6. Process responses: validate, cache, transform
   ↓
7. Calculate metrics (useMemo or Web Worker)
   ↓
8. Update UI with loading → data transition
   ↓
9. Render charts and tables with new data
```

---

## Integration Points

### FHIR Server Integration

**Endpoints:**
- `GET /Encounter?date=ge2024-01-01&date=le2024-12-31&_count=200`
- `GET /Condition?recorded-date=ge2024-01-01&_count=200`
- `GET /Observation?date=ge2024-01-01&_count=200`
- `GET /Patient/_search` (bulk search)
- `GET /ValueSet/$expand?url=http://...` (ValueSet expansion)

**Authentication:**
- Bearer token in Authorization header
- SMART on FHIR context (future enhancement)

**Rate Limiting:**
- Respect server rate limits
- Implement client-side throttling
- Queue requests if needed

### Configuration Integration

**Environment Variables:**
- `VITE_FHIR_BASE_URL`
- `VITE_FHIR_AUTH_TYPE` (none, bearer, oauth)
- `VITE_FHIR_AUTH_TOKEN`
- `VITE_FHIR_VS_TRAFFIC_ENCOUNTER_URL`
- `VITE_FHIR_VS_INJURY_MOI_URL`
- `VITE_LOG_LEVEL`

**Config File (Optional):**
- `public/config.json` for runtime config
- Loaded at app start, merged with env vars
- Enables config changes without rebuild

---

## Security Considerations

### Data Privacy

**Requirements:**
- No patient PII in UI (names, addresses, etc.)
- Only show demographics: age, gender, location
- Anonymize data where possible
- Clear cache on logout/session end
- Do not persist sensitive data to localStorage

**Implementation:**
```typescript
// Only extract safe fields
const patient = {
  id: rawPatient.id,
  gender: rawPatient.gender,
  birthDate: rawPatient.birthDate, // for age only
  // Explicitly NOT including: name, address, telecom
};
```

### Authentication Security

**Requirements:**
- Store tokens in memory (not localStorage)
- Clear tokens on session end
- Validate token expiration
- Use HTTPS only (CSP header)
- Implement CSRF protection if needed

---

## Performance Targets

### Initial Load
- Time to first paint: < 2 seconds
- Time to interactive: < 3 seconds
- Bundle size: < 500KB (gzipped)

### FHIR Queries
- Initial data load: < 10 seconds for typical date range
- Patient resolution: < 1 second per 100 patients
- ValueSet expansion: < 500ms (cached)

### Runtime Performance
- Smooth 60fps scrolling and interactions
- Chart re-render: < 50ms
- Metrics recalculation: < 100ms (or Web Worker)

---

## Future Enhancements (Not in Scope)

1. **FHIR Subscriptions**: Real-time data updates
2. **Export Functionality**: CSV/PDF export of charts/data
3. **Comparative Analysis**: Compare multiple date ranges
4. **Geospatial Visualization**: Map-based accident locations
5. **Advanced Filtering**: Multi-select filters, saved filter sets
6. **Print Optimization**: Dashboard print stylesheet
7. **Accessibility Audit**: Screen reader, keyboard navigation testing
8. **Service Worker**: Offline support and background sync

---

## Deployment Considerations

### Environment Configuration

**Development:**
- `.env.development` with test FHIR server
- Debug logging enabled
- Source maps enabled
- Hot module replacement

**Production:**
- `.env.production` with production FHIR server
- Debug logging disabled
- Minified bundle
- Error tracking (e.g., Sentry)

### CI/CD Pipeline

**Steps:**
1. TypeScript compilation check
2. ESLint validation
3. Build production bundle
4. Bundle size analysis
5. OpenSpec validation
6. Deployment to CDN/hosting
7. Integration tests against FHIR server

---

## Success Metrics

**Technical:**
- 95th percentile FHIR query time < 5 seconds
- Bundle size < 500KB gzipped
- Lighthouse performance score > 90
- Test coverage > 80%

**User Experience:**
- Users can configure FHIR server URL successfully
- Dashboard loads and displays accurate IG-aligned metrics
- Charts render correctly with IG ValueSet categories
- Error messages are clear and actionable
- Performance is acceptable for typical data volumes

---

## References

- PH Road Safety IG: https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/
- FHIR Specification: http://hl7.org/fhir/R4/
- React Best Practices: https://react.dev/learn/render-and-commit
- Performance Optimization: https://web.dev/learn/performance/
