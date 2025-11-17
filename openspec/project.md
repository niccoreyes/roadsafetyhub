# Project Context

## Purpose
A healthcare analytics dashboard application for analyzing patient encounter data from Electronic Health Records (EHR) systems. The dashboard provides visualizations and metrics on patient demographics, injuries, conditions, and mortality patterns.

## Tech Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Component Library**: Radix UI primitives with shadcn/ui
- **Styling**: Tailwind CSS 3.4.17
- **Charts**: Recharts 2.15.4
- **Routing**: React Router DOM 6.30.1
- **Form Handling**: React Hook Form 7.61.1 with Zod validation
- **Theme Management**: next-themes 0.3.0
- **Notifications**: Sonner 1.7.4 and Radix Toast
- **State Management**: React Query (TanStack Query) 5.83.0
- **Date Handling**: date-fns 3.6.0 and react-day-picker 8.10.1
- **Code Quality**: ESLint 9.32.0 and TypeScript ESLint

## Project Conventions

### Code Style
- **Formatting**: Prettier configuration with TypeScript
- **Linting**: ESLint with React hooks and refresh plugins
- **Component Structure**: Functional components with TypeScript interfaces for props
- **File Naming**: PascalCase for components, camelCase for utilities
- **Imports**: Absolute imports from @/ (src) directory

### Architecture Patterns
- **Component Hierarchy**: Pages → Components → UI Components
- **State Management**: React Query for server state, useState/useReducer for UI state
- **Data Layer**: FHIR (Fast Healthcare Interoperability Resources) client utilities
- **Separation of Concerns**: Metrics calculations separated into utility modules
- **Error Handling**: Centralized error boundaries with user-friendly messages

### Testing Strategy
- No testing framework currently configured
- Manual testing through `npm run dev` local development
- Build verification through `npm run build`

### Git Workflow
- **Main Branch**: "main" (default for PRs)
- **Commit Style**: Recent commits show descriptive messages
- **No enforced commit conventions** currently in place
- Working with Claude Code, Gemini, and Qwen AI agents (as per documentation files)

## Domain Context
Healthcare data analytics focused on:
- **FHIR Resources**: Patient, Encounter, Condition, Observation data
- **Metrics Types**: Patient demographics (age, sex), injuries, conditions, mortality
- **SNOMED CT**: Medical terminology coding system for conditions and observations
- **ICD-10**: International classification of diseases for encounter types
- **Data Privacy**: Healthcare data requires proper anonymization and HIPAA compliance considerations
- **Dashboard Metrics**: Real-time analytics on patient cohorts with visual charts and tables

## Important Constraints
- **Data Source**: Currently mocked/synthetic healthcare data (no live EHR integration)
- **No Backend API**: All data processing happens client-side
- **Bundle Size**: Heavy component library (Radix UI + shadcn/ui) - consider code splitting
- **Type Safety**: Strict TypeScript configuration required for healthcare data accuracy
- **Performance**: Dashboard needs to handle visualizations for potentially large datasets

## External Dependencies
- **FHIR Data**: Mock patient data following HL7 FHIR R4 specification
- **Icons**: Lucide React 0.462.0 icon library
- **UI Animations**: tailwindcss-animate 1.0.7
- **Component Variants**: class-variance-authority 0.7.1 for UI component variants
