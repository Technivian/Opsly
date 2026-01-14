import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
}

const defaultMeta = {
  title: "Ops Copilot - AI-Powered Operations Automation",
  description: "Document processes, identify bottlenecks, and generate automation blueprints using AI. Built for SMBs who want to move fast.",
  url: "https://opscopilot.com",
  image: "/og-image.png",
};

export function SEO({ 
  title, 
  description = defaultMeta.description, 
  path = "/",
  type = "website"
}: SEOProps) {
  const pageTitle = title 
    ? `${title} | Ops Copilot` 
    : defaultMeta.title;
  
  const canonicalUrl = `${defaultMeta.url}${path}`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${defaultMeta.url}${defaultMeta.image}`} />
      <meta property="og:site_name" content="Ops Copilot" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${defaultMeta.url}${defaultMeta.image}`} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Ops Copilot",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web",
          "description": description,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "127",
          },
        })}
      </script>
    </Helmet>
  );
}

export function LandingSEO() {
  return (
    <SEO 
      description="Automate your operations with AI-powered blueprints. Document workflows, identify bottlenecks, and generate actionable automation plans. Free to start."
      path="/"
    />
  );
}

export function PricingSEO() {
  return (
    <SEO 
      title="Pricing"
      description="Simple, transparent pricing for Ops Copilot. Start free and scale as your automation needs grow. No hidden fees."
      path="/pricing"
    />
  );
}

export function SecuritySEO() {
  return (
    <SEO 
      title="Security"
      description="Enterprise-grade security for your operations data. SOC 2 compliant, GDPR ready, with EU data residency options."
      path="/security"
    />
  );
}

export function DocsSEO() {
  return (
    <SEO 
      title="Documentation"
      description="Learn how to use Ops Copilot. Quick start guide, FAQ, and comprehensive documentation for all features."
      path="/docs"
    />
  );
}

export function DashboardSEO() {
  return (
    <SEO 
      title="Dashboard"
      description="Your operations command center. Track intakes, blueprints, automations, and ROI in one place."
      path="/app"
    />
  );
}
