/**
 * ROI Calculator Tests
 * 
 * These tests verify the real ROI calculation logic (confidence scores, success rates, etc.)
 */

import { describe, it, expect, beforeAll } from "vitest";
import type { Run } from "@shared/schema";
import {
  calculateAutomationROI,
  calculateOrgROI,
  filterRunsToWindow,
} from "../server/roi-calculator";

describe("ROI Calculator", () => {
  describe("filterRunsToWindow", () => {
    it("should filter runs to last 30 days by default", () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      const fortyDaysAgo = new Date(now);
      fortyDaysAgo.setDate(now.getDate() - 40);

      const runs: Partial<Run>[] = [
        { id: 1, startedAt: now } as Run,
        { id: 2, startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) } as Run, // 10 days ago
        { id: 3, startedAt: fortyDaysAgo } as Run, // 40 days ago (should be filtered out)
      ];

      const filtered = filterRunsToWindow(runs as Run[], 30);
      
      expect(filtered.length).toBe(2);
      expect(filtered.map(r => r.id)).toEqual([1, 2]);
    });

    it("should handle custom window sizes", () => {
      const now = new Date();
      const runs: Partial<Run>[] = [
        { id: 1, startedAt: now } as Run,
        { id: 2, startedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) } as Run, // 5 days ago
        { id: 3, startedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) } as Run, // 10 days ago
      ];

      const filtered = filterRunsToWindow(runs as Run[], 7);
      
      expect(filtered.length).toBe(2); // Only runs within 7 days
    });
  });

  describe("calculateAutomationROI - Confidence Score", () => {
    it("should calculate perfect confidence for all successful runs with consistent results", () => {
      const runs: Partial<Run>[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        status: "SUCCESS" as const,
        statsJson: {
          itemsProcessed: 10,
          estimatedMinutesSaved: 100, // Consistent: all runs save exactly 100 min
        },
      }));

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.totalRuns).toBe(10);
      expect(roi.successfulRuns).toBe(10);
      expect(roi.successRate).toBe(100); // 100% success
      expect(roi.confidenceFactors.successRateScore).toBe(100); // Perfect success
      expect(roi.confidenceFactors.consistencyScore).toBe(100); // 0 variance
      expect(roi.confidenceFactors.volumeScore).toBe(100); // 10 runs
      expect(roi.confidenceScore).toBe(100); // Overall perfect confidence
    });

    it("should penalize confidence for failed runs", () => {
      const runs: Partial<Run>[] = [
        ...Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          status: "SUCCESS" as const,
          statsJson: { estimatedMinutesSaved: 100 },
        })),
        ...Array.from({ length: 2 }, (_, i) => ({
          id: i + 9,
          status: "FAILED" as const,
          statsJson: null,
        })),
      ];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.successRate).toBe(80); // 8/10 = 80%
      expect(roi.confidenceFactors.successRateScore).toBe(80);
      // Confidence should be reduced due to failures
      // Formula: (80 × 0.5) + (100 × 0.3) + (100 × 0.2) = 90
      expect(roi.confidenceScore).toBe(90);
    });

    it("should penalize confidence for high variance", () => {
      const runs: Partial<Run>[] = [
        { id: 1, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 50 } },
        { id: 2, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 100 } },
        { id: 3, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 150 } },
        { id: 4, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 100 } },
        { id: 5, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 50 } },
      ];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.successRate).toBe(100); // All successful
      expect(roi.confidenceFactors.successRateScore).toBe(100);
      // High variance should lower consistency score significantly
      expect(roi.confidenceFactors.consistencyScore).toBeLessThan(20);
      expect(roi.confidenceFactors.volumeScore).toBe(50); // 5 runs
      // Overall confidence should be reduced
      expect(roi.confidenceScore).toBeLessThan(75);
    });

    it("should give neutral consistency score for single run", () => {
      const runs: Partial<Run>[] = [
        { id: 1, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 100 } },
      ];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.confidenceFactors.consistencyScore).toBe(50); // Neutral
      expect(roi.confidenceFactors.volumeScore).toBe(10); // 1/10 = 10
    });

    it("should return 0 confidence for no runs", () => {
      const runs: Partial<Run>[] = [];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.totalRuns).toBe(0);
      expect(roi.confidenceScore).toBe(0);
      expect(roi.confidenceFactors.successRateScore).toBe(0);
      expect(roi.confidenceFactors.consistencyScore).toBe(0);
      expect(roi.confidenceFactors.volumeScore).toBe(0);
    });
  });

  describe("calculateAutomationROI - Time Savings", () => {
    it("should sum time saved from successful runs only", () => {
      const runs: Partial<Run>[] = [
        { id: 1, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 100, itemsProcessed: 20 } },
        { id: 2, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 150, itemsProcessed: 30 } },
        { id: 3, status: "FAILED" as const, statsJson: { estimatedMinutesSaved: 50, itemsProcessed: 10 } }, // Should be ignored
      ];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.totalMinutesSaved).toBe(250); // 100 + 150 (failed run ignored)
      expect(roi.totalHoursSaved).toBe(4); // 250 / 60 = 4.16 → 4
      expect(roi.totalItemsProcessed).toBe(50); // 20 + 30
    });

    it("should handle runs with missing stats", () => {
      const runs: Partial<Run>[] = [
        { id: 1, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 100 } },
        { id: 2, status: "SUCCESS" as const, statsJson: null }, // Missing stats
        { id: 3, status: "SUCCESS" as const, statsJson: {} }, // Empty stats
      ];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.totalMinutesSaved).toBe(100); // Only count run with stats
      expect(roi.totalItemsProcessed).toBe(0); // No itemsProcessed in any run
    });
  });

  describe("calculateAutomationROI - Quality Metrics", () => {
    it("should sum exceptions across all runs", () => {
      const runs: Partial<Run>[] = [
        { id: 1, status: "SUCCESS" as const, statsJson: { exceptions: 2 } },
        { id: 2, status: "SUCCESS" as const, statsJson: { exceptions: 1 } },
        { id: 3, status: "FAILED" as const, statsJson: { exceptions: 5 } },
      ];

      const roi = calculateAutomationROI(runs as Run[], 1, "Test Automation");

      expect(roi.totalExceptions).toBe(8); // 2 + 1 + 5
      expect(roi.avgExceptionsPerRun).toBe(2.7); // 8 / 3 = 2.666... → 2.7
    });
  });

  describe("calculateOrgROI", () => {
    it("should aggregate metrics across all automations", () => {
      const runs: Partial<Run>[] = [
        { id: 1, automationConfigId: 1, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 100 } },
        { id: 2, automationConfigId: 1, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 150 } },
        { id: 3, automationConfigId: 2, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 200 } },
        { id: 4, automationConfigId: 2, status: "FAILED" as const, statsJson: null },
      ];

      const automationROIs = [
        calculateAutomationROI(runs.slice(0, 2) as Run[], 1, "Automation 1"),
        calculateAutomationROI(runs.slice(2) as Run[], 2, "Automation 2"),
      ];

      const orgROI = calculateOrgROI(runs as Run[], automationROIs, 2);

      expect(orgROI.totalMinutesSaved).toBe(450); // 100 + 150 + 200
      expect(orgROI.totalHoursSaved).toBe(8); // 450 / 60 = 7.5 → 8
      expect(orgROI.totalRuns).toBe(4);
      expect(orgROI.successfulRuns).toBe(3);
      expect(orgROI.failedRuns).toBe(1);
      expect(orgROI.overallSuccessRate).toBe(75); // 3/4 = 75%
      expect(orgROI.activeAutomations).toBe(2);
      expect(orgROI.totalAutomations).toBe(2);
    });

    it("should calculate weighted confidence by hours saved", () => {
      const runs: Partial<Run>[] = [
        // Automation 1: High confidence, saves 240 min (4 hours)
        ...Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          automationConfigId: 1,
          status: "SUCCESS" as const,
          statsJson: { estimatedMinutesSaved: 24 }, // 10 × 24 = 240
        })),
        // Automation 2: Low confidence, saves 60 min (1 hour)
        { id: 11, automationConfigId: 2, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 30 } },
        { id: 12, automationConfigId: 2, status: "FAILED" as const, statsJson: null },
        { id: 13, automationConfigId: 2, status: "SUCCESS" as const, statsJson: { estimatedMinutesSaved: 30 } },
      ];

      const automation1ROI = calculateAutomationROI(runs.slice(0, 10) as Run[], 1, "High Confidence");
      const automation2ROI = calculateAutomationROI(runs.slice(10) as Run[], 2, "Low Confidence");

      const orgROI = calculateOrgROI(runs as Run[], [automation1ROI, automation2ROI], 2);

      // Automation 1: saves 4 hours, high confidence (~100)
      // Automation 2: saves 1 hour, lower confidence (~66 due to 66% success rate)
      // Weighted: (100 × 4) + (66 × 1) / 5 = 466 / 5 = 93.2
      expect(orgROI.overallConfidence).toBeGreaterThan(90); // Should be close to Automation 1's score
      expect(orgROI.overallConfidence).toBeLessThan(100); // But not perfect due to Automation 2
    });
  });

  describe("Real-world Scenario", () => {
    it("should calculate accurate ROI for email triage automation over 30 days", () => {
      // Simulate 30 days of email triage runs (3 runs per week = ~12 runs total)
      const runs: Partial<Run>[] = Array.from({ length: 12 }, (_, i) => {
        const daysAgo = i * 2.5; // Spread runs over 30 days
        const startedAt = new Date();
        startedAt.setDate(startedAt.getDate() - daysAgo);

        // Most runs successful, occasional failure
        const isSuccess = i !== 5 && i !== 9; // 2 failures
        
        return {
          id: i + 1,
          automationConfigId: 1,
          status: isSuccess ? ("SUCCESS" as const) : ("FAILED" as const),
          startedAt,
          statsJson: isSuccess ? {
            itemsProcessed: 15 + Math.floor(Math.random() * 10), // 15-25 emails
            estimatedMinutesSaved: 75 + Math.floor(Math.random() * 50), // 75-125 min (5 min/email)
            tasksCreated: 3 + Math.floor(Math.random() * 5), // 3-8 tasks
            exceptions: Math.floor(Math.random() * 3), // 0-2 exceptions
          } : null,
        };
      });

      const roi = calculateAutomationROI(runs as Run[], 1, "Email Triage");

      // Assertions
      expect(roi.totalRuns).toBe(12);
      expect(roi.successfulRuns).toBe(10); // 12 - 2 failures
      expect(roi.failedRuns).toBe(2);
      expect(roi.successRate).toBeCloseTo(83.3, 1); // 10/12 = 83.3%
      
      expect(roi.totalMinutesSaved).toBeGreaterThan(0);
      expect(roi.totalHoursSaved).toBeGreaterThan(0);
      
      expect(roi.confidenceScore).toBeGreaterThan(0);
      expect(roi.confidenceScore).toBeLessThanOrEqual(100);
      
      // Success rate score should be ~83
      expect(roi.confidenceFactors.successRateScore).toBeCloseTo(83, 0);
      
      // Volume score should be 100 (12 runs > 10)
      expect(roi.confidenceFactors.volumeScore).toBe(100);
      
      // Window should be last 30 days
      const today = new Date().toISOString().split("T")[0];
      expect(roi.windowEndDate).toBe(today);
    });
  });
});
