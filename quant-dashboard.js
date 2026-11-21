let quantData = null;

document.addEventListener("DOMContentLoaded", () => {
    loadQuantData();

    document.getElementById("search-input").addEventListener("keyup", filterSignalsTable);
    document.getElementById("close-btn-trigger").addEventListener("click", () => {
        document.getElementById("details-panel").style.display = "none";
    });
    document.getElementById("download-json-btn").addEventListener("click", downloadJsonFile);
});

async function loadQuantData() {
    try {
        const response = await fetch("quant_data.json");
        if (!response.ok) throw new Error("HTTP error");
        quantData = await response.json();
    } catch (error) {
        console.warn("Chargement via fetch bloqué (mode fichier local), utilisation du fallback JSON.");
        quantData = FALLBACK_DATA;
    }
    renderAll();
}

function renderAll() {
    renderTicker();
    renderPortfolioKPIs();
    renderPerfTable();
    renderSignalsTable(quantData.assets);
    renderRiskTable();
    renderCorrelationMatrix();
}

function renderTicker() {
    const tickerContainer = document.getElementById("ticker-content");
    tickerContainer.innerHTML = "";

    quantData.assets.forEach(asset => {
        const isPos = asset.momentum_20d >= 0;
        const arrow = isPos ? "▲" : "▼";
        const cls = isPos ? "positive" : "negative";
        const span = document.createElement("span");
        span.className = "ticker-item";
        span.innerHTML = `<span class="${cls}">${asset.ticker} $${asset.price.toFixed(2)} (${arrow} ${asset.momentum_20d > 0 ? "+" : ""}${asset.momentum_20d.toFixed(2)}%)</span>`;
        tickerContainer.appendChild(span);
    });
}

function renderPortfolioKPIs() {
    const p = quantData.optimal_portfolio;
    const container = document.getElementById("portfolio-kpis");
    container.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-label">EXPECTED ANNUAL RETURN</div>
            <div class="kpi-value positive">+${p.expected_return.toFixed(2)}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">PORTFOLIO VOLATILITY</div>
            <div class="kpi-value">${p.volatility.toFixed(2)}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">MAX SHARPE RATIO</div>
            <div class="kpi-value positive">${p.sharpe_ratio.toFixed(2)}</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">PORTFOLIO VaR (95% 1D)</div>
            <div class="kpi-value negative">${p.var_95.toFixed(2)}%</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-label">PORTFOLIO CVaR (95% 1D)</div>
            <div class="kpi-value negative">${p.cvar_95.toFixed(2)}%</div>
        </div>
    `;
}

function renderPerfTable() {
    const tbody = document.getElementById("perf-table-body");
    tbody.innerHTML = "";

    quantData.assets.forEach(asset => {
        const retCls = asset.annual_return >= 0 ? "positive" : "negative";
        const ratio = (asset.annual_return / asset.annual_volatility).toFixed(2);
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${asset.ticker}</strong></td>
            <td>${asset.name}</td>
            <td class="${retCls}">${asset.annual_return > 0 ? "+" : ""}${asset.annual_return.toFixed(2)}%</td>
            <td>${asset.annual_volatility.toFixed(2)}%</td>
            <td>${ratio}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderSignalsTable(assetsList) {
    const tbody = document.getElementById("signals-table-body");
    tbody.innerHTML = "";

    assetsList.forEach(asset => {
        const momCls = asset.momentum_20d >= 0 ? "positive" : "negative";
        let sigCls = "neutral";
        if (asset.signal === "HAUSSIER") sigCls = "positive";
        if (asset.signal === "BAISSIER") sigCls = "negative";

        const row = document.createElement("tr");
        row.className = "clickable-row";
        row.onclick = () => showAssetDetails(asset);
        row.innerHTML = `
            <td><strong>${asset.ticker}</strong></td>
            <td>${asset.price.toFixed(2)}</td>
            <td>${asset.sma_50.toFixed(2)}</td>
            <td class="${momCls}">${asset.momentum_20d > 0 ? "+" : ""}${asset.momentum_20d.toFixed(2)}%</td>
            <td><strong>${asset.optimal_weight.toFixed(2)}%</strong></td>
            <td class="${sigCls}">[${asset.signal}]</td>
        `;
        tbody.appendChild(row);
    });
}

function filterSignalsTable() {
    const query = document.getElementById("search-input").value.toLowerCase();
    const filtered = quantData.assets.filter(a =>
        a.ticker.toLowerCase().includes(query) ||
        a.name.toLowerCase().includes(query) ||
        a.signal.toLowerCase().includes(query)
    );
    renderSignalsTable(filtered);
}

function showAssetDetails(asset) {
    const panel = document.getElementById("details-panel");
    const sigCls = asset.signal === "HAUSSIER" ? "positive" : (asset.signal === "BAISSIER" ? "negative" : "neutral");

    document.getElementById("detail-title").innerHTML =
        `DEEP QUANT DIAGNOSTIC : ${asset.name} (${asset.ticker}) <span class="${sigCls}">[${asset.signal}]</span>`;

    document.getElementById("detail-metrics").innerHTML =
        `&gt; <strong>MARKOWITZ ALLOCATION :</strong> ${asset.optimal_weight.toFixed(2)}% | ` +
        `<strong>SORTINO :</strong> ${asset.sortino.toFixed(2)} | ` +
        `<strong>MAX DD :</strong> ${asset.max_drawdown.toFixed(2)}%`;

    document.getElementById("detail-summary").innerHTML =
        `&gt; <strong>TECHNICAL &amp; RISK BREAKDOWN :</strong><br>` +
        `• Current Spot Price (${asset.price.toFixed(2)}) is trading <strong>${asset.price > asset.sma_50 ? "ABOVE" : "BELOW"}</strong> its 50-Day Moving Average (${asset.sma_50.toFixed(2)}).<br>` +
        `• 20-Day Rolling Momentum stands at <strong>${asset.momentum_20d > 0 ? "+" : ""}${asset.momentum_20d.toFixed(2)}%</strong>.<br>` +
        `• Daily 95% Value at Risk (VaR) is <strong>${asset.var_95.toFixed(2)}%</strong>, with a Conditional VaR (Expected Shortfall) of <strong>${asset.cvar_95.toFixed(2)}%</strong> during tail-risk events.`;

    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth" });
}

function renderRiskTable() {
    const tbody = document.getElementById("risk-table-body");
    tbody.innerHTML = "";

    quantData.assets.forEach(asset => {
        const sortinoCls = asset.sortino >= 1 ? "positive" : (asset.sortino < 0 ? "negative" : "neutral");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><strong>${asset.ticker}</strong></td>
            <td class="negative">${asset.max_drawdown.toFixed(2)}%</td>
            <td class="${sortinoCls}">${asset.sortino.toFixed(2)}</td>
            <td class="negative">${asset.var_95.toFixed(2)}%</td>
            <td class="negative">${asset.cvar_95.toFixed(2)}%</td>
        `;
        tbody.appendChild(row);
    });
}

