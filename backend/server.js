"use strict";

const http = require("http");

const {
    analyzeSurplus,
    createRescue,
    completeRescue
} = require("./rescue-service");

const {
    analyzeWithAI
} = require("./ai-service");

const {
    getWeather
} = require("./weather-service");


const PORT =
    Number(process.env.PORT) || 3000;


function sendJSON(
    response,
    status,
    data
) {

    response.writeHead(
        status,
        {
            "Content-Type":
                "application/json; charset=utf-8",

            "Access-Control-Allow-Origin":
                "*",

            "Access-Control-Allow-Methods":
                "GET,POST,OPTIONS",

            "Access-Control-Allow-Headers":
                "Content-Type"
        }
    );


    response.end(
        JSON.stringify(
            data
        )
    );

}


function readBody(
    request
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            let body = "";


            request.on(
                "data",
                chunk => {

                    body += chunk;


                    if (
                        body.length >
                        1_000_000
                    ) {

                        reject(
                            new Error(
                                "Request too large."
                            )
                        );

                        request.destroy();

                    }

                }
            );


            request.on(
                "end",
                () => {

                    try {

                        resolve(
                            body
                                ? JSON.parse(
                                    body
                                )
                                : {}
                        );

                    }

                    catch {

                        reject(
                            new Error(
                                "Invalid JSON."
                            )
                        );

                    }

                }
            );


            request.on(
                "error",
                reject
            );

        }
    );

}


const server =
    http.createServer(
        async (
            request,
            response
        ) => {

            if (
                request.method ===
                "OPTIONS"
            ) {

                sendJSON(
                    response,
                    204,
                    {}
                );

                return;
            }


            try {

                /* =====================================
                   HEALTH
                ===================================== */

                if (
                    request.method === "GET" &&
                    request.url === "/api/health"
                ) {

                    sendJSON(
                        response,
                        200,
                        {

                            name:
                                "FoodRescue API",

                            status:
                                "online",

                            version:
                                "2.0.0",

                            services: {

                                rescue:
                                    true,

                                matching:
                                    true,

                                weather:
                                    true,

                                ai:
                                    Boolean(
                                        process.env
                                            .GEMINI_API_KEY
                                    )

                            }

                        }
                    );

                    return;
                }


                /* =====================================
                   SURPLUS ANALYSIS
                ===================================== */

                if (
                    request.method === "POST" &&
                    request.url === "/api/analyze"
                ) {

                    const body =
                        await readBody(
                            request
                        );


                    const analysis =
                        analyzeSurplus(
                            body
                        );


                    let ai = null;


                    try {

                        ai =
                            await analyzeWithAI(
                                body
                            );

                    }

                    catch (error) {

                        ai = {

                            provider:
                                "local-fallback",

                            available:
                                false,

                            message:
                                error.message

                        };

                    }


                    sendJSON(
                        response,
                        200,
                        {

                            success:
                                true,

                            analysis:
                                analysis.analysis,

                            matches:
                                analysis.matches,

                            ai

                        }
                    );

                    return;
                }


                /* =====================================
                   CREATE RESCUE
                ===================================== */

                if (
                    request.method === "POST" &&
                    request.url === "/api/rescue"
                ) {

                    const body =
                        await readBody(
                            request
                        );


                    const rescue =
                        createRescue(
                            body
                        );


                    sendJSON(
                        response,
                        201,
                        {

                            success:
                                true,

                            rescue

                        }
                    );

                    return;
                }


                /* =====================================
                   COMPLETE RESCUE
                ===================================== */

                if (
                    request.method === "POST" &&
                    request.url ===
                        "/api/rescue/complete"
                ) {

                    const body =
                        await readBody(
                            request
                        );


                    const rescue =
                        completeRescue(
                            body
                        );


                    sendJSON(
                        response,
                        200,
                        {

                            success:
                                true,

                            rescue

                        }
                    );

                    return;
                }


                /* =====================================
                   WEATHER
                ===================================== */

                if (
                    request.method === "GET" &&
                    request.url.startsWith(
                        "/api/weather"
                    )
                ) {

                    const url =
                        new URL(
                            request.url,
                            `http://localhost:${PORT}`
                        );


                    const location =
                        url.searchParams.get(
                            "location"
                        );


                    if (!location) {

                        sendJSON(
                            response,
                            400,
                            {
                                error:
                                    "location is required"
                            }
                        );

                        return;
                    }


                    const weather =
                        await getWeather(
                            location
                        );


                    sendJSON(
                        response,
                        200,
                        {

                            success:
                                true,

                            weather

                        }
                    );

                    return;
                }


                /* =====================================
                   NOT FOUND
                ===================================== */

                sendJSON(
                    response,
                    404,
                    {
                        error:
                            "Route not found"
                    }
                );

            }

            catch (error) {

                console.error(
                    "FoodRescue API error:",
                    error
                );


                sendJSON(
                    response,
                    500,
                    {

                        error:
                            error.message ||
                            "Internal server error"

                    }
                );

            }

        }
    );


server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `FoodRescue API running on port ${PORT}`
        );

    }
);