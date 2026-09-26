"use strict";

require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env")
});

/* =========================================
   FOODRESCUE — GEMINI AI SERVICE
========================================= */

async function analyzeWithAI(data = {}) {

    const apiKey = process.env.GEMINI_API_KEY;

    /* -----------------------------------------
       CHECK API KEY
    ----------------------------------------- */

    if (!apiKey) {
        return {
            enabled: false,
            analysis: null,
            error: "GEMINI_API_KEY is missing."
        };
    }

    /* -----------------------------------------
       SAFE INPUTS
    ----------------------------------------- */

    const foodType = data.foodType || "unknown";
    const quantity = data.quantity ?? "unknown";
    const unit = data.unit || "unknown";
    const location = data.location || "unknown";
    const availableFrom = data.availableFrom || "unknown";
    const expiryTime = data.expiryTime || "unknown";

    /* -----------------------------------------
       AI PROMPT
    ----------------------------------------- */

    const prompt = `
You are FoodRescue AI, an intelligent food-rescue and sustainability analysis system.

Analyze the following food surplus situation:

Food type: ${foodType}
Quantity: ${quantity}
Unit: ${unit}
Location: ${location}
Available from: ${availableFrom}
Expiry time: ${expiryTime}

Your task is to provide a practical rescue assessment.

Analyze:

1. Food rescue urgency
2. Operational risk
3. Possible food safety concerns
4. Recommended rescue action
5. Recipient/matching strategy
6. Whether immediate intervention is needed
7. A concise explanation of your reasoning

Important:
- Be practical and concise.
- Do not invent information that is not provided.
- Do not claim that food is safe to eat with certainty.
- Highlight when human food-safety verification is required.
- Focus on preventing food waste and improving rescue efficiency.

Return a professional plain-text response.
`;

    /* -----------------------------------------
       GEMINI API REQUEST
    ----------------------------------------- */

    try {

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" +
            encodeURIComponent(apiKey),
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        /* -----------------------------------------
           API ERROR
        ----------------------------------------- */

        if (!response.ok) {

            const errorText = await response.text();

            return {
                enabled: false,
                analysis: null,
                error: `Gemini API error: ${response.status}`,
                details: errorText
            };
        }

        /* -----------------------------------------
           PARSE RESPONSE
        ----------------------------------------- */

        const result = await response.json();

        const aiText =
            result &&
            result.candidates &&
            result.candidates[0] &&
            result.candidates[0].content &&
            result.candidates[0].content.parts &&
            result.candidates[0].content.parts[0] &&
            result.candidates[0].content.parts[0].text
                ? result.candidates[0].content.parts[0].text
                : null;

        /* -----------------------------------------
           EMPTY RESPONSE
        ----------------------------------------- */

        if (!aiText) {

            return {
                enabled: false,
                analysis: null,
                error: "Gemini returned an empty response.",
                raw: result
            };
        }

        /* -----------------------------------------
           SUCCESS
        ----------------------------------------- */

        return {
            enabled: true,
            model: "gemini-3.8-flash",
            analysis: aiText.trim()
        };

    } catch (error) {

        /* -----------------------------------------
           NETWORK / RUNTIME ERROR
        ----------------------------------------- */

        return {
            enabled: false,
            analysis: null,
            error: error.message || "Unknown Gemini error."
        };
    }
}


/* =========================================
   EXPORT
========================================= */

module.exports = {
    analyzeWithAI
};