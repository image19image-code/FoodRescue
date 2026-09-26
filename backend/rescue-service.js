"use strict";

const crypto =
    require("crypto");

const {
    RESCUE_ORGANIZATIONS
} =
    require("./network-data");


const {
    addRescue,
    findRescue,
    updateRescue
} =
    require("./database");


function generateId() {

    return (
        "FR-" +
        crypto
            .randomBytes(6)
            .toString("hex")
            .toUpperCase()
    );

}


function calculatePriority(
    foodType,
    quantity,
    remainingMinutes
) {

    let score = 0;


    if (
        remainingMinutes <= 60
    ) {

        score += 50;

    }

    else if (
        remainingMinutes <= 120
    ) {

        score += 40;

    }

    else if (
        remainingMinutes <= 240
    ) {

        score += 30;

    }

    else if (
        remainingMinutes <= 480
    ) {

        score += 20;

    }

    else {

        score += 10;

    }


    if (quantity >= 100) {

        score += 30;

    }

    else if (quantity >= 50) {

        score += 25;

    }

    else if (quantity >= 20) {

        score += 18;

    }

    else if (quantity >= 10) {

        score += 12;

    }

    else {

        score += 6;

    }


    if (
        [
            "prepared",
            "dairy",
            "fruit",
            "vegetables"
        ]
        .includes(
            foodType
        )
    ) {

        score += 15;

    }

    else if (
        foodType === "bakery"
    ) {

        score += 10;

    }

    else {

        score += 5;

    }


    return Math.min(
        score,
        100
    );

}


function getPriorityLabel(
    score
) {

    if (score >= 80) {
        return "CRITICAL";
    }

    if (score >= 60) {
        return "HIGH PRIORITY";
    }

    if (score >= 40) {
        return "MEDIUM PRIORITY";
    }

    return "LOW PRIORITY";

}


function parseTime(
    time
) {

    const [
        hours,
        minutes
    ] =
        String(
            time || "00:00"
        )
        .split(":")
        .map(Number);


    return (
        hours * 60 +
        minutes
    );

}


function getRemainingMinutes(
    expiryTime
) {

    const now =
        new Date();


    const current =
        now.getHours() * 60 +
        now.getMinutes();


    let expiry =
        parseTime(
            expiryTime
        );


    if (
        expiry <= current
    ) {

        expiry +=
            24 * 60;

    }


    return (
        expiry -
        current
    );

}


function matchOrganizations(
    foodType,
    quantity
) {

    return RESCUE_ORGANIZATIONS
        .map(
            organization => {

                let score = 0;


                if (
                    organization.acceptedFood
                        ?.includes(
                            foodType
                        )
                ) {

                    score += 50;

                }

                else {

                    score += 5;

                }


                if (
                    quantity <=
                    organization.capacity
                ) {

                    score += 25;

                }

                else {

                    score += 5;

                }


                if (
                    organization.distance <= 2
                ) {

                    score += 20;

                }

                else if (
                    organization.distance <= 5
                ) {

                    score += 17;

                }

                else if (
                    organization.distance <= 10
                ) {

                    score += 12;

                }

                else {

                    score += 7;

                }


                return {

                    ...organization,

                    matchScore:
                        Math.min(
                            score,
                            100
                        )

                };

            }
        )
        .sort(
            (
                a,
                b
            ) =>
                b.matchScore -
                a.matchScore
        )
        .slice(
            0,
            5
        );

}


function analyzeSurplus(
    body
) {

    const {

        foodType,

        quantity,

        unit,

        availableFrom,

        expiryTime,

        location,

        notes

    } =
        body;


    if (
        !foodType ||
        !quantity ||
        !expiryTime ||
        !location
    ) {

        throw new Error(
            "Missing required surplus information."
        );

    }


    const remainingMinutes =
        getRemainingMinutes(
            expiryTime
        );


    const priorityScore =
        calculatePriority(
            foodType,
            Number(quantity),
            remainingMinutes
        );


    const matches =
        matchOrganizations(
            foodType,
            Number(quantity)
        );


    return {

        success: true,

        analysis: {

            priorityScore,

            priorityLevel:
                getPriorityLabel(
                    priorityScore
                ),

            remainingMinutes,

            location,

            foodType,

            quantity:
                Number(quantity),

            unit,

            availableFrom,

            expiryTime,

            notes:
                notes || ""

        },

        matches

    };

}


function createRescue(
    body
) {

    const {

        foodType,

        quantity,

        unit,

        location,

        organizationId,

        organizationName,

        matchScore

    } =
        body;


    if (
        !foodType ||
        !quantity ||
        !organizationName
    ) {

        throw new Error(
            "Incomplete rescue operation."
        );

    }


    const rescue = {

        id:
            generateId(),

        foodType,

        quantity:
            Number(quantity),

        unit:
            unit || "items",

        location,

        organizationId:
            organizationId || null,

        organizationName,

        matchScore:
            Number(matchScore) || 0,

        status:
            "COLLECTION_PENDING",

        createdAt:
            new Date().toISOString(),

        completedAt:
            null

    };


    addRescue(
        rescue
    );


    return rescue;

}


function completeRescue(
    body
) {

    const {
        id
    } =
        body;


    if (!id) {

        throw new Error(
            "Rescue id is required."
        );

    }


    const existing =
        findRescue(
            id
        );


    if (!existing) {

        throw new Error(
            "Rescue operation not found."
        );

    }


    const updated =
        updateRescue(
            id,
            {

                status:
                    "RESCUED",

                completedAt:
                    new Date()
                        .toISOString()

            }
        );


    return updated;

}


module.exports = {

    analyzeSurplus,

    createRescue,

    completeRescue

};