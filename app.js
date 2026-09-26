"use strict";

/* =========================================================
   FOODRESCUE — FINAL PLATFORM CORE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       DOM
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    const rescueFoodButton = $("rescueFoodButton");
    const exploreButton = $("exploreButton");
    const joinNetworkButton = $("joinNetworkButton");

    const surplusForm = $("surplusForm");
    const analyzeSurplusButton = $("analyzeSurplusButton");

    const analysisResult = $("analysisResult");
    const resultEmpty = document.querySelector(".result-empty");
    const resultContent = $("resultContent");

    const priorityScore = $("priorityScore");
    const priorityLevel = $("priorityLevel");
    const resultFood = $("resultFood");
    const resultQuantity = $("resultQuantity");
    const resultTime = $("resultTime");
    const resultLocation = $("resultLocation");
    const recommendationText = $("recommendationText");

    const matchingResults = $("matchingResults");
    const rescueOperation = $("rescueOperation");
    const selectedOrganization = $("selectedOrganization");
    const startRescueButton = $("startRescueButton");

    const locateUserButton = $("locateUserButton");

    const commandCurrentEmpty = $("commandCurrentEmpty");
    const commandCurrentDetails = $("commandCurrentDetails");
    const currentOperationStatus = $("currentOperationStatus");

    const commandOrganization = $("commandOrganization");
    const commandLocation = $("commandLocation");
    const commandFood = $("commandFood");
    const commandQuantity = $("commandQuantity");
    const commandMatch = $("commandMatch");
    const commandId = $("commandId");

    const commandStepMatched = $("commandStepMatched");
    const commandStepCollection = $("commandStepCollection");
    const commandStepRescued = $("commandStepRescued");

    const commandRescues = $("commandRescues");
    const commandMeals = $("commandMeals");
    const commandKg = $("commandKg");
    const commandCo2 = $("commandCo2");

    const rescueHistory = $("rescueHistory");

    const heroRescues = $("heroRescues");
    const heroKgSaved = $("heroKgSaved");
    const heroOrganizations = $("heroOrganizations");

    const impactMeals = $("impactMeals");
    const impactKg = $("impactKg");
    const impactCo2 = $("impactCo2");
    const impactActive = $("impactActive");


    /* =====================================================
       BASIC SAFETY
    ===================================================== */

    function escapeHTML(value) {

        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }


    function safeText(element, value) {

        if (element) {
            element.textContent =
                String(value ?? "");
        }

    }


    function formatDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

    }


    function generateOperationId() {

        const timestamp =
            Date.now().toString(36).toUpperCase();

        const random =
            Math.random()
                .toString(36)
                .slice(2, 7)
                .toUpperCase();

        return `FR-${timestamp}-${random}`;

    }


    /* =====================================================
       STATE
    ===================================================== */

    const STORAGE_KEY =
        "foodrescue_platform_final_v3";

    const DEFAULT_STATE = {
        metrics: {
            rescuesStarted: 0,
            mealsRescued: 128,
            kgSaved: 42.8,
            co2Avoided: 18.4,
            activeOperations: 24,
            organizations:
                Array.isArray(
                    window.RESCUE_ORGANIZATIONS
                )
                    ? window.RESCUE_ORGANIZATIONS.length
                    : 0
        },

        currentOperation: null,
        history: []
    };


    function cloneDefaultState() {

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
                return cloneDefaultState();
            }

            const parsed =
                JSON.parse(saved);

            return {
                ...cloneDefaultState(),
                ...parsed,

                metrics: {
                    ...DEFAULT_STATE.metrics,
                    ...(parsed.metrics || {})
                },

                history:
                    Array.isArray(parsed.history)
                        ? parsed.history
                        : []
            };

        }
        catch (error) {

            console.warn(
                "FoodRescue state reset:",
                error
            );

            return cloneDefaultState();

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

            console.warn(
                "FoodRescue state save failed:",
                error
            );

        }

    }


    /* =====================================================
       NAVIGATION
    ===================================================== */

    rescueFoodButton?.addEventListener(
        "click",
        () => {

            $("rescue")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );


    exploreButton?.addEventListener(
        "click",
        () => {

            $("network")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );


    joinNetworkButton?.addEventListener(
        "click",
        () => {

            $("rescue")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }
    );


    /* =====================================================
       ADVANCED INTELLIGENCE PANEL
    ===================================================== */

    function createAdvancedPanels() {

        const commandSection =
            $("command-center");

        if (!commandSection) {
            return;
        }

        if (
            $("advancedIntelligencePanel")
        ) {
            return;
        }

        const panel =
            document.createElement("div");

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
                        Submit a surplus to activate rescue intelligence.
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


    /* =====================================================
       METRICS
    ===================================================== */

    function updateMetrics() {

        if (heroRescues) {
            heroRescues.textContent =
                state.metrics.rescuesStarted;
        }

        if (heroKgSaved) {
            heroKgSaved.textContent =
                Number(
                    state.metrics.kgSaved
                ).toFixed(1);
        }

        if (heroOrganizations) {
            heroOrganizations.textContent =
                state.metrics.organizations;
        }

        if (impactMeals) {
            impactMeals.textContent =
                Math.round(
                    state.metrics.mealsRescued
                );
        }

        if (impactKg) {
            impactKg.textContent =
                `${Number(
                    state.metrics.kgSaved
                ).toFixed(1)} kg`;
        }

        if (impactCo2) {
            impactCo2.textContent =
                `${Number(
                    state.metrics.co2Avoided
                ).toFixed(1)} kg`;
        }

        if (impactActive) {
            impactActive.textContent =
                Math.round(
                    state.metrics.activeOperations
                );
        }

        if (commandRescues) {
            commandRescues.textContent =
                state.metrics.rescuesStarted;
        }

        if (commandMeals) {
            commandMeals.textContent =
                Math.round(
                    state.metrics.mealsRescued
                );
        }

        if (commandKg) {
            commandKg.textContent =
                `${Number(
                    state.metrics.kgSaved
                ).toFixed(1)} kg`;
        }

        if (commandCo2) {
            commandCo2.textContent =
                `${Number(
                    state.metrics.co2Avoided
                ).toFixed(1)} kg`;
        }

    }


    /* =====================================================
       AI LOCAL
    ===================================================== */

    function renderLocalAI(data) {

        createAdvancedPanels();

        const summary =
            $("aiSummary");

        const action =
            $("aiAction");

        const badge =
            $("aiConfidenceBadge");

        const signals =
            $("aiSignals");

        if (!data) {
            return;
        }

        safeText(
            summary,
            data.summary ||
            "Local rescue intelligence completed."
        );

        safeText(
            action,
            data.suggestedAction ||
            "Proceed with the recommended rescue workflow."
        );

        safeText(
            badge,
            `${Number(
                data.confidence || 0
            )}% CONFIDENCE`
        );

        badge?.classList.add("ready");

        if (
            Array.isArray(
                data.riskSignals
            ) &&
            data.riskSignals.length
        ) {

            signals.innerHTML =
                data.riskSignals
                    .map(
                        signal =>
                            `<span class="signal-pill">
                                ${escapeHTML(signal)}
                            </span>`
                    )
                    .join("");

        }
        else {

            signals.innerHTML = `
                <span class="signal-good">
                    No explicit risk signals in the notes.
                </span>
            `;

        }

    }


    /* =====================================================
       AI BACKEND
    ===================================================== */

    function renderAIBackendResult(ai) {

        createAdvancedPanels();

        const summary =
            $("aiSummary");

        const action =
            $("aiAction");

        const badge =
            $("aiConfidenceBadge");

        if (!ai) {
            return;
        }

        /*
           Current backend contract:
           enabled + analysis
        */

        const connected =
            ai.enabled === true;

        const text =
            typeof ai.analysis === "string"
                ? ai.analysis.trim()
                : "";

        if (
            connected &&
            text
        ) {

            safeText(
                summary,
                "Gemini AI analysis completed"
            );

            safeText(
                action,
                text
            );

            safeText(
                badge,
                "AI CONNECTED"
            );

            badge?.classList.add(
                "ready"
            );

            return;
        }

        safeText(
            badge,
            "AI FALLBACK"
        );

        badge?.classList.remove(
            "ready"
        );

    }


    /* =====================================================
       PREDICTION
    ===================================================== */

    function renderPrediction() {

        createAdvancedPanels();

        if (
            typeof predictFutureSurplus !==
            "function"
        ) {
            return;
        }

        const result =
            predictFutureSurplus(
                state.history
            );

        safeText(
            $("predictionValue"),
            result.predictedQuantity > 0
                ? String(
                    result.predictedQuantity
                )
                : "—"
        );

        safeText(
            $("predictionTrend"),
            result.trend ||
            "INSUFFICIENT DATA"
        );

        safeText(
            $("predictionRecommendation"),
            result.recommendation ||
            "Collect more rescue history."
        );

    }


    /* =====================================================
       IMPACT
    ===================================================== */

    function renderOperationImpact(
        quantity,
        unit
    ) {

        createAdvancedPanels();

        const container =
            $("operationImpact");

        if (
            !container ||
            typeof calculateImpact !==
            "function"
        ) {
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
                    ${Number(
                        impact.kgSaved
                    ).toFixed(2)}
                </strong>
                <span>
                    kg saved
                </span>
            </div>

            <div>
                <strong>
                    ${Number(
                        impact.co2Avoided
                    ).toFixed(2)}
                </strong>
                <span>
                    CO₂ avoided
                </span>
            </div>

            <div>
                <strong>
                    ${Math.round(
                        impact.meals
                    )}
                </strong>
                <span>
                    meals
                </span>
            </div>

            <div>
                <strong>
                    ${Math.round(
                        impact.waterSaved
                    )}
                </strong>
                <span>
                    water
                </span>
            </div>
        `;

    }


    /* =====================================================
       MATCHING
    ===================================================== */

    let currentMatches = [];
    let selectedMatch = null;
    let rescueStage = 1;


    function renderMatches(
        foodType,
        quantity,
        matches
    ) {

        let normalizedMatches =
            Array.isArray(matches)
                ? matches
                : [];

        if (
            !normalizedMatches.length &&
            typeof findBestMatches ===
            "function"
        ) {

            normalizedMatches =
                findBestMatches(
                    foodType,
                    quantity,
                    window.RESCUE_ORGANIZATIONS
                );

        }

        currentMatches =
            normalizedMatches;

        selectedMatch =
            currentMatches.length
                ? currentMatches[0]
                : null;

        if (
            !currentMatches.length
        ) {

            if (matchingResults) {

                matchingResults.innerHTML = `
                    <div class="matching-empty">
                        No suitable rescue organizations were found.
                    </div>
                `;

            }

            rescueOperation?.classList.add(
                "hidden"
            );

            return;

        }


        if (matchingResults) {

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
                                window.FOOD_LABELS?.[
                                    foodType
                                ] ||
                                foodType;

                            let reason =
                                "";

                            if (
                                typeof getMatchReason ===
                                "function"
                            ) {

                                reason =
                                    getMatchReason(
                                        foodType,
                                        quantity,
                                        organization
                                    );

                            }

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
                                            ${escapeHTML(
                                                organization.distance
                                            )} km away ·
                                            Capacity
                                            ${escapeHTML(
                                                organization.capacity
                                            )}
                                        </span>

                                        <span class="match-result-reason">
                                            ${escapeHTML(
                                                reason
                                            )}
                                        </span>

                                    </div>

                                    <div class="match-result-score">

                                        <strong>
                                            ${escapeHTML(
                                                organization.matchScore
                                            )}%
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


        if (
            selectedOrganization &&
            selectedMatch
        ) {

            selectedOrganization.textContent =
                selectedMatch.name;

        }

        rescueOperation?.classList.remove(
            "hidden"
        );

    }


    matchingResults?.addEventListener(
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

            safeText(
                selectedOrganization,
                organization.name
            );


            document
                .querySelectorAll(
                    ".match-result-card"
                )
                .forEach(
                    card => {
                        card.style.borderColor =
                            "rgba(255,255,255,0.07)";
                    }
                );

            const selectedCard =
                button.closest(
                    ".match-result-card"
                );

            if (selectedCard) {

                selectedCard.style.borderColor =
                    "rgba(74,222,128,0.45)";

            }


            try {

                if (
                    window.FoodRescueMap &&
                    typeof FoodRescueMap.showRescueOperation ===
                    "function"
                ) {

                    FoodRescueMap.showRescueOperation(
                        organization,
                        $("location")?.value.trim()
                    );

                }

            }
            catch (error) {

                console.warn(
                    "Map route error:",
                    error
                );

            }

        }
    );


    /* =====================================================
       CURRENT OPERATION
    ===================================================== */

    function createCurrentOperation() {

        if (!selectedMatch) {
            return null;
        }

        const foodType =
            $("foodType")?.value || "";

        const quantity =
            Number(
                $("quantity")?.value || 0
            );

        const unit =
            $("unit")?.value || "items";

        const location =
            $("location")?.value.trim() || "";

        const foodLabel =
            window.FOOD_LABELS?.[
                foodType
            ] ||
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
                Number(
                    selectedMatch.matchScore
                ) || 0,

            status:
                "COLLECTION_PENDING",

            createdAt:
                new Date().toISOString(),

            completedAt:
                null

        };

    }


    function renderCurrentOperation() {

        const operation =
            state.currentOperation;

        if (!operation) {

            commandCurrentEmpty?.classList.remove(
                "hidden"
            );

            commandCurrentDetails?.classList.add(
                "hidden"
            );

            safeText(
                currentOperationStatus,
                "IDLE"
            );

            currentOperationStatus?.classList.remove(
                "live",
                "completed"
            );

            return;
        }


        commandCurrentEmpty?.classList.add(
            "hidden"
        );

        commandCurrentDetails?.classList.remove(
            "hidden"
        );


        safeText(
            commandOrganization,
            operation.organizationName
        );

        safeText(
            commandLocation,
            operation.location
        );

        safeText(
            commandFood,
            operation.foodLabel
        );

        safeText(
            commandQuantity,
            `${operation.quantity} ${operation.unit}`
        );

        safeText(
            commandMatch,
            `${operation.matchScore}%`
        );

        safeText(
            commandId,
            operation.id
        );


        commandStepMatched?.classList.add(
            "active"
        );


        if (
            operation.status ===
            "COLLECTION_PENDING"
        ) {

            commandStepCollection?.classList.add(
                "active"
            );

            commandStepRescued?.classList.remove(
                "active"
            );

            safeText(
                currentOperationStatus,
                "LIVE"
            );

            currentOperationStatus?.classList.add(
                "live"
            );

            currentOperationStatus?.classList.remove(
                "completed"
            );

        }
        else if (
            operation.status ===
            "RESCUED"
        ) {

            commandStepCollection?.classList.add(
                "active"
            );

            commandStepRescued?.classList.add(
                "active"
            );

            safeText(
                currentOperationStatus,
                "COMPLETED"
            );

            currentOperationStatus?.classList.add(
                "completed"
            );

            currentOperationStatus?.classList.remove(
                "live"
            );

        }

    }


    /* =====================================================
       HISTORY
    ===================================================== */

    function renderHistory() {

        if (!rescueHistory) {
            return;
        }

        if (
            !Array.isArray(
                state.history
            ) ||
            !state.history.length
        ) {

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
                    operation => `
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
                                        operation.foodLabel ||
                                        operation.foodType
                                    )}
                                    ·
                                    ${escapeHTML(
                                        operation.quantity
                                    )}
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
                                    ${escapeHTML(
                                        operation.matchScore
                                    )}%
                                </strong>

                                <span>
                                    MATCH
                                </span>

                            </div>

                        </div>
                    `
                )
                .join("");

    }


    /* =====================================================
       WEATHER
    ===================================================== */

    async function loadWeather(location, score) {

        if (
            !location ||
            !window.FoodRescueAPI ||
            typeof FoodRescueAPI.getWeather !==
            "function"
        ) {
            return;
        }

        try {

            const response =
                await FoodRescueAPI.getWeather(
                    location
                );

            const weather =
                response?.weather ||
                response;

            if (
                typeof renderWeatherPanel ===
                "function"
            ) {

                const riskScore =
                    Number(
                        weather.operationalRisk
                    ) || 0;

                renderWeatherPanel(
                    {
                        location:
                            weather.location,

                        current: {
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

                        risk: {
                            score:
                                riskScore,

                            level:
                                riskScore >= 70
                                    ? "HIGH"
                                    : riskScore >= 40
                                        ? "MEDIUM"
                                        : "LOW",

                            factors: []
                        }
                    },
                    Number(score) || 0
                );

            }

        }
        catch (error) {

            console.warn(
                "Weather unavailable:",
                error
            );

        }

    }


    /* =====================================================
       ANALYZE SURPLUS
    ===================================================== */

    async function analyzeSurplus() {

        if (
            !surplusForm ||
            !surplusForm.checkValidity()
        ) {

            surplusForm?.reportValidity();

            return;

        }


        const foodType =
            $("foodType")?.value || "";

        const quantity =
            Number(
                $("quantity")?.value || 0
            );

        const unit =
            $("unit")?.value || "items";

        const availableFrom =
            $("availableFrom")?.value || "";

        const expiryTime =
            $("expiryTime")?.value || "";

        const location =
            $("location")?.value.trim() || "";

        const notes =
            $("notes")?.value.trim() || "";


        analyzeSurplusButton.disabled =
            true;

        analyzeSurplusButton.innerHTML =
            `Analyzing intelligence...`;


        try {

            /* =============================================
               BACKEND FIRST
            ============================================= */

            const response =
                await window.FoodRescueAPI.analyzeSurplus(
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
                response?.analysis;


            const matches =
                Array.isArray(
                    response?.matches
                )
                    ? response.matches
                    : [];


            if (!analysis) {
                throw new Error(
                    "Backend returned no analysis."
                );
            }


            /* =============================================
               MAIN RESULT
            ============================================= */

            safeText(
                priorityScore,
                analysis.priorityScore
            );

            safeText(
                priorityLevel,
                analysis.priorityLevel
            );

            safeText(
                resultFood,
                window.FOOD_LABELS?.[
                    analysis.foodType
                ] ||
                analysis.foodType
            );

            safeText(
                resultQuantity,
                `${analysis.quantity} ${analysis.unit}`
            );


            const remainingMinutes =
                Number(
                    analysis.remainingMinutes
                ) || 0;


            if (
                typeof formatRemainingTime ===
                "function"
            ) {

                safeText(
                    resultTime,
                    formatRemainingTime(
                        remainingMinutes
                    )
                );

            }
            else {

                safeText(
                    resultTime,
                    `${remainingMinutes}m`
                );

            }


            safeText(
                resultLocation,
                analysis.location
            );


            safeText(
                recommendationText,
                typeof getRecommendation ===
                "function"
                    ? getRecommendation(
                        Number(
                            analysis.priorityScore
                        ) || 0
                    )
                    : "Proceed with the rescue workflow."
            );


            /* =============================================
               MATCHING
            ============================================= */

            renderMatches(
                foodType,
                quantity,
                matches
            );


            /* =============================================
               LOCAL AI
            ============================================= */

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

                renderLocalAI(
                    localAI
                );

            }


            /* =============================================
               BACKEND AI
            ============================================= */

            if (response.ai) {

                renderAIBackendResult(
                    response.ai
                );

            }


            /* =============================================
               WEATHER
            ============================================= */

            loadWeather(
                location,
                analysis.priorityScore
            );


            /* =============================================
               IMPACT
            ============================================= */

            renderOperationImpact(
                quantity,
                unit
            );


            /* =============================================
               PREDICTION
            ============================================= */

            renderPrediction();


            /* =============================================
               SHOW
            ============================================= */

            resultEmpty?.classList.add(
                "hidden"
            );

            resultContent?.classList.remove(
                "hidden"
            );


            analysisResult?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });


            analysisResult?.setAttribute(
                "tabindex",
                "-1"
            );

        }
        catch (error) {

            console.error(
                "FoodRescue analysis error:",
                error
            );


            /* =============================================
               LOCAL FALLBACK
            ============================================= */

            try {

                const timeAnalysis =
                    typeof analyzeRescueTime ===
                    "function"
                        ? analyzeRescueTime(
                            availableFrom,
                            expiryTime
                        )
                        : {
                            remainingMinutes: 0
                        };


                const score =
                    typeof calculatePriority ===
                    "function"
                        ? calculatePriority(
                            foodType,
                            quantity,
                            availableFrom,
                            expiryTime
                        )
                        : 0;


                safeText(
                    priorityScore,
                    score
                );

                safeText(
                    priorityLevel,
                    typeof getPriorityLabel ===
                    "function"
                        ? getPriorityLabel(
                            score
                        )
                        : "LOCAL ANALYSIS"
                );

                safeText(
                    resultFood,
                    window.FOOD_LABELS?.[
                        foodType
                    ] ||
                    foodType
                );

                safeText(
                    resultQuantity,
                    `${quantity} ${unit}`
                );

                safeText(
                    resultTime,
                    typeof formatRemainingTime ===
                    "function"
                        ? formatRemainingTime(
                            timeAnalysis.remainingMinutes
                        )
                        : "—"
                );

                safeText(
                    resultLocation,
                    location
                );

                safeText(
                    recommendationText,
                    "The cloud API is temporarily unavailable. Local rescue intelligence is active."
                );


                renderMatches(
                    foodType,
                    quantity
                );


                if (
                    typeof analyzeSurplusWithAI ===
                    "function"
                ) {

                    renderLocalAI(
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
                        )
                    );

                }


                renderOperationImpact(
                    quantity,
                    unit
                );

                renderPrediction();


                resultEmpty?.classList.add(
                    "hidden"
                );

                resultContent?.classList.remove(
                    "hidden"
                );

            }
            catch (fallbackError) {

                console.error(
                    "FoodRescue local fallback error:",
                    fallbackError
                );

                safeText(
                    recommendationText,
                    "FoodRescue could not complete the analysis."
                );

            }

        }
        finally {

            analyzeSurplusButton.disabled =
                false;

            analyzeSurplusButton.innerHTML =
                `Analyze Surplus <span>→</span>`;

        }

    }


    /* =====================================================
       ANALYZE EVENTS
    ===================================================== */

    analyzeSurplusButton?.addEventListener(
        "click",
        event => {

            event.preventDefault();

            analyzeSurplus();

        }
    );


    surplusForm?.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            analyzeSurplus();

        }
    );


    /* =====================================================
       RESCUE OPERATION
    ===================================================== */

    startRescueButton?.addEventListener(
        "click",
        async event => {

            event.preventDefault();

            /* =============================================
               STAGE 1 → COLLECTION
            ============================================= */

            if (
                rescueStage === 1 &&
                selectedMatch
            ) {

                const operation =
                    createCurrentOperation();

                if (!operation) {
                    return;
                }

                try {

                    if (
                        window.FoodRescueAPI &&
                        typeof FoodRescueAPI.createRescue ===
                        "function"
                    ) {

                        const response =
                            await FoodRescueAPI.createRescue(
                                {
                                    foodType:
                                        operation.foodType,

                                    quantity:
                                        operation.quantity,

                                    unit:
                                        operation.unit,

                                    location:
                                        operation.location,

                                    organizationId:
                                        operation.organizationId,

                                    organizationName:
                                        operation.organizationName,

                                    matchScore:
                                        operation.matchScore
                                }
                            );


                        if (
                            response?.rescue?.id
                        ) {

                            operation.id =
                                response.rescue.id;

                        }

                    }

                }
                catch (error) {

                    console.warn(
                        "Cloud rescue creation failed; using local state:",
                        error
                    );

                }


                state.currentOperation =
                    operation;

                state.metrics.rescuesStarted +=
                    1;

                state.metrics.activeOperations +=
                    1;


                rescueStage =
                    2;


                saveState();


                safeText(
                    startRescueButton,
                    "Mark as Rescued ✓"
                );


                renderCurrentOperation();
                renderOperationImpact(
                    operation.quantity,
                    operation.unit
                );

                updateMetrics();
                renderHistory();
                renderPrediction();


                if (
                    window.FoodRescueMap &&
                    typeof FoodRescueMap.showRescueOperation ===
                    "function"
                ) {

                    FoodRescueMap.showRescueOperation(
                        selectedMatch,
                        operation.location
                    );

                }


                $("command-center")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                return;

            }


            /* =============================================
               STAGE 2 → RESCUED
            ============================================= */

            if (
                rescueStage === 2 &&
                state.currentOperation
            ) {

                const operation =
                    state.currentOperation;

                safeText(
                    startRescueButton,
                    "Completing rescue..."
                );


                try {

                    if (
                        window.FoodRescueAPI &&
                        typeof FoodRescueAPI.completeRescue ===
                        "function"
                    ) {

                        await FoodRescueAPI.completeRescue(
                            operation.id
                        );

                    }

                }
                catch (error) {

                    console.warn(
                        "Cloud rescue completion failed; completing locally:",
                        error
                    );

                }


                operation.status =
                    "RESCUED";

                operation.completedAt =
                    new Date().toISOString();


                const impact =
                    typeof calculateImpact ===
                    "function"
                        ? calculateImpact(
                            operation.quantity,
                            operation.unit
                        )
                        : {
                            kgSaved: 0,
                            meals: 0,
                            co2Avoided: 0,
                            waterSaved: 0
                        };


                state.metrics.activeOperations =
                    Math.max(
                        0,
                        state.metrics.activeOperations - 1
                    );

                state.metrics.kgSaved +=
                    Number(
                        impact.kgSaved
                    ) || 0;

                state.metrics.co2Avoided +=
                    Number(
                        impact.co2Avoided
                    ) || 0;

                state.metrics.mealsRescued +=
                    Number(
                        impact.meals
                    ) || 0;


                state.history.unshift(
                    {
                        ...operation
                    }
                );


                state.currentOperation =
                    null;


                rescueStage =
                    3;


                saveState();


                safeText(
                    startRescueButton,
                    "Rescue Completed ✓"
                );

                startRescueButton.disabled =
                    true;


                renderOperationImpact(
                    operation.quantity,
                    operation.unit
                );

                renderPrediction();
                renderCurrentOperation();
                renderHistory();
                updateMetrics();


                $("command-center")
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

            }

        }
    );


    /* =====================================================
       MAP
    ===================================================== */

    locateUserButton?.addEventListener(
        "click",
        () => {

            try {

                if (
                    window.FoodRescueMap &&
                    typeof FoodRescueMap.locateUser ===
                    "function"
                ) {

                    FoodRescueMap.locateUser();

                }

            }
            catch (error) {

                console.warn(
                    "Location error:",
                    error
                );

            }

        }
    );


    /* =====================================================
       LANGUAGE SYSTEM
    ===================================================== */

    function initLanguageSystem() {

        const selector =
            document.querySelector(
                ".language-selector"
            );

        const button =
            document.querySelector(
                ".language-button"
            );

        if (!selector || !button) {
            return;
        }


        const translations = {

            en: {
                code: "EN",

                how: "How it works",
                impact: "Impact",
                network: "Network",
                command: "Command Center",

                badge:
                    "Building the world's food rescue intelligence network",

                heroFirst:
                    "Save food",

                heroSecond:
                    "before it becomes waste.",

                description:
                    "FoodRescue connects surplus food with the right people and organizations before valuable food is lost.",

                rescueFood:
                    "Rescue Food",

                explore:
                    "Explore the Network",

                globalImpact:
                    "GLOBAL IMPACT",

                impactTitle:
                    "Every rescued meal counts.",

                howLabel:
                    "THE RESCUE ENGINE",

                howTitle:
                    "From surplus to rescue.",

                networkLabel:
                    "ONE NETWORK",

                rescueLabel:
                    "START A RESCUE",

                rescueTitle:
                    "Tell us about the surplus.",

                analyze:
                    "Analyze Surplus"

            },

            ar: {
                code: "AR",

                how: "كيف تعمل المنصة",
                impact: "الأثر",
                network: "الشبكة",
                command: "مركز القيادة",

                badge:
                    "نبني شبكة عالمية ذكية لإنقاذ الغذاء",

                heroFirst:
                    "أنقذ الطعام",

                heroSecond:
                    "قبل أن يتحول إلى نفايات.",

                description:
                    "تربط FoodRescue فائض الطعام بالأشخاص والمنظمات المناسبة قبل ضياع الطعام.",

                rescueFood:
                    "إنقاذ الطعام",

                explore:
                    "استكشف الشبكة",

                globalImpact:
                    "الأثر العالمي",

                impactTitle:
                    "كل وجبة يتم إنقاذها مهمة.",

                howLabel:
                    "محرك الإنقاذ",

                howTitle:
                    "من الفائض إلى الإنقاذ.",

                networkLabel:
                    "شبكة واحدة",

                rescueLabel:
                    "ابدأ عملية إنقاذ",

                rescueTitle:
                    "أخبرنا عن فائض الطعام.",

                analyze:
                    "تحليل الفائض"

            },

            fr: {
                code: "FR",

                how: "Comment ça marche",
                impact: "Impact",
                network: "Réseau",
                command: "Centre de contrôle",

                badge:
                    "Construire le réseau mondial intelligent de sauvetage alimentaire",

                heroFirst:
                    "Sauvez la nourriture",

                heroSecond:
                    "avant qu'elle ne devienne un déchet.",

                description:
                    "FoodRescue connecte les surplus alimentaires aux bonnes personnes et organisations avant leur perte.",

                rescueFood:
                    "Sauver la nourriture",

                explore:
                    "Explorer le réseau",

                globalImpact:
                    "IMPACT MONDIAL",

                impactTitle:
                    "Chaque repas sauvé compte.",

                howLabel:
                    "MOTEUR DE SAUVETAGE",

                howTitle:
                    "Du surplus au sauvetage.",

                networkLabel:
                    "UN SEUL RÉSEAU",

                rescueLabel:
                    "DÉMARRER UN SAUVETAGE",

                rescueTitle:
                    "Parlez-nous du surplus.",

                analyze:
                    "Analyser le surplus"

            },

            zh: {
                code: "ZH",

                how: "工作原理",
                impact: "影响",
                network: "网络",
                command: "指挥中心",

                badge:
                    "构建全球智能食物救援网络",

                heroFirst:
                    "拯救食物",

                heroSecond:
                    "在它变成废弃物之前。",

                description:
                    "FoodRescue 将剩余食物与合适的人和组织连接起来，减少食物浪费。",

                rescueFood:
                    "拯救食物",

                explore:
                    "探索网络",

                globalImpact:
                    "全球影响",

                impactTitle:
                    "每一份被拯救的食物都很重要。",

                howLabel:
                    "救援引擎",

                howTitle:
                    "从剩余食物到救援。",

                networkLabel:
                    "一个网络",

                rescueLabel:
                    "开始救援",

                rescueTitle:
                    "告诉我们剩余食物的信息。",

                analyze:
                    "分析剩余食物"

            },

            de: {
                code: "DE",

                how: "So funktioniert es",
                impact: "Wirkung",
                network: "Netzwerk",
                command: "Kontrollzentrum",

                badge:
                    "Wir bauen ein intelligentes globales Lebensmittelrettungsnetzwerk",

                heroFirst:
                    "Lebensmittel retten",

                heroSecond:
                    "bevor sie zu Abfall werden.",

                description:
                    "FoodRescue verbindet überschüssige Lebensmittel mit den richtigen Menschen und Organisationen.",

                rescueFood:
                    "Lebensmittel retten",

                explore:
                    "Netzwerk erkunden",

                globalImpact:
                    "GLOBALE WIRKUNG",

                impactTitle:
                    "Jede gerettete Mahlzeit zählt.",

                howLabel:
                    "RETTUNGS-ENGINE",

                howTitle:
                    "Vom Überschuss zur Rettung.",

                networkLabel:
                    "EIN NETZWERK",

                rescueLabel:
                    "RETTUNG STARTEN",

                rescueTitle:
                    "Erzählen Sie uns vom Überschuss.",

                analyze:
                    "Überschuss analysieren"

            }

        };


        const menu =
            document.createElement(
                "div"
            );

        menu.className =
            "foodrescue-language-menu";

        menu.innerHTML = `
            <button type="button" data-lang="en">
                English
            </button>

            <button type="button" data-lang="ar">
                العربية
            </button>

            <button type="button" data-lang="fr">
                Français
            </button>

            <button type="button" data-lang="zh">
                中文
            </button>

            <button type="button" data-lang="de">
                Deutsch
            </button>
        `;


        const style =
            document.createElement(
                "style"
            );

        style.textContent = `

            .language-selector {
                position: relative;
            }

            .foodrescue-language-menu {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                min-width: 175px;
                padding: 7px;
                border-radius: 14px;
                background: rgba(7,16,13,0.98);
                border: 1px solid rgba(255,255,255,0.12);
                box-shadow: 0 18px 45px rgba(0,0,0,0.35);
                backdrop-filter: blur(16px);
                display: none;
                z-index: 999999;
            }

            .foodrescue-language-menu.open {
                display: grid;
                gap: 4px;
            }

            .foodrescue-language-menu button {
                width: 100%;
                border: 0;
                border-radius: 9px;
                padding: 10px 12px;
                background: transparent;
                color: #e8f0eb;
                text-align: left;
                cursor: pointer;
                font: inherit;
            }

            .foodrescue-language-menu button:hover {
                background: rgba(74,222,128,0.12);
                color: #4ade80;
            }

            html[dir="rtl"]
            .foodrescue-language-menu {
                right: auto;
                left: 0;
            }

            html[dir="rtl"]
            .foodrescue-language-menu button {
                text-align: right;
            }

        `;

        document.head.appendChild(
            style
        );

        selector.appendChild(
            menu
        );


        function setSelectorText(
            selectorText,
            value
        ) {

            const element =
                document.querySelector(
                    selectorText
                );

            if (element) {
                element.textContent =
                    value;
            }

        }


        function applyLanguage(
            language
        ) {

            const t =
                translations[language] ||
                translations.en;


            document.documentElement.lang =
                language;

            document.documentElement.dir =
                language === "ar"
                    ? "rtl"
                    : "ltr";


            button.textContent =
                `${t.code} ▾`;


            setSelectorText(
                '.nav-links a[href="#how-it-works"]',
                t.how
            );

            setSelectorText(
                '.nav-links a[href="#impact"]',
                t.impact
            );

            setSelectorText(
                '.nav-links a[href="#network"]',
                t.network
            );

            setSelectorText(
                '.nav-links a[href="#command-center"]',
                t.command
            );


            setSelectorText(
                ".status-badge",
                t.badge
            );


            const hero =
                document.querySelector(
                    ".hero h1"
                );

            if (hero) {

                hero.innerHTML = `
                    ${escapeHTML(
                        t.heroFirst
                    )}
                    <span>
                        ${escapeHTML(
                            t.heroSecond
                        )}
                    </span>
                `;

            }


            setSelectorText(
                ".hero-description",
                t.description
            );

            setSelectorText(
                "#rescueFoodButton",
                t.rescueFood
            );

            setSelectorText(
                "#exploreButton",
                t.explore
            );


            setSelectorText(
                ".impact-section .eyebrow",
                t.globalImpact
            );

            setSelectorText(
                ".impact-section .section-heading h2",
                t.impactTitle
            );


            setSelectorText(
                ".how-section .eyebrow",
                t.howLabel
            );

            setSelectorText(
                ".how-section .section-heading h2",
                t.howTitle
            );


            setSelectorText(
                ".network-section .eyebrow",
                t.networkLabel
            );


            setSelectorText(
                ".submission-section .eyebrow",
                t.rescueLabel
            );

            setSelectorText(
                ".submission-section .section-heading h2",
                t.rescueTitle
            );

            setSelectorText(
                "#analyzeSurplusButton",
                `${t.analyze} →`
            );


            try {

                localStorage.setItem(
                    "foodrescue_language",
                    language
                );

            }
            catch {}


            menu.classList.remove(
                "open"
            );

        }


        button.addEventListener(
            "click",
            event => {

                event.preventDefault();
                event.stopPropagation();

                menu.classList.toggle(
                    "open"
                );

            }
        );


        menu.addEventListener(
            "click",
            event => {

                const target =
                    event.target.closest(
                        "[data-lang]"
                    );

                if (!target) {
                    return;
                }

                applyLanguage(
                    target.dataset.lang
                );

            }
        );


        document.addEventListener(
            "click",
            event => {

                if (
                    !selector.contains(
                        event.target
                    )
                ) {

                    menu.classList.remove(
                        "open"
                    );

                }

            }
        );


        let saved =
            "en";

        try {

            saved =
                localStorage.getItem(
                    "foodrescue_language"
                ) ||
                "en";

        }
        catch {}


        applyLanguage(
            translations[saved]
                ? saved
                : "en"
        );

    }


    /* =====================================================
       INIT
    ===================================================== */

    createAdvancedPanels();

    updateMetrics();

    renderCurrentOperation();

    renderHistory();

    renderPrediction();

    initLanguageSystem();


    /* =====================================================
       MAP INIT
    ===================================================== */

    try {

        if (
            window.FoodRescueMap &&
            typeof FoodRescueMap.init ===
            "function"
        ) {

            FoodRescueMap.init();

        }

    }
    catch (error) {

        console.warn(
            "Map initialization warning:",
            error
        );

    }


    /* =====================================================
       RESTORE ACTIVE OPERATION
    ===================================================== */

    if (
        state.currentOperation
    ) {

        rescueStage =
            state.currentOperation.status ===
            "RESCUED"
                ? 3
                : 2;

        if (
            rescueStage === 2
        ) {

            startRescueButton.disabled =
                false;

            safeText(
                startRescueButton,
                "Mark as Rescued ✓"
            );

        }
        else {

            startRescueButton.disabled =
                true;

        }

    }


    console.log(
        "FoodRescue final platform initialized successfully."
    );

});
