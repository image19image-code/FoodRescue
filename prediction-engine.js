"use strict";

/* =========================================
   FOODRESCUE — SURPLUS PREDICTION ENGINE
========================================= */


/* =========================================
   HELPERS
========================================= */

function predictionSafeQuantity(value) {

    const number =
        Number(value);

    return Number.isFinite(number) &&
        number > 0
        ? number
        : 0;

}


function predictionNormalizeUnit(unit) {

    const value =
        String(unit || "")
            .trim()
            .toLowerCase();


    if (
        value === "kg" ||
        value === "kgs" ||
        value === "kilogram" ||
        value === "kilograms"
    ) {

        return "kg";

    }


    if (
        value === "meal" ||
        value === "meals"
    ) {

        return "meals";

    }


    if (
        value === "box" ||
        value === "boxes"
    ) {

        return "boxes";

    }


    if (
        value === "item" ||
        value === "items"
    ) {

        return "items";

    }


    return value || "items";

}


function predictionGetDate(item) {

    const value =
        item?.completedAt ||
        item?.createdAt ||
        null;


    if (!value) {
        return 0;
    }


    const time =
        new Date(value).getTime();


    return Number.isFinite(time)
        ? time
        : 0;

}


/* =========================================
   PREPARE HISTORY
========================================= */

function preparePredictionHistory(
    history
) {

    if (
        !Array.isArray(history)
    ) {

        return [];

    }


    return history
        .map(
            (item, index) => ({

                ...item,

                quantity:
                    predictionSafeQuantity(
                        item?.quantity
                    ),

                unit:
                    predictionNormalizeUnit(
                        item?.unit
                    ),

                timestamp:
                    predictionGetDate(
                        item
                    ),

                originalIndex:
                    index

            })
        )
        .filter(
            item =>
                item.quantity > 0
        )
        .sort(
            (
                a,
                b
            ) => {

                /*
                   Newest first.

                   If timestamps are unavailable,
                   preserve the original order.
                */

                if (
                    a.timestamp !==
                    b.timestamp
                ) {

                    return (
                        b.timestamp -
                        a.timestamp
                    );

                }


                return (
                    a.originalIndex -
                    b.originalIndex
                );

            }
        );

}


/* =========================================
   MOST RECENT UNIT
========================================= */

function getPrimaryPredictionUnit(
    history
) {

    if (
        !history.length
    ) {

        return "items";

    }


    return history[0].unit;

}


/* =========================================
   FILTER SAME UNIT
========================================= */

function getComparableHistory(
    history,
    unit
) {

    return history.filter(
        item =>
            item.unit === unit
    );

}


/* =========================================
   TREND
========================================= */

function calculatePredictionTrend(
    quantities
) {

    /*
       Need at least 4 comparable observations
       to compare two actual groups.

       This avoids declaring "RISING" when
       there is no previous group.
    */

    if (
        quantities.length <
        4
    ) {

        return "STABLE";

    }


    const recentCount =
        Math.min(
            3,
            Math.floor(
                quantities.length / 2
            )
        );


    const previousStart =
        recentCount;


    const recentValues =
        quantities.slice(
            0,
            recentCount
        );


    const previousValues =
        quantities.slice(
            previousStart,
            previousStart +
            recentCount
        );


    if (
        !recentValues.length ||
        !previousValues.length
    ) {

        return "STABLE";

    }


    const recentAverage =
        recentValues.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        ) /
        recentValues.length;


    const previousAverage =
        previousValues.reduce(
            (
                sum,
                value
            ) =>
                sum + value,
            0
        ) /
        previousValues.length;


    if (
        previousAverage <=
        0
    ) {

        return "STABLE";

    }


    const changeRatio =
        (
            recentAverage -
            previousAverage
        ) /
        previousAverage;


    if (
        changeRatio >=
        0.15
    ) {

        return "RISING";

    }


    if (
        changeRatio <=
        -0.15
    ) {

        return "DECLINING";

    }


    return "STABLE";

}


/* =========================================
   WEIGHTED FORECAST
========================================= */

function calculateWeightedPrediction(
    quantities
) {

    if (
        !quantities.length
    ) {

        return 0;

    }


    /*
       Newer observations receive more weight.

       Example with 3 records:
       oldest = 1
       middle = 2
       newest = 3
    */

    let weightedTotal = 0;

    let totalWeight = 0;


    quantities
        .slice(
            0,
            6
        )
        .reverse()
        .forEach(
            (
                value,
                index
            ) => {

                const weight =
                    index + 1;


                weightedTotal +=
                    value *
                    weight;


                totalWeight +=
                    weight;

            }
        );


    if (
        totalWeight <=
        0
    ) {

        return 0;

    }


    return (
        weightedTotal /
        totalWeight
    );

}


