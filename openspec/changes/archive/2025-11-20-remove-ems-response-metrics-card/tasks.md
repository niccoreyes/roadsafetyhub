# Tasks: Remove EMS Response Metrics Card

## 1. Remove EMS Metrics Chart component reference
**Action**: Delete the `EmsMetricsChart` component import and JSX usage from the main dashboard page

**Rationale**: The component is currently rendered but relies on unsupported FHIR data. Removing the reference prevents unnecessary rendering and avoids user confusion.

**Work items**:
- [x] Remove import statement for `EmsMetricsChart` from `src/pages/Index.tsx` line 20
- [x] Remove the `EmsMetricsChart` JSX component usage from `src/pages/Index.tsx` lines 405-407
- [x] Verify no remaining references to `EmsMetricsChart` in the file
- [x] Update grid layout if needed to accommodate component removal

**Validation**:
- Run the application and verify the dashboard loads without errors
- Confirm the component no longer appears in the Analytics & Trends section
- Ensure the grid layout for remaining charts displays correctly

## 2. Delete EMS Metrics Chart component file
**Action**: Remove the component file from the dashboard components directory

**Rationale**: Keeping unused component files in the codebase increases maintenance burden and may cause confusion for future developers

**Work items**:
- [x] Delete file `src/components/dashboard/EmsMetricsChart.tsx`
- [x] Verify no other files import or reference this component
- [x] Check for any stale references in test files
- [x] Review and remove related types or interfaces if they become unused

**Dependencies**: Task 1 must be completed first to avoid breaking the build

**Validation**:
- Run the build to confirm no compilation errors
- Search codebase for any remaining references to the deleted file
- Verify all tests pass

## 3. Update UI layout and spacing
**Action**: Adjust grid layout in the Analytics & Trends section to ensure proper visual balance after component removal

**Rationale**: The grid layout may need adjustment to ensure remaining charts display optimally without the EMS metrics card

**Work items**:
- [x] Review current grid layout in `src/pages/Index.tsx` lines 394-408
- [x] Verify `md:grid-cols-2` and `lg:grid-cols-3` grid still works correctly
- [x] Check visual spacing and ensure no layout gaps or alignment issues
- [x] Test on different screen sizes (mobile, tablet, desktop)

**Dependencies**: Tasks 1 and 2 must be completed first

**Validation**:
- Visually inspect the Analytics & Trends section
- Confirm remaining charts (SexPieChart, AgeBarChart, InjuryBarChart, MortalityPieChart) display correctly
- Test responsive behavior at various viewport widths

## 4. Verify OpenSpec Reference
**Action**: Confirm no remaining references to EMS metrics in OpenSpec documentation

**Rationale**: Maintain consistency between implementation and documentation to avoid confusion

**Work items**:
- [x] Search OpenSpec specs for any references to "EMS metrics"
- [x] Update or create spec documentation to reflect component removal
- [x] Verify proposal addresses all relevant capabilities

**Dependencies**: Tasks 1 and 2 should be complete before final documentation update

**Validation**:
- Search OpenSpec specs with `rg -i "EmsMetrics|Ems Metrics"` and verify no results
- Confirm dashboard-visualization spec in this proposal accurately reflects the change
- Run `openspec validate remove-ems-response-metrics-card` successfully
