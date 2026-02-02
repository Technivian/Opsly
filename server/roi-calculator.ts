/**
 * ROI Calculator - Real, Explainable Metrics
 * 
 * DESIGN PRINCIPLE (from user requirement):
 * "If a Dutch SME asks 'where does this number come from?', we must answer in one sentence."
 * 
 * Every calculation here is transparent, defensible, and based on actual execution data.
 * No AI confidence scores, no black boxes - just simple math on real outcomes.
 */

import type { Run } from "@shared/schema";

/**
 * Per-automation metrics over a rolling 30-day window.
 * 
 * Why 30 days? Recent performance is more relevant than all-time stats.
 * Dutch SME owners want to see: "What did this save me THIS MONTH?"
 */
export interface AutomationROI {
  automationConfigId: number;
  automationName: string;
  
  // Time impact (primary business value)
  totalMinutesSaved: number;      // Sum of estimatedMinutesSaved from successful runs
  totalHoursSaved: number;        // totalMinutesSaved / 60
  
  // Execution metrics (trust indicators)
  totalRuns: number;              // All runs in window
  successfulRuns: number;         // Runs with status=SUCCESS
  failedRuns: number;             // Runs with status=FAILED
  successRate: number;            // (successfulRuns / totalRuns) × 100
  
  // Confidence score (0-100, explainable components)
  confidenceScore: number;        // Weighted formula: see calculateConfidenceScore()
  confidenceFactors: {
    successRateScore: number;     // Weight: 50% - Did runs complete successfully?
    consistencyScore: number;     // Weight: 30% - Do runs save similar amounts of time?
    volumeScore: number;          // Weight: 20% - Have we run this enough times to trust it?
  };
  
  // Volume metrics (scale of impact)
  totalItemsProcessed: number;    // Sum of itemsProcessed across runs
  totalTasksCreated: number;      // Sum of tasksCreated across runs
  
  // Quality metrics (operational health)
  totalExceptions: number;        // Sum of exceptions across all runs
  avgExceptionsPerRun: number;    // totalExceptions / totalRuns
  
  // Time window
  windowStartDate: string;        // ISO date of oldest run in calculation
  windowEndDate: string;          // ISO date (today)
}

/**
 * Organization-level ROI summary.
 * 
 * This is the "executive dashboard" view: total value delivered across all automations.
 */
export interface OrgROI {
  // Time impact (primary KPI)
  totalHoursSaved: number;        // Sum of all automation hours saved
  totalMinutesSaved: number;      // Raw total before conversion
  
  // Execution summary
  totalRuns: number;              // All runs across all automations
  successfulRuns: number;         // Successful runs
  failedRuns: number;             // Failed runs
  overallSuccessRate: number;     // (successfulRuns / totalRuns) × 100
  
  // Confidence in org-level savings
  overallConfidence: number;      // Average confidence across automations (weighted by hours saved)
  
  // Volume metrics
  totalItemsProcessed: number;    // Total items handled by all automations
  totalTasksCreated: number;      // Total tasks/tickets/records created
  
  // Automation health
  activeAutomations: number;      // Count of automations with runs in window
  totalAutomations: number;       // Count of all automation configs
  
  // Time window
  windowDays: number;             // Days included in calculation (typically 30)
  windowStartDate: string;
  windowEndDate: string;
}

/**
 * Calculate confidence score for an automation.
 * 
 * FORMULA EXPLANATION (for Dutch SME owner):
 * "Confidence shows how reliably this automation delivers value, based on:
 *  - Success rate (50%): Do runs finish successfully?
 *  - Consistency (30%): Do runs save similar amounts of time?
 *  - Volume (20%): Have we run this enough times to trust the numbers?"
 * 
 * @param runs - All runs for the automation (filtered to 30-day window)
 * @returns Score from 0-100, higher = more trustworthy ROI numbers
 */
function calculateConfidenceScore(runs: Run[]): {
  score: number;
  factors: AutomationROI["confidenceFactors"];
} {
  if (runs.length === 0) {
    return {
      score: 0,
      factors: {
        successRateScore: 0,
        consistencyScore: 0,
        volumeScore: 0,
      },
    };
  }

  // Factor 1: Success Rate Score (50% weight)
  // "Percentage of runs that completed without errors"
  const successfulRuns = runs.filter((r) => r.status === "SUCCESS").length;
  const successRate = (successfulRuns / runs.length) * 100;
  const successRateScore = Math.min(100, successRate);

  // Factor 2: Consistency Score (30% weight)
  // "How similar are the time savings across runs? Low variance = predictable value"
  const successfulRunsWithStats = runs.filter(
    (r) => r.status === "SUCCESS" && r.statsJson?.estimatedMinutesSaved
  );
  
  let consistencyScore = 0;
  if (successfulRunsWithStats.length >= 2) {
    const timesSaved = successfulRunsWithStats.map(
      (r) => r.statsJson!.estimatedMinutesSaved || 0
    );
    const avg = timesSaved.reduce((sum, t) => sum + t, 0) / timesSaved.length;
    const variance =
      timesSaved.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) /
      timesSaved.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = avg > 0 ? stdDev / avg : 0;
    
    // Convert CV to score: 0% CV = 100 points, >50% CV = 0 points
    consistencyScore = Math.max(0, 100 - coefficientOfVariation * 200);
  } else if (successfulRunsWithStats.length === 1) {
    // Only one run - neutral consistency (50 points)
    consistencyScore = 50;
  }

  // Factor 3: Volume Score (20% weight)
  // "Have we run this enough times to trust the statistics?"
  // 1-5 runs = low confidence, 10+ runs = high confidence
  const volumeScore = Math.min(100, (runs.length / 10) * 100);

  // Weighted average
  const totalScore =
    successRateScore * 0.5 + consistencyScore * 0.3 + volumeScore * 0.2;

  return {
    score: Math.round(totalScore),
    factors: {
      successRateScore: Math.round(successRateScore),
      consistencyScore: Math.round(consistencyScore),
      volumeScore: Math.round(volumeScore),
    },
  };
}

