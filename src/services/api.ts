/**
 * API service layer – talks to the FastAPI backend via the Vite dev proxy.
 *
 * In development: requests to `/api/*` are proxied to `http://localhost:8000/*`
 * In production : the backend serves the built frontend from the same origin.
 */

// ─── Response types (mirrors backend Pydantic models) ──────────────

export interface HealthResponse {
  status: string;
  offline: boolean;
  ollama_reachable: boolean;
}

export interface ReportResponse {
  output_markdown_path: string;
  markdown: string;
  vulnerability_count: number;
}

export interface ErrorDetail {
  detail: string;
}

// ─── Pipeline types ────────────────────────────────────────────────

export interface PipelineStepStatus {
  name: string;
  status: "pending" | "processing" | "completed" | "failed";
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  detail: string;
}

export interface PipelineStatusResponse {
  steps: PipelineStepStatus[];
  overall_progress: number;
  current_step: string;
  organization_context: string;
  started_at: string;
  finding_count: number;
  raw_finding_count: number;
  file_count: number;
}

export interface PipelineIngestionResponse {
  file_count: number;
  zip_size_bytes: number;
  raw_finding_count: number;
  filtered_finding_count: number;
  findings: Record<string, unknown>[];
}

export interface SanitizationRule {
  id: string;
  label: string;
  pattern: string;
  replacement: string;
  category: string;
  count: number;
}

export interface WhiteningExample {
  field: string;
  original: string;
  whitened: string;
}

export interface PipelineWhiteningResponse {
  examples: WhiteningExample[];
  sanitization_rules: SanitizationRule[];
  whitened_count: number;
}

export interface TimelineEvent {
  time: string;
  event: string;
  detail: string;
  status: "done" | "active" | "pending";
}

export interface ModelUsage {
  model: string;
  task: string;
  input_tokens: number;
  output_tokens: number;
  duration_seconds: number;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface PipelineAnalysisResponse {
  executive_summary: string;
  technical_analysis: string;
  detailed_findings: string;
  timeline: TimelineEvent[];
  model_usage: ModelUsage[];
}

export interface ValidationCheckItem {
  label: string;
  passed: boolean;
}

export interface PipelineValidationResponse {
  checklist: ValidationCheckItem[];
  finding_count: number;
}

export interface GeneratedReportInfo {
  name: string;
  date: string;
  status: string;
  vulnerability_count: number;
  output_path: string;
  duration_seconds: number;
}

export interface ModelInfo {
  name: string;
  model_tag: string;
  purpose: string;
  parameters: string;
  context_window: string;
  quantization: string;
}

export interface ModelsResponse {
  ollama_reachable: boolean;
  ollama_url: string;
  models: ModelInfo[];
}

// ─── Base helpers ──────────────────────────────────────────────────

const API_BASE = "/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((body as ErrorDetail).detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Health ────────────────────────────────────────────────────────

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  return handleResponse<HealthResponse>(res);
}

// ─── Report generation ────────────────────────────────────────────

export async function generateReport(
  scanZip: File,
  organizationContext: string = "general",
): Promise<ReportResponse> {
  const form = new FormData();
  form.append("scan_zip", scanZip);
  form.append("organization_context", organizationContext);

  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: "POST",
    body: form,
  });
  return handleResponse<ReportResponse>(res);
}

// ─── Pipeline status ──────────────────────────────────────────────

export async function fetchPipelineStatus(): Promise<PipelineStatusResponse> {
  const res = await fetch(`${API_BASE}/pipeline/status`);
  return handleResponse<PipelineStatusResponse>(res);
}

export async function fetchPipelineIngestion(): Promise<PipelineIngestionResponse> {
  const res = await fetch(`${API_BASE}/pipeline/ingestion`);
  return handleResponse<PipelineIngestionResponse>(res);
}

export async function fetchPipelineWhitening(): Promise<PipelineWhiteningResponse> {
  const res = await fetch(`${API_BASE}/pipeline/whitening`);
  return handleResponse<PipelineWhiteningResponse>(res);
}

export async function fetchPipelineAnalysis(): Promise<PipelineAnalysisResponse> {
  const res = await fetch(`${API_BASE}/pipeline/analysis`);
  return handleResponse<PipelineAnalysisResponse>(res);
}

export async function fetchPipelineValidation(): Promise<PipelineValidationResponse> {
  const res = await fetch(`${API_BASE}/pipeline/validation`);
  return handleResponse<PipelineValidationResponse>(res);
}

// ─── Reports listing ──────────────────────────────────────────────

export async function fetchReports(): Promise<GeneratedReportInfo[]> {
  const res = await fetch(`${API_BASE}/reports`);
  return handleResponse<GeneratedReportInfo[]>(res);
}

// ─── Models ───────────────────────────────────────────────────────

export async function fetchModels(): Promise<ModelsResponse> {
  const res = await fetch(`${API_BASE}/models`);
  return handleResponse<ModelsResponse>(res);
}
