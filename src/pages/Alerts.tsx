import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { alerts, recommendations, vulnerabilities, dashboardStats } from "@/data/auditData";
import {
  AlertTriangle, ShieldAlert, Lightbulb, Search, Bell, BellRing,
  Clock, ChevronRight, Filter, Download, CheckCircle, XCircle,
  Zap, Shield, Target, BarChart3, Info
} from "lucide-react";
import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts";

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

const severityStyles: Record<string, string> = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-warning/30 bg-warning/5",
  medium: "border-sky-500/30 bg-sky-500/5",
  low: "border-emerald-500/30 bg-emerald-500/5",
};

const severityBadge: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-warning/15 text-warning border-warning/30",
  medium: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const priorityBadge = (priority: string) => {
  if (priority === "Immediate") return "border-destructive/40 text-destructive bg-destructive/10";
  if (priority === "Short-term") return "border-warning/40 text-warning bg-warning/10";
  return "border-primary/40 text-primary bg-primary/10";
};

// Remediation effort estimates
const effortEstimates = recommendations.map((rec, i) => ({
  ...rec,
  effort: rec.priority === "Immediate" ? "1-3 days" : rec.priority === "Short-term" ? "1-2 weeks" : "2-4 weeks",
  impact: rec.priority === "Immediate" ? "Critical" : rec.priority === "Short-term" ? "High" : "Medium",
  progress: rec.priority === "Immediate" ? 0 : 0,
}));

