# OpenSpec Change Proposal: FHIR PH Road Safety IG Analytics Dashboard

## Change ID
`fhir-ph-road-safety-ig`

## Summary
Implement comprehensive FHIR PH Road Safety Implementation Guide (IG) support for the road safety analytics dashboard. This change upgrades the existing generic FHIR-based dashboard to specifically align with PH Road Safety IG profiles, ValueSets, and code systems for accurate categorization and aggregation of road traffic accident data.

## Problem Statement
The current dashboard uses ad-hoc SNOMED code mapping and generic FHIR queries. It needs to be enhanced to:
- Use PH Road Safety IG ValueSets and profiles for consistent data classification
- Support configurable FHIR base URL and authentication
- Properly categorize encounters, conditions, and observations per IG specifications
- Improve error handling and performance with large datasets
- Better align data processing with healthcare interoperability standards

## Scope
- ✅ FHIR integration layer enhancements (configurable URL, auth, pagination)
- ✅ ValueSet-based classification for Encounters, Conditions, and Observations
- ✅ Dashboard visualizations updates to use IG-defined categories
- ✅ Configuration management system
- ✅ Error handling and performance improvements
- ✅ Documentation and validation

## Out of Scope
- Backend FHIR server implementation (consumer only)
- Patient PII exposure (anonymized data only)
- Real-time FHIR subscriptions
- Advanced FHIR search parameters beyond date ranges

## Impact
- **Breaking Changes**: None
- **New Dependencies**: No new runtime dependencies
- **Backwards Compatibility**: Maintained for existing functionality
- **Configuration Changes**: New configuration for FHIR server URL, ValueSet identifiers

## Related Projects
- PH Road Safety IG: https://build.fhir.org/ig/UPM-NTHC/PH-RoadSafetyIG/
- CDR FHIRLab Test Server: https://cdr.fhirlab.net/fhir

## Reviewers
- Healthcare/FHIR domain experts
- Frontend developers familiar with React/TypeScript
- DevOps for configuration and deployment review

## Approval Process
1. Technical review of proposal and architecture
2. Validation of OpenSpec requirements and scenarios
3. Approval of implementation plan
4. Merge PR and apply using `/openspec:apply`
