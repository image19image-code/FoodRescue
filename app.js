"use strict";

/* ========================================
   FOODRESCUE — PLATFORM CORE
======================================== */


/* ========================================
   DOM
======================================== */

const rescueFoodButton =
    document.getElementById("rescueFoodButton");

const surplusForm =
    document.getElementById("surplusForm");

const analyzeSurplusButton =
    document.getElementById("analyzeSurplusButton");

const analysisResult =
    document.getElementById("analysisResult");

const resultEmpty =
    document.querySelector(".result-empty");

const resultContent =
    document.getElementById("resultContent");

const priorityScore =
    document.getElementById("priorityScore");

const priorityLevel =
    document.getElementById("priorityLevel");

const resultFood =
    document.getElementById("resultFood");

const resultQuantity =
    document.getElementById("resultQuantity");

const resultTime =
    document.getElementById("resultTime");

const resultLocation =
    document.getElementById("resultLocation");

const recommendationText =
    document.getElementById("recommendationText");

const matchingResults =
    document.getElementById("matchingResults");

const rescueOperation =
    document.getElementById("rescueOperation");

const selectedOrganization =
    document.getElementById("selectedOrganization");

const startRescueButton =
    document.getElementById("startRescueButton");

const exploreButton =
    document.getElementById("exploreButton");

const joinNetworkButton =
    document.getElementById("joinNetworkButton");


/* ========================================
   COMMAND CENTER
======================================== */

const commandCurrentEmpty =
    document.getElementById("commandCurrentEmpty");

const commandCurrentDetails =
    document.getElementById("commandCurrentDetails");

const currentOperationStatus =
    document.getElementById("currentOperationStatus");

const commandOrganization =
    document.getElementById("commandOrganization");

const commandLocation =
    document.getElementById("commandLocation");

const commandFood =
    document.getElementById("commandFood");

const commandQuantity =
    document.getElementById("commandQuantity");

const commandMatch =
    document.getElementById("commandMatch");

const commandId =
    document.getElementById("commandId");

const commandStepMatched =
    document.getElementById("commandStepMatched");

const commandStepCollection =
    document.getElementById("commandStepCollection");

const commandStepRescued =
    document.getElementById("commandStepRescued");

const commandRescues =
    document.getElementById("commandRescues");

const commandMeals =
    document.getElementById("commandMeals");

const commandKg =
    document.getElementById("commandKg");

const commandCo2 =
    document.getElementById("commandCo2");

const rescueHistory =
    document.getElementById("rescueHistory");

const heroRescues =
    document.getElementById("heroRescues");

const heroKgSaved =
    document.getElementById("heroKgSaved");

const heroOrganizations =
    document.getElementById("heroOrganizations");

const impactMeals =
    document.getElementById("impactMeals");

const impactKg =
    document.getElementById("impactKg");

const impactCo2 =
    document.getElementById("impactCo2");

const impactActive =
    document.getElementById("impactActive");


/* ========================================
   STATE
======================================== */

const STORAGE_KEY =
    "foodrescue_platform_v2";


const DEFAULT_STATE = {

    metrics: {

        rescuesStarted: 0,

        mealsRescued: 128,

        kgSaved: 42.8,

        co2Avoided: 18.4,

        activeOperations: 24,

        organizations:
            Array.isArray(RESCUE_ORGANIZATIONS)
                ? RESCUE_ORGANIZATIONS.length
                : 0

    },

    currentOperation: null,

    history: []

};


function createDefaultState() {

    return JSON.parse(
        JSON.stringify(
            DEFAULT_STATE
        )
    );

}


function loadState() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!saved) {

            return createDefaultState();

        }


        const parsed =
            JSON.parse(saved);


        return {

            ...createDefaultState(),

            ...parsed,

            metrics: {

                ...DEFAULT_STATE.metrics,

                ...(parsed.metrics || {})

            },

            history:
                Array.isArray(
                    parsed.history
                )
                    ? parsed.history
                    : []

        };

    }

    catch (error) {

        console.error(
            "FoodRescue state error:",
            error
        );

        return createDefaultState();

    }

}


let state =
    loadState();


function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );

    }

    catch (error) {

        console.error(
            "FoodRescue save error:",
            error
        );

    }

}


