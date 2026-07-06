# Demo Metrics And Terminology Glossary

This document explains every visible metric and risk term in the Scenario Workbench demo for a reader with no market risk background. The demo is intentionally deterministic: the same input creates the same mock portfolio and the same calculations every time.

Important boundary: these are mock numbers. The demo does not calculate official valuation, official PnL, VaR, expected shortfall, margin, or regulatory capital. It shows workflow, explainability, controls, and attribution.

## Big Picture

Scenario Workbench has three simple layers:

1. A mock portfolio of trades.
2. A scenario that creates market shocks.
3. A sensitivity engine that applies those shocks to mapped trades.

In plain English: the app asks, "If these market prices moved by these percentages, which trades would gain or lose money, and why?"

## Core Terms

**Trade**

A single position or contract in the portfolio. Examples are Brent futures, TTF gas futures, LNG cargo exposure, freight swaps, carbon futures, and FX forwards.

**Portfolio**

All trades combined. In this demo the portfolio contains 840 mock trades.

**Desk**

A business group that owns trades. The demo desks are:

- Crude Trading
- Refined Products
- Natural Gas
- LNG
- Power
- Freight
- Carbon
- FX & Treasury

**Trader**

The person assigned to a trade in the mock data. Trader impact is an aggregation of stress PnL across that trader's trades.

**Counterparty**

The legal or business entity on the other side of the trade. Counterparty tables show where current MTM and delta are concentrated.

**Instrument**

The type of product traded, such as ICE Brent Futures, TTF Futures, Spark Spread, EUA Futures, or USD/EUR Forward.

**Commodity**

The broad market family attached to a desk or trade. The demo uses Crude, Products, Gas, LNG, Power, Freight, Carbon, and FX.

**Book**

A desk-level sub-grouping used to organize trades. In the demo it is generated from commodity, region, and a number.

**Tenor**

The delivery or contract period, such as Aug-26, Q4-26, or Cal-27.

**Expiry**

The period when a contract expires or settles. The demo uses the same style of labels as tenor.

**Volume**

The signed size of the trade. Positive and negative values represent opposite directions. The unit depends on the desk:

- FX uses USD notional.
- Freight uses days or lots.
- Other commodities use bbl, MWh, or lots.

**Price**

The mock market price assigned to the trade. It is generated deterministically between 18 and 153.

**MTM**

MTM means mark-to-market. It is the current estimated value of a trade based on market prices. Positive MTM is a current gain; negative MTM is a current loss.

In the demo, trade MTM is generated as:

```text
trade mtm =
  volume
  x price
  x mtm rate
  x direction sign
```

Where:

- `mtm rate` is a deterministic value from 3.5% to 14.5%.
- `direction sign` is either +1 or -1.

**PnL**

PnL means profit and loss. It measures a gain or loss. In the demo there are two different PnL ideas:

- Daily PnL: a mock front-office estimate for today's movement.
- Stress PnL: the estimated gain or loss under a selected stress scenario.

**Delta**

Delta is a sensitivity. It says how much a trade changes when a mapped market factor changes. The demo uses one simplified delta number per trade.

In the demo, trade delta is generated as:

```text
trade delta =
  volume
  x deterministic sensitivity between 0.18 and 2.08
```

A positive delta benefits from a positive shock. A negative delta loses from a positive shock.

**Risk Factor**

A market variable that can be shocked, such as Brent, TTF, JKM, Freight, EURUSD, Rates, or Volatility.

**Risk Factor Mapping**

The link between instruments and the market factors that affect them. For example:

- ICE Brent Futures maps to Brent.
- Brent Calendar Spread maps to Brent and Brent Spread.
- LNG Cargo DES Japan maps to JKM and Freight.
- German Baseload maps to EU Power and TTF.
- Cross Currency Swap maps to EURUSD and Rates.

This mapping is why the demo is coherent: a Brent shock affects Brent-linked trades, not every trade randomly.

## Portfolio Dashboard Metrics

**Portfolio Value**

This is the sum of current MTM for all visible trades.

```text
portfolio value = sum(trade mtm)
```

If the search box or desk filter is used, only the filtered trades are included.

**Daily PnL**

This is a deterministic mock front-office estimate. It is not based on market data.

```text
daily pnl =
  sum(trade mtm x deterministic daily move x 0.035)
```

Where:

```text
deterministic daily move = seeded value between 0 and 1 minus 0.48
```

