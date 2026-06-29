import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  ClipboardList,
  GitBranch,
  Sparkles,
  Play,
  BarChart3,
  Settings,
  ChevronDown,
  LogOut,
  Layers,
  Plug,
  Shield,
  FileText,
} from "lucide-react";

export function AppSidebar() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { titleKey: "nav.overview", url: "/app", icon: LayoutDashboard, testId: "nav-dashboard" },
  ];

  const intakeItems = [
    { titleKey: "nav.processes", url: "/app/intakes", icon: ClipboardList, testId: "nav-intakes" },
    { titleKey: "nav.improvements", url: "/app/blueprints", icon: GitBranch, testId: "nav-blueprints" },
  ];

  const automationItems = [
    { titleKey: "nav.automations", url: "/app/automations", icon: Sparkles, testId: "nav-automations" },
    { titleKey: "nav.runs", url: "/app/runs", icon: Play, testId: "nav-runs" },
  ];

  const analyticsItems = [
    { titleKey: "nav.results", url: "/app/roi", icon: BarChart3, testId: "nav-roi" },
  ];

  const settingsItems = [
    { titleKey: "nav.integrations", url: "/app/connections", icon: Plug, testId: "nav-connections" },
    { titleKey: "nav.settings", url: "/app/settings", icon: Settings, testId: "nav-settings" },
  ];

  const isActive = (url: string) => {
    if (url === "/app") return location === "/app";
    return location.startsWith(url);
  };

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const orgName = (user as any)?.org?.name || t("nav.myOrganization");

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 w-full p-2 rounded-md hover-elevate"
              data-testid="dropdown-org-switcher"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{orgName}</p>
                <p className="text-xs text-muted-foreground">{t("nav.pilotLabel")}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>
              <Layers className="w-4 h-4 mr-2" />
              {orgName}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-4 h-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.processGroup")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {intakeItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-4 h-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.automationGroup")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {automationItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-4 h-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("nav.insightGroup")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-4 h-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.titleKey}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url} data-testid={item.testId}>
                      <item.icon className="w-4 h-4" />
                      <span>{t(item.titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 w-full p-2 rounded-md hover-elevate"
              data-testid="dropdown-user-menu"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem asChild>
              <a href="/privacy">
                <Shield className="w-4 h-4 mr-2" />
                {t("nav.privacyPolicy")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/terms">
                <FileText className="w-4 h-4 mr-2" />
                {t("nav.termsOfService")}
              </a>
            </DropdownMenuItem>
            <div className="my-1 h-px bg-border" />
            <DropdownMenuItem onClick={() => logout()} data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              {t("nav.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
