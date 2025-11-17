# Configuration Management

## ADDED Requirements

#### Requirement: FHIR_CONFIG_CONTEXT
**Capability:** FHIR Configuration Context/Provider 
#### Scenario: Centralize FHIR server configuration

**Requirement:** The system SHALL provide a configuration context/provider for:
- FHIR base URL
- Authentication settings
- ValueSet identifiers and URLs
- Retry and timeout settings
- Dashboard date range defaults

**Acceptance Criteria:**
```
Given a React component needs FHIR configuration
When accessing context values
Then configuration should be available without prop drilling

Given configuration changes at runtime
When values are updated in context
Then all consuming components should reflect new values without restart
```

**References:**
- IG requirement: Section 4.00 "Code Structure & Architecture"
- New code: `src/contexts/FhirConfigContext.tsx`

---

#### Requirement: ENV_VAR_SUPPORT
**Capability:** Environment Variable Support 
#### Scenario: Configure via environment variables at build/deploy time

**Requirement:** The system SHALL support configuration via:
- `.env` files for local development
- `import.meta.env` Vite environment variables
- Runtime configuration JSON
- Sensible defaults for all values

**Acceptance Criteria:**
```
Given a `.env.local` file with VITE_FHIR_BASE_URL
When the application starts
Then the default FHIR URL should be that value

Given no environment variables set
When the application starts
Then use default: `https://cdr.fhirlab.net/fhir`
```

**References:**
- Vite docs: https://vitejs.dev/guide/env-and-mode.html
- New: `.env.example` file creation

---

#### Requirement: VALUESET_CONFIG
**Capability:** ValueSet Configuration 
#### Scenario: Configure which ValueSets to use for classification

**Requirement:** The system SHALL allow configuration of:
- Road traffic encounter ValueSet URL
- Injury MOI ValueSet URL
- Observation category ValueSet URLs
- Discharge disposition ValueSet URL

**Acceptance Criteria:**
```
Given a custom FHIR server implements different ValueSet URLs
When configuring VITE_FHIR_VS_TRAFFIC_ENCOUNTER_URL
Then the encounter classification should use that ValueSet

Given the PH Road Safety IG updates a ValueSet URL
When the configuration is updated
Then the new ValueSet should be used without code changes
```

**References:**
- IG requirement: Section 2.3 "SNOMED-CT / Code Systems"
- New: `src/config/valueSetConfig.ts`

---

#### Requirement: AUTHENTICATION_CONFIG
**Capability:** Authentication Configuration 
#### Scenario: Support various FHIR authentication methods

**Requirement:** The system SHALL support authentication configuration:
- No authentication (default for public servers)
- Bearer token authentication
- OAuth 2.0 client credentials flow
- SMART on FHIR launch context

**Acceptance Criteria:**
```
Given VITE_FHIR_AUTH_TYPE=bearer
And VITE_FHIR_AUTH_TOKEN is set
When FHIR requests are made
Then include Authorization: Bearer <token> header

Given VITE_FHIR_AUTH_TYPE=oauth
When the application starts
Then initiate OAuth flow and obtain access token
```

**References:**
- SMART on FHIR: http://hl7.org/fhir/smart-app-launch/
- New: `src/utils/fhirAuth.ts`
