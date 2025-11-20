## 1. Implement Date Range Filtering for Breakdowns

### 1.1 Sex Breakdown with Date Filter
- [x] 1.1.1 Update `groupBySex` utility function to accept date range parameters
- [x] 1.1.2 Modify `SexPieChart` component to pass date range and filter data
- [x] 1.1.3 Test with different date ranges to verify filtering works correctly

### 1.2 Age Breakdown with Date Filter
- [x] 1.2.1 Update `groupByAgeGroup` utility function to accept date range parameters
- [x] 1.2.2 Modify `AgeBarChart` component to pass date range and filter data
- [x] 1.2.3 Test with different date ranges to verify filtering works correctly

### 1.3 Mortality Breakdown with Date Filter
- [x] 1.3.1 Update mortality calculation logic to filter by encounter date range
- [x] 1.3.2 Modify `MortalityPieChart` component to respect date range
- [x] 1.3.3 Test expiration calculations with filtered data

### 1.4 EMS Response Metrics with Date Filter
- [x] 1.4.1 Remove hardcoded mock data in `EmsMetricsChart`
- [x] 1.4.2 Replace with real query filtered by date range
- [x] 1.4.3 Add loading states and error handling

### 1.5 Verify Date Filtering Implementation
- [x] 1.5.1 Add console logging to validate data ranges are applied correctly
- [x] 1.5.2 Compare metrics before/after date filtering to verify changes
- [x] 1.5.3 Ensure date filtering matches _lastUpdated query parameter pattern

## 2. Add Dashboard-Level Simulated Data Warning

### 2.1 Banner Notification Implementation
- [x] 2.1.1 Add prominent banner at top of dashboard near header
- [x] 2.1.2 Use amber/orange styling to indicate warning status
- [x] 2.1.3 Include dismissible option with localStorage persistence
- [x] 2.1.4 Text: "Note: All displayed data is simulated for demonstration purposes"

### 2.2 Hide Monthly Trends Component
- [x] 2.2.1 Hide or remove TrendsChart from dashboard display
- [x] 2.2.2 Update UI grid layout to fill available space
- [x] 2.2.3 Ensure no references to monthly data remain

### 2.3 Remove Component-Level Simulated Warnings
- [x] 2.3.1 Remove "Data is simulated" text from EmsMetricsChart
- [x] 2.3.2 Remove "This chart currently displays simulated data" from TrendsChart tooltips
- [x] 2.3.3 Update chart tooltips to remove redundant warnings

### 2.4 Update Documentation
- [x] 2.4.1 Update README to clearly state all data is simulated
- [x] 2.4.2 Add comment in Index.tsx explaining warning implementation

## 3. Validation and Testing

### 3.1 Date Filter Functionality Testing
- [x] 3.1.1 Select various date ranges and verify all charts update
- [x] 3.1.2 Test edge cases (single day, full range, future dates)
- [x] 3.1.3 Verify query parameters are correctly formatted

### 3.2 Simulated Data Warning Testing
- [x] 3.2.1 Verify banner appears on initial load
- [x] 3.2.2 Test dismiss functionality and persistence across reloads
- [x] 3.2.3 Ensure no "simulated" text appears elsewhere on dashboard

### 3.3 Build and Type Checking
- [x] 3.3.1 Run `npm run build` to verify no compilation errors
- [x] 3.3.2 Check TypeScript types for all modified components
- [x] 3.3.3 Verify no ESLint warnings or errors
