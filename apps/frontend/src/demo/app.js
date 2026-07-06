const company = "Global Trading Portfolio";

const desks = [
  { name: "Crude Trading", region: "Global", commodity: "Crude", traders: ["Maya El-Sayed", "Jonas Richter", "Priya Menon", "Alex Mercer"] },
  { name: "Refined Products", region: "Europe", commodity: "Products", traders: ["Clara Voigt", "Nikhil Rao", "Sofia Almeida"] },
  { name: "Natural Gas", region: "Europe", commodity: "Gas", traders: ["Tom Whitaker", "Elena Kovac", "Marc Dubois"] },
  { name: "LNG", region: "Asia", commodity: "LNG", traders: ["Hana Mori", "Daniel Choi", "Noor Haddad"] },
  { name: "Power", region: "North America", commodity: "Power", traders: ["Rachel Stein", "Victor Hughes", "Amelia Grant"] },
  { name: "Freight", region: "Global", commodity: "Freight", traders: ["Owen McCarthy", "Luca Romano", "Samir Patel"] },
  { name: "Carbon", region: "Europe", commodity: "Carbon", traders: ["Isabelle Laurent", "Theo Schneider", "Anika Weiss"] },
  { name: "FX & Treasury", region: "Global", commodity: "FX", traders: ["Mei Lin", "Grace Turner", "Karim Mansour"] }
];

const counterparties = [
  "Helios Refining SA", "NorseGrid Energy", "Aegean Shipping Ltd", "Meridian Europe Desk",
  "BlueRiver Capital", "Kestrel Utilities", "Iberia Power Markets", "Caspian Resources",
  "Atlantic Storage Co", "Summit Trade Finance", "Redwood Clearing Bank", "Baltic LNG Partners"
];

const instruments = {
  "Crude Trading": ["ICE Brent Futures", "WTI Futures", "Dubai Swaps", "Brent Calendar Spread", "Brent Call Option"],
  "Refined Products": ["Fuel Oil Swaps", "Jet Fuel Swaps", "Gasoil Swaps", "Crack Spread", "ARA Inventory"],
  "Natural Gas": ["TTF Futures", "NBP Futures", "TTF Calendar Spread", "Henry Hub Futures", "Gas Storage"],
  "LNG": ["JKM Swaps", "LNG Cargo DES Japan", "LNG Freight Arb", "TTF-JKM Spread", "Physical Cargo"],
  "Power": ["ERCOT Power Swap", "PJM Peak Futures", "German Baseload", "Spark Spread", "Power Option"],
  "Freight": ["VLCC Freight Exposure", "Aframax Freight Swap", "Suezmax Route TD20", "LNG Carrier Charter", "Bunker Fuel Hedge"],
  "Carbon": ["EUA Futures", "UKA Futures", "Carbon Inventory", "Clean Dark Spread", "EUA Call Option"],
  "FX & Treasury": ["USD/EUR Forward", "USD/JPY Forward", "GBP/USD Forward", "Cross Currency Swap", "Treasury Cash Hedge"]
};

const riskFactorMap = {
  "ICE Brent Futures": ["Brent"], "WTI Futures": ["WTI"], "Dubai Swaps": ["Dubai"], "Brent Calendar Spread": ["Brent", "Brent Spread"], "Brent Call Option": ["Brent", "Volatility"],
  "Fuel Oil Swaps": ["Fuel Oil"], "Jet Fuel Swaps": ["Jet Fuel"], "Gasoil Swaps": ["Gasoil"], "Crack Spread": ["Brent", "Gasoil"], "ARA Inventory": ["Gasoil", "Storage"],
  "TTF Futures": ["TTF"], "NBP Futures": ["TTF"], "TTF Calendar Spread": ["TTF", "Gas Spread"], "Henry Hub Futures": ["Henry Hub"], "Gas Storage": ["TTF", "Storage"],
  "JKM Swaps": ["JKM"], "LNG Cargo DES Japan": ["JKM", "Freight"], "LNG Freight Arb": ["JKM", "Freight"], "TTF-JKM Spread": ["TTF", "JKM"], "Physical Cargo": ["Brent", "Freight"],
  "ERCOT Power Swap": ["US Power"], "PJM Peak Futures": ["US Power"], "German Baseload": ["EU Power", "TTF"], "Spark Spread": ["EU Power", "TTF"], "Power Option": ["EU Power", "Volatility"],
  "VLCC Freight Exposure": ["Freight"], "Aframax Freight Swap": ["Freight"], "Suezmax Route TD20": ["Freight"], "LNG Carrier Charter": ["Freight", "JKM"], "Bunker Fuel Hedge": ["Fuel Oil"],
  "EUA Futures": ["EUA"], "UKA Futures": ["EUA"], "Carbon Inventory": ["EUA"], "Clean Dark Spread": ["EUA", "EU Power"], "EUA Call Option": ["EUA", "Volatility"],
  "USD/EUR Forward": ["EURUSD"], "USD/JPY Forward": ["USDJPY"], "GBP/USD Forward": ["GBPUSD"], "Cross Currency Swap": ["EURUSD", "Rates"], "Treasury Cash Hedge": ["Rates"]
};

const historicalEvents = [
  { name: "Russia 2022", markets: "TTF, Brent, Power, Freight", duration: "9 months", reaction: "European gas repriced violently; oil risk premia rose; power curves followed gas.", confidence: 0.88, lesson: "Supply disruption and sanctions transmit through gas, power, freight and FX liquidity." },
  { name: "COVID Oil Crash", markets: "Brent, WTI, Products, Freight", duration: "2 months", reaction: "Demand collapse drove crude and products lower; storage and calendar spreads dislocated.", confidence: 0.81, lesson: "Inventory constraints can dominate flat price and spread behavior." },
  { name: "Abqaiq Attack", markets: "Brent, Dubai, Products", duration: "3 weeks", reaction: "Immediate crude spike followed by retracement as spare capacity response became clear.", confidence: 0.77, lesson: "Physical infrastructure shocks can be sharp but confidence-sensitive." },
  { name: "Suez Canal Blockage", markets: "Freight, Products, LNG", duration: "1 week", reaction: "Freight and regional product premia widened; LNG voyage economics changed.", confidence: 0.74, lesson: "Chokepoint disruption propagates through freight first and flat price second." },
  { name: "European Gas Crisis", markets: "TTF, JKM, EU Power, EUA", duration: "12 months", reaction: "Gas scarcity repriced power and altered LNG basin competition.", confidence: 0.9, lesson: "Gas shocks can dominate power, carbon and cross-commodity spreads." },
  { name: "Texas Freeze", markets: "Henry Hub, US Power", duration: "2 weeks", reaction: "Regional gas and power prices spiked with extreme basis behavior.", confidence: 0.72, lesson: "Weather and deliverability can produce localized nonlinear stress." }
];

