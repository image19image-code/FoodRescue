"use strict";

/* =========================================
   FOODRESCUE — NETWORK DATA
========================================= */

const RESCUE_ORGANIZATIONS = [

    {
        id: "relizane-food-association",
        name: "Relizane Food Association",
        city: "Relizane",
        distance: 1.8,
        capacity: 80,
        acceptedFood: [
            "prepared",
            "bakery",
            "fruit",
            "vegetables",
            "dairy"
        ]
    },

    {
        id: "community-kitchen",
        name: "Community Kitchen",
        city: "Relizane",
        distance: 3.2,
        capacity: 60,
        acceptedFood: [
            "prepared",
            "bakery",
            "fruit",
            "vegetables"
        ]
    },

    {
        id: "local-shelter",
        name: "Local Shelter",
        city: "Relizane",
        distance: 5.1,
        capacity: 45,
        acceptedFood: [
            "prepared",
            "bakery",
            "dairy"
        ]
    },

    {
        id: "oran-food-bank",
        name: "Oran Food Bank",
        city: "Oran",
        distance: 8.4,
        capacity: 120,
        acceptedFood: [
            "prepared",
            "bakery",
            "fruit",
            "vegetables",
            "dairy"
        ]
    },

    {
        id: "community-care",
        name: "Community Care Center",
        city: "Oran",
        distance: 11.2,
        capacity: 70,
        acceptedFood: [
            "prepared",
            "fruit",
            "vegetables"
        ]
    },

    {
        id: "tlemcen-rescue-network",
        name: "Tlemcen Rescue Network",
        city: "Tlemcen",
        distance: 4.6,
        capacity: 90,
        acceptedFood: [
            "prepared",
            "bakery",
            "fruit",
            "vegetables",
            "dairy"
        ]
    }

];


/* =========================================
   FOOD LABELS
========================================= */

const FOOD_LABELS = {

    bakery: "Bakery",

    prepared: "Prepared meals",

    fruit: "Fruits",

    vegetables: "Vegetables",

    dairy: "Dairy",

    other: "Other"

};