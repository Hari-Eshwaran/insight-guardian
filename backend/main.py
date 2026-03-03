"""ReportX Backend – FastAPI application entry point."""

from __future__ import annotations

import logging

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import setup_logging
from app.llm.ollama_client import ping_ollama
from app.models.schemas import ErrorDetail, HealthResponse, ReportResponse
from app.service.report_service import generate_report_from_zip

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
setup_logging()
log = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="ReportX Backend",
    version="1.0.0",
    description=(
        "Fully offline AI-powered audit report generator. "
        "Ingests scan ZIP files, filters High/Critical vulnerabilities, "
        "whitens sensitive data, runs local LLM analysis via Ollama, "
        "and exports Markdown reports."
    ),
    contact={"name": "ReportX Team"},
    license_info={"name": "MIT"},
    openapi_tags=[
        {
            "name": "Health",
            "description": "Service health checks",
        },
        {
            "name": "Reports",
            "description": "Generate audit reports from scan ZIP files",
        },
    ],
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Allow local frontends (e.g. React dev server) to reach the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup event
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def _startup() -> None:
    log.info("ReportX Backend starting…")
    if ping_ollama():
        log.info("Ollama is reachable at http://localhost:11434")
    else:
        log.warning(
            "Ollama is NOT reachable – report generation will fail until it is started"
        )


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get(
    "/health",
    response_model=HealthResponse,
    tags=["Health"],
    summary="Health check",
    description="Returns service health status, offline confirmation, and Ollama reachability.",
)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        offline=True,
        ollama_reachable=ping_ollama(),
    )


@app.post(
    "/reports/generate",
    response_model=ReportResponse,
    tags=["Reports"],
    summary="Generate audit report",
    description=(
        "Upload a ZIP file containing XML/JSON/CSV scan outputs and an optional "
        "organization context (e.g. 'banking', 'healthcare'). The service "
        "filters High/Critical vulnerabilities, whitens sensitive data, "
        "runs local LLM analysis, and returns a Markdown report."
    ),
    responses={
        200: {"description": "Report generated successfully"},
        400: {"description": "Invalid input (non-ZIP file)", "model": ErrorDetail},
        500: {"description": "Internal error during report generation", "model": ErrorDetail},
    },
)
async def generate_report(
    scan_zip: UploadFile = File(..., description="ZIP containing XML/JSON/CSV scan files"),
    organization_context: str = Form("general", description="Organization context, e.g. 'banking', 'healthcare'"),
) -> ReportResponse:
    if not scan_zip.filename or not scan_zip.filename.lower().endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only ZIP uploads are supported")

    try:
        zip_bytes = await scan_zip.read()
        output_path, markdown, count = generate_report_from_zip(
            zip_bytes, organization_context
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        log.exception("Report generation failed")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate report: {exc}"
        ) from exc

    return ReportResponse(
        output_markdown_path=output_path,
        markdown=markdown,
        vulnerability_count=count,
    )
