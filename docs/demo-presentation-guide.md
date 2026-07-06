# Demo Presentation Guide

This guide explains how to present the Scenario Workbench demo to a risk, middle office, technology or product audience.

## What The Demo Shows

The demo represents an AI-assisted scenario engineering workflow for a global commodity trading portfolio.

It demonstrates:

- portfolio browsing by desk, trader, counterparty, commodity and trade
- scenario drafting from free-text market events
- clarification questions before final shock generation
- editable assumptions with text, yes/no and value-style inputs
- final shock generation after user answers are validated
- user overrides on generated shocks
- deterministic stress impact using mock sensitivities
- desk, trader, risk factor and position-level attribution
- scenario comparison across severity variants
- mock risk committee report export

## What Is Mocked

The following are mock/demo data:

- trades
- desks
- traders
- counterparties
- current MTM
- deltas
- risk factor mappings
- simplified stress engine
- report export

The mock portfolio is internally coherent but is not market data, not official risk output and not a valuation model.

## What Uses The LLM

When the local server is running and OpenRouter is configured:

- **Generate Draft Questions** sends the scenario text to the LLM.
- The LLM returns clarification questions, draft assumptions and historical analogues.
- The user answers or skips questions and may edit assumptions.
- **Validate Answers & Generate Shocks** sends the original scenario, answers, skips and edited assumptions back to the LLM.
- The LLM returns final assumptions and market shocks.

The stress engine then applies those shocks to the mock portfolio.

## Portfolio Model

Each trade includes:

- trade ID
- book
- desk
- trader
- counterparty
- instrument
- tenor and expiry
- volume
- price
- current MTM
- delta
- currency
- mapped risk factors
- status

Examples of instruments include Brent futures, WTI futures, Dubai swaps, fuel oil swaps, gas futures, LNG cargo exposure, freight swaps, power products, carbon futures and FX forwards.

## Risk Factor Mapping

Each instrument maps to one or more risk factors. For example:

- ICE Brent Futures maps to `Brent`
- TTF Futures maps to `TTF`
- LNG Cargo DES Japan maps to `JKM` and `Freight`
- German Baseload maps to `EU Power` and `TTF`
- USD/EUR Forward maps to `EURUSD`

This mapping is what lets a generated shock affect only relevant positions.

## Stress Calculation

The demo does not price trades.

It uses a deterministic sensitivity approximation:

```text
trade stress pnl =
  sum(mapped risk factor shocks)
  x trade delta
  x simple multi-factor scaling term
```

The scaling term gives trades with multiple mapped risk factors slightly more transmission complexity.

This produces internally coherent PnL attribution:

- Brent shocks affect crude and crude-linked products.
- TTF shocks affect gas, LNG and European power-linked books.
- Freight shocks affect freight and physical cargo exposures.
- FX shocks affect treasury and FX forward exposure.

## Recalculation Flow

1. User enters a scenario.
2. LLM drafts clarification questions and assumptions.
3. User answers, skips or edits the assumptions.
4. LLM generates final shocks using those answers.
5. User may override shocks.
6. User confirms the scenario.
7. Stress engine recalculates:
   - portfolio stress PnL
   - desk stress PnL
   - trader impact
   - risk factor attribution
   - worst positions
   - comparison scenarios
   - report tables

If a user edits assumptions or question answers after final shocks are generated, the final shocks are invalidated and must be regenerated.

## What A Risk Manager Should Notice

The important product behavior is not that the AI computes risk numbers. It does not.

The important behavior is:

- scenario construction is structured
- clarification questions are explicit
- assumptions are visible and editable
- market shocks are explainable
- human review happens before execution
- overrides are tracked
- final stress impact is tied to portfolio risk factor mappings
- outputs are reproducible within the demo state

## How To Explain Accuracy

Say this:

> The portfolio data and stress engine are mock and deterministic. They are not official risk numbers. The demo is designed to show workflow, controls, explainability and attribution. In production, the confirmed shocks would be sent to approved pricing and risk engines.

Do not say the demo calculates real PnL or valuation.

## Technical Architecture

The browser app is static HTML, CSS and JavaScript.

The local Python server:

- serves the frontend
- reads `.env`
- keeps the OpenRouter key server-side
- exposes `/api/generate-scenario`
- exposes `/api/research-scenario`
- routes LLM calls through `LLMService`

The frontend never calls OpenRouter directly.

## Local Demo Flow

Run:

```bash
make demo
```

Open the URL printed in the terminal.

Presentation sequence:

1. Open Portfolio.
2. Show trade inventory, desk breakdown and counterparties.
3. Go to Scenario Builder.
4. Enter a scenario text.
5. Click **Generate Draft Questions**.
6. Answer or skip the generated questions.
7. Click **Validate Answers & Generate Shocks**.
8. Review assumptions and shocks.
9. Override one shock to show control.
10. Click **Confirm Scenario & Run Stress**.
11. Show Stress Impact.
12. Show Compare.
13. Show Report.

