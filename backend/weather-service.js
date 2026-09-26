"use strict";


async function getCoordinates(
    location
) {

    const url =
        "https://geocoding-api.open-meteo.com/v1/search" +
        `?name=${encodeURIComponent(location)}` +
        "&count=1" +
        "&language=en" +
        "&format=json";


    const response =
        await fetch(
            url
        );


    if (!response.ok) {

        throw new Error(
            "Location lookup failed."
        );

    }


    const data =
        await response.json();


    if (
        !data.results?.length
    ) {

        throw new Error(
            "Location not found."
        );

    }


    const result =
        data.results[0];


    return {

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

}


async function getWeather(
    location
) {

    const coordinates =
        await getCoordinates(
            location
        );


    const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${coordinates.latitude}` +
        `&longitude=${coordinates.longitude}` +
        "&current=" +
        [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation",
            "wind_speed_10m"
        ].join(",") +
        "&hourly=" +
        "precipitation_probability" +
        "&forecast_days=1" +
        `&timezone=${encodeURIComponent(
            coordinates.timezone || "auto"
        )}`;


    const response =
        await fetch(
            url
        );


    if (!response.ok) {

        throw new Error(
            "Weather request failed."
        );

    }


    const data =
        await response.json();


    const current =
        data.current || {};


    const weather = {

        location:
            coordinates,

        temperature:
            Number(
                current.temperature_2m || 0
            ),

        humidity:
            Number(
                current.relative_humidity_2m || 0
            ),

        precipitation:
            Number(
                current.precipitation || 0
            ),

        wind:
            Number(
                current.wind_speed_10m || 0
            )

    };


    let operationalRisk = 0;


    if (
        weather.temperature >= 35
    ) {

        operationalRisk += 35;

    }

    else if (
        weather.temperature >= 30
    ) {

        operationalRisk += 15;

    }


    if (
        weather.wind >= 45
    ) {

        operationalRisk += 30;

    }

    else if (
        weather.wind >= 30
    ) {

        operationalRisk += 15;

    }


    if (
        weather.humidity >= 85
    ) {

        operationalRisk += 20;

    }


    if (
        weather.precipitation > 5
    ) {

        operationalRisk += 15;

    }


    operationalRisk =
        Math.min(
            100,
            operationalRisk
        );


    return {

        ...weather,

        operationalRisk

    };

}


module.exports = {
    getWeather
};