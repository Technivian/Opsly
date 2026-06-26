# ROI Calculation System - Technical Documentation

**Author**: Opsly Development Team  
**Last Updated**: 2024  
**Status**: Production-Ready

---

## Overview

This document explains how Opsly calculates Return on Investment (ROI) for automation runs. **Every number is explainable in one sentence** - this is our design principle for Dutch SME customers who demand transparency.

### Design Principle

> "If a Dutch SME owner asks 'where does this number come from?', we must answer in one sentence."

No AI confidence scores, no black boxes - just simple, defensible math on real execution data.

---

## Architecture

### File Structure

- **[shared/schema.ts](../shared/schema.ts)** - `RunStats` interface with raw metrics
- **[server/roi-calculator.ts](../server/roi-calculator.ts)** - All ROI formulas and calculations
- **[server/routes.ts](../server/routes.ts)** - API endpoints (`/api/roi`, `/api/automations/:id/roi`)
- **[server/execution/templates/](../server/execution/templates/)** - Template executors that collect metrics

### Data Flow

```
1. Automation Runs → Collect RunStats during execution
2. RunStats stored in runs.statsJson (JSONB column)
3. API endpoint queries runs table
4. roi-calculator.ts processes raw stats
5. Return explainable metrics to client
```

---

## Metrics Schema

### RunStats Interface

Every automation run stores these metrics in `runs.statsJson`:

```typescript
interface RunStats {
  // Core output metrics
  tasksCreated?: number;          // Number of tasks/tickets/records created
  itemsProcessed?: number;        // Number of emails/forms/leads handled
  
  // Time tracking (in minutes)
  estimatedMinutesSaved?: number; // Time saved = itemsProcessed × templateTimePerItem
  actualProcessingTimeMs?: number; // Wall-clock time the automation took to run
  
  // Quality & reliability metrics (for confidence scoring)
  exceptions?: number;            // Number of errors encountered during execution
  manualOverrides?: number;       // Times human intervention was needed
  successfulActions?: number;     // Actions completed without error
  totalActions?: number;          // Total actions attempted (for success rate)
  
  // Template-specific metrics (optional, varies by template type)
  emailsSent?: number;
  slackMessagesSent?: number;
  crmRecordsCreated?: number;
  crmRecordsUpdated?: number;
}
```

**Why these fields?**

- **tasksCreated**: Measures output volume (tickets, records, etc.)
- **itemsProcessed**: Measures input volume (emails, forms, leads)
- **estimatedMinutesSaved**: Business value in time units
- **actualProcessingTimeMs**: Operational efficiency (how fast automation runs)
- **exceptions**: Quality indicator (errors hurt confidence)
- **successfulActions / totalActions**: Success rate calculation
- **Template-specific**: Proves work was done (audit trail)

---

## Time Savings Calculation

### Formula (Per Template)

Each template defines **minutes saved per item processed**:

| Template | Time per Item | Rationale |
|----------|---------------|-----------|
| Email Triage | 5 minutes | Manual email reading, categorization, task creation |
| Form → CRM | 8 minutes | Manual form data entry into CRM fields |
| Lead Follow-up | 10 minutes | Researching lead, writing email, updating CRM |
| Lead → Slack | 15 minutes | Checking CRM, writing Slack message, updating status |

**Calculation**:
```typescript
estimatedMinutesSaved = itemsProcessed × minutesPerItem
```

**Example**:
- Email triage processed 20 emails → `20 × 5 = 100 minutes saved`
- Converted to hours → `100 / 60 = 1.67 hours`

**Explainable**: "We saved 100 minutes because the automation processed 20 emails, and each email would take 5 minutes to handle manually."

---

## Confidence Score (0-100)

### Formula (Weighted Average)

```typescript
confidenceScore = 
  (successRateScore × 50%) + 
  (consistencyScore × 30%) + 
  (volumeScore × 20%)
```

### Components

#### 1. Success Rate Score (50% weight)

```typescript
successRate = (successfulRuns / totalRuns) × 100
successRateScore = min(100, successRate)
```

**Explainable**: "90% of runs completed successfully (9 out of 10), so success rate score is 90/100."

#### 2. Consistency Score (30% weight)

Measures how similar the time savings are across runs.

```typescript
// Calculate standard deviation of time saved
avg = mean(timesSaved)
variance = mean((timesSaved - avg)²)
stdDev = √variance
coefficientOfVariation = stdDev / avg

// Convert to score (lower CV = higher consistency)
consistencyScore = max(0, 100 - (CV × 200))
```

**Examples**:
- CV = 0% (all runs save exactly the same time) → Score = 100
- CV = 10% (low variance) → Score = 80
- CV = 50% (high variance) → Score = 0

**Explainable**: "This automation saves a consistent amount of time each run (low variance), so consistency score is 85/100."

