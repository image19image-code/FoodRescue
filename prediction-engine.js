"use strict";

/* =========================================
   FOODRESCUE — SURPLUS PREDICTION ENGINE
========================================= */

function predictFutureSurplus(history = []) {

    if (!Array.isArray(history) ||
        history.length === 0) {

        return {
            predictedQuantity: 0,
            confidence: 0,
            trend: "INSUFFICIENT DATA",
            recommendation:
                "Collect more rescue history to generate reliable predictions."
        };

    }


    const quantities =
        history
            .map(item =>
                Number(item.quantity) || 0
            )
            .filter(value => value > 0);


    if (!quantities.length) {

        return {
            predictedQuantity: 0,
            confidence: 0,
            trend: "INSUFFICIENT DATA",
            recommendation:
                "More quantity data is required."
        };

    }


    const total =
        quantities.reduce(
            (sum, value) =>
                sum + value,
            0
        );


    const average =
        total / quantities.length;


    let trend =
        "STABLE";


    if (quantities.length >= 3) {

        const recent =
            quantities
                .slice(-3)
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / 3;


        const previous =
            quantities
                .slice(
                    Math.max(
                        0,
                        quantities.length - 6
                    ),
                    Math.max(
                        0,
                        quantities.length - 3
                    )
                )
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) /
                Math.max(
                    1,
                    Math.min(
                        3,
                        quantities.length - 3
                    )
                );


        if (recent > previous * 1.15) {
            trend = "RISING";
        }

        else if (recent < previous * 0.85) {
            trend = "DECLINING";
        }

    }


    const predictedQuantity =
        Math.round(
            average
        );


    const confidence =
        Math.min(
            94,
            50 +
            quantities.length * 6
        );


    let recommendation =
        "Monitor upcoming surplus."


    if (trend === "RISING") {

        recommendation =
            "Notify suitable rescue organizations earlier and increase preparation capacity.";

    }

    else if (trend === "DECLINING") {

        recommendation =
            "Maintain normal monitoring and avoid unnecessary collection capacity.";

    }


    return {

        predictedQuantity,

        confidence,

        trend,

        recommendation

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


    return {

        ...prediction,

        predictedQuantity:
            Math.round(
                prediction.predictedQuantity *
                multiplier
            )

    };

}