"use strict";

/* =========================================
   FOODRESCUE — RESCUE INTELLIGENCE ENGINE
========================================= */


/* =========================================
   TIME UTILITIES
========================================= */

function getMinutesFromTime(time) {

    if (
        typeof time !== "string" ||
        !/^\d{2}:\d{2}$/.test(time)
    ) {
        return 0;
    }

    const [
        hours,
        minutes
    ] = time
        .split(":")
        .map(Number);


    if (
        !Number.isInteger(hours) ||
        !Number.isInteger(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return 0;
    }


    return (
        hours * 60 +
        minutes
    );
}


function isValidTime(time) {

    if (
        typeof time !== "string" ||
        !/^\d{2}:\d{2}$/.test(time)
    ) {
        return false;
    }


    const [
        hours,
        minutes
    ] = time
        .split(":")
        .map(Number);


    return (
        Number.isInteger(hours) &&
        Number.isInteger(minutes) &&
        hours >= 0 &&
        hours <= 23 &&
        minutes >= 0 &&
        minutes <= 59
    );

}


function getCurrentMinutes() {

    const now =
        new Date();


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

    const validAvailability =
        isValidTime(
            availableFrom
        );


    const validExpiry =
        isValidTime(
            expiryTime
        );


    if (
        !validAvailability ||
        !validExpiry
    ) {

        return {

            currentMinutes:
                getCurrentMinutes(),

            availableMinutes:
                validAvailability
                    ? getMinutesFromTime(
                        availableFrom
                    )
                    : 0,

            expiryMinutes:
                validExpiry
                    ? getMinutesFromTime(
                        expiryTime
                    )
                    : 0,

            availableRelative:
                0,

            expiryRelative:
                0,

            rescueWindow:
                0,

            remainingMinutes:
                0,

            untilAvailable:
                0,

            notYetAvailable:
                false,

            expired:
                false,

            currentlyAvailable:
                false,

            valid:
                false

        };

    }


    const currentMinutes =
        getCurrentMinutes();


    const availableMinutes =
        getMinutesFromTime(
            availableFrom
        );


    const expiryMinutes =
        getMinutesFromTime(
            expiryTime
        );


    let availableOffset = 0;
    let expiryOffset = 0;

    let notYetAvailable = false;
    let expired = false;
    let currentlyAvailable = false;


    /* ========================================
       SAME-DAY WINDOW
    ======================================== */

    if (
        expiryMinutes > availableMinutes
    ) {

        /*
           Example:
           Available 10:00
           Expiry    18:00
        */

        if (
            currentMinutes <
            availableMinutes
        ) {

            /*
               Food is not available yet.
            */

            notYetAvailable =
                true;

            currentlyAvailable =
                false;

            expired =
                false;


            availableOffset =
                availableMinutes -
                currentMinutes;


            expiryOffset =
                expiryMinutes -
                currentMinutes;

        }

        else if (
            currentMinutes <=
            expiryMinutes
        ) {

            /*
               Food is currently available.
            */

            notYetAvailable =
                false;

            currentlyAvailable =
                true;

            expired =
                false;


            availableOffset =
                0;


            expiryOffset =
                expiryMinutes -
                currentMinutes;

        }

        else {

            /*
               Expiry has passed.
            */

            notYetAvailable =
                false;

            currentlyAvailable =
                false;

            expired =
                true;


            availableOffset =
                0;

            expiryOffset =
                0;

        }

    }


    /* ========================================
       MIDNIGHT-CROSSING WINDOW
    ======================================== */

    else {

        /*
           Example:
           Available 22:00
           Expiry    02:00

           This means expiry is on the
           following day.
        */


        if (
            currentMinutes >=
            availableMinutes
        ) {

            /*
               Example:
               Current 23:00
               Available 22:00
               Expiry 02:00

               Food is currently available.
            */

            notYetAvailable =
                false;

            currentlyAvailable =
                true;

            expired =
                false;


            availableOffset =
                0;


            expiryOffset =
                (
                    24 * 60
                ) -
                currentMinutes +
                expiryMinutes;

        }

        else if (
            currentMinutes <
            expiryMinutes
        ) {

            /*
               Example:
               Current 01:00
               Available 22:00
               Expiry 02:00

               Food is still available
               after midnight.
            */

            notYetAvailable =
                false;

            currentlyAvailable =
                true;

            expired =
                false;


            availableOffset =
                0;


            expiryOffset =
                expiryMinutes -
                currentMinutes;

        }

        else {

            /*
               Example:
               Current 12:00
               Available 22:00
               Expiry 02:00

               The next rescue window
               starts later today.
            */

            notYetAvailable =
                true;

            currentlyAvailable =
                false;

            expired =
                false;


            availableOffset =
                availableMinutes -
                currentMinutes;


            expiryOffset =
                (
                    24 * 60 -
                    currentMinutes
                ) +
                expiryMinutes;

        }

    }


    const remainingMinutes =
        currentlyAvailable
            ? Math.max(
                0,
                expiryOffset
            )
            : 0;


    const untilAvailable =
        notYetAvailable
            ? Math.max(
                0,
                availableOffset
            )
            : 0;


    const rescueWindow =
        Math.max(
            0,
            expiryOffset -
            availableOffset
        );


    /*
       Relative minute positions.

       These are based on the current moment
       so they remain useful even when a window
       crosses midnight.
    */

    const availableRelative =
        currentMinutes +
        availableOffset;


    const expiryRelative =
        currentMinutes +
        expiryOffset;


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

        expired,

        currentlyAvailable,

        valid: true

    };

}


