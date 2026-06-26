import { useTranslation } from "react-i18next";
import { SiLinkedin } from "react-icons/si";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { SectionHeading } from "@/components/marketing/section-heading";
import { ContactForm } from "@/components/marketing/contact-form";
import { SEO, organisationStructuredData } from "@/components/seo";
import { site } from "@/config/site";

export default function Contact() {
  const { t } = useTranslation();

  const channels = [
    { key: "general", email: site.emails.general },
    { key: "support", email: site.emails.support },
    { key: "security", email: site.emails.security },
    { key: "privacy", email: site.emails.privacy },
    { key: "legal", email: site.emails.legal },
  ] as const;

  return (
    <MarketingLayout>
      <SEO
        title={t("corp.contact.title")}
        description={t("corp.contact.seoDescription")}
        path="/contact"
        structuredData={organisationStructuredData}
      />

      <section>
        <div className="max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <SectionHeading
            as="h1"
            eyebrow={t("corp.nav.contact")}
            title={t("corp.contact.title")}
            lead={t("corp.contact.subtitle")}
          />
          <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            {t("corp.contact.intro")}
          </p>

          <div className="mt-12 grid lg:grid-cols-[1.4fr_1fr] gap-12">
            <div>
              <ContactForm />
            </div>

            <aside className="lg:border-l lg:pl-12">
              <h2 className="font-medium mb-4">{t("corp.contact.channels.title")}</h2>
              <ul className="space-y-4">
                {channels.map((channel) => (
                  <li key={channel.key}>
                    <p className="text-sm font-medium">
                      {t(`corp.contact.channels.${channel.key}`)}
                    </p>
                    <a
                      href={`mailto:${channel.email}`}
                      className="text-sm text-primary hover:underline"
                      data-testid={`link-email-${channel.key}`}
                    >
                      {channel.email}
                    </a>
                  </li>
                ))}
              </ul>

              {site.social.linkedin && (
                <a
                  href={site.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground"
                >
                  <SiLinkedin className="w-4 h-4" />
                  {t("corp.contact.linkedinLabel")}
                </a>
              )}
            </aside>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
