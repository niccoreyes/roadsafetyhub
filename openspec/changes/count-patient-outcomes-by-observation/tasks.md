# Tasks: Count Patient Outcomes by Observation Resource

## Implementation Tasks

### 1. Add Configuration for Observation Outcome ValueSet
- [ ] Update `src/config/valueSetConfig.ts`
  - [ ] Add `observationOutcomeValueSetUrl` to `ValueSetConfig` interface
  - [ ] Add config value with profile URL
  - [ ] Add environment variable support if desired

### 2. Implement Observation-Based Outcome Detection
- [ ] Create new function `checkOutcomeStatus()` in `metricsCalculator.ts`
  - [ ] Accept observations array, encounterId, patientId
  - [ ] Filter observations by profile and SNOMED code
  - [ ] Check valueCodeableConcept for death indicators
  - [ ] Return boolean indicating if patient died

### 3. Update Existing isExpired() Function
- [ ] Modify signature to include optional observations parameter
  - [ ] `isExpired(encounter: any, observations?: any[]): Promise<boolean>`
  - [ ] Add logic to check observations first
  - [ ] Fallback to discharge disposition if observations unavailable
  - [ ] Add console warnings for fallbacks

### 4. Update calculateMetrics() Signature and Logic
- [ ] Add `observations` parameter to function signature
  - [ ] `observations: any[] = []` with default empty array
  - [ ] Pass observations to death status checks
  - [ ] Pre-filter observations for performance optimization
  - [ ] Update JSDoc comments

### 5. Update Dashboard Page and Data Loading
- [ ] Check if observations already loaded in FhirConfigContext
- [ ] If not, add observations loading logic
  - [ ] Add observations to useQuery hook
  - [ ] Pass observations to calculateMetrics()
  - [ ] Update loading states and error handling

### 6. Update Component Data Flow
- [ ] Update components that call calculateMetrics()
  - [ ] `src/pages/IndexPage.tsx` or main dashboard
  - [ ] Any other metrics consumers
  - [ ] Ensure observations are passed through the call chain

### 7. Add Comprehensive Testing
- [ ] Create test cases for `checkOutcomeStatus()`
  - [ ] Test with death outcome Observation
  - [ ] Test with alive outcome Observation (SNOMED code 268910001)
  - [ ] Test with missing observations (fallback scenario)
  - [ ] Test with invalid observation structures

- [ ] Update existing `isExpired()` tests in `metricsCalculator.test.ts`
  - [ ] Add tests for observations parameter
  - [ ] Test fallback logic

- [ ] Update `calculateMetrics()` tests
  - [ ] Add observations parameter to test calls
  - [ ] Verify death counts with observation data

### 8. Create Mock Data for Testing
- [ ] Add Observation resources to mock data
  - [ ] Follow PH Road Safety IG profile structure
  - [ ] Include both 'DIED' and 'Improved' outcomes
  - [ ] Link to existing test encounters and patients

### 9. Update Documentation
- [ ] Update code comments in `metricsCalculator.ts`
  - [ ] Document new function parameters
  - [ ] Add examples of observation structure
  - [ ] Document fallback behavior

- [ ] Update README or API documentation
  - [ ] Explain the change from discharge disposition to observations
  - [ ] Document Observation profile requirements

### 10. Validation and Testing
- [ ] Run existing test suite
  - [ ] Ensure all tests pass
  - [ ] Verify backward compatibility

- [ ] Manual testing in development environment
  - [ ] Load dashboard with observation data
  - [ ] Verify mortality metrics display correctly
  - [ ] Test fallback scenarios

- [ ] Build verification
  - [ ] `npm run build` completes without errors
  - [ ] No TypeScript type errors

## Dependencies

**Prerequisites:**
- Patient deduplication by identifier (change `deduplicate-patients-by-identifier`) ✓ Completed

**Parallelizable Tasks:**
- Configuration changes (Task 1)
- Testing infrastructure (Tasks 7-8)
- Documentation updates (Task 9)

**Sequential Dependencies:**
- Task 2 depends on Task 1 (configuration)
- Task 3 depends on Task 2 (helper function)
- Task 4 depends on Tasks 2-3 (integration)
- Task 5 depends on Task 4 (data loading)
- Task 6 depends on Task 5 (component updates)

## Success Criteria
- [ ] Observation resources with correct profile are properly detected
- [ ] Death counts match expected values from observations
- [ ] Dashboard displays correct mortality, case fatality, and fatality metrics
- [ ] Graceful fallback to discharge disposition when observations unavailable
- [ ] All tests pass with new implementation
- [ ] No console errors or warnings in production build
