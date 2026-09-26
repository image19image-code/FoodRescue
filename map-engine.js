"use strict";

/* =========================================
   FOODRESCUE — LIVE RESCUE MAP
========================================= */


/* =========================================
   HELPERS
========================================= */

function mapEscapeHTML(
    value
) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function mapNormalizeText(
    value
) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[’']/g,
            ""
        );

}


function mapGetLanguage() {

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


function mapText(
    key
) {

    const language =
        mapGetLanguage();


    const labels = {

        en: {

            rescueDestination:
                "Rescue destination",

            surplusSource:
                "Surplus source",

            yourLocation:
                "Your location",

            sessionOnly:
                "Used only for this map session.",

            capacity:
                "Capacity",

            distance:
                "Approx. network distance",

            networkLocation:
                "Network location"

        },


        ar: {

            rescueDestination:
                "وجهة الإنقاذ",

            surplusSource:
                "مصدر فائض الطعام",

            yourLocation:
                "موقعك",

            sessionOnly:
                "يُستخدم فقط خلال جلسة الخريطة هذه.",

            capacity:
                "السعة",

            distance:
                "المسافة التقريبية عبر الشبكة",

            networkLocation:
                "موقع الشبكة"

        },


        fr: {

            rescueDestination:
                "Destination du sauvetage",

            surplusSource:
                "Source du surplus",

            yourLocation:
                "Votre position",

            sessionOnly:
                "Utilisé uniquement pendant cette session cartographique.",

            capacity:
                "Capacité",

            distance:
                "Distance approximative du réseau",

            networkLocation:
                "Emplacement du réseau"

        },


        zh: {

            rescueDestination:
                "救援目的地",

            surplusSource:
                "剩余食物来源",

            yourLocation:
                "您的位置",

            sessionOnly:
                "仅用于本次地图会话。",

            capacity:
                "容量",

            distance:
                "网络近似距离",

            networkLocation:
                "网络位置"

        },


        de: {

            rescueDestination:
                "Rettungsziel",

            surplusSource:
                "Überschussquelle",

            yourLocation:
                "Ihr Standort",

            sessionOnly:
                "Wird nur für diese Kartensitzung verwendet.",

            capacity:
                "Kapazität",

            distance:
                "Ungefähre Netzwerkentfernung",

            networkLocation:
                "Netzwerkstandort"

        }

    };


    return (
        labels[language] ||
        labels.en
    )[key] || key;

}


/* =========================================
   FOODRESCUE MAP
========================================= */

const FoodRescueMap = {

    map: null,

    organizationLayer: null,

    routeLayer: null,

    userMarker: null,

    initialized: false,


    /* =====================================
       CITY COORDINATES
    ===================================== */

    cities: {

        relizane: [35.737, 0.555],

        oran: [35.697, -0.633],

        tlemcen: [34.882, -1.316],

        mostaganem: [35.931, 0.089],

        algiers: [36.753, 3.058],

        saida: [34.830, 0.151],

        ouargla: [31.949, 5.325]

    },


    /* =====================================
       CITY ALIASES
    ===================================== */

    cityAliases: {

        "relizane":
            "relizane",

        "reli zane":
            "relizane",

        "relizane, algeria":
            "relizane",

        "oran":
            "oran",

        "oran, algeria":
            "oran",

        "tlemcen":
            "tlemcen",

        "tlemcen, algeria":
            "tlemcen",

        "mostaganem":
            "mostaganem",

        "mostaganem, algeria":
            "mostaganem",

        "algiers":
            "algiers",

        "alger":
            "algiers",

        "alger, algeria":
            "algiers",

        "algiers, algeria":
            "algiers",

        "saida":
            "saida",

        "saida, algeria":
            "saida",

        "sai da":
            "saida",

        "ouargla":
            "ouargla",

        "ouargla, algeria":
            "ouargla"

    },


    /* =====================================
       INIT
    ===================================== */

    init() {

        if (
            this.initialized
        ) {
            return;
        }


        if (
            typeof L ===
            "undefined"
        ) {

            console.warn(
                "Leaflet is unavailable."
            );

            return;

        }


        const mapElement =
            document.getElementById(
                "rescueMap"
            );


        if (!mapElement) {

            console.warn(
                "Rescue map element not found."
            );

            return;

        }


        this.map =
            L.map(
                mapElement,
                {

                    zoomControl:
                        true,

                    attributionControl:
                        true

                }
            )
            .setView(
                [
                    35.7,
                    -0.6
                ],
                6
            );


        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {

                maxZoom:
                    19,

                minZoom:
                    3,

                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'

            }
        )
        .addTo(
            this.map
        );


        this.organizationLayer =
            L.layerGroup()
                .addTo(
                    this.map
                );


        this.routeLayer =
            L.layerGroup()
                .addTo(
                    this.map
                );


        this.initialized =
            true;


        this.renderOrganizations();


        /*
           Leaflet sometimes calculates dimensions
           before a responsive container has settled.
        */

        requestAnimationFrame(
            () => {

                this.invalidateSize();

            }
        );


        window.addEventListener(
            "resize",
            () => {

                this.invalidateSize();

            },
            {
                passive: true
            }
        );

    },


    /* =====================================
       MAP SIZE
    ===================================== */

    invalidateSize() {

        if (
            !this.map
        ) {
            return;
        }


        setTimeout(
            () => {

                try {

                    this.map.invalidateSize(
                        true
                    );

                }
                catch (error) {

                    console.warn(
                        "Map resize error:",
                        error
                    );

                }

            },
            80
        );

    },


    /* =====================================
       ORGANIZATION DATA
    ===================================== */

    getOrganizations() {

        return Array.isArray(
            window.RESCUE_ORGANIZATIONS
        )
            ? window.RESCUE_ORGANIZATIONS
            : [];

    },


    /* =====================================
       ORGANIZATION MARKERS
    ===================================== */

    renderOrganizations() {

        if (
            !this.map ||
            !this.organizationLayer
        ) {
            return;
        }


        this.organizationLayer
            .clearLayers();


        const organizations =
            this.getOrganizations();


        organizations.forEach(
            organization => {

                if (
                    !organization ||
                    typeof organization !==
                    "object"
                ) {

                    return;

                }


                const cityKey =
                    this.resolveCityKey(
                        organization.city
                    );


                const coordinates =
                    cityKey
                        ? this.cities[
                            cityKey
                        ]
                        : null;


                if (
                    !coordinates
                ) {

                    return;

                }


                const marker =
                    L.circleMarker(
                        coordinates,
                        {

                            radius:
                                9,

                            weight:
                                2,

                            fillOpacity:
                                0.85,

                            color:
                                "#4ade80",

                            fillColor:
                                "#0b2517"

                        }
                    );


                const name =
                    mapEscapeHTML(
                        organization.name ||
                        "Rescue organization"
                    );


                const distance =
                    mapEscapeHTML(
                        organization.distance ??
                        "—"
                    );


                const capacity =
                    mapEscapeHTML(
                        organization.capacity ??
                        "—"
                    );


                marker.bindPopup(`

                    <div class="map-popup">

                        <strong>
                            ${name}
                        </strong>

                        <span>
                            ${mapText("distance")}:
                            ${distance} km
                        </span>

                        <span>
                            ${mapText("capacity")}:
                            ${capacity}
                        </span>

                        <span>
                            ${mapText("networkLocation")}:
                            ${mapEscapeHTML(
                                organization.city ||
                                "—"
                            )}
                        </span>

                    </div>

                `);


                marker.addTo(
                    this.organizationLayer
                );

            }
        );

    },


    /* =====================================
       CITY LOOKUP
    ===================================== */

    resolveCityKey(
        location
    ) {

        const normalized =
            mapNormalizeText(
                location
            );


        if (
            !normalized
        ) {

            return null;

        }


        if (
            this.cityAliases[
                normalized
            ]
        ) {

            return this.cityAliases[
                normalized
            ];

        }


        if (
            this.cities[
                normalized
            ]
        ) {

            return normalized;

        }


        const key =
            Object.keys(
                this.cities
            )
            .find(
                city => {

                    const cityNormalized =
                        mapNormalizeText(
                            city
                        );


                    return (
                        normalized.includes(
                            cityNormalized
                        ) ||
                        cityNormalized.includes(
                            normalized
                        )
                    );

                }
            );


        return key ||
            null;

    },


    getCityCoordinates(
        location
    ) {

        const key =
            this.resolveCityKey(
                location
            );


        return key
            ? this.cities[key]
            : null;

    },


    /* =====================================
       USER LOCATION
    ===================================== */

    locateUser() {

        if (
            !this.map
        ) {

            return;

        }


        if (
            !navigator.geolocation
        ) {

            this.showLocationError(
                "Geolocation is not supported by this browser."
            );

            return;

        }


        navigator.geolocation.getCurrentPosition(

            position => {

                const latitude =
                    Number(
                        position.coords.latitude
                    );


                const longitude =
                    Number(
                        position.coords.longitude
                    );


                if (
                    !Number.isFinite(
                        latitude
                    ) ||
                    !Number.isFinite(
                        longitude
                    )
                ) {

                    this.showLocationError(
                        "Invalid location data received."
                    );

                    return;

                }


                if (
                    this.userMarker
                ) {

                    this.userMarker.remove();

                }


                const labels = {

                    title:
                        mapText(
                            "yourLocation"
                        ),

                    description:
                        mapText(
                            "sessionOnly"
                        )

                };


                this.userMarker =
                    L.marker(
                        [
                            latitude,
                            longitude
                        ]
                    )
                    .addTo(
                        this.map
                    );


                this.userMarker.bindPopup(`

                    <strong>
                        ${mapEscapeHTML(
                            labels.title
                        )}
                    </strong>

                    <br>

                    <span>
                        ${mapEscapeHTML(
                            labels.description
                        )}
                    </span>

                `);


                this.userMarker.openPopup();


                this.map.setView(
                    [
                        latitude,
                        longitude
                    ],
                    10,
                    {
                        animate:
                            true
                    }
                );

            },


            error => {

                let message =
                    "Location unavailable.";


                if (
                    error?.code ===
                    1
                ) {

                    message =
                        "Location permission was denied.";

                }
                else if (
                    error?.code ===
                    2
                ) {

                    message =
                        "Your location could not be determined.";

                }
                else if (
                    error?.code ===
                    3
                ) {

                    message =
                        "Location request timed out.";

                }


                console.warn(
                    "Geolocation error:",
                    error
                );


                this.showLocationError(
                    message
                );

            },


            {

                enableHighAccuracy:
                    true,

                timeout:
                    8000,

                maximumAge:
                    300000

            }

        );

    },


    /* =====================================
       LOCATION ERROR
    ===================================== */

    showLocationError(
        message
    ) {

        console.warn(
            "FoodRescue location:",
            message
        );

        /*
           Do not interrupt the user with
           alert(). Keep the default map.
        */

    },


    /* =====================================
       SHOW RESCUE OPERATION
    ===================================== */

    showRescueOperation(
        organization,
        surplusLocation
    ) {

        if (
            !this.map ||
            !organization
        ) {

            return;

        }


        const targetCity =
            this.resolveCityKey(
                organization.city
            );


        const target =
            targetCity
                ? this.cities[
                    targetCity
                ]
                : null;


        const source =
            this.getCityCoordinates(
                surplusLocation
            );


        if (
            !target
        ) {

            console.warn(
                "Rescue destination city not found:",
                organization.city
            );

            return;

        }


        if (
            !this.routeLayer
        ) {

            return;

        }


        this.routeLayer.clearLayers();


        const organizationName =
            mapEscapeHTML(
                organization.name ||
                "Rescue organization"
            );


        /* =================================
           DESTINATION
        ================================= */

        const targetMarker =
            L.circleMarker(
                target,
                {

                    radius:
                        11,

                    weight:
                        3,

                    color:
                        "#facc15",

                    fillColor:
                        "#4ade80",

                    fillOpacity:
                        0.95

                }
            );


        targetMarker.bindPopup(`

            <strong>
                ${mapText(
                    "rescueDestination"
                )}
            </strong>

            <br>

            ${organizationName}

        `);


        targetMarker.addTo(
            this.routeLayer
        );


        /* =================================
           SOURCE
        ================================= */

        if (
            source
        ) {

            const sourceMarker =
                L.circleMarker(
                    source,
                    {

                        radius:
                            8,

                        weight:
                            2,

                        color:
                            "#ffffff",

                        fillColor:
                            "#4ade80",

                        fillOpacity:
                            0.9

                    }
                );


            sourceMarker.bindPopup(`

                <strong>
                    ${mapText(
                        "surplusSource"
                    )}
                </strong>

                <br>

                ${mapEscapeHTML(
                    surplusLocation ||
                    "—"
                )}

            `);


            sourceMarker.addTo(
                this.routeLayer
            );


            /* =================================
               ROUTE
            ================================= */

            const line =
                L.polyline(
                    [
                        source,
                        target
                    ],
                    {

                        weight:
                            4,

                        dashArray:
                            "10 8",

                        color:
                            "#4ade80",

                        opacity:
                            0.8

                    }
                );


            line.addTo(
                this.routeLayer
            );


            this.map.fitBounds(
                [
                    source,
                    target
                ],
                {

                    padding:
                        [
                            40,
                            40
                        ],

                    maxZoom:
                        11

                }
            );

        }
        else {

            this.map.setView(
                target,
                9,
                {
                    animate:
                        true
                }
            );

        }

    }


};


/* =========================================
   AUTO INIT
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        FoodRescueMap.init();

    }
);


/* =========================================
   GLOBAL ACCESS
========================================= */

window.FoodRescueMap =
    FoodRescueMap;
