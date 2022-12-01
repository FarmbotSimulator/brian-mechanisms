/* Copyright Nov 2022 Brian Onang'o
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
// import { createRequire } from "module";
// const required = createRequire(import.meta.url);
// const botTypes = required("../store/botTypes.json");
import agriculture from "./appManagers/agriculture";
import construction from "./appManagers/construction";
import manufacturing from "./appManagers/manufacturing";
import retail from "./appManagers/retail";
import surveying from "./appManagers/surveying";
import { to } from "await-to-js";
const Agriculture = agriculture, // for eval
    Construction = construction,
    Manufacturing = manufacturing,
    Retail = retail,
    Surveying = surveying


const botTypes = require("../store/botTypes.json");
class BrianMechanismsSimulator {
    /*
     robot instances
    */
    // instances = {}
    constructor() {
        this.instances = {}
    }
    createInstance() {
        let instanceNumber = new Date().getTime()
        this.selectedInstance = instanceNumber
        this.instances[instanceNumber] = {
            application: null, // null
            _application: null, // new entry
            botType: null,
            _botType: null, // new entry
            botModel: null,
            _botModel: null, // new entry
            showPlants: false,
            bed: false, // false 
            raised: true, // false
            raisedHeight: 750,
            plantHeight: 500,
            plantHeightLimits: [500, 1000],
            movingRequestId: 0, // for controlling moving request so there is no conflict
            workSpaceLength: 18000 + 1000,
            workSpaceWidth: 3000 + 1000,
            botLength: 18000,
            botWidth: 3000,
            soilDepth: 100,
            plankThickness: 18, // 18mm
            legs: {
                width: 100,
                length: 100,
            },
            location: {
                x: 0, y: 0, z: 0
            },
            initialCamRadius: 400,
            enableExternalControls: false,
            joystick: { x: 0, y: 0, z: 0, speed: {} },
            topofBed: 0,
            x: 0,
            y: 0,
            speedFactor: 1
        }
        /**
         * Work out its x and y so that it is not in another's workspace
         * Create its soil
         */
        // if (Object.keys(this.instances || {}).length > 1) {
        let x = Math.floor((Math.random() * (1 - -1) + -1) * 1000)
        let y = Math.floor((Math.random() * (1 - -1) + -1) * 1000)
        let len = 18000 + 1000
        let wid = 3000 + 1000
        let startX = x - len / 2
        let startY = y - wid / 2
        let stopX = startX + len
        let stopY = startY + wid
        let startStartX = x
        let startStartY = y
        // check if its inside another rectangle
        let intersectX = (instance) => {
            if (
                Math.abs(instance.x - x) < (instance.workSpaceWidth / 2 + wid / 2)
            ) return true;
            return false
        }
        let intersectY = (instance) => {
            if (
                Math.abs(instance.y - y) < (instance.workSpaceLength / 2 + len / 2)
            ) return true;
            return false
        }
        let intersects = (instance) => {
            return intersectX(instance) && intersectY(instance)
            // if (
            //     ((instance.startYI >= startY && startY >= instance.stopYI) ||
            //         (instance.startYI >= stopY && stopY >= instance.stopY)) &&
            //     ((instance.startXI <= startX && startX <= instance.stopXI) ||
            //         (instance.startXI <= stopX && stopX <= instance.stopXI))
            // ) return true;
            // return false
        }
        let xDir = x >= 0 ? 1 : -1;
        let yDir = y >= 0 ? 1 : -1;
        let num = 0
        Object.values(this.instances).slice(0, -1).map((instance, index) => {
            // if(index === Object.values(this.instances).length - 1)return // ignore last element in 
            let xI = instance["x"]
            let yI = instance["y"]
            let widI = instance["workSpaceWidth"]
            let lenI = instance["workSpaceLength"]
            let startXI = xI - lenI / 2
            let startYI = yI + widI / 2
            let stopXI = startXI + lenI
            let stopYI = startYI - widI
            let tmp = {
                startXI, startYI, stopXI, stopYI, x: xI, y: yI, workSpaceWidth: widI, workSpaceLength: lenI
            }
            if (intersects(tmp)) {
                // move it away from the
                while (intersects(tmp)) {
                    x += xDir
                    y += yDir
                    startX = x - len / 2
                    startY = y + wid / 2
                    stopX = startX + len
                    stopY = startY - wid
                }
                console.table({
                    xes: Math.abs(xI - x),
                    compareX: widI,
                    yes: Math.abs(yI - y),
                    comparey: lenI,
                    xInt: intersectX(tmp),
                    yInt: intersectY(tmp),
                    x, xI,
                    y, yI,
                    num: num++
                })
                // if(intersectX(tmp))y = startStartY
                // else if(intersectY(tmp)) x=startStartX
                // move it only along a single axis, reset the translation along the other axis
            } else {
                console.table({
                    "Zero": true,
                    xes: Math.abs(xI - x),
                    compareX: widI,
                    yes: Math.abs(yI - y),
                    comparey: lenI,
                    xInt: intersectX(tmp),
                    yInt: intersectY(tmp),
                    x, xI,
                    y, yI,
                    num: num++
                })
            }
        })
        // move it towards the origin
        this.instances[instanceNumber].x = x
        this.instances[instanceNumber].y = y
        this.numInstances++
        this.startEditingInstance(instanceNumber)
        return instanceNumber
    }
    /*
     * @param {String[]} applications
     */
    applications() {
        let applications = []
        Object.values(botTypes).map(bot => {
            bot.applications.map(application => applications.push(application))
        })
        applications = [...new Set(applications)].map(application => { // Title Case
            let tmp = application
            tmp = application[0].toUpperCase() + application.slice(1)
            return tmp
        });
        return applications
    }
    botTypes(application) {
        let ret = {}
        if (!application) return {}
        Object.keys(botTypes).map(bot => {
            let botApplications = botTypes[bot].applications || []
            if (botApplications.includes(application.toLowerCase())) {
                ret[bot] = botTypes[bot].bots
            }
        })
        return Object.keys(ret);
    }
    botModels(bot) {
        return Object.keys(botTypes[bot].bots);
    }
    botModelParams(bot, model) {
        return botTypes[bot].bots[model];
    }
    botControllers(bot) {
        return botTypes[bot].controllers;
    }

    startEditingInstance(instanceNumber) {
        let self = this.instances[instanceNumber]
        self._application = self.application
        self._botType = self.botType
        self._botModel = self.botModel
        if (self.bot) {
            self.bot.startEditingInstance()
        }
    }
    /*
     *
        */
    initAppManager(self, clone) {
        let appManager
        switch (clone) {
            case false:
                if (typeof self.appManager === 'undefined') self.appManager = eval(`new ${self._application}()`)
                appManager = self.appManager;
                break;
            default:
                self._appManager = eval(`new ${self._application}()`)
                appManager = self._appManager;
        }
        // create or copy the bot location and other default vars
        appManager.setParent(self)
        appManager.setHelper(this)
        return appManager
    }
    startApplication(instanceNumber) {
        let self = this.instances[instanceNumber]
        self._appManager = this.initAppManager(self, true)
        if (self._application !== self.application) {
            self._appManager.init()
        } else {
            self._appManager.copyFrom(self.appManager)
        }
    }
    initEditInstance(instanceNumber) {
        let self = this.instances[instanceNumber]
        self._appManager = this.initAppManager(self, true)
        self._appManager.copyFrom(self.appManager)
        self._application = self.application // retain
    }
    async applyInstanceDev(instanceNumber) {
        let self = this.instances[instanceNumber]
        self.application = self._application // retain
        self.appManager.copyFrom(self._appManager)
        if (typeof self.appManager.botType === 'undefined' || !self.appManager.botType) {
            return
        }
        let [err, care] = await to(self.appManager.getSceneManager());
        if (err) {
            return // enable in production
        }
        self.appManager.createWorkspace()
        this.addSelector()
    }
    // does not manage the scene
    preapplyInstance(instanceNumber) {
        instanceNumber = instanceNumber || this.selectedInstance
        if (typeof self.application === 'undefined' || !self.application)
            self.application = self._application
        this.applyInstanceDev(instanceNumber)
    }
    async applyInstance(instanceNumber) {
        instanceNumber = instanceNumber || this.selectedInstance
        let self = this.instances[instanceNumber]
        console.log(self)
        if (typeof self._application === 'undefined' || !self._application) { // undefined or null
            this.destroyInstance(instanceNumber)
            return
        }
        self.appManager = this.initAppManager(self, false)
        await this.applyInstanceDev(instanceNumber)

        // let self = this.instances[instanceNumber];
        // this.resizeGarden(instanceNumber)
        // this.createSoilBed(instanceNumber)
        // this.createTransforms(instanceNumber)
        // this.createLegs(instanceNumber)
        // this.createConcrete(instanceNumber)
        // this.placeRobotZLocation(instanceNumber)
        // this.resizeRobot(instanceNumber)
        // this.moveBot(instanceNumber, true)
        // this.positionPlants(instanceNumber)
    }
    destroyInstance(instanceNumber) {
        instanceNumber = instanceNumber || this.selectedInstance
        let self = this.instances[instanceNumber]
        try { self.appManager.destroy(); } catch (error) { }
        this.selectedInstance = undefined
        delete this.instances[instanceNumber]
    }
    deleteAllInstances() {
        Object.keys(this.instances).map(instanceNumber => this.destroyInstance(instanceNumber))
    }

    checkBasicData(instanceNumber) { // check if earlier application had been made
        if (typeof instanceNumber === 'undefined') instanceNumber = this.selectedInstance
        let self = this.instances[instanceNumber]
        if (typeof self._application === 'undefined' || !self._application) { // undefined or null

            this.destroyInstance(instanceNumber)

        }
        if (typeof self.appManager === "undefined") this.destroyInstance(instanceNumber)
    }
    addSelector(startedSelector) { // should not be here. will be moved to sceneManager
        // if (!startedSelector) {
        const webotsView = document.getElementsByTagName('webots-view')[0];
        const WbWorld = webotsView._view.x3dScene.WbWorld
        webotsView.mouseEventsExtra.onmouseup = (event) => {
            let self = webotsView.mouseEventsExtra
            let id, firstChildId;
            if (self._state.moved === false && (!self._state.longClick || self._mobileDevice)) {
                let tmp = webotsView.mouseEvents.picker.selectedId /// find the parent of this one
                if (tmp === undefined) {
                    tmp = "n" + webotsView.mouseEvents.Selector.preciseId
                }
                console.log({"clicked": tmp})
                if (typeof tmp === "number") tmp = `n${tmp}`
                for (let i in this.instances) {
                    let instance = this.instances[i]
                    let appManager = instance.appManager
                    try {
                        let sceneManager = appManager.sceneManager
                        let instanceRootNodeId = sceneManager.getThisRootNode().id
                        let elem = WbWorld.instance.nodes.get(tmp);
                        let firstChild = elem;
                        while (elem.parent) {
                            firstChild = elem
                            elem = WbWorld.instance.nodes.get(elem.parent);
                            if (elem.id === instanceRootNodeId) { // instance rootNode is parent of clicked
                                console.log({i, instanceRootNodeId})
                                this.selectedInstance = i;
                            } 
                        }
                    } catch (error) {
                        // console.log(error)
                    }
                }
            } // else this.selectedInstance = null
        };
    }

}

export const brianMechanisms = new BrianMechanismsSimulator();