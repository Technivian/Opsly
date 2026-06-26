import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", href: "/" },
  { key: "services", href: "/services" },
  { key: "products", href: "/products" },
  { key: "approach", href: "/approach" },
  { key: "experience", href: "/experience" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export function MarketingHeader() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-semibold tracking-tight text-lg"
          data-testid="link-brand-home"
        >
          Aurivian
        </Link>

        <nav className="hidden lg:flex items-center gap-1 text-sm" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "px-3 py-2 rounded-md transition-colors hover:text-foreground",
                isActive(item.href) ? "text-foreground font-medium" : "text-muted-foreground"
              )}
              data-testid={`link-nav-${item.key}`}
            >
              {t(`corp.nav.${item.key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <a href="/app" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" data-testid="link-open-app">
                {t("corp.nav.openApp")}
              </Button>
            </a>
          ) : (
            <Link href="/auth/signin" className="hidden sm:inline-flex">
              <Button variant="ghost" size="sm" data-testid="link-signin">
                {t("corp.nav.signIn")}
              </Button>
            </Link>
          )}
          <Link href="/contact" className="hidden sm:inline-flex">
            <Button size="sm" data-testid="button-header-cta">
              {t("corp.nav.cta")}
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("corp.nav.menu")}
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="text-left mb-4">Aurivian</SheetTitle>
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "px-3 py-2.5 rounded-md text-sm transition-colors hover:bg-muted",
                      isActive(item.href) ? "text-foreground font-medium" : "text-muted-foreground"
                    )}
                    data-testid={`link-mobile-nav-${item.key}`}
                  >
                    {t(`corp.nav.${item.key}`)}
                  </Link>
                ))}
                <div className="h-px bg-border my-3" />
                <Link href="/contact" onClick={() => setOpen(false)}>
                  <Button className="w-full" data-testid="button-mobile-cta">
                    {t("corp.nav.cta")}
                  </Button>
                </Link>
                {isAuthenticated ? (
                  <a href="/app" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full mt-2">
                      {t("corp.nav.openApp")}
                    </Button>
                  </a>
                ) : (
                  <Link href="/auth/signin" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full mt-2">
                      {t("corp.nav.signIn")}
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 mt-4">
                  <LanguageSwitcher />
                  <ThemeToggle />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
