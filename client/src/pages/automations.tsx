import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, UserPlus, ArrowRight, Zap, Settings } from "lucide-react";
import type { AutomationTemplate, AutomationConfig } from "@shared/schema";

const TEMPLATE_ICONS: Record<string, typeof Mail> = {
  email_to_task_triage: Mail,
  lead_followup: UserPlus,
};

export default function Automations() {
  const { data: templates, isLoading: templatesLoading } = useQuery<AutomationTemplate[]>({
    queryKey: ["/api/automations/templates"],
  });

  const { data: configs, isLoading: configsLoading } = useQuery<AutomationConfig[]>({
    queryKey: ["/api/automations/configs"],
  });

  const isLoading = templatesLoading || configsLoading;

  const getConfigsForTemplate = (templateId: number) => {
    return configs?.filter((c) => c.templateId === templateId) || [];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Automations</h1>
          <p className="text-muted-foreground">
            Configure and manage your automation templates.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Templates</h2>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : templates?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => {
                const Icon = TEMPLATE_ICONS[template.key] || Zap;
                const templateConfigs = getConfigsForTemplate(template.id);
                const activeConfigs = templateConfigs.filter((c) => c.isActive);

                return (
                  <Card key={template.id} className="hover-elevate" data-testid={`card-template-${template.key}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        {activeConfigs.length > 0 && (
                          <Badge variant="secondary" className="shrink-0">
                            {activeConfigs.length} active
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="mt-3">{template.name}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {templateConfigs.length} configuration{templateConfigs.length !== 1 ? "s" : ""}
                        </div>
                        <Link href={`/app/automations/${template.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-configure-${template.key}`}>
                            <Settings className="w-4 h-4 mr-2" /> Configure
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold text-lg mb-2">No templates available</h3>
                <p className="text-muted-foreground">
                  Automation templates are being set up. Check back soon.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {configs && configs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Configurations</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configs.map((config) => {
                const template = templates?.find((t) => t.id === config.templateId);
                const Icon = template ? TEMPLATE_ICONS[template.key] || Zap : Zap;

                return (
                  <Card key={config.id} data-testid={`card-config-${config.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{config.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {template?.name || "Unknown template"}
                          </p>
                        </div>
                        <Badge variant={config.isActive ? "default" : "secondary"}>
                          {config.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <Link href={`/app/automations/${config.templateId}`}>
                          <Button variant="ghost" size="sm">
                            Edit <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
