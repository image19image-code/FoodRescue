"use strict";

/* =========================================
   FOODRESCUE — LIVE RESCUE MAP
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

        "relizane": [35.737, 0.555],

        "oran": [35.697, -0.633],

        "tlemcen": [34.882, -1.316],

        "mostaganem": [35.931, 0.089],

        "algiers": [36.753, 3.058],

        "saida": [34.830, 0.151],

        "ouargla": [31.949, 5.325]

    },


    /* =====================================
       INIT
    ===================================== */

    init() {

        if (
            this.initialized ||
            typeof L === "undefined"
        ) {
            return;
        }


        const mapElement =
            document.getElementById(
                "rescueMap"
            );


        if (!mapElement) {
            return;
        }


        this.map =
            L.map(
                mapElement,
                {
                    zoomControl: true
                }
            )
            .setView(
                [35.7, -0.6],
                6
            );


        L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                maxZoom: 19,

                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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


        this.initialized = true;


        this.renderOrganizations();

    },


    /* =====================================
       ORGANIZATION MARKERS
    ===================================== */

    renderOrganizations() {

        if (
            !this.map ||
            !Array.isArray(
                RESCUE_ORGANIZATIONS
            )
        ) {
            return;
        }


        this.organizationLayer.clearLayers();


        RESCUE_ORGANIZATIONS
            .forEach(
                organization => {

                    const city =
                        String(
                            organization.city || ""
                        )
                        .toLowerCase()
                        .trim();


                    const coordinates =
                        this.cities[city];


                    if (!coordinates) {
                        return;
                    }


                    const marker =
                        L.circleMarker(
                            coordinates,
                            {
                                radius: 9,

                                weight: 2,

                                fillOpacity: 0.85,

                                color: "#4ade80",

                                fillColor: "#0b2517"
                            }
                        );


                    marker.bindPopup(`
                        <div class="map-popup">

                            <strong>
                                ${organization.name}
                            </strong>

                            <span>
                                ${organization.distance} km
                                demo distance
                            </span>

                            <span>
                                Capacity:
                                ${organization.capacity}
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

    getCityCoordinates(
        location
    ) {

        if (!location) {
            return null;
        }


        const normalized =
            String(
                location
            )
            .toLowerCase()
            .trim();


        const exact =
            this.cities[
                normalized
            ];


        if (exact) {
            return exact;
        }


        const key =
            Object.keys(
                this.cities
            )
            .find(
                city =>
                    normalized.includes(city) ||
                    city.includes(normalized)
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
            !this.map ||
            !navigator.geolocation
        ) {
            return;
        }


        navigator.geolocation.getCurrentPosition(
            position => {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;


                if (
                    this.userMarker
                ) {

                    this.userMarker.remove();

                }


                this.userMarker =
                    L.marker(
                        [lat, lng]
                    )
                    .addTo(
                        this.map
                    )
                    .bindPopup(
                        "<strong>Your location</strong><br>Used only for this map session."
                    );


                this.userMarker.openPopup();


                this.map.setView(
                    [lat, lng],
                    10
                );

            },

            () => {

                /* User denied location.
                   Keep default Algeria view. */

            },

            {
                enableHighAccuracy: true,

                timeout: 8000,

                maximumAge: 300000

            }
        );

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
            String(
                organization.city || ""
            )
            .toLowerCase()
            .trim();


        const target =
            this.cities[
                targetCity
            ];


        const source =
            this.getCityCoordinates(
                surplusLocation
            );


        if (!target) {
            return;
        }


        this.routeLayer.clearLayers();


        const targetMarker =
            L.circleMarker(
                target,
                {
                    radius: 11,

                    weight: 3,

                    color: "#facc15",

                    fillColor: "#4ade80",

                    fillOpacity: 0.95
                }
            );


        targetMarker
            .bindPopup(`
                <strong>
                    Rescue destination
                </strong>
                <br>
                ${organization.name}
            `)
            .openPopup();


        targetMarker.addTo(
            this.routeLayer
        );


        if (source) {

            const sourceMarker =
                L.circleMarker(
                    source,
                    {
                        radius: 8,

                        weight: 2,

                        color: "#ffffff",

                        fillColor: "#4ade80",

                        fillOpacity: 0.9
                    }
                );


            sourceMarker
                .bindPopup(
                    "<strong>Surplus source</strong>"
                );


            sourceMarker.addTo(
                this.routeLayer
            );


            const line =
                L.polyline(
                    [
                        source,
                        target
                    ],
                    {
                        weight: 4,

                        dashArray:
                            "10 8",

                        color: "#4ade80",

                        opacity: 0.8
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
                        [40, 40]
                }
            );

        }

        else {

            this.map.setView(
                target,
                9
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