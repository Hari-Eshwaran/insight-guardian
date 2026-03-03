import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  dashboardStats, workflowSteps, severityDistribution,
  categoryBreakdown, osDistribution, serviceDistribution,
  hostRiskScores, scanActivityHeatmap, evidenceCategories,
  hosts, openServices
} from "@/data/auditData";
import {
  Server, AlertTriangle, ShieldAlert, FileSearch, Brain, WifiOff,
  CheckCircle, Clock, Loader2, Monitor, Cloud, HardDrive,
  Activity, Globe, Shield
} from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap
} from "recharts";

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(220, 18%, 12%)",
    border: "1px solid hsl(220, 14%, 20%)",
    borderRadius: "8px",
    fontSize: "12px",
    color: "hsl(210, 20%, 90%)",
  },
  itemStyle: { color: "hsl(210, 20%, 90%)" },
};

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle className="h-5 w-5 text-success" />;
  if (status === "processing") return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
  return <Clock className="h-5 w-5 text-muted-foreground" />;
};

// Category radar chart data
const radarData = categoryBreakdown.map((c) => ({
  category: c.category,
  findings: c.critical + c.high + c.medium + c.low,
  risk: c.critical * 10 + c.high * 7 + c.medium * 4 + c.low,
}));

// Environment treemap data
const flatTreeData = [
  {
    name: `Azure Servers`,
    size: hosts.filter((h) => h.environment === "azure" && h.purpose === "server").length,
    fill: "hsl(217, 91%, 60%)",
  },
  {
    name: `Azure Devices`,
    size: hosts.filter((h) => h.environment === "azure" && h.purpose === "device").length,
    fill: "hsl(217, 91%, 40%)",
  },
  {
    name: `On-Prem Servers`,
    size: hosts.filter((h) => h.environment === "on-prem" && h.purpose === "server").length,
    fill: "hsl(152, 69%, 50%)",
  },
  {
    name: `On-Prem Devices`,
    size: hosts.filter((h) => h.environment === "on-prem" && h.purpose === "device").length,
    fill: "hsl(152, 69%, 35%)",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security Audit Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            org-domainh PTE Sep-2025 — {dashboardStats.totalHosts} hosts assessed across Azure & On-Premises
          </p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs gap-1.5 h-7">
          <Activity className="h-3 w-3" />
          Live Analysis
        </Badge>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total Hosts" value={dashboardStats.totalHosts} icon={Server} accent="text-primary" />
        <StatCard label="Open Services" value={dashboardStats.openServiceCount} icon={Globe} accent="text-blue-400" />
        <StatCard label="Evidence Files" value={dashboardStats.totalEvidenceFiles} icon={FileSearch} accent="text-emerald-400" />
        <StatCard label="Critical" value={dashboardStats.criticalCount} icon={ShieldAlert} accent="text-destructive" />
        <StatCard label="High Risk" value={dashboardStats.highCount} icon={AlertTriangle} accent="text-warning" />
        <StatCard label="Medium/Low" value={dashboardStats.mediumCount + dashboardStats.lowCount} icon={Shield} accent="text-sky-400" />
      </div>

      {/* Environment Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full p-2.5 bg-blue-500/10">
              <Cloud className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Azure Environment</span>
                <span className="text-lg font-bold">{dashboardStats.azureHosts}</span>
              </div>
              <Progress value={(dashboardStats.azureHosts / dashboardStats.totalHosts) * 100} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {hosts.filter((h) => h.environment === "azure" && h.purpose === "server").length} servers,{" "}
                {hosts.filter((h) => h.environment === "azure" && h.purpose === "device").length} devices — {openServices.filter((s) => s.environment === "azure").length} open services
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="rounded-full p-2.5 bg-emerald-500/10">
              <HardDrive className="h-5 w-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">On-Premises Environment</span>
                <span className="text-lg font-bold">{dashboardStats.onPremHosts}</span>
              </div>
              <Progress value={(dashboardStats.onPremHosts / dashboardStats.totalHosts) * 100} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {hosts.filter((h) => h.environment === "on-prem" && h.purpose === "server").length} servers,{" "}
                {hosts.filter((h) => h.environment === "on-prem" && h.purpose === "device").length} devices — {openServices.filter((s) => s.environment === "on-prem").length} open services
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Progress */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Progress</CardTitle>
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
                    value={step.status === "completed" ? 100 : step.status === "processing" ? 55 : 0}
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

      {/* Charts Row 1: Severity + Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Vulnerability Severity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  dataKey="value"
                  stroke="none"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {severityDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {severityDistribution.map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.fill }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Findings by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} axisLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} axisLine={false} width={110} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="critical" name="Critical" fill="hsl(0, 72%, 51%)" stackId="a" radius={0} />
                <Bar dataKey="high" name="High" fill="hsl(38, 92%, 50%)" stackId="a" radius={0} />
                <Bar dataKey="medium" name="Medium" fill="hsl(190, 90%, 50%)" stackId="a" radius={0} />
                <Bar dataKey="low" name="Low" fill="hsl(152, 69%, 41%)" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2: OS Distribution + Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Host OS Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={osDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  stroke="hsl(220, 14%, 20%)"
                  strokeWidth={1}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {osDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Open Service Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={serviceDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                <XAxis dataKey="service" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} axisLine={false} />
                <YAxis tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} axisLine={false} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="count" name="Instances" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Risk Radar + Treemap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Risk Radar by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 14%, 20%)" />
                <PolarAngleAxis dataKey="category" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "hsl(215, 12%, 40%)", fontSize: 10 }} />
                <Radar name="Risk Score" dataKey="risk" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.25} />
                <Radar name="Finding Count" dataKey="findings" stroke="hsl(217, 91%, 60%)" fill="hsl(217, 91%, 60%)" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Tooltip {...chartTooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Infrastructure Map</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <Treemap
                data={flatTreeData}
                dataKey="size"
                stroke="hsl(220, 14%, 20%)"
                content={<CustomTreemapContent />}
              />
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              {flatTreeData.map((d) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.fill }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="font-medium">{d.size}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Affected Hosts Table */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Top Affected Hosts</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Host IP</TableHead>
                <TableHead className="text-center">Critical</TableHead>
                <TableHead className="text-center">High</TableHead>
                <TableHead className="text-center">Medium</TableHead>
                <TableHead className="text-center">Low</TableHead>
                <TableHead className="text-right">Risk Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hostRiskScores.slice(0, 8).map((h) => {
                const hostInfo = hosts.find((x) => x.address === h.host);
                return (
                  <TableRow key={h.host}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono text-sm">{h.host}</span>
                        {hostInfo && (
                          <Badge variant="outline" className="text-[10px] h-5">
                            {hostInfo.os}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {h.critical > 0 ? <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-xs">{h.critical}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {h.high > 0 ? <Badge className="bg-warning/15 text-warning border-warning/30 text-xs">{h.high}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {h.medium > 0 ? <Badge className="bg-sky-500/15 text-sky-400 border-sky-500/30 text-xs">{h.medium}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      {h.low > 0 ? <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-xs">{h.low}</Badge> : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-bold ${h.total >= 30 ? "text-destructive" : h.total >= 15 ? "text-warning" : "text-muted-foreground"}`}>
                        {h.total}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Scan Activity Heatmap */}
      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Scan Activity Heatmap (Sep 8, 2025)</CardTitle></CardHeader>
        <CardContent>
          <ScanHeatmap />
        </CardContent>
      </Card>

      {/* Evidence Coverage + System Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Evidence Coverage</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {evidenceCategories.map((cat) => (
              <div key={cat.folder} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                  <span>{cat.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">{cat.fileCount} files</span>
                  <Badge variant="outline" className="border-success/40 text-success text-[10px] h-5">
                    Complete
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Local LLM Status</CardTitle>
              <Brain className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">LLaMA 3 — Technical Analysis</span>
                <Badge className="bg-primary/15 text-primary border-primary/30">Processing</Badge>
              </div>
              <Progress value={68} className="h-1.5" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Gemma 2 — Executive Summary</span>
                <Badge className="bg-muted text-muted-foreground border-border">Queued</Badge>
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
                <Badge variant="outline" className="border-success/40 text-success">Air-Gapped</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Privacy</span>
                <Badge variant="outline" className="border-success/40 text-success">Enforced</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Encryption</span>
                <Badge variant="outline" className="border-success/40 text-success">AES-256</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data Sources</span>
                <Badge variant="outline" className="border-primary/40 text-primary">{dashboardStats.totalDataSourceRows.toLocaleString()} rows</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// --------------- Stat Card Component ---------------

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent: string }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${accent}`} />
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

// --------------- Custom Treemap Content ---------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTreemapContent(props: any) {
  const { x, y, width, height, name, fill } = props;
  if (width < 30 || height < 30) return null;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="hsl(220, 14%, 16%)" strokeWidth={2} rx={4} />
      {width > 60 && height > 40 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fill="hsl(210, 20%, 90%)" fontSize={11} fontWeight={500}>
          {name}
        </text>
      )}
    </g>
  );
}

// --------------- Scan Heatmap ---------------

const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function heatColor(value: number) {
  if (value === 0) return "bg-muted/30";
  if (value <= 2) return "bg-primary/20";
  if (value <= 4) return "bg-primary/40";
  if (value <= 5) return "bg-warning/50";
  return "bg-destructive/60";
}

function ScanHeatmap() {
  return (
    <div className="space-y-2">
      <div className="flex gap-1 items-center">
        <div className="w-12" />
        {dayLabels.map((d) => (
          <div key={d} className="flex-1 text-center text-xs text-muted-foreground">{d}</div>
        ))}
      </div>
      {scanActivityHeatmap.map((row) => (
        <div key={row.hour} className="flex gap-1 items-center">
          <div className="w-12 text-xs text-muted-foreground text-right pr-2">{row.hour}:00</div>
          {days.map((day) => (
            <div
              key={day}
              className={`flex-1 h-8 rounded-sm ${heatColor(row[day])} flex items-center justify-center`}
              title={`${row[day]} scans`}
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