/* =========================================
   BACKWARD COMPATIBILITY
========================================= */

function calculateRemainingMinutes(
    expiryTime
) {

    if (
        !isValidTime(
            expiryTime
        )
    ) {
        return 0;
    }


    const currentMinutes =
        getCurrentMinutes();


    const expiryMinutes =
        getMinutesFromTime(
            expiryTime
        );


    let difference =
        expiryMinutes -
        currentMinutes;


    /*
       This compatibility helper has no
       availableFrom value, so it treats
       a past time as the next occurrence.
    */

    if (
        difference <= 0
    ) {

        difference +=
            24 * 60;

    }


    return difference;

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


    if (
        !time.valid
    ) {

        return 0;

    }


    let score = 0;


    /* ========================================
       NOT YET AVAILABLE
    ======================================== */

    if (
        time.notYetAvailable
    ) {

        /*
           Food is not currently rescuable.
           Urgency is intentionally reduced.
        */

        score += 5;

    }


    /* ========================================
       EXPIRED
    ======================================== */

    else if (
        time.expired
    ) {

        score =
            100;

    }


    /* ========================================
       CURRENTLY AVAILABLE
    ======================================== */

    else if (
        time.currentlyAvailable
    ) {

        if (
            time.remainingMinutes <=
            60
        ) {

            score +=
                50;

        }

        else if (
            time.remainingMinutes <=
            120
        ) {

            score +=
                40;

        }

        else if (
            time.remainingMinutes <=
            240
        ) {

            score +=
                30;

        }

        else if (
            time.remainingMinutes <=
            480
        ) {

            score +=
                20;

        }

        else {

            score +=
                10;

        }

    }


    /* ========================================
       QUANTITY
    ======================================== */

    const safeQuantity =
        Number(
            quantity
        ) || 0;


    if (
        safeQuantity >=
        100
    ) {

        score +=
            30;

    }

    else if (
        safeQuantity >=
        50
    ) {

        score +=
            25;

    }

    else if (
        safeQuantity >=
        20
    ) {

        score +=
            18;

    }

    else if (
        safeQuantity >=
        10
    ) {

        score +=
            12;

    }

    else {

        score +=
            6;

    }


    /* ========================================
       FOOD PERISHABILITY
    ======================================== */

    if (
        foodType === "prepared" ||
        foodType === "dairy" ||
        foodType === "fruit" ||
        foodType === "fruits" ||
        foodType === "vegetables"
    ) {

        score +=
            15;

    }

    else if (
        foodType === "bakery"
    ) {

        score +=
            10;

    }

    else {

        score +=
            5;

    }


    /* ========================================
       FINAL SCORE
    ======================================== */

    return Math.min(
        Math.round(
            score
        ),
        100
    );

}


/* =========================================
   PRIORITY LEVEL
========================================= */

function getPriorityLabel(
    score
) {

    const safeScore =
        Number(
            score
        ) || 0;


    if (
        safeScore >=
        80
    ) {

        return "CRITICAL";

    }


    if (
        safeScore >=
        60
    ) {

        return "HIGH PRIORITY";

    }


    if (
        safeScore >=
        40
    ) {

        return "MEDIUM PRIORITY";

    }


    return "LOW PRIORITY";

}


/* =========================================
   RESCUE RECOMMENDATION
========================================= */

function getRecommendation(
    score
) {

    const safeScore =
        Number(
            score
        ) || 0;


    if (
        safeScore >=
        80
    ) {

        return (
            "Critical rescue. Match this surplus with the nearest suitable organization immediately."
        );

    }


    if (
        safeScore >=
        60
    ) {

        return (
            "High-priority rescue. Start matching with nearby organizations immediately."
        );

    }


    if (
        safeScore >=
        40
    ) {

        return (
            "Plan a rescue soon and prioritize nearby organizations."
        );

    }


    return (
        "Early-stage surplus. Register it in the network and monitor its availability."
    );

}


/* =========================================
   TIME DISPLAY
========================================= */

function formatRemainingTime(
    minutes
) {

    const safeMinutes =
        Math.max(
            0,
            Number(
                minutes
            ) || 0
        );


    if (
        safeMinutes <=
        0
    ) {

        return "Expired";

    }


    const hours =
        Math.floor(
            safeMinutes /
            60
        );


    const mins =
        safeMinutes %
        60;


    if (
        hours > 0 &&
        mins > 0
    ) {

        return (
            `${hours}h ${mins}m`
        );

    }


    if (
        hours > 0
    ) {

        return (
            `${hours}h`
        );

    }


    return (
        `${mins}m`
    );

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


    if (
        !time.valid
    ) {

        return {

            status:
                "INVALID",

            minutes:
                0

        };

    }


    if (
        time.expired
    ) {

        return {

            status:
                "EXPIRED",

            minutes:
                0

        };

    }


    if (
        time.notYetAvailable
    ) {

        return {

            status:
                "AVAILABLE IN",

            minutes:
                time.untilAvailable

        };

    }


    return {

        status:
            "TIME REMAINING",

        minutes:
            time.remainingMinutes

    };

}


/* =========================================
   OPTIONAL DEBUG HELPER
========================================= */

function getRescueEngineDebug(
    availableFrom,
    expiryTime
) {

    return analyzeRescueTime(
        availableFrom,
        expiryTime
    );

}
