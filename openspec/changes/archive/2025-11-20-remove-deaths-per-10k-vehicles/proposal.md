# Change Proposal: Remove Deaths per 10k Vehicles Card

**Change ID:** remove-deaths-per-10k-vehicles

**Type:** Feature Removal
**Impact:** Dashboard UI update

## Summary

Remove the "Deaths per 10k Vehicles" metric card from the dashboard. This metric is based on a static value for registered motor vehicles that may not accurately reflect actual road usage, making it less reliable than the mortality rate (per 100k population) metric which is more standardized across public health reporting.

## Motivation

The "Deaths per 10k Vehicles" metric relies on static placeholder data for motor vehicle counts that does not accurately represent actual road usage patterns or provide meaningful comparative insights. The mortality rate (per 100,000 population) serves as a more standardized and internationally comparable metric for road safety performance tracking.

## User Impact

Users will see one fewer metric card in the dashboard. The remaining metrics will provide more accurate and useful insights: Mortality Rate, Injury Rate, Case Fatality Rate, and Transport Accidents count.

## Scope

- Remove the "Deaths per 10k Vehicles" metric card from the dashboard
- Remove the `deathsPer10kVehicles` field from the `DashboardMetrics` interface
- Remove the calculation logic for deaths per 10k vehicles
- Remove the `MOTOR_VEHICLES_COUNT` constant if it is no longer used elsewhere
- Update any references to this metric in documentation

## Success Criteria

- [x] The "Deaths per 10k Vehicles" card no longer appears on the dashboard
- [x] The DashboardMetrics type no longer includes the `deathsPer10kVehicles` field
- [x] No compilation or runtime errors related to the removal
- [x] All tests pass after the removal

## Related Changes

None identified at this time.

## Timeline

- Implementation: 1-2 hours
- Testing and validation: 1 hour
- Review and merge: 1 hour

Total estimated time: 3-4 hours
