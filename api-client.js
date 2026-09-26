"use strict";

/* =========================================
   FOODRESCUE — API CLIENT
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

const DEFAULT_FOODRESCUE_API_URL =
    "https://foodrescue-api-0723.onrender.com";

const FOODRESCUE_API_URL = (
    window.FOODRESCUE_API_URL ||
    DEFAULT_FOODRESCUE_API_URL
).replace(/\/+$/, "");

const API_TIMEOUT_MS = 15000;


/*
   Expose the final API URL globally
   for debugging and future configuration.
*/
window.FOODRESCUE_API_URL =
    FOODRESCUE_API_URL;


/* =========================================
   API REQUEST CORE
========================================= */

async function apiRequest(
    path,
    options = {},
    timeoutMs = API_TIMEOUT_MS
) {

    if (
        typeof path !== "string" ||
        !path.startsWith("/")
    ) {

        throw new Error(
            "Invalid API path."
        );

    }


    const controller =
        new AbortController();


    const timeoutId =
        window.setTimeout(
            () => controller.abort(),
            timeoutMs
        );


    const requestOptions = {
        ...options,
        signal: controller.signal,

        headers: {
            Accept:
                "application/json",

            ...(options.body
                ? {
                    "Content-Type":
                        "application/json"
                }
                : {}),

            ...(options.headers || {})
        }
    };


    try {

        const response =
            await fetch(
                `${FOODRESCUE_API_URL}${path}`,
                requestOptions
            );


        const contentType =
            response.headers.get(
                "content-type"
            ) || "";


        let data = {};


        /*
           Prefer JSON when available.
        */
        if (
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json()
                    .catch(
                        () => ({})
                    );

        } else {

            /*
               Handle plain-text or empty
               server responses safely.
            */
            const text =
                await response.text()
                    .catch(
                        () => ""
                    );


            if (text) {

                data = {
                    message:
                        text
                };

            }

        }


        if (!response.ok) {

            const serverMessage =
                typeof data?.error === "string"
                    ? data.error
                    : typeof data?.message === "string"
                        ? data.message
                        : `API request failed (${response.status}).`;


            throw new Error(
                serverMessage
            );

        }


        return data;

    } catch (error) {

        /*
           Timeout
        */
        if (
            error?.name ===
            "AbortError"
        ) {

            throw new Error(
                "The FoodRescue API request timed out. Please try again."
            );

        }


        /*
           Browser/network failure
        */
        if (
            error instanceof TypeError
        ) {

            throw new Error(
                "Unable to connect to the FoodRescue API. Please check your connection or try again."
            );

        }


        /*
           Preserve meaningful API errors.
        */
        throw error;

    } finally {

        window.clearTimeout(
            timeoutId
        );

    }

}


/* =========================================
   ANALYZE SURPLUS
========================================= */

async function apiAnalyzeSurplus(
    payload
) {

    if (
        !payload ||
        typeof payload !== "object"
    ) {

        throw new Error(
            "Invalid surplus analysis payload."
        );

    }


    return apiRequest(
        "/api/analyze",
        {
            method:
                "POST",

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

    if (
        !payload ||
        typeof payload !== "object"
    ) {

        throw new Error(
            "Invalid rescue payload."
        );

    }


    return apiRequest(
        "/api/rescue",
        {
            method:
                "POST",

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

    if (
        id === undefined ||
        id === null ||
        String(id).trim() === ""
    ) {

        throw new Error(
            "A rescue ID is required."
        );

    }


    return apiRequest(
        "/api/rescue/complete",
        {
            method:
                "POST",

            body:
                JSON.stringify({
                    id:
                        String(id)
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

    const safeLocation =
        String(
            location ?? ""
        ).trim();


    if (!safeLocation) {

        throw new Error(
            "A location is required."
        );

    }


    const query =
        new URLSearchParams({
            location:
                safeLocation
        });


    return apiRequest(
        `/api/weather?${query.toString()}`,
        {
            method:
                "GET"
        }
    );

}


/* =========================================
   HEALTH CHECK
========================================= */

async function apiHealth() {

    return apiRequest(
        "/api/health",
        {
            method:
                "GET"
        }
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
