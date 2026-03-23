"""
BizHub Network Simulation Dashboard
World-class interactive simulation UI built on Streamlit + Plotly.

Theme: Dark Green (#0D1F16) + Gold (#D4AF37)
Methodology: Harvard HBS "Management Flight Simulator" approach.
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
import numpy as np
import pandas as pd
import sys
import os

# Ensure local imports work
sys.path.insert(0, os.path.dirname(__file__))

from engine import BizHubSimulation, run_monte_carlo
from config import *

# ─── Streamlit Page Config ────────────────────────────────────────
st.set_page_config(
    page_title="BizHub Network — Simulation Engine",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ─── Custom CSS Theme ─────────────────────────────────────────────
st.markdown(f"""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');

    .stApp {{
        background: linear-gradient(180deg, {BRAND_DARK_GREEN} 0%, #0a1a10 100%);
        color: {BRAND_TEXT};
        font-family: 'Inter', sans-serif;
    }}

    [data-testid="stSidebar"] {{
        background: linear-gradient(180deg, {BRAND_GREEN} 0%, {BRAND_DARK_GREEN} 100%);
        border-right: 1px solid rgba(212,175,55,0.2);
    }}

    [data-testid="stSidebar"] .stMarkdown h1,
    [data-testid="stSidebar"] .stMarkdown h2,
    [data-testid="stSidebar"] .stMarkdown h3 {{
        color: {BRAND_GOLD} !important;
        font-family: 'Outfit', sans-serif !important;
    }}

    h1, h2, h3 {{
        font-family: 'Outfit', sans-serif !important;
        color: white !important;
    }}

    .gold {{
        color: {BRAND_GOLD} !important;
    }}

    .metric-card {{
        background: linear-gradient(135deg, rgba(27,67,50,0.8), rgba(13,31,22,0.9));
        border: 1px solid rgba(212,175,55,0.3);
        border-radius: 16px;
        padding: 20px;
        text-align: center;
        backdrop-filter: blur(10px);
    }}

    .metric-value {{
        font-family: 'Outfit', sans-serif;
        font-size: 32px;
        font-weight: 800;
        color: {BRAND_GOLD};
        line-height: 1.1;
    }}

    .metric-label {{
        font-size: 12px;
        color: rgba(224,224,224,0.7);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 6px;
    }}

    .stTabs [data-baseweb="tab-list"] {{
        gap: 8px;
    }}

    .stTabs [data-baseweb="tab"] {{
        background: rgba(27,67,50,0.5);
        border-radius: 8px;
        color: white;
        border: 1px solid rgba(212,175,55,0.2);
        padding: 8px 20px;
    }}

    .stTabs [aria-selected="true"] {{
        background: linear-gradient(135deg, {BRAND_GREEN}, {BRAND_MID_GREEN}) !important;
        border-color: {BRAND_GOLD} !important;
        color: white !important;
    }}

    div.stButton > button {{
        background: linear-gradient(135deg, {BRAND_GREEN}, {BRAND_MID_GREEN});
        color: white;
        border: 1px solid {BRAND_GOLD};
        border-radius: 12px;
        padding: 12px 28px;
        font-weight: 700;
        font-family: 'Outfit', sans-serif;
        font-size: 16px;
        transition: all 0.3s ease;
    }}

    div.stButton > button:hover {{
        background: linear-gradient(135deg, {BRAND_MID_GREEN}, {BRAND_LIGHT_GREEN});
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(212,175,55,0.3);
    }}

    .header-badge {{
        display: inline-block;
        background: linear-gradient(135deg, {BRAND_GREEN}, {BRAND_MID_GREEN});
        color: {BRAND_GOLD};
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        border: 1px solid rgba(212,175,55,0.3);
        margin-bottom: 8px;
    }}
</style>
""", unsafe_allow_html=True)

# ─── Plotly Theme ─────────────────────────────────────────────────
PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(13,31,22,0.5)",
    font=dict(family="Inter", color=BRAND_TEXT),
    xaxis=dict(gridcolor="rgba(212,175,55,0.1)", zeroline=False),
    yaxis=dict(gridcolor="rgba(212,175,55,0.1)", zeroline=False),
    margin=dict(l=40, r=20, t=40, b=40),
)


def metric_card(value: str, label: str):
    """Render a beautiful metric card."""
    st.markdown(f"""
    <div class="metric-card">
        <div class="metric-value">{value}</div>
        <div class="metric-label">{label}</div>
    </div>
    """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════
# SIDEBAR — Interactive Controls (Harvard HBS "Flight Simulator")
# ═══════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("### 🌍 BizHub Simulator")
    st.markdown("---")
    st.markdown("#### ⚙️ Simulation Parameters")

    premium_rate = st.slider(
        "Premium Conversion Rate",
        min_value=0.02, max_value=0.35, value=0.15, step=0.01,
        help="Percentage of merchants that upgrade to premium"
    )
    monthly_churn = st.slider(
        "Monthly Churn Rate",
        min_value=0.01, max_value=0.15, value=0.03, step=0.01,
        help="Percentage of consumers leaving per month"
    )
    cac_value = st.slider(
        "CAC (KES per Merchant)",
        min_value=1000, max_value=15000, value=5000, step=500,
        help="Customer Acquisition Cost per merchant"
    )
    api_cost = st.slider(
        "AI API Cost (KES/query)",
        min_value=0.5, max_value=10.0, value=2.0, step=0.5,
        help="OpenAI API cost per search query"
    )
    num_agents = st.slider(
        "Verification Agents",
        min_value=1, max_value=10, value=3, step=1,
        help="Number of field agents for business verification"
    )
    hybrid_threshold = st.slider(
        "Hybrid Switch Point",
        min_value=20, max_value=300, value=100, step=10,
        help="Physical verifications before switching to hybrid model"
    )

    st.markdown("---")
    run_button = st.button("🚀 Run Simulation", use_container_width=True)
    run_mc = st.button("🎲 Run Monte Carlo (1000x)", use_container_width=True)

# ═══════════════════════════════════════════════════════════════════
# HEADER
# ═══════════════════════════════════════════════════════════════════
st.markdown('<div class="header-badge">🧪 Simulation Engine v1.0</div>', unsafe_allow_html=True)
st.markdown("# BizHub Network <span class='gold'>Simulation</span>", unsafe_allow_html=True)
st.markdown("*Agent-Based + Monte Carlo modeling engine. Powered by methodologies from Harvard HBS, Stanford MS&E, and Yale Operations Research.*")

# ═══════════════════════════════════════════════════════════════════
# RUN SIMULATION
# ═══════════════════════════════════════════════════════════════════
if "sim_data" not in st.session_state:
    st.session_state.sim_data = None
if "mc_data" not in st.session_state:
    st.session_state.mc_data = None

overrides = {
    "premium_rate": premium_rate,
    "consumer_churn": monthly_churn,
    "cac": cac_value,
    "api_cost": api_cost,
    "num_agents": num_agents,
    "hybrid_threshold": hybrid_threshold,
}

if run_button:
    with st.spinner("🔄 Running 12-month agent-based simulation..."):
        sim = BizHubSimulation(**overrides)
        st.session_state.sim_data = sim.run()
    st.success("✅ Simulation complete!")

if run_mc:
    with st.spinner("🎲 Running 1,000 Monte Carlo iterations..."):
        st.session_state.mc_data = run_monte_carlo(n_runs=200, **overrides)
    st.success("✅ Monte Carlo analysis complete!")

# ═══════════════════════════════════════════════════════════════════
# TABS
# ═══════════════════════════════════════════════════════════════════
tab1, tab2, tab3, tab4 = st.tabs([
    "🗺️ Network Growth",
    "💰 Financial Command Center",
    "🎲 Monte Carlo Stress Test",
    "⚙️ Operations Optimizer"
])

df = st.session_state.sim_data
mc = st.session_state.mc_data

# ─── TAB 1: Network Growth Animation ─────────────────────────────
with tab1:
    if df is not None:
        st.markdown("### 🗺️ Town Network Growth Animation")
        st.markdown("Watch the BizHub ecosystem grow organically over 12 months.")

        # Top metrics
        final = df.iloc[-1]
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            metric_card(f"{int(final['active_consumers']):,}", "Active Consumers")
        with c2:
            metric_card(f"{int(final['active_merchants']):,}", "Active Merchants")
        with c3:
            metric_card(f"{int(final['verified_merchants']):,}", "Verified Merchants")
        with c4:
            metric_card(f"{final['trust_index']:.2f}", "Trust Index")

        st.markdown("---")

        # Growth curves
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=df["day"], y=df["active_consumers"],
            name="Consumers", mode="lines",
            line=dict(color=BRAND_LIGHT_GREEN, width=3),
            fill="tozeroy", fillcolor=f"rgba(64,145,108,0.15)"
        ))
        fig.add_trace(go.Scatter(
            x=df["day"], y=df["active_merchants"],
            name="Merchants", mode="lines",
            line=dict(color=BRAND_GOLD, width=3),
            fill="tozeroy", fillcolor="rgba(212,175,55,0.1)"
        ))
        fig.add_trace(go.Scatter(
            x=df["day"], y=df["verified_merchants"],
            name="Verified", mode="lines",
            line=dict(color="#22c55e", width=2, dash="dash")
        ))
        fig.update_layout(
            **PLOTLY_LAYOUT,
            title="Network Growth Over 12 Months",
            xaxis_title="Day",
            yaxis_title="Count",
            height=400,
            legend=dict(orientation="h", yanchor="bottom", y=1.02)
        )
        st.plotly_chart(fig, use_container_width=True)

        # Trust index over time
        col1, col2 = st.columns(2)
        with col1:
            fig2 = go.Figure()
            fig2.add_trace(go.Scatter(
                x=df["day"], y=df["trust_index"],
                mode="lines", name="Trust Index",
                line=dict(color=BRAND_GOLD, width=3),
                fill="tozeroy", fillcolor="rgba(212,175,55,0.1)"
            ))
            fig2.update_layout(**PLOTLY_LAYOUT, title="Trust Flywheel Index", height=300,
                               xaxis_title="Day", yaxis_title="Trust (0-1)")
            st.plotly_chart(fig2, use_container_width=True)

        with col2:
            fig3 = go.Figure()
            fig3.add_trace(go.Scatter(
                x=df["day"], y=df["ai_queries"],
                mode="lines", name="AI Queries",
                line=dict(color="#818cf8", width=2),
                fill="tozeroy", fillcolor="rgba(129,140,248,0.1)"
            ))
            st.plotly_chart(fig3.update_layout(**PLOTLY_LAYOUT, title="Daily AI Search Queries",
                                               height=300, xaxis_title="Day", yaxis_title="Queries"),
                           use_container_width=True)

    else:
        st.info("👈 Click **Run Simulation** in the sidebar to start.")

# ─── TAB 2: Financial Command Center ─────────────────────────────
with tab2:
    if df is not None:
        st.markdown("### 💰 Financial Command Center")
        final = df.iloc[-1]

        # Key financial metrics
        annual_rev = final["cumulative_revenue_kes"]
        monthly_rev = annual_rev / 12
        premium_count = final["premium_merchants"]
        ltv = PREMIUM_SUBSCRIPTION_KES * MERCHANT_LIFETIME_MONTHS * GROSS_MARGIN
        payback = cac_value / PREMIUM_SUBSCRIPTION_KES if PREMIUM_SUBSCRIPTION_KES > 0 else 0

        c1, c2, c3, c4, c5 = st.columns(5)
        with c1:
            metric_card(f"KES {annual_rev:,.0f}", "Projected Annual Revenue")
        with c2:
            metric_card(f"KES {monthly_rev:,.0f}", "Average MRR")
        with c3:
            metric_card(f"{GROSS_MARGIN*100:.0f}%", "Gross Margin")
        with c4:
            metric_card(f"KES {ltv:,.0f}", "Merchant LTV")
        with c5:
            metric_card(f"{payback:.1f} mo", "CAC Payback")

        st.markdown("---")

        # Revenue over time
        fig_rev = go.Figure()
        fig_rev.add_trace(go.Scatter(
            x=df["day"], y=df["cumulative_revenue_kes"],
            name="Cumulative Revenue", mode="lines",
            line=dict(color=BRAND_GOLD, width=3),
            fill="tozeroy", fillcolor="rgba(212,175,55,0.1)"
        ))
        fig_rev.update_layout(**PLOTLY_LAYOUT, title="Cumulative Revenue (KES)",
                              height=350, xaxis_title="Day", yaxis_title="KES")
        st.plotly_chart(fig_rev, use_container_width=True)

        # Daily revenue + premium merchants
        col1, col2 = st.columns(2)
        with col1:
            fig_daily = go.Figure()
            fig_daily.add_trace(go.Scatter(
                x=df["day"], y=df["daily_revenue_kes"],
                mode="lines", name="Daily Revenue",
                line=dict(color=BRAND_LIGHT_GREEN, width=2),
                fill="tozeroy", fillcolor="rgba(64,145,108,0.15)"
            ))
            fig_daily.update_layout(**PLOTLY_LAYOUT, title="Daily Revenue (KES)", height=300,
                                    xaxis_title="Day", yaxis_title="KES")
            st.plotly_chart(fig_daily, use_container_width=True)

        with col2:
            fig_prem = go.Figure()
            fig_prem.add_trace(go.Scatter(
                x=df["day"], y=df["premium_merchants"],
                mode="lines", name="Premium Merchants",
                line=dict(color=BRAND_GOLD, width=3)
            ))
            fig_prem.update_layout(**PLOTLY_LAYOUT, title="Premium Merchant Growth", height=300,
                                   xaxis_title="Day", yaxis_title="Merchants")
            st.plotly_chart(fig_prem, use_container_width=True)

    else:
        st.info("👈 Click **Run Simulation** in the sidebar to start.")

# ─── TAB 3: Monte Carlo Stress Test ──────────────────────────────
with tab3:
    if mc is not None:
        st.markdown("### 🎲 Monte Carlo Revenue Stress Test")
        st.markdown(f"*{len(mc)} randomized scenarios with varying conversion rates, churn, CAC, and API costs.*")

        rev = mc["annual_revenue_kes"]
        p10 = np.percentile(rev, 10)
        p50 = np.percentile(rev, 50)
        p90 = np.percentile(rev, 90)

        c1, c2, c3, c4 = st.columns(4)
        with c1:
            metric_card(f"KES {p10:,.0f}", "P10 (Pessimistic)")
        with c2:
            metric_card(f"KES {p50:,.0f}", "P50 (Base Case)")
        with c3:
            metric_card(f"KES {p90:,.0f}", "P90 (Optimistic)")
        with c4:
            metric_card(f"KES {rev.std():,.0f}", "Std Deviation")

        st.markdown("---")

        # Revenue distribution histogram
        fig_hist = go.Figure()
        fig_hist.add_trace(go.Histogram(
            x=rev, nbinsx=40,
            marker=dict(color=BRAND_MID_GREEN, line=dict(color=BRAND_GOLD, width=1)),
            opacity=0.85
        ))
        fig_hist.add_vline(x=p10, line_dash="dash", line_color="#ef4444",
                           annotation_text=f"P10: KES {p10:,.0f}")
        fig_hist.add_vline(x=p50, line_dash="solid", line_color=BRAND_GOLD,
                           annotation_text=f"P50: KES {p50:,.0f}")
        fig_hist.add_vline(x=p90, line_dash="dash", line_color="#22c55e",
                           annotation_text=f"P90: KES {p90:,.0f}")
        fig_hist.update_layout(**PLOTLY_LAYOUT, title="Revenue Distribution Across Scenarios",
                               height=400, xaxis_title="Annual Revenue (KES)", yaxis_title="Frequency")
        st.plotly_chart(fig_hist, use_container_width=True)

        # Tornado sensitivity chart
        st.markdown("#### 🌪️ Sensitivity Analysis (Tornado Chart)")
        sensitivities = {}
        for var in ["premium_rate", "consumer_churn", "cac", "api_cost"]:
            corr = mc["annual_revenue_kes"].corr(mc[var])
            sensitivities[var] = corr

        sens_df = pd.DataFrame({
            "Variable": list(sensitivities.keys()),
            "Correlation": list(sensitivities.values())
        }).sort_values("Correlation", key=abs, ascending=True)

        fig_tornado = go.Figure()
        colors = [BRAND_GOLD if v > 0 else "#ef4444" for v in sens_df["Correlation"]]
        fig_tornado.add_trace(go.Bar(
            y=sens_df["Variable"],
            x=sens_df["Correlation"],
            orientation="h",
            marker=dict(color=colors, line=dict(color="white", width=1)),
            text=[f"{v:.2f}" for v in sens_df["Correlation"]],
            textposition="outside"
        ))
        fig_tornado.update_layout(**PLOTLY_LAYOUT, title="Revenue Sensitivity to Input Variables",
                                  height=300, xaxis_title="Correlation with Annual Revenue")
        st.plotly_chart(fig_tornado, use_container_width=True)

    else:
        st.info("👈 Click **Run Monte Carlo (1000x)** in the sidebar to start stress testing.")

# ─── TAB 4: Operations Optimizer ──────────────────────────────────
with tab4:
    if df is not None:
        st.markdown("### ⚙️ Verification Operations Optimizer")
        final = df.iloc[-1]

        total_veri_cost = final["cumulative_verification_cost"]
        verified_count = final["verified_merchants"]
        cost_per_verified = total_veri_cost / max(1, verified_count)

        c1, c2, c3, c4 = st.columns(4)
        with c1:
            metric_card(f"{int(verified_count)}", "Merchants Verified")
        with c2:
            metric_card(f"KES {total_veri_cost:,.0f}", "Total Verification Cost")
        with c3:
            metric_card(f"KES {cost_per_verified:,.0f}", "Cost Per Verification")
        with c4:
            metric_card(f"{num_agents}", "Active Agents")

        st.markdown("---")

        # Verification cost over time
        fig_vc = go.Figure()
        fig_vc.add_trace(go.Scatter(
            x=df["day"], y=df["cumulative_verification_cost"],
            name="Total Cost", mode="lines",
            line=dict(color="#ef4444", width=3),
            fill="tozeroy", fillcolor="rgba(239,68,68,0.1)"
        ))
        fig_vc.add_trace(go.Scatter(
            x=df["day"], y=df["verified_merchants"] * PHYSICAL_VERIFY_COST_KES,
            name="If All Physical", mode="lines",
            line=dict(color="rgba(239,68,68,0.4)", width=2, dash="dash")
        ))
        fig_vc.update_layout(**PLOTLY_LAYOUT, title="Verification Cost: Actual vs All-Physical",
                             height=350, xaxis_title="Day", yaxis_title="KES")
        st.plotly_chart(fig_vc, use_container_width=True)

        # Break-even analysis
        col1, col2 = st.columns(2)
        with col1:
            physical_total = verified_count * PHYSICAL_VERIFY_COST_KES
            hybrid_savings = physical_total - total_veri_cost
            st.markdown(f"""
            <div class="metric-card" style="text-align:left;">
                <h4 style="color:{BRAND_GOLD};font-family:'Outfit',sans-serif;">💡 Hybrid Model Savings</h4>
                <p style="font-size:14px;line-height:1.8;">
                    If all <b>{int(verified_count)}</b> merchants were physically verified, cost would be
                    <b>KES {physical_total:,.0f}</b>.<br>
                    With hybrid model switching at <b>{hybrid_threshold}</b>, actual cost is
                    <b>KES {total_veri_cost:,.0f}</b>.<br><br>
                    <span style="font-size:20px;color:{BRAND_GOLD};font-weight:800;">
                        Savings: KES {hybrid_savings:,.0f}
                    </span>
                </p>
            </div>
            """, unsafe_allow_html=True)

        with col2:
            # Agent utilization
            days_to_saturate = 0
            for _, row in df.iterrows():
                if row["verified_merchants"] >= MAX_MERCHANTS * 0.8:
                    days_to_saturate = int(row["day"])
                    break
            if days_to_saturate == 0:
                days_to_saturate_text = "Not reached in 12 months"
            else:
                days_to_saturate_text = f"{days_to_saturate} days ({days_to_saturate//30} months)"

            st.markdown(f"""
            <div class="metric-card" style="text-align:left;">
                <h4 style="color:{BRAND_GOLD};font-family:'Outfit',sans-serif;">📊 Operations Intelligence</h4>
                <p style="font-size:14px;line-height:1.8;">
                    Time to 80% merchant saturation ({int(MAX_MERCHANTS*0.8)} merchants):<br>
                    <b>{days_to_saturate_text}</b><br><br>
                    Hybrid switch triggered at merchant #{hybrid_threshold}.<br>
                    Cost drops from <b>KES {PHYSICAL_VERIFY_COST_KES}</b> → <b>KES {HYBRID_VERIFY_COST_KES}</b> per verification.
                </p>
            </div>
            """, unsafe_allow_html=True)

    else:
        st.info("👈 Click **Run Simulation** in the sidebar to start.")

# ─── Footer ───────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    f"<div style='text-align:center;opacity:0.5;font-size:12px;'>"
    f"BizHub Network Simulation Engine v1.0 · Agent-Based + Monte Carlo · "
    f"Built with methodologies from Harvard HBS, Stanford MS&E, Yale OR</div>",
    unsafe_allow_html=True
)
