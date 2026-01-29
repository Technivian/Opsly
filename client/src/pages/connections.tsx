import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Mail,
  MessageSquare,
  Users,
  Calculator,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  Plug,
  Unplug,
} from "lucide-react";
import { SiGoogle, SiSlack, SiHubspot, SiSalesforce } from "react-icons/si";
import type { Connection } from "@shared/schema";

interface Provider {
  key: string;
  name: string;
  description: string;
  icon: JSX.Element;
  category: "email" | "communication" | "crm" | "accounting";
  authType: "oauth" | "apikey";
  comingSoon?: boolean;
}

const providers: Provider[] = [
  {
    key: "gmail",
    name: "Gmail / Google Workspace",
    description: "Connect your Gmail inbox for email automation",
    icon: <SiGoogle className="w-6 h-6 text-red-500" />,
    category: "email",
    authType: "oauth",
  },
  {
    key: "outlook",
    name: "Outlook / Microsoft 365",
    description: "Connect Outlook for email and calendar automation",
    icon: <Mail className="w-6 h-6 text-blue-500" />,
    category: "email",
    authType: "oauth",
  },
  {
    key: "slack",
    name: "Slack",
    description: "Send notifications and messages to Slack channels",
    icon: <SiSlack className="w-6 h-6 text-purple-500" />,
    category: "communication",
    authType: "oauth",
  },
  {
    key: "hubspot",
    name: "HubSpot",
    description: "Sync leads and contacts with HubSpot CRM",
    icon: <SiHubspot className="w-6 h-6 text-orange-500" />,
    category: "crm",
    authType: "oauth",
  },
  {
    key: "salesforce",
    name: "Salesforce",
    description: "Connect to Salesforce for CRM automation",
    icon: <SiSalesforce className="w-6 h-6 text-blue-400" />,
    category: "crm",
    authType: "oauth",
  },
  {
    key: "exact",
    name: "Exact Online",
    description: "Dutch accounting and ERP integration",
    icon: <Calculator className="w-6 h-6 text-blue-600" />,
    category: "accounting",
    authType: "oauth",
  },
  {
    key: "afas",
    name: "AFAS Software",
    description: "Dutch ERP and accounting system",
    icon: <Calculator className="w-6 h-6 text-green-600" />,
    category: "accounting",
    authType: "apikey",
  },
];

const categoryInfo = {
  email: { title: "Email & Calendar", icon: <Mail className="w-5 h-5" /> },
  communication: { title: "Communication", icon: <MessageSquare className="w-5 h-5" /> },
  crm: { title: "CRM & Sales", icon: <Users className="w-5 h-5" /> },
  accounting: { title: "Accounting", icon: <Calculator className="w-5 h-5" /> },
};

export default function Connections() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: connections, isLoading } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
  });

  const connectMutation = useMutation({
    mutationFn: async ({ provider, apiKey }: { provider: string; apiKey?: string }) => {
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to connect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({ title: t('common.success'), description: "Connection initiated successfully" });
      setSelectedProvider(null);
      setApiKeyValue("");
    },
    onError: () => {
      toast({ title: t('common.error'), description: "Failed to connect", variant: "destructive" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      const res = await fetch(`/api/connections/${connectionId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({ title: t('common.success'), description: "Disconnected successfully" });
    },
    onError: () => {
      toast({ title: t('common.error'), description: "Failed to disconnect", variant: "destructive" });
    },
  });

  const getConnectionForProvider = (providerKey: string) => {
    return connections?.find((c) => c.provider === providerKey);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "expired":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{t('connections.connected')}</Badge>;
      case "error":
        return <Badge variant="destructive">{t('connections.error')}</Badge>;
      case "expired":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{t('connections.expired')}</Badge>;
      default:
        return <Badge variant="secondary">{t('connections.pending')}</Badge>;
    }
  };

  const handleConnect = async (provider: Provider) => {
    if (provider.authType === "apikey") {
      setSelectedProvider(provider);
    } else {
      setIsConnecting(true);
      try {
        await connectMutation.mutateAsync({ provider: provider.key });
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const handleApiKeySubmit = async () => {
    if (!selectedProvider || !apiKeyValue.trim()) return;
    await connectMutation.mutateAsync({ provider: selectedProvider.key, apiKey: apiKeyValue });
  };

  const categories = ["email", "communication", "crm", "accounting"] as const;

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{t('connections.title')}</h1>
        <p className="text-muted-foreground">{t('connections.subtitle')}</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        categories.map((category) => {
          const categoryProviders = providers.filter((p) => p.category === category);
          const info = categoryInfo[category];

          return (
            <div key={category}>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {info.icon}
                </div>
                <h2 className="text-lg font-semibold">{info.title}</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryProviders.map((provider) => {
                  const connection = getConnectionForProvider(provider.key);
                  const isConnected = connection?.status === "connected";

                  return (
                    <Card
                      key={provider.key}
                      className={`relative overflow-hidden ${
                        isConnected
                          ? "border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent"
                          : ""
                      }`}
                      data-testid={`card-connection-${provider.key}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              {provider.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base">{provider.name}</CardTitle>
                              {connection && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  {getStatusIcon(connection.status)}
                                  <span className="text-xs text-muted-foreground">
                                    {connection.accountEmail || connection.accountName}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          {connection && getStatusBadge(connection.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-4">
                          {provider.description}
                        </p>
                        {isConnected ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => disconnectMutation.mutate(connection.id)}
                              disabled={disconnectMutation.isPending}
                              data-testid={`button-disconnect-${provider.key}`}
                            >
                              <Unplug className="w-4 h-4 mr-1.5" />
                              {t('connections.disconnect')}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleConnect(provider)}
                            disabled={isConnecting || connectMutation.isPending}
                            data-testid={`button-connect-${provider.key}`}
                          >
                            <Plug className="w-4 h-4 mr-1.5" />
                            {t('connections.connect')}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })
      )}

      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your API key to connect to {selectedProvider?.name}. You can find this in your account settings.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
                data-testid="input-api-key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProvider(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleApiKeySubmit}
              disabled={!apiKeyValue.trim() || connectMutation.isPending}
              data-testid="button-submit-api-key"
            >
              {connectMutation.isPending ? "Connecting..." : t('connections.connect')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
