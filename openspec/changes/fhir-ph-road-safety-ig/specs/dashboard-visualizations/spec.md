# Dashboard Visualizations and Metrics

## ADDED Requirements

#### Requirement: METRIC_CARD_UPDATES
**Capability:** Updated Metric Cards with IG requirement: Section 2.1 "Resource Queries & Aggregations"

---

#### Requirement: OBSERVATION_CHARTS
**Capability:** Observation-based Charts 
#### Scenario: Display EMS metrics and time-based observations

**Requirement:** The system SHALL add new chart components for:
- Response times (time to scene, time to hospital)
- Observation types breakdown (EMS scene observations, transport observations)
- Time-to-intervention metrics per IG definitions
- Line chart for temporal trends (monthly/weekly)

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

#### Requirement: INJURY_CLASSIFICATION_CHARTS
**Capability:** Mechanism of Injury (MOI) Charts 
#### Scenario: Visualize injury mechanisms per IG ValueSets

**Requirement:** The system SHALL update injury classification charts to:
- Use IG-defined MOI ValueSet categories
- Group by vehicle type, pedestrian, collision type, etc.
- Support age × injury mechanism stacked/grouped bar charts
- Display counts and percentages

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

#### Requirement: INTERACTIVE_LEGENDS
**Capability:** Chart Interaction 
#### Scenario: Drill-down from charts to detailed data

**Requirement:** The chart components SHALL support:
- Drill-down from aggregate charts to detailed tables
- Hover tooltips with counts and percentages
- Click-to-highlight related data
- Filter application based on chart selection

**Acceptance Criteria:**
**References:**
- Enhances: All Recharts components
- New: `onClick` handlers and state management for filters

---

## MODIFIED Requirements

#### Requirement: AGE_GROUP_ALIGNMENT
**Capability:** IG-aligned Age Groupings 
#### Scenario: Display age groups per IG demographic definitions

**Requirement:** The system SHALL update age group classifications to match IG-specified demographic categories instead of current hardcoded groups.

**Acceptance Criteria:**
```
Given patient demographics data
When grouping by age
Then use age bands defined in PH Road Safety IG

If IG specifies: 0-15, 16-25, 26-45, 46-65, 66+
Then age groups should match those exactly (not current 0-14, 15-24, 25-44, 45-64, 65)

#### Requirement: MORTALITY_DISPLAY_ENHANCED
**Capability:** Enhanced Mortality Visualization 
#### Scenario: Display disposition breakdown per IG

**Requirement:** The system SHALL update mortality pie chart to:
- Use `Encounter.hospitalization.dischargeDisposition` from IG ValueSet
- Show expired, transferred, discharged, and other disposition categories
- Include counts and case fatality percentage in tooltip

**Acceptance Criteria:**
```
Given encounters with various discharge dispositions
When mortality chart renders
Then display pie slices for each disposition value from IG ValueSet

Given 10 expired, 5 transferred, 185 discharged patients
When viewing the chart
Then display 3 pie slices with correct tooltips showing counts and "5% case fatality rate" for expired category.

The issue might be that the IG specification isn't accessible (404 error). We may need to use fallback code-based heuristics.

**References:**
- Current code: `src/pages/Index.tsx:100-101` shows expired/survived binary
- IG requirement: Section 2.1.1 "Encounters" - disposition classification

---

#### Requirement: SEX_CLASSIFICATION_UPDATE
**Capability:** Enhanced Gender Display 
#### Scenario: Display gender distribution more accurately

**Requirement:** The system SHALL update sex/gender classification to:
- Include "unknown" and "other" categories
- Use Patient.gender per FHIR spec
- Show percentages in chart

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

#### Requirement:metric_card_updates
**Capability:** Updated Metric Cards with IG-specific KPIs 
#### Scenario: Display PH Road Safety IG key performance indicators

**Requirement:** The system SHALL update metric cards to display IG-aligned key performance indicators including:
- Number of encounters (total, accident-related)
- Fatalities (from Encounter.dischargeDisposition)
- Non-fatal injuries (from Condition resources)
- Case Fatality Rate ((fatal / total encounters) * 100)
- EMS average response times (from Observation resources)

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