const state = {
  trades: [],
  filteredTrades: [],
  activeScenario: null,
  scenarioFinalized: false,
  scenarioConfirmed: false,
  impacts: null,
  scenarios: [],
  webResearch: null
};

function seeded(index, salt = 0) {
  const x = Math.sin(index * 999 + salt * 37) * 10000;
  return x - Math.floor(x);
}

function pick(list, index, salt = 0) {
  return list[Math.floor(seeded(index, salt) * list.length) % list.length];
}

function money(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}m`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(0)}k`;
  return `${sign}$${abs.toFixed(0)}`;
}

function number(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function pct(value) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function normalizeScenario(raw, prompt, severity, horizon) {
  const fallback = mockLLMGenerate(prompt, severity, horizon);
  const events = Array.isArray(raw.events) && raw.events.length ? raw.events : fallback.events;
  const shocks = Array.isArray(raw.shocks) && raw.shocks.length ? raw.shocks : fallback.shocks;
  return {
    name: raw.name || fallback.name,
    prompt,
    horizon,
    severity,
    questions: (Array.isArray(raw.questions) && raw.questions.length ? raw.questions : fallback.questions).map((q) => ({
      text: typeof q === "string" ? q : q.text,
      answer: "",
      skipped: false
    })),
    assumptions: Array.isArray(raw.assumptions) && raw.assumptions.length
      ? raw.assumptions.map((a) => ({
        text: typeof a === "string" ? a : a.text,
        type: normalizeAssumptionType(a.type),
        value: normalizeAssumptionValue(a),
        owner: "AI",
        confidence: clampConfidence(a.confidence)
      }))
      : fallback.assumptions,
    events: events.map((e) => ({
      name: e.name || e.event || "Historical analogue",
      markets: Array.isArray(e.markets) ? e.markets.join(", ") : e.markets || "Relevant commodity markets",
      duration: e.duration || e.date_range || "Historical period",
      reaction: e.reaction || e.description || "Market reaction generated from scenario context.",
      lesson: e.lesson || e.lessons_learned || "Use as directional analogue only.",
      confidence: clampConfidence(e.confidence)
    })),
    shocks: shocks.map((s) => {
      const value = Number(s.value ?? s.userValue ?? s.aiValue ?? s.shock_percent ?? 0);
      return {
        factor: s.factor || s.risk_factor,
        aiValue: value,
        userValue: value,
        confidence: clampConfidence(s.confidence),
        reason: s.reason || s.reasoning || "Generated from scenario assumptions.",
        analogue: s.analogue || s.historical_analogue || "Generated analogue",
        propagation: s.propagation || s.propagation_chain || `${s.factor || s.risk_factor} transmits through mapped portfolio sensitivities.`,
        overrideReason: "",
        overrideUser: "analyst.demo",
        overrideTime: ""
      };
    }).filter((s) => Boolean(s.factor))
  };
}

function clampConfidence(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0.7;
  return Math.max(0, Math.min(1, numeric));
}

function normalizeAssumptionType(type) {
  if (["yes_no", "value", "text"].includes(type)) return type;
  return "text";
}

function normalizeAssumptionValue(assumption) {
  if (!assumption || typeof assumption === "string") return "";
  return assumption.value ?? assumption.answer ?? assumption.level ?? "";
}

function draftAssumption(text, confidence = 0.75) {
  return { text, type: "text", value: "", owner: "AI", confidence };
}

function generateTrades() {
  const trades = [];
  const tenors = ["Aug-26", "Sep-26", "Q4-26", "Cal-27", "Q1-27", "Summer-27", "Winter-27"];
  const statuses = ["Confirmed", "Confirmed", "Confirmed", "Pending Novation", "Settles T+2"];
  for (let i = 0; i < 840; i += 1) {
    const desk = desks[i % desks.length];
    const instrument = pick(instruments[desk.name], i, 4);
    const trader = pick(desk.traders, i, 6);
    const direction = seeded(i, 8) > 0.48 ? 1 : -1;
    const volume = Math.round((2_000 + seeded(i, 9) * 180_000) * direction);
    const price = 18 + seeded(i, 10) * 135;
    const mtm = volume * price * (0.035 + seeded(i, 11) * 0.11) * (seeded(i, 12) > 0.45 ? 1 : -1);
    const delta = volume * (0.18 + seeded(i, 13) * 1.9);
    const tradeDateMonth = 1 + Math.floor(seeded(i, 14) * 6);
    const tradeDateDay = 1 + Math.floor(seeded(i, 15) * 26);
    trades.push({
      id: `SWT-${String(260000 + i).padStart(6, "0")}`,
      book: `${desk.commodity}-${desk.region.slice(0, 3).toUpperCase()}-${1 + (i % 5)}`,
      desk: desk.name,
      region: desk.region,
      commodity: desk.commodity,
      trader,
      counterparty: pick(counterparties, i, 16),
      tradeDate: `2026-${String(tradeDateMonth).padStart(2, "0")}-${String(tradeDateDay).padStart(2, "0")}`,
      instrument,
      volume,
      unit: desk.commodity === "FX" ? "USD notional" : desk.commodity === "Freight" ? "days / lots" : "bbl / MWh / lots",
      price,
      mtm,
      delta,
      currency: "USD",
      tenor: pick(tenors, i, 17),
      expiry: pick(tenors, i, 18),
      riskFactors: riskFactorMap[instrument],
      status: pick(statuses, i, 19)
    });
  }
  state.trades = trades;
  state.filteredTrades = trades;
}

function aggregate(items, keyFn, valueFn) {
  const map = new Map();
  items.forEach((item) => {
    const key = keyFn(item);
    map.set(key, (map.get(key) || 0) + valueFn(item));
  });
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

function byDesk(valueFn) {
  return aggregate(state.filteredTrades, (t) => t.desk, valueFn);
}

function renderKpis() {
  const mtm = state.filteredTrades.reduce((sum, t) => sum + t.mtm, 0);
  const delta = state.filteredTrades.reduce((sum, t) => sum + t.delta, 0);
  const dailyPnl = state.filteredTrades.reduce((sum, t, i) => sum + t.mtm * (seeded(i, 31) - 0.48) * 0.035, 0);
  const stress = state.scenarioConfirmed && state.impacts ? state.impacts.total : 0;
  const kpis = [
    ["Portfolio Value", money(mtm), `${state.filteredTrades.length} active trades`],
    ["Daily PnL", money(dailyPnl), "Front-office estimate"],
    ["Stress PnL", state.scenarioConfirmed ? money(stress) : "-", state.scenarioConfirmed ? state.activeScenario.name : "No run executed"],
    ["Net Delta", number(delta), "Across mapped risk factors"],
    ["Risk Factors", number(state.filteredTrades.reduce((s, t) => s + t.riskFactors.length, 0)), "Mock exposures"]
  ];
  document.getElementById("kpiGrid").innerHTML = kpis.map(([label, value, sub]) => `<div class="kpi"><span>${label}</span><strong class="${value.includes("-") ? "negative" : ""}">${value}</strong><small>${sub}</small></div>`).join("");
}

function renderBars(id, rows, valueLabel = money) {
  const max = Math.max(...rows.map((r) => Math.abs(r.value)), 1);
  document.getElementById(id).innerHTML = rows.map((row) => {
    const width = Math.max(4, Math.abs(row.value) / max * 100);
    const cls = row.value < 0 ? "loss" : "gain";
    return `<div class="bar-row"><strong>${row.name}</strong><div class="bar-track"><div class="bar-fill ${cls}" style="width:${width}%"></div></div><span class="num ${row.value < 0 ? "negative" : "positive"}">${valueLabel(row.value)}</span></div>`;
  }).join("");
}

function renderDashboard() {
  updateFilteredTrades();
  renderKpis();
  document.getElementById("tradeCountLabel").textContent = `${state.filteredTrades.length} trades shown`;
  renderBars("deskBars", byDesk((t) => t.mtm).sort((a, b) => Math.abs(b.value) - Math.abs(a.value)));
  const commodity = aggregate(state.filteredTrades, (t) => t.commodity, (t) => Math.abs(t.mtm)).sort((a, b) => b.value - a.value);
  const totalCommodity = commodity.reduce((s, c) => s + c.value, 0);
  document.getElementById("commodityDonut").innerHTML = commodity.map((c) => `<div class="donut-row"><strong>${c.name}</strong><div class="bar-track"><div class="bar-fill" style="width:${(c.value / totalCommodity) * 100}%"></div></div><span class="num">${((c.value / totalCommodity) * 100).toFixed(1)}%</span></div>`).join("");
  document.getElementById("largestPositions").innerHTML = [...state.filteredTrades].sort((a, b) => Math.abs(b.mtm) - Math.abs(a.mtm)).slice(0, 12).map((t) => `<tr><td>${t.id}</td><td>${t.desk}</td><td>${t.trader}</td><td>${t.instrument}</td><td class="num ${t.mtm < 0 ? "negative" : "positive"}">${money(t.mtm)}</td></tr>`).join("");
  const cp = new Map();
  state.filteredTrades.forEach((t) => {
    const row = cp.get(t.counterparty) || { trades: 0, mtm: 0, delta: 0 };
    row.trades += 1; row.mtm += t.mtm; row.delta += t.delta;
    cp.set(t.counterparty, row);
  });
  document.getElementById("counterpartyTable").innerHTML = [...cp.entries()].sort((a, b) => Math.abs(b[1].mtm) - Math.abs(a[1].mtm)).slice(0, 10).map(([name, row]) => `<tr><td>${name}</td><td>${row.trades}</td><td class="num ${row.mtm < 0 ? "negative" : "positive"}">${money(row.mtm)}</td><td class="num">${number(row.delta)}</td></tr>`).join("");
  renderTradeTable();
}

function updateFilteredTrades() {
  const q = document.getElementById("globalSearch").value.toLowerCase();
  const desk = document.getElementById("deskFilter").value;
  state.filteredTrades = state.trades.filter((t) => (!desk || t.desk === desk) && [t.id, t.book, t.desk, t.trader, t.counterparty, t.instrument].join(" ").toLowerCase().includes(q));
}

function renderTradeTable() {
  updateFilteredTrades();
  document.getElementById("tradeTable").innerHTML = state.filteredTrades.slice(0, 160).map((t) => `<tr><td>${t.id}</td><td>${t.book}</td><td>${t.desk}</td><td>${t.trader}</td><td>${t.counterparty}</td><td>${t.instrument}</td><td>${t.tenor}</td><td class="num">${number(t.volume)}</td><td class="num">${t.price.toFixed(2)}</td><td class="num ${t.mtm < 0 ? "negative" : "positive"}">${money(t.mtm)}</td><td class="num">${number(t.delta)}</td><td><span class="pill">${t.status}</span></td></tr>`).join("");
}

function mockLLMGenerate(prompt, severity, horizon) {
  const scenarioText = prompt.toLowerCase();
  const mult = severity === "Extreme" ? 1.45 : severity === "Moderate" ? 0.68 : 1;
  const theme = scenarioText.includes("gas") || scenarioText.includes("ttf") || scenarioText.includes("lng") ? "Gas Supply Stress"
    : scenarioText.includes("recession") || scenarioText.includes("demand") || scenarioText.includes("covid") ? "Demand Collapse Stress"
    : scenarioText.includes("freight") || scenarioText.includes("suez") || scenarioText.includes("shipping") ? "Freight Dislocation Stress"
    : scenarioText.includes("rate") || scenarioText.includes("fx") || scenarioText.includes("dollar") ? "Macro Liquidity Stress"
    : "Energy Supply Escalation";
  const crudeBias = theme === "Demand Collapse Stress" ? -1 : 1;
  const gasBias = theme === "Gas Supply Stress" ? 2.1 : 1;
  const freightBias = theme === "Freight Dislocation Stress" ? 1.8 : 1;
  const fxBias = theme === "Macro Liquidity Stress" ? 1.8 : 1;
  const shocks = [
    ["Brent", 18 * mult * crudeBias, 0.84, "Scenario changes crude benchmark risk premium."],
    ["WTI", 11 * mult * crudeBias, 0.74, "WTI follows global crude with weaker direct transmission."],
    ["Dubai", 20 * mult * crudeBias, 0.82, "Dubai reprices with Middle East physical crude risk."],
    ["Gasoil", 13 * mult * crudeBias, 0.76, "Product cracks respond to crude and refinery margin uncertainty."],
    ["Fuel Oil", 9 * mult * crudeBias, 0.69, "Bunker and residual fuel respond through shipping and crude channels."],
    ["TTF", 7 * mult * gasBias, 0.62, "European gas reprices through supply and LNG substitution channels."],
    ["JKM", 12 * mult * gasBias, 0.71, "Asian LNG procurement costs respond to cargo competition."],
    ["Freight", 28 * mult * freightBias, 0.86, "Shipping rates respond to routing, insurance and vessel availability."],
    ["EUA", -4 * mult * (theme === "Demand Collapse Stress" ? 1.8 : 1), 0.58, "Carbon responds to industrial demand and fuel switching assumptions."],
    ["EURUSD", -2.2 * mult * fxBias, 0.64, "Dollar liquidity and safe-haven demand pressure EURUSD."],
    ["USDJPY", 1.4 * mult * fxBias, 0.55, "USDJPY reflects dollar strength offset by safe-haven flows."],
    ["EU Power", 6 * mult, 0.61, "Power follows gas and fuel input costs."],
    ["US Power", 2 * mult, 0.46, "Limited direct transmission to US regional power."],
    ["Volatility", 16 * mult, 0.79, "Options volatility rises under geopolitical uncertainty."],
    ["Rates", -0.8 * mult, 0.51, "Risk-off move modestly lowers front-end rate expectations."]
  ].map(([factor, aiValue, confidence, reason]) => ({
    factor, aiValue, userValue: aiValue, confidence, reason,
    analogue: factor === "Freight" ? "Suez Canal Blockage" : factor.includes("TTF") || factor === "EU Power" ? "European Gas Crisis" : "Abqaiq Attack",
    propagation: `${factor} shock transmitted through mapped exposures and desk-level delta sensitivities.`,
    overrideReason: "",
    overrideUser: "analyst.demo",
    overrideTime: ""
  }));
  return {
    name: `${severity} ${theme}`,
    prompt, horizon, severity,
    questions: [
      { text: "Should the disruption be limited to maritime logistics, physical production, or both?", answer: "", skipped: false },
      { text: "Should sanctions, insurance constraints, and counterparty credit tightening be included?", answer: "", skipped: false },
      { text: "Should the scenario assume a short-lived shock or persistent escalation over the selected horizon?", answer: "", skipped: false },
      { text: "Are user-approved overrides required for crude benchmarks before execution?", answer: "", skipped: false }
    ],
    assumptions: [
      { ...draftAssumption("Middle East export reliability deteriorates and risk premium increases across crude benchmarks.", 0.84), type: "yes_no", value: "Yes" },
      { ...draftAssumption("Freight rates rise due to rerouting, war risk insurance, and vessel availability constraints.", 0.86), type: "value", value: "High" },
      { ...draftAssumption("LNG procurement costs rise as buyers compete for flexible cargoes and longer voyage routes.", 0.71), type: "yes_no", value: "Yes" },
      { ...draftAssumption("USD strengthens modestly under flight-to-quality conditions.", 0.64), type: "value", value: "Moderate" },
      { ...draftAssumption("European power follows gas and liquid fuel input costs, but demand destruction limits upside.", 0.61) }
    ],
    events: historicalEvents.slice(0, 5),
    shocks
  };
}

function renderScenario() {
  const s = state.activeScenario;
  const confirmButton = document.getElementById("confirmScenarioBtn");
  const enrichButton = document.getElementById("enrichScenarioBtn");
  const finalizeButton = document.getElementById("finalizeScenarioBtn");
  const addAssumptionButton = document.getElementById("addAssumptionBtn");
  const skipAllButton = document.getElementById("skipAllQuestionsBtn");
  if (!s) {
    document.getElementById("questionList").innerHTML = emptyState("Generate a scenario to receive clarification questions.");
    document.getElementById("assumptionList").innerHTML = emptyState("Generated assumptions will appear here.");
    document.getElementById("historicalEvents").innerHTML = emptyState("Historical analogues will appear after generation or web enrichment.");
    document.getElementById("shockTable").innerHTML = tableEmpty("Generated market shocks will appear here.", 7);
    document.getElementById("researchStatus").textContent = "Waiting for scenario";
    confirmButton.disabled = true;
    confirmButton.textContent = "Confirm Scenario & Run Stress";
    enrichButton.disabled = true;
    finalizeButton.disabled = true;
    addAssumptionButton.disabled = true;
    skipAllButton.disabled = true;
    return;
  }
  confirmButton.disabled = !state.scenarioFinalized;
  confirmButton.textContent = state.scenarioConfirmed ? "Re-run Confirmed Scenario" : "Confirm Scenario & Run Stress";
  enrichButton.disabled = false;
  finalizeButton.disabled = false;
  finalizeButton.textContent = state.scenarioFinalized ? "Regenerate Final Shocks" : "Validate Answers & Generate Shocks";
  addAssumptionButton.disabled = false;
  skipAllButton.disabled = false;
  document.getElementById("questionList").innerHTML = s.questions.map((q, i) => `<li class="question-item ${q.skipped ? "muted-row" : ""}"><div><strong>${q.text}</strong><textarea data-question-answer="${i}" placeholder="Answer, constraint, desk guidance, or leave blank">${q.answer || ""}</textarea></div><button data-question-skip="${i}">${q.skipped ? "Unskip" : "Skip"}</button></li>`).join("");
  document.querySelectorAll("[data-question-answer]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const item = s.questions[Number(event.target.dataset.questionAnswer)];
      item.answer = event.target.value;
      item.skipped = false;
      invalidateFinalScenario();
      renderAll();
    });
  });
  document.querySelectorAll("[data-question-skip]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const item = s.questions[Number(event.target.dataset.questionSkip)];
      item.skipped = !item.skipped;
      if (item.skipped) item.answer = "";
      invalidateFinalScenario();
      renderScenario();
    });
  });
  document.getElementById("assumptionList").innerHTML = `<div class="assumption assumption-header"><span>Assumption</span><span>Input type</span><span>Recorded value</span><span>Source</span><span></span></div>${s.assumptions.map((a, i) => `<div class="assumption"><input data-assumption-text="${i}" value="${a.text || ""}" placeholder="Assumption" aria-label="Assumption text" /><select data-assumption-type="${i}" aria-label="Assumption input type"><option value="text" ${a.type === "text" ? "selected" : ""}>Text</option><option value="yes_no" ${a.type === "yes_no" ? "selected" : ""}>Boolean</option><option value="value" ${a.type === "value" ? "selected" : ""}>Level</option></select>${assumptionValueControl(a, i)}<span><span class="pill">${a.owner}</span> ${Math.round(a.confidence * 100)}%</span><button data-assumption-remove="${i}">Remove</button></div>`).join("")}`;
  document.querySelectorAll("[data-assumption-text]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const item = s.assumptions[Number(event.target.dataset.assumptionText)];
      item.text = event.target.value;
      item.owner = "User edited";
      invalidateFinalScenario();
      renderScenario();
      rerunIfConfirmed();
    });
  });
  document.querySelectorAll("[data-assumption-type]").forEach((select) => {
    select.addEventListener("change", (event) => {
      const item = s.assumptions[Number(event.target.dataset.assumptionType)];
      item.type = event.target.value;
      item.value = item.type === "yes_no" ? "Yes" : "";
      item.owner = "User edited";
      invalidateFinalScenario();
      renderScenario();
    });
  });
  document.querySelectorAll("[data-assumption-value]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const item = s.assumptions[Number(event.target.dataset.assumptionValue)];
      item.value = event.target.value;
      item.owner = "User edited";
      invalidateFinalScenario();
      renderScenario();
    });
  });
  document.querySelectorAll("[data-assumption-remove]").forEach((button) => {
    button.addEventListener("click", (event) => {
      s.assumptions.splice(Number(event.target.dataset.assumptionRemove), 1);
      invalidateFinalScenario();
      renderScenario();
    });
  });
  document.getElementById("historicalEvents").innerHTML = s.events.map((e) => `<article class="event-card"><h4>${e.name}</h4><p><strong>Markets:</strong> ${e.markets}</p><p><strong>Duration:</strong> ${e.duration}</p><p>${e.reaction}</p><p><strong>Lesson:</strong> ${e.lesson}</p><span class="pill">${Math.round(e.confidence * 100)}% confidence</span></article>`).join("");
  if (state.webResearch?.historical_analogues?.length) {
    const liveCards = state.webResearch.historical_analogues.map((e) => `<article class="event-card"><h4>${e.event}</h4><p><strong>Date:</strong> ${e.date_range}</p><p><strong>Markets:</strong> ${Array.isArray(e.markets) ? e.markets.join(", ") : e.markets}</p><p>${e.reaction}</p><p><strong>Lesson:</strong> ${e.lesson}</p><span class="pill">Web enriched ${Math.round((e.confidence || 0.7) * 100)}%</span></article>`).join("");
    document.getElementById("historicalEvents").innerHTML = liveCards + document.getElementById("historicalEvents").innerHTML;
  }
  if (!state.scenarioFinalized) {
    document.getElementById("shockTable").innerHTML = tableEmpty("Answer or skip clarification questions, then validate answers to generate final shocks.", 7);
    return;
  }
  document.getElementById("shockTable").innerHTML = s.shocks.map((shock, i) => {
    const diff = shock.userValue - shock.aiValue;
    return `<tr><td><strong>${shock.factor}</strong><br><span class="pill">${shock.analogue}</span></td><td>${pct(shock.aiValue)}</td><td><input class="shock-input" data-shock="${i}" type="number" step="0.1" value="${shock.userValue.toFixed(1)}" />%</td><td class="${diff ? "override-cell" : ""}">${pct(diff)}</td><td>${Math.round(shock.confidence * 100)}%</td><td>${shock.reason}<br><span class="pill">${shock.propagation}</span></td><td>${diff ? `${shock.overrideUser}<br>${shock.overrideTime}<br>${shock.overrideReason || "Manual override"}` : "None"}</td></tr>`;
  }).join("");
  document.querySelectorAll("[data-shock]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const shock = s.shocks[Number(event.target.dataset.shock)];
      shock.userValue = Number(event.target.value);
      shock.overrideTime = new Date().toISOString().slice(0, 19).replace("T", " ");
      shock.overrideReason = "Desk risk review";
      renderScenario();
      rerunIfConfirmed();
      renderAll();
    });
  });
}

