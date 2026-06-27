import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  FileDown,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Blueprint } from "@shared/schema";

interface ProcessStep {
  step: string;
  avgTimeMin: number;
  ownerRole: string;
  tools: string[];
}

interface Bottleneck {
  type: string;
  description: string;
  impact: string;
}

interface BacklogItem {
  item: string;
  type: string;
  effort: string;
}

export default function BlueprintDetail() {
  const { t } = useTranslation();
  const [, params] = useRoute("/app/blueprints/:id");
  const blueprintId = params?.id;
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editTab, setEditTab] = useState("general");
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editProcessSteps, setEditProcessSteps] = useState<ProcessStep[]>([]);
  const [editBottlenecks, setEditBottlenecks] = useState<Bottleneck[]>([]);
  const [editBacklog, setEditBacklog] = useState<BacklogItem[]>([]);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: blueprint, isLoading } = useQuery<Blueprint>({
    queryKey: ["/api/blueprints", blueprintId],
    enabled: !!blueprintId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      summary: string; 
      processJson?: ProcessStep[]; 
      bottlenecksJson?: Bottleneck[]; 
      backlogJson?: BacklogItem[] 
    }) => {
      return apiRequest("PATCH", `/api/blueprints/${blueprintId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blueprints", blueprintId] });
      setIsEditing(false);
      toast({ title: t("common.success"), description: t("blueprints.updateSuccess") });
    },
    onError: () => {
      toast({ title: t("common.error"), description: t("blueprints.updateError"), variant: "destructive" });
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
      toast({ title: t("common.error"), description: t("blueprints.shareDesc"), variant: "destructive" });
    },
  });

  const handleStartEdit = () => {
    if (blueprint) {
      setEditTitle(blueprint.title);
      setEditSummary(blueprint.summary || "");
      setEditProcessSteps(blueprint.processJson as ProcessStep[] || []);
      setEditBottlenecks(blueprint.bottlenecksJson as Bottleneck[] || []);
      setEditBacklog(blueprint.backlogJson as BacklogItem[] || []);
      setEditTab("general");
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    updateMutation.mutate({ 
      title: editTitle, 
      summary: editSummary,
      processJson: editProcessSteps,
      bottlenecksJson: editBottlenecks,
      backlogJson: editBacklog
    });
  };

  const addProcessStep = () => {
    setEditProcessSteps([...editProcessSteps, { step: "", avgTimeMin: 5, ownerRole: "", tools: [] }]);
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: any) => {
    const updated = [...editProcessSteps];
    if (field === "tools") {
      updated[index][field] = value.split(",").map((t: string) => t.trim());
    } else {
      (updated[index] as any)[field] = value;
    }
    setEditProcessSteps(updated);
  };

  const removeProcessStep = (index: number) => {
    setEditProcessSteps(editProcessSteps.filter((_, i) => i !== index));
  };

  const addBottleneck = () => {
    setEditBottlenecks([...editBottlenecks, { type: "Delay", description: "", impact: "Medium" }]);
  };

  const updateBottleneck = (index: number, field: keyof Bottleneck, value: string) => {
    const updated = [...editBottlenecks];
    updated[index][field] = value;
    setEditBottlenecks(updated);
  };

  const removeBottleneck = (index: number) => {
    setEditBottlenecks(editBottlenecks.filter((_, i) => i !== index));
  };

  const addBacklogItem = () => {
    setEditBacklog([...editBacklog, { item: "", type: "Automation", effort: "M" }]);
  };

  const updateBacklogItem = (index: number, field: keyof BacklogItem, value: string) => {
    const updated = [...editBacklog];
    updated[index][field] = value;
    setEditBacklog(updated);
  };

  const removeBacklogItem = (index: number) => {
    setEditBacklog(editBacklog.filter((_, i) => i !== index));
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

  const handleExportPDF = () => {
    if (!blueprint) return;
    const processSteps = blueprint.processJson || [];
    const bottlenecks = blueprint.bottlenecksJson || [];
    const backlog = blueprint.backlogJson || [];

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${blueprint.title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #374151; margin-top: 30px; }
          .summary { font-size: 1.1em; color: #4b5563; margin-bottom: 30px; }
          .process-step { background: #f3f4f6; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
          .step-title { font-weight: 600; color: #1f2937; }
          .step-meta { font-size: 0.9em; color: #6b7280; margin-top: 5px; }
          .bottleneck { background: #fef3c7; padding: 12px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #f59e0b; }
          .bottleneck-type { font-weight: 600; color: #92400e; }
          .backlog-item { background: #e0e7ff; padding: 12px; margin: 8px 0; border-radius: 6px; }
          .backlog-type { display: inline-block; background: #4f46e5; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.8em; margin-right: 8px; }
          .effort { float: right; color: #6366f1; font-weight: 500; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>${blueprint.title}</h1>
        <p class="summary">${blueprint.summary || ""}</p>
        
        <h2>Process Map</h2>
        ${processSteps.map((step: any, i: number) => `
          <div class="process-step">
            <div class="step-title">${i + 1}. ${step.step}</div>
            <div class="step-meta">
              <strong>Duration:</strong> ${step.avgTimeMin} min &nbsp;|&nbsp;
              <strong>Owner:</strong> ${step.ownerRole} &nbsp;|&nbsp;
              <strong>Tools:</strong> ${step.tools?.join(", ") || "N/A"}
            </div>
          </div>
        `).join("")}
        
        <h2>Bottlenecks</h2>
        ${bottlenecks.map((b: any) => `
          <div class="bottleneck">
            <span class="bottleneck-type">${b.type}:</span> ${b.description}
            <div class="step-meta">Impact: ${b.impact}</div>
          </div>
        `).join("")}
        
        <h2>Automation Backlog</h2>
        ${backlog.map((item: any, i: number) => `
          <div class="backlog-item">
            <span class="backlog-type">${item.type}</span>
            ${item.item}
            <span class="effort">${item.effort} effort</span>
          </div>
        `).join("")}
        
        <script>window.print();</script>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
    }
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
            <h3 className="font-semibold text-lg mb-2">{t("blueprints.notFound")}</h3>
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
          <h1 className="text-2xl font-bold mb-2">{blueprint.title}</h1>
          <p className="text-muted-foreground">{blueprint.summary}</p>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent className="max-w-4xl max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>{t("blueprints.editBlueprint")}</DialogTitle>
                <DialogDescription>
                  {t("blueprints.processSteps")}
                </DialogDescription>
              </DialogHeader>
              <Tabs value={editTab} onValueChange={setEditTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">{t("blueprints.general")}</TabsTrigger>
                  <TabsTrigger value="process">{t("blueprints.processSteps")}</TabsTrigger>
                  <TabsTrigger value="bottlenecks">{t("blueprints.bottlenecks")}</TabsTrigger>
                  <TabsTrigger value="backlog">{t("blueprints.backlog")}</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Blueprint title"
                      data-testid="input-edit-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-summary">Summary</Label>
                    <Textarea
                      id="edit-summary"
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      placeholder="Blueprint summary"
                      rows={4}
                      data-testid="input-edit-summary"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="process" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {editProcessSteps.map((step, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <Label className="text-xs">{t("blueprints.stepName")}</Label>
                                <Input
                                  value={step.step}
                                  onChange={(e) => updateProcessStep(idx, "step", e.target.value)}
                                  placeholder="Step name"
                                  data-testid={`input-step-name-${idx}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("blueprints.duration")}</Label>
                                <Input
                                  type="number"
                                  value={step.avgTimeMin}
                                  onChange={(e) => updateProcessStep(idx, "avgTimeMin", parseInt(e.target.value) || 0)}
                                  data-testid={`input-step-duration-${idx}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("blueprints.owner")}</Label>
                                <Input
                                  value={step.ownerRole}
                                  onChange={(e) => updateProcessStep(idx, "ownerRole", e.target.value)}
                                  placeholder="Owner role"
                                  data-testid={`input-step-owner-${idx}`}
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs">{t("blueprints.tools")} (comma-separated)</Label>
                                <Input
                                  value={step.tools?.join(", ") || ""}
                                  onChange={(e) => updateProcessStep(idx, "tools", e.target.value)}
                                  placeholder="Tool1, Tool2"
                                  data-testid={`input-step-tools-${idx}`}
                                />
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeProcessStep(idx)}
                              data-testid={`button-remove-step-${idx}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <Button variant="outline" onClick={addProcessStep} className="w-full" data-testid="button-add-step">
                        <Plus className="w-4 h-4 mr-2" />
                        {t("blueprints.addStep")}
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="bottlenecks" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {editBottlenecks.map((bn, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">{t("blueprints.bottleneckType")}</Label>
                                <Input
                                  value={bn.type}
                                  onChange={(e) => updateBottleneck(idx, "type", e.target.value)}
                                  placeholder="Delay, Error, etc."
                                  data-testid={`input-bottleneck-type-${idx}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("blueprints.impact")}</Label>
                                <Input
                                  value={bn.impact}
                                  onChange={(e) => updateBottleneck(idx, "impact", e.target.value)}
                                  placeholder="High, Medium, Low"
                                  data-testid={`input-bottleneck-impact-${idx}`}
                                />
                              </div>
                              <div className="col-span-2">
                                <Label className="text-xs">{t("blueprints.description")}</Label>
                                <Textarea
                                  value={bn.description}
                                  onChange={(e) => updateBottleneck(idx, "description", e.target.value)}
                                  placeholder="Describe the bottleneck..."
                                  rows={2}
                                  data-testid={`input-bottleneck-desc-${idx}`}
                                />
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeBottleneck(idx)}
                              data-testid={`button-remove-bottleneck-${idx}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <Button variant="outline" onClick={addBottleneck} className="w-full" data-testid="button-add-bottleneck">
                        <Plus className="w-4 h-4 mr-2" />
                        {t("blueprints.addBottleneck")}
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="backlog" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {editBacklog.map((item, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div className="col-span-2">
                                <Label className="text-xs">{t("blueprints.itemDescription")}</Label>
                                <Input
                                  value={item.item}
                                  onChange={(e) => updateBacklogItem(idx, "item", e.target.value)}
                                  placeholder="Backlog item description"
                                  data-testid={`input-backlog-item-${idx}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("blueprints.bottleneckType")}</Label>
                                <Input
                                  value={item.type}
                                  onChange={(e) => updateBacklogItem(idx, "type", e.target.value)}
                                  placeholder="Automation, Integration, etc."
                                  data-testid={`input-backlog-type-${idx}`}
                                />
                              </div>
                              <div>
                                <Label className="text-xs">{t("blueprints.effort")}</Label>
                                <Input
                                  value={item.effort}
                                  onChange={(e) => updateBacklogItem(idx, "effort", e.target.value)}
                                  placeholder="S, M, L, XL"
                                  data-testid={`input-backlog-effort-${idx}`}
                                />
                              </div>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeBacklogItem(idx)}
                              data-testid={`button-remove-backlog-${idx}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                      <Button variant="outline" onClick={addBacklogItem} className="w-full" data-testid="button-add-backlog">
                        <Plus className="w-4 h-4 mr-2" />
                        {t("blueprints.addBacklogItem")}
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} data-testid="button-save-edit">
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  {t("common.save")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleStartEdit} data-testid="button-edit-blueprint">
            <Pencil className="w-4 h-4 mr-2" />
            {t("common.edit")}
          </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  {t("common.export")}
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportMarkdown} data-testid="button-export-markdown">
                  <FileDown className="w-4 h-4 mr-2" />
                  {t("blueprints.exportMarkdown")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF} data-testid="button-export-pdf">
                  <FileText className="w-4 h-4 mr-2" />
                  {t("blueprints.exportPdf")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" onClick={() => shareMutation.mutate()} data-testid="button-share-blueprint">
                  <Share2 className="w-4 h-4 mr-2" />
                  {t("blueprints.shareBlueprint")}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t("blueprints.shareBlueprint")}</DialogTitle>
                  <DialogDescription>{t("blueprints.shareDesc")}</DialogDescription>
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
                    <p className="text-sm text-muted-foreground">{t("blueprints.generatingLink")}</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
      </div>

      <Tabs defaultValue="process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="process" data-testid="tab-process">
            <GitBranch className="w-4 h-4 mr-2" /> {t("blueprints.processMap")}
          </TabsTrigger>
          <TabsTrigger value="bottlenecks" data-testid="tab-bottlenecks">
            <AlertTriangle className="w-4 h-4 mr-2" /> {t("blueprints.bottlenecks")} ({bottlenecks.length})
          </TabsTrigger>
          <TabsTrigger value="backlog" data-testid="tab-backlog">
            <CheckCircle className="w-4 h-4 mr-2" /> {t("blueprints.backlog")} ({backlog.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="process">
          <Card>
            <CardHeader>
              <CardTitle>{t("blueprints.processMap")}</CardTitle>
              <CardDescription>{t("blueprints.processMapDesc")}</CardDescription>
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
                              <span className="text-muted-foreground">{t("blueprints.ownerLabel")}:</span>{" "}
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
              <CardTitle>{t("blueprints.bottlenecks")}</CardTitle>
              <CardDescription>{t("blueprints.bottlenecksDesc")}</CardDescription>
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
              <CardTitle>{t("blueprints.backlog")}</CardTitle>
              <CardDescription>{t("blueprints.backlogDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {backlog.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("blueprints.priorityLabel")}</TableHead>
                      <TableHead>{t("blueprints.itemLabel")}</TableHead>
                      <TableHead>{t("blueprints.typeLabel")}</TableHead>
                      <TableHead>{t("blueprints.impactLabel")}</TableHead>
                      <TableHead>{t("blueprints.effortLabel")}</TableHead>
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
                              {t(`blueprints.backlogTypes.${item.type}`) !== `blueprints.backlogTypes.${item.type}`
                                ? t(`blueprints.backlogTypes.${item.type}`)
                                : item.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {item.expectedImpact}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getEffortBadgeVariant(item.effort)}>
                              {t(`blueprints.effortLabels.${item.effort}`) !== `blueprints.effortLabels.${item.effort}`
                                ? t(`blueprints.effortLabels.${item.effort}`)
                                : item.effort}
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
