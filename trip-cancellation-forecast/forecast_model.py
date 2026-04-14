"""
Trip Cancellation Risk Forecast Model
======================================
Four-leg European summer trip — fuel/geopolitical disruption analysis.
Itinerary details are stored in itinerary_private.py (gitignored).

Model Last Updated: April 12, 2026

─── CHANGELOG ──────────────────────────────────────────────────────────────
v1  Apr  8: Initial model. Ceasefire announced; oil -15% to ~$95.
            Scenario C (breakdown) at 45%. Overall trip risk: 31.9%.

v2  Apr 12: Pakistan peace talks FAILED after 21+ hrs. Trump ordered
            US Naval blockade of Hormuz. Oil +7% to ~$101. Lufthansa
            pilot strike Apr 13-14 (80-90% flights grounded). Added
            charter/leisure leg type for Lufthansa Group leisure arm.
            Scenario C raised to 65%. Overall trip risk: 53.4%.
─────────────────────────────────────────────────────────────────────────────
NOTE: No itinerary details (routes, airports, dates, flight numbers) are
stored in this file. See itinerary_private.py (gitignored) for booking info.
"""

from dataclasses import dataclass
from typing import NamedTuple
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

# ─────────────────────────────────────────────────────────────
# MARKET DATA (updated April 12, 2026)
# ─────────────────────────────────────────────────────────────

OIL_DATA = {
    "pre_war_brent":      67,    # $/barrel — Feb 2026 baseline
    "peak_brent":        126,    # $/barrel — pre-ceasefire peak
    "ceasefire_low":      94,    # $/barrel — Apr 8 post-ceasefire dip
    "current_brent":     101,    # $/barrel — Apr 12 after blockade +7%
    "kerosene_pre_war":  0.50,   # $/liter
    "kerosene_current":  1.25,   # $/liter
}

PREDICTION_MARKETS = {
    # Polymarket estimates — adjusted post-failed Pakistan talks (Apr 12)
    "ceasefire_deal_by_june":  0.28,   # down from 51.5% pre-talks
    "oil_hits_130_by_june":    0.68,   # up from 57% pre-talks
    "ceasefire_by_year_end":   0.70,
}

AIRLINE_DATA = {
    "lh_fuel_hedged_pct":        0.80,   # 80% of 2026 fuel at pre-war prices
    "lh_capacity_cut_eval_pct":  0.05,   # evaluating 5% cut (~40 aircraft)
    "lh_new_hedging_suspended":  True,
    "lh_cabin_crew_strike_apr10": True,
    "lh_pilot_strike_apr13_14":   True,  # 80-90% cancellations expected
    "kerosene_pct_of_eu_from_gulf": 0.40,
    "hormuz_vessels_stranded":    600,
    "hormuz_daily_transits":        7,   # vs ~100 pre-war
}

# ─────────────────────────────────────────────────────────────
# SCENARIOS
# ─────────────────────────────────────────────────────────────

@dataclass
class Scenario:
    name: str
    short: str
    probability: float
    brent_june: float          # $/barrel forecast for trip month
    kerosene_june: float       # $/liter
    lh_capacity_cut: float     # Lufthansa mainline fleet reduction
    ew_capacity_cut: float     # Eurowings/LCC capacity reduction
    charter_capacity_cut: float  # Charter/leisure airline capacity reduction
    fuel_rationing_risk: float   # P(physical kerosene shortage at EU airports)
    lh_strike_risk: float        # P(Lufthansa mainline strike in trip month)
    # Per-leg disruption probabilities
    p_longhaul: float          # transatlantic mainline legs
    p_charter: float           # charter/leisure hub-to-island leg
    p_lcc: float               # LCC intra-EU leg

SCENARIOS = [
    Scenario(
        name="Scenario A — Ceasefire extends to permanent deal",
        short="A: Deal",
        probability=0.12,
        brent_june=72,
        kerosene_june=0.68,
        lh_capacity_cut=0.00,
        ew_capacity_cut=0.00,
        charter_capacity_cut=0.00,
        fuel_rationing_risk=0.02,
        lh_strike_risk=0.06,   # labor dispute independent of fuel
        p_longhaul=0.07,
        p_charter=0.04,
        p_lcc=0.03,
    ),
    Scenario(
        name="Scenario B — Ceasefire quietly extended, war frozen",
        short="B: Frozen",
        probability=0.23,
        brent_june=101,
        kerosene_june=1.10,
        lh_capacity_cut=0.03,
        ew_capacity_cut=0.06,
        charter_capacity_cut=0.08,
        fuel_rationing_risk=0.12,
        lh_strike_risk=0.09,
        p_longhaul=0.11,
        p_charter=0.13,
        p_lcc=0.10,
    ),
    Scenario(
        name="Scenario C — Ceasefire collapses, active war resumes",
        short="C: War",
        probability=0.65,
        brent_june=124,
        kerosene_june=1.55,
        lh_capacity_cut=0.10,
        ew_capacity_cut=0.18,
        charter_capacity_cut=0.22,
        fuel_rationing_risk=0.42,
        lh_strike_risk=0.14,
        p_longhaul=0.16,
        p_charter=0.30,
        p_lcc=0.28,
    ),
]

