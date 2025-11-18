# Road Safety Analytics Dashboard

This project implements a comprehensive FHIR PH Road Safety Implementation Guide (IG) support for the road safety analytics dashboard. The dashboard uses FHIR standards to provide analytics for road safety data with special focus on traffic accident analytics.

## Features

- FHIR-compliant road safety analytics
- PH Road Safety IG ValueSet-based classification
- Configurable FHIR server connection
- Traffic accident classification using standardized codes
- Key metrics: Mortality Rate, Injury Rate, Case Fatality Rate, etc.
- Interactive charts and data tables
- Error handling and performance optimizations

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- FHIR R4
- shadcn-ui
- Tailwind CSS
- Recharts
- @tanstack/react-query

## Configuration

To configure the dashboard, create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```

Then update the values in the `.env` file with your specific configuration. The configuration options include:

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

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or bun package manager

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd roadsafetyhub
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your FHIR server configuration.

5. Start the development server:
   ```bash
   npm run dev
   # or
   bun run dev
   ```

6. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Build for Production

To create a production build:

```bash
npm run build
# or
bun run build
```

## Troubleshooting

If you encounter issues:

1. Check your FHIR server URL is correct and accessible
2. Verify your authentication settings if required
3. Review the browser console for error messages
4. Check the network tab to see if FHIR requests are failing
5. Ensure your FHIR server supports the required ValueSets