function assumptionValueControl(assumption, index) {
  if (assumption.type === "yes_no") {
    return `<select data-assumption-value="${index}" aria-label="Assumption recorded value"><option ${assumption.value === "Yes" ? "selected" : ""}>Yes</option><option ${assumption.value === "No" ? "selected" : ""}>No</option></select>`;
  }
  if (assumption.type === "value") {
    return `<input data-assumption-value="${index}" value="${assumption.value || ""}" placeholder="Value / level / threshold" aria-label="Assumption recorded value" />`;
  }
  return `<input data-assumption-value="${index}" value="${assumption.value || ""}" placeholder="Optional note" aria-label="Assumption recorded value" />`;
}

function emptyState(message) {
  return `<div class="empty-state">${message}</div>`;
}

function tableEmpty(message, colspan) {
  return `<tr><td colspan="${colspan}"><div class="empty-state">${message}</div></td></tr>`;
}

function shockForFactor(factor) {
  const shock = state.activeScenario?.shocks.find((s) => s.factor === factor);
  return shock ? shock.userValue / 100 : 0;
}

function runStress() {
  if (!state.activeScenario || !state.scenarioConfirmed) return;
  const rows = state.trades.map((trade) => {
    const multiplier = 0.55 + trade.riskFactors.length * 0.28;
    const factorContributions = trade.riskFactors.map((factor) => ({
      factor,
      pnl: trade.delta * shockForFactor(factor) * multiplier
    }));
    const pnl = factorContributions.reduce((sum, item) => sum + item.pnl, 0);
    return { trade, pnl };
  });
  const total = rows.reduce((s, r) => s + r.pnl, 0);
  state.impacts = { rows, total };
}

