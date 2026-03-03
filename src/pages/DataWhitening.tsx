import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { whiteningExamples } from "@/data/auditData";
import { ArrowRight, Info } from "lucide-react";
import { useState } from "react";

export default function DataWhitening() {
  const [ipMasking, setIpMasking] = useState(true);
  const [hostMasking, setHostMasking] = useState(true);
  const [clientRemoval, setClientRemoval] = useState(true);
  const [certMasking, setCertMasking] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Whitening & Sanitization</h1>
        <p className="text-muted-foreground text-sm mt-1">Remove sensitive identifiers from scan data before AI processing</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {whiteningExamples.map((ex) => (
          <Card key={ex.field} className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{ex.field}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Original</p>
                  <p className="font-mono text-sm text-destructive">{ex.original}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 rounded-md bg-success/10 border border-success/20 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Whitened</p>
                  <p className="font-mono text-sm text-success">{ex.whitened}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <CardHeader><CardTitle className="text-lg">Masking Controls</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">IP Address Masking</span>
              <p className="text-xs text-muted-foreground">Replace all 10.x.x.x addresses with HOST_* tokens</p>
            </div>
            <Switch checked={ipMasking} onCheckedChange={setIpMasking} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Domain / Hostname Masking</span>
              <p className="text-xs text-muted-foreground">Replace org-domain*.com and FQDNs with DOMAIN_* tokens</p>
            </div>
            <Switch checked={hostMasking} onCheckedChange={setHostMasking} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Client / Organization Removal</span>
              <p className="text-xs text-muted-foreground">Strip registrar, org names, and contact details</p>
            </div>
            <Switch checked={clientRemoval} onCheckedChange={setClientRemoval} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm">Certificate & Device Identity Masking</span>
              <p className="text-xs text-muted-foreground">Replace SSL cert CNs and device serial numbers</p>
            </div>
            <Switch checked={certMasking} onCheckedChange={setCertMasking} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border border-primary/20 glow-primary">
        <CardContent className="flex gap-3 py-4">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Why Data Whitening is Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Data whitening removes all personally identifiable information (PII), client-specific details, and internal network identifiers before data is processed by local AI models. This ensures data privacy compliance, prevents information leakage, and allows the AI to focus on vulnerability patterns rather than specific organizational context. For this engagement, 37 host IPs, domain names, SSL certificate identities, and registrar details are sanitized.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
