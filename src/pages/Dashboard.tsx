import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dashboardStats, workflowSteps } from "@/data/mockData";
import { FileText, AlertTriangle, ShieldAlert, FileCheck, Brain, WifiOff, CheckCircle, Clock, Loader2 } from "lucide-react";

const statCards = [
  { label: "Total Files Uploaded", value: dashboardStats.totalFiles, icon: FileText, accent: "text-primary" },
  { label: "High Risks Detected", value: dashboardStats.highRisks, icon: AlertTriangle, accent: "text-warning" },
  { label: "Critical Risks Detected", value: dashboardStats.criticalRisks, icon: ShieldAlert, accent: "text-destructive" },
  { label: "Reports Generated", value: dashboardStats.reportsGenerated, icon: FileCheck, accent: "text-success" },
];

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-success" />;
  if (status === "processing") return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">Security audit pipeline status and metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.accent}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {workflowSteps.map((step, i) => (
              <div key={step.name} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    {statusIcon(step.status)}
                    <span className="text-sm font-medium">{step.name}</span>
                  </div>
                  <Progress
                    value={step.status === "completed" ? 100 : step.status === "processing" ? 60 : 0}
                    className="h-1.5"
                  />
                </div>
                {i < workflowSteps.length - 1 && (
                  <div className="text-muted-foreground text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Local LLM Status</CardTitle>
            <Brain className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">LLaMA 3</span>
              <Badge className="bg-primary/15 text-primary border-primary/30">Processing</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gemma 2</span>
              <Badge className="bg-success/15 text-success border-success/30">Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <WifiOff className="h-5 w-5 text-success" />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Network Mode</span>
              <Badge variant="outline" className="border-success/40 text-success">Offline</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Data Privacy</span>
              <Badge variant="outline" className="border-success/40 text-success">Enforced</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Encryption</span>
              <Badge variant="outline" className="border-success/40 text-success">AES-256</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
