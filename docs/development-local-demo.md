# Running the Local Demo

## Prerequisites

- Python 3.11 or newer
- A valid OpenRouter API key if using web enrichment

## Configuration

Create or update `.env` in the repository root:

```text
LLM_PROVIDER=openrouter
LLM_MODEL=openrouter/auto
LLM_TIMEOUT_SECONDS=45
LLM_MAX_RETRIES=2
LLM_WEB_SEARCH_ENABLED=true
LLM_WEB_MAX_RESULTS=5
OPENROUTER_API_KEY=your_key_here
```

Do not commit `.env`.

## Start

```bash
make demo
```

Then open:

```text
http://127.0.0.1:4173
```

If the server says that port `4173` is busy, open the port printed in the terminal instead.

The demo works with deterministic mock portfolio data immediately.

On the Scenario Builder screen:

- **Generate Scenario** calls OpenRouter through the local backend and generates assumptions, analogues and market shocks from the scenario text you entered.
- **Enrich With Web Research** calls OpenRouter web search to add historical context.

The mock portfolio, trades, desk structure, MTM, deltas and stress engine are local demo data. Scenario content is generated from your input when the server is running.

## Offline Mode

If no API key is configured, the portfolio, local deterministic fallback scenario generation, shock editing, stress impact, comparison, and report export still work. OpenRouter scenario generation and web enrichment are unavailable.
