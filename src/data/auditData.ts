// ============================================================
// Audit data parsed from REAL data files
// Sources: Metasploit CSV exports + Nmap/Nikto evidence files
// All data is parsed at build time from the data/ directory
// ============================================================

import { parseCsv, type HostCsvRow, type ServiceCsvRow } from "./parseCsv";
import {
  parseNmapVulnScan,
  parseFtpBanner,
  parseNiktoScan,
  parseSecurityHeaders,
  deriveOsVulnerabilities,
  deriveServiceVulnerabilities,
  assignVulnIds,
  type ParsedVulnerability,
} from "./parseEvidence";

// ─── Raw file imports (Vite ?raw → string at build time) ──────────
// MSF CSV exports
import azureHostsCsv from "../../data/msf_exports-20260303T125739Z-3-001/msf_exports/azure_hosts.csv?raw";
import onPremHostsCsv from "../../data/msf_exports-20260303T125739Z-3-001/msf_exports/on-prem_hosts.csv?raw";
import azureServicesCsv from "../../data/msf_exports-20260303T125739Z-3-001/msf_exports/azure_services.csv?raw";
import onPremServicesCsv from "../../data/msf_exports-20260303T125739Z-3-001/msf_exports/on-prem_services.csv?raw";
import azureNotesCsv from "../../data/msf_exports-20260303T125739Z-3-001/msf_exports/azure_notes.csv?raw";
import onPremNotesCsv from "../../data/msf_exports-20260303T125739Z-3-001/msf_exports/on-prem_notes.csv?raw";

// Key evidence files (vulnerability scans)
import vuln_10_80_10_152_http from "../../data/evidence-20260303T125652Z-3-001/evidence/vulnerability_assessment/10.80.10.152_http_80_nmap_vuln.txt?raw";
import vuln_10_102_237_149_http from "../../data/evidence-20260303T125652Z-3-001/evidence/vulnerability_assessment/10.102.237.149_http_80_nmap_vuln.txt?raw";

// FTP banners
import banner_10_162_251_64 from "../../data/evidence-20260303T125652Z-3-001/evidence/custom_tests/10.162.251.64_banner.txt?raw";
import banner_10_80_10_152 from "../../data/evidence-20260303T125652Z-3-001/evidence/custom_tests/10.80.10.152_banner.txt?raw";

// Web enumeration
import securityHeadersRaw from "../../data/evidence-20260303T125652Z-3-001/evidence/web_enum/security_headers.txt?raw";
import niktoScanRaw from "../../data/evidence-20260303T125652Z-3-001/evidence/web_enum/nikto_scan.txt?raw";

// ═══════════════════════════════════════════════════════════════════
// HOSTS — parsed from azure_hosts.csv + on-prem_hosts.csv
// ═══════════════════════════════════════════════════════════════════

export interface Host {
  address: string;
  os: string;
  osVersion: string;
  purpose: "server" | "device";
  environment: "azure" | "on-prem";
}

function normalizeOsName(row: HostCsvRow): string {
  const os = row.os_name.trim();
  if (!os || os.toLowerCase() === "unknown") return "Unknown";
  if (os.toLowerCase() === "embedded") return "Embedded";
  if (os.toLowerCase() === "ios") return "IOS";
  return os;
}

const parsedAzureHosts = parseCsv<HostCsvRow>(azureHostsCsv);
const parsedOnPremHosts = parseCsv<HostCsvRow>(onPremHostsCsv);

export const hosts: Host[] = [
  ...parsedAzureHosts.map((row) => ({
    address: row.address,
    os: normalizeOsName(row),
    osVersion: row.os_sp || "",
    purpose: (row.purpose || "device") as "server" | "device",
    environment: "azure" as const,
  })),
  ...parsedOnPremHosts.map((row) => ({
    address: row.address,
    os: normalizeOsName(row),
    osVersion: row.os_sp || "",
    purpose: (row.purpose || "device") as "server" | "device",
    environment: "on-prem" as const,
  })),
];

