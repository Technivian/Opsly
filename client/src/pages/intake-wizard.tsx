import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Upload,
  DollarSign,
  Headphones,
  BarChart3,
  Settings,
  X,
  Loader2,
} from "lucide-react";

const PAIN_AREAS = [
  { value: "SALES", label: "Sales", icon: DollarSign, description: "Lead management, follow-ups, pipeline" },
  { value: "SUPPORT", label: "Customer Support", icon: Headphones, description: "Tickets, emails, escalations" },
  { value: "FINANCE", label: "Finance", icon: BarChart3, description: "Invoicing, approvals, reconciliation" },
  { value: "OPS", label: "Operations", icon: Settings, description: "Scheduling, logistics, workflows" },
];

const COMMON_TOOLS = [
  "Gmail / Google Workspace",
  "Microsoft 365 / Outlook",
  "Slack",
  "Salesforce",
  "HubSpot",
  "Zendesk",
  "Freshdesk",
  "Jira",
  "Asana",
  "Trello",
  "Monday.com",
  "QuickBooks",
  "Xero",
  "Notion",
  "Airtable",
];

interface WizardData {
  title: string;
  painArea: string;
  problemDescription: string;
  currentTools: string[];
  otherTools: string;
  volumeMetrics: {
    emailsPerDay: string;
    leadsPerWeek: string;
    invoicesPerMonth: string;
    ticketsPerDay: string;
  };
  files: File[];
}

const initialData: WizardData = {
  title: "",
  painArea: "",
  problemDescription: "",
  currentTools: [],
  otherTools: "",
  volumeMetrics: {
    emailsPerDay: "",
    leadsPerWeek: "",
    invoicesPerMonth: "",
    ticketsPerDay: "",
  },
  files: [],
};