The daily move can be positive or negative. The `0.035` term keeps the movement small relative to MTM.

**Stress PnL**

This is blank until a scenario is confirmed. After confirmation:

```text
stress pnl = sum(all trade stress pnl)
```

**Net Delta**

This is the sum of delta across visible trades.

```text
net delta = sum(trade delta)
```

It is a directional exposure measure. A large positive or negative number means the filtered portfolio is sensitive to market moves.

**Risk Factors**

This is a count of mapped risk factor links, not a count of unique factors.

```text
risk factor count = sum(number of mapped risk factors on each visible trade)
```

A trade mapped to two factors adds 2.

**Desk Exposure And PnL**

This groups current MTM by desk.

```text
desk mtm = sum(trade mtm for trades on that desk)
```

Bars are sorted by absolute size so the largest gain or loss appears first.

**Commodity Breakdown**

This groups absolute MTM by commodity.

```text
commodity exposure =
  sum(abs(trade mtm) for trades in that commodity)

commodity percentage =
  commodity exposure / sum(all commodity exposures) x 100
```

It uses absolute MTM because concentration matters whether the current MTM is positive or negative.

**Largest Positions**

This table sorts trades by absolute MTM and shows the top 12.

```text
largest positions = top trades sorted by abs(trade mtm)
```

**Top Counterparties**

This groups trades by counterparty.

```text
counterparty trades = count(trades for counterparty)
counterparty mtm = sum(trade mtm for counterparty)
counterparty delta = sum(trade delta for counterparty)
```

The table is sorted by absolute counterparty MTM.

**Position Inventory**

This is the raw mock trade table. It shows up to 160 visible trades after search and desk filters.

## Scenario Builder Terms

**Scenario Request**

The user's description of a market event, for example a European gas supply shock or a recession-driven demand collapse.

**Severity**

Severity controls the scale of generated shocks.

```text
Moderate multiplier = 0.68
Severe multiplier = 1.00
Extreme multiplier = 1.45
```

**Horizon**

The time window the scenario represents: 1 week, 1 month, or 3 months. In this demo it is sent to the LLM and recorded, but the local fallback stress formula does not otherwise change by horizon.

**Clarification Questions**

Questions generated before final shocks. They force the scenario to become more precise before stress is run.

**Assumptions**

Editable statements about what the scenario believes. Each assumption has:

- text
- type: text, yes/no, or value
- value
- owner
- confidence

If assumptions or question answers change after final shocks are generated, the demo invalidates the final shocks and requires regeneration.

The assumption editor separates the input shape from the recorded answer:

- Input type says what kind of answer the assumption expects: text, Boolean, or level/value.
- Recorded value is the actual answer stored for that assumption, such as Yes, No, High, 1 month, or a written note.

**Historical Analogues**

Past events used as directional comparisons. Examples include Russia 2022, COVID Oil Crash, Abqaiq Attack, Suez Canal Blockage, European Gas Crisis, and Texas Freeze.

An analogue supports reasoning. It is not a formula and it does not price the portfolio.

**Shock**

A percentage move applied to a risk factor. For example:

```text
Brent shock = +18.0%
TTF shock = +14.7%
EURUSD shock = -2.2%
```

**AI Value**

The model-generated shock value.

**User Value**

The final shock value used by the stress engine. It starts equal to the AI value but can be edited by the user.

**Difference**

The user override amount.

```text
difference = user value - ai value
```

**Confidence**

A 0 to 100 percent display of how confident the generated scenario item is. In code it is stored from 0 to 1:

```text
display confidence = confidence x 100
```

Confidence is a scenario-construction signal, not a probability that the PnL is correct.

**Override**

An audit trail for a manual shock edit. The demo stores:

- override user
- override time
- override reason

## Stress Impact Calculations

The stress engine applies confirmed shocks to every trade in the full mock portfolio.

For each trade:

```text
multi-factor multiplier =
  0.55 + number of mapped risk factors x 0.28
```

Then for each mapped factor:

```text
factor contribution =
  trade delta
  x factor shock as decimal
  x multi-factor multiplier
```

The factor shock is converted from a percentage to a decimal:

```text
+18.0% becomes 0.18
-2.2% becomes -0.022
```

Trade stress PnL is the sum of all mapped factor contributions:

```text
trade stress pnl =
  sum(factor contribution for each mapped factor)
```