// ═══════════════════════════════════════════════════════════════════
// OPEN SERVICES — parsed from azure_services.csv + on-prem_services.csv
// Only includes services with state === "open"
// ═══════════════════════════════════════════════════════════════════

export interface OpenService {
  host: string;
  port: number;
  protocol: string;
  service: string;
  info: string;
  environment: "azure" | "on-prem";
}

const parsedAzureServices = parseCsv<ServiceCsvRow>(azureServicesCsv);
const parsedOnPremServices = parseCsv<ServiceCsvRow>(onPremServicesCsv);

export const openServices: OpenService[] = [
  ...parsedAzureServices
    .filter((row) => row.state === "open")
    .map((row) => ({
      host: row.host,
      port: parseInt(row.port, 10),
      protocol: row.proto,
      service: row.name,
      info: row.info || "",
      environment: "azure" as const,
    })),
  ...parsedOnPremServices
    .filter((row) => row.state === "open")
    .map((row) => ({
      host: row.host,
      port: parseInt(row.port, 10),
      protocol: row.proto,
      service: row.name,
      info: row.info || "",
      environment: "on-prem" as const,
    })),
];

// ═══════════════════════════════════════════════════════════════════
// NOTES — parsed from notes CSVs (for enrichment data)
// ═══════════════════════════════════════════════════════════════════

const allNotesCsv = azureNotesCsv + "\n" + onPremNotesCsv.split("\n").slice(1).join("\n");
const _parsedNotes = parseCsv<Record<string, string>>(allNotesCsv);

// ═══════════════════════════════════════════════════════════════════
// VULNERABILITIES — extracted from evidence files + derived from data
// ═══════════════════════════════════════════════════════════════════

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export interface Vulnerability {
  id: string;
  name: string;
  severity: Severity;
  host: string;
  port: number;
  service: string;
  category: string;
  description: string;
  evidence: string;
  remediation: string;
  cve?: string;
}

// Parse vulnerabilities from each evidence source
const nmapVulns_10_80: ParsedVulnerability[] = parseNmapVulnScan(
  vuln_10_80_10_152_http,
  "10.80.10.152",
  80,
  "vulnerability_assessment/10.80.10.152_http_80_nmap_vuln.txt"
);

const nmapVulns_10_102: ParsedVulnerability[] = parseNmapVulnScan(
  vuln_10_102_237_149_http,
  "10.102.237.149",
  80,
  "vulnerability_assessment/10.102.237.149_http_80_nmap_vuln.txt"
);

const bannerVulns_162: ParsedVulnerability[] = parseFtpBanner(
  banner_10_162_251_64,
  "10.162.251.64",
  "custom_tests/10.162.251.64_banner.txt"
);

const bannerVulns_80: ParsedVulnerability[] = parseFtpBanner(
  banner_10_80_10_152,
  "10.80.10.152",
  "custom_tests/10.80.10.152_banner.txt"
);

const niktoVulns: ParsedVulnerability[] = parseNiktoScan(niktoScanRaw);

const headerVulns: ParsedVulnerability[] = parseSecurityHeaders(securityHeadersRaw);

const osVulns: ParsedVulnerability[] = deriveOsVulnerabilities(hosts);

const serviceVulns: ParsedVulnerability[] = deriveServiceVulnerabilities(openServices);

// Combine all vulnerabilities and assign IDs
const allParsedVulns = assignVulnIds([
  ...nmapVulns_10_80,
  ...bannerVulns_162,
  ...bannerVulns_80,
  ...nmapVulns_10_102,
  ...niktoVulns,
  ...headerVulns,
  ...serviceVulns,
  ...osVulns,
]);

// Add supplementary findings from notes data
const additionalVulns: ParsedVulnerability[] = [];