function renderCorrelationMatrix() {
    const table = document.getElementById("corr-table");
    const tickers = quantData.assets.map(a => a.ticker);
    const matrix = quantData.correlation_matrix;

    let html = "<thead><tr><th>ASSET</th>" + tickers.map(t => `<th>${t}</th>`).join("") + "</tr></thead><tbody>";

    tickers.forEach(rowTicker => {
        html += `<tr><th>${rowTicker}</th>`;
        tickers.forEach(colTicker => {
            const val = matrix[rowTicker][colTicker];
            let style = "";
            if (rowTicker === colTicker) {
                style = "background-color: rgba(0, 255, 65, 0.25); font-weight: bold;";
            } else if (val >= 0.4) {
                style = "color: #ff6666;";
            } else if (val <= -0.15) {
                style = "color: #00ffff;";
            }
            html += `<td style="${style}">${val.toFixed(2)}</td>`;
        });
        html += "</tr>";
    });

    html += "</tbody>";
    table.innerHTML = html;
}

function downloadJsonFile() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(quantData, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "quant_data.json");
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

// Données de secours si ouverture directe en local (file://)
const FALLBACK_DATA = {
    "optimal_portfolio": {
        "expected_return": 24.93,
        "volatility": 12.79,
        "sharpe_ratio": 1.72,
        "var_95": -1.24,
        "cvar_95": -1.85
    },
    "assets": [
        { "ticker": "AAPL", "name": "Apple Inc.", "price": 265.33, "sma_50": 338.79, "momentum_20d": 3.81, "annual_return": 30.84, "annual_volatility": 24.87, "optimal_weight": 25.42, "signal": "NEUTRE", "max_drawdown": -18.40, "sortino": 1.65, "var_95": -2.15, "cvar_95": -3.10 },
        { "ticker": "MSFT", "name": "Microsoft Corp.", "price": 475.41, "sma_50": 519.00, "momentum_20d": -0.98, "annual_return": 9.28, "annual_volatility": 34.22, "optimal_weight": 7.64, "signal": "BAISSIER", "max_drawdown": -24.12, "sortino": 0.42, "var_95": -2.85, "cvar_95": -4.12 },
        { "ticker": "NVDA", "name": "NVIDIA Corp.", "price": 198.50, "sma_50": 214.63, "momentum_20d": -23.95, "annual_return": -8.03, "annual_volatility": 38.90, "optimal_weight": 1.35, "signal": "BAISSIER", "max_drawdown": -36.50, "sortino": -0.28, "var_95": -3.90, "cvar_95": -5.45 },
        { "ticker": "ASML", "name": "ASML Holding", "price": 1540.20, "sma_50": 1658.87, "momentum_20d": -8.80, "annual_return": 52.98, "annual_volatility": 49.08, "optimal_weight": 7.73, "signal": "BAISSIER", "max_drawdown": -31.80, "sortino": 1.48, "var_95": -4.10, "cvar_95": -5.80 },
        { "ticker": "AMZN", "name": "Amazon.com Inc.", "price": 260.10, "sma_50": 254.81, "momentum_20d": 6.66, "annual_return": 18.75, "annual_volatility": 34.21, "optimal_weight": 9.60, "signal": "HAUSSIER", "max_drawdown": -22.60, "sortino": 0.89, "var_95": -2.95, "cvar_95": -4.20 },
        { "ticker": "TSLA", "name": "Tesla Inc.", "price": 385.00, "sma_50": 374.74, "momentum_20d": 10.01, "annual_return": 7.06, "annual_volatility": 46.06, "optimal_weight": 0.31, "signal": "HAUSSIER", "max_drawdown": -44.20, "sortino": 0.21, "var_95": -4.35, "cvar_95": -6.15 },
        { "ticker": "MC.PA", "name": "LVMH Moët Hennessy", "price": 399.50, "sma_50": 397.34, "momentum_20d": 1.62, "annual_return": -40.13, "annual_volatility": 27.91, "optimal_weight": 4.94, "signal": "HAUSSIER", "max_drawdown": -45.10, "sortino": -1.55, "var_95": -2.60, "cvar_95": -3.75 },
        { "ticker": "MCD", "name": "McDonald's Corp.", "price": 262.40, "sma_50": 250.25, "momentum_20d": 11.94, "annual_return": -7.59, "annual_volatility": 20.99, "optimal_weight": 3.88, "signal": "HAUSSIER", "max_drawdown": -19.30, "sortino": -0.45, "var_95": -1.85, "cvar_95": -2.65 },
        { "ticker": "KO", "name": "Coca-Cola Co.", "price": 93.10, "sma_50": 90.76, "momentum_20d": 5.70, "annual_return": 38.43, "annual_volatility": 18.99, "optimal_weight": 28.43, "signal": "HAUSSIER", "max_drawdown": -11.40, "sortino": 2.45, "var_95": -1.45, "cvar_95": -2.05 },
        { "ticker": "JPM", "name": "JPMorgan Chase", "price": 342.80, "sma_50": 339.70, "momentum_20d": 1.90, "annual_return": 17.95, "annual_volatility": 22.87, "optimal_weight": 10.70, "signal": "HAUSSIER", "max_drawdown": -16.80, "sortino": 1.12, "var_95": -1.95, "cvar_95": -2.80 }
    ],
    "correlation_matrix": {
        "AAPL":  { "AAPL": 1.00, "MSFT": 0.15, "NVDA": 0.06, "ASML": 0.07, "AMZN": 0.08, "TSLA": 0.14, "MC.PA": 0.25, "MCD": 0.22, "KO": 0.16, "JPM": 0.21 },
        "MSFT":  { "AAPL": 0.15, "MSFT": 1.00, "NVDA": 0.22, "ASML": 0.00, "AMZN": 0.44, "TSLA": 0.21, "MC.PA": 0.16, "MCD": 0.08, "KO": -0.13, "JPM": 0.11 },
        "NVDA":  { "AAPL": 0.06, "MSFT": 0.22, "NVDA": 1.00, "ASML": 0.54, "AMZN": 0.21, "TSLA": 0.42, "MC.PA": 0.02, "MCD": -0.28, "KO": -0.30, "JPM": 0.12 },
        "ASML":  { "AAPL": 0.07, "MSFT": 0.00, "NVDA": 0.54, "ASML": 1.00, "AMZN": 0.20, "TSLA": 0.45, "MC.PA": 0.08, "MCD": -0.21, "KO": -0.30, "JPM": 0.23 },
        "AMZN":  { "AAPL": 0.08, "MSFT": 0.44, "NVDA": 0.21, "ASML": 0.20, "AMZN": 1.00, "TSLA": 0.31, "MC.PA": 0.30, "MCD": 0.09, "KO": -0.12, "JPM": 0.18 },
        "TSLA":  { "AAPL": 0.14, "MSFT": 0.21, "NVDA": 0.42, "ASML": 0.45, "AMZN": 0.31, "TSLA": 1.00, "MC.PA": 0.08, "MCD": -0.13, "KO": -0.18, "JPM": 0.13 },
        "MC.PA": { "AAPL": 0.25, "MSFT": 0.16, "NVDA": 0.02, "ASML": 0.08, "AMZN": 0.30, "TSLA": 0.08, "MC.PA": 1.00, "MCD": 0.29, "KO": 0.20, "JPM": 0.20 },
        "MCD":   { "AAPL": 0.22, "MSFT": 0.08, "NVDA": -0.28, "ASML": -0.21, "AMZN": 0.09, "TSLA": -0.13, "MC.PA": 0.29, "MCD": 1.00, "KO": 0.51, "JPM": 0.16 },
        "KO":    { "AAPL": 0.16, "MSFT": -0.13, "NVDA": -0.30, "ASML": -0.30, "AMZN": -0.12, "TSLA": -0.18, "MC.PA": 0.20, "MCD": 0.51, "KO": 1.00, "JPM": -0.04 },
        "JPM":   { "AAPL": 0.21, "MSFT": 0.11, "NVDA": 0.12, "ASML": 0.23, "AMZN": 0.18, "TSLA": 0.13, "MC.PA": 0.20, "MCD": 0.16, "KO": -0.04, "JPM": 1.00 }
    }
};