"use strict";

/* =========================================
   FOODRESCUE — AI INTELLIGENCE ENGINE
   Rule-based rescue intelligence layer
========================================= */


/* =========================================
   NORMALIZATION HELPERS
========================================= */

function aiSafeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function aiNormalizeText(
    value
) {

    return String(
        value ?? ""
    )
        .trim()
        .toLowerCase();

}


function aiNormalizeFoodType(
    foodType
) {

    const normalized =
        aiNormalizeText(
            foodType
        );

    if (
        normalized === "fruit" ||
        normalized === "fruits"
    ) {

        return "fruits";

    }

    return normalized;

}


/* =========================================
   RESCUE WINDOW ANALYSIS
========================================= */

function analyzeRescueWindow(
    availableFrom,
    expiryTime
) {

    const result = {

        hasWindow:
            Boolean(
                availableFrom &&
                expiryTime
            ),

        urgency:
            "normal",

        message:
            null

    };


    if (
        !availableFrom ||
        !expiryTime
    ) {

        return result;

    }


    const now =
        new Date();


    const currentMinutes =
        (
            now.getHours() * 60
        ) +
        now.getMinutes();


    const startParts =
        String(
            availableFrom
        )
            .split(":")
            .map(Number);


    const expiryParts =
        String(
            expiryTime
        )
            .split(":")
            .map(Number);


    if (
        startParts.length < 2 ||
        expiryParts.length < 2 ||
        startParts.some(
            value =>
                !Number.isFinite(value)
        ) ||
        expiryParts.some(
            value =>
                !Number.isFinite(value)
        )
    ) {

        return result;

    }


    const startMinutes =
        (
            startParts[0] * 60
        ) +
        startParts[1];


    const expiryMinutes =
        (
            expiryParts[0] * 60
        ) +
        expiryParts[1];


    /*
       Handle rescue windows that cross midnight.
    */
    let adjustedExpiry =
        expiryMinutes;


    if (
        adjustedExpiry <=
        startMinutes
    ) {

        adjustedExpiry += 1440;

    }


    let adjustedCurrent =
        currentMinutes;


    if (
        adjustedCurrent <
        startMinutes &&
        adjustedExpiry >
        1440
    ) {

        adjustedCurrent += 1440;

    }


    const minutesRemaining =
        adjustedExpiry -
        adjustedCurrent;


    if (
        minutesRemaining <= 0
    ) {

        result.urgency =
            "expired";

        result.message =
            "The stated rescue window has expired.";

        return result;

    }


    if (
        minutesRemaining <= 60
    ) {

        result.urgency =
            "critical";

        result.message =
            `Only ${minutesRemaining} minutes remain in the stated rescue window.`;

        return result;

    }


    if (
        minutesRemaining <= 180
    ) {

        result.urgency =
            "high";

        result.message =
            `${minutesRemaining} minutes remain in the stated rescue window.`;

        return result;

    }


    result.urgency =
        "normal";

    result.message =
        "A defined rescue window is available for operational planning.";

    return result;

}


/* =========================================
   ANALYZE SURPLUS
========================================= */

