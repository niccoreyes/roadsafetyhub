# Design: Count Patient Outcomes by Observation Resource

## Design Decision: Shift to Observation-Based Outcome Tracking

### Current Approach (To Be Replaced)
- **Source**: `hospitalization.dischargeDisposition` on Encounter resources
- **Detection Logic**: `isExpired()` function in `metricsCalculator.ts`
- **ValueSet**: Uses `dischargeDispositionValueSetUrl` configuration
- **Problems**: Not aligned with PH Road Safety IG; discharge disposition is a less precise indicator of death

### Proposed Approach
- **Source**: Observation resources with `RSObservationOutcomeRelease` profile
- **Structure**: FHIR Observation resource with specific coding as shown in the example
- **Detection Logic**: New function to check Observation resources instead of encounters

#### Observation Resource Profile
```json
{
  "resourceType": "Observation",
  "meta": {
    "profile": [
      "https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/StructureDefinition/rs-observation-outcome-release"
    ]
  },
  "status": "final",
  "code": {
    "coding": [{
      "code": "418138009",
    }]
  },
  "valueCodeableConcept": {
    "coding": [{
      "code": "DIED",
      "display": "Died"
    }]
  },
  "encounter": { "reference": "Encounter/{Encounter ID}" },
  "subject": { "reference": "Patient/{Patient ID}" }
}
```

### Implementation Strategy

**1. Add Configuration**
```typescript
// In valueSetConfig.ts
observationOutcomeValueSetUrl: 'https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/ValueSet/rs-observation-outcome-release'
```

**2. Update Function Signatures**
Current signature:
```typescript
export async function isExpired(encounter: any): Promise<boolean>
```

New approach (multiple strategies):
```typescript
// Option A: Add observations parameter to existing function
export async function isExpired(encounter: any, observations?: any[]): Promise<boolean>

// Option B: New function specifically for observations
export async function checkOutcomeStatus(
  observations: any[],
  encounterId: string
): Promise<boolean>

// Option C: Composite function that handles both
export async function getDeathStatus(
  encounter: any,
  observations?: any[],
  patientId?: string
): Promise<boolean>
```

**Recommended: Option C** - provides backward compatibility and flexibility

**3. Algorithm Changes**

Current logic in `calculateMetrics()`:
```typescript
const expiredPromises = patientEncounters.map(enc => isExpired(enc));
const expiredResults = await Promise.all(expiredPromises);
const diedFromTrafficAccident = expiredResults.some(Boolean);
```

New logic:
```typescript
// Get observations related to this patient's encounters
const patientObservations = observations.filter(obs => {
  const obsPatientId = obs.subject?.reference?.replace("Patient/", "");
  return obsPatientId === patientId;
});

// Check observations for death outcomes
const diedFromTrafficAccident = await checkOutcomeStatus(
  patientObservations,
  null, // encounterId - can check across all encounters if available
  patientId
);
```

**4. Data Flow Changes**

```
Before:
Encounters → isExpired() → Death Status

After:
Encounters + Observations → checkOutcomeStatus() → Death Status
```

### Key Considerations

**Backward Compatibility**
- During transition, support both methods
- If Observation resources not available, fall back to discharge disposition
- Log warnings when falling back to old method

**Performance**
- Additional observations array filtering per patient
- Consider pre-filtering observations outside calculation loop
- Memory: Store observations Map for O(1) lookup

**Testing Strategy**
- Mock Observation resources with correct profile and codes
- Test scenarios: dead patients, alive patients, mixed data sources
- Verify both code paths: Observation-based and fallback to discharge disposition

**Error Handling**
- Missing observations array should log warning and fallback
- Invalid Observation structure should not crash metrics calculation
- ValueSet expansion failures should fallback to explicit code checking

### Integration Points

**Files to Modify:**
1. `src/config/valueSetConfig.ts` - Add new valueSet URL
2. `src/utils/metricsCalculator.ts` - Update isExpired() and calculateMetrics()
3. `src/contexts/FhirConfigContext.tsx` - Pass observations data if not already available

**Interfaces Affected:**
- `calculateMetrics()` signature may need `observations` parameter
- Dashboard page component needs to load observations

### Migration Path

1. **Phase 1**: Implement Observation support alongside existing logic
   - Add configuration
   - Add new detection functions
   - Update calculateMetrics to accept observations

2. **Phase 2**: Data migration
   - Ensure FHIR server provides Observation resources
   - Verify Observation profile compliance

3. **Phase 3**: Deprecate old method
   - Remove discharge disposition dependency
   - Update documentation

### Risk Mitigation

- **Risk**: Observation resources missing or incomplete
  - **Mitigation**: Graceful fallback to discharge disposition with logging

- **Risk**: Performance degradation from additional filtering
  - **Mitigation**: Pre-process observations into indexed structure

- **Risk**: Profile mismatch between IG and implementation
  - **Mitigation**: Validate against profile schema, use flexible code checking with fallback
