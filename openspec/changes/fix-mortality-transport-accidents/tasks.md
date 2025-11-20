## 1. Implementation
- [ ] 1.1 Update `isTrafficRelatedCondition` in `snomedMapping.ts` to check for both SNOMED CT codes (274215009 and 127348004) instead of keyword matching
- [ ] 1.2 Update `calculateMetrics` in `metricsCalculator.ts` to count fatalities per unique patient (not per encounter)
- [ ] 1.3 Add helper function to extract unique patient IDs who have encounters with the two SNOMED codes
- [ ] 1.4 Update transport accident counting functions to include both SNOMED CT codes
- [ ] 1.5 Update Index.tsx transport accident filtering to include both codes
- [ ] 1.6 Update metric card descriptions to clarify counting methodology

## 2. Testing
- [ ] 2.1 Update unit tests for `isTrafficRelatedCondition` to use both SNOMED codes
- [ ] 2.2 Update unit tests for `calculateMetrics` to test patient deduplication
- [ ] 2.3 Update unit tests for transport accident counting with both codes
- [ ] 2.4 Verify mortality rate accuracy with test data containing multiple encounters per patient

## 3. Validation
- [ ] 3.1 Run all existing tests to ensure no regressions
- [ ] 3.2 Validate transport accidents chip displays correct count with both SNOMED codes
- [ ] 3.3 Validate mortality rate is calculated per patient not per encounter
- [ ] 3.4 Validate case fatality rate uses updated traffic accident criteria
