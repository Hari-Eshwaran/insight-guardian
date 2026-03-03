"""Orchestrates the full report-generation pipeline.

1. Extract findings from ZIP
2. Whiten sensitive data
3. Normalize & filter (High + Critical only, deduplicated)
4. Call Ollama for each LLM section
5. Build Markdown report
6. Persist outputs to disk
"""

from __future__ import annotations

import json
import logging
import time
from datetime import datetime

from app.analysis.normalizer import normalize_and_filter
from app.config import OUTPUT_DIR
from app.ingestion.zip_handler import extract_findings_from_zip
from app.llm.ollama_client import call_ollama
from app.llm.router import (
    TASK_DETAILED_FINDINGS,
    TASK_EXECUTIVE_SUMMARY,
    TASK_TECHNICAL_ANALYSIS,
    select_model,
)
from app.prompts.templates import (
    gemma_executive_prompt,
    llama_detailed_findings_prompt,
    llama_technical_analysis_prompt,
)
from app.report.markdown_builder import build_report_markdown
from app.whitening.sanitizer import whiten_data

log = logging.getLogger(__name__)


def generate_report_from_zip(
    zip_bytes: bytes,
    organization_context: str,
) -> tuple[str, str, int]:
    """Run the full pipeline and return ``(md_path, markdown, vuln_count)``."""
    t_start = time.perf_counter()

    # --- 1. Ingestion ---------------------------------------------------------
    log.info("[1/6] Extracting findings from ZIP (%d bytes)", len(zip_bytes))
    raw_findings = extract_findings_from_zip(zip_bytes)

    # --- 2. Whitening ---------------------------------------------------------
    log.info("[2/6] Whitening %d raw finding(s)", len(raw_findings))
    whitened = whiten_data(raw_findings)

    # --- 3. Normalize & filter ------------------------------------------------
    log.info("[3/6] Normalising & filtering (High + Critical only)")
    filtered = normalize_and_filter(whitened if isinstance(whitened, list) else [])
    log.info("Retained %d finding(s) after filtering", len(filtered))

    if not filtered:
        log.warning("No High/Critical findings found – generating empty report")

    # --- 4. LLM calls --------------------------------------------------------
    log.info("[4/6] Running LLM analysis via Ollama")

    executive_model = select_model(TASK_EXECUTIVE_SUMMARY)
    technical_model = select_model(TASK_TECHNICAL_ANALYSIS)
    details_model = select_model(TASK_DETAILED_FINDINGS)

    executive_summary = call_ollama(
        executive_model,
        gemma_executive_prompt(filtered, organization_context),
    )
    technical_analysis = call_ollama(
        technical_model,
        llama_technical_analysis_prompt(filtered, organization_context),
    )
    detailed_findings = call_ollama(
        details_model,
        llama_detailed_findings_prompt(filtered, organization_context),
    )

    # --- 5. Build Markdown ----------------------------------------------------
    log.info("[5/6] Building Markdown report")
    markdown = build_report_markdown(
        org_context=organization_context,
        vulnerabilities=filtered,
        executive_summary=executive_summary,
        technical_analysis=technical_analysis,
        detailed_findings=detailed_findings,
    )

    # --- 6. Persist -----------------------------------------------------------
    log.info("[6/6] Saving output files")
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    md_path = OUTPUT_DIR / f"reportx_{timestamp}.md"
    json_path = OUTPUT_DIR / f"reportx_{timestamp}_normalized.json"

    md_path.write_text(markdown, encoding="utf-8")
    json_path.write_text(
        json.dumps(
            {
                "organization_context": organization_context,
                "total_findings": len(filtered),
                "vulnerabilities": filtered,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    elapsed = time.perf_counter() - t_start
    log.info(
        "Pipeline complete in %.1fs – %d finding(s), output: %s",
        elapsed,
        len(filtered),
        md_path,
    )
    return str(md_path), markdown, len(filtered)
