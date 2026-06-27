import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Terminal,
  AlertTriangle,
  Info,
} from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { Run, RunLog, AutomationConfig } from "@shared/schema";

interface RunWithConfig extends Run {
  config?: AutomationConfig;
}

export default function Runs() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  const { data: runs, isLoading: runsLoading } = useQuery<RunWithConfig[]>({
    queryKey: ["/api/runs"],
    refetchInterval: (query) => {
      const data = query.state.data as RunWithConfig[] | undefined;
      const hasRunning = data?.some(r => r.status === "RUNNING" || r.status === "QUEUED");
      return hasRunning ? 2000 : false;
    },
  });

  const selectedRun = useMemo(() => runs?.find((r) => r.id === selectedRunId), [runs, selectedRunId]);

  const { data: runLogs, isLoading: logsLoading } = useQuery<RunLog[]>({
    queryKey: ["/api/runs", selectedRunId, "logs"],
    enabled: !!selectedRunId,
    refetchInterval: selectedRun?.status === "RUNNING" || selectedRun?.status === "QUEUED" ? 1000 : false,
  });

  const getStatusIcon = (status: string, isDemoRun?: boolean) => {
    if (isDemoRun && status === "SUCCESS") {
      return <CheckCircle className="w-4 h-4 text-orange-500" />;
    }
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-chart-3" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "RUNNING":
        return <Loader2 className="w-4 h-4 text-chart-2 animate-spin" />;
      case "RETRYING":
        return <Loader2 className="w-4 h-4 text-chart-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-chart-4" />;
    }
  };

  const getStatusVariant = (status: string, isDemoRun?: boolean) => {
    if (isDemoRun && status === "SUCCESS") {
      return "secondary" as const;
    }
    switch (status) {
      case "SUCCESS":
        return "default" as const;
      case "FAILED":
        return "destructive" as const;
      case "RUNNING":
      case "RETRYING":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  };

  const getStatusLabel = (status: string, isDemoRun?: boolean) => {
    if (isDemoRun && status === "SUCCESS") return t("runs.demoSuccess");
    const map: Record<string, string> = {
      SUCCESS: t("runs.status.success"),
      FAILED: t("runs.status.failed"),
      RUNNING: t("runs.status.running"),
      QUEUED: t("runs.status.queued"),
      RETRYING: t("runs.status.running"),
    };
    return map[status] ?? status;
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <XCircle className="w-3.5 h-3.5 text-destructive" />;
      case "WARN":
        return <AlertTriangle className="w-3.5 h-3.5 text-chart-4" />;
      default:
        return <Info className="w-3.5 h-3.5 text-chart-2" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("runs.title")}</h1>
          <p className="text-muted-foreground">
            {t("runs.subtitle")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("runs.runHistory")}</CardTitle>
          <CardDescription>
            {t("runs.allRuns")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {runsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : runs?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("runs.runId")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("runs.started")}</TableHead>
                  <TableHead>{t("runs.duration")}</TableHead>
                  <TableHead>{t("runs.stats")}</TableHead>
                  <TableHead className="text-right">{t("runs.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const duration = run.startedAt && run.endedAt
                    ? Math.round((new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
                    : null;

                  return (
                    <TableRow 
                      key={run.id} 
                      data-testid={`row-run-${run.id}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedRunId(run.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status, run.isDemoRun)}
                          <span>#{run.id}</span>
                          {run.isDemoRun && (
                            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200">
                              DEMO
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(run.status, run.isDemoRun)}>
                          {getStatusLabel(run.status, run.isDemoRun)}
                        </Badge>
                        {run.isDemoRun && run.status === "SUCCESS" && (
                          <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {t("runs.simulatedOnly")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {run.startedAt
                          ? new Date(run.startedAt).toLocaleString(locale)
                          : t("runs.status.queued")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {duration !== null ? `${duration}s` : "-"}
                      </TableCell>
                      <TableCell>
                        {run.statsJson && (
                          <div className="flex items-center gap-3 text-sm">
                            {run.statsJson.itemsProcessed !== undefined && (
                              <span>{run.statsJson.itemsProcessed} {t("runs.itemsProcessed")}</span>
                            )}
                            {run.statsJson.tasksCreated !== undefined && (
                              <span>{run.statsJson.tasksCreated} {t("runs.tasksCreated")}</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRunId(run.id)}
                          data-testid={`button-view-logs-${run.id}`}
                        >
                          <Terminal className="w-4 h-4 mr-1" /> {t("runs.viewLogs")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold text-lg mb-2">{t("runs.noRuns")}</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {t("runs.noRunsDesc")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedRunId} onOpenChange={() => setSelectedRunId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              {t("runs.logsDialogTitle", { id: selectedRunId })}
            </DialogTitle>
            <DialogDescription>
              {selectedRun && (
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={getStatusVariant(selectedRun.status)}>
                    {getStatusLabel(selectedRun.status, selectedRun.isDemoRun)}
                  </Badge>
                  {selectedRun.startedAt && (
                    <span className="text-sm">
                      {t("runs.started")}: {new Date(selectedRun.startedAt).toLocaleString(locale)}
                    </span>
                  )}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] rounded-md border bg-gray-900 p-4">
            {logsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-6 w-full bg-gray-700" />
                ))}
              </div>
            ) : runLogs?.length ? (
              <div className="space-y-1 font-mono text-sm">
                {runLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-2 py-1"
                  >
                    <span className="text-gray-500 shrink-0">
                      {new Date(log.ts).toLocaleTimeString()}
                    </span>
                    <span className="shrink-0">{getLogIcon(log.level)}</span>
                    <span
                      className={
                        log.level === "ERROR"
                          ? "text-red-400"
                          : log.level === "WARN"
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">{t("runs.noLogs")}</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
