"""
BizHub Network Simulation — Core Engine
Implements all 4 simulation modules:
  A. Trust Flywheel (Agent-Based Network Effects)
  B. Verification Operations (Discrete-Event Logistics)
  C. Smart Leads Marketplace (Liquidity Simulation)
  D. Monte Carlo Financial Stress-Testing

Methodology: Harvard HBS experiential simulation + Stanford MS&E 252
Monte Carlo + Stanford CS 222 Agent-Based Modeling + Yale DES optimization.
"""
import random
import math
import numpy as np
import pandas as pd
from dataclasses import dataclass, field
from typing import List, Dict, Tuple
from agents import ConsumerAgent, MerchantAgent, VerificationAgent
from config import *


@dataclass
class DailySnapshot:
    """Captured state of the simulation at end of each day."""
    day: int
    month: int
    active_consumers: int
    active_merchants: int
    verified_merchants: int
    premium_merchants: int
    total_broadcasts: int
    total_leads_converted: int
    daily_revenue_kes: float
    cumulative_revenue_kes: float
    verification_cost_kes: float
    cumulative_verification_cost: float
    trust_index: float
    ai_queries: int
    consumer_join_rate: float
    merchant_join_rate: float


class BizHubSimulation:
    """
    The core simulation engine. Instantiate with optional parameter overrides
    and call run() to execute the full 12-month simulation.
    """

    def __init__(self, **overrides):
        # Allow parameter overrides for Monte Carlo and dashboard sliders
        self.premium_rate = overrides.get("premium_rate", PREMIUM_CONVERSION_RATE)
        self.consumer_churn = overrides.get("consumer_churn", CONSUMER_CHURN_RATE)
        self.merchant_churn = overrides.get("merchant_churn", MERCHANT_CHURN_RATE)
        self.cac = overrides.get("cac", CAC_PER_MERCHANT_KES)
        self.api_cost = overrides.get("api_cost", OPENAI_COST_PER_QUERY_KES)
        self.num_verification_agents = overrides.get("num_agents", VERIFICATION_AGENTS)
        self.hybrid_threshold = overrides.get("hybrid_threshold", HYBRID_SWITCH_THRESHOLD)
        self.town_name = overrides.get("town_name", TOWN_NAME)

        # Agent pools
        self.consumers: List[ConsumerAgent] = []
        self.merchants: List[MerchantAgent] = []
        self.verifiers: List[VerificationAgent] = []

        # Counters
        self.next_consumer_id = 0
        self.next_merchant_id = 0
        self.total_physical_verifications = 0
        self.cumulative_revenue = 0.0
        self.cumulative_verification_cost = 0.0

        # Timeline data
        self.snapshots: List[DailySnapshot] = []

        # Initialize seed agents
        self._seed_agents()

    def _seed_agents(self):
        """Seed the initial population of consumers, merchants, and verifiers."""
        for _ in range(INITIAL_CONSUMERS):
            self._add_consumer()
        for _ in range(INITIAL_MERCHANTS):
            self._add_merchant()
        for i in range(self.num_verification_agents):
            self.verifiers.append(VerificationAgent(i))

    def _add_consumer(self):
        c = ConsumerAgent(
            self.next_consumer_id,
            random.randint(0, TOWN_GRID_SIZE - 1),
            random.randint(0, TOWN_GRID_SIZE - 1)
        )
        self.consumers.append(c)
        self.next_consumer_id += 1

    def _add_merchant(self):
        m = MerchantAgent(
            self.next_merchant_id,
            random.randint(0, TOWN_GRID_SIZE - 1),
            random.randint(0, TOWN_GRID_SIZE - 1)
        )
        self.merchants.append(m)
        self.next_merchant_id += 1

    def run(self) -> pd.DataFrame:
        """
        Execute the full simulation over SIMULATION_MONTHS.
        Returns a DataFrame of daily snapshots.
        """
        total_days = SIMULATION_MONTHS * STEPS_PER_MONTH

        for day in range(1, total_days + 1):
            month = (day - 1) // STEPS_PER_MONTH + 1
            snapshot = self._simulate_day(day, month)
            self.snapshots.append(snapshot)

        return pd.DataFrame([s.__dict__ for s in self.snapshots])

    def _simulate_day(self, day: int, month: int) -> DailySnapshot:
        """Simulate a single day across all 4 modules."""

        # ─── Module A: Trust Flywheel ─────────────────────────────
        active_consumers = [c for c in self.consumers if c.active]
        active_merchants = [m for m in self.merchants if m.active]
        verified_merchants = [m for m in active_merchants if m.verified]

        verified_density = len(verified_merchants) / max(1, len(active_merchants))
        active_user_ratio = len(active_consumers) / max(1, MAX_CONSUMERS)

        # Consumer daily steps
        for c in active_consumers:
            c.step(verified_density, active_user_ratio)

        # New consumers joining (network effect)
        if len(self.consumers) < MAX_CONSUMERS:
            join_prob = BASE_CONSUMER_JOIN_PROB + (verified_density * VERIFIED_DENSITY_BOOST)
            remaining = MAX_CONSUMERS - len(active_consumers)
            new_consumers = max(2, int(join_prob * remaining * 0.03))
            for _ in range(min(new_consumers, MAX_CONSUMERS - len(self.consumers))):
                self._add_consumer()

        # ─── Module C: Smart Leads Marketplace ────────────────────
        broadcasts = sum(1 for c in active_consumers if c.has_broadcasted)

        # Merchant daily steps
        for m in active_merchants:
            m.step(broadcasts)

        # New merchants joining (demand-driven)
        if len(self.merchants) < MAX_MERCHANTS:
            lead_signal = min(1.0, broadcasts / max(1, len(active_consumers)) * 10)
            join_prob = BASE_MERCHANT_JOIN_PROB + (lead_signal * SMART_LEADS_BOOST)
            remaining = MAX_MERCHANTS - len(active_merchants)
            new_merchants = max(1, int(join_prob * remaining * 0.05))
            for _ in range(min(new_merchants, MAX_MERCHANTS - len(self.merchants))):
                self._add_merchant()

        # ─── Module B: Verification Operations ────────────────────
        daily_verification_cost = 0.0
        unverified = [m for m in active_merchants if not m.verified]
        random.shuffle(unverified)

        for v in self.verifiers:
            v.reset_daily()
            for m in unverified:
                if not m.verified:
                    success = v.verify_merchant(m, self.total_physical_verifications)
                    if success:
                        if not v.is_hybrid_mode:
                            self.total_physical_verifications += 1
                        daily_verification_cost += (
                            HYBRID_VERIFY_COST_KES if v.is_hybrid_mode
                            else PHYSICAL_VERIFY_COST_KES
                        )

        self.cumulative_verification_cost += daily_verification_cost

        # ─── Module D: Financial Calculations ─────────────────────
        verified_merchants = [m for m in active_merchants if m.verified]
        premium_merchants = [m for m in active_merchants if m.premium]

        # Daily revenue components
        premium_rev = len(premium_merchants) * (PREMIUM_SUBSCRIPTION_KES / 30)
        ad_rev = len(verified_merchants) * (AD_REVENUE_PER_MERCHANT_KES * 0.3 / 30)
        total_leads = sum(m.leads_converted for m in active_merchants)
        lead_rev = total_leads * LEAD_FEE_KES / max(1, day)  # amortize
        ai_queries = sum(c.searches_today for c in active_consumers)
        ai_cost = ai_queries * self.api_cost

        daily_revenue = (premium_rev + ad_rev + lead_rev) * GROSS_MARGIN - ai_cost
        daily_revenue = max(0, daily_revenue)
        self.cumulative_revenue += daily_revenue

        # Trust Index: composite metric
        trust_index = np.mean([c.trust_level for c in active_consumers]) if active_consumers else 0

        # Consumer join rate for tracking
        consumer_join_rate = (len(active_consumers) - INITIAL_CONSUMERS) / max(1, day)
        merchant_join_rate = (len(active_merchants) - INITIAL_MERCHANTS) / max(1, day)

        # Reset daily counters
        for c in active_consumers:
            c.reset_daily()

        return DailySnapshot(
            day=day,
            month=month,
            active_consumers=len([c for c in self.consumers if c.active]),
            active_merchants=len([m for m in self.merchants if m.active]),
            verified_merchants=len([m for m in self.merchants if m.active and m.verified]),
            premium_merchants=len([m for m in self.merchants if m.active and m.premium]),
            total_broadcasts=broadcasts,
            total_leads_converted=total_leads,
            daily_revenue_kes=daily_revenue,
            cumulative_revenue_kes=self.cumulative_revenue,
            verification_cost_kes=daily_verification_cost,
            cumulative_verification_cost=self.cumulative_verification_cost,
            trust_index=trust_index,
            ai_queries=ai_queries,
            consumer_join_rate=consumer_join_rate,
            merchant_join_rate=merchant_join_rate,
        )


