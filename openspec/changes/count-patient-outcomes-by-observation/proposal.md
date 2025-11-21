# Change: Count Patient Outcomes by Observation Resource

## Why

The current implementation uses `hospitalization.dischargeDisposition` on Encounter resources to determine if a patient died from a traffic accident. However, the PH Road Safety Implementation Guide recommends using a dedicated Observation resource (`RSObservationOutcomeRelease`) specifically designed for recording patient outcomes.

The Observation-based approach follows FHIR best practices, provides a more robust data model for recording outcomes with proper coding (SNOMED CT + custom code system), includes temporal tracking through effectiveDateTime, and is self-documenting and easier to query.

## What Changes

- Add new valueSet configuration for observation outcome profile URL
- Implement `checkOutcomeStatus()` function to detect death outcomes from Observation resources
- Enhance existing `isExpired()` function to support Observation-based detection with fallback to discharge disposition
- Update `calculateMetrics()` signature to accept observations array and use observation-based detection
- Modify dashboard data loading to fetch and pass Observation resources
- Add comprehensive tests for observation-based outcome detection
- Maintain backward compatibility with fallback to discharge disposition
- Update documentation for new observation-based approach

## Impact

- Affected code: src/config/valueSetConfig.ts (add new configuration)
- Affected code: src/utils/metricsCalculator.ts (isExpired, checkOutcomeStatus, calculateMetrics)
- Affected code: src/contexts/FhirConfigContext.tsx (load observations if not already loaded)
- Affected code: Dashboard page components (pass observations to calculateMetrics)
- Test coverage: src/utils/metricsCalculator.test.ts will need updates for new observation logic

## Implementation Scope

**Out of Scope:**
- Changes to other metrics calculation logic (injury rates, age/sex breakdowns, etc.)

**In Scope:**
- Update `isExpired()` function to check for Observation resources instead of discharge disposition
- Add support for the PH Road Safety IG Observation valueSet URL configuration
- Implement new logic to count deaths by examining Observation resources with:
  - Profile: `https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release`
  - Code: `http://snomed.info/sct` code `418138009` (Patient condition finding)
  - Value: Custom code system `http://www.roadsafetyph.doh.gov.ph/CodeSystem` with code `DIED`
- Maintain backward compatibility during transition (support both approaches temporarily if needed)

## Related Changes
- Builds upon patient deduplication by identifier (already implemented in `deduplicate-patients-by-identifier`)

## Acceptance Criteria
- Dashboard correctly counts deaths using Observation resources with the PH Road Safety IG profile
- Mortality rate, case fatality rate, and total fatalities metrics calculate correctly using the new approach
- All existing tests pass with updated logic
- Configuration for observation outcome value set added to `valueSetConfig.ts`
