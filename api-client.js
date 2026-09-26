"use strict";

/* =========================================
   FOODRESCUE — API CLIENT
========================================= */

const FOODRESCUE_API_URL =
    window.FOODRESCUE_API_URL ||
    "https://foodrescue-api-0723.onrender.com";


async function apiRequest(
    path,
    options = {}
) {

    const response =
        await fetch(
            `${FOODRESCUE_API_URL}${path}`,
            {
                ...options,

                headers: {
                    "Content-Type":
                        "application/json",

                    ...(options.headers || {})
                }
            }
        );


    const data =
        await response.json()
            .catch(
                () => ({})
            );


    if (!response.ok) {

        throw new Error(
            data.error ||
            `API request failed: ${response.status}`
        );

    }


    return data;
}


/* =========================================
   ANALYZE SURPLUS
========================================= */

async function apiAnalyzeSurplus(
    payload
) {

    return apiRequest(
        "/api/analyze",
        {
            method: "POST",

            body:
                JSON.stringify(
                    payload
                )
        }
    );

}


/* =========================================
   CREATE RESCUE
========================================= */

async function apiCreateRescue(
    payload
) {

    return apiRequest(
        "/api/rescue",
        {
            method: "POST",

            body:
                JSON.stringify(
                    payload
                )
        }
    );

}


/* =========================================
   COMPLETE RESCUE
========================================= */

async function apiCompleteRescue(
    id
) {

    return apiRequest(
        "/api/rescue/complete",
        {
            method: "POST",

            body:
                JSON.stringify({
                    id
                })
        }
    );

}


/* =========================================
   WEATHER
========================================= */

async function apiGetWeather(
    location
) {

    return apiRequest(
        `/api/weather?location=${encodeURIComponent(
            location
        )}`
    );

}


/* =========================================
   HEALTH
========================================= */

async function apiHealth() {

    return apiRequest(
        "/api/health"
    );

}


/* =========================================
   GLOBAL ACCESS
========================================= */

window.FoodRescueAPI = {

    analyzeSurplus:
        apiAnalyzeSurplus,

    createRescue:
        apiCreateRescue,

    completeRescue:
        apiCompleteRescue,

    getWeather:
        apiGetWeather,

    health:
        apiHealth

};