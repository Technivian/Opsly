import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Intakes from "@/pages/intakes";
import IntakeWizard from "@/pages/intake-wizard";
import Blueprints from "@/pages/blueprints";
import BlueprintDetail from "@/pages/blueprint-detail";
import Automations from "@/pages/automations";
import AutomationConfig from "@/pages/automation-config";
import Runs from "@/pages/runs";
import ROIDashboard from "@/pages/roi";
import Settings from "@/pages/settings";
import { AppShell } from "@/components/app/app-shell";

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  return (
    <AppShell>
      <Component />
    </AppShell>
  );
}

function PublicRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Redirect to="/app" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute component={Landing} />
      </Route>
      <Route path="/app">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/app/intakes">
        <ProtectedRoute component={Intakes} />
      </Route>
      <Route path="/app/intakes/new">
        <ProtectedRoute component={IntakeWizard} />
      </Route>
      <Route path="/app/blueprints">
        <ProtectedRoute component={Blueprints} />
      </Route>
      <Route path="/app/blueprints/:id">
        <ProtectedRoute component={BlueprintDetail} />
      </Route>
      <Route path="/app/automations">
        <ProtectedRoute component={Automations} />
      </Route>
      <Route path="/app/automations/:templateId">
        <ProtectedRoute component={AutomationConfig} />
      </Route>
      <Route path="/app/runs">
        <ProtectedRoute component={Runs} />
      </Route>
      <Route path="/app/roi">
        <ProtectedRoute component={ROIDashboard} />
      </Route>
      <Route path="/app/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
