# API Documentation: FHIR Client

## Overview
The FHIR Client provides utilities for fetching and processing FHIR resources with focus on PH Road Safety IG compliance. It includes features like pagination, retry logic, ValueSet expansion, and caching.

## Functions

### fhirFetchAll(url)
Fetches all pages of a FHIR Bundle by following pagination links with retry logic.

**Parameters:**
- `url` (string): The FHIR endpoint URL to fetch

**Returns:**
- `Promise<any[]>`: Array of all resources from all pages

**Behavior:**
- Handles pagination automatically
- Implements retry logic with exponential backoff
- Includes timeout handling
- Distinguishes between client and server errors

### fetchValueSetExpansion(valueSetUrl)
Fetches ValueSet expansion from the terminology server.

**Parameters:**
- `valueSetUrl` (string): URL of the ValueSet to expand

**Returns:**
- `Promise<any[]>`: Array of expanded codes

**Behavior:**
- Checks cache first before making network request
- Caches results with 5-minute TTL
- Falls back to empty array on error

### isCodingInValueSet(coding, valueSetUrl)
Checks if a coding matches any code in a ValueSet.

**Parameters:**
- `coding` (any): FHIR coding object with system and code properties
- `valueSetUrl` (string): URL of the ValueSet to check against

**Returns:**
- `Promise<boolean>`: True if coding matches any code in ValueSet

### fetchEncounters(startDate, endDate)
Fetches encounters within a date range using PH Road Safety IG ValueSets.

**Parameters:**
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format

**Returns:**
- `Promise<any[]>`: Array of encounter resources

### fetchConditions(startDate, endDate)
Fetches conditions within a date range (using meta.lastUpdated for consistency).

**Parameters:**
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format

**Returns:**
- `Promise<any[]>`: Array of condition resources

### fetchObservations(startDate, endDate)
Fetches observations within a date range.

**Parameters:**
- `startDate` (string): Start date in YYYY-MM-DD format
- `endDate` (string): End date in YYYY-MM-DD format

**Returns:**
- `Promise<any[]>`: Array of observation resources

### fetchPatient(patientId)
Fetches a single patient by ID.

**Parameters:**
- `patientId` (string): The FHIR Patient resource ID

**Returns:**
- `Promise<any>`: Patient resource or null if not found

### resolvePatients(resources)
Resolves patient references with caching.

**Parameters:**
- `resources` (any[]): Array of FHIR resources that might have patient references

**Returns:**
- `Promise<Map<string, any>>`: Map of patientId to patient resource

## Configuration

The client respects the following environment variables:

- `VITE_FHIR_BASE_URL`: Base URL for the FHIR server
- `VITE_FHIR_AUTH_TYPE`: Authentication type ('none', 'bearer', 'oauth')
- `VITE_FHIR_AUTH_TOKEN`: Authentication token if using bearer token authentication
- `VITE_FHIR_TIMEOUT`: Request timeout in milliseconds
- `VITE_FHIR_RETRY_ATTEMPTS`: Number of retry attempts for failed requests
- `VITE_FHIR_PAGINATION_LIMIT`: Pagination limit for FHIR queries

## Error Handling

The client implements comprehensive error handling:

- Client errors (4xx) are not retried
- Server errors (5xx) are retried with exponential backoff
- Timeout errors are retried
- Authentication errors stop retries
- Detailed logging for debugging

## Caching

The client implements multiple levels of caching:

- ValueSet caching with 5-minute TTL
- Patient caching with 10-minute TTL and LRU eviction
- In-memory caching without persistence

## Performance Considerations

- Pagination prevents loading too much data at once
- Batching reduces the number of network requests
- Caching reduces redundant API calls
- Timeouts prevent hanging requests
- Size limits prevent memory issues