/* =========================================
   CONFIDENCE
========================================= */

function calculatePredictionConfidence(
    comparableCount,
    trend,
    historyTotal
) {

    /*
       Confidence is intentionally capped.

       This is a lightweight forecasting heuristic,
       not a trained statistical model.
    */

    if (
        comparableCount <=
        0
    ) {

        return 0;

    }


    let confidence =
        30;


    confidence +=
        Math.min(
            45,
            comparableCount *
            7
        );


    if (
        historyTotal >=
        10
    ) {

        confidence += 10;

    }


    if (
        comparableCount >=
        6
    ) {

        confidence += 5;

    }


    /*
       A trend is slightly less certain than
       a simple stable pattern.
    */

    if (
        trend !==
        "STABLE"
    ) {

        confidence -= 5;

    }


    return Math.min(
        94,
        Math.max(
            0,
            Math.round(
                confidence
            )
        )
    );

}


/* =========================================
   RECOMMENDATION
========================================= */

function getPredictionRecommendation(
    trend,
    confidence,
    predictedQuantity
) {

    if (
        !predictedQuantity
    ) {

        return (
            "Collect more rescue history to generate reliable predictions."
        );

    }


    if (
        confidence <
        50
    ) {

        return (
            "Prediction confidence is limited. Continue collecting comparable rescue data."
        );

    }


    if (
        trend ===
        "RISING"
    ) {

        return (
            "Surplus volume appears to be rising. Notify suitable rescue organizations earlier and increase preparation capacity."
        );

    }


    if (
        trend ===
        "DECLINING"
    ) {

        return (
            "Surplus volume appears to be declining. Maintain normal monitoring and adjust collection capacity accordingly."
        );

    }


    return (
        "Surplus volume appears relatively stable. Maintain normal monitoring and prepare suitable rescue capacity."
    );

}


/* =========================================
   MAIN PREDICTION
========================================= */

function predictFutureSurplus(
    history = []
) {

    const preparedHistory =
        preparePredictionHistory(
            history
        );


    if (
        !preparedHistory.length
    ) {

        return {

            predictedQuantity:
                0,

            predictedUnit:
                "items",

            confidence:
                0,

            trend:
                "INSUFFICIENT DATA",

            recommendation:
                "Collect more rescue history to generate reliable predictions."

        };

    }


    /*
       Do not combine kg, meals, boxes and items.

       Forecast the unit represented by the
       most recent comparable rescue.
    */

    const primaryUnit =
        getPrimaryPredictionUnit(
            preparedHistory
        );


    const comparableHistory =
        getComparableHistory(
            preparedHistory,
            primaryUnit
        );


    if (
        !comparableHistory.length
    ) {

        return {

            predictedQuantity:
                0,

            predictedUnit:
                primaryUnit,

            confidence:
                0,

            trend:
                "INSUFFICIENT DATA",

            recommendation:
                "More comparable quantity data is required."

        };

    }


    const quantities =
        comparableHistory.map(
            item =>
                item.quantity
        );


    const trend =
        calculatePredictionTrend(
            quantities
        );


    const weightedPrediction =
        calculateWeightedPrediction(
            quantities
        );


    const predictedQuantity =
        Math.max(
            0,
            Math.round(
                weightedPrediction
            )
        );


    const confidence =
        calculatePredictionConfidence(
            comparableHistory.length,
            trend,
            preparedHistory.length
        );


    const recommendation =
        getPredictionRecommendation(
            trend,
            confidence,
            predictedQuantity
        );


    return {

        predictedQuantity,

        predictedUnit:
            primaryUnit,

        confidence,

        trend,

        recommendation,

        sampleSize:
            comparableHistory.length

    };

}


/* =========================================
   FORECAST NEXT RESCUE
========================================= */

function forecastNextRescue(
    history = [],
    multiplier = 1
) {

    const prediction =
        predictFutureSurplus(
            history
        );


    const safeMultiplier =
        Number(
            multiplier
        );


    const finalMultiplier =
        Number.isFinite(
            safeMultiplier
        )
            ? Math.max(
                0,
                safeMultiplier
            )
            : 1;


    return {

        ...prediction,

        predictedQuantity:
            Math.max(
                0,
                Math.round(
                    prediction.predictedQuantity *
                    finalMultiplier
                )
            )

    };

}


/* =========================================
   OPTIONAL FORECAST SUMMARY
========================================= */

function getPredictionSummary(
    history = []
) {

    const prediction =
        predictFutureSurplus(
            history
        );


    return {

        quantity:
            prediction.predictedQuantity,

        unit:
            prediction.predictedUnit,

        confidence:
            prediction.confidence,

        trend:
            prediction.trend,

        samples:
            prediction.sampleSize ||
            0

    };

}
