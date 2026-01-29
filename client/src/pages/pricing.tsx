import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Layers, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { PricingSEO } from "@/components/seo";
import { useTranslation } from "react-i18next";

export default function Pricing() {
  const { t, i18n } = useTranslation();
  const isNL = i18n.language === "nl";
  
  const plans = [
    {
      name: t("pricing.free.name"),
      description: t("pricing.free.description"),
      price: "€0",
      period: t("pricing.free.period"),
      features: t("pricing.free.features", { returnObjects: true }) as string[],
      cta: t("common.getStarted"),
      href: "/auth/signup",
      popular: false,
    },
    {
      name: t("pricing.pro.name"),
      description: t("pricing.pro.description"),
      price: "€49",
      period: t("pricing.pro.period"),
      features: t("pricing.pro.features", { returnObjects: true }) as string[],
      cta: isNL ? "Binnenkort" : "Coming Soon",
      href: "#",
      popular: true,
      comingSoon: true,
    },
    {
      name: t("pricing.enterprise.name"),
      description: t("pricing.enterprise.description"),
      price: t("pricing.enterprise.price"),
      period: "",
      features: t("pricing.enterprise.features", { returnObjects: true }) as string[],
      cta: isNL ? "Contact Opnemen" : "Contact Sales",
      href: "#",
      popular: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PricingSEO />
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                <Layers className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Ops Copilot</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pricing" className="text-sm font-medium">{t("nav.pricing")}</Link>
              <Link href="/security" className="text-sm text-muted-foreground hover:text-foreground">{t("nav.security")}</Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground">{t("nav.docs")}</Link>
            </nav>
            <LanguageSwitcher />
            <ThemeToggle />
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" data-testid="button-signin">{t("common.signIn")}</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" data-testid="button-signup">{t("common.getStarted")}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">{t("pricing.title")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`relative ${plan.popular ? "border-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    {isNL ? "Meest Populair" : "Most Popular"}
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {plan.name}
                  {plan.comingSoon && (
                    <Badge variant="secondary" className="text-xs">
                      {isNL ? "Binnenkort" : "Coming Soon"}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link href={plan.href} className="w-full">
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    disabled={plan.comingSoon}
                    data-testid={`button-plan-${plan.name.toLowerCase()}`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            {isNL ? "Vragen over prijzen? Wij helpen u graag." : "Questions about pricing? We're here to help."}
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:sales@opscopilot.com">
              {isNL ? "Contact Opnemen" : "Contact Sales"}
            </a>
          </Button>
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