function confirmScenario() {
  if (!state.activeScenario || !state.scenarioFinalized) return;
  const button = document.getElementById("confirmScenarioBtn");
  const previousText = button.textContent;
  button.disabled = true;
  button.classList.add("loading");
  button.textContent = "Running Stress...";
  state.scenarioConfirmed = true;
  runStress();
  window.setTimeout(() => {
    button.classList.remove("loading");
    button.disabled = false;
    button.textContent = previousText;
    setView("impact");
  }, 350);
}

function rerunIfConfirmed() {
  if (!state.scenarioConfirmed) {
    state.impacts = null;
    return;
  }
  runStress();
}

function invalidateFinalScenario() {
  if (!state.scenarioFinalized) return;
  state.scenarioFinalized = false;
  state.scenarioConfirmed = false;
  state.impacts = null;
  document.getElementById("researchStatus").textContent = "Answers changed. Regenerate final shocks before confirming.";
}

function renderImpact() {
  if (!state.scenarioConfirmed || !state.impacts) {
    document.getElementById("impactKpis").innerHTML = "";
    document.getElementById("activeScenarioLabel").textContent = "No confirmed scenario";
    document.getElementById("stressBars").innerHTML = emptyState("Confirm a scenario to run the stress simulation.");
    document.getElementById("riskHeatmap").innerHTML = emptyState("Risk factor heatmap will appear after scenario confirmation.");
    document.getElementById("factorAttributionTable").innerHTML = tableEmpty("Risk factor attribution will appear after simulation.", 4);
    document.getElementById("traderImpactTable").innerHTML = tableEmpty("Trader impact will appear after simulation.", 4);
    document.getElementById("worstPositions").innerHTML = tableEmpty("Worst positions will appear after simulation.", 7);
    return;
  }
  const total = state.impacts?.total || 0;
  const worst = [...state.impacts.rows].sort((a, b) => a.pnl - b.pnl).slice(0, 25);
  const portfolioMtm = state.trades.reduce((sum, trade) => sum + trade.mtm, 0);
  const factorRows = factorAttribution().sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  const traderRows = impactByTrader().sort((a, b) => a.pnl - b.pnl).slice(0, 12);
  document.getElementById("activeScenarioLabel").textContent = state.activeScenario?.name || "No scenario";
  document.getElementById("impactKpis").innerHTML = [
    ["Portfolio Stress PnL", money(total), "Sensitivity engine output"],
    ["Stress / MTM", `${((total / Math.max(Math.abs(portfolioMtm), 1)) * 100).toFixed(2)}%`, "Impact relative to current MTM"],
    ["Worst Desk", worstDesk(), "Largest loss contribution"],
    ["Worst Trade", worst[0]?.trade.id || "-", worst[0] ? money(worst[0].pnl) : "-"],
    ["Shock Overrides", String(state.activeScenario?.shocks.filter((s) => Math.abs(s.userValue - s.aiValue) > 0.01).length || 0), "Tracked edits"]
  ].map(([label, value, sub]) => `<div class="kpi"><span>${label}</span><strong class="${String(value).includes("-") ? "negative" : ""}">${value}</strong><small>${sub}</small></div>`).join("");
  const deskRows = aggregate(state.impacts.rows, (r) => r.trade.desk, (r) => r.pnl).sort((a, b) => a.value - b.value);
  renderBars("stressBars", deskRows);
  document.getElementById("riskHeatmap").innerHTML = state.activeScenario.shocks.map((s) => {
    const intensity = Math.min(100, Math.abs(s.userValue) * 3);
    const color = s.userValue < 0 ? `rgba(180,35,24,${0.2 + intensity / 140})` : `rgba(15,118,110,${0.2 + intensity / 140})`;
    return `<div class="heat-cell"><strong>${s.factor}</strong><div class="heat-band" style="background:${color}"></div><span class="num">${pct(s.userValue)}</span></div>`;
  }).join("");
  document.getElementById("factorAttributionTable").innerHTML = factorRows.slice(0, 14).map((row) => `<tr><td><strong>${row.factor}</strong></td><td class="num">${pct((state.activeScenario.shocks.find((s) => s.factor === row.factor)?.userValue) || 0)}</td><td class="num ${row.pnl < 0 ? "negative" : "positive"}">${money(row.pnl)}</td><td class="num">${row.trades}</td></tr>`).join("");
  document.getElementById("traderImpactTable").innerHTML = traderRows.map((row) => `<tr><td>${row.trader}</td><td>${row.desk}</td><td class="num ${row.pnl < 0 ? "negative" : "positive"}">${money(row.pnl)}</td><td class="num">${row.trades}</td></tr>`).join("");
  document.getElementById("worstPositions").innerHTML = worst.map(({ trade, pnl }) => `<tr><td>${trade.id}</td><td>${trade.desk}</td><td>${trade.trader}</td><td>${trade.instrument}</td><td>${trade.riskFactors.join(", ")}</td><td class="num">${money(trade.mtm)}</td><td class="num negative">${money(pnl)}</td></tr>`).join("");
}

