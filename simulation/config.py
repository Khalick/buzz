"""
BizHub Network Simulation — Configuration
All parameters calibrated against Thika pilot data.
"""

# ─── Town Geometry ───────────────────────────────────────────────
TOWN_GRID_SIZE = 50  # 50×50 grid cells representing a town
TOWN_NAME = "Thika"

# ─── Population ──────────────────────────────────────────────────
INITIAL_CONSUMERS = 100       # seed consumers at t=0
MAX_CONSUMERS = 3_000         # town population cap
INITIAL_MERCHANTS = 15        # seed merchants at t=0
MAX_MERCHANTS = 300           # realistic merchant cap per town
VERIFICATION_AGENTS = 3       # physical verification agents

# ─── Time ────────────────────────────────────────────────────────
SIMULATION_MONTHS = 12
STEPS_PER_MONTH = 30          # 1 step = 1 day

# ─── Trust Flywheel (Module A) ──────────────────────────────────
BASE_CONSUMER_JOIN_PROB = 0.04      # daily probability a new consumer joins
VERIFIED_DENSITY_BOOST = 0.20       # boost per 10% verified merchant density
PEER_RECOMMENDATION_FACTOR = 0.08   # boost from active user word-of-mouth
CONSUMER_CHURN_RATE = 0.02          # monthly churn probability

BASE_MERCHANT_JOIN_PROB = 0.05      # daily probability a new merchant joins
SMART_LEADS_BOOST = 0.15            # boost per 10 active smart lead broadcasts
MERCHANT_CHURN_RATE = 0.01          # monthly churn probability

# ─── Verification Operations (Module B) ─────────────────────────
PHYSICAL_VERIFY_TIME_HOURS = 1.5    # hours per physical verification
PHYSICAL_VERIFY_COST_KES = 500     # cost per physical verification (travel + labor)
HYBRID_VERIFY_COST_KES = 50        # cost per hybrid verification (KRA/M-Pesa/Video)
AGENT_DAILY_HOURS = 8               # working hours per day
HYBRID_SWITCH_THRESHOLD = 100       # switch to hybrid after N physical verifications

# ─── Smart Leads Marketplace (Module C) ─────────────────────────
DAILY_BROADCAST_PROB = 0.05         # probability a consumer broadcasts a need per day
AVG_MATCHING_MERCHANTS = 5          # average merchants matching a broadcast category
BID_RESPONSE_PROB = 0.60            # probability a merchant responds to a matching lead
BID_ACCEPTANCE_PROB = 0.40          # probability consumer accepts a bid
LEAD_FEE_KES = 200                  # fee charged per accepted lead

# ─── Financial Model (Module D) ─────────────────────────────────
PREMIUM_SUBSCRIPTION_KES = 2_500    # monthly premium subscription
PREMIUM_CONVERSION_RATE = 0.15      # 15% of merchants go premium
AD_REVENUE_PER_MERCHANT_KES = 500   # monthly ad revenue per active merchant
DEAL_COMMISSION_RATE = 0.10         # 10% commission on deals
AVG_DEAL_VALUE_KES = 1_000          # average deal transaction value
OPENAI_COST_PER_QUERY_KES = 2       # API cost per AI search query
DAILY_AI_QUERIES_PER_USER = 0.3     # average queries per active user per day

# ─── CAC / LTV ──────────────────────────────────────────────────
CAC_PER_MERCHANT_KES = 5_000
MERCHANT_LIFETIME_MONTHS = 18       # average merchant retention
GROSS_MARGIN = 0.85                 # 85% gross margin

# ─── Monte Carlo ────────────────────────────────────────────────
MONTE_CARLO_RUNS = 1_000
MC_CONVERSION_RANGE = (0.08, 0.22)  # ±range for premium conversion
MC_CHURN_RANGE = (0.01, 0.08)       # ±range for monthly churn
MC_CAC_RANGE = (3_000, 8_000)       # ±range for CAC
MC_API_COST_RANGE = (1, 5)          # ±range for API cost per query

# ─── UI Theme ───────────────────────────────────────────────────
BRAND_DARK_GREEN = "#0D1F16"
BRAND_GREEN = "#1B4332"
BRAND_MID_GREEN = "#2D6A4F"
BRAND_LIGHT_GREEN = "#40916C"
BRAND_GOLD = "#D4AF37"
BRAND_WHITE = "#F0FDF4"
BRAND_TEXT = "#E0E0E0"
