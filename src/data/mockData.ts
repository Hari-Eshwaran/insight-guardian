export const dashboardStats = {
  totalFiles: 47,
  highRisks: 23,
  criticalRisks: 8,
  reportsGenerated: 5,
};

export const workflowSteps = [
  { name: "Ingestion", status: "completed" as const },
  { name: "Parsing", status: "completed" as const },
  { name: "Whitening", status: "completed" as const },
  { name: "Local AI Analysis", status: "processing" as const },
  { name: "Report", status: "pending" as const },
];

export const uploadedFiles = [
  { name: "nessus_scan_q4.xml", type: "XML", status: "Parsed", size: "12.4 MB" },
  { name: "qualys_report.xml", type: "XML", status: "Parsed", size: "8.7 MB" },
  { name: "burp_findings.json", type: "JSON", status: "Parsed", size: "3.2 MB" },
  { name: "openvas_results.xml", type: "XML", status: "Pending", size: "15.1 MB" },
  { name: "zap_scan_output.json", type: "JSON", status: "Parsed", size: "5.6 MB" },
  { name: "rapid7_export.xml", type: "XML", status: "Pending", size: "22.3 MB" },
];

export const vulnerabilities = [
  { name: "SQL Injection in Login Form", severity: "Critical", source: "burp_findings.json", cve: "CVE-2024-1234" },
  { name: "Cross-Site Scripting (Stored)", severity: "High", source: "zap_scan_output.json", cve: "CVE-2024-2345" },
  { name: "Remote Code Execution via Deserialization", severity: "Critical", source: "nessus_scan_q4.xml", cve: "CVE-2024-3456" },
  { name: "Privilege Escalation - Admin Panel", severity: "Critical", source: "qualys_report.xml", cve: "CVE-2024-4567" },
  { name: "Insecure Direct Object Reference", severity: "High", source: "burp_findings.json", cve: "CVE-2024-5678" },
  { name: "Server-Side Request Forgery", severity: "High", source: "nessus_scan_q4.xml", cve: "CVE-2024-6789" },
  { name: "XML External Entity Injection", severity: "Critical", source: "qualys_report.xml", cve: "CVE-2024-7890" },
  { name: "Broken Authentication Flow", severity: "High", source: "zap_scan_output.json", cve: "CVE-2024-8901" },
];

export const whiteningExamples = [
  { field: "IP Address", original: "192.168.1.105", whitened: "INTERNAL_SERVER_01" },
  { field: "Hostname", original: "prod-db-master.acmecorp.com", whitened: "DATABASE_HOST_PRIMARY" },
  { field: "Client Name", original: "Acme Corporation", whitened: "CLIENT_ORG" },
  { field: "Username", original: "admin@acmecorp.com", whitened: "USER_ADMIN_01" },
  { field: "API Endpoint", original: "https://api.acmecorp.com/v2/users", whitened: "API_ENDPOINT_USERS" },
];

export const aiModels = [
  {
    name: "LLaMA 3",
    purpose: "Technical Risk Analysis",
    status: "Processing" as const,
    progress: 72,
    description: "Analyzes vulnerability data for technical risk scoring, exploit likelihood, and attack vector mapping.",
  },
  {
    name: "Gemma 2",
    purpose: "Business & Executive Summary",
    status: "Loaded" as const,
    progress: 100,
    description: "Generates executive-level summaries with business impact analysis and remediation priorities.",
  },
];

export const mockAIOutput = `## Technical Risk Analysis

**Critical Finding: SQL Injection in Authentication Module**

The SQL injection vulnerability identified in the login form (CVE-2024-1234) presents an immediate risk of unauthorized data access. Based on parsed evidence from burp_findings.json:

- **Attack Vector**: Network-accessible, no authentication required
- **Exploit Complexity**: Low — automated tools available
- **Impact**: Complete database compromise, potential data exfiltration
- **CVSS Score**: 9.8 (Critical)

**Recommendation**: Implement parameterized queries and input validation immediately. Consider WAF rules as interim mitigation.`;

export const validationChecklist = [
  { label: "Evidence Matched to Source Files", passed: true },
  { label: "Severity Ratings Verified Against CVSS", passed: true },
  { label: "Hallucination Check Completed", passed: true },
  { label: "No External Data References Found", passed: true },
  { label: "Remediation Steps Validated", passed: true },
  { label: "Executive Summary Accuracy Check", passed: false },
];

