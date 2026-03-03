import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { uploadedFiles } from "@/data/mockData";
import { Upload, FileJson, FileCode, Play } from "lucide-react";

export default function DataIngestion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Ingestion</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload and manage security scan files for analysis</p>
      </div>

      <Card className="bg-card border-border border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="rounded-full p-4 bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-medium">Drag & Drop ZIP File</p>
            <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
          </div>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline" className="gap-1"><FileCode className="h-3 w-3" /> XML</Badge>
            <Badge variant="outline" className="gap-1"><FileJson className="h-3 w-3" /> JSON</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Uploaded Files</CardTitle>
          <Button size="sm" className="gap-2">
            <Play className="h-4 w-4" /> Start Processing
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uploadedFiles.map((f) => (
                <TableRow key={f.name}>
                  <TableCell className="font-mono text-sm">{f.name}</TableCell>
                  <TableCell><Badge variant="outline">{f.type}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{f.size}</TableCell>
                  <TableCell>
                    <Badge className={f.status === "Parsed" ? "bg-success/15 text-success border-success/30" : "bg-warning/15 text-warning border-warning/30"}>
                      {f.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
