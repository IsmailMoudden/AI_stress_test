#!/usr/bin/env python3
"""Local dependency-free demo server.

It serves the static frontend and exposes a small backend-only OpenRouter
research endpoint. The browser never receives the OpenRouter API key.
"""

from __future__ import annotations

import json
import mimetypes
import os
import pathlib
import socket
import sys
import asyncio
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[1]
FRONTEND_ROOT = ROOT / "apps" / "frontend"
ENV_PATH = ROOT / ".env"
BACKEND_SRC = ROOT / "apps" / "backend" / "src"
DEFAULT_DEMO_MODEL = "openrouter/auto"
LEGACY_DEMO_MODELS = {"openai/gpt-5.2:online"}

sys.path.insert(0, str(BACKEND_SRC))


def load_dotenv(path: pathlib.Path = ENV_PATH) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        if key and key not in os.environ:
            os.environ[key] = value


def openrouter_research(payload: dict[str, Any]) -> dict[str, Any]:
    from scenario_workbench.llm.config import build_llm_service

    os.environ.setdefault("LLM_PROVIDER", "openrouter")
    os.environ["LLM_MODEL"] = resolve_demo_model()
    os.environ.setdefault("LLM_WEB_SEARCH_ENABLED", "true")
    model = os.getenv("LLM_MODEL", DEFAULT_DEMO_MODEL)
    scenario = payload.get("scenario", "")
    severity = payload.get("severity", "Severe")
    horizon = payload.get("horizon", "1 month")

    service = build_llm_service()
    response = asyncio.run(
        service.complete(
            system_prompt=(
                "You are an institutional commodity market risk research assistant. "
                "Use web search context to complement a mock scenario demo with factual "
                "historical analogues. Do not invent portfolio valuation or PnL. "
                "Return strict JSON only."
            ),
            user_prompt=(
                "Research historical events relevant to this stress scenario.\n\n"
                f"Scenario: {scenario}\n"
                f"Severity: {severity}\n"
                f"Horizon: {horizon}\n\n"
                "Return JSON with keys: summary, historical_analogues, suggested_sources. "
                "historical_analogues must be an array of objects with keys: event, date_range, "
                "markets, reaction, lesson, confidence. suggested_sources must be an array "
                "of objects with keys: title, url, relevance."
            ),
            model=model,
            temperature=0.1,
        )
    )

    content = response.content
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        parsed = {"summary": content, "historical_analogues": [], "suggested_sources": []}

    return {
        "model": model,
        "usage": response.metadata.usage.model_dump(),
        "research": parsed,
    }


def openrouter_generate_scenario(payload: dict[str, Any]) -> dict[str, Any]:
    from scenario_workbench.llm.config import build_llm_service

    os.environ.setdefault("LLM_PROVIDER", "openrouter")
    os.environ["LLM_MODEL"] = resolve_demo_model()
    os.environ.setdefault("LLM_WEB_SEARCH_ENABLED", "true")
    model = os.getenv("LLM_MODEL", DEFAULT_DEMO_MODEL)
    scenario = payload.get("scenario", "")
    severity = payload.get("severity", "Severe")
    horizon = payload.get("horizon", "1 month")
    mode = payload.get("mode", "draft")
    question_answers = payload.get("question_answers", [])
    assumptions = payload.get("assumptions", [])
    answer_context = json.dumps(question_answers, indent=2)
    assumption_context = json.dumps(assumptions, indent=2)

    service = build_llm_service()
    response = asyncio.run(
        service.complete(
            system_prompt=(
                "You are Scenario Workbench, an institutional commodity market risk scenario "
                "engineering assistant. Generate scenario engineering content from the user's "
                "text and review answers. The portfolio and trades are mock data, but the "
                "scenario assumptions and shocks must be derived from the user's scenario and, "
                "when provided, the user's clarification answers. Do not compute valuation or official PnL. "
                "Return strict JSON only. Use only these risk factor names for shocks: Brent, "
                "WTI, Dubai, Gasoil, Fuel Oil, TTF, Henry Hub, JKM, Freight, EUA, EURUSD, "
                "USDJPY, GBPUSD, EU Power, US Power, Volatility, Rates, Storage, Gas Spread, "
                "Brent Spread. Shock values are percentages, positive or negative."
            ),
            user_prompt=(
                f"Scenario text: {scenario}\n"
                f"Severity: {severity}\n"
                f"Horizon: {horizon}\n\n"
                f"Generation mode: {mode}\n"
                f"Clarification answers and skipped questions:\n{answer_context}\n\n"
                f"Current edited assumptions:\n{assumption_context}\n\n"
                "Return exactly this JSON shape:\n"
                "{\n"
                '  "name": "short institutional scenario title",\n'
                '  "questions": ["clarification question"],\n'
                '  "assumptions": [{"text": "assumption", "type": "yes_no|value|text", '
                '"value": "Yes|No|numeric level or free text", "confidence": 0.0}],\n'
                '  "events": [{"name": "historical analogue", "markets": "markets", '
                '"duration": "duration", "reaction": "market reaction", "lesson": "lesson", '
                '"confidence": 0.0}],\n'
                '  "shocks": [{"factor": "Brent", "value": 0.0, "confidence": 0.0, '
                '"reason": "why", "analogue": "event", "propagation": "transmission chain"}]\n'
                "}\n\n"
                "If mode is draft: generate 4-6 important clarification questions, 5-8 draft "
                "assumptions, 3-5 historical analogues, and leave shocks either empty or very preliminary. "
                "If mode is finalize: use the clarification answers and edited assumptions as controlling "
                "inputs; generate final assumptions and 10-16 relevant shocks. If a risk factor is not "
                "relevant, omit it. In finalize mode, every shock reason must reference at least one "
                "scenario assumption or user answer."
            ),
            model=model,
            temperature=0.2,
        )
    )

    parsed = parse_json_object(response.content)
    return {
        "model": model,
        "usage": response.metadata.usage.model_dump(),
        "scenario": parsed,
    }


