import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, UserPlus, Zap, Play, Loader2, CheckCircle, Settings } from "lucide-react";
import type { AutomationTemplate, AutomationConfig, ConfigSchemaField } from "@shared/schema";

const TEMPLATE_ICONS: Record<string, typeof Mail> = {
  email_to_task_triage: Mail,
  lead_followup: UserPlus,
};

const TEMPLATE_SETUP_STEPS: Record<string, string[]> = {
  email_to_task_triage: [
    "Connect your email provider (Gmail/Outlook)",
    "Configure category mappings",
    "Set up task destination (Asana/Jira/etc)",
    "Define escalation rules",
  ],
  lead_followup: [
    "Connect your CRM (Salesforce/HubSpot)",
    "Configure follow-up timing",
    "Set up email templates",
    "Define lead scoring thresholds",
  ],
};

export default function AutomationConfigPage() {
  const [, params] = useRoute("/app/automations/:templateId");
  const [, navigate] = useLocation();
  const templateId = params?.templateId ? parseInt(params.templateId) : undefined;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [configName, setConfigName] = useState("");
  const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
  const [isActive, setIsActive] = useState(true);

  const { data: template, isLoading: templateLoading } = useQuery<AutomationTemplate>({
    queryKey: ["/api/automations/templates", templateId],
    enabled: !!templateId,
  });

  const { data: configs, isLoading: configsLoading } = useQuery<AutomationConfig[]>({
    queryKey: ["/api/automations/configs"],
  });

  const existingConfig = configs?.find((c) => c.templateId === templateId);

  const createConfigMutation = useMutation({
    mutationFn: async (data: { templateId: number; name: string; configJson: Record<string, unknown>; isActive: boolean }) => {
      return apiRequest("POST", "/api/automations/configs", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations/configs"] });
      toast({
        title: "Configuration Saved",
        description: "Your automation configuration has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save configuration.",
        variant: "destructive",
      });
    },
  });

  const runMutation = useMutation({
    mutationFn: async (configId: number) => {
      return apiRequest("POST", `/api/automations/configs/${configId}/run`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/runs"] });
      toast({
        title: "Run Started",
        description: "The automation run has been queued.",
      });
      navigate("/app/runs");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to start run.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!templateId) return;
    createConfigMutation.mutate({
      templateId,
      name: configName || `${template?.name} Config`,
      configJson: configValues,
      isActive,
    });
  };

  const handleRun = () => {
    if (existingConfig) {
      runMutation.mutate(existingConfig.id);
    }
  };

  const handleFieldChange = (fieldName: string, value: unknown) => {
    setConfigValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const renderField = (field: ConfigSchemaField) => {
    const value = configValues[field.name] ?? field.defaultValue ?? "";

    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.name}
            value={value as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            data-testid={`input-config-${field.name}`}
          />
        );
      case "number":
        return (
          <Input
            id={field.name}
            type="number"
            value={value as number}
            onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value))}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            data-testid={`input-config-${field.name}`}
          />
        );
      case "select":
        return (
          <Select
            value={value as string}
            onValueChange={(v) => handleFieldChange(field.name, v)}
          >
            <SelectTrigger data-testid={`select-config-${field.name}`}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "checkbox":
        return (
          <Switch
            id={field.name}
            checked={value as boolean}
            onCheckedChange={(checked) => handleFieldChange(field.name, checked)}
            data-testid={`switch-config-${field.name}`}
          />
        );
      default:
        return null;
    }
  };

  if (templateLoading || configsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg mb-2">Template not found</h3>
            <p className="text-muted-foreground">The requested template does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = TEMPLATE_ICONS[template.key] || Zap;
  const setupSteps = TEMPLATE_SETUP_STEPS[template.key] || [];
  const configSchema = template.configSchema || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{template.name}</h1>
          <p className="text-muted-foreground">{template.description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Set up the parameters for this automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="configName">Configuration Name</Label>
                <Input
                  id="configName"
                  value={configName || existingConfig?.name || ""}
                  onChange={(e) => setConfigName(e.target.value)}
                  placeholder={`${template.name} Config`}
                  data-testid="input-config-name"
                />
              </div>

              {configSchema.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this automation
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                  data-testid="switch-is-active"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSave}
                  disabled={createConfigMutation.isPending}
                  data-testid="button-save-config"
                >
                  {createConfigMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="w-4 h-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
                {existingConfig && (
                  <Button
                    variant="outline"
                    onClick={handleRun}
                    disabled={runMutation.isPending}
                    data-testid="button-run-test"
                  >
                    {runMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run Test
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Setup Checklist</CardTitle>
              <CardDescription>Complete these steps to enable this automation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {setupSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-muted-foreground">{index + 1}</span>
                    </div>
                    <p className="text-sm">{step}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Badge variant="secondary">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  MVP: Using simulated data
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What This Does</CardTitle>
            </CardHeader>
            <CardContent>
              {template.key === "email_to_task_triage" ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Fetches incoming emails</li>
                  <li>• Classifies them by category</li>
                  <li>• Creates tasks in your project tool</li>
                  <li>• Escalates urgent items</li>
                </ul>
              ) : (
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Fetches leads from CRM</li>
                  <li>• Generates personalized follow-ups</li>
                  <li>• Queues messages for sending</li>
                  <li>• Updates lead status</li>
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
