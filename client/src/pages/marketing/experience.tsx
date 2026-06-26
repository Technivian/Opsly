import { useTranslation } from "react-i18next";
import { Landmark, Banknote, Zap, HeartPulse, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SEO, organisationStructuredData } from "@/components/seo";

const sectorIcons = [Landmark, Banknote, Zap, HeartPulse, Users];

export default function Experience() {
  const { t } = useTranslation();
  const sectors = t("corp.experience.sectors", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];
  const template = t("corp.experience.template", { returnObjects: true }) as {
    label: string;
    description: string;
  }[];

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.experience.title")}
        description={t("corp.experience.seoDescription")}
        path="/experience"
        structuredData={organisationStructuredData}
      />

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            as="h1"
            eyebrow={t("corp.nav.experience")}
            title={t("corp.experience.title")}
            lead={t("corp.experience.subtitle")}
          />
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("corp.experience.intro")}
          </p>
        </div>
      </section>

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sectors.map((sector, i) => {
              const Icon = sectorIcons[i] ?? Users;
              return (
                <Card key={sector.title} className="h-full">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <h2 className="font-medium mb-2">{sector.title}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {sector.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-muted-foreground max-w-2xl">
            {t("corp.experience.disclaimer")}
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-3xl mx-auto px-6 py-14 lg:py-16">
          <h2 className="text-xl font-semibold tracking-tight mb-6">
            {t("corp.experience.templateTitle")}
          </h2>
          <dl className="space-y-4">
            {template.map((row) => (
              <div key={row.label} className="grid sm:grid-cols-[160px_1fr] gap-1 sm:gap-4">
                <dt className="font-medium text-sm">{row.label}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {row.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </MarketingLayout>
  );
}