// FortiOS certificate disclosure (from on-prem notes)
if (onPremNotesCsv.includes("FG200ETK18907182")) {
  additionalVulns.push({
    id: `VULN-${String(allParsedVulns.length + additionalVulns.length + 1).padStart(3, "0")}`,
    name: "Fortinet FortiOS SSL Certificate Disclosure",
    severity: "Low",
    host: "10.90.242.12",
    port: 443,
    service: "https",
    category: "Information Disclosure",
    description:
      "SSL certificate reveals FortiOS firmware identity (FG200ETK18907182) and Fortinet as the device manufacturer, aiding targeted attacks.",
    evidence: "on-prem_notes.csv",
    remediation:
      "Replace default SSL certificate with a custom certificate that does not disclose device identity.",
  });
}

// Server version disclosure (from nikto)
const iisDisclosure = niktoScanRaw.match(/Server:\s*Microsoft-IIS\/[\d.]+/g);
if (iisDisclosure && iisDisclosure.length > 0) {
  const version = iisDisclosure[0].replace("Server: ", "");
  additionalVulns.push({
    id: `VULN-${String(allParsedVulns.length + additionalVulns.length + 1).padStart(3, "0")}`,
    name: `Server Version Disclosure — ${version.replace("Microsoft-", "")}`,
    severity: "Low",
    host: "Multiple (8 hosts)",
    port: 80,
    service: "http",
    category: "Information Disclosure",
    description: `Server header reveals ${version} across many hosts, aiding attackers in fingerprinting the environment.`,
    evidence: "web_enum/nikto_scan.txt",
    remediation:
      "Configure IIS to suppress or customize the Server header via URL Rewrite module.",
  });
}

// X-Powered-By disclosure (from nikto)
if (niktoScanRaw.match(/x-powered-by.*?ASP\.NET/gi)) {
  additionalVulns.push({
    id: `VULN-${String(allParsedVulns.length + additionalVulns.length + 1).padStart(3, "0")}`,
    name: "X-Powered-By: ASP.NET Disclosure",
    severity: "Low",
    host: "Multiple (8 hosts)",
    port: 80,
    service: "http",
    category: "Information Disclosure",
    description:
      "X-Powered-By header reveals ASP.NET technology stack on multiple hosts.",
    evidence: "web_enum/nikto_scan.txt",
    remediation: "Remove X-Powered-By header in IIS configuration or web.config.",
  });
}

export const vulnerabilities: Vulnerability[] = [...allParsedVulns, ...additionalVulns];

// ═══════════════════════════════════════════════════════════════════
// EVIDENCE FILE METADATA — categorized by scan type
// File counts match actual directory structure (138 total files)
// ═══════════════════════════════════════════════════════════════════

export interface EvidenceCategory {
  name: string;
  folder: string;
  fileCount: number;
  status: "completed" | "processing" | "pending";
}

export const evidenceCategories: EvidenceCategory[] = [
  { name: "Port Scanning", folder: "port_scan", fileCount: 10, status: "completed" },
  { name: "Port Scanning (Phase 2)", folder: "port_scan2", fileCount: 10, status: "completed" },
  { name: "Vulnerability Assessment", folder: "vulnerability_assessment", fileCount: 61, status: "completed" },
  { name: "Web Enumeration", folder: "web_enum", fileCount: 14, status: "completed" },
  { name: "Domain Reconnaissance", folder: "domain_recon", fileCount: 7, status: "completed" },
  { name: "IP Analysis", folder: "ip_analysis", fileCount: 7, status: "completed" },
  { name: "IP Analysis (Phase 2)", folder: "ip_analysis2", fileCount: 7, status: "completed" },
  { name: "Custom FTP Tests", folder: "custom_tests", fileCount: 10, status: "completed" },
  { name: "Targeted Scans", folder: "targeted_scans", fileCount: 5, status: "completed" },
  { name: "MCP Credential Tests", folder: "MCP_tests", fileCount: 5, status: "completed" },
  { name: "WAF Detection", folder: "waf_tests", fileCount: 1, status: "completed" },
  { name: "WPScan Analysis", folder: "wpscan_analysis", fileCount: 1, status: "completed" },
];

export const totalEvidenceFiles = evidenceCategories.reduce((s, c) => s + c.fileCount, 0);

