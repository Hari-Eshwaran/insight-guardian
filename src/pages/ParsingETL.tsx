import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { vulnerabilities } from "@/data/mockData";
import { CheckCircle, Loader2, Clock } from "lucide-react";

const pipelineSteps = [
  { name: "File Extraction", status: "completed" },
  { name: "XML / JSON Parsing", status: "completed" },
  { name: "Risk Filtering", status: "processing" },
];

const stepIcon = (status: string) => {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-success" />;
  if (status === "processing") return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
};

export default function ParsingETL() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parsing & ETL</h1>
        <p className="text-muted-foreground text-sm mt-1">Extract, transform, and filter vulnerability data</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Pipeline Status</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            {pipelineSteps.map((step, i) => (
              <div key={step.name} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {stepIcon(step.status)}
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
                {i < pipelineSteps.length - 1 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Parsed Vulnerabilities</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vulnerability</TableHead>
                <TableHead>CVE</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Source File</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vulnerabilities.map((v) => (
                <TableRow key={v.cve}>
                  <TableCell className="font-medium">{v.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.cve}</TableCell>
                  <TableCell>
                    <Badge className={v.severity === "Critical" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-warning/15 text-warning border-warning/30"}>
                      {v.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.source}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
