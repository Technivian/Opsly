import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import type { Run, RunLog, AutomationConfig } from "@shared/schema";

interface RunWithConfig extends Run {
  config?: AutomationConfig;
}

export default function Runs() {
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  const { data: runs, isLoading: runsLoading } = useQuery<RunWithConfig[]>({
    queryKey: ["/api/runs"],
  });

  const { data: runLogs, isLoading: logsLoading } = useQuery<RunLog[]>({
    queryKey: ["/api/runs", selectedRunId, "logs"],
    enabled: !!selectedRunId,
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <CheckCircle className="w-4 h-4 text-chart-3" />;
      case "FAILED":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "RUNNING":
        return <Loader2 className="w-4 h-4 text-chart-2 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-chart-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "default";
      case "FAILED":
        return "destructive";
      case "RUNNING":
        return "secondary";
      default:
        return "outline";
    }
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

  const selectedRun = runs?.find((r) => r.id === selectedRunId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Runs</h1>
          <p className="text-muted-foreground">
            View automation run history and logs.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
          <CardDescription>
            All automation runs across your configurations
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
                  <TableHead>Run ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => {
                  const duration = run.startedAt && run.endedAt
                    ? Math.round((new Date(run.endedAt).getTime() - new Date(run.startedAt).getTime()) / 1000)
                    : null;

                  return (
                    <TableRow key={run.id} data-testid={`row-run-${run.id}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status)}
                          <span>#{run.id}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(run.status)}>
                          {run.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {run.startedAt
                          ? new Date(run.startedAt).toLocaleString()
                          : "Queued"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {duration !== null ? `${duration}s` : "-"}
                      </TableCell>
                      <TableCell>
                        {run.statsJson && (
                          <div className="flex items-center gap-3 text-sm">
                            {run.statsJson.itemsProcessed !== undefined && (
                              <span>{run.statsJson.itemsProcessed} items</span>
                            )}
                            {run.statsJson.tasksCreated !== undefined && (
                              <span>{run.statsJson.tasksCreated} tasks</span>
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
                          <Terminal className="w-4 h-4 mr-1" /> Logs
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
              <h3 className="font-semibold text-lg mb-2">No runs yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Configure an automation and run it to see your run history here.
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
              Run #{selectedRunId} Logs
            </DialogTitle>
            <DialogDescription>
              {selectedRun && (
                <div className="flex items-center gap-3 mt-2">
                  <Badge variant={getStatusVariant(selectedRun.status)}>
                    {selectedRun.status}
                  </Badge>
                  {selectedRun.startedAt && (
                    <span className="text-sm">
                      Started: {new Date(selectedRun.startedAt).toLocaleString()}
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
              <p className="text-gray-500 text-center py-8">No logs available</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