// ═══════════════════════════════════════════════════════════════════
// DATA SOURCE FILES — computed from actual CSV sizes and row counts
// ═══════════════════════════════════════════════════════════════════

export const dataSourceFiles = [
  {
    name: "azure_hosts.csv",
    type: "CSV",
    size: `${(azureHostsCsv.length / 1024).toFixed(1)} KB`,
    rows: parsedAzureHosts.length,
    status: "Parsed" as const,
  },
  {
    name: "azure_services.csv",
    type: "CSV",
    size: `${(azureServicesCsv.length / 1024).toFixed(1)} KB`,
    rows: parsedAzureServices.length,
    status: "Parsed" as const,
  },
  {
    name: "azure_notes.csv",
    type: "CSV",
    size: `${(azureNotesCsv.length / 1024).toFixed(1)} KB`,
    rows: _parsedNotes.filter((n) => n.Host && !n.Host.startsWith("10.90.242")).length,
    status: "Parsed" as const,
  },
  {
    name: "on-prem_hosts.csv",
    type: "CSV",
    size: `${(onPremHostsCsv.length / 1024).toFixed(1)} KB`,
    rows: parsedOnPremHosts.length,
    status: "Parsed" as const,
  },
  {
    name: "on-prem_services.csv",
    type: "CSV",
    size: `${(onPremServicesCsv.length / 1024).toFixed(1)} KB`,
    rows: parsedOnPremServices.length,
    status: "Parsed" as const,
  },
  {
    name: "on-prem_notes.csv",
    type: "CSV",
    size: `${(onPremNotesCsv.length / 1024).toFixed(1)} KB`,
    rows: _parsedNotes.filter((n) => n.Host?.startsWith("10.90.242")).length,
    status: "Parsed" as const,
  },
];

// ═══════════════════════════════════════════════════════════════════
// WORKFLOW STATUS — now sourced from backend pipeline state
// ═══════════════════════════════════════════════════════════════════
// workflowSteps removed — use useBackend().pipelineStatus.steps instead

// ═══════════════════════════════════════════════════════════════════
// COMPUTED STATS — all derived dynamically from parsed data
// ═══════════════════════════════════════════════════════════════════

export const dashboardStats = {
  totalHosts: hosts.length,
  azureHosts: hosts.filter((h) => h.environment === "azure").length,
  onPremHosts: hosts.filter((h) => h.environment === "on-prem").length,
  openServiceCount: openServices.length,
  totalVulnerabilities: vulnerabilities.length,
  criticalCount: vulnerabilities.filter((v) => v.severity === "Critical").length,
  highCount: vulnerabilities.filter((v) => v.severity === "High").length,
  mediumCount: vulnerabilities.filter((v) => v.severity === "Medium").length,
  lowCount: vulnerabilities.filter((v) => v.severity === "Low").length,
  totalEvidenceFiles,
  totalDataSourceRows: dataSourceFiles.reduce((s, f) => s + f.rows, 0),
};

// ═══════════════════════════════════════════════════════════════════
// CHART DATA — dynamically computed from parsed data
// ═══════════════════════════════════════════════════════════════════

export const severityDistribution = [
  { name: "Critical", value: dashboardStats.criticalCount, fill: "hsl(0, 72%, 51%)" },
  { name: "High", value: dashboardStats.highCount, fill: "hsl(38, 92%, 50%)" },
  { name: "Medium", value: dashboardStats.mediumCount, fill: "hsl(190, 90%, 50%)" },
  { name: "Low", value: dashboardStats.lowCount, fill: "hsl(152, 69%, 41%)" },
];

export const categoryBreakdown = (() => {
  const cats: Record<string, { critical: number; high: number; medium: number; low: number }> = {};
  for (const v of vulnerabilities) {
    if (!cats[v.category]) cats[v.category] = { critical: 0, high: 0, medium: 0, low: 0 };
    const sev = v.severity.toLowerCase() as "critical" | "high" | "medium" | "low";
    if (sev in cats[v.category]) cats[v.category][sev]++;
  }
  return Object.entries(cats).map(([category, counts]) => ({ category, ...counts }));
})();