export default function Alerts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("alerts");
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<number>>(new Set());

  const criticalAlerts = alerts.filter(a => a.severity === "critical").length;
  const highAlerts = alerts.filter(a => a.severity === "high").length;

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert, i) => {
      if (dismissedAlerts.has(i)) return false;
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return alert.title.toLowerCase().includes(q) || alert.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, severityFilter, dismissedAlerts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alerts & Recommendations</h1>
          <p className="text-muted-foreground text-sm mt-1">Critical findings and prioritized remediation guidance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Badge variant="outline" className="border-destructive/40 text-destructive bg-destructive/10 text-xs h-7 gap-1.5">
            <BellRing className="h-3 w-3" /> {alerts.length - dismissedAlerts.size} Active
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card border-border border-destructive/20">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full p-2 bg-destructive/10"><ShieldAlert className="h-4 w-4 text-destructive" /></div>
            <div>
              <p className="text-2xl font-bold text-destructive">{criticalAlerts}</p>
              <p className="text-[10px] text-muted-foreground">Critical Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border border-warning/20">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full p-2 bg-warning/10"><AlertTriangle className="h-4 w-4 text-warning" /></div>
            <div>
              <p className="text-2xl font-bold text-warning">{highAlerts}</p>
              <p className="text-[10px] text-muted-foreground">High Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full p-2 bg-primary/10"><Lightbulb className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-2xl font-bold">{recommendations.length}</p>
              <p className="text-[10px] text-muted-foreground">Recommendations</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full p-2 bg-emerald-500/10"><Target className="h-4 w-4 text-emerald-400" /></div>
            <div>
              <p className="text-2xl font-bold">{recommendations.filter(r => r.priority === "Immediate").length}</p>
              <p className="text-[10px] text-muted-foreground">Immediate Actions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts" className="gap-1.5 text-xs"><Bell className="h-3.5 w-3.5" /> Alerts ({alerts.length - dismissedAlerts.size})</TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-1.5 text-xs"><Lightbulb className="h-3.5 w-3.5" /> Remediation</TabsTrigger>
          <TabsTrigger value="summary" className="gap-1.5 text-xs"><BarChart3 className="h-3.5 w-3.5" /> Summary</TabsTrigger>
        </TabsList>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Alert Timeline */}
          <div className="space-y-3">
            {filteredAlerts.map((alert, origIdx) => {
              const globalIdx = alerts.indexOf(alert);
              return (
                <Card key={globalIdx} className={`bg-card ${severityStyles[alert.severity]} transition-all hover:shadow-md`}>
                  <CardContent className="flex items-start gap-3 py-4">
                    <div className="mt-0.5">
                      {alert.severity === "critical" ? (
                        <div className="rounded-full p-1.5 bg-destructive/15">
                          <ShieldAlert className="h-4 w-4 text-destructive" />
                        </div>
                      ) : (
                        <div className="rounded-full p-1.5 bg-warning/15">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <Badge className={severityBadge[alert.severity]}>{alert.severity}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {alert.time}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-[10px] text-muted-foreground hover:text-foreground"
                          onClick={() => setDismissedAlerts(prev => new Set([...prev, globalIdx]))}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredAlerts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No matching alerts</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="mt-4 space-y-4">
          {/* Priority groups */}
          {(["Immediate", "Short-term", "Medium-term"] as const).map(priority => {
            const priorityRecs = effortEstimates.filter(r => r.priority === priority);
            if (priorityRecs.length === 0) return null;
            return (
              <div key={priority}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={priorityBadge(priority)}>{priority}</Badge>
                  <span className="text-xs text-muted-foreground">{priorityRecs.length} actions</span>
                </div>
                <div className="space-y-2">
                  {priorityRecs.map((rec, i) => (
                    <Card key={i} className={`bg-card border-border ${priority === "Immediate" ? "border-destructive/20" : priority === "Short-term" ? "border-warning/20" : ""}`}>
                      <CardContent className="py-4">
                        <div className="flex items-start gap-3">
                          <div className={`rounded-full p-1.5 mt-0.5 shrink-0 ${
                            priority === "Immediate" ? "bg-destructive/10" : priority === "Short-term" ? "bg-warning/10" : "bg-primary/10"
                          }`}>
                            <Zap className={`h-3.5 w-3.5 ${
                              priority === "Immediate" ? "text-destructive" : priority === "Short-term" ? "text-warning" : "text-primary"
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm mb-1">{rec.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Est: {rec.effort}
                              </span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3" /> Impact: {rec.impact}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">Alert Severity Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Critical", value: criticalAlerts, fill: "hsl(0, 72%, 51%)" },
                        { name: "High", value: highAlerts, fill: "hsl(38, 92%, 50%)" },
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" stroke="none"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {[{ fill: "hsl(0, 72%, 51%)" }, { fill: "hsl(38, 92%, 50%)" }].map((c, i) => <Cell key={i} fill={c.fill} />)}
                    </Pie>
                    <Tooltip {...chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader><CardTitle className="text-sm">Remediation by Priority</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[
                    { priority: "Immediate", count: recommendations.filter(r => r.priority === "Immediate").length, fill: "hsl(0, 72%, 51%)" },
                    { priority: "Short-term", count: recommendations.filter(r => r.priority === "Short-term").length, fill: "hsl(38, 92%, 50%)" },
                    { priority: "Medium-term", count: recommendations.filter(r => r.priority === "Medium-term").length, fill: "hsl(217, 91%, 60%)" },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                    <XAxis dataKey="priority" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} axisLine={false} />
                    <YAxis tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 11 }} axisLine={false} />
                    <Tooltip {...chartTooltipStyle} />
                    <Bar dataKey="count" name="Actions" radius={[4, 4, 0, 0]}>
                      {[{ fill: "hsl(0, 72%, 51%)" }, { fill: "hsl(38, 92%, 50%)" }, { fill: "hsl(217, 91%, 60%)" }]
                        .map((c, i) => <Cell key={i} fill={c.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Remediation Roadmap */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Remediation Roadmap</CardTitle>
              <CardDescription className="text-xs">Estimated timeline for full remediation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { phase: "Phase 1 — Immediate (Week 1)", items: recommendations.filter(r => r.priority === "Immediate"), color: "destructive" },
                { phase: "Phase 2 — Short-term (Weeks 2-4)", items: recommendations.filter(r => r.priority === "Short-term"), color: "warning" },
                { phase: "Phase 3 — Medium-term (Weeks 4-8)", items: recommendations.filter(r => r.priority === "Medium-term"), color: "primary" },
              ].map(phase => (
                <div key={phase.phase} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{phase.phase}</p>
                    <Badge variant="outline" className="text-[10px]">{phase.items.length} actions</Badge>
                  </div>
                  <div className="ml-4 space-y-1">
                    {phase.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                    ))}
                  </div>
                  <Progress value={0} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info card */}
      <Card className="bg-card border-border border-primary/20">
        <CardContent className="flex gap-3 py-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Prioritized Remediation</p>
            <p className="text-sm text-muted-foreground mt-1">
              Alerts are generated from the top <strong className="text-foreground">{dashboardStats.criticalCount} critical</strong> and{" "}
              <strong className="text-foreground">{dashboardStats.highCount} high-severity</strong> vulnerabilities.
              Remediation recommendations are prioritized based on exploit likelihood, business impact, and effort-to-remediate ratio.
              Immediate actions address actively exploitable vulnerabilities with known public exploits.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