**Special cases**:
- Only 1 successful run → Score = 50 (neutral, not enough data)
- 0 successful runs → Score = 0

#### 3. Volume Score (20% weight)

Measures whether we have enough data to trust the statistics.

```typescript
volumeScore = min(100, (totalRuns / 10) × 100)
```

**Examples**:
- 1 run → Score = 10
- 5 runs → Score = 50
- 10+ runs → Score = 100

**Explainable**: "We've run this automation 15 times, which gives us high confidence in the numbers (volume score 100/100)."

### Overall Confidence Example

```
Automation with:
- 18 runs total
- 16 successful (88.9% success rate)
- Time savings: 80, 85, 78, 82, 84, ... (avg 82 min, CV 5%)

Success Rate Score: 88.9
Consistency Score: 90 (5% CV)
Volume Score: 100 (18 runs)

Confidence = (88.9 × 0.5) + (90 × 0.3) + (100 × 0.2)
           = 44.45 + 27 + 20
           = 91.45 → 91
```

**Explainable**: "Confidence is 91/100 because: runs succeed 89% of the time, time savings are very consistent, and we have plenty of data (18 runs)."

---

## Rolling 30-Day Window

### Why 30 Days?

Recent performance is more relevant than all-time stats. Dutch SME owners want to see: "What did this save me THIS MONTH?"

### Filter Logic

```typescript
function filterRunsToWindow(runs: Run[], days: number = 30): Run[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return runs.filter((run) => {
    const runDate = run.startedAt ? new Date(run.startedAt) : new Date();
    return runDate >= cutoffDate;
  });
}
```

**Explainable**: "ROI shows the last 30 days of activity to reflect current performance."

---

## API Endpoints

### 1. Organization-Level ROI

**Endpoint**: `GET /api/roi`  
**Auth**: Required (session-based)

**Response**:
```json
{
  "hoursSaved": 45,
  "totalRuns": 120,
  "successfulRuns": 108,
  "failedRuns": 12,
  "overallSuccessRate": 90.0,
  "overallConfidence": 87,
  "totalItemsProcessed": 542,
  "totalTasksCreated": 234,
  
  "org": {
    "totalHoursSaved": 45,
    "totalMinutesSaved": 2700,
    "totalRuns": 120,
    "successfulRuns": 108,
    "failedRuns": 12,
    "overallSuccessRate": 90.0,
    "overallConfidence": 87,
    "totalItemsProcessed": 542,
    "totalTasksCreated": 234,
    "activeAutomations": 4,
    "totalAutomations": 6,
    "windowDays": 30,
    "windowStartDate": "2024-12-15",
    "windowEndDate": "2025-01-14"
  },
  
  "automations": [
    {
      "automationConfigId": 1,
      "automationName": "Email Triage",
      "totalMinutesSaved": 1200,
      "totalHoursSaved": 20,
      "totalRuns": 45,
      "successfulRuns": 42,
      "failedRuns": 3,
      "successRate": 93.3,
      "confidenceScore": 91,
      "confidenceFactors": {
        "successRateScore": 93,
        "consistencyScore": 88,
        "volumeScore": 100
      },
      "totalItemsProcessed": 240,
      "totalTasksCreated": 87,
      "totalExceptions": 12,
      "avgExceptionsPerRun": 0.3,
      "windowStartDate": "2024-12-15",
      "windowEndDate": "2025-01-14"
    }
  ]
}
```

**Implementation**:
```typescript
// 1. Get all runs for org
const allRuns = await storage.getRunsByOrg(orgId);

// 2. Filter to last 30 days
const runsInWindow = filterRunsToWindow(allRuns, 30);

// 3. Calculate per-automation ROI
const automationROIs = configs.map(config => {
  const configRuns = runsInWindow.filter(r => r.automationConfigId === config.id);
  return calculateAutomationROI(configRuns, config.id, config.name);
});

// 4. Calculate org-level ROI
const orgROI = calculateOrgROI(runsInWindow, automationROIs, configs.length);
```

### 2. Per-Automation ROI

**Endpoint**: `GET /api/automations/:id/roi`  
**Auth**: Required (session-based)  
**Query Params**: `days` (optional, default: 30)

**Response**:
```json
{
  "automationConfigId": 1,
  "automationName": "Email Triage",
  "totalMinutesSaved": 1200,
  "totalHoursSaved": 20,
  "totalRuns": 45,
  "successfulRuns": 42,
  "failedRuns": 3,
  "successRate": 93.3,
  "confidenceScore": 91,
  "confidenceFactors": {
    "successRateScore": 93,
    "consistencyScore": 88,
    "volumeScore": 100
  },
  "totalItemsProcessed": 240,
  "totalTasksCreated": 87,
  "totalExceptions": 12,
  "avgExceptionsPerRun": 0.3,
  "windowStartDate": "2024-12-15",
  "windowEndDate": "2025-01-14"
}
```