def parse_json_object(content: str) -> dict[str, Any]:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        start = content.find("{")
        end = content.rfind("}")
        if start >= 0 and end > start:
            return json.loads(content[start : end + 1])
        raise


class DemoHandler(BaseHTTPRequestHandler):
    def do_GET(self) -> None:
        path = self.path.split("?", 1)[0]
        if path == "/api/health":
            self._json(
                200,
                {
                    "status": "ok",
                    "routes": ["/api/generate-scenario", "/api/research-scenario"],
                    "model": resolve_demo_model(),
                    "web_search_enabled": os.getenv("LLM_WEB_SEARCH_ENABLED", "true"),
                },
            )
            return
        if path == "/favicon.ico":
            self.send_response(204)
            self.end_headers()
            return
        if path == "/":
            path = "/index.html"
        file_path = (FRONTEND_ROOT / path.lstrip("/")).resolve()
        if not str(file_path).startswith(str(FRONTEND_ROOT.resolve())) or not file_path.exists():
            self.send_error(404)
            return
        content_type = mimetypes.guess_type(file_path.name)[0] or "application/octet-stream"
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self) -> None:
        if self.path not in {"/api/research-scenario", "/api/generate-scenario"}:
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if self.path == "/api/research-scenario":
                result = openrouter_research(payload)
            else:
                result = openrouter_generate_scenario(payload)
            self._json(200, result)
        except Exception as exc:
            print("[local-demo] API error:")
            traceback.print_exc()
            self._json(500, {"error": str(exc)})

    def _json(self, status: int, payload: dict[str, Any]) -> None:
        data = json.dumps(payload, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, format: str, *args: Any) -> None:
        print(f"[local-demo] {self.address_string()} - {format % args}")


def main() -> None:
    load_dotenv()
    resolved_model = resolve_demo_model()
    os.environ["LLM_MODEL"] = resolved_model
    requested_port = int(os.getenv("DEMO_PORT", "4173"))
    port = find_available_port(requested_port)
    server = ThreadingHTTPServer(("127.0.0.1", port), DemoHandler)
    print(f"Scenario Workbench demo running at http://127.0.0.1:{port}")
    if port != requested_port:
        print(f"Port {requested_port} was busy; using {port} instead.")
    print(f"OpenRouter model: {resolved_model}")
    print("Health check: /api/health")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nScenario Workbench demo stopped.")


def find_available_port(start_port: int) -> int:
    for port in range(start_port, start_port + 20):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            try:
                probe.bind(("127.0.0.1", port))
            except OSError:
                continue
            return port
    raise RuntimeError(f"No available local port found from {start_port} to {start_port + 19}")


def resolve_demo_model() -> str:
    configured = os.getenv("LLM_MODEL", DEFAULT_DEMO_MODEL).strip()
    if configured in LEGACY_DEMO_MODELS:
        print(f"[local-demo] Replacing legacy demo model {configured} with {DEFAULT_DEMO_MODEL}")
        return DEFAULT_DEMO_MODEL
    return configured or DEFAULT_DEMO_MODEL


if __name__ == "__main__":
    main()
