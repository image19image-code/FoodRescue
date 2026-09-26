"use strict";

const fs = require("fs");
const path = require("path");


const DATA_DIRECTORY =
    path.join(
        __dirname,
        "storage"
    );


const DATA_FILE =
    path.join(
        DATA_DIRECTORY,
        "foodrescue.json"
    );


function ensureDatabase() {

    if (
        !fs.existsSync(
            DATA_DIRECTORY
        )
    ) {

        fs.mkdirSync(
            DATA_DIRECTORY,
            {
                recursive: true
            }
        );

    }


    if (
        !fs.existsSync(
            DATA_FILE
        )
    ) {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                {
                    rescues: []
                },
                null,
                2
            )
        );

    }

}


function readDatabase() {

    ensureDatabase();


    try {

        return JSON.parse(
            fs.readFileSync(
                DATA_FILE,
                "utf8"
            )
        );

    }

    catch {

        return {
            rescues: []
        };

    }

}


function writeDatabase(
    data
) {

    ensureDatabase();


    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(
            data,
            null,
            2
        )
    );

}


function addRescue(
    rescue
) {

    const database =
        readDatabase();


    database.rescues.push(
        rescue
    );


    writeDatabase(
        database
    );


    return rescue;

}


function findRescue(
    id
) {

    const database =
        readDatabase();


    return database.rescues.find(
        rescue =>
            rescue.id === id
    ) || null;

}


function updateRescue(
    id,
    updates
) {

    const database =
        readDatabase();


    const index =
        database.rescues.findIndex(
            rescue =>
                rescue.id === id
        );


    if (index === -1) {
        return null;
    }


    database.rescues[index] = {

        ...database.rescues[index],

        ...updates

    };


    writeDatabase(
        database
    );


    return database.rescues[index];

}


function getRescues() {

    return readDatabase()
        .rescues;

}


module.exports = {

    addRescue,

    findRescue,

    updateRescue,

    getRescues

};