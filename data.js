"use strict";

/* =========================================
   FOODRESCUE — NETWORK DATA
========================================= */


/* =========================================
   RESCUE ORGANIZATIONS
========================================= */

const RESCUE_ORGANIZATIONS = [

    {
        id:
            "relizane-food-association",

        name:
            "Relizane Food Association",

        city:
            "Relizane",

        distance:
            1.8,

        capacity:
            80,

        capacityUnit:
            "items",

        acceptedFood: [

            "prepared",

            "bakery",

            "fruits",

            "vegetables",

            "dairy"

        ]
    },


    {
        id:
            "community-kitchen",

        name:
            "Community Kitchen",

        city:
            "Relizane",

        distance:
            3.2,

        capacity:
            60,

        capacityUnit:
            "items",

        acceptedFood: [

            "prepared",

            "bakery",

            "fruits",

            "vegetables"

        ]
    },


    {
        id:
            "local-shelter",

        name:
            "Local Shelter",

        city:
            "Relizane",

        distance:
            5.1,

        capacity:
            45,

        capacityUnit:
            "items",

        acceptedFood: [

            "prepared",

            "bakery",

            "dairy"

        ]
    },


    {
        id:
            "oran-food-bank",

        name:
            "Oran Food Bank",

        city:
            "Oran",

        distance:
            8.4,

        capacity:
            120,

        capacityUnit:
            "items",

        acceptedFood: [

            "prepared",

            "bakery",

            "fruits",

            "vegetables",

            "dairy"

        ]
    },


    {
        id:
            "community-care",

        name:
            "Community Care Center",

        city:
            "Oran",

        distance:
            11.2,

        capacity:
            70,

        capacityUnit:
            "items",

        acceptedFood: [

            "prepared",

            "fruits",

            "vegetables"

        ]
    },


    {
        id:
            "tlemcen-rescue-network",

        name:
            "Tlemcen Rescue Network",

        city:
            "Tlemcen",

        distance:
            4.6,

        capacity:
            90,

        capacityUnit:
            "items",

        acceptedFood: [

            "prepared",

            "bakery",

            "fruits",

            "vegetables",

            "dairy"

        ]
    }

];


/* =========================================
   FOOD LABELS
========================================= */

const FOOD_LABELS = {

    bakery:
        "Bakery",

    prepared:
        "Prepared meals",

    fruits:
        "Fruits",

    vegetables:
        "Vegetables",

    dairy:
        "Dairy",

    other:
        "Other"

};


/* =========================================
   BACKWARD COMPATIBILITY
========================================= */

const FOOD_TYPE_ALIASES = {

    fruit:
        "fruits",

    fruits:
        "fruits"

};


/* =========================================
   GLOBAL ACCESS
========================================= */

/*
   The rest of the FoodRescue platform reads
   these through window.*.
*/

window.RESCUE_ORGANIZATIONS =
    RESCUE_ORGANIZATIONS;


window.FOOD_LABELS =
    FOOD_LABELS;


window.FOOD_TYPE_ALIASES =
    FOOD_TYPE_ALIASES;
