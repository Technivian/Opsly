import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SEO, organisationStructuredData } from "@/components/seo";

export default function About() {
  const { t } = useTranslation();
  const paragraphs = t("corp.about.paragraphs", { returnObjects: true }) as string[];
  const principles = t("corp.about.principles", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.about.title")}
        description={t("corp.about.seoDescription")}
        path="/about"
        structuredData={organisationStructuredData}
      />

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            as="h1"
            eyebrow={t("corp.nav.about")}
            title={t("corp.about.title")}
            lead={t("corp.about.subtitle")}
          />
          <div className="mt-8 max-w-2xl space-y-4">
            {paragraphs.map((p) => (
              <p key={p} className="text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <h2 className="text-2xl font-semibold tracking-tight mb-8">
            {t("corp.about.principlesTitle")}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map((principle) => (
              <div key={principle.title} className="flex gap-3">
                <Sparkle className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-medium mb-1">{principle.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-lg font-medium max-w-xl">{t("corp.home.closing.title")}</p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-about-cta">
              {t("corp.nav.cta")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
