import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { dataSourceFiles, evidenceCategories, totalEvidenceFiles } from "@/data/auditData";
import { Upload, FileJson, FileCode, Play, Database, FolderOpen, CheckCircle } from "lucide-react";

export default function DataIngestion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Ingestion</h1>
        <p className="text-muted-foreground text-sm mt-1">Ingested security scan data from org-domainh PTE Sep-2025 engagement</p>
      </div>

      <Card className="bg-card border-border border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="rounded-full p-4 bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">Drag & Drop Evidence ZIP</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse — supports Metasploit CSV exports, Nmap output, Nikto reports</p>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="gap-1"><FileCode className="h-3 w-3" /> CSV</Badge>
            <Badge variant="outline" className="gap-1"><FileJson className="h-3 w-3" /> TXT</Badge>
            <Badge variant="outline" className="gap-1"><FileCode className="h-3 w-3" /> XML</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5 text-primary" /> Metasploit CSV Exports</CardTitle>
          <Button size="sm" className="gap-2">
            <Play className="h-4 w-4" /> Re-Process
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dataSourceFiles.map((f) => (
                <TableRow key={f.name}>
                  <TableCell className="font-mono text-sm">{f.name}</TableCell>
                  <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{f.size}</TableCell>
                  <TableCell className="text-muted-foreground">{f.rows.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-success/15 text-success border-success/30">
                      {f.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" /> Evidence Directories — {totalEvidenceFiles} files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {evidenceCategories.map((cat) => (
            <div key={cat.folder} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">{cat.name}</span>
                <span className="text-xs text-muted-foreground font-mono">/{cat.folder}/</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{cat.fileCount} files</span>
                <Badge className="bg-success/15 text-success border-success/30 text-xs">Ingested</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