# ─────────────────────────────────────────────────────────────
# FLIGHT LEGS  — abstract types only, no itinerary details
# ─────────────────────────────────────────────────────────────

class Leg(NamedTuple):
    label: str
    leg_type: str   # "longhaul" | "charter" | "lcc"

LEGS = [
    Leg("Leg 1\nTransatlantic outbound\n(long-haul mainline)",  "longhaul"),
    Leg("Leg 2\nHub → Greek island\n(charter/leisure)",         "charter"),
    Leg("Leg 3\nGreek island → hub\n(LCC)",                     "lcc"),
    Leg("Leg 4\nTransatlantic return\n(long-haul mainline)",    "longhaul"),
]

# ─────────────────────────────────────────────────────────────
# CALCULATIONS
# ─────────────────────────────────────────────────────────────

def leg_p(leg: Leg, scenario: Scenario) -> float:
    return {"longhaul": scenario.p_longhaul,
            "charter":  scenario.p_charter,
            "lcc":      scenario.p_lcc}[leg.leg_type]

def weighted_p(leg: Leg) -> float:
    return sum(s.probability * leg_p(leg, s) for s in SCENARIOS)

def low_p(leg: Leg) -> float:
    """Best-case: Scenario A probability applied to all scenarios."""
    return leg_p(leg, SCENARIOS[0])

def high_p(leg: Leg) -> float:
    """Worst-case: Scenario C probability."""
    return leg_p(leg, SCENARIOS[2])

def trip_risk(probs):
    p_ok = 1.0
    for p in probs:
        p_ok *= (1 - p)
    return 1 - p_ok

def expected_brent():
    return sum(s.probability * s.brent_june for s in SCENARIOS)

def classify(p: float) -> str:
    if p < 0.05:  return "LOW"
    if p < 0.12:  return "MODERATE"
    if p < 0.25:  return "ELEVATED"
    return "HIGH"

# ─────────────────────────────────────────────────────────────
# CHART — probability bands per leg + oil price scenarios
# ─────────────────────────────────────────────────────────────

RISK_COLORS = {
    "LOW":      "#2ecc71",
    "MODERATE": "#f1c40f",
    "ELEVATED": "#e67e22",
    "HIGH":     "#e74c3c",
}

