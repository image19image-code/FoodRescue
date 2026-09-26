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
            Date.now()
                .toString(36)
                .toUpperCase();

        const random =
            Math.random()
                .toString(36)
                .slice(2, 7)
                .toUpperCase();

        return `FR-${timestamp}-${random}`;

    }


    function getCurrentUILanguage() {

        const language =
            document.documentElement.lang;

        return (
            language === "ar" ||
            language === "fr" ||
            language === "zh" ||
            language === "de"
        )
            ? language
            : "en";

    }


    function localizedHistoryMatchLabel() {

        const language =
            getCurrentUILanguage();

        if (language === "ar") {
            return "مطابقة";
        }

        if (language === "fr") {
            return "Correspondance";
        }

        if (language === "zh") {
            return "匹配";
        }

        if (language === "de") {
            return "Zuordnung";
        }

        return "MATCH";

    }


    function localizedMatchMeta(
        distance,
        capacity
    ) {

        const safeDistance =
            escapeHTML(
                distance ?? "—"
            );

        const safeCapacity =
            escapeHTML(
                capacity ?? "—"
            );

        const language =
            getCurrentUILanguage();

        if (language === "ar") {

            return (
                `${safeDistance} كم · السعة ${safeCapacity}`
            );

        }

        if (language === "fr") {

            return (
                `${safeDistance} km · Capacité ${safeCapacity}`
            );

        }

        if (language === "zh") {

            return (
                `${safeDistance} 公里 · 容量 ${safeCapacity}`
            );

        }

        if (language === "de") {

            return (
                `${safeDistance} km entfernt · Kapazität ${safeCapacity}`
            );

        }

        return (
            `${safeDistance} km away · Capacity ${safeCapacity}`
        );

    }


    function localizedAnalysisLoadingText() {

        const language =
            getCurrentUILanguage();

        if (language === "ar") {
            return "جارٍ تحليل البيانات...";
        }

        if (language === "fr") {
            return "Analyse en cours...";
        }

        if (language === "zh") {
            return "正在分析...";
        }

        if (language === "de") {
            return "Analyse läuft...";
        }

        return "Analyzing intelligence...";

    }


    function localizedAnalyzeButtonText() {

        const language =
            getCurrentUILanguage();

        if (language === "ar") {
            return `تحليل الفائض <span>→</span>`;
        }

        if (language === "fr") {
            return `Analyser le surplus <span>→</span>`;
        }

        if (language === "zh") {
            return `分析剩余食物 <span>→</span>`;
        }

        if (language === "de") {
            return `Überschuss analysieren <span>→</span>`;
        }

        return `Analyze Surplus <span>→</span>`;

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

        history: [],

        lastCompletedOperationId: null

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
                    Array.isArray(
                        parsed.history
                    )
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


    let lastAnalysis =
        null;


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

                            <strong>
                                —
                            </strong>

                            <span>
                                kg saved
                            </span>

                        </div>


                        <div>

                            <strong>
                                —
                            </strong>

                            <span>
                                CO₂ avoided
                            </span>

                        </div>


                        <div>

                            <strong>
                                —
                            </strong>

                            <span>
                                meals
                            </span>

                        </div>


                        <div>

                            <strong>
                                —
                            </strong>

                            <span>
                                water
                            </span>

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


        summary?.setAttribute(
            "data-dynamic",
            "true"
        );

        action?.setAttribute(
            "data-dynamic",
            "true"
        );

        badge?.setAttribute(
            "data-dynamic",
            "true"
        );


        badge?.classList.add(
            "ready"
        );


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


            signals?.setAttribute(
                "data-dynamic",
                "true"
            );

        }
        else {

            signals.innerHTML = `

                <span class="signal-empty">
                    No signals detected yet.
                </span>

            `;


            signals?.removeAttribute(
                "data-dynamic"
            );

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
                getCurrentUILanguage() === "ar"
                    ? "اكتمل تحليل Gemini AI"
                    : getCurrentUILanguage() === "fr"
                        ? "Analyse Gemini AI terminée"
                        : getCurrentUILanguage() === "zh"
                            ? "Gemini AI 分析已完成"
                            : getCurrentUILanguage() === "de"
                                ? "Gemini-KI-Analyse abgeschlossen"
                                : "Gemini AI analysis completed"
            );


            safeText(
                action,
                text
            );


            safeText(
                badge,
                "AI CONNECTED"
            );


            summary?.setAttribute(
                "data-dynamic",
                "true"
            );

            action?.setAttribute(
                "data-dynamic",
                "true"
            );

            badge?.setAttribute(
                "data-dynamic",
                "true"
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


        badge?.setAttribute(
            "data-dynamic",
            "true"
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


        $("predictionValue")?.setAttribute(
            "data-dynamic",
            "true"
        );

        $("predictionTrend")?.setAttribute(
            "data-dynamic",
            "true"
        );

        $("predictionRecommendation")?.setAttribute(
            "data-dynamic",
            "true"
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


        container
            .querySelectorAll("strong")
            .forEach(
                element => {

                    element.setAttribute(
                        "data-dynamic",
                        "true"
                    );

                }
            );

    }


    /* =====================================================
       MATCHING
    ===================================================== */

    let currentMatches = [];

    let selectedMatch = null;


    let rescueStage =
        state.currentOperation
            ? (
                state.currentOperation.status ===
                "RESCUED"
                    ? 3
                    : 2
            )
            : 1;


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

            const organizations =
                Array.isArray(
                    window.RESCUE_ORGANIZATIONS
                )
                    ? window.RESCUE_ORGANIZATIONS
                    : [];


            normalizedMatches =
                findBestMatches(
                    foodType,
                    quantity,
                    organizations
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


                            const reason =
                                typeof getMatchReason ===
                                "function"
                                    ? getMatchReason(
                                        foodType,
                                        quantity,
                                        organization
                                    )
                                    : "";


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
                                            ${localizedMatchMeta(
                                                organization.distance,
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
                                            ${localizedHistoryMatchLabel()}
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


        window.FoodRescueLanguage
            ?.refreshDynamic?.();

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


            commandStepMatched?.classList.remove(
                "active"
            );


            commandStepCollection?.classList.remove(
                "active"
            );


            commandStepRescued?.classList.remove(
                "active"
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


            window.FoodRescueLanguage
                ?.refreshDynamic?.();


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
                                    ${localizedHistoryMatchLabel()}
                                </span>

                            </div>

                        </div>

                    `
                )
                .join("");


        window.FoodRescueLanguage
            ?.refreshDynamic?.();

    }


    /* =====================================================
       WEATHER
    ===================================================== */

    async function loadWeather(
        location,
        score
    ) {

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
                                Number(
                                    weather.precipitationProbability
                                ) || 0,

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
       LOCAL FALLBACK ENGINE
    ===================================================== */

    function calculateLocalRemainingMinutes(
        expiryTime
    ) {

        if (!expiryTime) {
            return 0;
        }


        const expiry =
            new Date(
                expiryTime
            );


        if (
            Number.isNaN(
                expiry.getTime()
            )
        ) {

            return 0;

        }


        return Math.max(
            0,
            Math.ceil(
                (
                    expiry.getTime() -
                    Date.now()
                ) / 60000
            )
        );

    }


    function calculateLocalPriority(
        foodType,
        quantity,
        remainingMinutes,
        notes
    ) {

        let score = 0;


        if (
            remainingMinutes <= 30
        ) {

            score += 45;

        }
        else if (
            remainingMinutes <= 60
        ) {

            score += 35;

        }
        else if (
            remainingMinutes <= 120
        ) {

            score += 25;

        }
        else if (
            remainingMinutes <= 240
        ) {

            score += 15;

        }
        else {

            score += 5;

        }


        const foodWeights = {

            prepared: 20,

            dairy: 18,

            bakery: 16,

            fruits: 12,

            vegetables: 12,

            other: 8

        };


        score +=
            foodWeights[
                foodType
            ] || 8;


        const safeQuantity =
            Number(
                quantity
            ) || 0;


        score +=
            Math.min(
                20,
                Math.round(
                    Math.log10(
                        safeQuantity + 1
                    ) * 10
                )
            );


        if (
            /(urgent|soon|expiry|expired|عاجل|تلف|périm|dringend|过期)/i
                .test(
                    notes || ""
                )
        ) {

            score += 10;

        }


        return Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    score
                )
            )
        );

    }


    function getLocalPriorityLevel(
        score
    ) {

        if (
            score >= 80
        ) {

            return "CRITICAL";

        }


        if (
            score >= 50
        ) {

            return "HIGH PRIORITY";

        }


        if (
            score >= 25
        ) {

            return "MEDIUM PRIORITY";

        }


        return "LOW PRIORITY";

    }


    function getLocalRecommendation(
        score
    ) {

        if (
            score >= 80
        ) {

            return (
                "Immediate rescue required. Start matching and collection now."
            );

        }


        if (
            score >= 50
        ) {

            return (
                "High-priority rescue. Start matching with nearby organizations immediately."
            );

        }


        if (
            score >= 25
        ) {

            return (
                "Moderate rescue priority. Begin matching with suitable organizations."
            );

        }


        return (
            "Low rescue priority. Monitor the surplus and match when appropriate."
        );

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


        if (!state.currentOperation) {

            rescueStage = 1;

            selectedMatch = null;

            currentMatches = [];

            if (startRescueButton) {

                startRescueButton.disabled =
                    false;

            }

        }


        analyzeSurplusButton.disabled =
            true;


        analyzeSurplusButton.innerHTML =
            localizedAnalysisLoadingText();


        try {

            /* =============================================
               BACKEND FIRST
            ============================================= */

            const api =
                window.FoodRescueAPI;


            if (
                !api ||
                typeof api.analyzeSurplus !==
                "function"
            ) {

                throw new Error(
                    "FoodRescue API is unavailable."
                );

            }


            const response =
                await api.analyzeSurplus(
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


            lastAnalysis =
                analysis;


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
                    remainingMinutes > 0
                        ? (
                            remainingMinutes >= 60
                                ? `${Math.floor(
                                    remainingMinutes / 60
                                )}h ${remainingMinutes % 60}m`
                                : `${remainingMinutes}m`
                        )
                        : "Expired / unavailable"
                );

            }


            safeText(
                resultLocation,
                analysis.location
            );


            recommendationText?.removeAttribute(
                "data-dynamic"
            );


            if (
                typeof getRecommendation ===
                "function"
            ) {

                safeText(
                    recommendationText,
                    getRecommendation(
                        Number(
                            analysis.priorityScore
                        ) || 0
                    )
                );

            }
            else {

                safeText(
                    recommendationText,
                    "Proceed with the rescue workflow."
                );

            }


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


            window.FoodRescueLanguage
                ?.refreshDynamic?.();

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

                const remainingMinutes =
                    calculateLocalRemainingMinutes(
                        expiryTime
                    );


                const score =
                    calculateLocalPriority(
                        foodType,
                        quantity,
                        remainingMinutes,
                        notes
                    );


                lastAnalysis = {

                    priorityScore:
                        score,

                    priorityLevel:
                        getLocalPriorityLevel(
                            score
                        ),

                    foodType,

                    quantity,

                    unit,

                    remainingMinutes,

                    location

                };


                safeText(
                    priorityScore,
                    score
                );


                safeText(
                    priorityLevel,
                    getLocalPriorityLevel(
                        score
                    )
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
                    remainingMinutes > 0
                        ? (
                            remainingMinutes >= 60
                                ? `${Math.floor(
                                    remainingMinutes / 60
                                )}h ${remainingMinutes % 60}m`
                                : `${remainingMinutes}m`
                        )
                        : "Expired / unavailable"
                );


                safeText(
                    resultLocation,
                    location
                );


                safeText(
                    recommendationText,
                    getLocalRecommendation(
                        score
                    )
                );


                /* =========================================
                   LOCAL MATCHING
                ========================================= */

                renderMatches(
                    foodType,
                    quantity
                );


                /* =========================================
                   LOCAL AI
                ========================================= */

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


                /* =========================================
                   IMPACT
                ========================================= */

                renderOperationImpact(
                    quantity,
                    unit
                );


                /* =========================================
                   PREDICTION
                ========================================= */

                renderPrediction();


                /* =========================================
                   SHOW
                ========================================= */

                resultEmpty?.classList.add(
                    "hidden"
                );


                resultContent?.classList.remove(
                    "hidden"
                );


                window.FoodRescueLanguage
                    ?.refreshDynamic?.();

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
                localizedAnalyzeButtonText();

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


                startRescueButton.disabled =
                    true;


                safeText(
                    startRescueButton,
                    getCurrentUILanguage() === "ar"
                        ? "جارٍ بدء الإنقاذ..."
                        : getCurrentUILanguage() === "fr"
                            ? "Démarrage du sauvetage..."
                            : getCurrentUILanguage() === "zh"
                                ? "正在开始救援..."
                                : getCurrentUILanguage() === "de"
                                    ? "Rettung wird gestartet..."
                                    : "Starting rescue..."
                );


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


                window.FoodRescueLanguage
                    ?.refreshDynamic?.();


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
                    getCurrentUILanguage() === "ar"
                        ? "جارٍ إكمال الإنقاذ..."
                        : getCurrentUILanguage() === "fr"
                            ? "Sauvetage en cours..."
                            : getCurrentUILanguage() === "zh"
                                ? "正在完成救援..."
                                : getCurrentUILanguage() === "de"
                                    ? "Rettung wird abgeschlossen..."
                                    : "Completing rescue..."
                );


                startRescueButton.disabled =
                    true;


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


                state.lastCompletedOperationId =
                    operation.id;


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


                window.FoodRescueLanguage
                    ?.refreshDynamic?.();


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


        if (
            !selector ||
            !button
        ) {

            console.warn(
                "FoodRescue language selector not found."
            );


            return;

        }


        const translations = {

            /* =================================================
               ENGLISH
            ================================================= */

            en: {

                code: "EN",

                how: "How it works",

                impact: "Impact",

                network: "Network",

                command: "Command Center",


                heroBadge:
                    "Building the world's food rescue intelligence network",


                heroFirst:
                    "Save food",


                heroSecond:
                    "before it becomes waste.",


                heroDescription:
                    "FoodRescue connects surplus food with the right people and organizations before valuable food is lost.",


                rescueFood:
                    "Rescue Food",


                explore:
                    "Explore the Network",


                rescuesStarted:
                    "rescues started",


                kgSaved:
                    "kg saved",


                organizations:
                    "organizations",


                foodIntelligence:
                    "FOOD RESCUE INTELLIGENCE",


                liveMonitor:
                    "Live Rescue Monitor",


                live:
                    "LIVE",


                surplusDetected:
                    "SURPLUS DETECTED",


                bakeryItems:
                    "40 bakery items",


                spoilage:
                    "Estimated spoilage window: 1h 42m",


                priority:
                    "PRIORITY",


                smartMatching:
                    "Smart Matching",


                localFoodAssociation:
                    "Local Food Association",


                associationMeta:
                    "2.1 km away · Needs bread",


                communityKitchen:
                    "Community Kitchen",


                kitchenMeta:
                    "3.8 km away · Capacity 60",


                rescueWindow:
                    "Rescue window",


                globalImpact:
                    "GLOBAL IMPACT",


                impactTitle:
                    "Every rescued meal counts.",


                impactDescription:
                    "FoodRescue transforms individual rescue actions into measurable environmental and social impact.",


                mealsRescued:
                    "Meals rescued",


                foodWastePrevented:
                    "Food waste prevented",


                co2Avoided:
                    "Estimated CO₂ avoided",


                activeOperations:
                    "Active rescue operations",


                rescueEngine:
                    "THE RESCUE ENGINE",


                howTitle:
                    "From surplus to rescue.",


                howDescription:
                    "Three intelligent steps turn potential waste into measurable impact.",


                detect:
                    "Detect",


                detectDescription:
                    "Businesses report surplus food or allow FoodRescue to predict recurring surplus.",


                match:
                    "Match",


                matchDescription:
                    "The rescue engine evaluates urgency, distance, capacity and food requirements.",


                rescue:
                    "Rescue",


                rescueDescription:
                    "The selected recipient coordinates collection and the platform records the impact.",


                oneNetwork:
                    "ONE NETWORK",


                networkTitle:
                    "Businesses. Organizations. Communities.",


                networkDescription:
                    "A connected infrastructure where every participant can contribute to reducing food waste.",


                joinNetwork:
                    "Join the Network",


                startRescue:
                    "START A RESCUE",


                surplusTitle:
                    "Tell us about the surplus.",


                surplusDescription:
                    "Provide a few details and FoodRescue will determine how urgently the food should be rescued.",


                foodType:
                    "Food type",


                selectFood:
                    "Select food type",


                bakery:
                    "Bakery",


                prepared:
                    "Prepared meals",


                fruits:
                    "Fruits",


                vegetables:
                    "Vegetables",


                dairy:
                    "Dairy",


                other:
                    "Other",


                quantity:
                    "Quantity",


                unit:
                    "Unit",


                items:
                    "Items",


                kilograms:
                    "Kilograms",


                meals:
                    "Meals",


                boxes:
                    "Boxes",


                availableFrom:
                    "Available from",


                expiry:
                    "Estimated expiry",


                location:
                    "Location",


                locationPlaceholder:
                    "City or neighborhood",


                additional:
                    "Additional information",


                notesPlaceholder:
                    "Describe the food, packaging, storage conditions...",


                analyze:
                    "Analyze Surplus",


                intelligence:
                    "Rescue Intelligence",


                submitPrompt:
                    "Submit surplus information to generate an initial rescue priority assessment.",


                rescuePriority:
                    "RESCUE PRIORITY",


                waiting:
                    "WAITING",


                food:
                    "Food",


                timeRemaining:
                    "Time remaining",


                recommendedAction:
                    "RECOMMENDED ACTION",


                intelligentMatching:
                    "INTELLIGENT MATCHING",


                bestMatches:
                    "Best rescue matches",


                noMatches:
                    "No suitable rescue organizations were found.",


                matchScore:
                    "Match",


                select:
                    "SELECT",


                rescueOperation:
                    "RESCUE OPERATION",


                matched:
                    "MATCHED",


                collection:
                    "COLLECTION",


                rescued:
                    "RESCUED",


                startRescueButton:
                    "Start Rescue",


                markRescued:
                    "Mark as Rescued",


                completed:
                    "Rescue Completed ✓",


                aiConnected:
                    "AI CONNECTED",


                aiFallback:
                    "AI FALLBACK",


                liveNetwork:
                    "LIVE RESCUE NETWORK",


                mapTitle:
                    "See the rescue network in motion.",


                mapDescription:
                    "Monitor participating organizations, surplus locations and active rescue routes.",


                networkOnline:
                    "NETWORK ONLINE",


                locateMe:
                    "Locate me",


                commandLabel:
                    "RESCUE COMMAND CENTER",


                commandTitle:
                    "Every rescue. Tracked to completion.",


                commandDescription:
                    "FoodRescue turns each rescue decision into a traceable operational workflow.",


                liveOperation:
                    "LIVE OPERATION",


                currentRescue:
                    "Current rescue",


                idle:
                    "IDLE",


                noActive:
                    "No active rescue operation. Analyze a surplus to create one.",


                liveImpact:
                    "LIVE IMPACT",


                performance:
                    "Rescue performance",


                rescueHistory:
                    "RESCUE HISTORY",


                recentOperations:
                    "Recent operations",


                historyEmpty:
                    "Completed rescue operations will appear here.",


                aiLabel:
                    "RESCUE INTELLIGENCE",


                aiTitle:
                    "AI decision layer",


                ready:
                    "READY",


                aiAssessment:
                    "AI ASSESSMENT",


                waitingAnalysis:
                    "Waiting for surplus analysis",


                aiAction:
                    "Submit a surplus to activate AI-assisted rescue intelligence.",


                signals:
                    "DETECTED SIGNALS",


                noSignals:
                    "No signals detected yet.",


                forecast:
                    "NEXT SURPLUS FORECAST",


                collecting:
                    "Collecting operational data",


                forecastDescription:
                    "More rescue history is required for forecasting.",


                rescueImpact:
                    "RESCUE IMPACT",


                saved:
                    "kg saved",


                water:
                    "water",


                footer:
                    "Building technology for a world with less food waste."

            },


            /* =================================================
               ARABIC
            ================================================= */

            ar: {

                code: "AR",

                how: "كيف تعمل المنصة",

                impact: "الأثر",

                network: "الشبكة",

                command: "مركز القيادة",


                heroBadge:
                    "نبني شبكة عالمية ذكية لإنقاذ الغذاء",


                heroFirst:
                    "أنقذ الطعام",


                heroSecond:
                    "قبل أن يتحول إلى نفايات.",


                heroDescription:
                    "تربط FoodRescue فائض الطعام بالأشخاص والمنظمات المناسبة قبل ضياع الطعام.",


                rescueFood:
                    "إنقاذ الطعام",


                explore:
                    "استكشف الشبكة",


                rescuesStarted:
                    "عمليات إنقاذ بدأت",


                kgSaved:
                    "كغ تم إنقاذها",


                organizations:
                    "منظمة",


                foodIntelligence:
                    "ذكاء إنقاذ الغذاء",


                liveMonitor:
                    "مراقبة الإنقاذ المباشر",


                live:
                    "مباشر",


                surplusDetected:
                    "تم اكتشاف فائض",


                bakeryItems:
                    "40 قطعة مخبوزات",


                spoilage:
                    "نافذة التلف المتوقعة: ساعة و42 دقيقة",


                priority:
                    "الأولوية",


                smartMatching:
                    "المطابقة الذكية",


                localFoodAssociation:
                    "جمعية الغذاء المحلية",


                associationMeta:
                    "2.1 كم · تحتاج إلى الخبز",


                communityKitchen:
                    "المطبخ المجتمعي",


                kitchenMeta:
                    "3.8 كم · السعة 60",


                rescueWindow:
                    "نافذة الإنقاذ",


                globalImpact:
                    "الأثر العالمي",


                impactTitle:
                    "كل وجبة يتم إنقاذها مهمة.",


                impactDescription:
                    "تحول FoodRescue عمليات الإنقاذ الفردية إلى أثر بيئي واجتماعي قابل للقياس.",


                mealsRescued:
                    "وجبات تم إنقاذها",


                foodWastePrevented:
                    "نفايات غذائية تم منعها",


                co2Avoided:
                    "ثاني أكسيد الكربون المتجنب تقديريًا",


                activeOperations:
                    "عمليات إنقاذ نشطة",


                rescueEngine:
                    "محرك الإنقاذ",


                howTitle:
                    "من الفائض إلى الإنقاذ.",


                howDescription:
                    "تحول ثلاث خطوات ذكية فائض الطعام المحتمل إلى أثر قابل للقياس.",


                detect:
                    "اكتشاف",


                detectDescription:
                    "تبلغ الشركات عن فائض الطعام أو تسمح لـFoodRescue بالتنبؤ بالفائض المتكرر.",


                match:
                    "مطابقة",


                matchDescription:
                    "يقيم محرك الإنقاذ درجة الاستعجال والمسافة والسعة واحتياجات الغذاء.",


                rescue:
                    "إنقاذ",


                rescueDescription:
                    "ينسق المستلم المختار عملية الجمع وتسجل المنصة الأثر الناتج.",


                oneNetwork:
                    "شبكة واحدة",


                networkTitle:
                    "الشركات. المنظمات. المجتمعات.",


                networkDescription:
                    "بنية مترابطة يمكن لكل مشارك فيها المساهمة في تقليل هدر الطعام.",


                joinNetwork:
                    "انضم إلى الشبكة",


                startRescue:
                    "ابدأ عملية إنقاذ",


                surplusTitle:
                    "أخبرنا عن فائض الطعام.",


                surplusDescription:
                    "أدخل بعض التفاصيل وسيحدد FoodRescue مدى إلحاح إنقاذ الطعام.",


                foodType:
                    "نوع الطعام",


                selectFood:
                    "اختر نوع الطعام",


                bakery:
                    "مخبوزات",


                prepared:
                    "وجبات جاهزة",


                fruits:
                    "فواكه",


                vegetables:
                    "خضروات",


                dairy:
                    "منتجات الألبان",


                other:
                    "أخرى",


                quantity:
                    "الكمية",


                unit:
                    "الوحدة",


                items:
                    "قطع",


                kilograms:
                    "كيلوغرام",


                meals:
                    "وجبات",


                boxes:
                    "صناديق",


                availableFrom:
                    "متاح من",


                expiry:
                    "انتهاء الصلاحية المتوقع",


                location:
                    "الموقع",


                locationPlaceholder:
                    "المدينة أو الحي",


                additional:
                    "معلومات إضافية",


                notesPlaceholder:
                    "صف الطعام والتغليف وظروف التخزين...",


                analyze:
                    "تحليل الفائض",


                intelligence:
                    "ذكاء الإنقاذ",


                submitPrompt:
                    "أرسل معلومات الفائض لإنشاء تقييم أولي لأولوية الإنقاذ.",


                rescuePriority:
                    "أولوية الإنقاذ",


                waiting:
                    "في الانتظار",


                food:
                    "الطعام",


                timeRemaining:
                    "الوقت المتبقي",


                recommendedAction:
                    "الإجراء الموصى به",


                intelligentMatching:
                    "المطابقة الذكية",


                bestMatches:
                    "أفضل جهات الإنقاذ المطابقة",


                noMatches:
                    "لم يتم العثور على منظمات إنقاذ مناسبة.",


                matchScore:
                    "مطابقة",


                select:
                    "اختيار",


                rescueOperation:
                    "عملية الإنقاذ",


                matched:
                    "تمت المطابقة",


                collection:
                    "الجمع",


                rescued:
                    "تم الإنقاذ",


                startRescueButton:
                    "ابدأ الإنقاذ",


                markRescued:
                    "تأكيد إنقاذ الطعام",


                completed:
                    "اكتملت عملية الإنقاذ ✓",


                aiConnected:
                    "الذكاء الاصطناعي متصل",


                aiFallback:
                    "الوضع الاحتياطي للذكاء الاصطناعي",


                liveNetwork:
                    "شبكة الإنقاذ المباشرة",


                mapTitle:
                    "شاهد شبكة الإنقاذ وهي تعمل.",


                mapDescription:
                    "راقب المنظمات المشاركة ومواقع الفائض ومسارات الإنقاذ النشطة.",


                networkOnline:
                    "الشبكة متصلة",


                locateMe:
                    "حدد موقعي",


                commandLabel:
                    "مركز قيادة الإنقاذ",


                commandTitle:
                    "كل عملية إنقاذ يتم تتبعها حتى الاكتمال.",


                commandDescription:
                    "تحول FoodRescue كل قرار إنقاذ إلى سير عمل تشغيلي قابل للتتبع.",


                liveOperation:
                    "عملية مباشرة",


                currentRescue:
                    "عملية الإنقاذ الحالية",


                idle:
                    "خامل",


                noActive:
                    "لا توجد عملية إنقاذ نشطة. حلل فائضًا لإنشاء عملية.",


                liveImpact:
                    "الأثر المباشر",


                performance:
                    "أداء الإنقاذ",


                rescueHistory:
                    "سجل الإنقاذ",


                recentOperations:
                    "العمليات الأخيرة",


                historyEmpty:
                    "ستظهر عمليات الإنقاذ المكتملة هنا.",


                aiLabel:
                    "ذكاء الإنقاذ",


                aiTitle:
                    "طبقة قرار الذكاء الاصطناعي",


                ready:
                    "جاهز",


                aiAssessment:
                    "تقييم الذكاء الاصطناعي",


                waitingAnalysis:
                    "في انتظار تحليل الفائض",


                aiAction:
                    "أرسل فائضًا لتفعيل ذكاء الإنقاذ المدعوم بالذكاء الاصطناعي.",


                signals:
                    "الإشارات المكتشفة",


                noSignals:
                    "لم يتم اكتشاف إشارات بعد.",


                forecast:
                    "توقع الفائض القادم",


                collecting:
                    "يتم جمع البيانات التشغيلية",


                forecastDescription:
                    "نحتاج إلى المزيد من سجل الإنقاذ لتفعيل التنبؤ.",


                rescueImpact:
                    "أثر الإنقاذ",


                saved:
                    "كغ تم إنقاذها",


                water:
                    "ماء",


                footer:
                    "نبني تقنية لعالم أقل هدرًا للطعام."

            },


            /* =================================================
               FRENCH
            ================================================= */

            fr: {

                code: "FR",

                how: "Comment ça marche",

                impact: "Impact",

                network: "Réseau",

                command: "Centre de contrôle",


                heroBadge:
                    "Construire le réseau mondial intelligent de sauvetage alimentaire",


                heroFirst:
                    "Sauvez la nourriture",


                heroSecond:
                    "avant qu'elle ne devienne un déchet.",


                heroDescription:
                    "FoodRescue connecte les surplus alimentaires aux bonnes personnes et organisations avant leur perte.",


                rescueFood:
                    "Sauver la nourriture",


                explore:
                    "Explorer le réseau",


                rescuesStarted:
                    "sauvetages lancés",


                kgSaved:
                    "kg sauvés",


                organizations:
                    "organisations",


                foodIntelligence:
                    "INTELLIGENCE DU SAUVETAGE ALIMENTAIRE",


                liveMonitor:
                    "Surveillance du sauvetage",


                live:
                    "EN DIRECT",


                surplusDetected:
                    "SURPLUS DÉTECTÉ",


                bakeryItems:
                    "40 produits de boulangerie",


                spoilage:
                    "Fenêtre estimée avant détérioration : 1 h 42",


                priority:
                    "PRIORITÉ",


                smartMatching:
                    "Correspondance intelligente",


                localFoodAssociation:
                    "Association alimentaire locale",


                associationMeta:
                    "2,1 km · Besoin de pain",


                communityKitchen:
                    "Cuisine communautaire",


                kitchenMeta:
                    "3,8 km · Capacité 60",


                rescueWindow:
                    "Fenêtre de sauvetage",


                globalImpact:
                    "IMPACT MONDIAL",


                impactTitle:
                    "Chaque repas sauvé compte.",


                impactDescription:
                    "FoodRescue transforme les actions individuelles de sauvetage en impact environnemental et social mesurable.",


                mealsRescued:
                    "Repas sauvés",


                foodWastePrevented:
                    "Gaspillage alimentaire évité",


                co2Avoided:
                    "CO₂ évité estimé",


                activeOperations:
                    "Opérations de sauvetage actives",


                rescueEngine:
                    "MOTEUR DE SAUVETAGE",


                howTitle:
                    "Du surplus au sauvetage.",


                howDescription:
                    "Trois étapes intelligentes transforment le gaspillage potentiel en impact mesurable.",


                detect:
                    "Détecter",


                detectDescription:
                    "Les entreprises signalent les surplus ou permettent à FoodRescue de prévoir les surplus récurrents.",


                match:
                    "Associer",


                matchDescription:
                    "Le moteur évalue l'urgence, la distance, la capacité et les besoins alimentaires.",


                rescue:
                    "Sauver",


                rescueDescription:
                    "Le destinataire sélectionné coordonne la collecte et la plateforme enregistre l'impact.",


                oneNetwork:
                    "UN SEUL RÉSEAU",


                networkTitle:
                    "Entreprises. Organisations. Communautés.",


                networkDescription:
                    "Une infrastructure connectée où chaque participant contribue à réduire le gaspillage alimentaire.",


                joinNetwork:
                    "Rejoindre le réseau",


                startRescue:
                    "DÉMARRER UN SAUVETAGE",


                surplusTitle:
                    "Parlez-nous du surplus.",


                surplusDescription:
                    "Fournissez quelques détails et FoodRescue déterminera l'urgence du sauvetage.",


                foodType:
                    "Type de nourriture",


                selectFood:
                    "Sélectionner le type",


                bakery:
                    "Boulangerie",


                prepared:
                    "Repas préparés",


                fruits:
                    "Fruits",


                vegetables:
                    "Légumes",


                dairy:
                    "Produits laitiers",


                other:
                    "Autre",


                quantity:
                    "Quantité",


                unit:
                    "Unité",


                items:
                    "Articles",


                kilograms:
                    "Kilogrammes",


                meals:
                    "Repas",


                boxes:
                    "Boîtes",


                availableFrom:
                    "Disponible à partir de",


                expiry:
                    "Expiration estimée",


                location:
                    "Lieu",


                locationPlaceholder:
                    "Ville ou quartier",


                additional:
                    "Informations complémentaires",


                notesPlaceholder:
                    "Décrivez la nourriture, l'emballage et les conditions de stockage...",


                analyze:
                    "Analyser le surplus",


                intelligence:
                    "Intelligence du sauvetage",


                submitPrompt:
                    "Soumettez les informations du surplus pour générer une première évaluation de priorité.",


                rescuePriority:
                    "PRIORITÉ DE SAUVETAGE",


                waiting:
                    "EN ATTENTE",


                food:
                    "Nourriture",


                timeRemaining:
                    "Temps restant",


                recommendedAction:
                    "ACTION RECOMMANDÉE",


                intelligentMatching:
                    "CORRESPONDANCE INTELLIGENTE",


                bestMatches:
                    "Meilleures correspondances",


                noMatches:
                    "Aucune organisation de sauvetage appropriée trouvée.",


                matchScore:
                    "Correspondance",


                select:
                    "SÉLECTIONNER",


                rescueOperation:
                    "OPÉRATION DE SAUVETAGE",


                matched:
                    "ASSOCIÉ",


                collection:
                    "COLLECTE",


                rescued:
                    "SAUVÉ",


                startRescueButton:
                    "Démarrer le sauvetage",


                markRescued:
                    "Marquer comme sauvé",


                completed:
                    "Sauvetage terminé ✓",


                aiConnected:
                    "IA CONNECTÉE",


                aiFallback:
                    "IA DE SECOURS",


                liveNetwork:
                    "RÉSEAU DE SAUVETAGE EN DIRECT",


                mapTitle:
                    "Voir le réseau de sauvetage en action.",


                mapDescription:
                    "Surveillez les organisations participantes, les surplus et les itinéraires actifs.",


                networkOnline:
                    "RÉSEAU EN LIGNE",


                locateMe:
                    "Me localiser",


                commandLabel:
                    "CENTRE DE CONTRÔLE DU SAUVETAGE",


                commandTitle:
                    "Chaque sauvetage est suivi jusqu'à son achèvement.",


                commandDescription:
                    "FoodRescue transforme chaque décision de sauvetage en flux opérationnel traçable.",


                liveOperation:
                    "OPÉRATION EN DIRECT",


                currentRescue:
                    "Sauvetage actuel",


                idle:
                    "INACTIF",


                noActive:
                    "Aucune opération active. Analysez un surplus pour en créer une.",


                liveImpact:
                    "IMPACT EN DIRECT",


                performance:
                    "Performance du sauvetage",


                rescueHistory:
                    "HISTORIQUE DES SAUVETAGES",


                recentOperations:
                    "Opérations récentes",


                historyEmpty:
                    "Les opérations terminées apparaîtront ici.",


                aiLabel:
                    "INTELLIGENCE DU SAUVETAGE",


                aiTitle:
                    "Couche de décision IA",


                ready:
                    "PRÊT",


                aiAssessment:
                    "ÉVALUATION IA",


                waitingAnalysis:
                    "En attente de l'analyse du surplus",


                aiAction:
                    "Soumettez un surplus pour activer l'intelligence de sauvetage assistée par IA.",


                signals:
                    "SIGNAUX DÉTECTÉS",


                noSignals:
                    "Aucun signal détecté pour le moment.",


                forecast:
                    "PRÉVISION DU PROCHAIN SURPLUS",


                collecting:
                    "Collecte des données opérationnelles",


                forecastDescription:
                    "Davantage d'historique est nécessaire pour les prévisions.",


                rescueImpact:
                    "IMPACT DU SAUVETAGE",


                saved:
                    "kg sauvés",


                water:
                    "eau",


                footer:
                    "Construire une technologie pour un monde avec moins de gaspillage alimentaire."

            },


            /* =================================================
               CHINESE
            ================================================= */

            zh: {

                code: "ZH",

                how: "工作原理",

                impact: "影响",

                network: "网络",

                command: "指挥中心",


                heroBadge:
                    "构建全球智能食物救援网络",


                heroFirst:
                    "拯救食物",


                heroSecond:
                    "在它变成废弃物之前。",


                heroDescription:
                    "FoodRescue 将剩余食物与合适的人和组织连接起来，避免有价值的食物被浪费。",


                rescueFood:
                    "拯救食物",


                explore:
                    "探索网络",


                rescuesStarted:
                    "已启动救援",


                kgSaved:
                    "公斤已拯救",


                organizations:
                    "个组织",


                foodIntelligence:
                    "食品救援智能系统",


                liveMonitor:
                    "实时救援监控",


                live:
                    "实时",


                surplusDetected:
                    "检测到剩余食物",


                bakeryItems:
                    "40 份烘焙食品",


                spoilage:
                    "预计变质窗口：1小时42分钟",


                priority:
                    "优先级",


                smartMatching:
                    "智能匹配",


                localFoodAssociation:
                    "当地食品协会",


                associationMeta:
                    "2.1 公里 · 需要面包",


                communityKitchen:
                    "社区厨房",


                kitchenMeta:
                    "3.8 公里 · 容量 60",


                rescueWindow:
                    "救援窗口",


                globalImpact:
                    "全球影响",


                impactTitle:
                    "每一份被拯救的食物都很重要。",


                impactDescription:
                    "FoodRescue 将每一次食品救援转化为可衡量的环境和社会影响。",


                mealsRescued:
                    "已拯救餐食",


                foodWastePrevented:
                    "避免的食品浪费",


                co2Avoided:
                    "预计减少的 CO₂",


                activeOperations:
                    "正在进行的救援",


                rescueEngine:
                    "救援引擎",


                howTitle:
                    "从剩余食物到救援。",


                howDescription:
                    "三个智能步骤将潜在浪费转化为可衡量的影响。",


                detect:
                    "检测",


                detectDescription:
                    "企业可以报告剩余食物，或允许 FoodRescue 预测周期性剩余。",


                match:
                    "匹配",


                matchDescription:
                    "救援引擎评估紧急程度、距离、容量和食品需求。",


                rescue:
                    "救援",


                rescueDescription:
                    "选定的接收方协调收集，平台记录最终影响。",


                oneNetwork:
                    "一个网络",


                networkTitle:
                    "企业。组织。社区。",


                networkDescription:
                    "一个互联基础设施，让每位参与者都能帮助减少食品浪费。",


                joinNetwork:
                    "加入网络",


                startRescue:
                    "开始救援",


                surplusTitle:
                    "告诉我们剩余食物的信息。",


                surplusDescription:
                    "提供一些信息，FoodRescue 将判断救援的紧迫程度。",


                foodType:
                    "食品类型",


                selectFood:
                    "选择食品类型",


                bakery:
                    "烘焙食品",


                prepared:
                    "准备好的餐食",


                fruits:
                    "水果",


                vegetables:
                    "蔬菜",


                dairy:
                    "乳制品",


                other:
                    "其他",


                quantity:
                    "数量",


                unit:
                    "单位",


                items:
                    "件",


                kilograms:
                    "公斤",


                meals:
                    "餐",


                boxes:
                    "箱",


                availableFrom:
                    "可用时间",


                expiry:
                    "预计过期",


                location:
                    "位置",


                locationPlaceholder:
                    "城市或社区",


                additional:
                    "附加信息",


                notesPlaceholder:
                    "描述食品、包装和储存条件...",


                analyze:
                    "分析剩余食物",


                intelligence:
                    "救援智能",


                submitPrompt:
                    "提交剩余食物信息，以生成初步救援优先级评估。",


                rescuePriority:
                    "救援优先级",


                waiting:
                    "等待中",


                food:
                    "食品",


                timeRemaining:
                    "剩余时间",


                recommendedAction:
                    "建议操作",


                intelligentMatching:
                    "智能匹配",


                bestMatches:
                    "最佳救援匹配",


                noMatches:
                    "未找到合适的救援组织。",


                matchScore:
                    "匹配",


                select:
                    "选择",


                rescueOperation:
                    "救援行动",


                matched:
                    "已匹配",


                collection:
                    "收集",


                rescued:
                    "已救援",


                startRescueButton:
                    "开始救援",


                markRescued:
                    "标记为已救援",


                completed:
                    "救援已完成 ✓",


                aiConnected:
                    "AI 已连接",


                aiFallback:
                    "AI 备用模式",


                liveNetwork:
                    "实时救援网络",


                mapTitle:
                    "查看救援网络的实时运行。",


                mapDescription:
                    "监控参与组织、剩余食物位置和正在进行的救援路线。",


                networkOnline:
                    "网络在线",


                locateMe:
                    "定位我",


                commandLabel:
                    "救援指挥中心",


                commandTitle:
                    "每一次救援都跟踪到完成。",


                commandDescription:
                    "FoodRescue 将每个救援决策转化为可追踪的运营流程。",


                liveOperation:
                    "实时行动",


                currentRescue:
                    "当前救援",


                idle:
                    "空闲",


                noActive:
                    "没有正在进行的救援。分析剩余食物以创建行动。",


                liveImpact:
                    "实时影响",


                performance:
                    "救援表现",


                rescueHistory:
                    "救援历史",


                recentOperations:
                    "最近行动",


                historyEmpty:
                    "已完成的救援行动将显示在这里。",


                aiLabel:
                    "救援智能",


                aiTitle:
                    "AI 决策层",


                ready:
                    "就绪",


                aiAssessment:
                    "AI 评估",


                waitingAnalysis:
                    "等待剩余食物分析",


                aiAction:
                    "提交剩余食物以激活 AI 救援智能。",


                signals:
                    "检测到的信号",


                noSignals:
                    "尚未检测到信号。",


                forecast:
                    "下一次剩余食物预测",


                collecting:
                    "正在收集运营数据",


                forecastDescription:
                    "需要更多救援历史数据才能进行预测。",


                rescueImpact:
                    "救援影响",


                saved:
                    "公斤已拯救",


                water:
                    "水",


                footer:
                    "用技术打造一个更少食物浪费的世界。"

            },


            /* =================================================
               GERMAN
            ================================================= */

            de: {

                code: "DE",

                how: "So funktioniert es",

                impact: "Wirkung",

                network: "Netzwerk",

                command: "Kontrollzentrum",


                heroBadge:
                    "Wir bauen ein intelligentes globales Lebensmittelrettungsnetzwerk",


                heroFirst:
                    "Lebensmittel retten",


                heroSecond:
                    "bevor sie zu Abfall werden.",


                heroDescription:
                    "FoodRescue verbindet überschüssige Lebensmittel mit den richtigen Menschen und Organisationen.",


                rescueFood:
                    "Lebensmittel retten",


                explore:
                    "Netzwerk erkunden",


                rescuesStarted:
                    "Rettungen gestartet",


                kgSaved:
                    "kg gerettet",


                organizations:
                    "Organisationen",


                foodIntelligence:
                    "LEBENSMITTELRETTUNGS-INTELLIGENZ",


                liveMonitor:
                    "Live-Rettungsmonitor",


                live:
                    "LIVE",


                surplusDetected:
                    "ÜBERSCHUSS ERKANNT",


                bakeryItems:
                    "40 Backwaren",


                spoilage:
                    "Geschätztes Verderbfenster: 1 Std. 42 Min.",


                priority:
                    "PRIORITÄT",


                smartMatching:
                    "Intelligente Zuordnung",


                localFoodAssociation:
                    "Lokale Lebensmittelvereinigung",


                associationMeta:
                    "2,1 km entfernt · Benötigt Brot",


                communityKitchen:
                    "Gemeinschaftsküche",


                kitchenMeta:
                    "3,8 km · Kapazität 60",


                rescueWindow:
                    "Rettungsfenster",


                globalImpact:
                    "GLOBALE WIRKUNG",


                impactTitle:
                    "Jede gerettete Mahlzeit zählt.",


                impactDescription:
                    "FoodRescue verwandelt einzelne Rettungsaktionen in messbare ökologische und soziale Wirkung.",


                mealsRescued:
                    "Gerettete Mahlzeiten",


                foodWastePrevented:
                    "Vermeidete Lebensmittelverschwendung",


                co2Avoided:
                    "Geschätztes vermiedenes CO₂",


                activeOperations:
                    "Aktive Rettungsaktionen",


                rescueEngine:
                    "RETTUNGS-ENGINE",


                howTitle:
                    "Vom Überschuss zur Rettung.",


                howDescription:
                    "Drei intelligente Schritte verwandeln potenzielle Verschwendung in messbare Wirkung.",


                detect:
                    "Erkennen",


                detectDescription:
                    "Unternehmen melden überschüssige Lebensmittel oder lassen FoodRescue wiederkehrende Überschüsse vorhersagen.",


                match:
                    "Zuordnen",


                matchDescription:
                    "Die Rettungs-Engine bewertet Dringlichkeit, Entfernung, Kapazität und Lebensmittelbedarf.",


                rescue:
                    "Retten",


                rescueDescription:
                    "Der ausgewählte Empfänger koordiniert die Abholung und die Plattform erfasst die Wirkung.",


                oneNetwork:
                    "EIN NETZWERK",


                networkTitle:
                    "Unternehmen. Organisationen. Gemeinschaften.",


                networkDescription:
                    "Eine vernetzte Infrastruktur, in der alle Beteiligten zur Verringerung von Lebensmittelverschwendung beitragen können.",


                joinNetwork:
                    "Dem Netzwerk beitreten",


                startRescue:
                    "RETTUNG STARTEN",


                surplusTitle:
                    "Erzählen Sie uns vom Überschuss.",


                surplusDescription:
                    "Geben Sie einige Informationen an und FoodRescue bestimmt, wie dringend die Lebensmittel gerettet werden sollten.",


                foodType:
                    "Lebensmittelart",


                selectFood:
                    "Lebensmittelart auswählen",


                bakery:
                    "Backwaren",


                prepared:
                    "Zubereitete Mahlzeiten",


                fruits:
                    "Obst",


                vegetables:
                    "Gemüse",


                dairy:
                    "Milchprodukte",


                other:
                    "Andere",


                quantity:
                    "Menge",


                unit:
                    "Einheit",


                items:
                    "Artikel",


                kilograms:
                    "Kilogramm",


                meals:
                    "Mahlzeiten",


                boxes:
                    "Boxen",


                availableFrom:
                    "Verfügbar ab",


                expiry:
                    "Voraussichtlicher Ablauf",


                location:
                    "Ort",


                locationPlaceholder:
                    "Stadt oder Stadtteil",


                additional:
                    "Zusätzliche Informationen",


                notesPlaceholder:
                    "Beschreiben Sie die Lebensmittel, Verpackung und Lagerbedingungen...",


                analyze:
                    "Überschuss analysieren",


                intelligence:
                    "Rettungsintelligenz",


                submitPrompt:
                    "Übermitteln Sie die Informationen zum Überschuss, um eine erste Rettungspriorität zu erstellen.",


                rescuePriority:
                    "RETTUNGSPRIORITÄT",


                waiting:
                    "WARTEN",


                food:
                    "Lebensmittel",


                timeRemaining:
                    "Verbleibende Zeit",


                recommendedAction:
                    "EMPFOHLENE AKTION",


                intelligentMatching:
                    "INTELLIGENTE ZUORDNUNG",


                bestMatches:
                    "Beste Rettungszuordnungen",


                noMatches:
                    "Keine geeigneten Rettungsorganisationen gefunden.",


                matchScore:
                    "Zuordnung",


                select:
                    "AUSWÄHLEN",


                rescueOperation:
                    "RETTUNGSAKTION",


                matched:
                    "ZUGEORDNET",


                collection:
                    "ABHOLUNG",


                rescued:
                    "GERETTET",


                startRescueButton:
                    "Rettung starten",


                markRescued:
                    "Als gerettet markieren",


                completed:
                    "Rettung abgeschlossen ✓",


                aiConnected:
                    "KI VERBUNDEN",


                aiFallback:
                    "KI-ERSATZMODUS",


                liveNetwork:
                    "LIVE-RETTUNGSNETZWERK",


                mapTitle:
                    "Das Rettungsnetzwerk in Bewegung sehen.",


                mapDescription:
                    "Teilnehmende Organisationen, Überschussstandorte und aktive Rettungsrouten überwachen.",


                networkOnline:
                    "NETZWERK ONLINE",


                locateMe:
                    "Meinen Standort finden",


                commandLabel:
                    "RETTUNGS-KONTROLLZENTRUM",


                commandTitle:
                    "Jede Rettung wird bis zum Abschluss verfolgt.",


                commandDescription:
                    "FoodRescue verwandelt jede Rettungsentscheidung in einen nachvollziehbaren Betriebsablauf.",


                liveOperation:
                    "LIVE-AKTION",


                currentRescue:
                    "Aktuelle Rettung",


                idle:
                    "INAKTIV",


                noActive:
                    "Keine aktive Rettungsaktion. Analysieren Sie einen Überschuss, um eine zu erstellen.",


                liveImpact:
                    "LIVE-WIRKUNG",


                performance:
                    "Rettungsleistung",


                rescueHistory:
                    "RETTUNGSHISTORIE",


                recentOperations:
                    "Letzte Aktionen",


                historyEmpty:
                    "Abgeschlossene Rettungsaktionen werden hier angezeigt.",


                aiLabel:
                    "RETTUNGSINTELLIGENZ",


                aiTitle:
                    "KI-Entscheidungsebene",


                ready:
                    "BEREIT",


                aiAssessment:
                    "KI-BEWERTUNG",


                waitingAnalysis:
                    "Warten auf Überschussanalyse",


                aiAction:
                    "Übermitteln Sie einen Überschuss, um KI-gestützte Rettungsintelligenz zu aktivieren.",


                signals:
                    "ERKANNTE SIGNALE",


                noSignals:
                    "Noch keine Signale erkannt.",


                forecast:
                    "NÄCHSTE ÜBERSCHUSSPROGNOSE",


                collecting:
                    "Betriebsdaten werden gesammelt",


                forecastDescription:
                    "Für die Prognose werden weitere Rettungshistorien benötigt.",


                rescueImpact:
                    "RETTUNGSWIRKUNG",


                saved:
                    "kg gerettet",


                water:
                    "Wasser",


                footer:
                    "Technologie für eine Welt mit weniger Lebensmittelverschwendung."

            }

        };


        let currentLanguage =
            "en";


        try {

            const saved =
                localStorage.getItem(
                    "foodrescue_language"
                );


            if (
                saved &&
                translations[saved]
            ) {

                currentLanguage =
                    saved;

            }

        }
        catch {}


        const menu =
            document.createElement("div");


        menu.className =
            "foodrescue-language-menu";


        menu.innerHTML = `

            <button
                type="button"
                data-lang="en"
            >
                English
            </button>


            <button
                type="button"
                data-lang="ar"
            >
                العربية
            </button>


            <button
                type="button"
                data-lang="fr"
            >
                Français
            </button>


            <button
                type="button"
                data-lang="zh"
            >
                中文
            </button>


            <button
                type="button"
                data-lang="de"
            >
                Deutsch
            </button>

        `;


        const style =
            document.createElement("style");


        style.textContent = `

            .language-selector {
                position: relative;
            }


            .foodrescue-language-menu {
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                min-width: 180px;
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
                padding: 10px 12px;
                border: 0;
                border-radius: 9px;
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


        function setDirectText(
            element,
            value
        ) {

            if (!element) {
                return;
            }


            const textNodes =
                Array.from(
                    element.childNodes
                )
                    .filter(
                        node =>
                            node.nodeType ===
                            Node.TEXT_NODE
                    );


            textNodes.forEach(
                node => node.remove()
            );


            const text =
                document.createTextNode(
                    ` ${value} `
                );


            if (
                element.firstElementChild
            ) {

                element.firstElementChild.after(
                    text
                );

            }
            else {

                element.appendChild(
                    text
                );

            }

        }


        function setText(
            selectorText,
            value
        ) {

            const element =
                document.querySelector(
                    selectorText
                );


            if (element) {

                setDirectText(
                    element,
                    value
                );

            }

        }


        function setAll(
            selectorText,
            value
        ) {

            document
                .querySelectorAll(
                    selectorText
                )
                .forEach(
                    element =>
                        setDirectText(
                            element,
                            value
                        )
                );

        }


        function setButton(
            selectorText,
            value
        ) {

            setText(
                selectorText,
                value
            );

        }


        function translateDynamicText(
            root,
            t
        ) {

            if (!root) {
                return;
            }


            /* =================================================
               MATCHING
            ================================================= */

            root
                .querySelectorAll(
                    ".match-result-card"
                )
                .forEach(
                    (
                        card,
                        index
                    ) => {

                        const organization =
                            currentMatches[index];


                        if (!organization) {
                            return;
                        }


                        const meta =
                            card.querySelector(
                                ".match-result-info > span"
                            );


                        if (meta) {

                            meta.innerHTML =
                                localizedMatchMeta(
                                    organization.distance,
                                    organization.capacity
                                );

                        }

                    }
                );


            setAll(
                ".match-result-score span",
                t.matchScore
            );


            setAll(
                ".match-select-button",
                t.select
            );


            /* =================================================
               OPERATION
            ================================================= */

            setAll(
                ".operation-status .status-step:nth-of-type(1) strong",
                t.matched
            );


            setAll(
                ".operation-status .status-step:nth-of-type(2) strong",
                t.collection
            );


            setAll(
                ".operation-status .status-step:nth-of-type(3) strong",
                t.rescued
            );


            /* =================================================
               HISTORY
            ================================================= */

            setAll(
                "#rescueHistory .history-meta span",
                t.matchScore
            );


            /* =================================================
               AI
            ================================================= */

            setText(
                "#advancedIntelligencePanel .command-label",
                t.aiLabel
            );


            setText(
                "#advancedIntelligencePanel .advanced-header h3",
                t.aiTitle
            );


            const aiBadge =
                document.querySelector(
                    "#advancedIntelligencePanel .ai-confidence"
                );


            if (
                aiBadge &&
                !aiBadge.dataset.dynamic
            ) {

                setDirectText(
                    aiBadge,
                    t.ready
                );

            }


            setText(
                "#advancedIntelligencePanel .advanced-card:nth-child(1) .advanced-card-label",
                t.aiAssessment
            );


            const aiSummary =
                document.querySelector(
                    "#advancedIntelligencePanel #aiSummary"
                );


            if (
                aiSummary &&
                !aiSummary.dataset.dynamic
            ) {

                setDirectText(
                    aiSummary,
                    t.waitingAnalysis
                );

            }


            const aiAction =
                document.querySelector(
                    "#advancedIntelligencePanel #aiAction"
                );


            if (
                aiAction &&
                !aiAction.dataset.dynamic
            ) {

                setDirectText(
                    aiAction,
                    t.aiAction
                );

            }


            setText(
                "#advancedIntelligencePanel .advanced-card:nth-child(2) .advanced-card-label",
                t.signals
            );


            const aiSignals =
                document.querySelector(
                    "#advancedIntelligencePanel #aiSignals"
                );


            if (
                aiSignals &&
                !aiSignals.dataset.dynamic
            ) {

                const emptySignal =
                    aiSignals.querySelector(
                        ".signal-empty"
                    );


                if (emptySignal) {

                    setDirectText(
                        emptySignal,
                        t.noSignals
                    );

                }

            }


            setText(
                "#advancedIntelligencePanel .advanced-card:nth-child(3) .advanced-card-label",
                t.forecast
            );


            const predictionTrend =
                document.querySelector(
                    "#advancedIntelligencePanel #predictionTrend"
                );


            if (
                predictionTrend &&
                !predictionTrend.dataset.dynamic
            ) {

                setDirectText(
                    predictionTrend,
                    t.collecting
                );

            }


            const predictionRecommendation =
                document.querySelector(
                    "#advancedIntelligencePanel #predictionRecommendation"
                );


            if (
                predictionRecommendation &&
                !predictionRecommendation.dataset.dynamic
            ) {

                setDirectText(
                    predictionRecommendation,
                    t.forecastDescription
                );

            }


            setText(
                "#advancedIntelligencePanel .impact-engine-card .advanced-card-label",
                t.rescueImpact
            );


            setAll(
                "#operationImpact div:nth-child(1) span",
                t.saved
            );


            setAll(
                "#operationImpact div:nth-child(2) span",
                getCurrentUILanguage() === "ar"
                    ? "ثاني أكسيد الكربون المتجنب"
                    : getCurrentUILanguage() === "fr"
                        ? "CO₂ évité"
                        : getCurrentUILanguage() === "zh"
                            ? "减少的 CO₂"
                            : getCurrentUILanguage() === "de"
                                ? "vermiedenes CO₂"
                                : "CO₂ avoided"
            );


            setAll(
                "#operationImpact div:nth-child(3) span",
                t.mealsRescued
            );


            setAll(
                "#operationImpact div:nth-child(4) span",
                t.water
            );


            /* =================================================
               OPERATION STATUS
            ================================================= */

            if (
                currentOperationStatus
            ) {

                if (
                    state.currentOperation?.status ===
                    "COLLECTION_PENDING"
                ) {

                    setDirectText(
                        currentOperationStatus,
                        t.live
                    );

                }
                else if (
                    state.currentOperation?.status ===
                    "RESCUED"
                ) {

                    setDirectText(
                        currentOperationStatus,
                        t.completed
                    );

                }
                else {

                    setDirectText(
                        currentOperationStatus,
                        t.idle
                    );

                }

            }


            /* =================================================
               DYNAMIC BUTTON
            ================================================= */

            if (
                startRescueButton
            ) {

                if (
                    state.currentOperation
                ) {

                    if (
                        state.currentOperation.status ===
                        "RESCUED"
                    ) {

                        setButton(
                            "#startRescueButton",
                            t.completed
                        );

                        startRescueButton.disabled =
                            true;

                    }
                    else {

                        setButton(
                            "#startRescueButton",
                            t.markRescued
                        );

                        startRescueButton.disabled =
                            false;

                    }

                }
                else if (
                    rescueStage === 3
                ) {

                    setButton(
                        "#startRescueButton",
                        t.completed
                    );

                    startRescueButton.disabled =
                        true;

                }
                else {

                    setButton(
                        "#startRescueButton",
                        t.startRescueButton
                    );

                }

            }

        }


        function translatePage(
            language
        ) {

            const t =
                translations[language] ||
                translations.en;


            currentLanguage =
                translations[language]
                    ? language
                    : "en";


            document.documentElement.lang =
                currentLanguage;


            document.documentElement.dir =
                currentLanguage === "ar"
                    ? "rtl"
                    : "ltr";


            button.textContent =
                `${t.code} ▾`;


            /* =================================================
               NAVIGATION
            ================================================= */

            setText(
                '.nav-links a[href="#how-it-works"]',
                t.how
            );


            setText(
                '.nav-links a[href="#impact"]',
                t.impact
            );


            setText(
                '.nav-links a[href="#network"]',
                t.network
            );


            setText(
                '.nav-links a[href="#command-center"]',
                t.command
            );


            /* =================================================
               HERO
            ================================================= */

            const badge =
                document.querySelector(
                    ".status-badge"
                );


            if (badge) {

                badge.innerHTML = `

                    <span class="status-dot"></span>

                    ${escapeHTML(
                        t.heroBadge
                    )}

                `;

            }


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


            setText(
                ".hero-description",
                t.heroDescription
            );


            setButton(
                "#rescueFoodButton",
                t.rescueFood
            );


            setButton(
                "#exploreButton",
                t.explore
            );


            const heroTrust =
                document.querySelectorAll(
                    ".hero-trust > div span"
                );


            if (
                heroTrust.length >= 3
            ) {

                heroTrust[0].textContent =
                    t.rescuesStarted;


                heroTrust[1].textContent =
                    t.kgSaved;


                heroTrust[2].textContent =
                    t.organizations;

            }


            /* =================================================
               HERO INTELLIGENCE CARD
            ================================================= */

            setText(
                ".intelligence-card .mini-label",
                t.foodIntelligence
            );


            setText(
                ".intelligence-card .card-header h3",
                t.liveMonitor
            );


            setText(
                ".intelligence-card .live-indicator",
                t.live
            );


            setText(
                ".rescue-alert .alert-label",
                t.surplusDetected
            );


            setText(
                ".rescue-alert .alert-content strong",
                t.bakeryItems
            );


            setText(
                ".rescue-alert .alert-content > span:last-child",
                t.spoilage
            );


            setText(
                ".priority > span",
                t.priority
            );


            setText(
                ".matching-section .section-title",
                t.smartMatching
            );


            setText(
                ".intelligence-card .match:nth-of-type(1) .match-info strong",
                t.localFoodAssociation
            );


            setText(
                ".intelligence-card .match:nth-of-type(1) .match-info span",
                t.associationMeta
            );


            setText(
                ".intelligence-card .match:nth-of-type(2) .match-info strong",
                t.communityKitchen
            );


            setText(
                ".intelligence-card .match:nth-of-type(2) .match-info span",
                t.kitchenMeta
            );


            setText(
                ".rescue-progress .progress-header span",
                t.rescueWindow
            );


            /* =================================================
               IMPACT
            ================================================= */

            setText(
                ".impact-section .eyebrow",
                t.globalImpact
            );


            setText(
                ".impact-section .section-heading h2",
                t.impactTitle
            );


            setText(
                ".impact-section .section-heading p",
                t.impactDescription
            );


            const impactLabels =
                document.querySelectorAll(
                    ".impact-card > span:not(.impact-icon)"
                );


            if (
                impactLabels.length >= 4
            ) {

                impactLabels[0].textContent =
                    t.mealsRescued;


                impactLabels[1].textContent =
                    t.foodWastePrevented;


                impactLabels[2].textContent =
                    t.co2Avoided;


                impactLabels[3].textContent =
                    t.activeOperations;

            }


            /* =================================================
               HOW IT WORKS
            ================================================= */

            setText(
                ".how-section .eyebrow",
                t.rescueEngine
            );


            setText(
                ".how-section .section-heading h2",
                t.howTitle
            );


            setText(
                ".how-section .section-heading p",
                t.howDescription
            );


            setText(
                ".step-card:nth-child(1) h3",
                t.detect
            );


            setText(
                ".step-card:nth-child(1) p",
                t.detectDescription
            );


            setText(
                ".step-card:nth-child(2) h3",
                t.match
            );


            setText(
                ".step-card:nth-child(2) p",
                t.matchDescription
            );


            setText(
                ".step-card:nth-child(3) h3",
                t.rescue
            );


            setText(
                ".step-card:nth-child(3) p",
                t.rescueDescription
            );


            /* =================================================
               NETWORK
            ================================================= */

            setText(
                ".network-section .eyebrow",
                t.oneNetwork
            );


            setText(
                ".network-section h2",
                t.networkTitle
            );


            setText(
                ".network-section p",
                t.networkDescription
            );


            setButton(
                "#joinNetworkButton",
                t.joinNetwork
            );


            /* =================================================
               RESCUE FORM
            ================================================= */

            setText(
                ".submission-section .eyebrow",
                t.startRescue
            );


            setText(
                ".submission-section .section-heading h2",
                t.surplusTitle
            );


            setText(
                ".submission-section .section-heading p",
                t.surplusDescription
            );


            setText(
                'label[for="foodType"]',
                t.foodType
            );


            setText(
                'label[for="quantity"]',
                t.quantity
            );


            setText(
                'label[for="unit"]',
                t.unit
            );


            setText(
                'label[for="availableFrom"]',
                t.availableFrom
            );


            setText(
                'label[for="expiryTime"]',
                t.expiry
            );


            setText(
                'label[for="location"]',
                t.location
            );


            setText(
                'label[for="notes"]',
                t.additional
            );


            const foodOptions =
                document.querySelectorAll(
                    "#foodType option"
                );


            if (
                foodOptions.length >= 7
            ) {

                foodOptions[0].textContent =
                    t.selectFood;


                foodOptions[1].textContent =
                    t.bakery;


                foodOptions[2].textContent =
                    t.prepared;


                foodOptions[3].textContent =
                    t.fruits;


                foodOptions[4].textContent =
                    t.vegetables;


                foodOptions[5].textContent =
                    t.dairy;


                foodOptions[6].textContent =
                    t.other;

            }


            const unitOptions =
                document.querySelectorAll(
                    "#unit option"
                );


            if (
                unitOptions.length >= 4
            ) {

                unitOptions[0].textContent =
                    t.items;


                unitOptions[1].textContent =
                    t.kilograms;


                unitOptions[2].textContent =
                    t.meals;


                unitOptions[3].textContent =
                    t.boxes;

            }


            const locationInput =
                document.getElementById(
                    "location"
                );


            if (locationInput) {

                locationInput.placeholder =
                    t.locationPlaceholder;

            }


            const notes =
                document.getElementById(
                    "notes"
                );


            if (notes) {

                notes.placeholder =
                    t.notesPlaceholder;

            }


            setButton(
                "#analyzeSurplusButton",
                t.analyze
            );


            /* =================================================
               RESULT EMPTY
            ================================================= */

            setText(
                "#analysisResult .result-empty h3",
                t.intelligence
            );


            setText(
                "#analysisResult .result-empty p",
                t.submitPrompt
            );


            /* =================================================
               RESULT
            ================================================= */

            setText(
                ".result-label",
                t.rescuePriority
            );


            if (!lastAnalysis) {

                setText(
                    "#priorityLevel",
                    t.waiting
                );

            }


            const factorLabels =
                document.querySelectorAll(
                    ".result-factors > div span"
                );


            if (
                factorLabels.length >= 4
            ) {

                factorLabels[0].textContent =
                    t.food;


                factorLabels[1].textContent =
                    t.quantity;


                factorLabels[2].textContent =
                    t.timeRemaining;


                factorLabels[3].textContent =
                    t.location;

            }


            setText(
                ".recommendation > span",
                t.recommendedAction
            );


            setText(
                ".smart-matching .matching-header > span",
                t.intelligentMatching
            );


            setText(
                ".smart-matching .matching-header strong",
                t.bestMatches
            );


            /* =================================================
               OPERATION
            ================================================= */

            setText(
                ".operation-header > span",
                t.rescueOperation
            );


            setText(
                "#rescueOperation .status-step:nth-of-type(1) strong",
                t.matched
            );


            setText(
                "#rescueOperation .status-step:nth-of-type(2) strong",
                t.collection
            );


            setText(
                "#rescueOperation .status-step:nth-of-type(3) strong",
                t.rescued
            );


            /* =================================================
               MAP
            ================================================= */

            setText(
                ".map-section .eyebrow",
                t.liveNetwork
            );


            setText(
                ".map-section .section-heading h2",
                t.mapTitle
            );


            setText(
                ".map-section .section-heading p",
                t.mapDescription
            );


            setText(
                ".map-status",
                t.networkOnline
            );


            setButton(
                "#locateUserButton",
                t.locateMe
            );


            /* =================================================
               COMMAND CENTER
            ================================================= */

            setText(
                ".command-center-section .eyebrow",
                t.commandLabel
            );


            setText(
                ".command-center-section .section-heading h2",
                t.commandTitle
            );


            setText(
                ".command-center-section .section-heading p",
                t.commandDescription
            );


            setText(
                ".current-operation-card .command-label",
                t.liveOperation
            );


            setText(
                ".current-operation-card h3",
                t.currentRescue
            );


            if (
                currentOperationStatus &&
                !state.currentOperation
            ) {

                currentOperationStatus.textContent =
                    t.idle;

            }


            setText(
                "#commandCurrentEmpty",
                t.noActive
            );


            setText(
                ".command-center-grid .command-card:nth-child(2) .command-label",
                t.liveImpact
            );


            setText(
                ".command-center-grid .command-card:nth-child(2) h3",
                t.performance
            );


            const performanceLabels =
                document.querySelectorAll(
                    ".performance-item span"
                );


            if (
                performanceLabels.length >= 4
            ) {

                performanceLabels[0].textContent =
                    t.rescuesStarted;


                performanceLabels[1].textContent =
                    t.mealsRescued;


                performanceLabels[2].textContent =
                    currentLanguage === "ar"
                        ? "الغذاء الذي تم إنقاذه"
                        : currentLanguage === "fr"
                            ? "Nourriture sauvée"
                            : currentLanguage === "zh"
                                ? "已拯救食品"
                                : currentLanguage === "de"
                                    ? "Gerettete Lebensmittel"
                                    : "Estimated food saved";


                performanceLabels[3].textContent =
                    t.co2Avoided;

            }


            setText(
                ".history-card .command-label",
                t.rescueHistory
            );


            setText(
                ".history-card h3",
                t.recentOperations
            );


            setText(
                ".history-empty",
                t.historyEmpty
            );


            /* =================================================
               FOOTER
            ================================================= */

            setText(
                "footer p",
                t.footer
            );


            /* =================================================
               DYNAMIC
            ================================================= */

            translateDynamicText(
                document,
                t
            );


            /* =================================================
               SAVE LANGUAGE
            ================================================= */

            try {

                localStorage.setItem(
                    "foodrescue_language",
                    currentLanguage
                );

            }
            catch {}

        }


        /* =====================================================
           LANGUAGE BUTTON
        ===================================================== */

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


        /* =====================================================
           LANGUAGE MENU
        ===================================================== */

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


                translatePage(
                    target.dataset.lang
                );


                menu.classList.remove(
                    "open"
                );

            }
        );


        /* =====================================================
           CLOSE LANGUAGE MENU
        ===================================================== */

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


        /* =====================================================
           PUBLIC LANGUAGE REFRESH
        ===================================================== */

        window.FoodRescueLanguage = {

            refreshDynamic() {

                translateDynamicText(
                    document,
                    translations[
                        currentLanguage
                    ] ||
                    translations.en
                );

            },

            setLanguage(
                language
            ) {

                if (
                    translations[language]
                ) {

                    translatePage(
                        language
                    );

                }

            },

            getLanguage() {

                return currentLanguage;

            }

        };


        /* =====================================================
           INITIAL TRANSLATION
        ===================================================== */

        translatePage(
            currentLanguage
        );

    }


    /* =====================================================
       INITIAL RENDER
    ===================================================== */

    updateMetrics();

    renderCurrentOperation();

    renderHistory();

    renderPrediction();


    if (
        rescueStage === 3 &&
        startRescueButton
    ) {

        startRescueButton.disabled =
            true;

    }


    /* =====================================================
       START LANGUAGE SYSTEM
    ===================================================== */

    initLanguageSystem();


    /* =====================================================
       INITIAL DYNAMIC REFRESH
    ===================================================== */

    window.FoodRescueLanguage
        ?.refreshDynamic?.();


    console.log(
        "FoodRescue final platform initialized successfully."
    );

});
