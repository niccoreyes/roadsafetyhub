## 1. UI and State Management
- [x] 1.1 Create dropdown component for rate multiplier selection (per 100, per 1k, per 10k, per 100k, per 1M)
- [x] 1.2 Add state management to Index.tsx for tracking selected multipliers
- [x] 1.3 Integrate dropdown controls into mortality rate and injury rate cards
- [x] 1.4 Pass dropdown state to metrics calculator

## 2. Metrics Calculation Updates
- [x] 2.1 Refactor metricsCalculator.ts to calculate base rates (per 100k) correctly
- [x] 2.2 Update UI to convert rates based on selected multiplier
- [x] 2.3 Maintain backward compatibility for default behavior (per 100k)

## 3. Remove Mock/Synthetic Data
- [x] 3.1 Remove hardcoded population placeholder (POPULATION_AT_RISK = 1000000) from metricsCalculator.ts
- [x] 3.2 Remove hardcoded vehicle count placeholder (MOTOR_VEHICLES_COUNT = 50000) from metricsCalculator.ts
- [x] 3.3 Verify no mock/synthetic data is generated locally
- [x] 3.4 Remove or update any simulated data banners or warnings (like the one in Index.tsx)

## 4. Server Data Integration
- [x] 4.1 Ensure all actual counts (mortality, injury, accidents) are retrieved from the server
- [x] 4.2 Implement endpoint to fetch actual population data from server
- [x] 4.3 Update API calls to fetch required data for rate calculations

## 5. Documentation and Testing
- [x] 5.1 Update tooltips to reflect selected multiplier
- [x] 5.2 Add unit tests for metrics calculation with different multipliers (per 100, per 1k, per 10k, per 100k, per 1M)
- [x] 5.3 Add UI tests for dropdown interaction
- [x] 5.4 Validate proposal with openspec validate

## 6. Validation
- [x] 6.1 Test all multiplier options display correct calculations (per 100, per 1k, per 10k, per 100k, per 1M)
- [x] 6.2 Verify default behavior matches current implementation
- [x] 6.3 Ensure dropdown state persists during interactions
- [x] 6.4 Verify all metrics use actual counts from server
- [x] 6.5 Confirm no mock or synthetic data is used in the application