function analyzeSurplusWithAI({

    foodType,
    quantity,
    unit,
    availableFrom,
    expiryTime,
    location,
    notes = ""

} = {}) {


    const safeFoodType =
        aiNormalizeFoodType(
            foodType
        );


    const safeQuantity =
        Math.max(
            0,
            aiSafeNumber(
                quantity
            )
        );


    const safeUnit =
        String(
            unit ?? "items"
        )
            .trim() ||
        "items";


    const safeLocation =
        String(
            location ?? "Unknown location"
        )
            .trim() ||
        "Unknown location";


    const normalizedNotes =
        aiNormalizeText(
            notes
        );


    const insights = [];

    const detectedSignals = [];


/* =========================================
   FOOD PERISHABILITY
========================================= */

    const highlyPerishableFoods = [

        "prepared",

        "dairy"

    ];


    const perishableFoods = [

        "fruits",

        "vegetables"

    ];


    let perishability =
        "standard";


    if (
        highlyPerishableFoods.includes(
            safeFoodType
        )
    ) {

        perishability =
            "high";

        insights.push(
            "Highly perishable food detected."
        );

    }

    else if (
        perishableFoods.includes(
            safeFoodType
        )
    ) {

        perishability =
            "medium";

        insights.push(
            "Perishable food detected; timely collection is recommended."
        );

    }


/* =========================================
   NOTE-BASED RISK SIGNALS
========================================= */

    const riskPatterns = [

        {
            key:
                "urgent",

            patterns: [
                "urgent",
                "urgently",
                "asap",
                "immediately"
            ]
        },

        {
            key:
                "spoiling",

            patterns: [
                "spoiling",
                "spoiled",
                "going bad",
                "turning bad"
            ]
        },

        {
            key:
                "expiry",

            patterns: [
                "expire",
                "expires",
                "expired",
                "expiry"
            ]
        },

        {
            key:
                "leftover",

            patterns: [
                "leftover",
                "leftovers"
            ]
        },

        {
            key:
                "waste",

            patterns: [
                "waste",
                "food waste"
            ]
        }

    ];


    for (
        const signal of
        riskPatterns
    ) {

        const detected =
            signal.patterns.some(
                pattern =>
                    normalizedNotes.includes(
                        pattern
                    )
            );


        if (detected) {

            detectedSignals.push(
                signal.key
            );

        }

    }


    if (
        detectedSignals.length
    ) {

        insights.push(
            `Risk signals detected: ${detectedSignals.join(", ")}.`
        );

    }


/* =========================================
   QUANTITY ANALYSIS
========================================= */

    if (
        safeQuantity >= 100
    ) {

        insights.push(
            "Very large-volume surplus detected; multiple recipients may be required."
        );

    }

    else if (
        safeQuantity >= 50
    ) {

        insights.push(
            "Large-volume surplus detected."
        );

    }

    else if (
        safeQuantity >= 20
    ) {

        insights.push(
            "Moderate-volume surplus detected."
        );

    }


/* =========================================
   RESCUE WINDOW
========================================= */

    const rescueWindow =
        analyzeRescueWindow(
            availableFrom,
            expiryTime
        );


    if (
        rescueWindow.message
    ) {

        insights.push(
            rescueWindow.message
        );

    }


/* =========================================
   URGENCY SIGNAL CALCULATION
========================================= */

    let urgencyPoints =
        0;


    if (
        perishability === "high"
    ) {

        urgencyPoints += 25;

    }

    else if (
        perishability === "medium"
    ) {

        urgencyPoints += 12;

    }


    urgencyPoints +=
        Math.min(
            24,
            detectedSignals.length * 8
        );


    if (
        rescueWindow.urgency ===
        "critical"
    ) {

        urgencyPoints += 35;

    }

    else if (
        rescueWindow.urgency ===
        "high"
    ) {

        urgencyPoints += 20;

    }

    else if (
        rescueWindow.urgency ===
        "expired"
    ) {

        urgencyPoints += 45;

    }


    if (
        safeQuantity >= 100
    ) {

        urgencyPoints += 12;

    }

    else if (
        safeQuantity >= 50
    ) {

        urgencyPoints += 8;

    }

    else if (
        safeQuantity >= 20
    ) {

        urgencyPoints += 4;

    }


    urgencyPoints =
        Math.min(
            100,
            urgencyPoints
        );


/* =========================================
   SUGGESTED ACTION
========================================= */

    let suggestedAction =
        "Prioritize a compatible nearby recipient and prepare collection.";


    if (
        rescueWindow.urgency ===
        "expired"
    ) {

        suggestedAction =
            "Verify the food is still safe before attempting another rescue.";

    }

    else if (
        rescueWindow.urgency ===
            "critical" ||
        urgencyPoints >= 75
    ) {

        suggestedAction =
            "Begin immediate matching with nearby compatible recipients.";

    }

    else if (
        safeQuantity >= 100
    ) {

        suggestedAction =
            "Coordinate multiple compatible recipients and begin rescue planning.";

    }

    else if (
        safeQuantity >= 50
    ) {

        suggestedAction =
            "Prioritize multiple nearby compatible recipients and begin coordination.";

    }


/* =========================================
   CONFIDENCE
========================================= */

    let confidence =
        64;


    if (
        safeFoodType
    ) {

        confidence += 8;

    }


    if (
        safeQuantity > 0
    ) {

        confidence += 7;

    }


    if (
        safeUnit
    ) {

        confidence += 4;

    }


    if (
        safeLocation !==
        "Unknown location"
    ) {

        confidence += 5;

    }


    if (
        availableFrom &&
        expiryTime
    ) {

        confidence += 7;

    }


    if (
        notes &&
        normalizedNotes.length > 0
    ) {

        confidence += 4;

    }


    confidence =
        Math.min(
            95,
            confidence
        );


/* =========================================
   SUMMARY
========================================= */

    const summary =
        `FoodRescue analyzed ${safeQuantity} ${safeUnit} of ${safeFoodType || "food"} in ${safeLocation}.`;


/* =========================================
   RESULT
========================================= */

    return {

        summary,

        riskSignals:
            detectedSignals,

        insights,

        suggestedAction,

        confidence,

        urgencyScore:
            urgencyPoints,

        perishability,

        rescueWindowUrgency:
            rescueWindow.urgency,

        analyzedBy:
            "FoodRescue Rule-Based Intelligence"

    };

}


