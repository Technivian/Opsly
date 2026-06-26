import { Helmet } from "react-helmet-async";
import { site } from "@/config/site";

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: "website" | "article";
  /** Optional brand suffix for the document title. Defaults to Aurivian. */
  brand?: string;
  /** Optional additional JSON-LD structured data nodes. */
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

const defaultMeta = {
  title: "Aurivian — quality engineering, automation and responsible AI",
  description:
    "Aurivian helps organisations improve operations through quality engineering, intelligent automation and responsible AI.",
  url: site.company.url,
  image: "/og-image.png",
};

export function SEO({
  title,
  description = defaultMeta.description,
  path = "/",
  type = "website",
  brand = site.company.name,
  structuredData,
}: SEOProps) {
  const pageTitle = title ? `${title} | ${brand}` : defaultMeta.title;

  const canonicalUrl = `${defaultMeta.url}${path}`;
  const nodes = structuredData
    ? Array.isArray(structuredData)
      ? structuredData
      : [structuredData]
    : [];

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
      <meta property="og:site_name" content={brand} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${defaultMeta.url}${defaultMeta.image}`} />

      {nodes.map((node, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(node)}
        </script>
      ))}
    </Helmet>
  );
}

/** Organisation structured data for Aurivian B.V. — facts only. */
export const organisationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.company.legalName,
  alternateName: site.company.name,
  url: site.company.url,
  email: site.emails.general,
  ...(site.social.linkedin ? { sameAs: [site.social.linkedin] } : {}),
};

/** Product structured data for Opsly — no invented price or rating. */
export const opslyStructuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.product.name,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Opsly helps SMEs turn manual and fragmented work into clear processes, practical automation and measurable operational improvement.",
  url: `${site.company.url}${site.product.path}`,
  publisher: {
    "@type": "Organization",
    name: site.company.legalName,
    url: site.company.url,
  },
};

export function PricingSEO() {
  return (
    <SEO
      title="Pilots and commercial options"
      brand="Opsly"
      description="Opsly is available through pilots and early-access arrangements. Commercial terms depend on scope, integrations, support and deployment requirements."
      path="/pricing"
    />
  );
}

export function SecuritySEO() {
  return (
    <SEO
      title="Security"
      brand="Opsly"
      description="How Opsly protects your operations data: data isolation, encryption, GDPR alignment and EU data residency options."
      path="/security"
    />
  );
}

export function DocsSEO() {
  return (
    <SEO
      title="Documentation"
      brand="Opsly"
      description="Learn how to use Opsly. Quick start guide, FAQ and documentation for all features."
      path="/docs"
    />
  );
}

export function DashboardSEO() {
  return (
    <SEO
      title="Dashboard"
      brand="Opsly"
      description="Your operations command center. Track intakes, blueprints, automations and ROI in one place."
      path="/app"
    />
  );
}