**Example Usage**:
```bash
# Last 30 days (default)
curl -X GET http://localhost:5000/api/automations/1/roi

# Last 7 days
curl -X GET http://localhost:5000/api/automations/1/roi?days=7

# Last 90 days
curl -X GET http://localhost:5000/api/automations/1/roi?days=90
```

---

## Template Executor Implementation

### How to Track Metrics

Each template executor must return `ExecutionResult` with comprehensive metrics:

```typescript
export async function executeEmailTriage(ctx: ExecutionContext): Promise<ExecutionResult> {
  const { runId, config } = ctx;
  
  // Start timer
  const startTime = Date.now();
  
  // Initialize counters
  let itemsProcessed = 0;
  let tasksCreated = 0;
  let exceptions = 0;
  let totalActions = 0;
  let successfulActions = 0;

  try {
    // Process items
    for (const email of emails) {
      try {
        // Do work
        totalActions++;
        // ... processing logic ...
        
        itemsProcessed++;
        successfulActions++;
      } catch (error) {
        totalActions++;
        exceptions++;
      }
    }

    // Calculate time saved (template-specific formula)
    const estimatedMinutesSaved = itemsProcessed * 5; // 5 min per email
    const actualProcessingTimeMs = Date.now() - startTime;

    return {
      success: true,
      itemsProcessed,
      tasksCreated,
      estimatedMinutesSaved,
      actualProcessingTimeMs,
      exceptions,
      totalActions,
      successfulActions,
    };
  } catch (error: any) {
    return {
      success: false,
      itemsProcessed: 0,
      estimatedMinutesSaved: 0,
      exceptions: 0,
      error: error.message,
    };
  }
}
```

**Key Points**:

1. **Always track `totalActions` and `successfulActions`** - This enables per-run success rate calculation
2. **Start timer at beginning** - `actualProcessingTimeMs` shows operational efficiency
3. **Increment counters in try/catch** - Ensures accurate error tracking
4. **Template-specific time formula** - Each template defines its own `minutesPerItem` constant

---

## Org-Level Confidence (Weighted Average)

The org-level confidence is NOT a simple average - it's weighted by hours saved.

### Formula

```typescript
weightedConfidenceSum = 0;
totalWeight = 0;

for (const automation of automations) {
  const weight = automation.totalHoursSaved || 1; // Minimum weight = 1
  weightedConfidenceSum += automation.confidenceScore × weight;
  totalWeight += weight;
}

overallConfidence = round(weightedConfidenceSum / totalWeight);
```

### Example

```
Automation A: Confidence 95, Hours Saved 40
Automation B: Confidence 60, Hours Saved 5

Weighted Confidence:
= ((95 × 40) + (60 × 5)) / (40 + 5)
= (3800 + 300) / 45
= 4100 / 45
= 91.1 → 91
```

**Explainable**: "Overall confidence is 91/100 because automations that save more time (like Automation A) have more influence on the org-level score."

**Why weighted?**

If Automation A saves 40 hours with 95% confidence, and Automation B saves 5 hours with 60% confidence, the org-level confidence should be closer to 95% - most of the value comes from the reliable automation.

---

## Data Retention & Privacy

### What We Store

- **Raw execution data**: All `RunStats` preserved in `runs.statsJson` (JSONB)
- **Run logs**: Detailed execution logs in `run_logs` table
- **No PII**: We track counts, not content (e.g., "20 emails" not email bodies)

### Org Isolation

All queries filter by `orgId` - users can only see their own organization's data.

```typescript
const allRuns = await storage.getRunsByOrg(orgId);
```

---

## Testing ROI Calculations

### Manual Testing

1. **Create automation** with known configuration
2. **Run automation** multiple times
3. **Query `/api/roi`** endpoint
4. **Verify metrics**:
   - Does `totalRuns` match database count?
   - Does `totalMinutesSaved` = sum of `estimatedMinutesSaved` from successful runs?
   - Does `successRate` = (successful / total) × 100?
   - Are confidence factors explainable?

### Test Cases

#### Scenario 1: Perfect Success
```
10 runs, all successful, all save 100 minutes
Expected:
- successRate: 100%
- totalMinutesSaved: 1000
- successRateScore: 100
- consistencyScore: 100 (0% variance)
- volumeScore: 100 (10 runs)
- confidenceScore: 100
```

#### Scenario 2: Some Failures
```
10 runs, 8 successful (save 100 min each), 2 failed
Expected:
- successRate: 80%
- totalMinutesSaved: 800
- successRateScore: 80
- consistencyScore: 100 (0% variance)
- volumeScore: 100
- confidenceScore: (80 × 0.5) + (100 × 0.3) + (100 × 0.2) = 90
```

