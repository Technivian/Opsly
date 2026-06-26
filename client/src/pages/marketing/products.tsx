import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ProductStatusBadge } from "@/components/marketing/product-status-badge";
import { SEO, organisationStructuredData, opslyStructuredData } from "@/components/seo";

export default function Products() {
  const { t } = useTranslation();

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.products.title")}
        description={t("corp.products.seoDescription")}
        path="/products"
        structuredData={[organisationStructuredData, opslyStructuredData]}
      />

      <section className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            as="h1"
            eyebrow={t("corp.nav.products")}
            title={t("corp.products.title")}
            lead={t("corp.products.subtitle")}
          />
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("corp.products.intro")}
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-6xl mx-auto px-6 py-14 lg:py-16">
          <Card>
            <CardContent className="p-8 lg:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {t("corp.products.opsly.name")}
                </h2>
                <ProductStatusBadge status="pilot" />
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {t("corp.products.opsly.description")}
              </p>
              <div className="mt-6">
                <Link href="/products/opsly">
                  <Button data-testid="button-products-opsly">
                    {t("corp.products.opsly.cta")}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-10 max-w-2xl">
            <h3 className="font-medium mb-2">{t("corp.products.more.title")}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("corp.products.more.description")}
            </p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
