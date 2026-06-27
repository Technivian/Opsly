import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
  Info,
  Save,
  AlertCircle,
} from "lucide-react";

const PAIN_AREA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  SALES: DollarSign,
  SUPPORT: Headphones,
  FINANCE: BarChart3,
  OPS: Settings,
};

const PAIN_AREA_KEYS = ["SALES", "SUPPORT", "FINANCE", "OPS"];

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

const STORAGE_KEY = "opsly-intake-draft";

export default function IntakeWizard() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isDemo = user?.isDemo === true;
  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    // Also load from legacy key
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("ops-copilot-intake-draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData({ ...initialData, ...parsed, files: [] });
        if (parsed.step) setStep(parsed.step);
      } catch (e) {}
    }
  }, []);

  const saveToLocalStorage = useCallback(() => {
    const toSave = { ...data, step, files: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setLastSaved(new Date());
    setShowSaveIndicator(true);
    setTimeout(() => setShowSaveIndicator(false), 2000);
  }, [data, step]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.painArea || data.problemDescription || data.currentTools.length > 0) {
        saveToLocalStorage();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [data, saveToLocalStorage]);

  const validateStep = (currentStep: number) => {
    const errors: Record<string, string> = {};
    switch (currentStep) {
      case 1:
        if (!data.painArea) errors.painArea = t("intakes.wizard.validation.selectPainArea");
        break;
      case 2:
        if (data.problemDescription.length < 20) {
          errors.problemDescription = t("intakes.wizard.validation.descriptionTooShort", {
            current: data.problemDescription.length,
          });
        }
        break;
      case 3:
        if (data.currentTools.length === 0 && data.otherTools.length === 0) {
          errors.tools = t("intakes.wizard.validation.selectTool");
        }
        break;
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const createIntakeMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch("/api/intakes", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || t("intakes.wizard.errorGeneric"));
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/intakes"] });
      localStorage.removeItem(STORAGE_KEY);
      toast({
        title: t("intakes.wizard.successTitle"),
        description: t("intakes.wizard.successDesc"),
      });
      navigate("/app/intakes");
    },
    onError: (error: any) => {
      const message = error?.message?.includes("read-only")
        ? t("intakes.wizard.errorDemo")
        : error?.message || t("intakes.wizard.errorGeneric");
      toast({
        title: t("intakes.wizard.errorTitle"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (validateStep(step) && step < totalSteps) {
      setValidationErrors({});
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    const painAreaLabel = t(`intakes.wizard.painAreas.${data.painArea}.label`);
    const formData = new FormData();
    formData.append("title", data.title || `${painAreaLabel} — intake`);
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
    data.files.forEach((file) => formData.append("files", file));
    createIntakeMutation.mutate(formData);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!data.painArea;
      case 2: return data.problemDescription.length >= 20;
      case 3: return data.currentTools.length > 0 || data.otherTools.length > 0;
      default: return true;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setData({ ...data, files: [...data.files, ...Array.from(e.target.files)] });
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

  const stepTitle = t(`intakes.wizard.steps.${step}.title`);
  const stepDesc = t(`intakes.wizard.steps.${step}.desc`);
  const painAreaLabel = data.painArea
    ? t(`intakes.wizard.painAreas.${data.painArea}.label`)
    : "";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {isDemo && (
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/10">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-700 dark:text-amber-400">
            {t("intakes.wizard.demoAlert")}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">{t("intakes.wizard.title")}</h1>
          <div className="flex items-center gap-3">
            {showSaveIndicator && (
              <Badge variant="outline" className="text-chart-3 border-chart-3/50">
                <Save className="w-3 h-3 mr-1" />
                {t("intakes.wizard.draftSaved")}
              </Badge>
            )}
            {lastSaved && !showSaveIndicator && (
              <span className="text-xs text-muted-foreground">
                {t("intakes.wizard.lastSaved", {
                  time: lastSaved.toLocaleTimeString(locale),
                })}
              </span>
            )}
            <span className="text-sm text-muted-foreground">
              {t("intakes.wizard.stepOf", { step, total: totalSteps })}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{stepTitle}</CardTitle>
          <CardDescription>{stepDesc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {PAIN_AREA_KEYS.map((key) => {
                  const Icon = PAIN_AREA_ICONS[key];
                  const label = t(`intakes.wizard.painAreas.${key}.label`);
                  const desc = t(`intakes.wizard.painAreas.${key}.desc`);
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setData({ ...data, painArea: key });
                        setValidationErrors({});
                      }}
                      className={`p-4 rounded-lg border-2 text-left hover-elevate transition-colors ${
                        data.painArea === key
                          ? "border-primary bg-primary/5"
                          : validationErrors.painArea
                          ? "border-destructive/50"
                          : "border-border"
                      }`}
                      data-testid={`button-pain-area-${key.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          data.painArea === key ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </button>
                  );
                })}
              </div>
              {validationErrors.painArea && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.painArea}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("intakes.wizard.intakeTitle")}</Label>
                <Input
                  id="title"
                  placeholder={t("intakes.wizard.titlePlaceholder")}
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  data-testid="input-intake-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="problem">{t("intakes.wizard.problemDescription")}</Label>
                <Textarea
                  id="problem"
                  placeholder={t("intakes.wizard.problemPlaceholder")}
                  rows={6}
                  value={data.problemDescription}
                  onChange={(e) => {
                    setData({ ...data, problemDescription: e.target.value });
                    if (e.target.value.length >= 20) setValidationErrors({});
                  }}
                  className={validationErrors.problemDescription ? "border-destructive" : ""}
                  data-testid="input-problem-description"
                />
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${data.problemDescription.length >= 20 ? "text-chart-3" : "text-muted-foreground"}`}>
                    {data.problemDescription.length >= 20 ? (
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {t("intakes.wizard.charCount", { count: data.problemDescription.length })}
                      </span>
                    ) : (
                      t("intakes.wizard.charMin", { current: data.problemDescription.length })
                    )}
                  </p>
                  {validationErrors.problemDescription && (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {validationErrors.problemDescription}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block">{t("intakes.wizard.selectToolsLabel")}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_TOOLS.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Checkbox
                        id={tool}
                        checked={data.currentTools.includes(tool)}
                        onCheckedChange={() => toggleTool(tool)}
                        data-testid={`checkbox-tool-${tool.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                      />
                      <label htmlFor={tool} className="text-sm cursor-pointer">{tool}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otherTools">{t("intakes.wizard.otherTools")}</Label>
                <Input
                  id="otherTools"
                  placeholder={t("intakes.wizard.otherToolsPlaceholder")}
                  value={data.otherTools}
                  onChange={(e) => {
                    setData({ ...data, otherTools: e.target.value });
                    if (e.target.value.length > 0) setValidationErrors({});
                  }}
                  data-testid="input-other-tools"
                />
              </div>
              {validationErrors.tools && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.tools}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <Alert className="border-primary/30 bg-primary/5">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-sm">
                  {t("intakes.wizard.volumeExplanation")}
                </AlertDescription>
              </Alert>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emails">{t("intakes.wizard.emailsPerDay")}</Label>
                  <Input
                    id="emails"
                    type="number"
                    placeholder="50"
                    value={data.volumeMetrics.emailsPerDay}
                    onChange={(e) =>
                      setData({ ...data, volumeMetrics: { ...data.volumeMetrics, emailsPerDay: e.target.value } })
                    }
                    data-testid="input-emails-per-day"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leads">{t("intakes.wizard.leadsPerWeek")}</Label>
                  <Input
                    id="leads"
                    type="number"
                    placeholder="100"
                    value={data.volumeMetrics.leadsPerWeek}
                    onChange={(e) =>
                      setData({ ...data, volumeMetrics: { ...data.volumeMetrics, leadsPerWeek: e.target.value } })
                    }
                    data-testid="input-leads-per-week"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoices">{t("intakes.wizard.invoicesPerMonth")}</Label>
                  <Input
                    id="invoices"
                    type="number"
                    placeholder="200"
                    value={data.volumeMetrics.invoicesPerMonth}
                    onChange={(e) =>
                      setData({ ...data, volumeMetrics: { ...data.volumeMetrics, invoicesPerMonth: e.target.value } })
                    }
                    data-testid="input-invoices-per-month"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tickets">{t("intakes.wizard.ticketsPerDay")}</Label>
                  <Input
                    id="tickets"
                    type="number"
                    placeholder="30"
                    value={data.volumeMetrics.ticketsPerDay}
                    onChange={(e) =>
                      setData({ ...data, volumeMetrics: { ...data.volumeMetrics, ticketsPerDay: e.target.value } })
                    }
                    data-testid="input-tickets-per-day"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  {t("intakes.wizard.dragDrop")}
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
                    <span>{t("intakes.wizard.chooseFiles")}</span>
                  </Button>
                </label>
              </div>
              {data.files.length > 0 && (
                <div className="space-y-2">
                  {data.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
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
                  <span className="text-muted-foreground">{t("intakes.wizard.titleLabel")}</span>
                  <span className="font-medium">
                    {data.title || `${painAreaLabel} — intake`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("intakes.wizard.painAreaLabel")}</span>
                  <span className="font-medium">{painAreaLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("intakes.wizard.toolsLabel")}</span>
                  <span className="font-medium">
                    {t("intakes.wizard.selected", { count: data.currentTools.length })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t("intakes.wizard.filesLabel")}</span>
                  <span className="font-medium">
                    {t("intakes.wizard.uploaded", { count: data.files.length })}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">{t("intakes.wizard.readyTitle")}</p>
                    <p className="text-sm text-muted-foreground">{t("intakes.wizard.readyDesc")}</p>
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
              <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.back")}
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()} data-testid="button-wizard-next">
                {t("common.next")} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createIntakeMutation.isPending}
                data-testid="button-wizard-submit"
              >
                {createIntakeMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("intakes.wizard.submitting")}
                  </>
                ) : (
                  <>
                    {t("intakes.wizard.submit")} <Check className="w-4 h-4 ml-2" />
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
