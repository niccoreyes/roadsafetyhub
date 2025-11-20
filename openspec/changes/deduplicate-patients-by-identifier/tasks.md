## 1. Implementation
- [ ] 1.1 Create `getPatientIdentifier` function in metricsCalculator.ts to extract unique identifier by system
- [ ] 1.2 Update `groupByAgeGroup` to use identifier-based deduplication
- [ ] 1.3 Update `groupBySex` to use identifier-based deduplication
- [ ] 1.4 Update `calculateMetrics` mortality calculation to use identifier-based patient tracking
- [ ] 1.5 Add logic to handle patients without identifiers (fallback to FHIR ID)
- [ ] 1.6 Add logging/validation for inconsistent data (same identifier with different demographics)

## 2. Testing and Validation
- [ ] 2.1 Update metricsCalculator.test.ts with test cases for duplicate patients by identifier
- [ ] 2.2 Test scenario: multiple patients with same identifier but different FHIR IDs
- [ ] 2.3 Test scenario: patients without identifiers fall back to FHIR ID
- [ ] 2.4 Test scenario: inconsistent demographic data for same identifier
- [ ] 2.5 Run test suite and verify all tests pass

## 3. Manual Testing
- [ ] 3.1 Load dashboard with known duplicate patients
- [ ] 3.2 Verify metrics card values decrease appropriately after deduplication
- [ ] 3.3 Verify age group charts show correct patient counts
- [ ] 3.4 Verify sex group charts show correct patient counts
- [ ] 3.5 Test date filtering with duplicate patients

## 4. Documentation and Validation
- [ ] 4.1 Update function documentation (JSDoc comments)
- [ ] 4.2 Update README.md if needed with patient deduplication approach
- [ ] 4.3 Run `openspec validate deduplicate-patients-by-identifier --strict`
- [ ] 4.4 Resolve any validation errors
- [ ] 4.5 Request review and approval for proposal