export const osDistribution = (() => {
  const osCounts: Record<string, number> = {};
  for (const h of hosts) {
    const label = h.os.startsWith("Windows") ? h.os : h.os === "Unknown" ? "Unknown" : h.os;
    osCounts[label] = (osCounts[label] || 0) + 1;
  }
  const colors = [
    "hsl(217, 91%, 60%)",
    "hsl(190, 90%, 50%)",
    "hsl(38, 92%, 50%)",
    "hsl(0, 72%, 51%)",
    "hsl(152, 69%, 41%)",
    "hsl(262, 83%, 58%)",
    "hsl(330, 81%, 60%)",
    "hsl(45, 93%, 47%)",
    "hsl(174, 72%, 56%)",
    "hsl(24, 95%, 53%)",
  ];
  return Object.entries(osCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], i) => ({ name, value, fill: colors[i % colors.length] }));
})();

export const serviceDistribution = (() => {
  const svcCounts: Record<string, number> = {};
  for (const s of openServices) {
    const label = s.service.includes("http")
      ? s.port === 443 || s.service.includes("https")
        ? "HTTPS"
        : "HTTP"
      : s.service.toUpperCase();
    svcCounts[label] = (svcCounts[label] || 0) + 1;
  }
  return Object.entries(svcCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([service, count]) => ({ service, count }));
})();

export const hostRiskScores = (() => {
  const scores: Record<
    string,
    { host: string; critical: number; high: number; medium: number; low: number; total: number }
  > = {};
  for (const v of vulnerabilities) {
    const hostList = v.host.includes(",") ? v.host.split(",").map((h) => h.trim()) : [v.host];
    for (const h of hostList) {
      if (h.startsWith("Multiple")) continue;
      if (!scores[h]) scores[h] = { host: h, critical: 0, high: 0, medium: 0, low: 0, total: 0 };
      const sev = v.severity.toLowerCase() as "critical" | "high" | "medium" | "low";
      if (sev in scores[h]) scores[h][sev]++;
      scores[h].total +=
        v.severity === "Critical" ? 10 : v.severity === "High" ? 7 : v.severity === "Medium" ? 4 : 1;
    }
  }
  return Object.values(scores).sort((a, b) => b.total - a.total);
})();

// ═══════════════════════════════════════════════════════════════════
// SCAN ACTIVITY HEATMAP — derived from real timestamps in notes CSVs
// ═══════════════════════════════════════════════════════════════════

export const scanActivityHeatmap = (() => {
  const hourMap: Record<string, Record<string, number>> = {};
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  // Initialize hours 06-22
  for (let h = 6; h <= 22; h++) {
    const hk = String(h).padStart(2, "0");
    hourMap[hk] = { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
  }

  // Parse timestamps from notes CSVs
  const allNotes = (azureNotesCsv + "\n" + onPremNotesCsv).split("\n");
  for (const line of allNotes) {
    const tsMatch = line.match(/"(\d{4}-\d{2}-\d{2}\s+(\d{2}):\d{2}:\d{2}\s+UTC)"/);
    if (!tsMatch) continue;
    const date = new Date(tsMatch[1].replace(" UTC", "Z"));
    if (isNaN(date.getTime())) continue;

    // Adjust to IDT (UTC+3) for local scan time
    const localHour = (date.getUTCHours() + 3) % 24;
    const hourKey = String(localHour).padStart(2, "0");
    const dayKey = dayNames[date.getUTCDay()];

    if (hourMap[hourKey] && dayKey) {
      hourMap[hourKey][dayKey]++;
    }
  }

  return Object.entries(hourMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hour, days]) => ({ hour, ...days }));
})();

// ═══════════════════════════════════════════════════════════════════
// WHITENING EXAMPLES — extracted from actual data patterns
// ═══════════════════════════════════════════════════════════════════

