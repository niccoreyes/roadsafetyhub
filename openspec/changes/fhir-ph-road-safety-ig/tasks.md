# Implementation Tasks: FHIR PH Road Safety IG Analytics Dashboard

## Phase 1: Foundation & Configuration (3-5 days)

### 1.1 Configuration Management Setup

- [ ] **Task:** Create FhirConfigContext.tsx
  - [ ] Define Config interface with types
  - [ ] Implement Context provider with defaults
  - [ ] Add configuration validation
  - [ ] Export useFhirConfig hook

- [ ] **Task:** Setup environment variable configuration
  - [ ] Create `.env.example` file
  - [ ] Document all configuration options in README
  - [ ] Add to `.gitignore`: `.env.local`, `.env.production.local`

- [ ] **Task:** Create valueSetConfig.ts
  - [ ] Map PH Road Safety IG ValueSet URLs
  - [ ] Add fallback URLs for different IG versions
  - [ ] Document each ValueSet purpose

### 1.2 Core FHIR Client Enhancement

- [ ] **Task:** Enhance fhirClient.ts with configurable base URL
  - [ ] Replace hardcoded URL with config parameter
  - [ ] Support environment variable override
  - [ ] Support runtime config changes

- [ ] **Task:** Implement ValueSet resolution functions
  - [ ] Write resolveValueSet() to fetch expansions
  - [ ] Implement caching with 5-minute TTL
  - [ ] Add error handling for missing ValueSets
  - [ ] Add debug logging

- [ ] **Task:** Add Observable implementation
  - [ ] Write fetchObservations() with date filter
  - [ ] Add support for IG-defined observation profiles
  - [ ] Implement parsing logic for EMS metrics

## Phase 2: ValueSet-Based Classification (4-6 days)

### 2.1 Update Encounter Classification

- [ ] **Task:** Create valueSetBasedClassifier.ts
  - [ ] Write isTrafficAccident() using ValueSets
  - [ ] Write classifyEncounter() for IG-aligned types
  - [ ] Add unit tests for classification logic
  - [ ] Document classification rules

- [ ] **Task:** Update Index.tsx to use ValueSet classification
  - [ ] Replace snomedMapping.ts with valueSetBasedClassifier
  - [ ] Verify pagination works with ValueSet queries
  - [ ] Test with sample FHIR data

### 2.2 Update Condition Classification

- [ ] **Task:** Implement MOI ValueSet classification
  - [ ] Write classifyCondition() using MOI ValueSet
  - [ ] Group conditions by IG-defined MOI categories
  - [ ] Update InjuryBarChart to use new categories

- [ ] **Task:** Update InjuryBarChart component
  - [ ] Support dynamic MOI categories from ValueSet
  - [ ] Display counts and percentages
  - [ ] Add hover tooltips

## Phase 3: Dashboard Visualizations Update (4-5 days)

### 3.1 Metric Cards Enhancement

- [ ] **Task:** Update metric calculation functions
  - [ ] Revise calculateMetrics() for IG-aligned KPIs
  - [ ] Add EMS metrics calculation (response times)
  - [ ] Support configuration-based denominators
  - [ ] Add unit tests for new metrics

- [ ] **Task:** Enhance MetricCard component
  - [ ] Support different metric types (percentage, count, rate)
  - [ ] Improve loading states
  - [ ] Add trend indicators (up/down arrows)

### 3.2 New Chart Components

- [ ] **Task:** Create EmsMetricsChart.tsx
  - [ ] Display response time statistics
  - [ ] Show average, median, min, max
  - [ ] Use bar chart for visualization

- [ ] **Task:** Create TrendsChart.tsx
  - [ ] Implement line chart for time-based data
  - [ ] Aggregate by month/week based on date range
  - [ ] Show multiple metrics on same chart
  - [ ] Add legend and tooltips

### 3.3 Chart Enhancements

