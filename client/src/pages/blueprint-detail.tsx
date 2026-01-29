import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GitBranch,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  ArrowRight,
  Zap,
  FileText,
  Database,
  Share2,
  Pencil,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Blueprint } from "@shared/schema";

export default function BlueprintDetail() {
  const [, params] = useRoute("/app/blueprints/:id");
  const blueprintId = params?.id;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: blueprint, isLoading } = useQuery<Blueprint>({
    queryKey: ["/api/blueprints", blueprintId],
    enabled: !!blueprintId,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ title, summary }: { title: string; summary: string }) => {
      return apiRequest("PATCH", `/api/blueprints/${blueprintId}`, { title, summary });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blueprints", blueprintId] });
      setIsEditing(false);
      toast({ title: "Blueprint updated", description: "Your changes have been saved." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update blueprint.", variant: "destructive" });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/blueprints/${blueprintId}/share`, {});
      return res.json() as Promise<{ shareUrl: string }>;
    },
    onSuccess: (data) => {
      setShareUrl(window.location.origin + data.shareUrl);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create share link.", variant: "destructive" });
    },
  });

  const handleStartEdit = () => {
    if (blueprint) {
      setEditTitle(blueprint.title);
      setEditSummary(blueprint.summary || "");
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ title: editTitle, summary: editSummary });
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportMarkdown = () => {
    if (!blueprint) return;
    const processSteps = blueprint.processJson || [];
    const bottlenecks = blueprint.bottlenecksJson || [];
    const backlog = blueprint.backlogJson || [];

    let md = `# ${blueprint.title}\n\n${blueprint.summary || ""}\n\n`;
    md += `## Process Map\n\n`;
    processSteps.forEach((step: any, i: number) => {
      md += `${i + 1}. **${step.step}** (${step.avgTimeMin} min)\n   - Owner: ${step.ownerRole}\n   - Tools: ${step.tools?.join(", ")}\n\n`;
    });
    md += `## Bottlenecks\n\n`;
    bottlenecks.forEach((b: any) => {
      md += `- **${b.type}**: ${b.description} (Impact: ${b.impact})\n`;
    });
    md += `\n## Backlog\n\n`;
    backlog.forEach((item: any, i: number) => {
      md += `${i + 1}. [${item.type}] ${item.item} - ${item.effort} effort\n`;
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.title.replace(/\s+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg mb-2">Blueprint not found</h3>
            <p className="text-muted-foreground">The requested blueprint does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const processSteps = blueprint.processJson || [];
  const bottlenecks = blueprint.bottlenecksJson || [];
  const backlog = blueprint.backlogJson || [];

  const getEffortBadgeVariant = (effort: string) => {
    switch (effort) {
      case "S":
        return "default";
      case "M":
        return "secondary";
      case "L":
        return "outline";
      default:
        return "outline";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "AUTOMATION":
        return "bg-chart-3/10 text-chart-3";
      case "SOP":
        return "bg-chart-2/10 text-chart-2";
      case "DATA_FIX":
        return "bg-chart-5/10 text-chart-5";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="text-xl font-bold"
                placeholder="Blueprint title"
                data-testid="input-edit-title"
              />
              <Textarea
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                placeholder="Blueprint summary"
                rows={2}
                data-testid="input-edit-summary"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={updateMutation.isPending} data-testid="button-save-edit">
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} data-testid="button-cancel-edit">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">{blueprint.title}</h1>
              <p className="text-muted-foreground">{blueprint.summary}</p>
            </>
          )}
        </div>
        {!isEditing && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleStartEdit} data-testid="button-edit-blueprint">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" variant="outline" onClick={handleExportMarkdown} data-testid="button-export-markdown">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => shareMutation.mutate()} data-testid="button-share-blueprint">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Blueprint</DialogTitle>
                  <DialogDescription>
                    Anyone with this link can view this blueprint.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {shareUrl ? (
                    <div className="flex items-center gap-2">
                      <Input value={shareUrl} readOnly className="flex-1" data-testid="input-share-url" />
                      <Button size="icon" variant="outline" onClick={handleCopyLink} data-testid="button-copy-share-link">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Generating share link...</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="process" data-testid="tab-process">
            <GitBranch className="w-4 h-4 mr-2" /> Process Map
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" data-testid="tab-bottlenecks">
            <AlertTriangle className="w-4 h-4 mr-2" /> Bottlenecks ({bottlenecks.length})
          </TabsTrigger>
          <TabsTrigger value="backlog" data-testid="tab-backlog">
            <CheckCircle className="w-4 h-4 mr-2" /> Backlog ({backlog.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle>Process Map</CardTitle>
              <CardDescription>
                Step-by-step breakdown of your current process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {processSteps.length > 0 ? (
                <div className="relative">
                  {processSteps.map((step, index) => (
                    <div key={index} className="flex gap-4 mb-6 last:mb-0">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0">
                          {index + 1}
                        </div>
                        {index < processSteps.length - 1 && (
                          <div className="w-0.5 h-full bg-border mt-2" />
                        )}
                      </div>
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h4 className="font-medium">{step.step}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                              <Clock className="w-4 h-4" />
                              {step.avgTimeMin} min
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Owner:</span>{" "}
                              <Badge variant="outline">{step.ownerRole}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wrench className="w-4 h-4 text-muted-foreground" />
                              <span>{step.tools.join(", ")}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                            <span>{step.input}</span>
                            <ArrowRight className="w-4 h-4" />
                            <span>{step.output}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No process steps defined
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bottlenecks">
          <Card>
            <CardHeader>
              <CardTitle>Identified Bottlenecks</CardTitle>
              <CardDescription>
                Key issues slowing down your process
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bottlenecks.length > 0 ? (
                <div className="space-y-4">
                  {bottlenecks.map((bottleneck, index) => (
                    <Card key={index} className="border-chart-5/30 bg-chart-5/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-chart-5 mt-0.5 shrink-0" />
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{bottleneck.type}</Badge>
                              <span className="text-sm text-muted-foreground">
                                Impact: {bottleneck.impact}
                              </span>
                            </div>
                            <p className="font-medium">{bottleneck.description}</p>
                            <p className="text-sm text-muted-foreground">
                              Evidence: {bottleneck.evidence}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No bottlenecks identified
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backlog">
          <Card>
            <CardHeader>
              <CardTitle>Automation Backlog</CardTitle>
              <CardDescription>
                Prioritized list of improvements and automations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {backlog.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Priority</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Effort</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backlog
                      .sort((a, b) => b.priorityScore - a.priorityScore)
                      .map((item, index) => (
                        <TableRow key={index} data-testid={`row-backlog-${index}`}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                              <span className="text-sm text-chart-3">
                                {item.priorityScore} pts
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium max-w-xs">
                            <div className="flex items-center gap-2">
                              {item.type === "AUTOMATION" && <Zap className="w-4 h-4 text-chart-3" />}
                              {item.type === "SOP" && <FileText className="w-4 h-4 text-chart-2" />}
                              {item.type === "DATA_FIX" && <Database className="w-4 h-4 text-chart-5" />}
                              {item.item}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeBadgeColor(item.type)}>
                              {item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.expectedImpact}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEffortBadgeVariant(item.effort)}>
                              {item.effort === "S" ? "Small" : item.effort === "M" ? "Medium" : "Large"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No backlog items defined
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