export const whiteningExamples = (() => {
  const examples: { field: string; original: string; whitened: string }[] = [];

  // IP from hosts CSV
  const svr = hosts.find((h) => h.purpose === "server" && h.environment === "azure");
  if (svr) examples.push({ field: "IP Address", original: svr.address, whitened: "HOST_AZ_SVR_01" });

  // Domain from notes (cert data)
  if (onPremNotesCsv.includes("org-domain3.com")) {
    examples.push({ field: "Hostname / FQDN", original: "*.org-domain3.com", whitened: "DOMAIN_CLIENT_03" });
  }

  // Organization name from nikto cert
  if (niktoScanRaw.includes("GoDaddy.com")) {
    examples.push({ field: "Organization Name", original: "GoDaddy.com, Inc.", whitened: "CERT_ISSUER_01" });
  }

  // FortiOS cert CN
  if (onPremNotesCsv.includes("FG200ETK18907182")) {
    examples.push({
      field: "SSL Certificate CN",
      original: "FG200ETK18907182",
      whitened: "FIREWALL_CERT_01",
    });
  }

  // Internal IP from vuln scan
  const ipLeak = vuln_10_80_10_152_http.match(/Internal IP Leaked:\s*([\d.]+)/);
  if (ipLeak) {
    examples.push({ field: "Internal IP Leak", original: ipLeak[1], whitened: "INTERNAL_BACKEND_01" });
  }

    return examples;
})();

// ═══════════════════════════════════════════════════════════════════
// AI MODELS — dynamic description from parsed data counts
// ═══════════════════════════════════════════════════════════════════

// aiModels removed — use useBackend().modelsData and pipelineStatus instead

// aiAnalysisOutput removed — use useBackend().analysisData.technical_analysis instead

// ═══════════════════════════════════════════════════════════════════
// VALIDATION — checks derived from parsed data integrity
// ═══════════════════════════════════════════════════════════════════

// validationChecklist removed — use useBackend().validationData.checklist instead

// ═══════════════════════════════════════════════════════════════════
// REPORTS
// ═══════════════════════════════════════════════════════════════════

// reports removed — use useBackend().reportsList instead

// ═══════════════════════════════════════════════════════════════════
// ALERTS — dynamically generated from parsed critical/high vulns
// ═══════════════════════════════════════════════════════════════════

export const alerts = (() => {
  const alertList: {
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    time: string;
  }[] = [];

  for (const v of vulnerabilities.filter(
    (v) => v.severity === "Critical" || v.severity === "High"
  )) {
    alertList.push({
      title: `${v.severity}: ${v.name}`,
      description: `${v.host}${v.port ? ` (port ${v.port})` : ""} — ${v.description.slice(0, 200)}${
        v.description.length > 200 ? "..." : ""
      }`,
      severity: v.severity.toLowerCase() as "critical" | "high",
      time: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
  }

  return alertList.slice(0, 10);
})();

// ═══════════════════════════════════════════════════════════════════
// RECOMMENDATIONS — dynamically prioritized from vulnerabilities
// ═══════════════════════════════════════════════════════════════════

export const recommendations = (() => {
  const recs: {
    title: string;
    description: string;
    priority: "Immediate" | "Short-term" | "Medium-term";
  }[] = [];

  const critVulns = vulnerabilities.filter((v) => v.severity === "Critical");
  const highVulns = vulnerabilities.filter((v) => v.severity === "High");
  const medVulns = vulnerabilities.filter((v) => v.severity === "Medium");

  for (const v of critVulns) {
    recs.push({
      title: `Remediate: ${v.name}`,
      description: v.remediation,
      priority: "Immediate",
    });
  }

  for (const v of highVulns) {
    recs.push({
      title: v.name,
      description: v.remediation,
      priority: "Short-term",
    });
  }

  for (const v of medVulns.slice(0, 3)) {
    recs.push({
      title: v.name,
      description: v.remediation,
      priority: "Medium-term",
    });
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return recs.filter((r) => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });
})();
