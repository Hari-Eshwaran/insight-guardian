import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { alerts, recommendations } from "@/data/auditData";
import { AlertTriangle, ShieldAlert, Lightbulb } from "lucide-react";

const severityStyles = {
  critical: "border-destructive/30 bg-destructive/5 glow-destructive",
  high: "border-warning/30 bg-warning/5 glow-warning",
};

const severityBadge = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
};

export default function Alerts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerts & Recommendations</h1>
        <p className="text-muted-foreground text-sm mt-1">Critical findings and prioritized remediation guidance from PTE Sep-2025</p>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <Card key={i} className={`bg-card ${severityStyles[alert.severity]}`}>
            <CardContent className="flex items-start gap-3 py-4">
              {alert.severity === "critical" ? (
                <ShieldAlert className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{alert.title}</p>
                  <Badge className={severityBadge[alert.severity]}>{alert.severity}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{alert.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary" /> Recommendations</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/30 border border-border">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{rec.title}</p>
                  <Badge variant="outline" className={
                    rec.priority === "Immediate" ? "border-destructive/40 text-destructive" :
                    rec.priority === "Short-term" ? "border-warning/40 text-warning" :
                    "border-primary/40 text-primary"
                  }>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
