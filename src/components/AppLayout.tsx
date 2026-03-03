import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WifiOff, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground text-sm">SecureAudit AI</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-success/40 text-success bg-success/10 text-xs gap-1.5">
                <WifiOff className="h-3 w-3" />
                Offline Mode
              </Badge>
              <Badge variant="outline" className="border-primary/40 text-primary bg-primary/10 text-xs">
                LLM: Active
              </Badge>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