Portfolio stress PnL is:

```text
portfolio stress pnl = sum(trade stress pnl)
```

## Stress Impact Screen Metrics

**Portfolio Stress PnL**

The total scenario gain or loss across all trades.

```text
portfolio stress pnl = sum(trade stress pnl)
```

**Stress / MTM**

Stress impact relative to current portfolio value.

```text
stress / mtm =
  portfolio stress pnl / max(abs(portfolio mtm), 1) x 100
```

The `max(..., 1)` prevents division by zero.

**Worst Desk**

The desk with the lowest stress PnL.

```text
worst desk = desk with minimum sum(trade stress pnl)
```

Lowest means the largest loss.

**Worst Trade**

The trade with the lowest stress PnL.

```text
worst trade = trade with minimum trade stress pnl
```

**Shock Overrides**

The number of shocks where the user value differs from the AI value by more than 0.01.

```text
shock overrides =
  count(abs(user value - ai value) > 0.01)
```

**Desk Stress PnL**

Stress PnL grouped by desk.

```text
desk stress pnl =
  sum(trade stress pnl for trades on that desk)
```

**Risk Factor Heatmap**

A visual display of confirmed shocks. Color direction comes from the shock sign:

- positive shock: gain-colored teal
- negative shock: loss-colored red

Intensity is:

```text
intensity = min(100, abs(user shock value) x 3)
```

**Risk Factor PnL Attribution**

Stress PnL grouped by risk factor.

```text
risk factor pnl =
  sum(trade delta x factor shock x multi-factor multiplier)
```

Trade count is the number of trades mapped to that factor.

**Trader Impact**

Stress PnL grouped by trader and desk.

```text
trader stress pnl =
  sum(trade stress pnl for trader on desk)
```

The table shows the worst 12 trader rows.

**Worst Positions**

The 25 trades with the lowest stress PnL.

```text
worst positions = bottom 25 trades sorted by trade stress pnl
```

## Scenario Comparison Metrics

The comparison screen creates scaled variants from the confirmed scenario.

```text
Base multiplier = 0
Moderate multiplier = 0.68
Severe multiplier = 1.00
Extreme multiplier = 1.45
```

For each variant:

```text
variant shock = original ai shock x variant multiplier
```

Then the stress engine reruns with those variant shocks.

**Portfolio PnL**

The total stress PnL for the variant.

**% MTM**

```text
variant % mtm =
  variant portfolio pnl / max(abs(portfolio mtm), 1) x 100
```

**Crude, Gas, Power, Freight**

Stress PnL grouped by commodity for the variant.

```text
commodity stress pnl =
  sum(trade stress pnl for trades in commodity)
```

**Worst Desk**

The desk with the largest loss under the variant.

**Key Driver**

The risk factor with the largest absolute PnL attribution.

```text
key driver =
  factor with max(abs(risk factor pnl))
```

**Desk Impact Matrix**

Desk-level stress PnL across Base, Moderate, Severe, and Extreme. Cell color intensity is:

```text
shade = min(0.9, abs(desk variant pnl) / 6000000)
```

## Report Metrics

The report repeats the confirmed scenario and stress outputs in committee-pack form:

- Portfolio Stress PnL
- Stress / MTM
- Worst Desk
- Scenario name
- Average Confidence
- assumptions
- approved shocks
- desk and trader impact
- top risk positions

Average Confidence is:

```text
average confidence =
  sum(shock confidence) / number of shocks
```

The exported JSON contains the company name, generation timestamp, active scenario, total impact, worst desk, and top 20 worst positions.

## Why The Demo Is Coherent

The demo is coherent because every number follows a consistent chain:

1. Trades belong to desks, commodities, traders, and counterparties.
2. Instruments map to relevant risk factors.
3. Scenarios generate shocks to those risk factors.
4. The stress engine applies only mapped shocks to each trade.
5. Trade results aggregate into desk, trader, factor, commodity, counterparty, comparison, and report views.

This means:

- A gas shock flows into TTF, JKM, LNG, and European power-linked exposure.
- A freight shock flows into freight and physical cargo-linked exposure.
- A crude shock flows into crude and product-linked exposure.
- An FX or rates shock flows into treasury and currency exposure.
- A carbon shock flows into carbon and fuel-switching exposure.

The numbers are not official, but the relationships are intentionally realistic enough to demonstrate how a governed market risk workflow should behave.
