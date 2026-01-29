import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

type Role = "OWNER" | "ADMIN" | "OPERATOR" | "VIEWER" | "MEMBER";

interface OrgMember {
  id: number;
  orgId: number;
  userId: string;
  role: Role;
}

const roleHierarchy: Record<Role, number> = {
  OWNER: 5,
  ADMIN: 4,
  OPERATOR: 3,
  MEMBER: 2,
  VIEWER: 1,
};

const permissions = {
  manageOrg: ["OWNER", "ADMIN"],
  inviteMembers: ["OWNER", "ADMIN"],
  deleteMembers: ["OWNER", "ADMIN"],
  createIntakes: ["OWNER", "ADMIN", "OPERATOR", "MEMBER"],
  editBlueprints: ["OWNER", "ADMIN", "OPERATOR"],
  runAutomations: ["OWNER", "ADMIN", "OPERATOR"],
  createAutomations: ["OWNER", "ADMIN"],
  viewDashboard: ["OWNER", "ADMIN", "OPERATOR", "VIEWER", "MEMBER"],
  viewRoi: ["OWNER", "ADMIN", "OPERATOR", "VIEWER", "MEMBER"],
  manageConnections: ["OWNER", "ADMIN"],
} as const;

type Permission = keyof typeof permissions;

export function useRbac() {
  const { user, isAuthenticated } = useAuth();

  const { data: members } = useQuery<OrgMember[]>({
    queryKey: ["/api/org/members"],
    enabled: isAuthenticated,
  });

  const currentMember = members?.find(m => m.userId === user?.id);
  const role = currentMember?.role || "MEMBER";

  const hasRole = (requiredRoles: Role[]): boolean => {
    return requiredRoles.includes(role as Role);
  };

  const hasMinRole = (minRole: Role): boolean => {
    return roleHierarchy[role as Role] >= roleHierarchy[minRole];
  };

  const can = (permission: Permission): boolean => {
    const allowedRoles = permissions[permission];
    return allowedRoles.includes(role as any);
  };

  return {
    role,
    hasRole,
    hasMinRole,
    can,
    isOwner: role === "OWNER",
    isAdmin: role === "ADMIN" || role === "OWNER",
    isOperator: hasMinRole("OPERATOR"),
    isViewer: role === "VIEWER",
  };
}