export default function IntakeWizard() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const createIntakeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/intakes", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to create intake");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intakes"] });
      toast({
        title: "Intake Submitted",
        description: "Your intake is being processed. A blueprint will be generated shortly.",
      });
      navigate("/app/intakes");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit intake. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("title", data.title || `${data.painArea} Process Intake`);
    formData.append("painArea", data.painArea);
    formData.append(
      "answers",
      JSON.stringify({
        problemDescription: data.problemDescription,
        currentTools: data.currentTools,
        otherTools: data.otherTools,
        volumeMetrics: {
          emailsPerDay: data.volumeMetrics.emailsPerDay ? parseInt(data.volumeMetrics.emailsPerDay) : undefined,
          leadsPerWeek: data.volumeMetrics.leadsPerWeek ? parseInt(data.volumeMetrics.leadsPerWeek) : undefined,
          invoicesPerMonth: data.volumeMetrics.invoicesPerMonth ? parseInt(data.volumeMetrics.invoicesPerMonth) : undefined,
          ticketsPerDay: data.volumeMetrics.ticketsPerDay ? parseInt(data.volumeMetrics.ticketsPerDay) : undefined,
        },
      })
    );
    data.files.forEach((file) => {
      formData.append("files", file);
    });
    createIntakeMutation.mutate(formData);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return !!data.painArea;
      case 2:
        return data.problemDescription.length >= 20;
      case 3:
        return data.currentTools.length > 0 || data.otherTools.length > 0;
      case 4:
        return true; // Volume metrics are optional
      case 5:
        return true; // Files are optional
      case 6:
        return true; // Confirmation step
      default:
        return false;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setData({ ...data, files: [...data.files, ...newFiles] });
    }
  };

  const removeFile = (index: number) => {
    setData({ ...data, files: data.files.filter((_, i) => i !== index) });
  };

  const toggleTool = (tool: string) => {
    if (data.currentTools.includes(tool)) {
      setData({ ...data, currentTools: data.currentTools.filter((t) => t !== tool) });
    } else {
      setData({ ...data, currentTools: [...data.currentTools, tool] });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">New Intake</h1>
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Select Pain Area"}
            {step === 2 && "Describe the Problem"}
            {step === 3 && "Current Tools"}
            {step === 4 && "Volume Metrics"}
            {step === 5 && "Upload Files"}
            {step === 6 && "Review & Submit"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Which area of your operations needs improvement?"}
            {step === 2 && "Tell us about the specific challenges you're facing."}
            {step === 3 && "What tools are you currently using in this process?"}
            {step === 4 && "Help us understand your volume to estimate impact."}
            {step === 5 && "Upload any relevant documents (optional)."}
            {step === 6 && "Review your information before submitting."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {PAIN_AREAS.map((area) => (
                <button
                  key={area.value}
                  onClick={() => setData({ ...data, painArea: area.value })}
                  className={`p-4 rounded-lg border-2 text-left hover-elevate transition-colors ${
                    data.painArea === area.value
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  data-testid={`button-pain-area-${area.value.toLowerCase()}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      data.painArea === area.value ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}>
                      <area.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{area.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{area.description}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Intake Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Email Response Process Improvement"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  data-testid="input-intake-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem">Problem Description *</Label>
                <Textarea
                  id="problem"
                  placeholder="Describe the challenges you're facing in detail. What's causing delays? What tasks are repetitive? What frustrates your team?"
                  rows={6}
                  value={data.problemDescription}
                  onChange={(e) => setData({ ...data, problemDescription: e.target.value })}
                  data-testid="input-problem-description"
                />
                <p className="text-xs text-muted-foreground">
                  {data.problemDescription.length}/20 characters minimum
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">Select tools you currently use</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_TOOLS.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox
                        id={tool}
                        checked={data.currentTools.includes(tool)}
                        onCheckedChange={() => toggleTool(tool)}
                        data-testid={`checkbox-tool-${tool.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      />
                      <label
                        htmlFor={tool}
                        className="text-sm cursor-pointer"
                      >
                        {tool}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherTools">Other tools</Label>
                <Input
                  id="otherTools"
                  placeholder="Enter any other tools separated by commas"
                  value={data.otherTools}
                  onChange={(e) => setData({ ...data, otherTools: e.target.value })}
                  data-testid="input-other-tools"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emails">Emails per day</Label>
                <Input
                  id="emails"
                  type="number"
                  placeholder="e.g., 50"
                  value={data.volumeMetrics.emailsPerDay}
                  onChange={(e) =>
                    setData({
                      ...data,
                      volumeMetrics: { ...data.volumeMetrics, emailsPerDay: e.target.value },
                    })
                  }
                  data-testid="input-emails-per-day"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leads">Leads per week</Label>
                <Input
                  id="leads"
                  type="number"
                  placeholder="e.g., 100"
                  value={data.volumeMetrics.leadsPerWeek}
                  onChange={(e) =>
                    setData({
                      ...data,
                      volumeMetrics: { ...data.volumeMetrics, leadsPerWeek: e.target.value },
                    })
                  }
                  data-testid="input-leads-per-week"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoices">Invoices per month</Label>
                <Input
                  id="invoices"
                  type="number"
                  placeholder="e.g., 200"
                  value={data.volumeMetrics.invoicesPerMonth}
                  onChange={(e) =>
                    setData({
                      ...data,
                      volumeMetrics: { ...data.volumeMetrics, invoicesPerMonth: e.target.value },
                    })
                  }
                  data-testid="input-invoices-per-month"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tickets">Support tickets per day</Label>
                <Input
                  id="tickets"
                  type="number"
                  placeholder="e.g., 30"
                  value={data.volumeMetrics.ticketsPerDay}
                  onChange={(e) =>
                    setData({
                      ...data,
                      volumeMetrics: { ...data.volumeMetrics, ticketsPerDay: e.target.value },
                    })
                  }
                  data-testid="input-tickets-per-day"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drag and drop files here, or click to browse
                </p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>
              {data.files.length > 0 && (
                <div className="space-y-2">
                  {data.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFile(index)}
                        data-testid={`button-remove-file-${index}`}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium">{data.title || `${data.painArea} Process Intake`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pain Area</span>
                  <span className="font-medium">
                    {PAIN_AREAS.find((a) => a.value === data.painArea)?.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tools</span>
                  <span className="font-medium">{data.currentTools.length} selected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Files</span>
                  <span className="font-medium">{data.files.length} uploaded</span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Ready to submit</p>
                    <p className="text-sm text-muted-foreground">
                      After submission, our AI will analyze your input and generate a process
                      blueprint with automation recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              data-testid="button-wizard-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()} data-testid="button-wizard-next">
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createIntakeMutation.isPending}
                data-testid="button-wizard-submit"
              >
                {createIntakeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Intake <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
