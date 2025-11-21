# Tasks: Use FHIR Endpoint for Mortality Counting

## Implementation Tasks

### 1. Update fetchObservationsByConcept Function
- [x] Modify `src/utils/fhirClient.ts`
  - [x] Update fetchObservationsByConcept to use the correct query parameters for the FHIR endpoint
  - [x] Ensure it queries `https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED` format
  - [x] Add proper error handling for the specific endpoint
  - [x] Add logging for debugging purposes

### 2. Update Metrics Calculator Logic
- [x] Update `calculateMetrics` function in `metricsCalculator.ts`
  - [x] Modify to use observations from the dedicated endpoint for mortality counting
  - [x] Ensure mortality rate calculation properly uses the new observation data
  - [x] Update case fatality rate calculation to use the new data
  - [x] Update total fatalities count to use the new approach
  - [x] Ensure patient deduplication logic remains intact

### 3. Update Patient Deduplication Logic
- [x] Review and update patient deduplication logic for mortality counting
  - [x] Ensure each unique patient is counted only once for mortality metrics
  - [x] Verify that the patient deduplication works with the new endpoint data
  - [x] Update any functions that depend on patient identification

### 4. Update Dashboard Data Loading
- [x] Update `Index.tsx` component to use the new approach
  - [x] Modify the death observations query to specifically use "DIED" concept
  - [x] Verify that the date filtering still works correctly
  - [x] Update metrics calculation call to use new observation data
  - [x] Ensure loading states and error handling are updated

### 5. Modify Mortality-Specific Calculations
- [x] Update mortality rate calculation logic
  - [x] Ensure it counts deaths per unique patient using the new endpoint
  - [x] Verify population denominator remains consistent
  - [x] Add proper handling for the case where there are no death observations

- [x] Update case fatality rate calculation logic
  - [x] Ensure it correctly calculates deaths per traffic accidents using new data
  - [x] Verify that it accounts for patient deduplication properly
  - [x] Test that numerator and denominator are correctly computed

- [x] Update Mortality Breakdown logic
  - [x] Ensure it properly counts mortality vs survival using new endpoint
  - [x] Verify that the pie chart data is computed correctly
  - [x] Maintain consistency with other mortality metrics

### 6. Add Comprehensive Testing
- [x] Create test cases for the updated fetchObservationsByConcept function
  - [x] Test successful fetch from DIED endpoint
  - [x] Test error handling when endpoint fails
  - [x] Test with various date ranges

- [x] Update existing calculateMetrics tests
  - [x] Verify mortality rate calculation with new approach
  - [x] Test case fatality rate calculation
  - [x] Test total fatalities count
  - [x] Verify patient deduplication still works

- [x] Add tests for patient deduplication with the new approach
  - [x] Multiple observations for same patient
  - [x] Different date ranges
  - [x] Edge cases where no death observations exist

### 7. Update Documentation and Comments
- [x] Update function documentation in `fhirClient.ts`
  - [x] Document the new behavior of fetchObservationsByConcept
  - [x] Add examples of the expected endpoint behavior

- [x] Update comments in `metricsCalculator.ts`
  - [x] Document how mortality metrics now use the dedicated endpoint
  - [x] Update any examples or explanations

### 8. Validation and Testing
- [x] Run existing test suite
  - [x] Ensure all tests pass with new implementation
  - [x] Verify backward compatibility where expected

- [x] Manual testing in development environment
  - [x] Load dashboard with new mortality calculation
  - [x] Verify mortality metrics display correctly
  - [x] Test different date ranges
  - [x] Verify performance improvements

- [x] Build verification
  - [x] `npm run build` completes without errors
  - [x] No TypeScript type errors
  - [x] Ensure consistency between calculateMetrics and pie chart calculations
  - [x] Update fetchObservationsByConcept to return bundle total
  - [x] Use bundle total directly as expired count

## Dependencies

**Prerequisites:**
- Understanding of current mortality calculation flow (already analyzed)

**Parallelizable Tasks:**
- Documentation updates (Task 7)
- Testing infrastructure (Task 6)

**Sequential Dependencies:**
- Task 1 (fhirClient update) must be completed before Task 4 (Index.tsx update)
- Task 1-2 (fhirClient and metricsCalculator updates) before Task 4
- Task 2 (metricsCalculator) before Task 5 (mortality calculations)

## Success Criteria
- [x] The dedicated endpoint `value-concept=DIED` is properly used for mortality metrics
- [x] Death counts match expected values from the optimized endpoint
- [x] Dashboard displays correct mortality, case fatality, and fatality metrics
- [x] Patient deduplication is maintained to count each unique patient only once
- [x] Performance is improved due to server-side filtering
- [x] All tests pass with new implementation
- [x] No console errors or warnings in production build