def make_chart(output_path="trip_risk_chart.png"):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    fig.patch.set_facecolor("#0f1117")
    for ax in (ax1, ax2):
        ax.set_facecolor("#1a1d27")
        ax.tick_params(colors="white")
        ax.xaxis.label.set_color("white")
        ax.yaxis.label.set_color("white")
        ax.title.set_color("white")
        for spine in ax.spines.values():
            spine.set_edgecolor("#444")

    # ── Chart 1: Per-leg disruption probability bands ─────────────────────
    labels = [l.label for l in LEGS]
    central = [weighted_p(l) * 100 for l in LEGS]
    low     = [low_p(l)      * 100 for l in LEGS]
    high    = [high_p(l)     * 100 for l in LEGS]

    x = np.arange(len(LEGS))
    bar_colors = [RISK_COLORS[classify(weighted_p(l))] for l in LEGS]

    bars = ax1.bar(x, central, color=bar_colors, alpha=0.85, zorder=3, width=0.5)
    ax1.errorbar(x, central,
                 yerr=[np.array(central) - np.array(low),
                       np.array(high) - np.array(central)],
                 fmt="none", color="white", capsize=8, linewidth=2, zorder=4)

    ax1.set_xticks(x)
    ax1.set_xticklabels(labels, fontsize=8, color="white")
    ax1.set_ylabel("Disruption probability (%)", color="white")
    ax1.set_title("Per-Leg Disruption Risk\n(bar = central estimate  |  whiskers = low/high band)",
                  color="white", fontsize=10)
    ax1.set_ylim(0, 50)
    ax1.yaxis.grid(True, color="#333", linestyle="--", alpha=0.7, zorder=0)
    ax1.set_axisbelow(True)

    for bar, c, lo, hi in zip(bars, central, low, high):
        ax1.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1.5,
                 f"{c:.0f}%", ha="center", va="bottom", color="white",
                 fontsize=9, fontweight="bold")

    # Risk zone bands
    for ymin, ymax, label, alpha in [(0, 5, "LOW", 0.06),
                                      (5, 12, "MODERATE", 0.06),
                                      (12, 25, "ELEVATED", 0.06),
                                      (25, 50, "HIGH", 0.06)]:
        ax1.axhspan(ymin, ymax,
                    color=RISK_COLORS[label], alpha=alpha, zorder=1)

    legend_patches = [mpatches.Patch(color=v, label=k)
                      for k, v in RISK_COLORS.items()]
    ax1.legend(handles=legend_patches, loc="upper left",
               facecolor="#1a1d27", labelcolor="white", fontsize=8,
               edgecolor="#444")

    # ── Chart 2: Overall trip risk across scenarios ───────────────────────
    scenario_labels = [s.short for s in SCENARIOS]
    scenario_probs  = [s.probability * 100 for s in SCENARIOS]

    # Per-scenario trip risk (all legs)
    trip_risks = []
    for s in SCENARIOS:
        ps = [leg_p(l, s) for l in LEGS]
        trip_risks.append(trip_risk(ps) * 100)

    s_colors = ["#2ecc71", "#f1c40f", "#e74c3c"]
    bars2 = ax2.bar(scenario_labels, trip_risks, color=s_colors,
                    alpha=0.85, zorder=3, width=0.4)

    # Weighted overall risk line
    overall = trip_risk([weighted_p(l) for l in LEGS]) * 100
    ax2.axhline(overall, color="white", linestyle="--", linewidth=1.5,
                label=f"Weighted overall: {overall:.0f}%", zorder=4)

    ax2.set_ylabel("P(at least one leg disrupted) %", color="white")
    ax2.set_title("Overall Trip Risk by Scenario\n(dashed = probability-weighted estimate)",
                  color="white", fontsize=10)
    ax2.set_ylim(0, 100)
    ax2.yaxis.grid(True, color="#333", linestyle="--", alpha=0.7, zorder=0)
    ax2.set_axisbelow(True)

    for bar, tr, sp in zip(bars2, trip_risks, scenario_probs):
        ax2.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 1.5,
                 f"Trip risk: {tr:.0f}%\n(scenario P={sp:.0f}%)",
                 ha="center", va="bottom", color="white", fontsize=8)

    ax2.legend(facecolor="#1a1d27", labelcolor="white",
               edgecolor="#444", fontsize=9)

    # Scenario probability annotations
    for bar, sp, sc in zip(bars2, scenario_probs, SCENARIOS):
        ax2.text(bar.get_x() + bar.get_width() / 2, -8,
                 f"P={sp:.0f}%", ha="center", va="top",
                 color="white", fontsize=8)

    fig.suptitle("Flight Disruption Risk Forecast — European Summer Trip\n"
                 "Model date: April 12, 2026  |  Geopolitical driver: Iran war / Strait of Hormuz",
                 color="white", fontsize=11, y=1.01)

    plt.tight_layout()
    plt.savefig(output_path, dpi=150, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    plt.close()
    print(f"Chart saved → {output_path}")

# ─────────────────────────────────────────────────────────────
# TEXT REPORT
# ─────────────────────────────────────────────────────────────

def run_report():
    print("=" * 68)
    print("FLIGHT DISRUPTION RISK FORECAST  [v2 — April 12, 2026]")
    print("Four-leg European summer trip")
    print("=" * 68)

    print("\n[WHAT CHANGED SINCE APRIL 8]")
    print("-" * 68)
    events = [
        ("Apr 9-10", "Hormuz traffic barely moved — only 4-7 vessels/day (was ~100+)"),
        ("Apr 10",   "Lufthansa cabin crew strike: ~580 flights canceled"),
        ("Apr 11",   "Pilot union calls 2-day strike Apr 13-14 (80-90% cancellations)"),
        ("Apr 12",   "US-Iran peace talks in Pakistan FAIL after 21+ hours"),
        ("Apr 12",   "Trump orders US Navy blockade of Hormuz 'effective immediately'"),
        ("Apr 12",   "Oil futures +7% on blockade news; Brent ~$101/barrel"),
    ]
    for date, note in events:
        print(f"  {date:<10} {note}")

    print("\n[1] SCENARIOS FOR TRIP MONTH (JUNE 2026)")
    print("-" * 68)
    for s in SCENARIOS:
        print(f"\n  {s.name}  (P = {s.probability:.0%})")
        print(f"    Brent forecast:        ${s.brent_june}/barrel")
        print(f"    Kerosene:              ${s.kerosene_june:.2f}/liter")
        print(f"    LH mainline cut:       {s.lh_capacity_cut:.0%}")
        print(f"    Eurowings/LCC cut:     {s.ew_capacity_cut:.0%}")
        print(f"    Charter/leisure cut:   {s.charter_capacity_cut:.0%}")
        print(f"    EU rationing risk:     {s.fuel_rationing_risk:.0%}")
        print(f"    LH strike risk:        {s.lh_strike_risk:.0%}")

    print(f"\n  Expected Brent (weighted): ${expected_brent():.0f}/barrel")

    print("\n[2] PER-LEG DISRUPTION RISK")
    print("-" * 68)
    all_central = []
    for leg in LEGS:
        c = weighted_p(leg)
        lo = low_p(leg)
        hi = high_p(leg)
        all_central.append(c)
        print(f"\n  {leg.label.replace(chr(10), ' | ')}")
        print(f"    Central estimate: {c:.1%}  [{classify(c)}]")
        print(f"    Low  (Scenario A): {lo:.1%}")
        print(f"    High (Scenario C): {hi:.1%}")

    print("\n[3] OVERALL TRIP RISK")
    print("-" * 68)
    overall = trip_risk(all_central)
    lo_overall = trip_risk([low_p(l) for l in LEGS])
    hi_overall = trip_risk([high_p(l) for l in LEGS])
    v1_risk = 0.319
    print(f"\n  Low  band (Scenario A):       {lo_overall:.1%}")
    print(f"  Central estimate (weighted):  {overall:.1%}  [{classify(overall)}]")
    print(f"  High band (Scenario C):       {hi_overall:.1%}")
    print(f"\n  Change vs. v1 (Apr 8):  {v1_risk:.1%} → {overall:.1%}  (+{overall-v1_risk:.1%})")

    print("\n[4] OIL PRICE TRIPWIRES")
    print("-" * 68)
    tripwires = [
        ("< $85",      "LOW",      "De-escalation underway — trip very likely fine"),
        ("$85-100",    "MODERATE", "Manageable; monitor closely"),
        ("$100-115",   "ELEVATED", "Capacity cuts likely — recheck all legs ← NOW"),
        ("$115-130",   "HIGH",     "Rationing risk real — build contingency plan"),
        ("> $130",     "CRITICAL", "European cancellations highly probable"),
    ]
    for band, level, note in tripwires:
        marker = "  ◄ YOU ARE HERE" if "100-115" in band else ""
        print(f"  Brent {band:<12}  [{level:<8}]  {note}{marker}")

    print("\n[5] KEY DATES")
    print("-" * 68)
    dates = [
        ("Apr 13-14",  "Lufthansa pilot strike — 80-90% of flights canceled"),
        ("Apr 22",     "CEASEFIRE EXPIRES — single most important date for this trip"),
        ("Late Apr",   "Will Iran accept blockade terms? New talks scheduled?"),
        ("May 1-15",   "Summer schedule lock-in window (Lufthansa Group)"),
        ("June 1",     "IATA summer peak — capacity effectively frozen"),
    ]
    for date, note in dates:
        print(f"  {date:<12}  {note}")

    print("\n[6] RECOMMENDATIONS")
    print("-" * 68)
    recs = [
        "Get 'cancel for any reason' (CFAR) travel insurance immediately.",
        "Leg 2 (charter/leisure) is highest-risk — identify alternate routing now.",
        "Leg 2 fare is NON-REFUNDABLE — if airline cancels, EU261 applies (full refund).",
        "April 22 is your decision checkpoint: if ceasefire collapses, escalate plan.",
        "Monitor Lufthansa Group labor news — unresolved by May = elevated June risk.",
        "Brent crossing $115 = time to seriously consider contingency options.",
        "Call airline now if on non-flexible fares — may waive change fees during crisis.",
    ]
    for i, r in enumerate(recs, 1):
        print(f"  {i}. {r}")

    print("\n[SOURCES — April 9-12, 2026]")
    print("-" * 68)
    print("  Oil/blockade:  CNBC, Fortune, Bloomberg, CoinDesk (Apr 12)")
    print("  Peace talks:   NBC News, Al Jazeera, Time, PBS, The National (Apr 12)")
    print("  Hormuz:        CNN Business, CNBC, S&P Global/Kpler vessel counts")
    print("  Airlines:      LoyaltyLobby, One Mile at a Time, Bloomberg, AeroTime")
    print("  Pred. markets: Polymarket (adjusted post-failed-talks estimates)")
    print("=" * 68)


if __name__ == "__main__":
    run_report()
    make_chart("trip-cancellation-forecast/trip_risk_chart.png")
