import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Clock,
  TrendingUp,
  Target,
  Zap,
  CheckCircle,
  BarChart3,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { Run, AutomationConfig, AutomationTemplate } from "@shared/schema";

interface ROIData {
  hoursSaved: number;
  cycleTimeReduction: number;
  confidenceScore: number;
  totalRuns: number;
  successfulRuns: number;
  totalItemsProcessed: number;
  totalTasksCreated: number;
}

export default function ROIDashboard() {
  const { t } = useTranslation();

  const { data: roiData, isLoading: roiLoading } = useQuery<ROIData>({
    queryKey: ["/api/roi"],
    refetchInterval: 5000,
  });

  const { data: runs, isLoading: runsLoading } = useQuery<Run[]>({
    queryKey: ["/api/runs"],
    refetchInterval: 5000,
  });

  const { data: configs } = useQuery<AutomationConfig[]>({
    queryKey: ["/api/automations/configs"],
  });

  const { data: templates } = useQuery<AutomationTemplate[]>({
    queryKey: ["/api/automations/templates"],
  });

  const isLoading = roiLoading || runsLoading;

  const getConfigName = (configId: number) => {
    const config = configs?.find((c) => c.id === configId);
    return config?.name || "Unknown";
  };

  const getTemplateName = (configId: number) => {
    const config = configs?.find((c) => c.id === configId);
    if (!config) return "Unknown";
    const template = templates?.find((t) => t.id === config.templateId);
    return template?.name || "Unknown";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-chart-3";
    if (score >= 50) return "text-chart-4";
    return "text-chart-5";
  };

  const successfulRuns = runs?.filter((r) => r.status === "SUCCESS") || [];
  const runsByConfig = successfulRuns.reduce((acc, run) => {
    const configId = run.automationConfigId;
    if (!acc[configId]) {
      acc[configId] = { runs: 0, itemsProcessed: 0, tasksCreated: 0, minutesSaved: 0 };
    }
    acc[configId].runs++;
    acc[configId].itemsProcessed += run.statsJson?.itemsProcessed || 0;
    acc[configId].tasksCreated += run.statsJson?.tasksCreated || 0;
    acc[configId].minutesSaved += run.statsJson?.estimatedMinutesSaved || 0;
    return acc;
  }, {} as Record<number, { runs: number; itemsProcessed: number; tasksCreated: number; minutesSaved: number }>);

  const getLast7DaysTrend = () => {
    if (!runs || runs.length === 0) return [];
    const today = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayRuns = runs.filter((r) => {
        const runDate = r.startedAt ? new Date(r.startedAt).toISOString().split("T")[0] : null;
        return runDate === dateStr && r.status === "SUCCESS";
      });
      days.push({
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        runs: dayRuns.length,
        items: dayRuns.reduce((sum, r) => sum + (r.statsJson?.itemsProcessed || 0), 0),
      });
    }
    return days;
  };

  const trendData = getLast7DaysTrend();
  const maxRuns = Math.max(...trendData.map((d) => d.runs), 1);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">ROI Dashboard</h1>
          <p className="text-muted-foreground">
            Track the impact of your automations.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-chart-3/30 bg-chart-3/5">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Saved</CardTitle>
            <Clock className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold">{roiData?.hoursSaved || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Total time saved through automation
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-chart-2/30 bg-chart-2/5">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycle Time Reduction</CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className="text-3xl font-bold flex items-center gap-2">
                  {roiData?.cycleTimeReduction || 0}%
                  {(roiData?.cycleTimeReduction || 0) > 0 && (
                    <ArrowDown className="w-5 h-5 text-chart-3" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Improvement in process time
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <Target className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-24" />
            ) : (
              <>
                <div className={`text-3xl font-bold ${getConfidenceColor(roiData?.confidenceScore || 0)}`}>
                  {roiData?.confidenceScore || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {roiData?.totalRuns || 0} runs
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>7-Day Activity Trend</CardTitle>
          <CardDescription>Successful runs over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : trendData.length > 0 && trendData.some(d => d.runs > 0) ? (
            <div className="flex items-end justify-between gap-2 h-32">
              {trendData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-24">
                    <div
                      className="w-full max-w-8 rounded-t bg-primary transition-all duration-300"
                      style={{ height: `${Math.max((day.runs / maxRuns) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                  <span className="text-xs font-medium">{day.runs}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>No activity in the past 7 days</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>Overall automation performance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <span className="font-medium">Total Runs</span>
                  </div>
                  <span className="text-xl font-bold">{roiData?.totalRuns || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-chart-3" />
                    <span className="font-medium">Successful Runs</span>
                  </div>
                  <span className="text-xl font-bold">{roiData?.successfulRuns || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-chart-2" />
                    <span className="font-medium">Items Processed</span>
                  </div>
                  <span className="text-xl font-bold">{roiData?.totalItemsProcessed || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-chart-4" />
                    <span className="font-medium">Tasks Created</span>
                  </div>
                  <span className="text-xl font-bold">{roiData?.totalTasksCreated || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impact by Automation</CardTitle>
            <CardDescription>Breakdown by configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {runsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : Object.keys(runsByConfig).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Automation</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Time Saved</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(runsByConfig).map(([configId, stats]) => (
                    <TableRow key={configId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{getConfigName(parseInt(configId))}</p>
                          <p className="text-xs text-muted-foreground">
                            {getTemplateName(parseInt(configId))}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{stats.runs}</TableCell>
                      <TableCell className="text-right">{stats.itemsProcessed}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {Math.round(stats.minutesSaved / 60)}h
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No automation data yet</p>
                <p className="text-sm">Run some automations to see impact metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