- [ ] **Task:** Add interactive features to charts
  - [ ] Implement onClick handlers
  - [ ] Add hover tooltips with details
  - [ ] Add drill-down to detailed tables

- [ ] **Task:** Update AgeBarChart for IG-aligned groups
  - [ ] Read age groups from configuration
  - [ ] Support standard FHIR age bands
  - [ ] Update labels and legends

## Phase 4: Error Handling (3-4 days)

### 4.1 Error Boundary Implementation

- [ ] **Task:** Create ErrorBoundary.tsx component
  - [ ] Implement getDerivedStateFromError
  - [ ] Create fallback UI with error details
  - [ ] Add "Retry" button
  - [ ] Log errors to console (dev) or error service (prod)

- [ ] **Task:** Wrap dashboard components
  - [ ] Add ErrorBoundary around MetricsSection
  - [ ] Add ErrorBoundary around ChartsSection
  - [ ] Add ErrorBoundary around TablesSection

### 4.2 Retry Logic Implementation

- [ ] **Task:** Implement retry logic in fhirClient
  - [ ] Add exponential backoff function
  - [ ] Distinguish retryable vs non-retryable errors
  - [ ] Add max retry attempts limit
  - [ ] Test with simulated failures

- [ ] **Task:** Enhance toast notifications
  - [ ] Add action buttons (Retry, Dismiss, View details)
  - [ ] Queue multiple notifications
  - [ ] Auto-dismiss success messages

### 4.3 Data Validation

- [ ] **Task:** Create fhirValidator.ts
  - [ ] Write FHIR resource validation functions
  - [ ] Validate against IG profiles
  - [ ] Log warnings for missing optional fields
  - [ ] Return validation reports

- [ ] **Task:** Integrate validation into data pipeline
  - [ ] Validate encounters before processing
  - [ ] Validate conditions before classification
  - [ ] Log validation errors for debugging

## Phase 5: Performance Optimization (4-5 days)

### 5.1 Caching Implementation

- [ ] **Task:** Create patientCache.ts with TTL
  - [ ] Add 10-minute TTL for cached patients
  - [ ] Implement LRU eviction (max 1000 entries)
  - [ ] Add cache hit/miss metrics
  - [ ] Test cache behavior

- [ ] **Task:** Create valueSetCache.ts
  - [ ] Implement 5-minute TTL for ValueSets
  - [ ] Store expanded values and metadata
  - [ ] Add cache invalidation

### 5.2 Batch Patient Fetch

- [ ] **Task:** Implement batch patient resolution
  - [ ] Modify resolvePatients() to batch requests
  - [ ] Use POST /Patient/_search endpoint
  - [ ] Batch in groups of 100
  - [ ] Handle partial failures

### 5.3 Memoization and Code Splitting

- [ ] **Task:** Add React.memo to chart components
  - [ ] Wrap SexPieChart, AgeBarChart, InjuryBarChart
  - [ ] Wrap MortalityPieChart
  - [ ] Add useMemo to expensive calculations

- [ ] **Task:** Implement lazy loading
  - [ ] Use React.lazy() for chart components
  - [ ] Create Suspense wrappers
  - [ ] Lazy load FHIR utilities

## Phase 6: Configuration and Documentation (2-3 days)

### 6.1 Configuration Files

- [ ] **Task:** Create .env.example
  - [ ] Document all environment variables
  - [ ] Add comments explaining each setting
  - [ ] Include example values

- [ ] **Task:** Create runtime config JSON loader
  - [ ] Load config from public/config.json
  - [ ] Merge with environment variables
  - [ ] Handle loading states

### 6.2 Documentation

- [ ] **Task:** Update README.md
  - [ ] Document configuration options
  - [ ] Explain FHIR server setup
  - [ ] Describe ValueSet mapping
  - [ ] Add build and run instructions
  - [ ] Add troubleshooting section

- [ ] **Task:** Create API documentation
  - [ ] Document fhirClient functions
  - [ ] Document configuration interface
  - [ ] Create component prop documentation
  - [ ] Add FHIR ValueSet documentation

