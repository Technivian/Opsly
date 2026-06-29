import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardList,
  GitBranch,
  Sparkles,
  BarChart3,
  Clock,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import type { Intake, Blueprint, Run } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { DashboardHeader } from "@/components/app/dashboard/dashboard-header";
import { NextStepCard, type NextStep } from "@/components/app/dashboard/next-step-card";
import { JourneyProgress } from "@/components/app/dashboard/journey-progress";
import type { JourneyStage, StageStatus } from "@/components/app/dashboard/journey-stage-card";
import { WhatsNext } from "@/components/app/dashboard/whats-next";
import { OperationalMetric } from "@/components/app/dashboard/operational-metric";
import { RecentProcesses } from "@/components/app/dashboard/recent-processes";
import { ActiveAutomations } from "@/components/app/dashboard/active-automations";

interface RoiData {
  hoursSaved: number;
  cycleTimeReduction: number;
  confidenceScore: number;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";

  const { data: intakes, isLoading: intakesLoading } = useQuery<Intake[]>({
    queryKey: ["/api/intakes"],
  });
  const { data: blueprints, isLoading: blueprintsLoading } = useQuery<Blueprint[]>({
    queryKey: ["/api/blueprints"],
  });
  const { data: runs, isLoading: runsLoading } = useQuery<Run[]>({
    queryKey: ["/api/runs"],
  });
  const { data: roiData, isLoading: roiLoading } = useQuery<RoiData>({
    queryKey: ["/api/roi"],
  });

  const isLoading = intakesLoading || blueprintsLoading || runsLoading || roiLoading;

  // ---- Derived state -------------------------------------------------------
  const intakeList = intakes ?? [];
  const blueprintList = blueprints ?? [];
  const runList = runs ?? [];

  const pendingIntakes = intakeList.filter(
    (i) => i.status === "SUBMITTED" || i.status === "PROCESSING",
  );
  const improvementCount = blueprintList.reduce(
    (acc, b) => acc + ((b as any).bottlenecksJson?.length ?? 0),
    0,
  );
  const hoursSaved = roiData?.hoursSaved ?? 0;

  const hasProcesses = intakeList.length > 0;
  const hasBlueprints = blueprintList.length > 0;
  const hasRuns = runList.length > 0;
  const hasResults = hoursSaved > 0 || (roiData?.cycleTimeReduction ?? 0) > 0;
  const isNewUser = !hasProcesses && !hasBlueprints && !hasRuns;

  // ---- Journey stages ------------------------------------------------------
  const understandStatus: StageStatus = pendingIntakes.length
    ? "busy"
    : hasProcesses
    ? "done"
    : "notStarted";

  const stages: JourneyStage[] = [
    {
      key: "understand",
      title: t("dashboard.journey.understand.title"),
      value: hasProcesses
        ? t("dashboard.journey.understand.value", { count: intakeList.length })
        : t("dashboard.journey.understand.empty"),
      status: understandStatus,
      icon: ClipboardList,
    },
    {
      key: "improve",
      title: t("dashboard.journey.improve.title"),
      value: improvementCount
        ? t("dashboard.journey.improve.value", { count: improvementCount })
        : hasBlueprints
        ? t("dashboard.journey.improve.ready")
        : t("dashboard.journey.improve.empty"),
      status: hasBlueprints ? "done" : "notStarted",
      icon: Lightbulb,
    },
    {
      key: "automate",
      title: t("dashboard.journey.automate.title"),
      value: hasRuns
        ? t("dashboard.journey.automate.value", { count: runList.length })
        : t("dashboard.journey.automate.empty"),
      status: hasRuns ? "done" : "notStarted",
      icon: Sparkles,
    },
    {
      key: "measure",
      title: t("dashboard.journey.measure.title"),
      value: hasResults
        ? t("dashboard.journey.measure.value", { hours: hoursSaved })
        : t("dashboard.journey.measure.empty"),
      status: hasResults ? "done" : "notStarted",
      icon: BarChart3,
    },
  ];

  const firstIncomplete = stages.findIndex((s) => s.status !== "done");
  const activeIndex = firstIncomplete === -1 ? stages.length - 1 : firstIncomplete;
  const completedSteps = stages.filter((s) => s.status === "done").length;

  // ---- Next step -----------------------------------------------------------
  const nextStep = getNextStep();

  function getNextStep(): NextStep {
    if (!hasProcesses) {
      return {
        title: t("dashboard.nextStep.firstProcess.title"),
        description: t("dashboard.nextStep.firstProcess.desc"),
        action: t("dashboard.nextStep.firstProcess.action"),
        href: "/app/intakes/new",
        icon: ClipboardList,
        currentStep: 1,
        completedSteps,
        showDuration: true,
      };
    }
    if (pendingIntakes.length > 0) {
      return {
        title: t("dashboard.nextStep.processing.title"),
        description: t("dashboard.nextStep.processing.desc", { count: pendingIntakes.length }),
        action: t("dashboard.nextStep.processing.action"),
        href: "/app/intakes",
        icon: Clock,
        currentStep: 1,
        completedSteps,
      };
    }
    if (hasBlueprints && !hasRuns) {
      return {
        title: t("dashboard.nextStep.automate.title"),
        description: t("dashboard.nextStep.automate.desc"),
        action: t("dashboard.nextStep.automate.action"),
        href: "/app/automations",
        icon: Sparkles,
        currentStep: 3,
        completedSteps,
      };
    }
    return {
      title: t("dashboard.nextStep.nextProcess.title"),
      description: t("dashboard.nextStep.nextProcess.desc"),
      action: t("dashboard.nextStep.nextProcess.action"),
      href: "/app/intakes/new",
      icon: ClipboardList,
      currentStep: activeIndex + 1,
      completedSteps,
    };
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      {/* Level 1 — who you are + the single next action */}
      <DashboardHeader firstName={user?.firstName} />
      <NextStepCard step={nextStep} />

      {/* Level 2 — progress through the Opsly journey */}
      <JourneyProgress stages={stages} activeIndex={activeIndex} />

      {/* Level 3 — what to expect (new) OR real operational data */}
      {isNewUser ? (
        <WhatsNext />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <OperationalMetric
              icon={ClipboardList}
              label={t("dashboard.metrics.processesInAnalysis")}
              value={String(pendingIntakes.length || intakeList.length)}
              href="/app/intakes"
              testId="metric-processes"
            />
            <OperationalMetric
              icon={GitBranch}
              label={t("dashboard.metrics.openImprovements")}
              value={
                hasBlueprints
                  ? String(improvementCount)
                  : t("dashboard.metrics.availableAfterAnalysis")
              }
              href="/app/blueprints"
              testId="metric-improvements"
            />
            <OperationalMetric
              icon={Sparkles}
              label={t("dashboard.metrics.activeAutomations")}
              value={String(runList.length)}
              href="/app/runs"
              testId="metric-automations"
            />
            <OperationalMetric
              icon={TrendingUp}
              label={t("dashboard.metrics.timeSaved")}
              value={
                hasResults
                  ? `${hoursSaved} ${t("dashboard.metrics.hoursUnit")}`
                  : t("dashboard.metrics.notMeasured")
              }
              hint={hasResults ? undefined : t("dashboard.metrics.availableAfterRun")}
              href="/app/roi"
              testId="metric-time-saved"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RecentProcesses
              intakes={intakeList}
              blueprints={blueprintList}
              locale={locale}
            />
            <ActiveAutomations runs={runList} locale={locale} />
          </div>
        </>
      )}
    </div>
  );
}
