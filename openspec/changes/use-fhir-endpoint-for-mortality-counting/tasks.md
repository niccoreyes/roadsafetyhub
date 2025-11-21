# Tasks: Use FHIR Endpoint for Mortality Counting

## Implementation Tasks

### 1. Update fetchObservationsByConcept Function
- [ ] Modify `src/utils/fhirClient.ts`
  - [ ] Update fetchObservationsByConcept to use the correct query parameters for the FHIR endpoint
  - [ ] Ensure it queries `https://cdr.fhirlab.net/fhir/Observation?value-concept=DIED` format
  - [ ] Add proper error handling for the specific endpoint
  - [ ] Add logging for debugging purposes

### 2. Update Metrics Calculator Logic
- [ ] Update `calculateMetrics` function in `metricsCalculator.ts`
  - [ ] Modify to use observations from the dedicated endpoint for mortality counting
  - [ ] Ensure mortality rate calculation properly uses the new observation data
  - [ ] Update case fatality rate calculation to use the new data
  - [ ] Update total fatalities count to use the new approach
  - [ ] Ensure patient deduplication logic remains intact

### 3. Update Patient Deduplication Logic
- [ ] Review and update patient deduplication logic for mortality counting
  - [ ] Ensure each unique patient is counted only once for mortality metrics
  - [ ] Verify that the patient deduplication works with the new endpoint data
  - [ ] Update any functions that depend on patient identification

### 4. Update Dashboard Data Loading
- [ ] Update `Index.tsx` component to use the new approach
  - [ ] Modify the death observations query to specifically use "DIED" concept
  - [ ] Verify that the date filtering still works correctly
  - [ ] Update metrics calculation call to use new observation data
  - [ ] Ensure loading states and error handling are updated

### 5. Modify Mortality-Specific Calculations
- [ ] Update mortality rate calculation logic
  - [ ] Ensure it counts deaths per unique patient using the new endpoint
  - [ ] Verify population denominator remains consistent
  - [ ] Add proper handling for the case where there are no death observations

- [ ] Update case fatality rate calculation logic
  - [ ] Ensure it correctly calculates deaths per traffic accidents using new data
  - [ ] Verify that it accounts for patient deduplication properly
  - [ ] Test that numerator and denominator are correctly computed

- [ ] Update Mortality Breakdown logic
  - [ ] Ensure it properly counts mortality vs survival using new endpoint
  - [ ] Verify that the pie chart data is computed correctly
  - [ ] Maintain consistency with other mortality metrics

### 6. Add Comprehensive Testing
- [ ] Create test cases for the updated fetchObservationsByConcept function
  - [ ] Test successful fetch from DIED endpoint
  - [ ] Test error handling when endpoint fails
  - [ ] Test with various date ranges

- [ ] Update existing calculateMetrics tests
  - [ ] Verify mortality rate calculation with new approach
  - [ ] Test case fatality rate calculation
  - [ ] Test total fatalities count
  - [ ] Verify patient deduplication still works

- [ ] Add tests for patient deduplication with the new approach
  - [ ] Multiple observations for same patient
  - [ ] Different date ranges
  - [ ] Edge cases where no death observations exist

### 7. Update Documentation and Comments
- [ ] Update function documentation in `fhirClient.ts`
  - [ ] Document the new behavior of fetchObservationsByConcept
  - [ ] Add examples of the expected endpoint behavior

- [ ] Update comments in `metricsCalculator.ts`
  - [ ] Document how mortality metrics now use the dedicated endpoint
  - [ ] Update any examples or explanations

### 8. Validation and Testing
- [ ] Run existing test suite
  - [ ] Ensure all tests pass with new implementation
  - [ ] Verify backward compatibility where expected

- [ ] Manual testing in development environment
  - [ ] Load dashboard with new mortality calculation
  - [ ] Verify mortality metrics display correctly
  - [ ] Test different date ranges
  - [ ] Verify performance improvements

- [ ] Build verification
  - [ ] `npm run build` completes without errors
  - [ ] No TypeScript type errors

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
- [ ] The dedicated endpoint `value-concept=DIED` is properly used for mortality metrics
- [ ] Death counts match expected values from the optimized endpoint
- [ ] Dashboard displays correct mortality, case fatality, and fatality metrics
- [ ] Patient deduplication is maintained to count each unique patient only once
- [ ] Performance is improved due to server-side filtering
- [ ] All tests pass with new implementation
- [ ] No console errors or warnings in production build