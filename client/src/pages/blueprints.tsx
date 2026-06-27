import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GitBranch, ArrowRight, ClipboardList, Calendar } from "lucide-react";
import type { Blueprint } from "@shared/schema";

export default function Blueprints() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "nl" ? "nl-NL" : "en-GB";
  const { data: blueprints, isLoading } = useQuery<Blueprint[]>({
    queryKey: ["/api/blueprints"],
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("blueprints.title")}</h1>
          <p className="text-muted-foreground">{t("blueprints.subtitle")}</p>
        </div>
      </div>

      <Card className="bg-muted/30 border-dashed">
        <CardContent className="py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{t("blueprints.whatAre")}</p>
              <p className="text-sm text-muted-foreground">{t("blueprints.explanation")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : blueprints?.length ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {blueprints.map((blueprint) => {
            const processSteps = blueprint.processJson?.length || 0;
            const bottlenecks = blueprint.bottlenecksJson?.length || 0;
            const backlogItems = blueprint.backlogJson?.length || 0;

            return (
              <Card
                key={blueprint.id}
                className="hover-elevate border-l-2 border-l-primary/60 bg-gradient-to-br from-primary/5 to-transparent"
                data-testid={`card-blueprint-${blueprint.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                      <GitBranch className="w-5 h-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {t("blueprints.stepsCount", { count: processSteps })}
                    </Badge>
                  </div>
                  <CardTitle className="mt-3">{blueprint.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {blueprint.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-chart-5" />
                      {t("blueprints.bottlenecksCount", { count: bottlenecks })}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-chart-3" />
                      {t("blueprints.actionsCount", { count: backlogItems })}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(blueprint.createdAt).toLocaleDateString(locale)}
                    </div>
                    <Link href={`/app/blueprints/${blueprint.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-primary/30 text-primary hover:bg-primary/10"
                        data-testid={`button-view-blueprint-${blueprint.id}`}
                      >
                        {t("common.viewAll")} <ArrowRight className="w-4 h-4 ml-1" />
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
            <GitBranch className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold text-lg mb-2">{t("blueprints.noBlueprints")}</h3>
            <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
              {t("blueprints.noBlueprintsDesc")}
            </p>
            <Link href="/app/intakes/new">
              <Button data-testid="button-create-intake-for-blueprint">
                <ClipboardList className="w-4 h-4 mr-2" /> {t("blueprints.createIntake")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