function factorAttribution() {
  if (!state.impacts) return [];
  const map = new Map();
  state.impacts.rows.forEach(({ trade }) => {
    const multiplier = 0.55 + trade.riskFactors.length * 0.28;
    trade.riskFactors.forEach((factor) => {
      const row = map.get(factor) || { factor, pnl: 0, trades: 0 };
      row.pnl += trade.delta * shockForFactor(factor) * multiplier;
      row.trades += 1;
      map.set(factor, row);
    });
  });
  return [...map.values()];
}

function impactByTrader() {
  if (!state.impacts) return [];
  const map = new Map();
  state.impacts.rows.forEach(({ trade, pnl }) => {
    const key = `${trade.trader}|${trade.desk}`;
    const row = map.get(key) || { trader: trade.trader, desk: trade.desk, pnl: 0, trades: 0 };
    row.pnl += pnl;
    row.trades += 1;
    map.set(key, row);
  });
  return [...map.values()];
}

function impactByDesk() {
  if (!state.impacts) return [];
  return aggregate(state.impacts.rows, (r) => r.trade.desk, (r) => r.pnl).map((row) => ({
    desk: row.name,
    pnl: row.value,
    trades: state.impacts.rows.filter((r) => r.trade.desk === row.name).length
  }));
}

function worstDesk() {
  if (!state.impacts) return "-";
  const rows = aggregate(state.impacts.rows, (r) => r.trade.desk, (r) => r.pnl).sort((a, b) => a.value - b.value);
  return rows[0]?.name || "-";
}