### 6.3 Testing and Validation

- [ ] **Task:** Write unit tests for fhirClient
  - [ ] Test pagination logic
  - [ ] Test error handling
  - [ ] Test retry logic
  - [ ] Mock FHIR server responses

- [ ] **Task:** Implement integration tests
  - [ ] Test full dashboard load flow
  - [ ] Test chart rendering
  - [ ] Test error scenarios

## Phase 7: Integration and Validation (2-3 days)

### 7.1 Integration Testing

- [ ] **Task:** Test with CDR FHIRLab server
  - [ ] Verify all queries work with real data
  - [ ] Test pagination with large datasets
  - [ ] Verify ValueSet resolution
  - [ ] Performance testing

- [ ] **Task:** Validate IG compliance
  - [ ] Verify ValueSet-based classification
  - [ ] Check metrics align with IG KPIs
  - [ ] Review chart categories match IG

### 7.2 OpenSpec Validation

- [ ] **Task:** Run openspec validate
  - [ ] Fix any validation errors
  - [ ] Ensure all requirements have scenarios
  - [ ] Verify cross-references

- [ ] **Task:** Code review
  - [ ] Review TypeScript types
  - [ ] Review error handling
  - [ ] Review performance implications

### 7.3 Polish and Refine

- [ ] **Task:** UI/UX polish
  - [ ] Review loading states
  - [ ] Review error messages
  - [ ] Test responsive design
  - [ ] Accessibility review

## Phase 8: Deployment (1 day)

### 8.1 Production Build

- [ ] **Task:** Configure production build
  - [ ] Set VITE_LOG_LEVEL=warn
  - [ ] Enable minification
  - [ ] Analyze bundle size

- [ ] **Task:** Create deployment documentation
  - [ ] Document build process
  - [ ] Document environment setup
  - [ ] Create deployment checklist

## Timeline Estimate

| Phase | Duration | Key Deliverables |
|-------|----------|------------------|
| Phase 1: Foundation | 3-5 days | Configuration system, enhanced FHIR client |
| Phase 2: ValueSet Classification | 4-6 days | ValueSet-based encounter/condition classification |
| Phase 3: Visualizations | 4-5 days | Updated metrics, new charts, enhanced interactivity |
| Phase 4: Error Handling | 3-4 days | Error boundaries, retry logic, validation |
| Phase 5: Performance | 4-5 days | Caching, batching, memoization |
| Phase 6: Config & Docs | 2-3 days | .env.example, README, API docs |
| Phase 7: Integration & Validation | 2-3 days | Testing, OpenSpec validation, polish |
| Phase 8: Deployment | 1 day | Production build, deployment |

**Total Estimated Time:** 23-32 days (4.5-6.5 weeks)

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| PH Road Safety IG ValueSets not accessible | Medium | Implement fallback code-based classification |
| Large FHIR datasets cause performance issues | High | Implement Web Workers, pagination, virtual scrolling |
| Configuration complexity is confusing | Low | Provide extensive documentation and examples |
| Authentication flow breaks | Medium | Implement comprehensive error messages and fallbacks |

## Dependencies

- React 18.3.1 + TypeScript 5.8.3 (existing)
- @tanstack/react-query 5.83.0 (existing)
- Recharts 2.15.4 (existing)
- Vite 5.4.19 (existing)
- Additional: smart-app-launch if implementing OAuth (optional)

## Completion Criteria

- ✅ All tasks completed and marked as done
- ✅ All requirements validated with OpenSpec (openspec validate --strict passes)
- ✅ All TypeScript compilation errors resolved
- ✅ All linting errors resolved
- ✅ Unit tests written and passing for utility functions
- ✅ Integration tests pass with CDR FHIRLab server
- ✅ Documentation complete and accurate
- ✅ Performance targets met (bundle size, load times)
- ✅ Code review completed
- ✅ PR approved and merged using /openspec:apply
