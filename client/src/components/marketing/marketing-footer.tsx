import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { SiLinkedin } from "react-icons/si";
import { site } from "@/config/site";

export function MarketingFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-24">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <div className="font-semibold tracking-tight text-lg mb-3">Aurivian</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("corp.footer.tagline")}
            </p>
            {site.social.linkedin && (
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-muted-foreground hover:text-foreground"
                data-testid="link-linkedin"
              >
                <SiLinkedin className="w-4 h-4" />
                {t("corp.contact.linkedinLabel")}
              </a>
            )}
          </div>

          <div>
            <h2 className="font-medium text-sm mb-3">{t("corp.footer.company")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">{t("corp.nav.about")}</Link></li>
              <li><Link href="/approach" className="hover:text-foreground">{t("corp.nav.approach")}</Link></li>
              <li><Link href="/experience" className="hover:text-foreground">{t("corp.nav.experience")}</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">{t("corp.nav.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="font-medium text-sm mb-3">{t("corp.footer.product")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-foreground">{t("corp.nav.services")}</Link></li>
              <li><Link href="/products" className="hover:text-foreground">{t("corp.nav.products")}</Link></li>
              <li><Link href="/products/opsly" className="hover:text-foreground">Opsly</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground">{t("corp.opsly.cta.pricing")}</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="font-medium text-sm mb-3">{t("corp.footer.legal")}</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-foreground">{t("corp.footer.privacy")}</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">{t("corp.footer.terms")}</Link></li>
              <li><Link href="/security" className="hover:text-foreground">{t("corp.footer.security")}</Link></li>
              <li>
                <a href={`mailto:${site.emails.general}`} className="hover:text-foreground">
                  {site.emails.general}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm text-muted-foreground">
          <p>&copy; {year} {site.company.legalName} {t("corp.footer.rights")}</p>
          <p>{site.product.legalAttribution}</p>
        </div>
      </div>
    </footer>
  );
}
