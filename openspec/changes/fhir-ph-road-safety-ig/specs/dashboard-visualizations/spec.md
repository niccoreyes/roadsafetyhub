# Dashboard Visualizations and Metrics

## ADDED Requirements

### Requirement: METRIC_CARD_UPDATES
The system SHALL update metric cards to display IG-aligned key performance indicators. The system SHALL display number of encounters (total, accident-related). The system SHALL display fatalities (from Encounter.dischargeDisposition). The system SHALL display non-fatal injuries (from Condition resources). The system SHALL display case fatality rate ((fatal / total encounters) * 100). The system SHALL display EMS average response times (from Observation resources).

#### Scenario: Display updated KPIs per IG specifications
**Acceptance Criteria:**
```
Given I view the dashboard
When data loads from FHIR server
Then metric cards should show IG-aligned KPIs instead of placeholder calculations

Given a date range with 15 fatal encounters out of 200 total
When the case fatality rate is calculated
Then the metric should display 7.5% (15/200 * 100)
```

**References:**
- IG requirement: Section 3 "Dashboard Metrics & Visualizations"
- Current: `src/pages/Index.tsx:191-230` needs metric updates

---

### Requirement: OBSERVATION_CHARTS
The system SHALL add new chart components for response times (time to scene, time to hospital). The system SHALL add new chart components for observation types breakdown (EMS scene observations, transport observations). The system SHALL add new chart components for time-to-intervention metrics per IG definitions. The system SHALL add new chart components for line chart for temporal trends (monthly/weekly).

#### Scenario: Display EMS metrics and time-based observations
**Acceptance Criteria:**
```
Given EMS observations with response times in FHIR
When the observations chart renders
Then display average, median, and range for:
  - Time from alarm to EMS arrival at scene
  - Time from scene to hospital arrival
  - Total response time

Given observation data spans 6 months
When viewing the time-based line chart
Then display encounters, fatalities, and injuries per month with proper labeling
```

**References:**
- IG requirement: Section 3.3 "Charts" - Observation charts
- New components: `src/components/dashboard/EmsMetricsChart.tsx`, `src/components/dashboard/TrendsChart.tsx`

---

### Requirement: INJURY_CLASSIFICATION_CHARTS
The system SHALL update injury classification charts to use IG-defined MOI ValueSet categories. The system SHALL update injury classification charts to group by vehicle type, pedestrian, collision type, etc. The system SHALL support age × injury mechanism stacked/grouped bar charts. The system SHALL display counts and percentages.

#### Scenario: Visualize injury mechanisms per IG ValueSets
**Acceptance Criteria:**
```
Given conditions coded with PH Road Safety IG ValueSet for MOI
When the injury mechanism chart renders
Then display bars for each ValueSet category, not hardcoded classifications

Given 50 "Motorcycle collision", 30 "Pedestrian accident", 20 "Car collision"
When viewing the chart
Then display three bars with correct counts and total 100
```

**References:**
- IG requirement: Section 2.1.2 "Conditions" & 3.3 "Charts" - MOI classification
- Replaces: `src/utils/snomedMapping.ts:94-111` hardcoded categories
- Updates: `src/components/dashboard/InjuryBarChart.tsx`

---

### Requirement: INTERACTIVE_LEGENDS
The chart components SHALL support drill-down from aggregate charts to detailed tables. The chart components SHALL support hover tooltips with counts and percentages. The chart components SHALL support click-to-highlight related data. The chart components SHALL support filter application based on chart selection.

#### Scenario: Drill-down from charts to detailed data
**Acceptance Criteria:**
```
Given I hover over a chart element
When tooltip appears
Then it shows relevant data with percentage and count

Given I click on a chart segment
When drill-down action occurs
Then apply relevant filters to detailed data tables
```

**References:**
- Enhances: All Recharts components
- New: `onClick` handlers and state management for filters

---

## MODIFIED Requirements

### Requirement: AGE_GROUP_ALIGNMENT
The system SHALL update age group classifications to match IG-specified demographic categories instead of current hardcoded groups.

#### Scenario: Display age groups per IG demographic definitions
**Acceptance Criteria:**
```
Given patient demographics data
When grouping by age
Then use age bands defined in PH Road Safety IG

Given IG specifies: 0-15, 16-25, 26-45, 46-65, 66+
When applying age groups
Then age groups should match those exactly (not current 0-14, 15-24, 25-44, 45-64, 65+)
```

**References:**
- IG requirement: Section 2.1.2 "Demographics" - age groupings
- Current: `src/utils/metricsCalculator.ts:123-147` hardcoded age groups
- Updates: `src/components/dashboard/AgeBarChart.tsx`

---

### Requirement: MORTALITY_DISPLAY_ENHANCED
The system SHALL update mortality pie chart to use `Encounter.hospitalization.dischargeDisposition` from IG ValueSet. The system SHALL show expired, transferred, discharged, and other disposition categories. The system SHALL include counts and case fatality percentage in tooltip.

#### Scenario: Display disposition breakdown per IG
**Acceptance Criteria:**
```
Given encounters with various discharge dispositions
When mortality chart renders
Then display pie slices for each disposition value from IG ValueSet

Given 10 expired, 5 transferred, 185 discharged patients
When viewing the chart
Then display 3 pie slices with correct tooltips showing counts and "5% case fatality rate" for expired category
```

**References:**
- Current code: `src/pages/Index.tsx:100-101` shows expired/survived binary
- IG requirement: Section 2.1.1 "Encounters" - disposition classification
- Updated: `src/components/dashboard/MortalityPieChart.tsx`

---

### Requirement: SEX_CLASSIFICATION_UPDATE
The system SHALL update sex/gender classification to include "unknown" and "other" categories. The system SHALL update sex/gender classification to use Patient.gender per FHIR spec. The system SHALL update sex/gender classification to show percentages in chart.

#### Scenario: Display gender distribution more accurately
**Acceptance Criteria:**
```
Given patients with various gender values
When gender pie chart renders
Then display male, female, other, and unknown categories with counts and percentages
```

**References:**
- Current code: `src/utils/metricsCalculator.ts:149-167`
- Component: `src/components/dashboard/SexPieChart.tsx`

---

### Requirement: ENHANCED_METRIC_CARDS
The system SHALL update metric cards to display IG-aligned key performance indicators. The system SHALL display number of encounters (total, accident-related). The system SHALL display fatalities (from Encounter.dischargeDisposition). The system SHALL display non-fatal injuries (from Condition resources). The system SHALL display case fatality rate ((fatal / total encounters) * 100). The system SHALL display EMS average response times (from Observation resources).

#### Scenario: Display PH Road Safety IG key performance indicators
**Acceptance Criteria:**
```
Given I view the dashboard
When data loads from FHIR server
Then metric cards should show IG-aligned KPIs instead of placeholder calculations

Given a date range with 15 fatal encounters out of 200 total
When the case fatality rate is calculated
Then the metric should display 7.5% (15/200 * 100)
```

**References:**
- IG requirement: Section 3 "Dashboard Metrics & Visualizations"
- Current: `src/pages/Index.tsx:191-230` needs metric updates
- Updated: `src/components/dashboard/MetricCard.tsx`
