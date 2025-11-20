## 1. UI and State Management
- [ ] 1.1 Create dropdown component for rate multiplier selection (per 100, per 1k, per 10k, per 100k, per 1M)
- [ ] 1.2 Add state management to Index.tsx for tracking selected multipliers
- [ ] 1.3 Integrate dropdown controls into mortality rate and injury rate cards
- [ ] 1.4 Pass dropdown state to metrics calculator

## 2. Metrics Calculation Updates
- [ ] 2.1 Refactor metricsCalculator.ts to accept rate multiplier as parameter
- [ ] 2.2 Update calculateDashboardMetrics to use dynamic multipliers
- [ ] 2.3 Maintain backward compatibility for default behavior

## 3. Remove Mock/Synthetic Data
- [ ] 3.1 Remove hardcoded population placeholder (POPULATION_AT_RISK = 1000000) from metricsCalculator.ts
- [ ] 3.2 Remove hardcoded vehicle count placeholder (MOTOR_VEHICLES_COUNT = 50000) from metricsCalculator.ts
- [ ] 3.3 Verify no mock/synthetic data is generated locally
- [ ] 3.4 Remove or update any simulated data banners or warnings (like the one in Index.tsx)

## 4. Server Data Integration
- [ ] 4.1 Ensure all actual counts (mortality, injury, accidents) are retrieved from the server
- [ ] 4.2 Implement endpoint to fetch actual population data from server
- [ ] 4.3 Update API calls to fetch required data for rate calculations

## 5. Documentation and Testing
- [ ] 5.1 Update tooltips to reflect selected multiplier
- [ ] 5.2 Add unit tests for metrics calculation with different multipliers (per 100, per 1k, per 10k, per 100k, per 1M)
- [ ] 5.3 Add UI tests for dropdown interaction
- [ ] 5.4 Validate proposal with openspec validate

## 6. Validation
- [ ] 6.1 Test all multiplier options display correct calculations (per 100, per 1k, per 10k, per 100k, per 1M)
- [ ] 6.2 Verify default behavior matches current implementation
- [ ] 6.3 Ensure dropdown state persists during interactions
- [ ] 6.4 Verify all metrics use actual counts from server
- [ ] 6.5 Confirm no mock or synthetic data is used in the application
