import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SEO, organisationStructuredData } from "@/components/seo";

export default function Approach() {
  const { t } = useTranslation();
  const steps = t("corp.approach.steps", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.approach.title")}
        description={t("corp.approach.seoDescription")}
        path="/approach"
        structuredData={organisationStructuredData}
      />

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            as="h1"
            eyebrow={t("corp.nav.approach")}
            title={t("corp.approach.title")}
            lead={t("corp.approach.subtitle")}
          />
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("corp.approach.intro")}
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-3xl mx-auto px-6 py-14 lg:py-16">
          <ol className="relative border-l border-border ml-3">
            {steps.map((step, i) => (
              <li key={step.title} className="mb-10 ml-8 last:mb-0">
                <span className="absolute -left-[17px] flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {i + 1}
                </span>
                <h2 className="font-medium text-lg">{step.title}</h2>
                <p className="mt-1.5 text-muted-foreground leading-relaxed">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-lg font-medium max-w-xl">{t("corp.home.closing.description")}</p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-approach-cta">
              {t("corp.nav.cta")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
