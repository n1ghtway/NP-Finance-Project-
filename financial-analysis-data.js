const companiesData = [
    {
        "ticker": "AAPL",
        "name": "Apple Inc.",
        "sector": "Technology",
        "change": "+3.81%",
        "isPositive": true,
        "verdict": "BUY / STRONG",
        "metrics": "Revenue: $383.2B | Net Margin: 25.3% | PER: 28.4",
        "summary": "Massive cash reserve and strong services resilience. Consistent growth despite hardware slowdown.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "MSFT",
        "name": "Microsoft Corporation",
        "sector": "Cloud & Enterprise Software",
        "change": "-0.98%",
        "isPositive": false,
        "verdict": "QUALITY GROWTH / CORE",
        "metrics": "Revenue: $245.1B | Net Margin: 35.6% | PER: 32.1",
        "summary": "High recurring SaaS/Cloud revenues and early lead in enterprise generative AI via Azure and Copilot.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "NVDA",
        "name": "NVIDIA Corporation",
        "sector": "Semiconductors & AI",
        "change": "-23.95%",
        "isPositive": false,
        "verdict": "HIGH GROWTH / VOLATILE",
        "metrics": "Revenue: $96.3B | Net Margin: 49.0% | PER: 45.0",
        "summary": "Near-monopoly in AI training chips locked in by the proprietary CUDA software ecosystem.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "ASML",
        "name": "ASML Holding N.V.",
        "sector": "Semiconductor Equipment",
        "change": "-8.80%",
        "isPositive": false,
        "verdict": "MONOPOLY GROWTH / HOLD",
        "metrics": "Revenue: €27.6B | Net Margin: 28.2% | PER: 38.4",
        "summary": "Absolute technological monopoly in EUV lithography systems essential for advanced sub-2nm chip manufacturing.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "AMZN",
        "name": "Amazon.com, Inc.",
        "sector": "E-Commerce & Cloud",
        "change": "+6.66%",
        "isPositive": true,
        "verdict": "REINVESTING GROWTH / BUY",
        "metrics": "Revenue: $574.8B | Net Margin: 7.2% | PER: 41.2",
        "summary": "Dual powerhouse combining global automated logistics and ultra-profitable AWS cloud infrastructure.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "TSLA",
        "name": "Tesla Motors",
        "sector": "Automotive / AI",
        "change": "+10.01%",
        "isPositive": true,
        "verdict": "HOLD / VOLATILE",
        "metrics": "Revenue: $96.7B | Net Margin: 11.2% | PER: 62.1",
        "summary": "Margin compression following vehicle price cuts. Strong long-term AI potential and energy storage growth.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "MC.PA",
        "name": "LVMH",
        "sector": "Luxury Goods",
        "change": "+1.62%",
        "isPositive": true,
        "verdict": "BUY / SOLID",
        "metrics": "Revenue: €86.2B | Net Margin: 17.6% | PER: 23.5",
        "summary": "Undisputed luxury leader with high pricing power across 75+ prestigious Maisons and excellent capital return.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "MCD",
        "name": "McDonald's Corp.",
        "sector": "Consumer / Real Estate",
        "change": "+11.94%",
        "isPositive": true,
        "verdict": "FAIRLY VALUED / CORE",
        "metrics": "EBIT: $12.4B (+38%) | FCF: $8.32B | Net Debt: $54.0B",
        "summary": "Highly resilient hybrid model (franchise + real estate). EBIT up +38% (2022-2025), strong FCF ($8.32B), and consistent shareholder returns.",
        "hasFullReport": true,
        "reportData": {
            "subtitle": "NYSE: MCD // CONSUMER DISCRETIONARY & RESTAURANT QSR // PERIOD: 2022–2025",
            "businessModel": "McDonald's operates a highly resilient hybrid model going beyond simple fast-food. (1) Real Estate Pillar: Owns or leases land/buildings, sub-leasing to franchisees where 60-70% of revenue comes from fixed or variable rent indexed to sales, providing natural inflation protection. (2) Franchise Mix: Over 90% of restaurants are franchised, lightening operating cost structures while ensuring recurring cash flow via royalties and rent. (3) Geographic Footprint: Divided into US (historical core market), International Operated Markets (IOM - mature key markets like France, UK, Germany, Australia, Canada), and International Developmental Licensed Markets (IDL - high-growth regions delegated to master franchisees in LatAm, Asia, Middle East).",
            "swot": {
                "strengths": "Global brand equity, standardized products/services, strategic real estate portfolio generating stable rental income, massive economies of scale on raw materials and advertising.",
                "weaknesses": "Public perception tied to ultra-processed foods requiring ongoing menu adjustments, high vulnerability to minimum wage hikes in North America and Europe.",
                "opportunities": "Digital transformation (mobile apps, self-order kiosks, loyalty programs driving ticket size), continuous home delivery expansion (Uber Eats, DoorDash), breakthrough innovations like CosMc's.",
                "threats": "Inflationary pressures (beef, poultry, wheat, energy volatility), tightening health regulations, single-use plastic bans, fierce competition in chicken and fast-casual segments (Chick-fil-A, Chipotle, Shake Shack)."
            },
            "financialTable": [
                { "metric": "Operating Income (EBIT)", "y2022": "$8.99B", "y2023": "$11.70B", "y2024": "$11.75B", "y2025": "$12.40B", "var": "+38%" },
                { "metric": "EBITDA", "y2022": "$10.86B", "y2023": "$13.67B", "y2024": "$13.85B", "y2025": "$14.60B", "var": "+34%" },
                { "metric": "Net Income", "y2022": "$6.18B", "y2023": "$8.47B", "y2024": "$8.22B", "y2025": "$8.56B", "var": "+39%" },
                { "metric": "Cash & Equivalents", "y2022": "$2.58B", "y2023": "$4.58B", "y2024": "$1.09B", "y2025": "$0.77B", "var": "-70%" },
                { "metric": "Total Debt", "y2022": "$48.70B", "y2023": "$53.09B", "y2024": "$51.95B", "y2025": "$54.81B", "var": "+13%" },
                { "metric": "Net Debt", "y2022": "$46.12B", "y2023": "$48.51B", "y2024": "$50.86B", "y2025": "$54.04B", "var": "+17%" },
                { "metric": "Operating Cash Flow", "y2022": "$7.39B", "y2023": "$9.61B", "y2024": "$9.45B", "y2025": "$10.55B", "var": "+43%" },
                { "metric": "CapEx", "y2022": "$1.90B", "y2023": "$2.36B", "y2024": "$2.78B", "y2025": "$3.37B", "var": "+77%" },
                { "metric": "Free Cash Flow (FCF)", "y2022": "$7.09B", "y2023": "$8.46B", "y2024": "$8.31B", "y2025": "$8.32B", "var": "+17%" }
            ],
            "financialAnalysis": "Operating Income (EBIT) grew +38% ($8.99B to $12.40B), while Net Income rose +39% ($8.56B in 2025), proving robust franchise margin resilience and inflation absorption. Operating Cash Flow surged +43% to $10.55B. CapEx increased +77% ($1.90B to $3.37B) to fund digital network modernization. Despite higher investments, Free Cash Flow remains remarkably strong at $8.32B (+17%). Cash reserves decreased (-70%) due to active cash redeployment toward share buybacks and dividends, which also explains negative accounting book equity.",
            "capitalAllocation": "Dividend Policy: Dividend Aristocrat status with continuous growth, DPS rising from $5.66 (2022) to $7.17–$7.44 (2025), offering a 2.2%–2.5% dividend yield and a healthy 50-60% payout ratio. Share Buybacks: Massive capital allocation ($2.8B–$3.9B/year) reducing diluted shares from ~0.74B to 0.71–0.72B, providing a strong accretive EPS lever supporting stock valuation.",
            "valuation": "Valuation Multiples: Historical P/E ranges between 22x–25x, EV/EBITDA between 15x–18x, backed by steady FCF generation. Competitive Benchmark: Outperforms peers like Yum! Brands (similar franchise model but lower direct real estate footprint), Restaurant Brands International (higher leverage), and Wendy's (smaller scale). McDonald's boasts operating and EBITDA margins exceeding 40-45% due to rental income.",
            "conclusion": "FAIRLY VALUED / CORE HOLDING — While trading at premium multiples (22x-25x P/E), McDonald's defensive quality, unbeatable real estate backing, inflation protection, and reliable cash generation make it an essential core holding for long-term investors."
        }
    },
    {
        "ticker": "KO",
        "name": "The Coca-Cola Company",
        "sector": "Consumer Staples (Beverages)",
        "change": "+5.70%",
        "isPositive": true,
        "verdict": "DEFENSIVE / DIVIDEND KING",
        "metrics": "Revenue: $45.8B | Net Margin: 23.1% | PER: 24.2",
        "summary": "Unrivaled global distribution network and concentrate model supporting 60+ consecutive years of dividend hikes.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    },
    {
        "ticker": "JPM",
        "name": "JPMorgan Chase & Co.",
        "sector": "Universal Banking & Finance",
        "change": "+1.90%",
        "isPositive": true,
        "verdict": "BUY / FORTRESS BALANCE SHEET",
        "metrics": "Revenue: >$158B | Net Margin: 33.6% | PER: 12.8",
        "summary": "Global universal banking leader with strong fortress balance sheet, diversified revenue streams, and crisis M&A capacity.",
        "hasFullReport": false,
        "reportNote": "Full audit report not available for now."
    }
];

// Chargement dynamique de la date de dernière mise à jour
document.addEventListener("DOMContentLoaded", function() {
    const updateDateElement = document.getElementById("update-date");
    if (!updateDateElement) return;

    fetch('quant_data.json')
        .then(response => {
            if (!response.ok) throw new Error("JSON introuvable");
            return response.json();
        })
        .then(data => {
            if (data.last_updated) {
                updateDateElement.textContent = data.last_updated;
            } else {
                updateDateElement.textContent = "DATE UNAVAILABLE";
            }
        })
        .catch(error => {
            updateDateElement.textContent = "OFFLINE";
        });
});