/* ========================================
   ADVANCED UI
======================================== */

function createAdvancedPanels() {

    const commandSection =
        document.getElementById(
            "command-center"
        );


    if (!commandSection) {
        return;
    }


    if (
        document.getElementById(
            "advancedIntelligencePanel"
        )
    ) {
        return;
    }


    const panel =
        document.createElement(
            "div"
        );


    panel.id =
        "advancedIntelligencePanel";


    panel.className =
        "advanced-intelligence";


    panel.innerHTML = `

        <div class="advanced-header">

            <div>

                <span class="command-label">
                    RESCUE INTELLIGENCE
                </span>

                <h3>
                    AI decision layer
                </h3>

            </div>

            <span
                id="aiConfidenceBadge"
                class="ai-confidence"
            >
                READY
            </span>

        </div>


        <div class="advanced-grid">

            <div class="advanced-card">

                <span class="advanced-card-label">
                    AI ASSESSMENT
                </span>

                <h4 id="aiSummary">
                    Waiting for surplus analysis
                </h4>

                <p id="aiAction">
                    Submit a surplus to activate AI-assisted rescue intelligence.
                </p>

            </div>


            <div class="advanced-card">

                <span class="advanced-card-label">
                    DETECTED SIGNALS
                </span>

                <div
                    id="aiSignals"
                    class="signal-list"
                >
                    <span class="signal-empty">
                        No signals detected yet.
                    </span>
                </div>

            </div>


            <div class="advanced-card">

                <span class="advanced-card-label">
                    NEXT SURPLUS FORECAST
                </span>

                <div
                    id="predictionValue"
                    class="forecast-value"
                >
                    —
                </div>

                <span
                    id="predictionTrend"
                    class="forecast-trend"
                >
                    Collecting operational data
                </span>

                <p id="predictionRecommendation">
                    More rescue history is required for forecasting.
                </p>

            </div>


            <div class="advanced-card impact-engine-card">

                <span class="advanced-card-label">
                    RESCUE IMPACT
                </span>

                <div
                    id="operationImpact"
                    class="operation-impact-grid"
                >

                    <div>
                        <strong>—</strong>
                        <span>kg saved</span>
                    </div>

                    <div>
                        <strong>—</strong>
                        <span>CO₂ avoided</span>
                    </div>

                    <div>
                        <strong>—</strong>
                        <span>meals</span>
                    </div>

                    <div>
                        <strong>—</strong>
                        <span>water</span>
                    </div>

                </div>

            </div>

        </div>

    `;


    const historyCard =
        commandSection.querySelector(
            ".history-card"
        );


    if (historyCard) {

        historyCard.parentNode.insertBefore(
            panel,
            historyCard
        );

    }

    else {

        commandSection.appendChild(
            panel
        );

    }

}


/* ========================================
   ANALYSIS HELPERS
======================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function generateOperationId() {

    const time =
        Date.now()
            .toString(36)
            .toUpperCase();


    const random =
        Math.random()
            .toString(36)
            .slice(2, 6)
            .toUpperCase();


    return `FR-${time}-${random}`;

}


function formatDate(iso) {

    const date =
        new Date(iso);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }


    return date.toLocaleString(
        "en-US",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* ========================================
   RESCUE FOOD
======================================== */

