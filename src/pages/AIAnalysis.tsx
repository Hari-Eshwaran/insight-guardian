import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aiModels, aiAnalysisOutput, dashboardStats } from "@/data/auditData";
import { Brain, Cpu } from "lucide-react";

const statusColor = (status: string) => {
  if (status === "Completed") return "bg-success/15 text-success border-success/30";
  if (status === "Processing") return "bg-primary/15 text-primary border-primary/30";
  if (status === "Queued") return "bg-muted text-muted-foreground border-border";
  return "bg-warning/15 text-warning border-warning/30";
};

export default function AIAnalysis() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Analysis (Local LLMs)</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Offline AI models processing {dashboardStats.totalVulnerabilities} vulnerability findings from {dashboardStats.totalHosts} hosts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiModels.map((model) => (
          <Card key={model.name} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{model.name}</CardTitle>
              </div>
              <Badge className={statusColor(model.status)}>{model.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{model.purpose}</p>
              <p className="text-xs text-muted-foreground">{model.description}</p>
              <Progress value={model.progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground text-right">{model.progress}%</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /> Context Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <label className="text-sm text-muted-foreground mb-2 block">Organization Type</label>
            <Select defaultValue="enterprise">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="government">Government</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">AI Output Preview — LLaMA 3 (Partial)</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-muted/50 rounded-md p-4 font-mono text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
            {aiAnalysisOutput}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
