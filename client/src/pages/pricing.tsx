import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ProductStatusBadge } from "@/components/marketing/product-status-badge";
import { PricingSEO } from "@/components/seo";

export default function Pricing() {
  const { t } = useTranslation();
  const pilotPoints = t("pricing.pilot.points", { returnObjects: true }) as string[];

  return (
    <MarketingLayout>
      <PricingSEO />

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-primary">Opsly by Aurivian</span>
            <ProductStatusBadge status="pilot" />
          </div>
          <SectionHeading as="h1" title={t("pricing.title")} lead={t("pricing.subtitle")} />
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("pricing.intro")}
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-primary/40">
            <CardHeader>
              <CardTitle>{t("pricing.pilot.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {t("pricing.pilot.description")}
              </p>
              <ul className="mt-5 space-y-2.5">
                {pilotPoints.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                <Link href="/contact">
                  <Button data-testid="button-pricing-cta">
                    {t("pricing.cta")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("pricing.commercial.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("pricing.commercial.description")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("pricing.future.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("pricing.future.description")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-16">
          <Link
            href="/products/opsly"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            <ArrowRight className="w-4 h-4 mr-1.5 rotate-180" />
            {t("corp.products.opsly.cta")}
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