function avgConfidence() {
  if (!state.activeScenario) return 0;
  return state.activeScenario.shocks.reduce((s, x) => s + x.confidence, 0) / state.activeScenario.shocks.length;
}

function scenarioVariant(label, multiplier) {
  if (!state.scenarioConfirmed || !state.activeScenario) return null;
  const base = JSON.parse(JSON.stringify(state.activeScenario || mockLLMGenerate(document.getElementById("scenarioPrompt").value, label, document.getElementById("horizonSelect").value)));
  base.name = `${label} ${base.name.replace(/^(Base|Moderate|Severe|Extreme)\s+/i, "")}`;
  base.severity = label;
  base.shocks.forEach((s) => {
    s.userValue = s.aiValue * multiplier;
  });
  const saved = state.activeScenario;
  state.activeScenario = base;
  state.scenarioConfirmed = true;
  runStress();
  const total = state.impacts.total;
  const byCommodity = aggregate(state.impacts.rows, (r) => r.trade.commodity, (r) => r.pnl);
  const deskRows = impactByDesk().sort((a, b) => a.pnl - b.pnl);
  const factorRows = factorAttribution().sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
  state.activeScenario = saved;
  state.scenarioConfirmed = true;
  runStress();
  return {
    name: label,
    total,
    byCommodity,
    worstDesk: deskRows[0]?.desk || "-",
    driver: factorRows[0]?.factor || base.shocks.sort((a, b) => Math.abs(b.userValue) - Math.abs(a.userValue))[0].factor
  };
}

