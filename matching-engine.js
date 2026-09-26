"use strict";

/* =========================================
   FOODRESCUE — SMART MATCHING ENGINE
========================================= */


/* =========================================
   HELPERS
========================================= */

function matchingSafeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function normalizeFoodType(
    foodType
) {

    const value =
        String(foodType || "")
            .trim()
            .toLowerCase();


    /*
       Keep compatibility with older
       versions that used "fruit".
    */

    if (
        value === "fruit"
    ) {

        return "fruits";

    }


    return value;

}


function normalizeAcceptedFood(
    acceptedFood
) {

    if (
        !Array.isArray(
            acceptedFood
        )
    ) {

        return [];

    }


    return acceptedFood
        .map(
            item =>
                normalizeFoodType(
                    item
                )
        )
        .filter(Boolean);

}


function getOrganizationCapacity(
    organization
) {

    return matchingSafeNumber(
        organization?.capacity,
        0
    );

}


function getOrganizationDistance(
    organization
) {

    return matchingSafeNumber(
        organization?.distance,
        Infinity
    );

}


/* =========================================
   FOOD COMPATIBILITY
========================================= */

function organizationAcceptsFood(
    foodType,
    organization
) {

    const normalizedFoodType =
        normalizeFoodType(
            foodType
        );


    const acceptedFood =
        normalizeAcceptedFood(
            organization?.acceptedFood
        );


    if (
        !acceptedFood.length
    ) {

        return false;

    }


    return acceptedFood.includes(
        normalizedFoodType
    );

}


/* =========================================
   CAPACITY COMPATIBILITY
========================================= */

function calculateCapacityScore(
    quantity,
    organization
) {

    const safeQuantity =
        Math.max(
            0,
            matchingSafeNumber(
                quantity
            )
        );


    const capacity =
        getOrganizationCapacity(
            organization
        );


    /*
       No valid capacity = conservative score.
    */

    if (
        capacity <= 0
    ) {

        return {

            score: 5,

            compatible: false,

            ratio: Infinity

        };

    }


    const ratio =
        safeQuantity /
        capacity;


    if (
        safeQuantity <=
        capacity
    ) {

        if (
            ratio <=
            0.5
        ) {

            return {

                score: 25,

                compatible: true,

                ratio

            };

        }


        if (
            ratio <=
            0.8
        ) {

            return {

                score: 20,

                compatible: true,

                ratio

            };

        }


        return {

            score: 15,

            compatible: true,

            ratio

        };

    }


    /*
       Organization cannot handle the entire
       surplus in one operation.
    */

    return {

        score: 5,

        compatible: false,

        ratio

    };

}


/* =========================================
   DISTANCE SCORE
========================================= */

function calculateDistanceScore(
    organization
) {

    const distance =
        getOrganizationDistance(
            organization
        );


    if (
        !Number.isFinite(
            distance
        )
    ) {

        return {

            score: 0,

            valid: false

        };

    }


    if (
        distance <=
        2
    ) {

        return {

            score: 20,

            valid: true

        };

    }


    if (
        distance <=
        5
    ) {

        return {

            score: 17,

            valid: true

        };

    }


    if (
        distance <=
        10
    ) {

        return {

            score: 12,

            valid: true

        };

    }


    return {

        score: 7,

        valid: true

    };

}


/* =========================================
   MATCH SCORE
========================================= */

