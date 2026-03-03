import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reports, vulnerabilities, severityDistribution, categoryBreakdown } from "@/data/mockData";
import { Download, Eye, FileText } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartTooltipStyle = {
  contentStyle: { backgroundColor: "hsl(220, 18%, 12%)", border: "1px solid hsl(220, 14%, 20%)", borderRadius: "8px", fontSize: "12px", color: "hsl(210, 20%, 90%)" },
  itemStyle: { color: "hsl(210, 20%, 90%)" },
};

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Generated audit reports and detailed findings</p>
      </div>

      {/* Report Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-base">Findings by Severity</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={severityDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
          <CardHeader><CardTitle className="text-base">Risk Scores by Category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} axisLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: "hsl(215, 12%, 55%)", fontSize: 12 }} axisLine={false} width={80} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="critical" fill="hsl(0, 72%, 51%)" stackId="a" radius={0} />
                <Bar dataKey="high" fill="hsl(38, 92%, 50%)" stackId="a" radius={0} />
                <Bar dataKey="medium" fill="hsl(190, 90%, 50%)" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Generated Reports</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />{r.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.date}</TableCell>
                  <TableCell>
                    <Badge className={r.status === "Completed" ? "bg-success/15 text-success border-success/30" : "bg-primary/15 text-primary border-primary/30"}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Report Preview</CardTitle></CardHeader>
        <CardContent>
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Executive Summary</TabsTrigger>
              <TabsTrigger value="scoring">Risk Scoring</TabsTrigger>
              <TabsTrigger value="findings">Detailed Findings</TabsTrigger>
            </TabsList>
            <TabsContent value="summary" className="mt-4">
              <div className="bg-muted/50 rounded-md p-4 text-sm text-muted-foreground leading-relaxed space-y-3">
                <p>The Q4 2024 security audit identified <strong className="text-foreground">8 critical</strong> and <strong className="text-foreground">23 high-severity</strong> vulnerabilities across the assessed infrastructure. The most pressing concerns involve SQL injection and remote code execution vulnerabilities in production-facing systems.</p>
                <p>Immediate remediation is recommended for all critical findings. A phased remediation plan has been provided with estimated timelines and resource requirements.</p>
              </div>
            </TabsContent>
            <TabsContent value="scoring" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Critical</TableHead>
                    <TableHead>High</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Authentication</TableCell><TableCell className="text-destructive">2</TableCell><TableCell className="text-warning">5</TableCell><TableCell>2.1/10</TableCell></TableRow>
                  <TableRow><TableCell>Input Validation</TableCell><TableCell className="text-destructive">3</TableCell><TableCell className="text-warning">8</TableCell><TableCell>1.8/10</TableCell></TableRow>
                  <TableRow><TableCell>Access Control</TableCell><TableCell className="text-destructive">2</TableCell><TableCell className="text-warning">6</TableCell><TableCell>3.2/10</TableCell></TableRow>
                  <TableRow><TableCell>Configuration</TableCell><TableCell className="text-destructive">1</TableCell><TableCell className="text-warning">4</TableCell><TableCell>4.5/10</TableCell></TableRow>
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="findings" className="mt-4">
              <Table>
                <TableHeader><TableRow><TableHead>Vulnerability</TableHead><TableHead>Severity</TableHead><TableHead>CVE</TableHead></TableRow></TableHeader>
                <TableBody>
                  {vulnerabilities.slice(0, 5).map((v) => (
                    <TableRow key={v.cve}>
                      <TableCell>{v.name}</TableCell>
                      <TableCell><Badge className={v.severity === "Critical" ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-warning/15 text-warning border-warning/30"}>{v.severity}</Badge></TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{v.cve}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
