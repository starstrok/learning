"""
Trip Cancellation Risk Forecast Model
======================================
Four-leg European summer trip — fuel/geopolitical disruption analysis.
Itinerary details are stored in itinerary_private.py (gitignored).

Model Last Updated: April 23, 2026

─── CHANGELOG ──────────────────────────────────────────────────────────────
v1  Apr  8: Initial model. Ceasefire announced; oil -15% to ~$95.
            Scenario C (breakdown) at 45%. Overall trip risk: 31.9%.

v2  Apr 12: Pakistan peace talks FAILED. US Naval blockade ordered.
            Oil +7% to ~$101. LH pilot strike Apr 13-14. Scenario C
            raised to 65%. Overall trip risk: 53.4%.

v3  Apr 23: Trump extended ceasefire on Apr 22 (not collapsed).
            Iran seized 2 ships anyway — Hormuz still effectively
            closed (3 transits Apr 19). Oil $103. Jet fuel up 106%
            YoY to $188/barrel. Lufthansa Group cancels 20,000
            short-haul flights through Oct (120/day, full list due
            late Apr/May). LH+EW pilot strike Apr 16-17. Scenario B
            (frozen war) raised to 40%; C lowered to 45%.
            Overall trip risk: 55.1%.
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
# MARKET DATA (updated April 23, 2026)
# ─────────────────────────────────────────────────────────────

OIL_DATA = {
    "pre_war_brent":        67,    # $/barrel — Feb 2026 baseline
    "peak_brent":          126,    # $/barrel — pre-ceasefire peak
    "ceasefire_low":        94,    # $/barrel — Apr 8 post-ceasefire dip
    "current_brent":       103,    # $/barrel — Apr 23
    "jet_fuel_barrel":     188,    # $/barrel jet fuel — up 106.5% YoY
    "kerosene_pre_war":   0.50,    # $/liter
    "kerosene_current":   1.30,    # $/liter (up from $1.25)
}

PREDICTION_MARKETS = {
    # Estimates adjusted post-ceasefire-extension (Apr 23)
    "ceasefire_deal_by_june":  0.32,   # slight uptick — extension buys time
    "oil_hits_130_by_june":    0.61,   # down from 68% — war not resumed yet
    "ceasefire_by_year_end":   0.72,
}

AIRLINE_DATA = {
    "lh_fuel_hedged_pct":           0.80,   # 80% of 2026 fuel at pre-war prices
    "lh_flights_cancelled":        20_000,  # NEW: LH Group cancels 20k short-haul through Oct
    "lh_daily_cancellations":         120,  # 120/day through end of May
    "lh_new_hedging_suspended":      True,
    "lh_cabin_crew_strike_apr10":    True,
    "lh_pilot_strike_apr13_14":      True,
    "lh_ew_pilot_strike_apr16_17":   True,  # NEW: Eurowings also struck Apr 16-17
    "full_route_cut_list_due":    "Late April / Early May 2026",
    "kerosene_pct_of_eu_from_gulf": 0.40,
    "hormuz_vessels_stranded":        600,
    "hormuz_daily_transits":            3,  # dropped to 3 on Apr 19 (was 7)
    "iran_ships_seized_post_ext":       2,  # Iran seized 2 ships after ceasefire extended
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
        name="Scenario A — Ceasefire leads to permanent deal",
        short="A: Deal",
        probability=0.15,   # up from 0.12 — extension buys negotiating time
        brent_june=78,
        kerosene_june=0.72,
        lh_capacity_cut=0.02,   # some cuts already locked in
        ew_capacity_cut=0.03,
        charter_capacity_cut=0.02,
        fuel_rationing_risk=0.02,
        lh_strike_risk=0.06,
        p_longhaul=0.08,
        p_charter=0.06,
        p_lcc=0.05,
    ),
    Scenario(
        name="Scenario B — Frozen ceasefire, no resolution",
        short="B: Frozen",
        probability=0.40,   # up from 0.23 — this is essentially current reality
        brent_june=105,
        kerosene_june=1.30,
        lh_capacity_cut=0.08,   # 20k cuts already announced
        ew_capacity_cut=0.10,
        charter_capacity_cut=0.12,
        fuel_rationing_risk=0.20,
        lh_strike_risk=0.11,
        p_longhaul=0.13,
        p_charter=0.22,   # short-haul leisure routes in cut zone
        p_lcc=0.18,
    ),
    Scenario(
        name="Scenario C — Ceasefire collapses, active war resumes",
        short="C: War",
        probability=0.45,   # down from 0.65 — extension reduces near-term risk
        brent_june=126,
        kerosene_june=1.60,
        lh_capacity_cut=0.12,
        ew_capacity_cut=0.20,
        charter_capacity_cut=0.28,
        fuel_rationing_risk=0.48,
        lh_strike_risk=0.15,
        p_longhaul=0.17,
        p_charter=0.35,
        p_lcc=0.31,
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
    print("FLIGHT DISRUPTION RISK FORECAST  [v3 — April 23, 2026]")
    print("Four-leg European summer trip")
    print("=" * 68)

    print("\n[WHAT CHANGED SINCE APRIL 12]")
    print("-" * 68)
    events = [
        ("Apr 13-14", "LH pilot strike: 80-90% of mainline flights canceled"),
        ("Apr 16-17", "Second pilot strike — LH AND Eurowings both grounded"),
        ("Apr 18",    "Iran re-closes Hormuz after US refuses to lift port blockade"),
        ("Apr 19",    "Hormuz transits hit new low: 3 vessels (was 7, pre-war was 100+)"),
        ("Apr 21",    "Jet fuel hits $188/barrel — up 106.5% year-over-year"),
        ("Apr 22",    "Ceasefire deadline: Trump EXTENDS it (no collapse, but no deal)"),
        ("Apr 22",    "Iran seizes 2 ships in Hormuz hours after extension announced"),
        ("Apr 22",    "Lufthansa Group cancels 20,000 short-haul flights through Oct"),
        ("Apr 22",    "120 daily LH Group cancellations — full route list due late Apr/May"),
        ("Apr 23",    "Brent crude $103.38 — holding in ELEVATED band"),
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

    print("\n[5] KEY DATES AHEAD")
    print("-" * 68)
    dates = [
        ("Late Apr",   "Lufthansa full 20,000-cut route list published — CHECK IT"),
        ("Late Apr",   "Iran 3-5 day deadline to submit unified peace proposal"),
        ("May 1-15",   "Summer schedule lock-in window (Lufthansa Group)"),
        ("June 1",     "IATA summer peak — capacity effectively frozen"),
    ]
    for date, note in dates:
        print(f"  {date:<12}  {note}")

    print("\n[6] RECOMMENDATIONS")
    print("-" * 68)
    recs = [
        "URGENT: Check the Lufthansa Group full route cut list when published (late Apr).",
        "Leg 2 (charter/leisure, short-haul) is in the exact category being cut — act now.",
        "Leg 2 is NON-REFUNDABLE — if airline cancels, EU261/2004 applies (full refund).",
        "Leg 3 (LCC, intra-EU) — Eurowings struck twice; check route status weekly.",
        "Get 'cancel for any reason' (CFAR) travel insurance if not already done.",
        "Iran has 3-5 days to submit peace proposal — watch late April closely.",
        "Brent crossing $115 = seriously consider contingency options.",
        "Call airlines now — many waiving change fees during the fuel crisis.",
    ]
    for i, r in enumerate(recs, 1):
        print(f"  {i}. {r}")

    print("\n[SOURCES — April 13-23, 2026]")
    print("-" * 68)
    print("  Oil:           Oneindia, Fortune, Trading Economics (Apr 23)")
    print("  Ceasefire:     CNN, Time, NBC News, CFR, CBS News (Apr 21-22)")
    print("  Hormuz:        CNBC, Al Jazeera, NPR, Windward AI (Apr 18-22)")
    print("  Airlines:      Euronews, Brussels Signal, Live & Let's Fly (Apr 22)")
    print("  LH strikes:    Lufthansa Experts Irreg (Apr 16-17 announcement)")
    print("  Fuel prices:   Economy Class & Beyond, Young Research (Apr 22)")
    print("=" * 68)


if __name__ == "__main__":
    run_report()
    make_chart("trip-cancellation-forecast/trip_risk_chart.png")
