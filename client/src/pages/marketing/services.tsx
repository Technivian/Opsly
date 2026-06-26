import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ShieldCheck,
  TestTubeDiagonal,
  Workflow,
  Bot,
  Boxes,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SEO, organisationStructuredData } from "@/components/seo";

const icons: Record<string, typeof ShieldCheck> = {
  "quality-engineering": ShieldCheck,
  "test-automation": TestTubeDiagonal,
  "process-automation": Workflow,
  "responsible-ai": Bot,
  "digital-products": Boxes,
};

export default function Services() {
  const { t } = useTranslation();
  const items = t("corp.services.items", { returnObjects: true }) as {
    id: string;
    title: string;
    intro: string;
    points: string[];
  }[];

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.services.title")}
        description={t("corp.services.seoDescription")}
        path="/services"
        structuredData={organisationStructuredData}
      />

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            as="h1"
            eyebrow={t("corp.nav.services")}
            title={t("corp.services.title")}
            lead={t("corp.services.subtitle")}
          />
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("corp.services.intro")}
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Services">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-sm rounded-full border px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {items.map((item, i) => {
        const Icon = icons[item.id] ?? Boxes;
        return (
          <section
            key={item.id}
            id={item.id}
            className={i < items.length - 1 ? "border-b scroll-mt-20" : "scroll-mt-20"}
          >
            <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16 grid lg:grid-cols-[1fr_1.4fr] gap-10">
              <div>
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-3 text-muted-foreground leading-relaxed">{item.intro}</p>
              </div>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3 content-start">
                {item.points.map((point) => (
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

      <section className="border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <p className="text-lg font-medium max-w-xl">{t("corp.home.closing.description")}</p>
          <Link href="/contact">
            <Button size="lg" data-testid="button-services-cta">
              {t("corp.services.cta")}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </MarketingLayout>
  );
}
