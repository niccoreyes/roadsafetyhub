import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EncounterTableProps {
  encounters: any[];
  isLoading?: boolean;
}

export function EncounterTable({ encounters, isLoading }: EncounterTableProps) {
  const [sortField, setSortField] = useState<string>("period.start");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedEncounters = [...encounters].sort((a, b) => {
    let aValue, bValue;

    if (sortField === "period.start") {
      aValue = a.period?.start || "";
      bValue = b.period?.start || "";
    } else if (sortField === "status") {
      aValue = a.status || "";
      bValue = b.status || "";
    } else {
      return 0;
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Encounters</CardTitle>
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
        <CardTitle>Encounters ({encounters.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort("status")}
                >
                  Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Disposition</TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => toggleSort("period.start")}
                >
                  Start {sortField === "period.start" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedEncounters.slice(0, 100).map((encounter, index) => (
                <TableRow key={encounter.id || index}>
                  <TableCell className="font-mono text-xs">
                    {encounter.id?.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      encounter.status === "finished" 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    }`}>
                      {encounter.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">
                    {encounter.type?.[0]?.coding?.[0]?.display || "N/A"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {encounter.subject?.reference?.replace("Patient/", "") || "N/A"}
                  </TableCell>
                  <TableCell>
                    {encounter.hospitalization?.dischargeDisposition?.coding?.[0]?.code || "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {encounter.period?.start 
                      ? new Date(encounter.period.start).toLocaleDateString() 
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {encounter.period?.end 
                      ? new Date(encounter.period.end).toLocaleDateString() 
                      : "Ongoing"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {encounters.length > 100 && (
          <p className="text-sm text-muted-foreground mt-2">
            Showing first 100 of {encounters.length} encounters
          </p>
        )}
      </CardContent>
    </Card>
  );
}