/**
 * Calculate ROI for a specific automation over the last 30 days.
 * 
 * @param runs - All runs for this automation (pre-filtered to 30-day window)
 * @param automationName - Display name of the automation
 * @returns Comprehensive ROI metrics
 */
export function calculateAutomationROI(
  runs: Run[],
  automationConfigId: number,
  automationName: string
): AutomationROI {
  const successfulRuns = runs.filter((r) => r.status === "SUCCESS");
  const failedRuns = runs.filter((r) => r.status === "FAILED");

  // Time savings (sum across successful runs only)
  const totalMinutesSaved = successfulRuns.reduce(
    (sum, run) => sum + (run.statsJson?.estimatedMinutesSaved || 0),
    0
  );

  // Volume metrics
  const totalItemsProcessed = successfulRuns.reduce(
    (sum, run) => sum + (run.statsJson?.itemsProcessed || 0),
    0
  );

  const totalTasksCreated = successfulRuns.reduce(
    (sum, run) => sum + (run.statsJson?.tasksCreated || 0),
    0
  );

  // Quality metrics
  const totalExceptions = runs.reduce(
    (sum, run) => sum + (run.statsJson?.exceptions || 0),
    0
  );

  // Success rate calculation
  const successRate =
    runs.length > 0 ? (successfulRuns.length / runs.length) * 100 : 0;

  // Confidence score
  const confidence = calculateConfidenceScore(runs);

  // Time window (30 days back from today)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  return {
    automationConfigId,
    automationName,
    totalMinutesSaved: Math.round(totalMinutesSaved),
    totalHoursSaved: Math.round(totalMinutesSaved / 60),
    totalRuns: runs.length,
    successfulRuns: successfulRuns.length,
    failedRuns: failedRuns.length,
    successRate: Math.round(successRate * 10) / 10, // One decimal place
    confidenceScore: confidence.score,
    confidenceFactors: confidence.factors,
    totalItemsProcessed,
    totalTasksCreated,
    totalExceptions,
    avgExceptionsPerRun:
      runs.length > 0 ? Math.round((totalExceptions / runs.length) * 10) / 10 : 0,
    windowStartDate: thirtyDaysAgo.toISOString().split("T")[0],
    windowEndDate: today.toISOString().split("T")[0],
  };
}

/**
 * Calculate organization-wide ROI over the last 30 days.
 * 
 * This aggregates all automation metrics into a single executive summary.
 * 
 * @param allRuns - All runs across all automations (pre-filtered to 30-day window)
 * @param automationROIs - Individual automation ROI calculations
 * @param totalAutomationCount - Total number of automation configs in org
 * @returns Organization-level ROI summary
 */
export function calculateOrgROI(
  allRuns: Run[],
  automationROIs: AutomationROI[],
  totalAutomationCount: number
): OrgROI {
  const successfulRuns = allRuns.filter((r) => r.status === "SUCCESS");
  const failedRuns = allRuns.filter((r) => r.status === "FAILED");

  // Sum up time savings across all automations
  const totalMinutesSaved = automationROIs.reduce(
    (sum, roi) => sum + roi.totalMinutesSaved,
    0
  );

  // Sum up volume metrics
  const totalItemsProcessed = automationROIs.reduce(
    (sum, roi) => sum + roi.totalItemsProcessed,
    0
  );

  const totalTasksCreated = automationROIs.reduce(
    (sum, roi) => sum + roi.totalTasksCreated,
    0
  );

  // Overall success rate
  const overallSuccessRate =
    allRuns.length > 0 ? (successfulRuns.length / allRuns.length) * 100 : 0;

  // Overall confidence: weighted average by hours saved
  // (Automations that save more time have more influence on org-level confidence)
  let weightedConfidenceSum = 0;
  let totalWeight = 0;
  
  for (const roi of automationROIs) {
    const weight = roi.totalHoursSaved || 1; // Minimum weight of 1
    weightedConfidenceSum += roi.confidenceScore * weight;
    totalWeight += weight;
  }
  
  const overallConfidence =
    totalWeight > 0 ? Math.round(weightedConfidenceSum / totalWeight) : 0;

  // Active automations (have runs in window)
  const activeAutomations = new Set(allRuns.map((r) => r.automationConfigId))
    .size;

  // Time window
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  return {
    totalHoursSaved: Math.round(totalMinutesSaved / 60),
    totalMinutesSaved: Math.round(totalMinutesSaved),
    totalRuns: allRuns.length,
    successfulRuns: successfulRuns.length,
    failedRuns: failedRuns.length,
    overallSuccessRate: Math.round(overallSuccessRate * 10) / 10,
    overallConfidence,
    totalItemsProcessed,
    totalTasksCreated,
    activeAutomations,
    totalAutomations: totalAutomationCount,
    windowDays: 30,
    windowStartDate: thirtyDaysAgo.toISOString().split("T")[0],
    windowEndDate: today.toISOString().split("T")[0],
  };
}

/**
 * Filter runs to last N days.
 * 
 * @param runs - All runs to filter
 * @param days - Number of days to look back (default: 30)
 * @returns Runs within the time window
 */
export function filterRunsToWindow(runs: Run[], days: number = 30): Run[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return runs.filter((run) => {
    // Use startedAt if available, otherwise fall back to creation time
    const runDate = run.startedAt ? new Date(run.startedAt) : new Date();
    return runDate >= cutoffDate;
  });
}
