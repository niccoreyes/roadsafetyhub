# API Documentation: FHIR Configuration System

## Overview
The FHIR Configuration system provides a centralized way to manage FHIR server settings using React Context. It allows runtime configuration changes and proper environment variable integration.

## Components

### FhirConfigContext
A React Context that provides FHIR configuration throughout the application.

**Interface:**
- `config`: FhirConfig object with all configuration values
- `updateConfig`: Function to update configuration values

### FhirConfigProvider
A React Provider component that wraps the application to make configuration available.

**Props:**
- `children`: ReactNode - The child components that need access to the configuration

### useFhirConfig
A custom React hook to access the FHIR configuration in components.

**Returns:**
- `config`: FhirConfig object
- `updateConfig`: Function to update configuration

## Interfaces

### FhirConfig
Configuration object with the following properties:

```typescript
interface FhirConfig {
  baseUrl: string;
  authType: 'none' | 'bearer' | 'oauth';
  authToken?: string;
  timeout: number;
  retryAttempts: number;
  paginationLimit: number;
  // ValueSet URLs for PH Road Safety IG
  trafficEncounterValueSetUrl: string;
  injuryMoiValueSetUrl: string;
  observationCategoryValueSetUrl: string;
  dischargeDispositionValueSetUrl: string;
}
```

**Properties:**
- `baseUrl`: FHIR server base URL
- `authType`: Authentication method ('none', 'bearer', 'oauth')
- `authToken`: Bearer token for authentication (optional)
- `timeout`: Request timeout in milliseconds
- `retryAttempts`: Number of retry attempts for failed requests
- `paginationLimit`: Maximum number of resources per page
- `trafficEncounterValueSetUrl`: PH Road Safety IG ValueSet for traffic encounters
- `injuryMoiValueSetUrl`: PH Road Safety IG ValueSet for injury mechanisms of injury
- `observationCategoryValueSetUrl`: PH Road Safety IG ValueSet for observation categories
- `dischargeDispositionValueSetUrl`: PH Road Safety IG ValueSet for discharge dispositions

## Usage

### In App.tsx or main application component:
```jsx
import { FhirConfigProvider } from './contexts/FhirConfigContext';

function App() {
  return (
    <FhirConfigProvider>
      {/* Your application components */}
    </FhirConfigProvider>
  );
}
```

### In any component that needs access to configuration:
```jsx
import { useFhirConfig } from './contexts/FhirConfigContext';

function MyComponent() {
  const { config, updateConfig } = useFhirConfig();
  
  return (
    <div>
      <p>Current FHIR server: {config.baseUrl}</p>
    </div>
  );
}
```

## Environment Variables

The system supports the following environment variables:

- `VITE_FHIR_BASE_URL`: Base URL for the FHIR server
- `VITE_FHIR_AUTH_TYPE`: Authentication type ('none', 'bearer', 'oauth')
- `VITE_FHIR_AUTH_TOKEN`: Authentication token if using bearer token authentication
- `VITE_FHIR_TIMEOUT`: Request timeout in milliseconds
- `VITE_FHIR_RETRY_ATTEMPTS`: Number of retry attempts for failed requests
- `VITE_FHIR_PAGINATION_LIMIT`: Pagination limit for FHIR queries
- `VITE_FHIR_VS_TRAFFIC_ENCOUNTER_URL`: Traffic Encounter ValueSet URL
- `VITE_FHIR_VS_INJURY_MOI_URL`: Injury Mechanism of Injury ValueSet URL
- `VITE_FHIR_VS_OBSERVATION_CATEGORY_URL`: Observation Category ValueSet URL
- `VITE_FHIR_VS_DISCHARGE_DISPOSITION_URL`: Discharge Disposition ValueSet URL
- `VITE_LOG_LEVEL`: Logging level (debug, info, warn, error)

## Error Handling

- The `useFhirConfig` hook throws an error if used outside of a `FhirConfigProvider`
- Configuration validation occurs during initialization
- Invalid configuration values fall back to defaults
- Environment variables are validated with proper defaults

## Configuration Updates

The system supports runtime configuration updates:

```jsx
const { config, updateConfig } = useFhirConfig();

// Update a single property
updateConfig({ baseUrl: 'https://new-fhir-server.com' });

// Update multiple properties
updateConfig({
  baseUrl: 'https://new-fhir-server.com',
  authType: 'bearer',
  authToken: 'new-token'
});
```