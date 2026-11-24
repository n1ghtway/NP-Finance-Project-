/* ============================================================================
   FINANCIAL SYSTEM TERMINAL // STOCK PORTFOLIO SCRIPT
   File: stock-portfolio.js
   ============================================================================ */

// 1. CONFIGURATION API (Remplace par ta clé Finnhub)
const API_KEY = "dbrobt9r01qvp4ie2qhgdbrobt9r01qvp4ie2qi0"; 

let companiesData = [];

// TYPEWRITER ANIMATION EFFECT
function typeWriterEffect(elementId, text, speed = 40, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = "";
    let i = 0;

    function type() {
        if (i < text.length) {
            el.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (callback) {
            callback();
        }
    }
    type();
}

// LOAD DATA FROM QUANT_DATA.JSON WITH OFFLINE FALLBACK
async function loadQuantDataFeed() {
    try {
        const response = await fetch("quant_data.json");
        if (!response.ok) throw new Error("HTTP error");
        const data = await response.json();
        
        if (data && data.assets) {
            // Fusionne les données JSON avec les descriptions qualitatives de secours
            companiesData = FALLBACK_COMPANIES_DATA.map(fallbackComp => {
                const jsonMatch = data.assets.find(a => a.ticker === fallbackComp.ticker);
                if (jsonMatch) {
                    const currency = jsonMatch.ticker === "MC.PA" ? "€" : "$";
                    return {
                        ...fallbackComp,
                        price: `${currency}${jsonMatch.price.toFixed(2)}`,
                        change: `${jsonMatch.momentum_20d >= 0 ? "+" : ""}${jsonMatch.momentum_20d.toFixed(2)}%`,
                        isPositive: jsonMatch.momentum_20d >= 0,
                        netMarginNum: jsonMatch.annual_return
                    };
                }
                return fallbackComp;
            });
        } else {
            companiesData = FALLBACK_COMPANIES_DATA;
        }
    } catch (error) {
        console.warn("Chargement via fetch bloqué (mode fichier local ou hors-ligne), utilisation des données de secours.");
        companiesData = FALLBACK_COMPANIES_DATA;
    }
}

// LIVE STOCK PRICES FETCHING (Finnhub)
async function fetchLiveStockPrices() {
    if (API_KEY === "dbrobt9r01qvp4ie2qhgdbrobt9r01qvp4ie2qi0" || !API_KEY) return;

    const requests = companiesData.map(async (company) => {
        try {
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${company.ticker}&token=${API_KEY}`);
            if (!response.ok) return;

            const data = await response.json();
            if (data && data.c && data.c > 0) {
                const currency = company.price.startsWith("€") ? "€" : "$";
                company.price = `${currency}${data.c.toFixed(2)}`;
                
                const sign = data.dp >= 0 ? "+" : "";
                company.change = `${sign}${data.dp.toFixed(2)}%`;
                company.isPositive = data.dp >= 0;
            }
        } catch (error) {
            // Ignoré en cas de coupure réseau
        }
    });

    await Promise.all(requests);
}

// 1. RENDER LIVE TICKER TAPE
function renderTickerTape() {
    const tapeEl = document.getElementById("ticker-tape");
    if (!tapeEl) return;
    const itemsHtml = companiesData.map(c => {
        const cls = c.isPositive ? "ticker-pos" : "ticker-neg";
        return `<span class="ticker-item">[${c.ticker}] ${c.price} <span class="${cls}">(${c.change})</span></span>`;
    }).join("");
    tapeEl.innerHTML = itemsHtml + itemsHtml;
}

// 2. RENDER SCOPE TABLE
function renderScopeTable() {
    const tbody = document.getElementById("scope-table-body");
    if (!tbody) return;
    
    tbody.innerHTML = companiesData.map(c => {
        const priceCls = c.isPositive ? "ticker-pos" : "ticker-neg";
        return `
            <tr class="clickable-row" onclick="jumpToProfile('${c.id}')">
                <td>${c.id}</td>
                <td><strong>${c.shortName}</strong></td>
                <td>${c.ticker}</td>
                <td>${c.sector}</td>
                <td>${c.dominantModel}</td>
                <td><span class="${priceCls}">${c.price} (${c.change})</span></td>
            </tr>
        `;
    }).join("");
}

window.jumpToProfile = function(id) {
    currentSectorFilter = "ALL";
    const searchInput = document.getElementById("profile-search");
    if (searchInput) searchInput.value = "";
    
    document.querySelectorAll("#sector-filters .term-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.sector === "ALL");
    });
    renderProfiles();

    const card = document.getElementById(`profile-card-${id}`);
    if (card) {
        card.classList.add("open");
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
};

// 3. RENDER COMPANY PROFILES
let currentSectorFilter = "ALL";

function renderProfiles() {
    const container = document.getElementById("profiles-container");
    if (!container) return;
    
    const searchInput = document.getElementById("profile-search");
    const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : "";

    const filtered = companiesData.filter(c => {
        const matchesSector = currentSectorFilter === "ALL" || c.sectorGroup === currentSectorFilter;
        const searchableText = `${c.name} ${c.ticker} ${c.sector} ${c.products} ${c.differentiation} ${c.swot.s} ${c.swot.w} ${c.swot.o} ${c.swot.t} ${c.highlight}`.toLowerCase();
        const matchesQuery = !searchQuery || searchableText.includes(searchQuery);
        return matchesSector && matchesQuery;
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="prompt-box">NO MATCHING RECORDS FOUND FOR QUERY: "${searchQuery.toUpperCase()}"</div>`;
        return;
    }

    container.innerHTML = filtered.map((c, idx) => {
        const headerPriceCls = c.isPositive ? "ticker-pos" : "ticker-neg";
        return `
            <div class="company-card ${idx === 0 ? 'open' : ''}" id="profile-card-${c.id}">
                <div class="company-card-header" onclick="toggleCard('${c.id}')">
                    <span class="company-title">PROFILE ${c.id} : ${c.name} [${c.ticker} - ${c.exchange}]</span>
                    <span class="company-meta"><span class="${headerPriceCls}">${c.price} (${c.change})</span> | ${c.sector} [+/-]</span>
                </div>
                <div class="company-card-body">
                    <div class="detail-row"><span class="detail-label">HEADQUARTERS & SCALE :</span> ${c.hq} — ${c.size}</div>
                    <div class="detail-row"><span class="detail-label">MISSION :</span> ${c.mission}</div>
                    <div class="detail-row"><span class="detail-label">OFFERING & TARGET :</span> ${c.products} | <em>Target:</em> ${c.target}</div>
                    <div class="detail-row"><span class="detail-label">POSITIONING & MOAT :</span> ${c.differentiation}</div>
                    
                    <div class="swot-grid">
                        <div class="swot-cell">
                            <div class="swot-title">[+] STRENGTHS</div>
                            <div>${c.swot.s}</div>
                        </div>
                        <div class="swot-cell">
                            <div class="swot-title">[-] WEAKNESSES</div>
                            <div>${c.swot.w}</div>
                        </div>
                        <div class="swot-cell">
                            <div class="swot-title">[>] OPPORTUNITIES</div>
                            <div>${c.swot.o}</div>
                        </div>
                        <div class="swot-cell">
                            <div class="swot-title">[!] THREATS</div>
                            <div>${c.swot.t}</div>
                        </div>
                    </div>

                    <div class="detail-row" style="margin-bottom:0;"><span class="detail-label">KEY HIGHLIGHT (2022–2025) :</span> ${c.highlight}</div>
                </div>
            </div>
        `;
    }).join("");
}

window.toggleCard = function(id) {
    const card = document.getElementById(`profile-card-${id}`);
    if (card) card.classList.toggle("open");
};

// 4. RENDER ASCII MARGIN CHART
function renderAsciiChart() {
    const chartEl = document.getElementById("ascii-margin-chart");
    if (!chartEl) return;
    const sorted = [...companiesData].sort((a, b) => b.netMarginNum - a.netMarginNum);
    const maxBlocks = 28;

    chartEl.innerHTML = sorted.map(c => {
        const filled = Math.max(2, Math.round((c.netMarginNum / 55) * maxBlocks));
        const empty = maxBlocks - filled;
        const barStr = "[" + "█".repeat(filled) + "░".repeat(empty) + "]";
        return `
            <div class="ascii-row">
                <span class="ascii-label">${c.shortName} (${c.ticker})</span>
                <span class="ascii-bar">${barStr}</span>
                <span class="ascii-val">${c.netMarginText}</span>
            </div>
        `;
    }).join("");
}

// 5. RENDER COMPARATIVE MATRIX
let currentCashFilter = "ALL";

function renderMatrixTable() {
    const tbody = document.getElementById("matrix-table-body");
    if (!tbody) return;
    const sorted = [...companiesData].sort((a, b) => b.netMarginNum - a.netMarginNum);
    const filtered = sorted.filter(c => currentCashFilter === "ALL" || c.cashCategory === currentCashFilter);

    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td><strong>${c.shortName}</strong> (${c.ticker})</td>
            <td>${c.sector}</td>
            <td><strong>${c.netMarginText}</strong></td>
            <td>${c.cashModelText}</td>
            <td>${c.riskValuation}</td>
            <td>${c.moat}</td>
        </tr>
    `).join("");
}

// DONNÉES DE SECOURS (FALLBACK DATA) POUR MODE HORS-LIGNE
const FALLBACK_COMPANIES_DATA = [
    {
        id: "01", name: "APPLE INC.", shortName: "Apple", ticker: "AAPL", exchange: "NASDAQ", hq: "Cupertino, CA (USA)", price: "$356.27", change: "+3.81%", isPositive: true, sector: "Technology & Services", sectorGroup: "TECH", dominantModel: "Hardware ecosystem & recurring services", size: "Revenue ~$383.2B | Employees: ~161,000 | Market Cap: > $3,000B", mission: "Design intuitive, integrated personal technologies that enrich daily life while safeguarding privacy.", products: "Hardware (iPhone, Mac, iPad, Watch, AirPods) & high-margin Services (App Store, iCloud, Apple Pay).", target: "Primarily B2C (middle-to-high-income consumers) with growing B2B enterprise fleet adoption.", differentiation: "Exceptional pricing power, full vertical integration (Apple Silicon + iOS/macOS), and status-symbol branding vs. Samsung, Google, and Microsoft.", swot: { s: "Closed ecosystem driving record loyalty; massive Free Cash Flow (> $100B/yr).", w: "High revenue dependence on iPhone (> 50%); premium pricing limiting emerging-market volume.", o: "Services expansion & Apple Intelligence driving hardware upgrade cycles.", t: "Antitrust scrutiny (EU DMA, US DOJ) on App Store & Asian supply chain risks." }, highlight: "Rollout of Apple Intelligence and manufacturing diversification toward India to reduce reliance on China.", netMarginNum: 25.83, netMarginText: "~25% – 26% (High)", cashCategory: "HYBRID", cashModelText: "Hybrid (Recurring + Replacement): Services subscriptions + iPhone upgrade cycles", riskValuation: "Defensive Growth / Premium P/E (Massive share buybacks & FCF stability)", moat: "Closed hardware/software ecosystem & brand pricing power"
    },
    {
        id: "02", name: "MICROSOFT CORPORATION", shortName: "Microsoft", ticker: "MSFT", exchange: "NASDAQ", hq: "Redmond, WA (USA)", price: "$523.88", change: "-0.98%", isPositive: false, sector: "Cloud & Enterprise Software", sectorGroup: "TECH", dominantModel: "B2B subscriptions (SaaS) & AI infrastructure", size: "Revenue ~$245.1B | Employees: ~228,000 | Market Cap: > $3,000B", mission: "Empower every person and every organization on the planet to achieve more.", products: "Cloud (Azure), productivity suites (Microsoft 365, Teams, Copilot), Windows OS, LinkedIn, and Gaming (Xbox / Activision Blizzard).", target: "Ultra-dominant B2B (SMBs, global enterprises, governments) paired with massive B2C reach.", differentiation: "De facto global standard for enterprise IT, high switching costs, and early lead in enterprise generative AI vs. AWS and Google Cloud.", swot: { s: "High recurring SaaS/Cloud revenues; balanced 3-pillar diversification.", w: "Complex licensing/pricing tiers; exposure to corporate IT budget cycles.", o: "Enterprise AI monetization via Microsoft 365 Copilot and Azure AI.", t: "Antitrust scrutiny (Teams bundling, OpenAI alliance) & cybersecurity risks." }, highlight: "Completion of the $69B Activision Blizzard acquisition and global integration of Copilot across Windows and Office.", netMarginNum: 16.14, netMarginText: "~35% – 36% (Very High)", cashCategory: "RECURRING", cashModelText: "Highly Recurring: B2B SaaS subscriptions & multi-year Azure contracts", riskValuation: "Quality Growth / Premium P/E (Low operational risk, steady compounding)", moat: "High enterprise switching costs & workflow integration"
    },
    {
        id: "03", name: "NVIDIA CORPORATION", shortName: "NVIDIA", ticker: "NVDA", exchange: "NASDAQ", hq: "Santa Clara, CA (USA)", price: "$162.85", change: "-23.95%", isPositive: false, sector: "Semiconductors & AI", sectorGroup: "SEMI", dominantModel: "Hardware quasi-monopoly & CUDA ecosystem", size: "Revenue ~$96.3B (hypergrowth) | Employees: ~29,600 | Market Cap: ~$3,000B", mission: "Accelerate computing to solve complex problems through AI and advanced graphics.", products: "Data center GPUs (Hopper, Blackwell), CUDA software platform, GeForce gaming GPUs, and autonomous driving chips.", target: "Primarily B2B (cloud hyperscalers like Microsoft, Google, Amazon, Meta; AI labs; governments).", differentiation: "Near-monopoly (> 80% share) in AI training chips, locked in by its proprietary CUDA software ecosystem vs. AMD and Intel.", swot: { s: "Multi-generation tech lead; exceptional gross (> 70%) and net (~49%) margins.", w: "Heavy customer concentration among 'Big Tech'; fabless reliance on TSMC.", o: "Expansion of 'Sovereign AI' data centers and industrial robotics (Omniverse).", t: "US export controls to China & potential cyclical slowdowns in AI CapEx." }, highlight: "Launch of the Blackwell superchip architecture, with global demand outstripping initial production capacity.", netMarginNum: 51.62, netMarginText: "~48% – 55% (Exceptional)", cashCategory: "CYCLICAL", cashModelText: "Cyclical / CapEx-driven: High volatility tied to AI infrastructure spending", riskValuation: "High Growth / High Multiple (Elevated P/E reflecting hypergrowth & AI dominance)", moat: "Proprietary CUDA software lock-in & hardware performance lead"
    },
    {
        id: "04", name: "ASML HOLDING N.V.", shortName: "ASML Holding", ticker: "ASML", exchange: "Euronext / NASDAQ", hq: "Veldhoven (Netherlands)", price: "$1,495.16", change: "-8.80%", isPositive: false, sector: "Semiconductor Equipment", sectorGroup: "SEMI", dominantModel: "Technological monopoly (EUV lithography)", size: "Revenue ~€27.6B | Employees: ~42,400 | Market Cap: ~€280B", mission: "Provide chipmakers with advanced lithography systems to pattern silicon at the nanometer scale.", products: "Advanced photolithography machines, notably EUV and High-NA EUV systems (up to €350M/unit) for 3nm and 2nm chips.", target: "Ultra-concentrated B2B (major foundries: TSMC, Samsung Foundry, Intel).", differentiation: "Absolute global monopoly (100% EUV market share), protected by decades of R&D, patents, and exclusive optics partnerships (Carl Zeiss).", swot: { s: "Virtually insurmountable barriers to entry; multi-year order backlog visibility.", w: "Extreme reliance on 3 major customers; complex supply chain bottlenecks.", o: "New US/European semiconductor fabs subsidized by Chips Acts.", t: "Tightening Dutch/US export restrictions limiting advanced equipment sales to China." }, highlight: "First deliveries of next-generation High-NA EUV systems to Intel and TSMC for sub-2nm chip production.", netMarginNum: 37.67, netMarginText: "~27% – 29% (High)", cashCategory: "CYCLICAL", cashModelText: "Semi-Cyclical / Backlog-backed: Multi-year order book smoothing chip cycles", riskValuation: "Monopoly Growth / High P/E (Geopolitical export risks offset by 100% EUV share)", moat: "Absolute technological monopoly (EUV lithography)"
    },
    {
        id: "05", name: "AMAZON.COM, INC.", shortName: "Amazon", ticker: "AMZN", exchange: "NASDAQ", hq: "Seattle, WA (USA)", price: "$266.66", change: "+6.66%", isPositive: true, sector: "E-Commerce & Cloud", sectorGroup: "TECH", dominantModel: "Global logistics & AWS infrastructure", size: "Revenue ~$574.8B | Employees: ~1,525,000 | Market Cap: ~$2,000B", mission: "Be Earth's most customer-centric company, where customers can find and buy anything online.", products: "Global e-commerce marketplace, Amazon Prime, digital advertising (Amazon Ads), and cloud infrastructure (AWS).", target: "Dual B2C (hundreds of millions of global shoppers) and B2B (marketplace sellers & AWS enterprise clients).", differentiation: "Unmatched logistics scale (automated fulfillment network) paired with high-margin AWS cloud profits vs. Walmart, Alibaba, and Azure.", swot: { s: "Dual growth engine (AWS + Advertising); powerful Prime network effect.", w: "Thin operating margins in legacy retail; massive labor and logistics overhead.", o: "High-margin ad growth embedded in retail & proprietary AI chips (Trainium).", t: "US FTC antitrust lawsuits & growing warehouse unionization pressures." }, highlight: "Overhaul of US fulfillment into 8 autonomous regional networks, cutting shipping costs and boosting same-day deliveries.", netMarginNum: 25.64, netMarginText: "~6% – 8% (Expanding)", cashCategory: "HYBRID", cashModelText: "Dual Engine: Low-margin high-volume retail + ultra-profitable recurring AWS/Ads", riskValuation: "Reinvesting Growth / Elevated P/E (Heavy CapEx reinvestment masks true earnings power)", moat: "Unmatched logistics network & AWS cloud scale"
    },
    {
        id: "06", name: "TESLA, INC.", shortName: "Tesla", ticker: "TSLA", exchange: "NASDAQ", hq: "Austin, TX (USA)", price: "$390.22", change: "+10.01%", isPositive: true, sector: "Automotive, Energy & AI", sectorGroup: "AUTO_FIN", dominantModel: "Vertical integration, EVs & autonomous AI", size: "Revenue ~$96.8B | Employees: ~140,000 | Market Cap: > $1,200B", mission: "Accelerate the world's transition to sustainable energy.", products: "Electric vehicles (Model 3, Y, S, X, Cybertruck), energy storage (Megapack, Powerwall), and autonomous software (FSD).", target: "Retail consumers (B2C) and businesses/utilities (B2B) for fleets and grid storage.", differentiation: "Deep vertical integration, battery cost leadership, and massive real-world AI driving data vs. legacy automakers and BYD.", swot: { s: "Pioneering brand equity; industry-leading auto margins; global Supercharger network.", w: "Aging vehicle lineup; high sensitivity to auto loan interest rates.", o: "Commercial rollout of Cybercab robotaxis and Full Self-Driving (FSD) subscriptions.", t: "Aggressive price wars from Chinese EV rivals & regulatory hurdles for autonomous driving." }, highlight: "Acceleration of its AI/robotics roadmap (Robotaxi) alongside rapid scaling of utility-scale energy storage.", netMarginNum: 33.69, netMarginText: "~8% – 12% (Variable)", cashCategory: "CYCLICAL", cashModelText: "Cyclical / Capital-Intensive: Auto demand sensitive to rates; energy growing", riskValuation: "Speculative Growth / Very High P/E (Valued on future AI/Robotaxi optionality)", moat: "Vertical integration, Supercharger network & AI data"
    },
    {
        id: "07", name: "LVMH (MOËT HENNESSY LOUIS VUITTON)", shortName: "LVMH", ticker: "MC.PA", exchange: "Euronext Paris", hq: "Paris (France)", price: "€403.45", change: "+1.62%", isPositive: true, sector: "Personal Luxury Goods", sectorGroup: "CONSUMER", dominantModel: "Pricing power & portfolio of brands", size: "Revenue ~€86.2B | Employees: ~213,000 | Market Cap: > €200B", mission: "Ensure the longevity of the European art of living through exceptional Maisons blending heritage and creativity.", products: "Fashion & leather goods (Louis Vuitton, Dior), wines & spirits (Moët, Hennessy), cosmetics (Sephora), watches & jewelry (Tiffany, Bulgari).", target: "Global affluent and ultra-high-net-worth B2C clientele.", differentiation: "Decentralized model across 75+ Maisons, 100% controlled distribution (zero discounting), and unmatched pricing power vs. Kering and Hermès.", swot: { s: "Financial firepower & timeless prestige; balanced geographic and category mix.", w: "High sensitivity to Asian (Chinese) luxury demand and macro slowdowns.", o: "Certified pre-owned luxury & engaging Gen Z affluent buyers via immersive retail.", t: "Geopolitical instability & potential transatlantic tariffs on European luxury goods." }, highlight: "Omnichannel expansion and leadership reshuffling to revitalize Fashion & Leather Goods amid post-pandemic demand normalization.", netMarginNum: -12.27, netMarginText: "~16% – 18% (High)", cashCategory: "CYCLICAL", cashModelText: "Semi-Cyclical / Aspiration-Driven: Sensitive to global wealth & Asian tourism", riskValuation: "Quality Compounder / Moderate-High P/E (Strong pricing power offsets macro dips)", moat: "Heritage Maisons & 100% controlled retail"
    },
    {
        id: "08", name: "MCDONALD'S CORPORATION", shortName: "McDonald's", ticker: "MCD", exchange: "NYSE", hq: "Chicago, IL (USA)", price: "$271.97", change: "+11.94%", isPositive: true, sector: "Quick-Service & Real Estate", sectorGroup: "CONSUMER", dominantModel: "Global franchise & real estate rent", size: "Revenue ~$25.5B | Employees: ~150,000 (corporate) | Market Cap: ~$200B", mission: "Make delicious feel-good moments easy for everyone around the world.", products: "Quick-service food (Big Mac, Fries, McCafé) operated > 90% via franchises generating royalties and real estate rent.", target: "Mass global B2C consumer base across all demographics seeking speed and value.", differentiation: "One of the world's largest commercial real estate landlords (leasing properties to franchisees), backed by iconic marketing and digital ordering.", swot: { s: "Inflation-protected franchise & real estate cash flows; universal brand recognition.", w: "Price sensitivity among lower-income consumers; rising minimum wage pressures.", o: "Digital loyalty ecosystem expansion & new beverage-led concepts (CosMc's).", t: "Fierce fast-casual burger competition & ongoing health/nutritional scrutiny." }, highlight: "Investment in AI-powered drive-thru personalization and global scaling of its digital loyalty app.", netMarginNum: 4.33, netMarginText: "~32% – 33% (High)", cashCategory: "RECURRING", cashModelText: "Ultra-Recurring & Inflation-Protected: Franchise royalties + commercial property rents", riskValuation: "Defensive Value / Moderate P/E (Low beta, resilient during economic downturns)", moat: "Global real estate portfolio & franchise scale"
    },
    {
        id: "09", name: "THE COCA-COLA COMPANY", shortName: "Coca-Cola", ticker: "KO", exchange: "NYSE", hq: "Atlanta, GA (USA)", price: "$99.25", change: "+5.70%", isPositive: true, sector: "Consumer Staples (Beverages)", sectorGroup: "CONSUMER", dominantModel: "Global distribution & concentrates", size: "Revenue ~$45.8B | Employees: ~79,000 | Market Cap: > $230B", mission: "Refresh the world and make a difference through our brands and actions.", products: "Sparkling soft drinks (Coca-Cola, Sprite, Fanta), teas, coffees, waters (Dasani), and sports/energy drinks.", target: "Global B2C consumers served via a universal distribution network across 200+ countries.", differentiation: "Unrivaled global bottling/distribution network (selling high-margin concentrates to independent bottlers) & legendary marketing vs. PepsiCo.", swot: { s: "'Dividend King' (60+ years of consecutive dividend hikes); planetary brand equity.", w: "Regulatory exposure to sugar taxes and sugary beverage restrictions.", o: "Growth in zero-sugar sodas, ready-to-drink coffees, and functional health drinks.", t: "Consumer shift toward healthier/local drinks & rising commodity costs (sugar, aluminum)." }, highlight: "Ongoing portfolio reformulation toward low/zero-sugar recipes and global bottling network optimization.", netMarginNum: 23.06, netMarginText: "~23% – 24% (High)", cashCategory: "RECURRING", cashModelText: "Ultra-Recurring & Defensive: Daily repeat consumption via concentrate model", riskValuation: "Pure Defensive / Moderate P/E (60+ year 'Dividend King', minimal volatility)", moat: "Global bottling distribution network & brand equity"
    },
    {
        id: "10", name: "JPMORGAN CHASE & CO.", shortName: "JPMorgan Chase", ticker: "JPM", exchange: "NYSE", hq: "New York, NY (USA)", price: "$346.19", change: "+1.90%", isPositive: true, sector: "Universal Banking & Finance", sectorGroup: "AUTO_FIN", dominantModel: "Universal banking & asset management", size: "Revenue > $158B | Employees: ~310,000 | Market Cap: > $500B", mission: "Help clients grow their businesses and build stronger communities around the world.", products: "Consumer banking (Chase), investment banking, Asset & Wealth Management, and corporate treasury services.", target: "Dual B2C (retail customers) and B2B (corporations, governments, financial institutions).", differentiation: "Global universal banking leader with a 'fortress balance sheet,' massive IT budgets, and crisis M&A capacity (e.g., First Republic).", swot: { s: "Diversified revenue streams (fees, trading, net interest); best-in-class risk management.", w: "Massive systemic complexity & heavy regulatory capital rules (Too Big to Fail).", o: "Digital retail banking growth & back-office automation via generative AI.", t: "Macro credit slowdowns/defaults & aggressive disruption from Fintech rivals." }, highlight: "Seamless integration of First Republic Bank and major AI deployments to assist investment bankers and fraud detection.", netMarginNum: 33.64, netMarginText: "~28% – 30% (ROE ~18%)", cashCategory: "CYCLICAL", cashModelText: "Cyclical / Rate-Sensitive: Net interest income, investment banking fees & trading", riskValuation: "Cyclical Value / Low-to-Moderate P/E (Strict regulatory capital rules, high dividend)", moat: "Balance sheet scale ('Fortress') & low-cost deposit base"
    }
];

// INITIALIZATION & EVENT LISTENERS
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Animation de frappe sur le titre
    typeWriterEffect("terminal-title", "FINANCIAL SYSTEM TERMINAL", 40);

    // 2. Charge en priorité les données depuis quant_data.json avec secours hors-ligne
    await loadQuantDataFeed();

    // 3. Tente de charger les prix en direct (si API_KEY configurée)
    await fetchLiveStockPrices();

    // 4. Affichage initial du terminal avec les données chargées
    renderTickerTape();
    renderScopeTable();
    renderProfiles();
    renderAsciiChart();
    renderMatrixTable();

    // 5. Bouton de retour en arrière intelligent
    const returnBtn = document.getElementById("return-btn");
    if (returnBtn) {
        returnBtn.addEventListener("click", (e) => {
            if (document.referrer && document.referrer.includes(window.location.hostname)) {
                e.preventDefault();
                window.history.back();
            }
        });
    }

    // 6. Filtres par secteur
    document.querySelectorAll("#sector-filters .term-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#sector-filters .term-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentSectorFilter = btn.dataset.sector;
            renderProfiles();
        });
    });

    // 7. Barre de recherche query>
    const searchInput = document.getElementById("profile-search");
    if (searchInput) {
        searchInput.addEventListener("input", renderProfiles);
    }

    // 8. Boutons Expand / Collapse All
    const expandAllBtn = document.getElementById("btn-expand-all");
    if (expandAllBtn) {
        expandAllBtn.addEventListener("click", () => {
            document.querySelectorAll(".company-card").forEach(c => c.classList.add("open"));
        });
    }

    const collapseAllBtn = document.getElementById("btn-collapse-all");
    if (collapseAllBtn) {
        collapseAllBtn.addEventListener("click", () => {
            document.querySelectorAll(".company-card").forEach(c => c.classList.remove("open"));
        });
    }

    // 9. Filtres par modèle de cash
    document.querySelectorAll("#cash-filters .term-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#cash-filters .term-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentCashFilter = btn.dataset.cash;
            renderMatrixTable();
        });
    });
   // ==========================================
// CHARGEMENT DE LA DERNIÈRE MISE À JOUR (JSON)
// ==========================================
// Récupère dynamiquement la date de mise à jour depuis le fichier JSON généré par Python
document.addEventListener("DOMContentLoaded", function() {
    const updateDateElement = document.getElementById("update-date");
    if (!updateDateElement) return; // Sécurité si l'élément n'est pas sur cette page

    fetch('quant_data.json')
        .then(response => {
            if (!response.ok) throw new Error("Fichier JSON introuvable");
            return response.json();
        })
        .then(data => {
            if (data.last_updated) {
                updateDateElement.textContent = data.last_updated;
            } else {
                updateDateElement.textContent = "DATE INDISPONIBLE";
            }
        })
        .catch(error => {
            console.warn("Impossible de charger la date de mise à jour :", error);
            updateDateElement.textContent = "HORS LIGNE";
        });
});