export const reports = [
  { name: "Q4 Security Audit - Full Report", date: "2024-12-15", status: "Completed" },
  { name: "Critical Vulnerabilities Summary", date: "2024-12-15", status: "Completed" },
  { name: "Executive Risk Briefing", date: "2024-12-14", status: "Completed" },
  { name: "Technical Remediation Guide", date: "2024-12-14", status: "In Progress" },
  { name: "Compliance Gap Analysis", date: "2024-12-13", status: "Completed" },
];

export const alerts = [
  {
    title: "Critical: Remote Code Execution Detected",
    description: "CVE-2024-3456 allows unauthenticated remote code execution via Java deserialization. Immediate patching required.",
    severity: "critical" as const,
    time: "2 hours ago",
  },
  {
    title: "Critical: SQL Injection in Production",
    description: "Authentication bypass via SQL injection found in primary login endpoint. Active exploitation possible.",
    severity: "critical" as const,
    time: "3 hours ago",
  },
  {
    title: "High: Privilege Escalation Path Identified",
    description: "Admin panel accessible through horizontal privilege escalation. Role-based access controls insufficient.",
    severity: "high" as const,
    time: "5 hours ago",
  },
  {
    title: "High: Unpatched Server Components",
    description: "Multiple server components running outdated versions with known vulnerabilities.",
    severity: "high" as const,
    time: "6 hours ago",
  },
];

export const recommendations = [
  {
    title: "Patch Java Deserialization Library",
    description: "Update Apache Commons Collections to version 4.4.2 or later to mitigate CVE-2024-3456.",
    priority: "Immediate",
  },
  {
    title: "Implement Parameterized Queries",
    description: "Replace all dynamic SQL queries with parameterized statements across authentication modules.",
    priority: "Immediate",
  },
  {
    title: "Deploy Web Application Firewall",
    description: "Configure WAF rules to block common SQL injection and XSS payloads as interim protection.",
    priority: "Short-term",
  },
  {
    title: "Enforce Role-Based Access Controls",
    description: "Implement strict RBAC with principle of least privilege across all admin interfaces.",
    priority: "Short-term",
  },
];

export const severityDistribution = [
  { name: "Critical", value: 8, fill: "hsl(0, 72%, 51%)" },
  { name: "High", value: 23, fill: "hsl(38, 92%, 50%)" },
  { name: "Medium", value: 34, fill: "hsl(190, 90%, 50%)" },
  { name: "Low", value: 15, fill: "hsl(152, 69%, 41%)" },
];

export const categoryBreakdown = [
  { category: "Auth", critical: 2, high: 5, medium: 8 },
  { category: "Input Val.", critical: 3, high: 8, medium: 12 },
  { category: "Access Ctrl", critical: 2, high: 6, medium: 7 },
  { category: "Config", critical: 1, high: 4, medium: 7 },
];

export const timelineData = [
  { date: "Dec 1", critical: 0, high: 2, medium: 5 },
  { date: "Dec 3", critical: 1, high: 4, medium: 8 },
  { date: "Dec 5", critical: 2, high: 7, medium: 12 },
  { date: "Dec 7", critical: 3, high: 10, medium: 18 },
  { date: "Dec 9", critical: 5, high: 15, medium: 24 },
  { date: "Dec 11", critical: 6, high: 19, medium: 29 },
  { date: "Dec 13", critical: 7, high: 21, medium: 32 },
  { date: "Dec 15", critical: 8, high: 23, medium: 34 },
];

export const heatmapData = [
  { hour: "00", mon: 0, tue: 1, wed: 0, thu: 2, fri: 0, sat: 0, sun: 0 },
  { hour: "04", mon: 0, tue: 0, wed: 1, thu: 0, fri: 1, sat: 0, sun: 0 },
  { hour: "08", mon: 3, tue: 2, wed: 4, thu: 3, fri: 5, sat: 1, sun: 0 },
  { hour: "12", mon: 5, tue: 4, wed: 6, thu: 7, fri: 4, sat: 2, sun: 1 },
  { hour: "16", mon: 4, tue: 6, wed: 3, thu: 5, fri: 3, sat: 1, sun: 0 },
  { hour: "20", mon: 2, tue: 1, wed: 2, thu: 1, fri: 2, sat: 0, sun: 0 },
];
