import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, Search, Workflow, LineChart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ProductStatusBadge } from "@/components/marketing/product-status-badge";
import { SEO, organisationStructuredData, opslyStructuredData } from "@/components/seo";
import { site } from "@/config/site";
import { integrations } from "@/config/integrations";

const sectionMeta = [
  { key: "understand", icon: Search },
  { key: "improve", icon: Workflow },
  { key: "measure", icon: LineChart },
] as const;

export default function ProductOpsly() {
  const { t } = useTranslation();

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.opsly.title")}
        brand="Aurivian"
        description={t("corp.opsly.seoDescription")}
        path="/products/opsly"
        structuredData={[organisationStructuredData, opslyStructuredData]}
      />

      {/* Hero */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading as="h1" eyebrow="Opsly by Aurivian" title={t("corp.opsly.title")} />
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            {t("corp.opsly.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-sm text-muted-foreground">{t("corp.opsly.statusLabel")}:</span>
            <ProductStatusBadge status="pilot" />
            <span className="text-sm text-muted-foreground">
              {site.product.status.join(" · ")}
            </span>
          </div>
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("corp.opsly.intro")}
          </p>
        </div>
      </section>

      {/* Understand / Improve / Measure */}
      {sectionMeta.map(({ key, icon: Icon }, i) => {
        const points = t(`corp.opsly.sections.${key}.points`, {
          returnObjects: true,
        }) as string[];
        return (
          <section key={key} className={i < sectionMeta.length - 1 ? "border-b" : "border-b"}>
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16 grid lg:grid-cols-[1fr_1.4fr] gap-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t(`corp.opsly.sections.${key}.title`)}
                </h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  {t(`corp.opsly.sections.${key}.description`)}
                </p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 content-start">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    <span className="text-sm leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* Integrations with explicit status */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <SectionHeading
            title={t("corp.opsly.integrations.title")}
            lead={t("corp.opsly.integrations.intro")}
          />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {integrations.map((integration) => (
              <li key={integration.key}>
                <Card>
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{integration.name}</span>
                    <ProductStatusBadge status={integration.status} />
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl">
            {t("corp.opsly.integrations.note")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="rounded-xl border bg-card p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold">{t("corp.opsly.cta.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("corp.opsly.cta.description")}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/contact">
                <Button size="lg" data-testid="button-opsly-cta">
                  {t("corp.opsly.cta.primary")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" data-testid="button-opsly-pricing">
                  {t("corp.opsly.cta.pricing")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