rescueFoodButton.addEventListener(
    "click",
    () => {

        document
            .getElementById("rescue")
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


/* ========================================
   SMART MATCHING
======================================== */

let currentMatches = [];

let selectedMatch = null;

let rescueStage = 1;


function renderMatches(
    foodType,
    quantity
) {

    currentMatches =
        findBestMatches(
            foodType,
            quantity,
            RESCUE_ORGANIZATIONS
        );


    if (
        !currentMatches ||
        !currentMatches.length
    ) {

        matchingResults.innerHTML = `
            <div class="matching-empty">
                No suitable rescue organizations were found.
            </div>
        `;

        rescueOperation.classList.add(
            "hidden"
        );

        selectedMatch = null;

        return;
    }


    selectedMatch =
        currentMatches[0];


    selectedOrganization.textContent =
        selectedMatch.name;


    rescueOperation.classList.remove(
        "hidden"
    );


    matchingResults.innerHTML =
        currentMatches
            .map(
                (
                    organization,
                    index
                ) => {

                    const letter =
                        String.fromCharCode(
                            65 + index
                        );


                    const foodLabel =
                        FOOD_LABELS[
                            foodType
                        ] || foodType;


                    const reason =
                        getMatchReason(
                            foodType,
                            quantity,
                            organization
                        );


                    return `

                        <div
                            class="match-result-card"
                            data-match-index="${index}"
                        >

                            <div class="match-result-avatar">
                                ${letter}
                            </div>


                            <div class="match-result-info">

                                <strong>
                                    ${escapeHTML(
                                        organization.name
                                    )}
                                </strong>

                                <span>
                                    ${organization.distance}
                                    km away ·
                                    Capacity
                                    ${organization.capacity}
                                </span>

                                <span class="match-result-reason">
                                    ${escapeHTML(
                                        foodLabel
                                    )}
                                    ·
                                    ${escapeHTML(
                                        reason
                                    )}
                                </span>

                            </div>


                            <div class="match-result-score">

                                <strong>
                                    ${organization.matchScore}%
                                </strong>

                                <span>
                                    Match
                                </span>

                                <button
                                    class="match-select-button"
                                    type="button"
                                    data-index="${index}"
                                >
                                    SELECT
                                </button>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


matchingResults.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".match-select-button"
            );


        if (!button) {
            return;
        }


        event.preventDefault();

        event.stopPropagation();


        const index =
            Number(
                button.dataset.index
            );


        const organization =
            currentMatches[index];


        if (!organization) {
            return;
        }


        selectedMatch =
            organization;
            if (
    typeof FoodRescueMap !== "undefined"
) {

    FoodRescueMap.showRescueOperation(
        organization,
        document
            .getElementById("location")
            .value
            .trim()
    );

}


        selectedOrganization.textContent =
            organization.name;


        rescueOperation.classList.remove(
            "hidden"
        );


        const cards =
            matchingResults.querySelectorAll(
                ".match-result-card"
            );


        cards.forEach(
            card => {

                card.style.borderColor =
                    "rgba(255,255,255,0.07)";

            }
        );


        if (cards[index]) {

            cards[index].style.borderColor =
                "rgba(74,222,128,0.45)";

        }


        rescueOperation.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }
);


/* ========================================
   AI INSIGHT
======================================== */

function renderAIInsight(data) {

    createAdvancedPanels();


    const confidenceBadge =
        document.getElementById(
            "aiConfidenceBadge"
        );

    const aiSummary =
        document.getElementById(
            "aiSummary"
        );

    const aiAction =
        document.getElementById(
            "aiAction"
        );

    const aiSignals =
        document.getElementById(
            "aiSignals"
        );


    if (!data) {
        return;
    }


    aiSummary.textContent =
        data.summary;


    aiAction.textContent =
        data.suggestedAction;


    confidenceBadge.textContent =
        `${data.confidence}% CONFIDENCE`;


    confidenceBadge.classList.add(
        "ready"
    );


    if (
        !data.riskSignals ||
        !data.riskSignals.length
    ) {

        aiSignals.innerHTML = `
            <span class="signal-good">
                No explicit risk signals in the notes.
            </span>
        `;

        return;
    }


    aiSignals.innerHTML =
        data.riskSignals
            .map(
                signal =>
                    `
                        <span class="signal-pill">
                            ${escapeHTML(signal)}
                        </span>
                    `
            )
            .join("");

}


/* ========================================
   PREDICTION
======================================== */

function renderPrediction() {

    createAdvancedPanels();


    const value =
        document.getElementById(
            "predictionValue"
        );

    const trend =
        document.getElementById(
            "predictionTrend"
        );

    const recommendation =
        document.getElementById(
            "predictionRecommendation"
        );


    const prediction =
        predictFutureSurplus(
            state.history
        );


    if (
        !prediction ||
        prediction.confidence === 0
    ) {

        value.textContent =
            "—";

        trend.textContent =
            "INSUFFICIENT DATA";

        recommendation.textContent =
            "Complete more rescue operations to activate historical surplus forecasting.";

        return;
    }


    value.textContent =
        `${prediction.predictedQuantity} units`;


    trend.textContent =
        `${prediction.trend} · ${prediction.confidence}% confidence`;


    recommendation.textContent =
        prediction.recommendation;

}


/* ========================================
   OPERATION IMPACT
======================================== */

function renderOperationImpact(
    quantity,
    unit
) {

    createAdvancedPanels();


    const container =
        document.getElementById(
            "operationImpact"
        );


    if (!container) {
        return;
    }


    const impact =
        calculateImpact(
            quantity,
            unit
        );


    container.innerHTML = `

        <div>
            <strong>
                ${impact.kgSaved.toFixed(1)}
            </strong>

            <span>
                kg saved
            </span>
        </div>


        <div>
            <strong>
                ${impact.co2Avoided.toFixed(1)}
            </strong>

            <span>
                CO₂ avoided
            </span>
        </div>


        <div>
            <strong>
                ${impact.meals}
            </strong>

            <span>
                meals
            </span>
        </div>


        <div>
            <strong>
                ${(impact.waterSaved / 1000).toFixed(1)}k L
            </strong>

            <span>
                water
            </span>
        </div>

    `;

}


/* ========================================
   COMMAND CENTER
======================================== */

function updateMetrics() {

    const metrics =
        state.metrics;


    heroRescues.textContent =
        metrics.rescuesStarted;


    heroKgSaved.textContent =
        metrics.kgSaved.toFixed(1);


    heroOrganizations.textContent =
        metrics.organizations;


    impactMeals.textContent =
        Math.round(
            metrics.mealsRescued
        );


    impactKg.textContent =
        `${metrics.kgSaved.toFixed(1)} kg`;


    impactCo2.textContent =
        `${metrics.co2Avoided.toFixed(1)} kg`;


    impactActive.textContent =
        metrics.activeOperations;


    commandRescues.textContent =
        metrics.rescuesStarted;


    commandMeals.textContent =
        Math.round(
            metrics.mealsRescued
        );


    commandKg.textContent =
        `${metrics.kgSaved.toFixed(1)} kg`;


    commandCo2.textContent =
        `${metrics.co2Avoided.toFixed(1)} kg`;

}


function renderCurrentOperation() {

    const operation =
        state.currentOperation;


    if (!operation) {

        commandCurrentEmpty.classList.remove(
            "hidden"
        );


        commandCurrentDetails.classList.add(
            "hidden"
        );


        currentOperationStatus.textContent =
            "IDLE";


        currentOperationStatus.classList.remove(
            "live",
            "completed"
        );


        return;
    }


    commandCurrentEmpty.classList.add(
        "hidden"
    );


    commandCurrentDetails.classList.remove(
        "hidden"
    );


    commandOrganization.textContent =
        operation.organizationName;


    commandLocation.textContent =
        `${operation.location} · ${formatDate(
            operation.createdAt
        )}`;


    commandFood.textContent =
        operation.foodLabel;


    commandQuantity.textContent =
        `${operation.quantity} ${operation.unit}`;


    commandMatch.textContent =
        `${operation.matchScore}%`;


    commandId.textContent =
        operation.id;


    commandStepMatched.classList.add(
        "active"
    );


    if (
        operation.status ===
        "COLLECTION PENDING"
    ) {

        commandStepCollection.classList.add(
            "active"
        );

        commandStepRescued.classList.remove(
            "active"
        );


        currentOperationStatus.textContent =
            "LIVE";


        currentOperationStatus.classList.add(
            "live"
        );

        currentOperationStatus.classList.remove(
            "completed"
        );


        return;
    }


    if (
        operation.status ===
        "RESCUED"
    ) {

        commandStepCollection.classList.add(
            "active"
        );


        commandStepRescued.classList.add(
            "active"
        );


        currentOperationStatus.textContent =
            "COMPLETED";


        currentOperationStatus.classList.add(
            "completed"
        );


        currentOperationStatus.classList.remove(
            "live"
        );

    }

}


function renderHistory() {

    if (!rescueHistory) {
        return;
    }


    if (!state.history.length) {

        rescueHistory.innerHTML = `
            <div class="history-empty">
                Completed rescue operations will appear here.
            </div>
        `;

        return;
    }


    rescueHistory.innerHTML =
        state.history
            .slice(0, 12)
            .map(
                operation => {

                    return `

                        <div class="history-item">

                            <div class="history-icon">
                                ✓
                            </div>


                            <div class="history-main">

                                <strong>
                                    ${escapeHTML(
                                        operation.organizationName
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        operation.foodLabel
                                    )}
                                    ·
                                    ${operation.quantity}
                                    ${escapeHTML(
                                        operation.unit
                                    )}
                                    ·
                                    ${escapeHTML(
                                        operation.location
                                    )}
                                </span>

                                <span>
                                    ${formatDate(
                                        operation.completedAt
                                    )}
                                </span>

                            </div>


                            <div class="history-meta">

                                <strong>
                                    ${operation.matchScore}%
                                </strong>

                                <span>
                                    MATCH
                                </span>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");

}


/* ========================================
   CREATE OPERATION
======================================== */

function createCurrentOperation() {

    if (!selectedMatch) {
        return null;
    }


    const foodType =
        document.getElementById(
            "foodType"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "quantity"
            ).value
        );


    const unit =
        document.getElementById(
            "unit"
        ).value;


    const location =
        document.getElementById(
            "location"
        ).value
            .trim();


    const foodLabel =
        FOOD_LABELS[foodType] ||
        foodType;


    return {

        id:
            generateOperationId(),

        organizationId:
            selectedMatch.id,

        organizationName:
            selectedMatch.name,

        location,

        foodType,

        foodLabel,

        quantity,

        unit,

        matchScore:
            selectedMatch.matchScore,

        status:
            "COLLECTION PENDING",

        createdAt:
            new Date().toISOString(),

        completedAt:
            null

    };

}


/* ========================================
   START / COMPLETE RESCUE
======================================== */

startRescueButton.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();


        /* ====================================
           STAGE 1
        ==================================== */

        if (
            rescueStage === 1 &&
            selectedMatch
        ) {

            state.currentOperation =
                createCurrentOperation();


            state.metrics.rescuesStarted +=
                1;


            state.metrics.activeOperations +=
                1;


            saveState();


            startRescueButton.textContent =
                "Mark as Rescued ✓";


            rescueStage =
                2;


            renderCurrentOperation();

            updateMetrics();


            document
                .getElementById(
                    "command-center"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });


            return;
        }


        /* ====================================
           STAGE 2
        ==================================== */

        if (
            rescueStage === 2 &&
            state.currentOperation
        ) {

            const operation =
                state.currentOperation;


            operation.status =
                "RESCUED";


            operation.completedAt =
                new Date().toISOString();


            const impact =
                calculateImpact(
                    operation.quantity,
                    operation.unit
                );


            state.metrics.activeOperations =
                Math.max(
                    0,
                    state.metrics.activeOperations - 1
                );


            state.metrics.kgSaved +=
                impact.kgSaved;


            state.metrics.co2Avoided +=
                impact.co2Avoided;


            state.metrics.mealsRescued +=
                impact.meals;


            state.history.unshift(
                {
                    ...operation
                }
            );


            state.currentOperation =
                null;


            saveState();


            startRescueButton.textContent =
                "Rescue Completed ✓";


            startRescueButton.disabled =
                true;


            rescueStage =
                3;


            renderOperationImpact(
                operation.quantity,
                operation.unit
            );


            renderPrediction();
            /* ========================================
   ENVIRONMENTAL INTELLIGENCE
======================================== */

FoodRescueWeather
    .getWeather(location)
    .then(
        weather => {

            renderWeatherPanel(
                weather,
                score
            );

        }
    )
    .catch(
        error => {

            console.error(
                "Environmental intelligence error:",
                error
            );

        }
    );

            updateMetrics();

            renderCurrentOperation();

            renderHistory();


            document
                .getElementById(
                    "command-center"
                )
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }

    }
);


