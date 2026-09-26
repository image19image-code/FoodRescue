"use strict";

/* =========================================
   FOODRESCUE — RESCUE INTELLIGENCE ENGINE
========================================= */


/* =========================================
   TIME UTILITIES
========================================= */

function getMinutesFromTime(time) {

    if (!time || !time.includes(":")) {
        return 0;
    }

    const [hours, minutes] =
        time.split(":").map(Number);

    return (hours * 60) + minutes;
}


function getCurrentMinutes() {

    const now = new Date();

    return (
        now.getHours() * 60 +
        now.getMinutes()
    );
}


/* =========================================
   RESCUE TIME ANALYSIS
========================================= */

function analyzeRescueTime(
    availableFrom,
    expiryTime
) {

    const currentMinutes =
        getCurrentMinutes();

    let availableMinutes =
        getMinutesFromTime(availableFrom);

    let expiryMinutes =
        getMinutesFromTime(expiryTime);


    /*
       If expiry is earlier than availability,
       assume expiry is on the next day.
    */

    if (expiryMinutes < availableMinutes) {
        expiryMinutes += 24 * 60;
    }


    /*
       If availability has already passed,
       it belongs to today.
       Otherwise it is the upcoming occurrence.
    */

    let availableRelative =
        availableMinutes;

    if (availableRelative < currentMinutes) {
        availableRelative += 24 * 60;
    }


    /*
       Calculate how much time remains until expiry.
    */

    let expiryRelative =
        expiryMinutes;

    if (expiryRelative < currentMinutes) {
        expiryRelative += 24 * 60;
    }


    /*
       If availability is still in the future,
       food is not yet available.
    */

    const notYetAvailable =
        availableRelative > currentMinutes &&
        availableRelative < expiryRelative;


    /*
       Expired check.
    */

    const expired =
        expiryRelative <= currentMinutes;


    /*
       Rescue window duration.
    */

    const rescueWindow =
        expiryRelative - availableRelative;


    /*
       Time until expiry.
    */

    const remainingMinutes =
        Math.max(
            0,
            expiryRelative - currentMinutes
        );


    /*
       Time until available.
    */

    const untilAvailable =
        Math.max(
            0,
            availableRelative - currentMinutes
        );


    return {
        currentMinutes,
        availableMinutes,
        expiryMinutes,
        availableRelative,
        expiryRelative,
        rescueWindow,
        remainingMinutes,
        untilAvailable,
        notYetAvailable,
        expired
    };
}


/* =========================================
   BACKWARD COMPATIBILITY
========================================= */

function calculateRemainingMinutes(expiryTime) {

    const currentMinutes =
        getCurrentMinutes();

    let expiryMinutes =
        getMinutesFromTime(expiryTime);

    if (expiryMinutes <= currentMinutes) {
        expiryMinutes += 24 * 60;
    }

    return expiryMinutes - currentMinutes;
}


/* =========================================
   PRIORITY ENGINE
========================================= */

function calculatePriority(
    foodType,
    quantity,
    availableFrom,
    expiryTime
) {

    const time =
        analyzeRescueTime(
            availableFrom,
            expiryTime
        );

    let score = 0;


    /* ========================================
       NOT YET AVAILABLE
    ======================================== */

    if (time.notYetAvailable) {

        /*
           The food is not currently rescuable,
           so urgency is intentionally reduced.
        */

        score += 5;

    }


    /* ========================================
       EXPIRED
    ======================================== */

    else if (time.expired) {

        score = 100;

    }


    /* ========================================
       CURRENTLY AVAILABLE
    ======================================== */

    else {

        if (time.remainingMinutes <= 60) {
            score += 50;
        }

        else if (time.remainingMinutes <= 120) {
            score += 40;
        }

        else if (time.remainingMinutes <= 240) {
            score += 30;
        }

        else if (time.remainingMinutes <= 480) {
            score += 20;
        }

        else {
            score += 10;
        }

    }


    /* ========================================
       QUANTITY
    ======================================== */

    if (quantity >= 100) {
        score += 30;
    }

    else if (quantity >= 50) {
        score += 25;
    }

    else if (quantity >= 20) {
        score += 18;
    }

    else if (quantity >= 10) {
        score += 12;
    }

    else {
        score += 6;
    }


    /* ========================================
       FOOD PERISHABILITY
    ======================================== */

    if (
        foodType === "prepared" ||
        foodType === "dairy" ||
        foodType === "fruit" ||
        foodType === "vegetables"
    ) {
        score += 15;
    }

    else if (foodType === "bakery") {
        score += 10;
    }

    else {
        score += 5;
    }


    /* ========================================
       FINAL SCORE
    ======================================== */

    return Math.min(
        Math.round(score),
        100
    );
}


/* =========================================
   PRIORITY LEVEL
========================================= */

function getPriorityLabel(score) {

    if (score >= 80) {
        return "CRITICAL";
    }

    if (score >= 60) {
        return "HIGH PRIORITY";
    }

    if (score >= 40) {
        return "MEDIUM PRIORITY";
    }

    return "LOW PRIORITY";
}


/* =========================================
   RESCUE RECOMMENDATION
========================================= */

function getRecommendation(score) {

    if (score >= 80) {
        return "Critical rescue. Match this surplus with the nearest suitable organization immediately.";
    }

    if (score >= 60) {
        return "High-priority rescue. Start matching with nearby organizations immediately.";
    }

    if (score >= 40) {
        return "Plan a rescue soon and prioritize nearby organizations.";
    }

    return "Early-stage surplus. Register it in the network and monitor its availability.";
}


/* =========================================
   TIME DISPLAY
========================================= */

function formatRemainingTime(minutes) {

    if (minutes <= 0) {
        return "Expired";
    }

    const hours =
        Math.floor(minutes / 60);

    const mins =
        minutes % 60;


    if (hours > 0 && mins > 0) {
        return `${hours}h ${mins}m`;
    }

    if (hours > 0) {
        return `${hours}h`;
    }

    return `${mins}m`;
}


/* =========================================
   AVAILABILITY DISPLAY
========================================= */

function getTimeStatus(
    availableFrom,
    expiryTime
) {

    const time =
        analyzeRescueTime(
            availableFrom,
            expiryTime
        );


    if (time.expired) {

        return {
            status: "EXPIRED",
            minutes: 0
        };

    }


    if (time.notYetAvailable) {

        return {
            status: "AVAILABLE IN",
            minutes: time.untilAvailable
        };

    }


    return {
        status: "TIME REMAINING",
        minutes: time.remainingMinutes
    };
}