/* =========================================
   EXPLAIN RESCUE DECISION
========================================= */

function explainRescueDecision({

    score = 0,

    matchScore = 0,

    distance = Infinity,

    capacity = 0

} = {}) {


    const reasons = [];


    const safeScore =
        aiSafeNumber(
            score
        );


    const safeMatchScore =
        aiSafeNumber(
            matchScore
        );


    const safeDistance =
        aiSafeNumber(
            distance,
            Infinity
        );


    const safeCapacity =
        aiSafeNumber(
            capacity
        );


/* =========================================
   PRIORITY
========================================= */

    if (
        safeScore >= 80
    ) {

        reasons.push(
            "High rescue urgency"
        );

    }

    else if (
        safeScore >= 60
    ) {

        reasons.push(
            "Elevated rescue urgency"
        );

    }

    else if (
        safeScore >= 40
    ) {

        reasons.push(
            "Moderate rescue urgency"
        );

    }


/* =========================================
   RECIPIENT COMPATIBILITY
========================================= */

    if (
        safeMatchScore >= 90
    ) {

        reasons.push(
            "Excellent recipient compatibility"
        );

    }

    else if (
        safeMatchScore >= 75
    ) {

        reasons.push(
            "Strong recipient compatibility"
        );

    }

    else if (
        safeMatchScore >= 60
    ) {

        reasons.push(
            "Acceptable recipient compatibility"
        );

    }


/* =========================================
   DISTANCE
========================================= */

    if (
        safeDistance <= 3
    ) {

        reasons.push(
            "Very short collection distance"
        );

    }

    else if (
        safeDistance <= 7
    ) {

        reasons.push(
            "Nearby collection distance"
        );

    }


/* =========================================
   CAPACITY
========================================= */

    if (
        safeCapacity > 0
    ) {

        reasons.push(
            "Recipient capacity is available"
        );

    }


    return reasons;

}


/* =========================================
   GLOBAL ACCESS
========================================= */

window.FoodRescueAI = {

    analyzeSurplus:
        analyzeSurplusWithAI,

    explainDecision:
        explainRescueDecision

};
