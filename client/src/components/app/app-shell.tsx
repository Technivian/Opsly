import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { t } = useTranslation();

  const getBreadcrumbs = () => {
    const parts = location.split("/").filter(Boolean);
    const breadcrumbs: { label: string; href?: string }[] = [];

    if (parts[0] === "app") {
      if (parts.length === 1) {
        breadcrumbs.push({ label: t("nav.overview") });
      } else {
        breadcrumbs.push({ label: t("nav.overview"), href: "/app" });

        if (parts[1] === "intakes") {
          if (parts.length === 2) {
            breadcrumbs.push({ label: t("nav.processes") });
          } else if (parts[2] === "new") {
            breadcrumbs.push({ label: t("nav.processes"), href: "/app/intakes" });
            breadcrumbs.push({ label: t("intakes.wizard.title") });
          }
        } else if (parts[1] === "blueprints") {
          if (parts.length === 2) {
            breadcrumbs.push({ label: t("nav.improvements") });
          } else {
            breadcrumbs.push({ label: t("nav.improvements"), href: "/app/blueprints" });
            breadcrumbs.push({ label: t("common.details") });
          }
        } else if (parts[1] === "automations") {
          if (parts.length === 2) {
            breadcrumbs.push({ label: t("nav.automations") });
          } else {
            breadcrumbs.push({ label: t("nav.automations"), href: "/app/automations" });
            breadcrumbs.push({ label: t("common.configure") });
          }
        } else if (parts[1] === "runs") {
          breadcrumbs.push({ label: t("nav.runs") });
        } else if (parts[1] === "roi") {
          breadcrumbs.push({ label: t("nav.results") });
        } else if (parts[1] === "connections") {
          breadcrumbs.push({ label: t("nav.integrations") });
        } else if (parts[1] === "settings") {
          breadcrumbs.push({ label: t("nav.settings") });
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col flex-1 min-w-0">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" data-testid="button-sidebar-toggle" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={index}>
                    {index > 0 && <BreadcrumbSeparator />}
                    {crumb.href ? (
                      <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex-1" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
