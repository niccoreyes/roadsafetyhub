import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ConditionTableProps {
  conditions: any[];
  isLoading?: boolean;
}

export function ConditionTable({ conditions, isLoading }: ConditionTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conditions ({conditions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Display</TableHead>
                <TableHead>Clinical Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Recorded Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conditions.slice(0, 100).map((condition, index) => (
                <TableRow key={condition.id || index}>
                  <TableCell className="font-mono text-xs">
                    {condition.code?.coding?.[0]?.code?.substring(0, 12) || "N/A"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {condition.code?.coding?.[0]?.display || condition.code?.text || "N/A"}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      condition.clinicalStatus?.coding?.[0]?.code === "active"
                        ? "bg-warning/10 text-warning"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {condition.clinicalStatus?.coding?.[0]?.code || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {condition.category?.[0]?.coding?.[0]?.display || "N/A"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {condition.subject?.reference?.replace("Patient/", "") || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {condition.recordedDate 
                      ? new Date(condition.recordedDate).toLocaleDateString() 
                      : "N/A"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {conditions.length > 100 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing first 100 of {conditions.length} conditions
          </p>
        )}
      </CardContent>
    </Card>
  );
}
