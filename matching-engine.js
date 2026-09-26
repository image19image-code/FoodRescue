"use strict";

/* =========================================
   FOODRESCUE — SMART MATCHING ENGINE
========================================= */

function calculateMatchScore(
    foodType,
    quantity,
    organization
) {

    let score = 0;


    /* ========================================
       FOOD COMPATIBILITY
    ======================================== */

    if (
        organization.acceptedFood &&
        organization.acceptedFood.includes(foodType)
    ) {
        score += 50;
    }

    else {
        score += 5;
    }


    /* ========================================
       CAPACITY
    ======================================== */

    if (quantity <= organization.capacity) {

        const capacityRatio =
            quantity / organization.capacity;

        if (capacityRatio <= 0.5) {
            score += 25;
        }

        else if (capacityRatio <= 0.8) {
            score += 20;
        }

        else {
            score += 15;
        }

    }

    else {
        score += 5;
    }


    /* ========================================
       DISTANCE
    ======================================== */

    if (organization.distance <= 2) {
        score += 20;
    }

    else if (organization.distance <= 5) {
        score += 17;
    }

    else if (organization.distance <= 10) {
        score += 12;
    }

    else {
        score += 7;
    }


    /* ========================================
       FINAL SCORE
    ======================================== */

    return Math.min(
        Math.round(score),
        100
    );
}


/* =========================================
   GENERATE MATCHES
========================================= */

function findBestMatches(
    foodType,
    quantity,
    organizations
) {

    if (!Array.isArray(organizations)) {
        return [];
    }


    const matches =
        organizations.map(
            organization => {

                const matchScore =
                    calculateMatchScore(
                        foodType,
                        quantity,
                        organization
                    );

                return {
                    ...organization,
                    matchScore
                };

            }
        );


    /* ========================================
       SORT
    ======================================== */

    matches.sort(
        (a, b) =>
            b.matchScore - a.matchScore ||
            a.distance - b.distance
    );


    return matches.slice(0, 5);
}


/* =========================================
   MATCH REASON
========================================= */

function getMatchReason(
    foodType,
    quantity,
    organization
) {

    const reasons = [];


    if (
        organization.acceptedFood &&
        organization.acceptedFood.includes(foodType)
    ) {
        reasons.push("Accepts this food type");
    }


    if (quantity <= organization.capacity) {
        reasons.push(
            `Capacity ${organization.capacity}`
        );
    }


    reasons.push(
        `${organization.distance} km away`
    );


    return reasons.join(" · ");
}