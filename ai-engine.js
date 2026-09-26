"use strict";

/* =========================================
   FOODRESCUE — AI INTELLIGENCE ENGINE
========================================= */

function analyzeSurplusWithAI({
    foodType,
    quantity,
    unit,
    availableFrom,
    expiryTime,
    location,
    notes = ""
}) {

    const insights = [];

    const normalizedNotes =
        notes.toLowerCase();

    const highRiskWords = [
        "urgent",
        "immediate",
        "spoiling",
        "expire",
        "fresh",
        "leftover",
        "waste"
    ];

    const detectedSignals =
        highRiskWords.filter(
            word =>
                normalizedNotes.includes(word)
        );


    if (
        foodType === "prepared" ||
        foodType === "dairy"
    ) {

        insights.push(
            "Highly perishable food detected."
        );

    }


    if (quantity >= 50) {

        insights.push(
            "Large-volume surplus detected."
        );

    }


    if (detectedSignals.length) {

        insights.push(
            `Risk signals detected: ${detectedSignals.join(", ")}.`
        );

    }


    if (availableFrom && expiryTime) {

        insights.push(
            "A defined rescue window is available for operational planning."
        );

    }


    return {

        summary:
            `FoodRescue AI analyzed ${quantity} ${unit} of ${foodType} in ${location}.`,

        riskSignals:
            detectedSignals,

        insights,

        suggestedAction:
            quantity >= 50
                ? "Prioritize multiple nearby recipients and begin coordination immediately."
                : "Prioritize the nearest compatible recipient and prepare collection.",

        confidence:
            Math.min(
                96,
                72 +
                detectedSignals.length * 4 +
                (quantity >= 20 ? 8 : 0)
            )

    };

}


/* =========================================
   EXPLAIN DECISION
========================================= */

function explainRescueDecision({
    score,
    matchScore,
    distance,
    capacity
}) {

    const reasons = [];

    if (score >= 80) {
        reasons.push(
            "High urgency"
        );
    }

    else if (score >= 60) {
        reasons.push(
            "Elevated urgency"
        );
    }

    if (matchScore >= 90) {
        reasons.push(
            "Excellent recipient compatibility"
        );
    }

    else if (matchScore >= 75) {
        reasons.push(
            "Strong recipient compatibility"
        );
    }

    if (distance <= 3) {
        reasons.push(
            "Very short collection distance"
        );
    }

    if (capacity > 0) {
        reasons.push(
            "Recipient capacity is available"
        );
    }

    return reasons;
}