function renderCompare() {
  if (!state.scenarioConfirmed || !state.impacts) {
    document.getElementById("comparisonTable").innerHTML = tableEmpty("Confirm a scenario to compare Base, Moderate, Severe and Extreme variants.", 9);
    document.getElementById("comparisonHeatmap").innerHTML = emptyState("Desk comparison matrix will appear after simulation.");
    return;
  }
  const variants = [
    scenarioVariant("Base", 0),
    scenarioVariant("Moderate", 0.68),
    scenarioVariant("Severe", 1),
    scenarioVariant("Extreme", 1.45)
  ].filter(Boolean);
  document.getElementById("comparisonTable").innerHTML = variants.map((v) => {
    const get = (name) => v.byCommodity.find((x) => x.name === name)?.value || 0;
    const mtm = state.trades.reduce((sum, trade) => sum + trade.mtm, 0);
    return `<tr><td><strong>${v.name}</strong></td><td class="num ${v.total < 0 ? "negative" : "positive"}">${money(v.total)}</td><td class="num">${((v.total / Math.max(Math.abs(mtm), 1)) * 100).toFixed(2)}%</td><td class="num">${money(get("Crude"))}</td><td class="num">${money(get("Gas"))}</td><td class="num">${money(get("Power"))}</td><td class="num">${money(get("Freight"))}</td><td>${v.worstDesk}</td><td>${v.driver}</td></tr>`;
  }).join("");
  const desksMatrix = desks.map((d) => d.name);
  document.getElementById("comparisonHeatmap").innerHTML = desksMatrix.map((desk) => {
    const cells = variants.map((variant) => {
      const saved = state.activeScenario;
      const label = variant.name;
      const scenario = JSON.parse(JSON.stringify(saved || mockLLMGenerate("", "Severe", "1 month")));
      const multiplier = label === "Base" ? 0 : label === "Extreme" ? 1.45 : label === "Moderate" ? 0.68 : 1;
      scenario.shocks.forEach((s) => { s.userValue = s.aiValue * multiplier; });
      state.activeScenario = scenario;
      runStress();
      const value = state.impacts.rows.filter((r) => r.trade.desk === desk).reduce((sum, r) => sum + r.pnl, 0);
      state.activeScenario = saved;
      state.scenarioConfirmed = true;
      runStress();
      const shade = Math.min(0.9, Math.abs(value) / 6000000);
      const color = value < 0 ? `rgba(180,35,24,${0.15 + shade})` : `rgba(15,118,110,${0.15 + shade})`;
      return `<div class="matrix-cell"><span>${variant.name}</span><div class="heat-band" style="background:${color}"></div><span class="num">${money(value)}</span></div>`;
    }).join("");
    return `<div><strong>${desk}</strong>${cells}</div>`;
  }).join("");
}

function renderReport() {
  if (!state.scenarioConfirmed || !state.impacts) {
    document.getElementById("reportSummary").innerHTML = "";
    document.getElementById("reportScenarioText").textContent = "Confirm a scenario to generate the executive report.";
    document.getElementById("reportAssumptions").innerHTML = emptyState("Approved assumptions will appear here.");
    document.getElementById("reportShocks").innerHTML = emptyState("Approved shocks will appear here.");
    document.getElementById("reportDeskTrader").innerHTML = emptyState("Desk and trader impacts will appear after simulation.");
    document.getElementById("reportRisks").innerHTML = emptyState("Top risks will appear after simulation.");
    return;
  }
  const portfolioMtm = state.trades.reduce((sum, trade) => sum + trade.mtm, 0);
  const deskRows = impactByDesk().sort((a, b) => a.pnl - b.pnl).slice(0, 8);
  const traderRows = impactByTrader().sort((a, b) => a.pnl - b.pnl).slice(0, 8);
  const factorRows = factorAttribution().sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl)).slice(0, 10);
  document.getElementById("reportSummary").innerHTML = [
    ["Portfolio Stress PnL", money(state.impacts.total)],
    ["Stress / MTM", `${((state.impacts.total / Math.max(Math.abs(portfolioMtm), 1)) * 100).toFixed(2)}%`],
    ["Worst Desk", worstDesk()],
    ["Scenario", state.activeScenario?.name || "No scenario"],
    ["Avg Confidence", `${Math.round(avgConfidence() * 100)}%`]
  ].map(([k, v]) => `<div class="report-card"><span>${k}</span><strong>${v}</strong></div>`).join("");
  document.getElementById("reportScenarioText").textContent = state.activeScenario?.prompt || "";
  document.getElementById("reportAssumptions").innerHTML = `<table><thead><tr><th>Assumption</th><th>Type</th><th>Value</th><th>Owner</th><th class="num">Confidence</th></tr></thead><tbody>${state.activeScenario.assumptions.map((a) => `<tr><td>${a.text}</td><td>${a.type}</td><td>${a.value || "-"}</td><td>${a.owner}</td><td class="num">${Math.round(a.confidence * 100)}%</td></tr>`).join("")}</tbody></table>`;
  document.getElementById("reportShocks").innerHTML = `<table><thead><tr><th>Risk Factor</th><th class="num">Shock</th><th class="num">Stress PnL</th><th class="num">Confidence</th><th>Rationale</th></tr></thead><tbody>${state.activeScenario?.shocks.map((s) => {
    const factorPnl = factorRows.find((row) => row.factor === s.factor)?.pnl || factorAttribution().find((row) => row.factor === s.factor)?.pnl || 0;
    return `<tr><td>${s.factor}</td><td class="num">${pct(s.userValue)}</td><td class="num ${factorPnl < 0 ? "negative" : "positive"}">${money(factorPnl)}</td><td class="num">${Math.round(s.confidence * 100)}%</td><td>${s.reason}</td></tr>`;
  }).join("")}</tbody></table>`;
  document.getElementById("reportDeskTrader").innerHTML = `<div class="report-two-col"><div><h4>Desk Impact</h4><table><thead><tr><th>Desk</th><th class="num">Stress PnL</th><th class="num">Trades</th></tr></thead><tbody>${deskRows.map((row) => `<tr><td>${row.desk}</td><td class="num ${row.pnl < 0 ? "negative" : "positive"}">${money(row.pnl)}</td><td class="num">${row.trades}</td></tr>`).join("")}</tbody></table></div><div><h4>Trader Impact</h4><table><thead><tr><th>Trader</th><th>Desk</th><th class="num">Stress PnL</th></tr></thead><tbody>${traderRows.map((row) => `<tr><td>${row.trader}</td><td>${row.desk}</td><td class="num ${row.pnl < 0 ? "negative" : "positive"}">${money(row.pnl)}</td></tr>`).join("")}</tbody></table></div></div>`;
  document.getElementById("reportRisks").innerHTML = `<table><thead><tr><th>Trade</th><th>Desk</th><th>Instrument</th><th class="num">Stress PnL</th></tr></thead><tbody>${[...state.impacts.rows].sort((a, b) => a.pnl - b.pnl).slice(0, 10).map(({ trade, pnl }) => `<tr><td>${trade.id}</td><td>${trade.desk}</td><td>${trade.instrument}</td><td class="num negative">${money(pnl)}</td></tr>`).join("")}</tbody></table>`;
}

