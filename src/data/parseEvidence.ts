/**
 * Evidence file parsers — extract vulnerability findings from raw scan output.
 * Parses Nmap vuln scans, FTP banners, security header audits, Nikto output,
 * and derives vulnerabilities from host OS / exposed services.
 */

import type { Severity } from "./auditData";

export interface ParsedVulnerability {
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

// ─── Nmap Vulnerability Scan Parser ────────────────────────────────

export function parseNmapVulnScan(
  raw: string,
  host: string,
  port: number,
  evidencePath: string
): ParsedVulnerability[] {
  const vulns: ParsedVulnerability[] = [];
  const text = raw.replace(/\[.\] Nmap: /g, ""); // strip MSF console prefixes

  // SQL Injection
  if (/http-sql-injection[\s\S]*?Possible sqli/i.test(text)) {
    const endpoints = [...text.matchAll(/http:\/\/[^\s]+\.(axd|aspx)[^\s]*/g)].map((m) => m[0]);
    vulns.push({
      id: "",
      name: "SQL Injection via HTTP Parameters",
      severity: "Critical",
      host,
      port,
      service: "http",
      category: "Input Validation",
      description: `Nmap http-sql-injection script identified injectable parameters${
        endpoints.length > 0
          ? ` in ${[...new Set(endpoints.map((e) => e.split("/").pop()?.split("?")[0] || ""))].join(" and ")} endpoints`
          : ""
      }. The application does not sanitize user input before constructing SQL queries.`,
      evidence: evidencePath,
      remediation:
        "Implement parameterized queries across all endpoints. Deploy WAF rules to block SQL injection payloads as interim mitigation.",
      cve: "CWE-89",
    });
  }

  // JBoss JMX Console (CVE-2010-0738)
  if (/http-vuln-cve2010-0738[\s\S]*?Authentication was not required/i.test(text)) {
    vulns.push({
      id: "",
      name: "JBoss JMX Console Unauthenticated Access",
      severity: "Critical",
      host,
      port,
      service: "http",
      category: "Authentication",
      description:
        "CVE-2010-0738 — JBoss Application Server JMX Console is accessible without authentication, allowing remote attackers to deploy arbitrary web applications or execute system commands.",
      evidence: evidencePath,
      remediation:
        "Restrict JMX Console access via authentication and IP whitelisting. Upgrade JBoss to a patched version or remove the management console from production.",
      cve: "CVE-2010-0738",
    });
  }

  // CSRF Vulnerabilities
  const csrfMatches = [...text.matchAll(/Found the following possible CSRF vulnerabilities:[\s\S]*?(?=\| [a-z]|\nNmap done)/gi)];
  if (csrfMatches.length > 0) {
    const formPaths = [...text.matchAll(/Path:\s+http:\/\/[^\s]+/g)].length;
    vulns.push({
      id: "",
      name: "CSRF Vulnerabilities — Missing Anti-Forgery Tokens",
      severity: "High",
      host,
      port,
      service: "http",
      category: "Input Validation",
      description: `Multiple forms on the application lack anti-CSRF tokens. Nmap identified ${formPaths > 0 ? formPaths + "+" : "multiple"} forms without proper cross-site request forgery protections.`,
      evidence: evidencePath,
      remediation:
        "Implement anti-forgery tokens on all state-changing forms. Enable SameSite cookie attribute.",
    });
  }

  // Internal IP Disclosure
  const ipLeakMatch = text.match(/http-internal-ip-disclosure[\s\S]*?Internal IP Leaked:\s*([\d.]+)/i);
  if (ipLeakMatch) {
    vulns.push({
      id: "",
      name: "Internal IP Address Disclosure",
      severity: "High",
      host,
      port,
      service: "http",
      category: "Information Disclosure",
      description: `Web server leaks internal IP address ${ipLeakMatch[1]} via http-internal-ip-disclosure. This reveals internal network topology to attackers.`,
      evidence: evidencePath,
      remediation:
        "Configure the web server to suppress internal IP addresses in response headers. Review reverse proxy and load balancer configuration.",
    });
  }

  return vulns;
}

// ─── FTP Banner Parser ─────────────────────────────────────────────

export function parseFtpBanner(
  raw: string,
  host: string,
  evidencePath: string
): ParsedVulnerability[] {
  const vulns: ParsedVulnerability[] = [];

  const versionMatch = raw.match(/FileZilla Server\s+([\d.]+\s*\w*)/i);
  if (versionMatch) {
    const version = versionMatch[1].trim();
    const isBeta = /beta/i.test(version);
    const isOutdated = /^0\.\d/i.test(version); // Major version 0.x

    if (isOutdated || isBeta) {
      vulns.push({
        id: "",
        name: `Outdated FTP Server — FileZilla ${version}`,
        severity: "Critical",
        host,
        port: 21,
        service: "ftp",
        category: "Patch Management",
        description: `FileZilla Server ${version} is severely outdated and contains multiple known vulnerabilities.${
          isBeta ? " The beta designation indicates untested software in production." : ""
        }`,
        evidence: evidencePath,
        remediation:
          "Upgrade to FileZilla Server 1.x (latest stable) or replace with a supported SFTP service. Disable FTP and enforce SFTP/SCP only.",
        cve: "CWE-1104",
      });
    }
  }

  return vulns;
}

// ─── Nikto Scan Parser ─────────────────────────────────────────────

export function parseNiktoScan(raw: string): ParsedVulnerability[] {
  const vulns: ParsedVulnerability[] = [];
  const sections = raw.split(/===== (?:https?:\/\/)/);
  const aspnetHosts = new Set<string>();
  const traceHosts = new Set<string>();

  for (const section of sections) {
    const hostMatch = section.match(/^([\d.]+):(\d+)/);
    if (!hostMatch) continue;
    const host = hostMatch[1];

    // ASP.NET Version Disclosure
    if (/x-aspnet-version/i.test(section)) {
      aspnetHosts.add(host);
    }

    // TRACE method enabled
    if (/Allowed HTTP Methods:.*TRACE/i.test(section) || /Public HTTP Methods:.*TRACE/i.test(section)) {
      traceHosts.add(host);
    }
  }

  // Emit ASP.NET version disclosure
  if (aspnetHosts.size > 0) {
    const hostsList = [...aspnetHosts];
    vulns.push({
      id: "",
      name: "ASP.NET Version Disclosure",
      severity: "High",
      host: hostsList.length > 1 ? hostsList[0] : hostsList[0],
      port: 80,
      service: "http",
      category: "Information Disclosure",
      description: `X-AspNet-Version header reveals ASP.NET version on ${hostsList.length} host(s). Combined with server header disclosing Microsoft-IIS, attackers can target known framework vulnerabilities.`,
      evidence: "web_enum/nikto_scan.txt",
      remediation:
        "Remove X-AspNet-Version and X-Powered-By headers. Configure web.config to suppress version information.",
    });
  }

  // Emit TRACE method finding
  if (traceHosts.size > 0) {
    const hostsList = [...traceHosts];
    vulns.push({
      id: "",
      name: "HTTP TRACE Method Enabled",
      severity: "High",
      host: hostsList[0],
      port: 80,
      service: "http",
      category: "Configuration",
      description: `HTTP TRACE method is enabled on ${hostsList.length} web server(s), which can be exploited for Cross-Site Tracing (XST) attacks to steal credentials from HTTP headers.`,
      evidence: "web_enum/nikto_scan.txt",
      remediation:
        "Disable HTTP TRACE method in IIS configuration. Only allow GET, POST, and HEAD methods.",
    });
  }

  return vulns;
}

// ─── Security Headers Parser ───────────────────────────────────────

export function parseSecurityHeaders(raw: string): ParsedVulnerability[] {
  const vulns: ParsedVulnerability[] = [];
  const sections = raw.split(/===== /);

  // Track which headers are missing across which hosts
  const headersMissing: Record<string, Set<string>> = {
    "X-Frame-Options": new Set(),
    "X-Content-Type-Options": new Set(),
    "X-XSS-Protection": new Set(),
    "Strict-Transport-Security": new Set(),
    "Content-Security-Policy": new Set(),
  };

  for (const section of sections) {
    const hostMatch = section.match(/https?:\/\/([\d.]+):(\d+)/);
    if (!hostMatch) continue;
    const host = hostMatch[1];

    for (const header of Object.keys(headersMissing)) {
      const regex = new RegExp(`${header}:.*Not found`, "i");
      if (regex.test(section)) {
        headersMissing[header].add(host);
      }
    }
  }

  // Group: missing security headers
  const headerVulns: {
    name: string;
    header: string;
    severity: Severity;
    port: number;
    service: string;
    description: string;
    remediation: string;
  }[] = [
    {
      name: "Missing X-Frame-Options Header",
      header: "X-Frame-Options",
      severity: "Medium",
      port: 80,
      service: "http/https",
      description:
        "X-Frame-Options header is absent on tested web servers, making them vulnerable to clickjacking attacks.",
      remediation: "Set X-Frame-Options: DENY or SAMEORIGIN on all web server responses.",
    },
    {
      name: "Missing X-Content-Type-Options Header",
      header: "X-Content-Type-Options",
      severity: "Medium",
      port: 80,
      service: "http/https",
      description:
        "X-Content-Type-Options header is not set, allowing MIME-type sniffing which could lead to XSS via content-type confusion.",
      remediation: "Set X-Content-Type-Options: nosniff on all responses.",
    },
    {
      name: "Missing Strict-Transport-Security Header",
      header: "Strict-Transport-Security",
      severity: "Medium",
      port: 443,
      service: "https",
      description:
        "HSTS header is not defined on HTTPS endpoints, leaving users vulnerable to SSL-stripping downgrade attacks.",
      remediation:
        "Enable Strict-Transport-Security with max-age of at least 31536000 (1 year). Include includeSubDomains directive.",
    },
    {
      name: "Missing Content-Security-Policy Header",
      header: "Content-Security-Policy",
      severity: "Medium",
      port: 80,
      service: "http/https",
      description:
        "No Content-Security-Policy header is set, providing no protection against XSS, data injection, or clickjacking attacks.",
      remediation: "Implement a restrictive CSP policy. Start with report-only mode and iterate.",
    },
    {
      name: "Missing X-XSS-Protection Header",
      header: "X-XSS-Protection",
      severity: "Medium",
      port: 80,
      service: "http/https",
      description:
        "X-XSS-Protection header is absent. While modern browsers rely on CSP, legacy browser users remain unprotected.",
      remediation: "Set X-XSS-Protection: 1; mode=block as defense-in-depth.",
    },
  ];

  for (const hv of headerVulns) {
    const affectedHosts = headersMissing[hv.header];
    if (affectedHosts && affectedHosts.size > 0) {
      vulns.push({
        id: "",
        name: hv.name,
        severity: hv.severity,
        host: `Multiple (${affectedHosts.size} hosts)`,
        port: hv.port,
        service: hv.service,
        category: "Security Headers",
        description: hv.description,
        evidence: "web_enum/security_headers.txt",
        remediation: hv.remediation,
      });
    }
  }

  return vulns;
}

// ─── Host OS EOL Vulnerabilities ───────────────────────────────────

interface HostInfo {
  address: string;
  os: string;
  osVersion: string;
  environment: string;
}

export function deriveOsVulnerabilities(
  hosts: HostInfo[]
): ParsedVulnerability[] {
  const vulns: ParsedVulnerability[] = [];

  // Windows Server 2008 — EOL Jan 2020
  const win2008 = hosts.filter((h) => h.os === "Windows 2008");
  if (win2008.length > 0) {
    vulns.push({
      id: "",
      name: "Windows Server 2008 End-of-Life Systems",
      severity: "High",
      host: win2008.map((h) => h.address).join(", "),
      port: 0,
      service: "os",
      category: "Patch Management",
      description: `${win2008.length} host(s) running Windows Server 2008 which reached end-of-life in January 2020. No security patches are available.`,
      evidence: "azure_hosts.csv, on-prem_hosts.csv",
      remediation:
        "Migrate to a supported OS version (Windows Server 2019/2022). If migration is not immediately possible, isolate these hosts in a restricted network segment.",
    });
  }

  // Windows Server 2012 — EOL Oct 2023
  const win2012 = hosts.filter((h) => h.os === "Windows 2012");
  if (win2012.length > 0) {
    vulns.push({
      id: "",
      name: "Windows Server 2012 End-of-Extended-Support",
      severity: "Medium",
      host: win2012.map((h) => h.address).join(", "),
      port: 0,
      service: "os",
      category: "Patch Management",
      description: `${win2012.length} host(s) running Windows Server 2012 which reached end of extended support in October 2023.`,
      evidence: "azure_hosts.csv",
      remediation:
        "Plan migration to Windows Server 2022. Apply Extended Security Updates (ESU) as interim measure.",
    });
  }

  return vulns;
}

// ─── Exposed Service Vulnerabilities (from services data) ──────────

interface ServiceInfo {
  host: string;
  port: number;
  service: string;
}

export function deriveServiceVulnerabilities(
  services: ServiceInfo[]
): ParsedVulnerability[] {
  const vulns: ParsedVulnerability[] = [];

  // IBM DB2 exposed
  const db2 = services.filter(
    (s) => s.service.includes("db2") || (s.port === 50000 && s.service !== "http")
  );
  for (const svc of db2) {
    vulns.push({
      id: "",
      name: "IBM DB2 Exposed on Network",
      severity: "High",
      host: svc.host,
      port: svc.port,
      service: "ibm-db2",
      category: "Network Exposure",
      description:
        "IBM DB2 database service is directly accessible on port 50000 from the scanned network segment. Database services should not be exposed to unauthenticated network access.",
      evidence: "port_scan/tcp_full_scan.txt",
      remediation:
        "Restrict DB2 access via firewall rules to only authorized application servers. Enable DB2 authentication and encryption.",
    });
  }

  // Elasticsearch exposed
  const elastic = services.filter(
    (s) => s.service.includes("elasticsearch") || s.port === 9200
  );
  if (elastic.length > 0) {
    const host = elastic[0].host;
    vulns.push({
      id: "",
      name: "Elasticsearch Exposed Without Authentication",
      severity: "High",
      host,
      port: 9200,
      service: "elasticsearch",
      category: "Network Exposure",
      description:
        "Elasticsearch HTTP API (9200) and transport (9300) ports are open on the network. Unauthenticated Elasticsearch can expose all indexed data.",
      evidence: "port_scan/tcp_full_scan.txt",
      remediation:
        "Enable Elasticsearch security features (X-Pack). Restrict access via firewall. Disable remote access if not required.",
    });
  }

  // SNMP exposed
  const snmp = services.filter((s) => s.service === "snmp" && s.port === 161);
  for (const svc of snmp) {
    vulns.push({
      id: "",
      name: "SNMP Service Exposed",
      severity: "Medium",
      host: svc.host,
      port: 161,
      service: "snmp",
      category: "Network Exposure",
      description:
        "SNMP service on UDP port 161 is accessible from the network. SNMP v1/v2c uses community strings transmitted in cleartext.",
      evidence: `targeted_scans/snmp_${svc.host}_161.txt`,
      remediation:
        "Migrate to SNMPv3 with authentication and encryption. Restrict SNMP access via ACLs.",
    });
  }

  // FTP on non-standard port
  const ftpNonStd = services.filter(
    (s) => s.service.includes("ftp") && s.port !== 21
  );
  for (const svc of ftpNonStd) {
    vulns.push({
      id: "",
      name: "FTP Service on Non-Standard Port",
      severity: "Medium",
      host: svc.host,
      port: svc.port,
      service: "ftp",
      category: "Authentication",
      description:
        "FTP service running on non-standard port. FTP transmits credentials in cleartext.",
      evidence: `targeted_scans/ftp_${svc.host}_anonymous.txt`,
      remediation: "Replace FTP with SFTP/SCP. Disable cleartext FTP protocol entirely.",
    });
  }

  return vulns;
}

// ─── Assign sequential IDs ─────────────────────────────────────────

export function assignVulnIds(vulns: ParsedVulnerability[]): ParsedVulnerability[] {
  return vulns.map((v, i) => ({
    ...v,
    id: `VULN-${String(i + 1).padStart(3, "0")}`,
  }));
}