/* ========================================
   ANALYZE SURPLUS
======================================== */
/* ========================================
   RENDER BACKEND AI
======================================== */

function renderAIBackendResult(
    ai
) {

    const panel =
        document.getElementById(
            "advancedIntelligencePanel"
        );


    if (!panel) {
        return;
    }


    const summary =
        panel.querySelector(
            "#aiSummary"
        );


    const action =
        panel.querySelector(
            "#aiAction"
        );


    const badge =
        panel.querySelector(
            "#aiConfidenceBadge"
        );


    if (
        summary &&
        ai.raw
    ) {

        summary.textContent =
            "AI analysis completed";

    }


    if (
        action &&
        ai.raw
    ) {

        action.textContent =
            ai.raw;

    }


    if (badge) {

        badge.textContent =
            "AI CONNECTED";

        badge.classList.add(
            "ready"
        );

    }

}
/* ========================================
   ANALYZE SURPLUS — BACKEND INTELLIGENCE
======================================== */

async function analyzeSurplus() {

    if (
        !surplusForm.checkValidity()
    ) {

        surplusForm.reportValidity();

        return;
    }


    const foodType =
        document.getElementById(
            "foodType"
        ).value;


    const quantity =
        Number(
            document.getElementById(
                "quantity"
            ).value
        );


    const unit =
        document.getElementById(
            "unit"
        ).value;


    const availableFrom =
        document.getElementById(
            "availableFrom"
        ).value;


    const expiryTime =
        document.getElementById(
            "expiryTime"
        ).value;


    const location =
        document.getElementById(
            "location"
        ).value.trim();


    const notes =
        document.getElementById(
            "notes"
        ).value.trim();


    analyzeSurplusButton.disabled =
        true;

    analyzeSurplusButton.innerHTML =
        "Analyzing intelligence...";


    try {

        const response =
            await FoodRescueAPI.analyzeSurplus(
                {
                    foodType,
                    quantity,
                    unit,
                    availableFrom,
                    expiryTime,
                    location,
                    notes
                }
            );


        const analysis =
            response.analysis;


        const matches =
            Array.isArray(
                response.matches
            )
                ? response.matches
                : [];


        /* =====================================
           RESULT
        ===================================== */

        priorityScore.textContent =
            analysis.priorityScore;


        priorityLevel.textContent =
            analysis.priorityLevel;


        resultFood.textContent =
            analysis.foodType;


        resultQuantity.textContent =
            `${analysis.quantity} ${analysis.unit}`;


        resultTime.textContent =
            formatRemainingTime(
                analysis.remainingMinutes
            );


        resultLocation.textContent =
            analysis.location;


        recommendationText.textContent =
            getRecommendation(
                analysis.priorityScore
            );


        /* =====================================
           MATCHING
        ===================================== */

        currentMatches =
            matches;


        selectedMatch =
            currentMatches.length
                ? currentMatches[0]
                : null;


        matchingResults.innerHTML =
            currentMatches
                .map(
                    (
                        organization,
                        index
                    ) => {

                        const letter =
                            String.fromCharCode(
                                65 + index
                            );


                        const reason =
                            getMatchReason(
                                foodType,
                                quantity,
                                organization
                            );


                        return `
                            <div
                                class="match-result-card"
                                data-match-index="${index}"
                            >

                                <div class="match-result-avatar">
                                    ${letter}
                                </div>

                                <div class="match-result-info">

                                    <strong>
                                        ${escapeHTML(
                                            organization.name
                                        )}
                                    </strong>

                                    <span>
                                        ${organization.distance}
                                        km away ·
                                        Capacity
                                        ${organization.capacity}
                                    </span>

                                    <span class="match-result-reason">
                                        ${escapeHTML(
                                            reason
                                        )}
                                    </span>

                                </div>

                                <div class="match-result-score">

                                    <strong>
                                        ${organization.matchScore}%
                                    </strong>

                                    <span>
                                        Match
                                    </span>

                                    <button
                                        class="match-select-button"
                                        type="button"
                                        data-index="${index}"
                                    >
                                        SELECT
                                    </button>

                                </div>

                            </div>
                        `;

                    }
                )
                .join("");


        /* =====================================
           BEST MATCH
        ===================================== */

        if (selectedMatch) {

            selectedOrganization.textContent =
                selectedMatch.name;


            rescueOperation.classList.remove(
                "hidden"
            );

        }


        /* =====================================
           AI BACKEND
        ===================================== */

        if (
            response.ai &&
            response.ai.available
        ) {

            renderAIBackendResult(
                response.ai
            );

        }


        /* =====================================
           WEATHER
        ===================================== */

        FoodRescueAPI
            .getWeather(
                location
            )
            .then(
                weatherResponse => {

                    const weather =
                        weatherResponse.weather ||
                        weatherResponse;


                    if (
                        typeof renderWeatherPanel ===
                        "function"
                    ) {

                        renderWeatherPanel(
                            {
                                location:
                                    weather.location,

                                current:
                                    {
                                        temperature:
                                            weather.temperature,

                                        humidity:
                                            weather.humidity,

                                        precipitation:
                                            weather.precipitation,

                                        precipitationProbability:
                                            0,

                                        wind:
                                            weather.wind
                                    },

                                risk:
                                    {
                                        score:
                                            weather.operationalRisk,

                                        level:
                                            weather.operationalRisk >= 70
                                                ? "HIGH"
                                                : weather.operationalRisk >= 40
                                                    ? "MEDIUM"
                                                    : "LOW",

                                        factors:
                                            []
                                    }

                            },
                            analysis.priorityScore
                        );

                    }

                }
            )
            .catch(
                error => {

                    console.warn(
                        "Weather unavailable:",
                        error
                    );

                }
            );


        /* =====================================
           AI LOCAL INSIGHT
        ===================================== */

        if (
            typeof analyzeSurplusWithAI ===
            "function"
        ) {

            const localAI =
                analyzeSurplusWithAI(
                    {
                        foodType,
                        quantity,
                        unit,
                        availableFrom,
                        expiryTime,
                        location,
                        notes
                    }
                );


            renderAIInsight(
                localAI
            );

        }


        /* =====================================
           IMPACT
        ===================================== */

        renderOperationImpact(
            quantity,
            unit
        );


        /* =====================================
           PREDICTION
        ===================================== */

        renderPrediction();


        /* =====================================
           SHOW RESULT
        ===================================== */

        resultEmpty.classList.add(
            "hidden"
        );


        resultContent.classList.remove(
            "hidden"
        );


        history.replaceState(
            null,
            "",
            window.location.pathname +
            window.location.search
        );


        analysisResult.setAttribute(
            "tabindex",
            "-1"
        );


        analysisResult.focus({
            preventScroll: true
        });

    }


    catch (error) {

        console.error(
            "Backend analysis failed:",
            error
        );


        /* =====================================
           LOCAL FALLBACK
        ===================================== */

        const timeAnalysis =
            analyzeRescueTime(
                availableFrom,
                expiryTime
            );


        const score =
            calculatePriority(
                foodType,
                quantity,
                availableFrom,
                expiryTime
            );


        priorityScore.textContent =
            score;


        priorityLevel.textContent =
            getPriorityLabel(
                score
            );


        resultFood.textContent =
            foodType;


        resultQuantity.textContent =
            `${quantity} ${unit}`;


        resultTime.textContent =
            formatRemainingTime(
                timeAnalysis.remainingMinutes
            );


        resultLocation.textContent =
            location;


        recommendationText.textContent =
            "Backend unavailable. Local rescue intelligence is being used as a fallback.";


        renderMatches(
            foodType,
            quantity
        );


        resultEmpty.classList.add(
            "hidden"
        );


        resultContent.classList.remove(
            "hidden"
        );

    }


    finally {

        analyzeSurplusButton.disabled =
            false;


        analyzeSurplusButton.innerHTML =
            "Analyze Surplus <span>→</span>";

    }

}


/* ========================================
   ANALYZE BUTTON
======================================== */

analyzeSurplusButton.addEventListener(
    "click",
    event => {

        event.preventDefault();

        event.stopPropagation();

        analyzeSurplus();

    }
);


/* ========================================
   FORM SUBMIT
======================================== */

surplusForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        event.stopPropagation();

        analyzeSurplus();

    }
);


/* ========================================
   EXPLORE
======================================== */

exploreButton.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "network"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


/* ========================================
   JOIN
======================================== */

joinNetworkButton.addEventListener(
    "click",
    () => {

        document
            .getElementById(
                "rescue"
            )
            .scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }
);


/* ========================================
   INIT
======================================== */

createAdvancedPanels();

updateMetrics();

renderCurrentOperation();

renderHistory();

renderPrediction();
const locateUserButton =
    document.getElementById(
        "locateUserButton"
    );


if (locateUserButton) {

    locateUserButton.addEventListener(
        "click",
        () => {

            FoodRescueMap.locateUser();

        }
    );

}