def run_monte_carlo(n_runs: int = MONTE_CARLO_RUNS, **base_overrides) -> pd.DataFrame:
    """
    Run N simulations with randomized parameters.
    Returns a DataFrame with final-month metrics for each run.
    """
    results = []

    for i in range(n_runs):
        overrides = {
            **base_overrides,
            "premium_rate": random.uniform(*MC_CONVERSION_RANGE),
            "consumer_churn": random.uniform(*MC_CHURN_RANGE),
            "merchant_churn": random.uniform(0.01, 0.06),
            "cac": random.uniform(*MC_CAC_RANGE),
            "api_cost": random.uniform(*MC_API_COST_RANGE),
        }

        sim = BizHubSimulation(**overrides)
        df = sim.run()
        final = df.iloc[-1]

        results.append({
            "run": i,
            "annual_revenue_kes": final["cumulative_revenue_kes"],
            "final_consumers": final["active_consumers"],
            "final_merchants": final["active_merchants"],
            "final_verified": final["verified_merchants"],
            "final_premium": final["premium_merchants"],
            "verification_cost": final["cumulative_verification_cost"],
            "trust_index": final["trust_index"],
            "premium_rate": overrides["premium_rate"],
            "consumer_churn": overrides["consumer_churn"],
            "cac": overrides["cac"],
            "api_cost": overrides["api_cost"],
        })

    return pd.DataFrame(results)


# ─── Quick Test ──────────────────────────────────────────────────
if __name__ == "__main__":
    print("Running BizHub Simulation (Thika Pilot)...")
    sim = BizHubSimulation()
    df = sim.run()
    final = df.iloc[-1]
    print(f"\n{'='*50}")
    print(f"  SIMULATION RESULTS — {TOWN_NAME}")
    print(f"{'='*50}")
    print(f"  Active Consumers:     {final['active_consumers']:,}")
    print(f"  Active Merchants:     {final['active_merchants']:,}")
    print(f"  Verified Merchants:   {final['verified_merchants']:,}")
    print(f"  Premium Merchants:    {final['premium_merchants']:,}")
    print(f"  Trust Index:          {final['trust_index']:.2f}")
    print(f"  Annual Revenue:       KES {final['cumulative_revenue_kes']:,.0f}")
    print(f"  Verification Cost:    KES {final['cumulative_verification_cost']:,.0f}")
    print(f"{'='*50}")