#### Scenario 3: High Variance
```
5 runs, all successful, save: [50, 100, 150, 100, 50]
Avg: 90, StdDev: ~41.8, CV: 46.4%
Expected:
- successRate: 100%
- totalMinutesSaved: 450
- successRateScore: 100
- consistencyScore: max(0, 100 - 46.4 × 2) = 7.2 → 7
- volumeScore: 50 (5 runs)
- confidenceScore: (100 × 0.5) + (7 × 0.3) + (50 × 0.2) = 62.1 → 62
```

---

## Frontend Integration (Future Work)

### Dashboard Widgets

The API is ready for these UI components:

1. **Org-Level Summary Card**
   - Total hours saved (big number)
   - Overall confidence score (0-100 gauge)
   - Success rate percentage
   - Active vs total automations

2. **Per-Automation Table**
   - Automation name
   - Hours saved (last 30 days)
   - Success rate
   - Confidence score
   - Actions (view details, configure)

3. **Confidence Score Breakdown (Tooltip)**
   - "Success Rate: 93/100 (93% of runs succeed)"
   - "Consistency: 88/100 (time savings are predictable)"
   - "Volume: 100/100 (18 runs provide reliable stats)"

4. **Time Window Selector**
   - Last 7 days
   - Last 30 days (default)
   - Last 90 days
   - Custom range

### Example API Call

```typescript
// In React component
const { data: roi } = useQuery({
  queryKey: ['/api/roi'],
  queryFn: async () => {
    const res = await fetch('/api/roi');
    if (!res.ok) throw new Error('Failed to fetch ROI');
    return res.json();
  },
});

// Display org-level metrics
<div>
  <h2>{roi.hoursSaved} Hours Saved</h2>
  <p>Confidence: {roi.overallConfidence}/100</p>
  <p>Success Rate: {roi.overallSuccessRate}%</p>
</div>

// Display per-automation table
<table>
  {roi.automations.map(auto => (
    <tr key={auto.automationConfigId}>
      <td>{auto.automationName}</td>
      <td>{auto.totalHoursSaved}h</td>
      <td>{auto.successRate}%</td>
      <td>{auto.confidenceScore}/100</td>
    </tr>
  ))}
</table>
```

---

## Troubleshooting

### "Confidence score is 0"

**Cause**: No successful runs in the last 30 days.

**Fix**: Run the automation at least once successfully, or check if runs are older than 30 days (adjust time window).

### "Time savings seem too high"

**Cause**: Template's `minutesPerItem` multiplier may be too generous.

**Fix**: Adjust the multiplier in the template executor. For example, if email triage is set to 5 min/email but realistically takes 3 minutes, update:

```typescript
const estimatedMinutesSaved = itemsProcessed * 3; // Was 5
```

### "Org-level confidence different from automation confidence"

**Cause**: Org-level confidence is a **weighted average** by hours saved.

**Fix**: This is expected behavior. Automations that save more time have more influence on the org score.

### "Consistency score is low despite all runs succeeding"

**Cause**: High variance in time saved across runs (some save 50 min, others save 150 min).

**Fix**: This indicates the automation's impact varies significantly - which lowers confidence. Investigate why some runs save much more/less time than others.

---

## Future Enhancements

### Planned Features

1. **Manual Override Tracking**: Track when humans intervene in automation runs
2. **Cost Savings**: Convert time saved to monetary value (hourly rate × hours)
3. **Trend Analysis**: Show ROI trends over time (week-over-week, month-over-month)
4. **Benchmark Comparisons**: Compare org ROI to industry benchmarks
5. **Predictive ROI**: Forecast ROI for next 30 days based on historical trends

### Not Planned (Anti-Features)

- **AI Confidence Scores**: We use deterministic formulas, not black-box AI
- **Gamification**: No badges or achievements - this is business metrics, not a game
- **Social Sharing**: ROI data is sensitive business intelligence, not for social media

---

## Summary

**One-sentence explanations for each metric:**

| Metric | Explanation |
|--------|-------------|
| Hours Saved | "Sum of time saved across all successful runs in the last 30 days, converted from minutes to hours" |
| Success Rate | "Percentage of runs that completed successfully without errors" |
| Confidence Score | "Weighted score (0-100) combining success rate, consistency of results, and data volume" |
| Success Rate Score | "Component of confidence: higher if most runs succeed" |
| Consistency Score | "Component of confidence: higher if runs save similar amounts of time each execution" |
| Volume Score | "Component of confidence: higher if we have more runs to base statistics on (max at 10+ runs)" |
| Org-Level Confidence | "Weighted average of automation confidences, where automations saving more time have more influence" |

**Key Principle**: Every number comes from real execution data, not estimates or AI models. If questioned, we can trace any metric back to specific runs in the database.

---

**End of Documentation**
