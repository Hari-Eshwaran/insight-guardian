import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { vulnerabilities } from "@/data/auditData";
import { CheckCircle, Loader2, Clock, Filter } from "lucide-react";

const pipelineSteps = [
  { name: "File Extraction", status: "completed" },
  { name: "CSV / TXT Parsing", status: "completed" },
  { name: "Risk Classification", status: "completed" },
  { name: "Evidence Correlation", status: "processing" },
];

const stepIcon = (status: string) => {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-success" />;
  if (status === "processing") return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
};

const severityBadge = (severity: string) => {
  const styles: Record<string, string> = {
    Critical: "bg-destructive/15 text-destructive border-destructive/30",
    High: "bg-warning/15 text-warning border-warning/30",
    Medium: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  };
  return styles[severity] || "bg-muted text-muted-foreground";
};

export default function ParsingETL() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parsing & ETL</h1>
        <p className="text-muted-foreground text-sm mt-1">Extract, transform, and classify vulnerability data from scan evidence</p>
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
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Parsed Vulnerabilities — {vulnerabilities.length} findings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Vulnerability</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Port</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Evidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vulnerabilities.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">{v.id}</TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div>{v.name}</div>
                    {v.cve && <span className="text-xs text-muted-foreground font-mono">{v.cve}</span>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{v.host}</TableCell>
                  <TableCell className="text-muted-foreground">{v.port > 0 ? v.port : "—"}</TableCell>
                  <TableCell className="text-xs">{v.category}</TableCell>
                  <TableCell>
                    <Badge className={severityBadge(v.severity)}>{v.severity}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate">{v.evidence}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
