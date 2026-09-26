"use strict";

/* =========================================
   FOODRESCUE — ENVIRONMENTAL INTELLIGENCE
========================================= */


/* =========================================
   CONFIG
========================================= */

const WEATHER_CACHE_TTL =
    10 * 60 * 1000; // 10 minutes

const GEOCODING_CACHE_TTL =
    24 * 60 * 60 * 1000; // 24 hours


/* =========================================
   HELPERS
========================================= */

function weatherEscapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function weatherSafeNumber(
    value,
    fallback = 0
) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : fallback;

}


function weatherNow() {

    return Date.now();

}


/* =========================================
   ENVIRONMENTAL INTELLIGENCE
========================================= */

const FoodRescueWeather = {

    cache: new Map(),


    /* =====================================
       CACHE
    ===================================== */

    getCached(
        key
    ) {

        const entry =
            this.cache.get(
                key
            );


        if (!entry) {
            return null;
        }


        if (
            weatherNow() -
            entry.timestamp >
            entry.ttl
        ) {

            this.cache.delete(
                key
            );

            return null;

        }


        return entry.data;

    },


    setCached(
        key,
        data,
        ttl
    ) {

        this.cache.set(
            key,
            {
                data,
                timestamp:
                    weatherNow(),
                ttl
            }
        );

    },


    /* =====================================
       GEOCODING
    ===================================== */

    async getCoordinates(
        location
    ) {

        if (
            typeof location !== "string" ||
            !location.trim()
        ) {

            throw new Error(
                "Location is required."
            );

        }


        const cleanLocation =
            location.trim();


        const key =
            `geo:${cleanLocation.toLowerCase()}`;


        const cached =
            this.getCached(
                key
            );


        if (cached) {

            return cached;

        }


        const url =
            "https://geocoding-api.open-meteo.com/v1/search" +
            `?name=${encodeURIComponent(
                cleanLocation
            )}` +
            "&count=5" +
            "&language=en" +
            "&format=json";


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Geocoding request failed (${response.status}).`
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(
                data.results
            ) ||
            !data.results.length
        ) {

            throw new Error(
                "Location not found."
            );

        }


        /*
           Prefer the first result returned by
           Open-Meteo, which is its best match.
        */

        const result =
            data.results[0];


        const coordinates = {

            latitude:
                weatherSafeNumber(
                    result.latitude
                ),

            longitude:
                weatherSafeNumber(
                    result.longitude
                ),

            city:
                result.name ||
                cleanLocation,

            country:
                result.country ||
                "",

            countryCode:
                result.country_code ||
                "",

            timezone:
                result.timezone ||
                "auto"

        };


        if (
            !Number.isFinite(
                coordinates.latitude
            ) ||
            !Number.isFinite(
                coordinates.longitude
            )
        ) {

            throw new Error(
                "Invalid coordinates returned."
            );

        }


        this.setCached(
            key,
            coordinates,
            GEOCODING_CACHE_TTL
        );


        return coordinates;

    },


    /* =====================================
       WEATHER
    ===================================== */

    async getWeather(
        location
    ) {

        const coordinates =
            await this.getCoordinates(
                location
            );


        const cacheKey =
            `weather:${coordinates.latitude}:${coordinates.longitude}`;


        const cached =
            this.getCached(
                cacheKey
            );


        if (cached) {

            return cached;

        }


        const timezone =
            coordinates.timezone ||
            "auto";


        const currentVariables = [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "rain",
            "wind_speed_10m"
        ];


        const hourlyVariables = [
            "precipitation_probability",
            "temperature_2m"
        ];


        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${encodeURIComponent(
                coordinates.latitude
            )}` +
            `&longitude=${encodeURIComponent(
                coordinates.longitude
            )}` +
            `&current=${encodeURIComponent(
                currentVariables.join(",")
            )}` +
            `&hourly=${encodeURIComponent(
                hourlyVariables.join(",")
            )}` +
            "&forecast_days=1" +
            `&timezone=${encodeURIComponent(
                timezone
            )}`;


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Weather request failed (${response.status}).`
            );

        }


        const data =
            await response.json();


        const current =
            data.current || {};


        const hourly =
            data.hourly || {};


        /* =================================
           CURRENT WEATHER
        ================================= */

        const currentTime =
            current.time ||
            "";


        const hourlyTimes =
            Array.isArray(
                hourly.time
            )
                ? hourly.time
                : [];


        const precipitationProbabilities =
            Array.isArray(
                hourly.precipitation_probability
            )
                ? hourly.precipitation_probability
                : [];


        /*
           Exact time matching can fail because
           different API responses may represent
           timestamps with slightly different formatting.

           Therefore find the closest hourly timestamp.
        */

        let currentIndex = -1;


        if (
            currentTime &&
            hourlyTimes.length
        ) {

            const currentTimestamp =
                new Date(
                    currentTime
                ).getTime();


            let smallestDifference =
                Infinity;


            hourlyTimes.forEach(
                (
                    time,
                    index
                ) => {

                    const timestamp =
                        new Date(
                            time
                        ).getTime();


                    if (
                        !Number.isFinite(
                            timestamp
                        ) ||
                        !Number.isFinite(
                            currentTimestamp
                        )
                    ) {

                        return;

                    }


                    const difference =
                        Math.abs(
                            timestamp -
                            currentTimestamp
                        );


                    if (
                        difference <
                        smallestDifference
                    ) {

                        smallestDifference =
                            difference;

                        currentIndex =
                            index;

                    }

                }
            );

        }


        const precipitationProbability =
            currentIndex >= 0
                ? weatherSafeNumber(
                    precipitationProbabilities[
                        currentIndex
                    ]
                )
                : 0;


        /* =================================
           RESULT
        ================================= */

        const result = {

            location:
                coordinates,


            current: {

                temperature:
                    weatherSafeNumber(
                        current.temperature_2m
                    ),


                apparentTemperature:
                    weatherSafeNumber(
                        current.apparent_temperature
                    ),


                humidity:
                    weatherSafeNumber(
                        current.relative_humidity_2m
                    ),


                precipitation:
                    weatherSafeNumber(
                        current.precipitation
                    ),


                rain:
                    weatherSafeNumber(
                        current.rain
                    ),


                wind:
                    weatherSafeNumber(
                        current.wind_speed_10m
                    ),


                precipitationProbability:
                    precipitationProbability

            }

        };


        result.risk =
            this.calculateRisk(
                result.current
            );


        this.setCached(
            cacheKey,
            result,
            WEATHER_CACHE_TTL
        );


        return result;

    },


    /* =====================================
       RISK ENGINE
    ===================================== */

    calculateRisk(
        weather
    ) {

        const safeWeather =
            weather || {};


        let score = 0;


        const factors = [];


        const precipitationProbability =
            weatherSafeNumber(
                safeWeather.precipitationProbability
            );


        const wind =
            weatherSafeNumber(
                safeWeather.wind
            );


        const temperature =
            weatherSafeNumber(
                safeWeather.temperature
            );


        const humidity =
            weatherSafeNumber(
                safeWeather.humidity
            );


        /* =================================
           PRECIPITATION
        ================================= */

        if (
            precipitationProbability >=
            70
        ) {

            score +=
                35;


            factors.push(
                "High precipitation probability"
            );

        }
        else if (
            precipitationProbability >=
            40
        ) {

            score +=
                20;


            factors.push(
                "Moderate precipitation probability"
            );

        }


        /* =================================
           WIND
        ================================= */

        if (
            wind >=
            45
        ) {

            score +=
                25;


            factors.push(
                "High wind speed"
            );

        }
        else if (
            wind >=
            30
        ) {

            score +=
                12;


            factors.push(
                "Elevated wind speed"
            );

        }


        /* =================================
           TEMPERATURE
        ================================= */

        if (
            temperature >=
            35
        ) {

            score +=
                25;


            factors.push(
                "High temperature"
            );

        }
        else if (
            temperature >=
            30
        ) {

            score +=
                12;


            factors.push(
                "Elevated temperature"
            );

        }


        /* =================================
           HUMIDITY
        ================================= */

        if (
            humidity >=
            85
        ) {

            score +=
                15;


            factors.push(
                "Very high humidity"
            );

        }


        score =
            Math.min(
                Math.max(
                    Math.round(
                        score
                    ),
                    0
                ),
                100
            );


        let level =
            "LOW";


        if (
            score >=
            70
        ) {

            level =
                "HIGH";

        }
        else if (
            score >=
            40
        ) {

            level =
                "MEDIUM";

        }


        return {

            score,

            level,

            factors

        };

    },


    /* =====================================
       RECOMMENDATION ENGINE
    ===================================== */

    getRecommendation(
        weather,
        rescuePriority
    ) {

        const recommendations = [];


        const current =
            weather?.current || {};


        const risk =
            weather?.risk || {


                level:
                    "LOW",

                score:
                    0,

                factors:
                    []

            };


        const safeRescuePriority =
            weatherSafeNumber(
                rescuePriority
            );


        const temperature =
            weatherSafeNumber(
                current.temperature
            );


        const precipitationProbability =
            weatherSafeNumber(
                current.precipitationProbability
            );


        if (
            risk.level ===
            "HIGH"
        ) {

            recommendations.push(
                "Prioritize rapid collection because environmental conditions may increase operational risk."
            );

        }


        if (
            temperature >=
            30
        ) {

            recommendations.push(
                "Use temperature-sensitive handling for perishable food."
            );

        }


        if (
            precipitationProbability >=
            60
        ) {

            recommendations.push(
                "Prepare an alternative collection window or protected transport."
            );

        }


        if (
            safeRescuePriority >=
            80
        ) {

            recommendations.push(
                "Combine urgency with environmental risk when scheduling this rescue."
            );

        }


        if (
            !recommendations.length
        ) {

            recommendations.push(
                "Current environmental conditions do not indicate additional operational constraints."
            );

        }


        return recommendations;

    }

};


/* =========================================
   RENDER WEATHER PANEL
========================================= */

function renderWeatherPanel(
    weather,
    rescuePriority
) {

    const panel =
        document.getElementById(
            "weatherIntelligence"
        );


    if (!panel) {
        return;
    }


    if (
        !weather ||
        !weather.current ||
        !weather.risk ||
        !weather.location
    ) {

        panel.innerHTML = "";

        return;

    }


    const current =
        weather.current;


    const risk =
        weather.risk;


    const location =
        weather.location;


    const temperature =
        weatherSafeNumber(
            current.temperature
        );


    const humidity =
        weatherSafeNumber(
            current.humidity
        );


    const precipitationProbability =
        weatherSafeNumber(
            current.precipitationProbability
        );


    const wind =
        weatherSafeNumber(
            current.wind
        );


    const riskScore =
        Math.min(
            100,
            Math.max(
                0,
                weatherSafeNumber(
                    risk.score
                )
            )
        );


    const riskLevel =
        String(
            risk.level ||
            "LOW"
        ).toUpperCase();


    const factors =
        Array.isArray(
            risk.factors
        )
            ? risk.factors
            : [];


    const recommendations =
        FoodRescueWeather
            .getRecommendation(
                weather,
                rescuePriority
            );


    panel.innerHTML = `

        <div class="weather-header">

            <div>

                <span class="command-label">
                    ENVIRONMENTAL INTELLIGENCE
                </span>

                <h3>
                    Live rescue conditions
                </h3>

            </div>


            <span
                class="weather-risk-badge ${weatherEscapeHTML(
                    riskLevel.toLowerCase()
                )}"
            >
                ${weatherEscapeHTML(
                    riskLevel
                )} RISK
            </span>

        </div>


        <div class="weather-location">

            <strong>
                ${weatherEscapeHTML(
                    location.city ||
                    "Unknown location"
                )}
            </strong>

            <span>
                ${weatherEscapeHTML(
                    location.country ||
                    ""
                )}
            </span>

        </div>


        <div class="weather-metrics">


            <div class="weather-metric">

                <span>
                    Temperature
                </span>

                <strong>
                    ${temperature.toFixed(1)}°C
                </strong>

            </div>


            <div class="weather-metric">

                <span>
                    Humidity
                </span>

                <strong>
                    ${humidity.toFixed(0)}%
                </strong>

            </div>


            <div class="weather-metric">

                <span>
                    Rain probability
                </span>

                <strong>
                    ${precipitationProbability.toFixed(0)}%
                </strong>

            </div>


            <div class="weather-metric">

                <span>
                    Wind
                </span>

                <strong>
                    ${wind.toFixed(1)} km/h
                </strong>

            </div>


        </div>


        <div class="weather-risk-bar">

            <div>

                <span>
                    Environmental risk
                </span>

                <strong>
                    ${riskScore}/100
                </strong>

            </div>


            <div class="weather-progress">

                <div
                    style="width:${riskScore}%"
                ></div>

            </div>

        </div>


        <div class="weather-factors">

            ${
                factors.length

                    ? factors
                        .map(
                            factor => `

                                <span>
                                    ${weatherEscapeHTML(
                                        factor
                                    )}
                                </span>

                            `
                        )
                        .join("")

                    : `

                        <span class="weather-safe">
                            No major environmental risk detected.
                        </span>

                    `
            }

        </div>


        <div class="weather-recommendation">

            ${
                recommendations
                    .map(
                        item => `

                            <p>
                                ${weatherEscapeHTML(
                                    item
                                )}
                            </p>

                        `
                    )
                    .join("")
            }

        </div>

    `;


    panel.dataset.riskScore =
        String(
            riskScore
        );


    panel.dataset.location =
        String(
            location.city ||
            ""
        );

}


/* =========================================
   GLOBAL ACCESS
========================================= */

window.FoodRescueWeather =
    FoodRescueWeather;


window.renderWeatherPanel =
    renderWeatherPanel;
