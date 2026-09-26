"use strict";

/* =========================================
   FOODRESCUE — IMPACT ENGINE
========================================= */

const IMPACT_FACTORS = {

    mealsPerKg: 2.85,

    co2PerKg: 0.43,

    waterPerKg: 1000

};


/* =========================================
   CALCULATE IMPACT
========================================= */

function calculateImpact(
    quantity,
    unit
) {

    const numericQuantity =
        Number(quantity) || 0;


    let kgSaved = 0;


    switch (unit) {

        case "kg":

            kgSaved =
                numericQuantity;

            break;


        case "meals":

            kgSaved =
                numericQuantity /
                IMPACT_FACTORS.mealsPerKg;

            break;


        case "items":

            kgSaved =
                numericQuantity *
                0.12;

            break;


        case "boxes":

            kgSaved =
                numericQuantity *
                0.8;

            break;


        default:

            kgSaved =
                numericQuantity *
                0.2;

    }


    const meals =
        unit === "meals"
            ? numericQuantity
            : Math.round(
                kgSaved *
                IMPACT_FACTORS.mealsPerKg
            );


    const co2Avoided =
        kgSaved *
        IMPACT_FACTORS.co2PerKg;


    const waterSaved =
        kgSaved *
        IMPACT_FACTORS.waterPerKg;


    return {

        kgSaved:
            Number(
                kgSaved.toFixed(2)
            ),

        meals:

            Math.round(
                meals
            ),

        co2Avoided:
            Number(
                co2Avoided.toFixed(2)
            ),

        waterSaved:
            Math.round(
                waterSaved
            )

    };

}


/* =========================================
   AGGREGATE IMPACT
========================================= */

function aggregateImpact(
    operations = []
) {

    const total = {

        kgSaved: 0,

        meals: 0,

        co2Avoided: 0,

        waterSaved: 0

    };


    operations.forEach(
        operation => {

            const impact =
                calculateImpact(
                    operation.quantity,
                    operation.unit
                );


            total.kgSaved +=
                impact.kgSaved;


            total.meals +=
                impact.meals;


            total.co2Avoided +=
                impact.co2Avoided;


            total.waterSaved +=
                impact.waterSaved;

        }
    );


    total.kgSaved =
        Number(
            total.kgSaved.toFixed(2)
        );


    total.co2Avoided =
        Number(
            total.co2Avoided.toFixed(2)
        );


    return total;

}