function calculateMatchScore(
    foodType,
    quantity,
    organization
) {

    if (
        !organization ||
        typeof organization !==
        "object"
    ) {

        return 0;

    }


    let score = 0;


    /* =====================================
       FOOD COMPATIBILITY
    ===================================== */

    if (
        organizationAcceptsFood(
            foodType,
            organization
        )
    ) {

        score += 50;

    }
    else {

        /*
           A non-compatible food type should
           remain possible but heavily penalized.
        */

        score += 5;

    }


    /* =====================================
       CAPACITY
    ===================================== */

    const capacity =
        calculateCapacityScore(
            quantity,
            organization
        );


    score +=
        capacity.score;


    /* =====================================
       DISTANCE
    ===================================== */

    const distance =
        calculateDistanceScore(
            organization
        );


    score +=
        distance.score;


    /* =====================================
       FINAL
    ===================================== */

    return Math.min(
        100,
        Math.max(
            0,
            Math.round(
                score
            )
        )
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

    if (
        !Array.isArray(
            organizations
        )
    ) {

        return [];

    }


    const safeQuantity =
        Math.max(
            0,
            matchingSafeNumber(
                quantity
            )
        );


    const matches =
        organizations
            .filter(
                organization =>
                    organization &&
                    typeof organization ===
                    "object"
            )
            .map(
                organization => {

                    const matchScore =
                        calculateMatchScore(
                            foodType,
                            safeQuantity,
                            organization
                        );


                    return {

                        ...organization,

                        matchScore

                    };

                }
            );


    /* =====================================
       SORT
    ===================================== */

    matches.sort(
        (
            a,
            b
        ) => {

            const scoreDifference =
                b.matchScore -
                a.matchScore;


            if (
                scoreDifference !==
                0
            ) {

                return scoreDifference;

            }


            const distanceA =
                getOrganizationDistance(
                    a
                );


            const distanceB =
                getOrganizationDistance(
                    b
                );


            return (
                distanceA -
                distanceB
            );

        }
    );


    /*
       Top 5 candidates.
    */

    return matches.slice(
        0,
        5
    );

}


/* =========================================
   MATCH REASON
========================================= */

function getMatchReason(
    foodType,
    quantity,
    organization
) {

    if (
        !organization
    ) {

        return "";

    }


    const reasons = [];


    /* =====================================
       FOOD
    ===================================== */

    if (
        organizationAcceptsFood(
            foodType,
            organization
        )
    ) {

        reasons.push(
            "Accepts this food type"
        );

    }
    else {

        reasons.push(
            "Food type compatibility limited"
        );

    }


    /* =====================================
       CAPACITY
    ===================================== */

    const capacity =
        getOrganizationCapacity(
            organization
        );


    const safeQuantity =
        Math.max(
            0,
            matchingSafeNumber(
                quantity
            )
        );


    if (
        capacity > 0 &&
        safeQuantity <=
        capacity
    ) {

        reasons.push(
            `Capacity ${capacity}`
        );

    }
    else if (
        capacity > 0
    ) {

        reasons.push(
            `Surplus exceeds capacity ${capacity}`
        );

    }
    else {

        reasons.push(
            "Capacity unavailable"
        );

    }


    /* =====================================
       DISTANCE
    ===================================== */

    const distance =
        getOrganizationDistance(
            organization
        );


    if (
        Number.isFinite(
            distance
        )
    ) {

        reasons.push(
            `${distance} km away`
        );

    }
    else {

        reasons.push(
            "Distance unavailable"
        );

    }


    return reasons.join(
        " · "
    );

}


/* =========================================
   DETAILED MATCH ANALYSIS
========================================= */

function analyzeOrganizationMatch(
    foodType,
    quantity,
    organization
) {

    if (
        !organization
    ) {

        return {

            matchScore: 0,

            foodCompatible: false,

            capacityCompatible: false,

            distanceValid: false

        };

    }


    const foodCompatible =
        organizationAcceptsFood(
            foodType,
            organization
        );


    const capacity =
        calculateCapacityScore(
            quantity,
            organization
        );


    const distance =
        calculateDistanceScore(
            organization
        );


    const matchScore =
        calculateMatchScore(
            foodType,
            quantity,
            organization
        );


    return {

        matchScore,

        foodCompatible,

        capacityCompatible:
            capacity.compatible,

        capacityRatio:
            capacity.ratio,

        distanceValid:
            distance.valid,

        capacityScore:
            capacity.score,

        distanceScore:
            distance.score

    };

}
