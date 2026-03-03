import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { validationChecklist } from "@/data/auditData";
import { CheckCircle, XCircle, ShieldCheck, Info } from "lucide-react";

export default function Validation() {
  const passedCount = validationChecklist.filter((c) => c.passed).length;
  const total = validationChecklist.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Validation & Accuracy</h1>
        <p className="text-muted-foreground text-sm mt-1">Verify AI outputs against parsed scan evidence</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Validation Checklist</CardTitle>
          <span className="text-sm text-muted-foreground">{passedCount}/{total} passed</span>
        </CardHeader>
        <CardContent className="space-y-3">
          {validationChecklist.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              {item.passed ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : (
                <XCircle className="h-5 w-5 text-warning" />
              )}
              <span className={`text-sm ${item.passed ? "text-foreground" : "text-warning"}`}>{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card border-border border-primary/20 glow-primary">
        <CardContent className="flex gap-3 py-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Evidence-Based AI Outputs</p>
            <p className="text-sm text-muted-foreground mt-1">
              All AI-generated outputs are restricted to parsed evidence only. The validation layer cross-references every finding, severity rating, and remediation suggestion against the original Nmap, Nikto, and Metasploit scan data to prevent hallucinations and ensure accuracy. Currently awaiting completion of AI analysis pass to validate executive summary and business impact assessment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
