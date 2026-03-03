import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { dashboardStats, workflowSteps, severityDistribution, categoryBreakdown, timelineData } from "@/data/mockData";
import { FileText, AlertTriangle, ShieldAlert, FileCheck, Brain, WifiOff, CheckCircle, Clock, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area, ResponsiveContainer, Legend } from "recharts";

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

const chartTooltipStyle = {
  contentStyle: { backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 20%, 90%)" },
  itemStyle: { color: "hsl(210, 20%, 90%)" },
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Severity Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={severityDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" stroke="none" label={({ name, value }) => `${name}: ${value}`}>
                  {severityDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Vulnerabilities by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryBreakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                <XAxis dataKey="category" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} axisLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="critical" fill="hsl(0, 72%, 51%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="high" fill="hsl(38, 92%, 50%)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="medium" fill="hsl(190, 90%, 50%)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Vulnerability Discovery Timeline</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
              <XAxis dataKey="date" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip {...chartTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "hsl(215, 12%, 55%)" }} />
              <Area type="monotone" dataKey="medium" stackId="1" stroke="hsl(190, 90%, 50%)" fill="hsl(190, 90%, 50%)" fillOpacity={0.2} />
              <Area type="monotone" dataKey="high" stackId="1" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.3} />
              <Area type="monotone" dataKey="critical" stackId="1" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Heatmap */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Risk Activity Heatmap</CardTitle></CardHeader>
        <CardContent>
          <RiskHeatmap />
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

// Heatmap component
import { heatmapData } from "@/data/mockData";

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatColor(value: number) {
  if (value === 0) return "bg-muted/30";
  if (value <= 1) return "bg-primary/20";
  if (value <= 3) return "bg-primary/40";
  if (value <= 5) return "bg-warning/50";
  return "bg-destructive/60";
}

function RiskHeatmap() {
  return (
    <div className="space-y-2">
      <div className="flex gap-1 items-center">
        <div className="w-10" />
        {dayLabels.map((d) => (
          <div key={d} className="flex-1 text-center text-xs text-muted-foreground">{d}</div>
        ))}
      </div>
      {heatmapData.map((row) => (
        <div key={row.hour} className="flex gap-1 items-center">
          <div className="w-10 text-xs text-muted-foreground text-right pr-2">{row.hour}:00</div>
          {days.map((day) => (
            <div
              key={day}
              className={`flex-1 h-8 rounded-sm ${heatColor(row[day])} flex items-center justify-center`}
              title={`${row[day]} findings`}
            >
              {row[day] > 0 && <span className="text-xs text-foreground/70">{row[day]}</span>}
            </div>
          ))}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-xs text-muted-foreground">Less</span>
        {["bg-muted/30", "bg-primary/20", "bg-primary/40", "bg-warning/50", "bg-destructive/60"].map((c) => (
          <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  );
}