function renderAll() {
  renderDashboard();
  renderScenario();
  renderImpact();
  renderCompare();
  renderReport();
}

function setView(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach((el) => el.classList.toggle("active", el.dataset.view === view));
  document.getElementById(`${view}View`).classList.add("active");
  const titles = { dashboard: "Portfolio Dashboard", scenario: "AI Scenario Builder", impact: "Stress Impact", compare: "Scenario Comparison", report: "Executive Report" };
  document.getElementById("viewTitle").textContent = titles[view];
  renderAll();
}

function exportReport() {
  if (!state.scenarioConfirmed || !state.impacts) {
    window.alert("Confirm a scenario and run stress before exporting a report.");
    return;
  }
  const payload = {
    company,
    generatedAt: new Date().toISOString(),
    scenario: state.activeScenario,
    impact: {
      total: state.impacts.total,
      worstDesk: worstDesk(),
      worstPositions: [...state.impacts.rows].sort((a, b) => a.pnl - b.pnl).slice(0, 20).map((r) => ({ tradeId: r.trade.id, desk: r.trade.desk, instrument: r.trade.instrument, stressPnl: r.pnl }))
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scenario-workbench-report.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function enrichScenarioWithWeb() {
  const button = document.getElementById("enrichScenarioBtn");
  const status = document.getElementById("researchStatus");
  const previousText = button.textContent;
  button.disabled = true;
  button.classList.add("loading");
  button.textContent = "Researching...";
  status.textContent = "Calling OpenRouter web search...";
  try {
    const response = await fetch("/api/research-scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario: document.getElementById("scenarioPrompt").value,
        severity: document.getElementById("severitySelect").value,
        horizon: document.getElementById("horizonSelect").value
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "OpenRouter research failed");
    state.webResearch = payload.research;
    status.textContent = `Web enriched via ${payload.model}`;
    renderScenario();
  } catch (error) {
    status.textContent = `Web enrichment unavailable: ${error.message}`;
  } finally {
    button.disabled = false;
    button.classList.remove("loading");
    button.textContent = previousText;
  }
}

async function generateScenarioFromLLM() {
  const button = document.getElementById("generateScenarioBtn");
  const status = document.getElementById("researchStatus");
  const prompt = document.getElementById("scenarioPrompt").value.trim();
  const severity = document.getElementById("severitySelect").value;
  const horizon = document.getElementById("horizonSelect").value;
  if (!prompt) {
    status.textContent = "Enter a scenario first.";
    return;
  }
  button.disabled = true;
  button.classList.add("loading");
  button.textContent = "Generating...";
  status.textContent = "Generating scenario with OpenRouter...";
  let finalStatus = "";
  try {
    const response = await fetch("/api/generate-scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario: prompt, severity, horizon, mode: "draft" })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Scenario generation failed");
    state.activeScenario = normalizeScenario(payload.scenario, prompt, severity, horizon);
    state.activeScenario.shocks = [];
    state.scenarioFinalized = false;
    state.scenarioConfirmed = false;
    state.impacts = null;
    state.webResearch = null;
    finalStatus = `Scenario generated via ${payload.model}`;
  } catch (error) {
    finalStatus = `Scenario generation failed: ${error.message}`;
  } finally {
    renderAll();
    if (finalStatus) status.textContent = finalStatus;
    button.disabled = false;
    button.classList.remove("loading");
    button.textContent = "Generate Draft Questions";
  }
}

async function finalizeScenarioFromAnswers() {
  if (!state.activeScenario) return;
  const button = document.getElementById("finalizeScenarioBtn");
  const status = document.getElementById("researchStatus");
  const prompt = document.getElementById("scenarioPrompt").value.trim();
  const severity = document.getElementById("severitySelect").value;
  const horizon = document.getElementById("horizonSelect").value;
  button.disabled = true;
  button.classList.add("loading");
  button.textContent = "Generating Shocks...";
  status.textContent = "Validating answers and generating final shocks...";
  let finalStatus = "";
  try {
    const response = await fetch("/api/generate-scenario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scenario: prompt,
        severity,
        horizon,
        mode: "finalize",
        question_answers: state.activeScenario.questions.map((question) => ({
          question: question.text,
          answer: question.answer,
          skipped: question.skipped
        })),
        assumptions: state.activeScenario.assumptions
      })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Final shock generation failed");
    const finalized = normalizeScenario(payload.scenario, prompt, severity, horizon);
    finalized.questions = state.activeScenario.questions;
    state.activeScenario = finalized;
    state.scenarioFinalized = true;
    state.scenarioConfirmed = false;
    state.impacts = null;
    finalStatus = `Final shocks generated via ${payload.model}`;
  } catch (error) {
    finalStatus = `Final shock generation failed: ${error.message}`;
  } finally {
    renderAll();
    if (finalStatus) status.textContent = finalStatus;
    button.disabled = false;
    button.classList.remove("loading");
    button.textContent = state.scenarioFinalized ? "Regenerate Final Shocks" : "Validate Answers & Generate Shocks";
  }
}

function init() {
  generateTrades();
  document.getElementById("deskFilter").innerHTML = `<option value="">All desks</option>${desks.map((d) => `<option>${d.name}</option>`).join("")}`;
  document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  document.getElementById("globalSearch").addEventListener("input", renderAll);
  document.getElementById("deskFilter").addEventListener("change", renderAll);
  document.getElementById("generateScenarioBtn").addEventListener("click", generateScenarioFromLLM);
  document.getElementById("finalizeScenarioBtn").addEventListener("click", finalizeScenarioFromAnswers);
  document.getElementById("enrichScenarioBtn").addEventListener("click", enrichScenarioWithWeb);
  document.getElementById("confirmScenarioBtn").addEventListener("click", confirmScenario);
  document.getElementById("skipAllQuestionsBtn").addEventListener("click", () => {
    if (!state.activeScenario) return;
    state.activeScenario.questions.forEach((question) => {
      question.skipped = true;
      question.answer = "";
    });
    invalidateFinalScenario();
    renderScenario();
  });
  document.getElementById("addAssumptionBtn").addEventListener("click", () => {
    if (!state.activeScenario) return;
    state.activeScenario.assumptions.push({ text: "", type: "text", value: "", owner: "User", confidence: 1 });
    invalidateFinalScenario();
    renderScenario();
  });
  document.getElementById("exportReportBtn").addEventListener("click", exportReport);
  renderAll();
}

init();
