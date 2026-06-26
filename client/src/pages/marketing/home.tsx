import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ShieldCheck,
  TestTubeDiagonal,
  Workflow,
  Bot,
  Boxes,
  Search,
  PencilRuler,
  Hammer,
  LineChart,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { SEO, organisationStructuredData, opslyStructuredData } from "@/components/seo";

const serviceIcons = [ShieldCheck, TestTubeDiagonal, Workflow, Bot, Boxes];
const processIcons = [Search, PencilRuler, Hammer, LineChart];

export default function Home() {
  const { t } = useTranslation();
  const services = t("corp.home.services.items", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];
  const steps = t("corp.home.process.steps", { returnObjects: true }) as {
    title: string;
    description: string;
  }[];
  const sectors = t("corp.home.trust.sectors", { returnObjects: true }) as string[];
  const focus = t("corp.home.trust.focus", { returnObjects: true }) as string[];
  const productPoints = t("corp.home.product.points", { returnObjects: true }) as string[];

  return (
    <MarketingLayout>
      <SEO
        title={undefined}
        description={t("corp.home.seoDescription")}
        path="/"
        structuredData={[organisationStructuredData, opslyStructuredData]}
      />

      {/* Hero */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary mb-4">
              {t("corp.home.hero.eyebrow")}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              {t("corp.home.hero.title")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              {t("corp.home.hero.subtitle")}
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/contact">
                <Button size="lg" data-testid="button-hero-primary">
                  {t("corp.home.hero.ctaPrimary")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" data-testid="button-hero-secondary">
                  {t("corp.home.hero.ctaSecondary")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & credibility */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            title={t("corp.home.trust.title")}
            lead={t("corp.home.trust.intro")}
          />
          <div className="grid md:grid-cols-2 gap-10 mt-10">
            <div>
              <h3 className="text-sm font-medium mb-4">{t("corp.home.trust.sectorsTitle")}</h3>
              <ul className="space-y-2.5">
                {sectors.map((s) => (
                  <li key={s} className="flex items-start gap-2.5 text-muted-foreground">
                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-4">{t("corp.home.trust.focusTitle")}</h3>
              <ul className="space-y-2.5">
                {focus.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-muted-foreground">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services overview */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading title={t("corp.home.services.title")} lead={t("corp.home.services.intro")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {services.map((service, i) => {
              const Icon = serviceIcons[i] ?? Boxes;
              return (
                <Card key={service.title} className="h-full">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="font-medium mb-2">{service.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/services" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
              {t("corp.home.services.cta")}
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How Aurivian works */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading title={t("corp.home.process.title")} lead={t("corp.home.process.intro")} />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
            {steps.map((step, i) => {
              const Icon = processIcons[i] ?? Search;
              return (
                <li key={step.title}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg border flex items-center justify-center">
                      <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-medium mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Featured product: Opsly */}
      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <Card>
            <CardContent className="p-8 lg:p-10 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-sm font-medium text-primary mb-3">
                  {t("corp.home.product.eyebrow")}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("corp.home.product.title")}
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {t("corp.home.product.description")}
                </p>
                <div className="mt-6">
                  <Link href="/products/opsly">
                    <Button data-testid="button-featured-opsly">
                      {t("corp.home.product.cta")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
              <ul className="space-y-3">
                {productPoints.map((p) => (
                  <li key={p} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 w-5 h-5 text-primary shrink-0" aria-hidden="true" />
                    <span className="text-sm leading-relaxed">{p}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Products & ventures note */}
          <div className="mt-10 max-w-2xl">
            <h3 className="font-medium mb-2">{t("corp.home.ventures.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("corp.home.ventures.intro")}
            </p>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section>
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="rounded-xl border bg-card p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-xl font-semibold">{t("corp.home.closing.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("corp.home.closing.description")}</p>
            </div>
            <Link href="/contact">
              <Button size="lg" data-testid="button-closing-cta">
                {t("corp.home.closing.cta")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
