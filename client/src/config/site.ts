/**
 * Central site configuration — single source of truth for company identity,
 * public contact details, canonical URLs and product attribution.
 *
 * Do not hard-code public contact data or company names in components.
 * Import from here instead.
 */

export const site = {
  company: {
    name: "Aurivian",
    legalName: "Aurivian B.V.",
    domain: "aurivian.nl",
    url: "https://aurivian.nl",
  },

  product: {
    name: "Opsly",
    /** Use when attributing the product to its parent company. */
    attribution: "Opsly by Aurivian",
    /** Use in legal / footer contexts. */
    legalAttribution: "Opsly is a product of Aurivian B.V.",
    /** Current lifecycle of the product. Restrained, evidence-based. */
    status: ["Pilot", "Early production"] as const,
    /** Canonical product page on the corporate site. */
    path: "/products/opsly",
  },

  /**
   * Public contact addresses. These are the ONLY contact addresses that may
   * appear anywhere in the public application.
   */
  emails: {
    general: "hello@aurivian.nl",
    support: "support@aurivian.nl",
    security: "security@aurivian.nl",
    privacy: "privacy@aurivian.nl",
    legal: "legal@aurivian.nl",
  },

  /**
   * Optional social links. Render a link ONLY when a value is a non-empty
   * string. Do not render placeholder or empty links.
   */
  social: {
    linkedin: null as string | null,
  },

  /**
   * Future subdomain structure. Documented for reference only — not wired into
   * routing, cookies or authentication during this phase.
   */
  futureDomains: {
    corporate: "https://aurivian.nl",
    product: "https://opsly.aurivian.nl",
    app: "https://app.opsly.aurivian.nl",
  },
} as const;

export type SiteConfig = typeof site;
