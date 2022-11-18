/* Copyright 2020 Brian Onang'o
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";
/**
 * @module settings
 */

/**Possible options for botSettings */
let botOptions = {
    "farmbot": {
        "genesis": {
            "genesis": {
                "length": 3000,
                "width": 1500,
                "height": 500 // plant height
            },
            "xl": {
                "length": 6000,
                "width": 3000,
                "height": 500
            }
        },
        "express": {
            "express": {
                "length": 3000,
                "width": 1200,
                "height": 500
            },
            "xl": {
                "length": 6000,
                "width": 2400,
                "height": 500
            }
        },
        "juakali": {
            "custom": {
                "length": 10000,
                "width": 2000,
                "height": 1500
            }
        },
        "mega": {
            "2R": {
                "point0": [0, 0],
                "point1": [-100, 10000],
                "point2": [900, 9000],
                "point3": [1000, 100],
                "height": 2500
            },
            "4R": {
                "point0": [0, 0],
                "point1": [-100, 10000],
                "point2": [900, 9000],
                "point3": [1000, 100],
                "height": 2500
            }
        }
    },
    "tertil":{

    },
    "port": 8787
}

/**Default settings */
let defaultSettings = {
    "botType": "express",
    "subType": "xl",
    "port": botOptions.port
}

export class settings {
    /**
     * Constructor
     * @param {Object} options
     * @param {function} options.events - event emitter
     */
    constructor(options = {}) {
        this.events = options.events
        this.saveDefaults();
        this.botOptions = botOptions
        // console.log(botOptions)
    }

    /**Save default settings to local storage */
    saveDefaults() {
        let storage = {};
        try {
            storage = JSON.parse(window.localStorage.getItem('farmbotSimulator'))
        } catch (err) {
            storage = {}
        }
        if(!storage){
            storage= {}
        }
        if (storage.settings === undefined) {
            storage.settings = {}
        }
        for (let key in defaultSettings) {
            let value = defaultSettings[key];
            if (storage.settings[key] === undefined) {
                storage.settings[key] = value;
            }
        }
        if (storage.values === undefined) {
            storage.values = {}
            let values = botOptions.farmbot[storage.settings.botType][storage.settings.subType]
            storage.values = values;
        }
        if (Object.keys(storage.values).length === 0) {
            let values = botOptions.farmbot[storage.settings.botType][storage.settings.subType]
            storage.values = values;
        }
        let tmp = JSON.stringify(storage)
        window.localStorage.setItem('farmbotSimulator', tmp);
    }

    /**
     * Read settings from local storage 
     * @returns {Object}
     */
    getSettings() {
        let storage = {};
        try {
            storage = JSON.parse(window.localStorage.getItem('farmbotSimulator'))
        } catch (err) {
            storage = {}
        }
        if (storage.settings === undefined) {
            storage.settings = {}
        }

        let tmp = {}
        tmp.settings = storage.settings
        tmp.values = storage.values
        // tmp.options = this.botOptions
        // tmp.options = {...botOptions}
        tmp.options = JSON.parse(JSON.stringify(botOptions));
        return tmp;
    }
    /**
     * Write settings to local storage 
     * @param {object} settings
     * @param {string} settings.botType
     * @param {string} settings.subType
     * @param {number} settings.port
     * @param {object} values
     * @returns {Object}
     */
    writeSettings(settings, values) {

        let whole = ["length", "width", "height"];
        let split = ["point0", "point1", "point2", "point3"];

        let hasError = false;
        for (let key in values) {
            let val = values[key]
            /**check if is array */
            if (whole.includes(key)) {
                let tmp = parseInt(val);
                if (isNaN(tmp)) {
                    hasError = true;
                } else {
                    values[key] = tmp
                }
            }
            let tmp = [];
            if (split.includes(key)) {
                if (typeof val === 'string') {
                    tmp = val.split(',');
                } else {
                    tmp = val
                }
                tmp = tmp.map(item => {
                    let tmpItem = parseInt(item);
                    if (isNaN(tmpItem)) {
                        hasError = true;
                    } else {
                        return tmpItem
                    }
                })
                if (tmp.length !== 2) {
                    hasError = true;
                }
                values[key] = tmp
            }
        }
        if (hasError) {
            return false;
        }

        let storage = {};
        try {
            storage = JSON.parse(window.localStorage.getItem('farmbotSimulator'))
        } catch (err) {
            storage = {}
        }
        storage.settings = settings
        storage.values = values
        let tmp = JSON.stringify(storage);
        window.localStorage.setItem('farmbotSimulator', tmp);
        return true;
    }
}