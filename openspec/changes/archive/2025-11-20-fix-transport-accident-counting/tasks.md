## 1. Fix SNOMED System Matching
- [ ] 1.1 Update observation filtering in `Index.tsx` to match both SNOMED system URIs:
  - `http://snomed.info/sct`
  - `http://snomed.info/sct/900000000000207008/version/20241001`
- [ ] 1.2 Update `countTransportAccidents` function in `metricsCalculator.ts` with the same dual-system matching
- [ ] 1.3 Test both system URIs match the SNOMED CT code 274215009

## 2. Add Condition Counting
- [ ] 2.1 Create helper function to check if a condition matches transport accident SNOMED code
- [ ] 2.2 Count conditions with SNOMED CT code 274215009
- [ ] 2.3 Update `calculateMetrics` to pass conditions array to transport accident counter or calculate separately

## 3. Update Dashboard Integration
- [ ] 3.1 Modify `Index.tsx` to calculate total transport accidents from both observations and conditions
- [ ] 3.2 Update metric card description to reflect "Observations and Conditions" instead of just "Observations"
- [ ] 3.3 Ensure date range filtering applies to both observations and conditions

## 4. Testing & Validation
- [ ] 4.1 Verify injury classification chips continue working
- [ ] 4.2 Confirm transport accident count increases when conditions with code 274215009 exist
- [ ] 4.3 Validate date range filtering works for both resource types
- [ ] 4.4 Build and run dashboard to verify no regressions
