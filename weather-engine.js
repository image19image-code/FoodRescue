"use strict";

/* =========================================
   FOODRESCUE — ENVIRONMENTAL INTELLIGENCE
========================================= */

const FoodRescueWeather = {

    cache: new Map(),

    async getCoordinates(location) {

        if (!location) {
            throw new Error(
                "Location is required."
            );
        }

        const key =
            location
                .trim()
                .toLowerCase();

        if (this.cache.has(key)) {
            return this.cache.get(key);
        }

        const url =
            "https://geocoding-api.open-meteo.com/v1/search" +
            `?name=${encodeURIComponent(location)}` +
            "&count=1" +
            "&language=en" +
            "&format=json";

        const response =
            await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Geocoding request failed."
            );
        }

        const data =
            await response.json();

        if (
            !data.results ||
            !data.results.length
        ) {
            throw new Error(
                "Location not found."
            );
        }

        const result =
            data.results[0];

        const coordinates = {

            latitude:
                result.latitude,

            longitude:
                result.longitude,

            city:
                result.name,

            country:
                result.country,

            timezone:
                result.timezone

        };

        this.cache.set(
            key,
            coordinates
        );

        return coordinates;
    },


    async getWeather(location) {

        const coordinates =
            await this.getCoordinates(
                location
            );


        const cacheKey =
            `weather:${coordinates.latitude}:${coordinates.longitude}`;


        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }


        const url =
            "https://api.open-meteo.com/v1/forecast" +
            `?latitude=${coordinates.latitude}` +
            `&longitude=${coordinates.longitude}` +
            "&current=" +
            [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "precipitation",
                "rain",
                "wind_speed_10m"
            ].join(",") +
            "&hourly=" +
            [
                "precipitation_probability",
                "temperature_2m"
            ].join(",") +
            "&forecast_days=1" +
            `&timezone=${encodeURIComponent(
                coordinates.timezone || "auto"
            )}`;


        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error(
                "Weather request failed."
            );
        }


        const data =
            await response.json();


        const current =
            data.current || {};


        const currentTime =
            current.time;


        const hourlyTimes =
            data.hourly?.time || [];


        const precipitationProbabilities =
            data.hourly?.precipitation_probability || [];


        const currentIndex =
            hourlyTimes.indexOf(
                currentTime
            );


        const precipitationProbability =
            currentIndex >= 0
                ? (
                    precipitationProbabilities[
                        currentIndex
                    ] ?? 0
                )
                : 0;


        const result = {

            location:
                coordinates,

            current: {

                temperature:
                    Number(
                        current.temperature_2m ?? 0
                    ),

                apparentTemperature:
                    Number(
                        current.apparent_temperature ?? 0
                    ),

                humidity:
                    Number(
                        current.relative_humidity_2m ?? 0
                    ),

                precipitation:
                    Number(
                        current.precipitation ?? 0
                    ),

                rain:
                    Number(
                        current.rain ?? 0
                    ),

                wind:
                    Number(
                        current.wind_speed_10m ?? 0
                    ),

                precipitationProbability:
                    Number(
                        precipitationProbability
                    )

            }

        };


        result.risk =
            this.calculateRisk(
                result.current
            );


        this.cache.set(
            cacheKey,
            result
        );


        return result;
    },


    calculateRisk(weather) {

        let score = 0;

        const factors = [];


        if (
            weather.precipitationProbability >= 70
        ) {

            score += 35;

            factors.push(
                "High precipitation probability"
            );

        }

        else if (
            weather.precipitationProbability >= 40
        ) {

            score += 20;

            factors.push(
                "Moderate precipitation probability"
            );

        }


        if (
            weather.wind >= 45
        ) {

            score += 25;

            factors.push(
                "High wind speed"
            );

        }

        else if (
            weather.wind >= 30
        ) {

            score += 12;

            factors.push(
                "Elevated wind speed"
            );

        }


        if (
            weather.temperature >= 35
        ) {

            score += 25;

            factors.push(
                "High temperature"
            );

        }

        else if (
            weather.temperature >= 30
        ) {

            score += 12;

            factors.push(
                "Elevated temperature"
            );

        }


        if (
            weather.humidity >= 85
        ) {

            score += 15;

            factors.push(
                "Very high humidity"
            );

        }


        score =
            Math.min(
                score,
                100
            );


        let level =
            "LOW";


        if (score >= 70) {
            level = "HIGH";
        }

        else if (score >= 40) {
            level = "MEDIUM";
        }


        return {

            score,

            level,

            factors

        };

    },


    getRecommendation(
        weather,
        rescuePriority
    ) {

        const recommendations = [];


        if (
            weather.risk.level === "HIGH"
        ) {

            recommendations.push(
                "Prioritize rapid collection because environmental conditions may increase operational risk."
            );

        }


        if (
            weather.current.temperature >= 30
        ) {

            recommendations.push(
                "Use temperature-sensitive handling for perishable food."
            );

        }


        if (
            weather.current.precipitationProbability >= 60
        ) {

            recommendations.push(
                "Prepare an alternative collection window or protected transport."
            );

        }


        if (
            rescuePriority >= 80
        ) {

            recommendations.push(
                "Combine urgency with environmental risk when scheduling this rescue."
            );

        }


        if (!recommendations.length) {

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


    const current =
        weather.current;


    const risk =
        weather.risk;


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
                class="weather-risk-badge ${risk.level.toLowerCase()}"
            >
                ${risk.level} RISK
            </span>

        </div>


        <div class="weather-location">

            <strong>
                ${weather.location.city}
            </strong>

            <span>
                ${weather.location.country}
            </span>

        </div>


        <div class="weather-metrics">

            <div class="weather-metric">

                <span>
                    Temperature
                </span>

                <strong>
                    ${current.temperature.toFixed(1)}°C
                </strong>

            </div>


            <div class="weather-metric">

                <span>
                    Humidity
                </span>

                <strong>
                    ${current.humidity}%
                </strong>

            </div>


            <div class="weather-metric">

                <span>
                    Rain probability
                </span>

                <strong>
                    ${current.precipitationProbability}%
                </strong>

            </div>


            <div class="weather-metric">

                <span>
                    Wind
                </span>

                <strong>
                    ${current.wind.toFixed(1)} km/h
                </strong>

            </div>

        </div>


        <div class="weather-risk-bar">

            <div>

                <span>
                    Environmental risk
                </span>

                <strong>
                    ${risk.score}/100
                </strong>

            </div>


            <div class="weather-progress">

                <div
                    style="width:${risk.score}%"
                ></div>

            </div>

        </div>


        <div class="weather-factors">

            ${
                risk.factors.length

                    ? risk.factors
                        .map(
                            factor => `
                                <span>
                                    ${factor}
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
                FoodRescueWeather
                    .getRecommendation(
                        weather,
                        rescuePriority
                    )
                    .map(
                        item => `
                            <p>
                                ${item}
                            </p>
                        `
                    )
                    .join("")
            }

        </div>

    `;
}


/* =========================================
   GLOBAL ACCESS
========================================= */

window.FoodRescueWeather =
    FoodRescueWeather;

window.renderWeatherPanel =
    renderWeatherPanel;