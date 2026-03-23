"""
BizHub Network Simulation — Agent Definitions
Implements ConsumerAgent, MerchantAgent, and VerificationAgent
following Stanford CS 222 Agent-Based Modeling principles.
"""
import random
import math
from config import *


class ConsumerAgent:
    """
    A consumer in the BizHub town ecosystem.
    Decisions are influenced by verified business density and peer recommendations.
    """
    def __init__(self, agent_id: int, x: int, y: int):
        self.id = agent_id
        self.x = x
        self.y = y
        self.active = True
        self.trust_level = random.uniform(0.1, 0.5)  # starts low
        self.searches_today = 0
        self.days_active = 0
        self.has_broadcasted = False

    def step(self, verified_density: float, active_user_ratio: float):
        """Daily step: update trust, maybe search, maybe broadcast, maybe churn."""
        if not self.active:
            return

        self.days_active += 1

        # Trust grows with verified merchant density (network effect)
        trust_growth = verified_density * VERIFIED_DENSITY_BOOST
        peer_boost = active_user_ratio * PEER_RECOMMENDATION_FACTOR
        self.trust_level = min(1.0, self.trust_level + trust_growth + peer_boost)

        # AI search activity scales with trust
        if random.random() < DAILY_AI_QUERIES_PER_USER * self.trust_level:
            self.searches_today += 1

        # Smart Leads broadcast
        self.has_broadcasted = random.random() < DAILY_BROADCAST_PROB * self.trust_level

        # Monthly churn check (run once per 30 steps)
        if self.days_active % 30 == 0:
            churn_prob = CONSUMER_CHURN_RATE * (1 - self.trust_level)
            if random.random() < churn_prob:
                self.active = False

    def reset_daily(self):
        self.searches_today = 0
        self.has_broadcasted = False


class MerchantAgent:
    """
    A local business on the BizHub platform.
    Joins based on consumer demand signals, may upgrade to premium.
    """
    CATEGORIES = [
        "Restaurant", "Plumber", "Electrician", "Salon", "Hardware",
        "Grocery", "Pharmacy", "Clothing", "Auto Repair", "Fitness",
        "Café", "Bakery", "Dentist", "Lawyer", "Photography"
    ]

    def __init__(self, agent_id: int, x: int, y: int):
        self.id = agent_id
        self.x = x
        self.y = y
        self.active = True
        self.category = random.choice(self.CATEGORIES)
        self.verified = False
        self.premium = False
        self.leads_received = 0
        self.leads_converted = 0
        self.days_on_platform = 0
        self.monthly_revenue = 0.0

    def step(self, broadcast_count: int):
        """Daily step: receive leads, maybe convert, track revenue."""
        if not self.active:
            return

        self.days_on_platform += 1

        # Receive leads from broadcasts
        if broadcast_count > 0 and self.verified:
            matching_prob = 1.0 / len(self.CATEGORIES)  # simplified category matching
            for _ in range(broadcast_count):
                if random.random() < matching_prob:
                    self.leads_received += 1
                    if random.random() < BID_RESPONSE_PROB:
                        if random.random() < BID_ACCEPTANCE_PROB:
                            self.leads_converted += 1

        # Premium upgrade decision (monthly)
        if self.days_on_platform % 30 == 0 and self.verified and not self.premium:
            # More leads = higher chance of upgrading
            lead_factor = min(1.0, self.leads_received / 10)
            upgrade_prob = PREMIUM_CONVERSION_RATE * (0.5 + 0.5 * lead_factor)
            if random.random() < upgrade_prob:
                self.premium = True

        # Monthly churn
        if self.days_on_platform % 30 == 0:
            if random.random() < MERCHANT_CHURN_RATE:
                self.active = False

    def calculate_monthly_revenue(self) -> float:
        """Calculate this merchant's monthly revenue contribution to BizHub."""
        rev = 0.0
        if self.premium:
            rev += PREMIUM_SUBSCRIPTION_KES
        if self.verified:
            rev += AD_REVENUE_PER_MERCHANT_KES * 0.3  # not all run ads
        rev += self.leads_converted * LEAD_FEE_KES
        self.monthly_revenue = rev
        return rev


class VerificationAgent:
    """
    A field agent who physically verifies businesses.
    Models the discrete-event logistics of traveling to and verifying shops.
    """
    def __init__(self, agent_id: int):
        self.id = agent_id
        self.hours_remaining = AGENT_DAILY_HOURS
        self.total_verified = 0
        self.total_cost = 0.0
        self.is_hybrid_mode = False

    def verify_merchant(self, merchant: MerchantAgent, total_physical_done: int) -> bool:
        """
        Attempt to verify a merchant. Returns True if successful.
        Switches to hybrid mode after threshold is reached.
        """
        if merchant.verified:
            return False

        # Determine verification mode
        if total_physical_done >= HYBRID_SWITCH_THRESHOLD:
            self.is_hybrid_mode = True

        if self.is_hybrid_mode:
            # Hybrid: instant, cheap
            cost = HYBRID_VERIFY_COST_KES
            time_needed = 0.1  # 6 minutes
        else:
            # Physical: slow, expensive
            cost = PHYSICAL_VERIFY_COST_KES
            time_needed = PHYSICAL_VERIFY_TIME_HOURS

        if self.hours_remaining >= time_needed:
            self.hours_remaining -= time_needed
            self.total_cost += cost
            self.total_verified += 1
            merchant.verified = True
            return True

        return False

    def reset_daily(self):
        self.hours_remaining = AGENT_DAILY_HOURS
