# Tasks: Count Patient Outcomes by Observation Resource

## Implementation Tasks

### 1. Add Configuration for Observation Outcome ValueSet
- [x] Update `src/config/valueSetConfig.ts`
  - [x] Add `observationOutcomeValueSetUrl` to `ValueSetConfig` interface
  - [x] Add config value with profile URL
  - [x] Add environment variable support if desired

### 2. Implement Observation-Based Outcome Detection
- [x] Create new function `checkOutcomeStatus()` in `metricsCalculator.ts`
  - [x] Accept observations array, encounterId, patientId
  - [x] Filter observations by profile and SNOMED code
  - [x] Check valueCodeableConcept for death indicators
  - [x] Return boolean indicating if patient died

### 3. Update Existing isExpired() Function
- [x] Modify signature to include optional observations parameter
  - [x] `isExpired(encounter: any, observations?: any[]): Promise<boolean>`
  - [x] Add logic to check observations first
  - [x] Fallback to discharge disposition if observations unavailable
  - [x] Add console warnings for fallbacks

### 4. Update calculateMetrics() Signature and Logic
- [x] Add `observations` parameter to function signature
  - [x] `observations: any[] = []` with default empty array
  - [x] Pass observations to death status checks
  - [x] Pre-filter observations for performance optimization
  - [x] Update JSDoc comments

### 5. Update Dashboard Page and Data Loading
- [x] Check if observations already loaded in FhirConfigContext
- [x] If not, add observations loading logic
  - [x] Add observations to useQuery hook
  - [x] Pass observations to calculateMetrics()
  - [x] Update loading states and error handling

### 6. Update Component Data Flow
- [x] Update components that call calculateMetrics()
  - [x] `src/pages/IndexPage.tsx` or main dashboard
  - [x] Any other metrics consumers
  - [x] Ensure observations are passed through the call chain

### 7. Add Comprehensive Testing
- [x] Create test cases for `checkOutcomeStatus()`
  - [x] Test with death outcome Observation
  - [x] Test with alive outcome Observation (SNOMED code 268910001)
  - [x] Test with missing observations (fallback scenario)
  - [x] Test with invalid observation structures

- [x] Update existing `isExpired()` tests in `metricsCalculator.test.ts`
  - [x] Add tests for observations parameter
  - [x] Test fallback logic

- [x] Update `calculateMetrics()` tests
  - [x] Add observations parameter to test calls
  - [x] Verify death counts with observation data

### 8. Create Mock Data for Testing
- [x] Add Observation resources to mock data
  - [x] Follow PH Road Safety IG profile structure
  - [x] Include both 'DIED' and 'Improved' outcomes
  - [x] Link to existing test encounters and patients

### 9. Update Documentation
- [x] Update code comments in `metricsCalculator.ts`
  - [x] Document new function parameters
  - [x] Add examples of observation structure
  - [x] Document fallback behavior

- [x] Update README or API documentation
  - [x] Explain the change from discharge disposition to observations
  - [x] Document Observation profile requirements

### 10. Validation and Testing
- [x] Run existing test suite
  - [x] Ensure all tests pass
  - [x] Verify backward compatibility

- [x] Manual testing in development environment
  - [x] Load dashboard with observation data
  - [x] Verify mortality metrics display correctly
  - [x] Test fallback scenarios

- [x] Build verification
  - [x] `npm run build` completes without errors
  - [x] No TypeScript type errors

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
- [x] Observation resources with correct profile are properly detected
- [x] Death counts match expected values from observations
- [x] Dashboard displays correct mortality, case fatality, and fatality metrics
- [x] Graceful fallback to discharge disposition when observations unavailable
- [x] All tests pass with new implementation
- [x] No console errors or warnings in production build
