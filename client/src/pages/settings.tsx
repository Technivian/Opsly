import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Building2,
  Users,
  Link2,
  Plus,
  Loader2,
  Mail,
  Crown,
  Shield,
  User,
} from "lucide-react";
import type { Org, OrgMember, Connection } from "@shared/schema";

const INTEGRATIONS = [
  { provider: "gmail", name: "Gmail", description: "Connect Gmail for email automation" },
  { provider: "outlook", name: "Outlook", description: "Connect Outlook for email automation" },
  { provider: "salesforce", name: "Salesforce", description: "Connect Salesforce CRM" },
  { provider: "hubspot", name: "HubSpot", description: "Connect HubSpot CRM" },
  { provider: "slack", name: "Slack", description: "Connect Slack for notifications" },
  { provider: "jira", name: "Jira", description: "Connect Jira for task management" },
];

interface OrgMemberWithUser extends OrgMember {
  user?: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
}

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: org, isLoading: orgLoading } = useQuery<Org>({
    queryKey: ["/api/org"],
  });

  const { data: members, isLoading: membersLoading } = useQuery<OrgMemberWithUser[]>({
    queryKey: ["/api/org/members"],
  });

  const { data: connections, isLoading: connectionsLoading } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return apiRequest("POST", "/api/org/invite", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/org/members"] });
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${inviteEmail}`,
      });
      setInviteEmail("");
      setIsInviteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation.",
        variant: "destructive",
      });
    },
  });

  const connectMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest("POST", "/api/connections", { provider });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection Pending",
        description: "Connection record created. OAuth flow coming soon!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create connection.",
        variant: "destructive",
      });
    },
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-4 h-4 text-chart-4" />;
      case "ADMIN":
        return <Shield className="w-4 h-4 text-primary" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "ADMIN":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getConnectionStatus = (provider: string) => {
    const connection = connections?.find((c) => c.provider === provider);
    return connection?.status || null;
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization, team, and integrations.
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization" data-testid="tab-organization">
            <Building2 className="w-4 h-4 mr-2" /> Organization
          </TabsTrigger>
          <TabsTrigger value="members" data-testid="tab-members">
            <Users className="w-4 h-4 mr-2" /> Members
          </TabsTrigger>
          <TabsTrigger value="connections" data-testid="tab-connections">
            <Link2 className="w-4 h-4 mr-2" /> Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>
                Manage your organization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orgLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input
                      id="orgName"
                      value={org?.name || "My Organization"}
                      disabled
                      data-testid="input-org-name"
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your organization name.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Plan</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Free Plan</Badge>
                      <span className="text-sm text-muted-foreground">
                        Upgrade coming soon
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Created</Label>
                    <p className="text-sm text-muted-foreground">
                      {org?.createdAt
                        ? new Date(org.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to your organization
                  </CardDescription>
                </div>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-invite-member">
                      <Plus className="w-4 h-4 mr-2" /> Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          data-testid="input-invite-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger data-testid="select-invite-role">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })}
                        disabled={!inviteEmail || inviteMutation.isPending}
                        data-testid="button-send-invite"
                      >
                        {inviteMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Mail className="w-4 h-4 mr-2" />
                        )}
                        Send Invitation
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : members?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={member.user?.profileImageUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {member.user?.firstName?.[0] || member.user?.email?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.user?.firstName
                                  ? `${member.user.firstName} ${member.user.lastName || ""}`
                                  : member.user?.email || "Unknown"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(member.role)}
                            <Badge variant={getRoleBadgeVariant(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No team members yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your tools to enable automations (Coming Soon)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {INTEGRATIONS.map((integration) => {
                  const status = getConnectionStatus(integration.provider);
                  
                  return (
                    <div
                      key={integration.provider}
                      className="flex items-center justify-between p-4 rounded-lg border"
                      data-testid={`connection-${integration.provider}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Link2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      {status === "pending" ? (
                        <Badge variant="secondary">Pending</Badge>
                      ) : status === "connected" ? (
                        <Badge variant="default">Connected</Badge>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => connectMutation.mutate(integration.provider)}
                          disabled={connectMutation.isPending}
                          data-testid={`button-connect-${integration.provider}`}
                        >
                          {connectMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
