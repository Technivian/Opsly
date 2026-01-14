import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ClipboardList, ArrowRight, FileText } from "lucide-react";
import type { Intake } from "@shared/schema";

export default function Intakes() {
  const { data: intakes, isLoading } = useQuery<Intake[]>({
    queryKey: ["/api/intakes"],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return "default";
      case "SUBMITTED":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPainAreaLabel = (area: string | null) => {
    const labels: Record<string, string> = {
      SALES: "Sales",
      SUPPORT: "Support",
      FINANCE: "Finance",
      OPS: "Operations",
    };
    return area ? labels[area] || area : "-";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Intakes</h1>
          <p className="text-muted-foreground">
            Document your operational challenges and get AI-powered process blueprints.
          </p>
        </div>
        <Link href="/app/intakes/new">
          <Button data-testid="button-new-intake">
            <Plus className="w-4 h-4 mr-2" /> New Intake
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Intakes</CardTitle>
          <CardDescription>
            Track the status of your process intake submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : intakes?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Pain Area</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intakes.map((intake) => (
                  <TableRow key={intake.id} data-testid={`row-intake-${intake.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        {intake.title}
                      </div>
                    </TableCell>
                    <TableCell>{getPainAreaLabel(intake.painArea)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(intake.status)}>
                        {intake.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(intake.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {intake.status === "PROCESSED" && (
                        <Link href={`/app/blueprints?intakeId=${intake.id}`}>
                          <Button variant="ghost" size="sm" data-testid={`button-view-blueprint-${intake.id}`}>
                            View Blueprint <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="font-semibold text-lg mb-2">No intakes yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Start by creating an intake to document your operational challenges.
                Our AI will analyze it and generate a process blueprint.
              </p>
              <Link href="/app/intakes/new">
                <Button data-testid="button-create-first-intake">
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Intake
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
