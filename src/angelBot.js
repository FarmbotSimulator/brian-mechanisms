import { farmbotController } from "./farmbotController"
import { plantPlacer } from './plantPlacer'

let planter = new plantPlacer()

class angelBot_ {
    
    createInstance() {
        this.createSoil(instanceNumber)
    }
    changeBotType = (instanceNumber) => {
        let self = this.instances[instanceNumber];
        if (!self.botType || !self.botTypeType) return
        let compare = `${self.botType}${self.botTypeType}`
        compare = compare.toUpperCase().replace(/ /g, '')
        switch (compare) {
            case "FARMBOTGENESIS":
            case "FARMBOTGENESISXL":
            case "FARMBOTGENESISMAX":
            case "FARMBOTEXPRESS":
            case "FARMBOTEXPRESSXL":
            case "FARMBOTEXPRESSMAX":
                self.bed = true;
                self.workSpaceLength = (this.botTypes(self.application)[self.botType][self.botTypeType].Length);
                self.workSpaceWidth = (this.botTypes(self.application)[self.botType][self.botTypeType].Width);
                this.createGardenSoil(instanceNumber)
                break;
            case "ANGELBOTGROUNDCABLE":
            case "ANGELBOTGROUNDRAIL":
            case "ANGELBOTAERIALCABLE":
            case "ANGELBOTAERIALRAIL":
                this.createGardenSoil(instanceNumber)
            default:
        }
    }
    
    
    placeRobotZLocation = (instanceNumber) => { // gantry
        let self = this.instances[instanceNumber];
        let getRobotSNode = this.getRobotSNode(instanceNumber);
        let pose;
        if (self.bedType === "Concrete") {
            pose = { 'id': getRobotSNode.id, "translation": `0,0,0.05` };
        }
        else pose = { 'id': getRobotSNode.id, "translation": `0,0,0.02` };
        this.webotsView._view.animation._view.x3dScene._applyPoseToObject(pose, getRobotSNode)
    }
    getRobotParts = (instanceNumber) => {
        let self = this.instances[instanceNumber];
        let getRobotSNode = this.getRobotSNode(instanceNumber);
        let rightGantryColumn = this.getDescendantNode(getRobotSNode, [0, 0])
        let leftGantryColumn = this.getDescendantNode(getRobotSNode, [0, 1])
        let gantryBeam = this.getDescendantNode(getRobotSNode, [0, 2, 0])
        let CrossSlideNCo = this.getDescendantNode(getRobotSNode, [0, 2, 1, 0])
        let zAxisNUTM = this.getDescendantNode(getRobotSNode, [0, 2, 1, 0, 1])
        let zAxis = this.getDescendantNode(getRobotSNode, [0, 2, 1, 0, 1, 0])
        return { getRobotSNode, rightGantryColumn, leftGantryColumn, gantryBeam, CrossSlideNCo, zAxisNUTM, zAxis }
    }
    resizeRobot = (instanceNumber) => {
        let self = this.instances[instanceNumber];
        let { rightGantryColumn, leftGantryColumn, gantryBeam, CrossSlideNCo, zAxisNUTM, zAxis } = this.getRobotParts(instanceNumber)
        {
            this.applyTransformation(rightGantryColumn, "translation", [self.botWidth / (2 * 1000), 0, 0])
            this.applyTransformation(rightGantryColumn.children[0], "scale", [1, 1, (650 + self.plantHeight - 500) / 650]) /// len = 650 mm
            this.applyTransformation(rightGantryColumn.children[12], "translation", [0.012, -0.132, 0.067 + (self.plantHeight - 500) / 1000])
        }
        {
            this.applyTransformation(leftGantryColumn, "translation", [-self.botWidth / (2 * 1000), 0, 0])
            this.applyTransformation(leftGantryColumn.children[0], "scale", [1, 1, (650 + self.plantHeight - 500) / 650]) /// len = 650 mm
            this.applyTransformation(leftGantryColumn.children[12], "translation", [-0.011, 0.001, 0.06 + (self.plantHeight - 500) / 1000])
        }
        {
            this.applyTransformation(gantryBeam, "scale", [1, 1, (self.botWidth * 4.65) / 3000])
            this.applyTransformation(gantryBeam, "translation", [self.botWidth / (2 * 1000), gantryBeam.translation.y, /*gantryBeam.translation.z*/0.8 + (self.plantHeight - 500) / 1000])
        }
        this.applyTransformation(CrossSlideNCo, "translation", [0, 0, -self.botWidth / (2 * 1000)]) // take it to origin
        {
            let zAxisLen = 500 + self.plantHeight
            let scale = zAxisLen / 750
            this.applyTransformation(zAxis, "scale", [1, 1, zAxisLen / 750]) // length is 75cm, but it ought to have been 1 m
        }
        this.webotsView._view.x3dScene.render();
        /*
         */

    }
    moveBot = (instanceNumber, immediate = false, location, motionType = 'dontcare') => {
        let self = this.instances[instanceNumber];
        let { zAxis, getRobotSNode, CrossSlideNCo, zAxisNUTM } = this.getRobotParts(instanceNumber)
        location = location || {}
        let { x, y, z, speed } = location // in meters
        x = typeof x === 'number' ? x : self.location.x
        y = typeof y === 'number' ? y : self.location.y
        z = typeof z === 'number' ? z : self.location.z
        speed = speed || self.location.speed
        speed *= self.speedFactor
        let movingRequestId = ++self.movingRequestId
        // calculate limits
        let zAxisLen = zAxis.scale.z * 0.75
        let zAxisLenMax = zAxisLen - 0.35
        let limits = {                                  // in mm
            x: [-self.botWidth / 2000, (self.botWidth / 2000) - 0.2],
            y: [(-self.botLength / 2000), (self.botLength / 2000) - 0.2],
            z: [0, zAxisLenMax],
        }
        let premits = { x, y, z }
        let offsets = { x: -self.botWidth / 2, y: (-self.botLength / 2), z: 0 }
        for (let key in limits) { limits[key] = limits[key].map(item => (item * 1000) - offsets[key]) }
        if (x < limits["x"][0]) x = limits["x"][0]
        else if (x > limits["x"][1]) x = limits["x"][1]
        if (y < limits["y"][0]) y = limits["y"][0]
        else if (y > limits["y"][1]) y = limits["y"][1]
        if (z < limits["z"][0]) z = limits["z"][0]
        else if (z > limits["z"][1]) z = limits["z"][1]
       // console.log({ premits, limits, x, y, z })

        if (immediate) {
            this.applyTransformation(CrossSlideNCo, "translation", [0, 0, (-self.botWidth / 2000) + x / 1000])
            this.applyTransformation(getRobotSNode, "translation", [0, (-self.botLength / 2000) + y / 1000, getRobotSNode.translation.z])
            this.applyTransformation(zAxisNUTM, "translation", [-z / 1000, 0, 0])
            self.location.x = x
            self.location.y = y
            self.location.z = z
            this.webotsView._view.x3dScene.render();
        } else {// from the server. Joystick control will use immediate mode
            let currentX = CrossSlideNCo.translation.z - (-self.botWidth / 2000)
            let currentY = getRobotSNode.translation.y - (-self.botLength / 2000)
            let currentZ = - zAxisNUTM.translation.x
            currentX *= 1000
            currentY *= 1000
            currentZ *= 1000
            let diffs = {  // in mm
                x: x - currentX,
                y: y - currentY,
                z: z - currentZ,
            }
            // speed: mm/secs..
            let displacement = Math.sqrt(Math.pow(diffs.x, 2) + Math.pow(diffs.y, 2) + Math.pow(diffs.z, 2)) // mm
            if (displacement === 0) return
            let directionX = diffs.x / Math.abs(diffs.x)
            let directionY = diffs.y / Math.abs(diffs.y)
            let directionZ = diffs.z / Math.abs(diffs.z)
            if (diffs.x === 0) directionX = 1
            if (diffs.y === 0) directionY = 1
            if (diffs.z === 0) directionZ = 1
            // let time = displacement / speed
            let speedX = ((diffs.x / displacement) /** directionX*/) * speed  // mm/s
            let speedY = ((diffs.y / displacement) /** directionY*/) * speed
            let speedZ = ((diffs.z / displacement) /** directionZ*/) * speed
            // console.log({
            //     displacement, diffs, speedo: { speedX, speedY, speedZ }, loco: { x, y, z }, currentX, currentY, currentZ
            // })
            let timeStep = 1 / 10 // in secs n frames per sec
            let loggedTime = 0
            let logInterval = 0.5    // every 5 seconds
            let movingInterval = setInterval(() => {
                // console.log({ movingRequestId, movingRequestId1: self.movingRequestId })
                if (self.movingRequestId != movingRequestId) {
                    clearInterval(movingInterval)
                    this.publishLogs({ x, y, z }, motionType === 'relative', instanceNumber)
                    return
                }
                currentX = CrossSlideNCo.translation.z - (-self.botWidth / 2000) // in meters
                currentY = getRobotSNode.translation.y - (-self.botLength / 2000)
                currentZ = - zAxisNUTM.translation.x
                currentX *= 1000
                currentY *= 1000
                currentZ *= 1000

                let x1 = currentX + speedX * timeStep
                let y1 = currentY + speedY * timeStep
                let z1 = currentZ + speedZ * timeStep

                let isLastStep = false;
                if (directionX === -1 && x1 < x) isLastStep = true
                else if (directionX === 1 && x1 > x) isLastStep = true
                if (directionY === -1 && y1 < y) isLastStep = true
                else if (directionY === 1 && y1 > y) isLastStep = true
                if (directionZ === -1 && z1 < z) isLastStep = true
                else if (directionZ === 1 && z1 > z) isLastStep = true
                if (isLastStep) {
                    // console.log({ diffs, speedX, speedY, speedZ, currentX, currentY, currentZ, x1, y1, z1, x, y, z, directionX, directionY, directionZ })
                    x1 = x
                    y1 = y
                    z1 = z
                    self.movingRequestId++ // to clear interval
                }
                // console.log({ x1, y1, z1, x, y, z })
                this.applyTransformation(CrossSlideNCo, "translation", [0, 0, (-self.botWidth / 2000) + x1 / 1000])
                this.applyTransformation(getRobotSNode, "translation", [0, (-self.botLength / 2000) + y1 / 1000, getRobotSNode.translation.z])
                this.applyTransformation(zAxisNUTM, "translation", [-z1 / 1000, 0, 0])
                self.location.x = x1
                self.location.y = y1
                self.location.z = z1
                //checking for the last step
                this.webotsView._view.x3dScene.render();
                // every two seconds and at the end
                if (isLastStep || loggedTime >= logInterval) {
                    this.publishLogs({ x, y, z }, motionType === 'relative', instanceNumber)
                    loggedTime = 0
                } else loggedTime += timeStep

            }, timeStep * 1000)
            // send back location log every 5 seconds

        }

    }
    addSelector = () => { // put in wBWolrd.. but how to init it???
        if (!this.startedSelector) {
            const webotsView = document.getElementsByTagName('webots-view')[0];
            webotsView.mouseEventsExtra.onmouseup = (event) => {
                let self = webotsView.mouseEventsExtra
                let id, firstChildId;
                if (self._state.moved === false && (!self._state.longClick || self._mobileDevice)) {
                    let tmp = webotsView.mouseEvents.picker.selectedId /// find the parent of this one
                    if (tmp === undefined) {
                        tmp = "n" + webotsView.mouseEvents.Selector.preciseId
                    }
                    if (typeof tmp === "number") tmp = `n${tmp}`
                    let rootNode = this.getRootNode();
                    id = rootNode.id
                    let elem = this.WbWorld.instance.nodes.get(tmp);
                    let firstChild = elem;
                    while (elem.parent) {
                        firstChild = elem
                        elem = this.WbWorld.instance.nodes.get(elem.parent);
                    }
                    firstChildId = firstChild.id
                    if (elem.id === id) {
                        this.selectedId = tmp
                        Object.values(this.instances).map((instance, key) => {
                            if (instance.rootNodeId === firstChildId)
                                this.selectedInstance = Object.keys(this.instances)[key]
                        })
                    } else {
                        this.selectedId = null
                    }
                } else this.selectedId = null
            };
        }
    }
    
    
    applyInstance = (instanceNumber) => {
        let self = this.instances[instanceNumber];
        this.resizeGarden(instanceNumber)
        this.createSoilBed(instanceNumber)
        this.createTransforms(instanceNumber)
        this.createLegs(instanceNumber)
        this.createConcrete(instanceNumber)
        this.placeRobotZLocation(instanceNumber)
        this.resizeRobot(instanceNumber)
        this.moveBot(instanceNumber, true)
        this.positionPlants(instanceNumber)
        let tmp = this
        window.self = this
    }
    destroyInstance = (instanceNumber) => {
        this.selectedInstance = null
        let self = this.instances[instanceNumber];
        let rootNodeId = self.rootNodeId
        const object = this.WbWorld.instance.nodes.get(rootNodeId);
        object.delete();
        this.webotsView._view.animation._view.x3dScene.render();
        delete this.instances[instanceNumber]
    }
    deleteAllInstances = () => {
        Object.keys(this.instances).map(instanceNumber => this.destroyInstance(instanceNumber))
    }
    createGardenSoil = (instanceNumber) => {
        return
    }
    
    
    createLegs = (instanceNumber) => {
        let self = this.instances[instanceNumber];
        if (self.bedType !== "Wooden" || !self.raised) return
        let { webotsView, WbWorld } = this
        let cloned = this.getRootNode(instanceNumber)
        let woodenBlock = cloned.children[0].children[0]
        let woodenBlockBL = woodenBlock.clone()
        let woodenBlockBM = woodenBlock.clone()
        let woodenBlockBR = woodenBlock.clone()
        let woodenBlockFL = woodenBlock.clone()
        let woodenBlockFM = woodenBlock.clone()
        let woodenBlockFR = woodenBlock.clone()
        let legThickness = self.legs.width / 1000
        let diff = 2 * (25 - self.plankThickness) / 1000
        let elems = [woodenBlockBL, woodenBlockBM, woodenBlockBR, woodenBlockFL, woodenBlockFM, woodenBlockFR]
        let scaleTemplate = [
            [legThickness, legThickness, self.raisedHeight / 1000],
            [self.botWidth / 1000 - 2 * legThickness + diff, legThickness, legThickness]
        ]
        let scales = [
            0, 1, 0, 0, 1, 0
        ]
        let width = self.botWidth
        let length = self.botLength
        let raisedHeightHalf = (self.raisedHeight / 1000) / 2
        let translations = [
            `${-(width / 1000) / 2 + legThickness / 2 - diff / 2},${-(length / 1000) / 2 + legThickness / 2},${0}`,
            `0,${-(length / 1000) / 2 + legThickness / 2},${-raisedHeightHalf / 2}`,
            `${(width / 1000) / 2 - legThickness / 2 + diff / 2},${-(length / 1000) / 2 + legThickness / 2},${0}`,
            `${-(width / 1000) / 2 + legThickness / 2 - diff / 2},${(length / 1000) / 2 - legThickness / 2},${0}`,
            `0,${(length / 1000) / 2 - legThickness / 2},${-raisedHeightHalf / 2}`,
            `${(width / 1000) / 2 - legThickness / 2 + diff / 2},${(length / 1000) / 2 - legThickness / 2},${0}`,
        ]
        elems.map((elem, index) => {
            elem.parent = cloned.children[2].id
            WbWorld.instance.nodes.set(elem.id, elem)
            cloned.children[2].children.push(elem)
            elem.finalize()
            let pose = { 'id': elem.id, "scale": scaleTemplate[scales[index]].join(",") };
            webotsView._view.x3dScene._applyPoseToObject(pose, elem)
            pose = { 'id': elem.id, "translation": translations[index] };
            webotsView._view.x3dScene._applyPoseToObject(pose, elem)
        })
        {
            let pose = { 'id': cloned.children[2].id, "translation": `0,0,${raisedHeightHalf}` };
            webotsView._view.x3dScene._applyPoseToObject(pose, cloned.children[2])
        }
        webotsView._view.animation._view.x3dScene.render();
    }
    createConcrete = (instanceNumber) => {
        let self = this.instances[instanceNumber];
        if (self.bedType !== "Concrete") return
        let { webotsView, WbWorld } = this
        let cloned = this.getRootNode(instanceNumber)
        {
            let template = cloned.children[0].children[0]
            let pose = { 'id': template.id, "scale": `0,0,0` };
            webotsView._view.x3dScene._applyPoseToObject(pose, template)
        }
        let numSpaces = self.botLength / 1000;
        let numSupports = numSpaces + 1;
        let spacing = (self.botLength / 1000) / numSpaces;
        let js = [((-self.botWidth / 1000) / 2), ((self.botWidth / 1000) / 2)];
        let concretesuppport = cloned.children[0].children[1]
        let dragChainTemplate = cloned.children[0].children[2]
        for (let i = 0; i < numSupports;) {
            let y = (i * spacing) - ((self.botLength / 1000) / 2);
            for (let j = 0; j < 2; j++) {
                let location = [js[j], y, 0.01];
                let elem = concretesuppport.clone()
                elem.parent = cloned.children[3].id
                WbWorld.instance.nodes.set(elem.id, elem)
                cloned.children[3].children.push(elem)
                elem.finalize()
                let pose = { 'id': elem.id, "translation": location.join(",") };
                webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                pose = { 'id': elem.id, "scale": [1, 1, 1].join(",") };
                webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                if (j == 1) // right side
                {           // rotate it
                    let location = [0, 0, 1, 3.142];
                    pose = { 'id': elem.id, "rotation": location.join(",") };
                    webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                    let elem_ = dragChainTemplate.clone()
                    elem_.parent = cloned.children[3].id
                    WbWorld.instance.nodes.set(elem_.id, elem_)
                    cloned.children[3].children.push(elem_)
                    elem_.finalize()
                   // console.log("DRAGCHAIN:", elem_)
                    location = [js[j] + 0.008, y, 0.251];
                    pose = { 'id': elem_.id, "translation": location.join(",") };
                    webotsView._view.x3dScene._applyPoseToObject(pose, elem_)
                } else {
                    let location = [0, 0, 1, 0];
                    pose = { 'id': elem.id, "rotation": location.join(",") };
                    webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                }
            }
            i++;
        }
        let VSLOT = cloned.children[0].children[3]
        {
            let length = self.botLength
            let locations = [
                [js[0] - 0.015, -(length / 1000) / 2, 0.37], // left track
                [js[1] + 0.015, -(length / 1000) / 2, 0.37]// right track
            ]
            locations.map(location => {
                let elem_ = VSLOT.clone()
                elem_.parent = cloned.children[3].id
                WbWorld.instance.nodes.set(elem_.id, elem_)
                cloned.children[3].children.push(elem_)
                elem_.finalize()
                let scale = [1, 1, length / 1500];
                let pose = { 'id': elem_.id, "scale": scale.join(",") };
                webotsView._view.x3dScene._applyPoseToObject(pose, elem_)
                pose = { 'id': elem_.id, "translation": location.join(",") };
                webotsView._view.x3dScene._applyPoseToObject(pose, elem_)
            })
        }
        cloned.children[3]
        {
            let pose = { 'id': cloned.children[3].id, "translation": [0, 0, -0.05].join(",") };
            webotsView._view.x3dScene._applyPoseToObject(pose, cloned.children[3])
        }
        webotsView._view.animation._view.x3dScene.render();
    }
    /*
    * 2 for legs
    * 3 for concrete elements
    */
    createTransforms = (instanceNumber) => {
        let templateParent = this.getRootNode(instanceNumber)
        let template = templateParent.children[1]
        let numTransforms = 6
        Array.from(templateParent.children).slice(2).map((elem, index) => {
            const object = this.WbWorld.instance.nodes.get(elem.id);
            try {
                object.delete();
            } catch (error) { }
        })
        templateParent.children = templateParent.children.filter((elem, i) => parseInt(i) < 2)
        while (Array.from(templateParent.children).length < numTransforms) {
            let cloned = template.clone()
            cloned.parent = templateParent.id
            // delete children of cloned
            {
                Array.from(cloned.children.slice(0)).map((elem, index) => {
                    const object = this.WbWorld.instance.nodes.get(elem.id);
                    object.delete();
                    // delete cloned.children[parseInt(index)+1]
                    // cloned.children = cloned.children.filter((elem, i)=>parseInt(i) !== parseInt(index)+1)
                })
                cloned.children = cloned.children.filter((elem, i) => parseInt(i) < 0)
            }
            this.WbWorld.instance.nodes.set(cloned.id, cloned)
            templateParent.children.push(cloned)
           // console.log(cloned.children.length, cloned, template, templateParent)
            cloned.finalize()
        }
    }
    
    createSoilBed = (instanceNumber) => {
        let self = this.instances[instanceNumber]
        let bedType = self.bedType;
        let x = self.x
        let y = self.y
        let width = self.botWidth
        let length = self.botLength
        const webotsView = document.getElementsByTagName('webots-view')[0];
        this.webotsView = webotsView
        const WbWorld = webotsView._view.animation._view.x3dScene.WbWorld
        this.WbWorld = WbWorld
        let clonedId = self.rootNodeId // this is the parent
        const cloned = this.WbWorld.instance.nodes.get(clonedId);
        let soilInstance = cloned.children[1].children[0] // SOILTRANSFORM
        let soilInstanceId = soilInstance.id
        // delete all wooden elements, retain soil and plants
        {
            Array.from(cloned.children[1].children.slice(2)).map((elem, index) => {
                const object = this.WbWorld.instance.nodes.get(elem.id);
                object.delete();
            })
            cloned.children[1].children = cloned.children[1].children.filter((elem, i) => parseInt(i) < 2)
        }
        switch (bedType) {
            case "Wooden":
                {
                    let woodenBlock = cloned.children[0].children[0]
                    {
                        let template = cloned.children[0].children[0]
                        let pose = { 'id': template.id, "scale": `0,0,0` };
                        webotsView._view.x3dScene._applyPoseToObject(pose, template)
                    }
                    let woodenBlockB = woodenBlock.clone()
                    let woodenBlockF = woodenBlock.clone()
                    let woodenBlockL = woodenBlock.clone()
                    let woodenBlockR = woodenBlock.clone()
                    let diff = 2 * (25 - self.plankThickness) / 1000
                    let plankThicknessM = self.plankThickness / 1000
                    let soilDepthM = self.soilDepth / 1000
                    let soilTranslation;
                    let lowerTranslation;
                    if (!self.raised) {
                        soilTranslation = soilDepthM
                        lowerTranslation = 0;
                        soilDepthM *= (1 + 1)
                    } else {
                        soilTranslation = soilDepthM * (1.25)
                        lowerTranslation = soilDepthM
                        soilDepthM *= (1 + 1 + 1 / 4)
                    }
                    if (self.raised) {
                        let woodenBlockBottom = woodenBlock.clone()
                        woodenBlockBottom.parent = cloned.children[1].id
                        WbWorld.instance.nodes.set(woodenBlockBottom.id, woodenBlockBottom)
                        cloned.children[1].children.push(woodenBlockBottom)
                        woodenBlockBottom.finalize()

                        let pose = { 'id': woodenBlockBottom.id, "scale": `${(width / 1000) + diff},${(length / 1000)},${plankThicknessM}` };
                        webotsView._view.x3dScene._applyPoseToObject(pose, woodenBlockBottom)
                        pose = { 'id': woodenBlockBottom.id, "translation": `0,0,${lowerTranslation}` };
                        webotsView._view.x3dScene._applyPoseToObject(pose, woodenBlockBottom)
                        // raise the bed and create the legs
                        let raisedTranslation = self.raisedHeight / 1000 - (lowerTranslation - plankThicknessM / 2)
                        pose = { 'id': cloned.children[1].id, "translation": `0,0,${raisedTranslation}` };
                        webotsView._view.x3dScene._applyPoseToObject(pose, cloned.children[1])
                    } else {
                        let raisedTranslation = 0
                        let pose = { 'id': cloned.children[1].id, "translation": `0,0,${raisedTranslation}` };
                        webotsView._view.x3dScene._applyPoseToObject(pose, cloned.children[1])
                    }
                    let soilPose = { 'id': soilInstanceId, "translation": `0,0,${soilTranslation}` }; // check. we need to raise the whole up??
                    webotsView._view.x3dScene._applyPoseToObject(soilPose, soilInstance)
                    let elems = [woodenBlockB, woodenBlockF, woodenBlockL, woodenBlockR]
                    let scales = [
                        `${width / 1000 + plankThicknessM * 2 + diff},${plankThicknessM},${soilDepthM}`, `${plankThicknessM},${length / 1000},${soilDepthM}`
                    ]
                    let translations = [
                        `0,${-(length / 1000) / 2 - plankThicknessM / 2},${soilDepthM / 2}`,
                        `0,${(length / 1000) / 2 + plankThicknessM / 2},${soilDepthM / 2}`,
                        `${-(width / 1000) / 2 - plankThicknessM / 2 - diff / 2},0,${soilDepthM / 2}`,
                        `${(width / 1000) / 2 + plankThicknessM / 2 + diff / 2},0,${soilDepthM / 2}`
                    ]
                    elems.map((elem, index) => {
                        elem.parent = cloned.children[1].id
                        WbWorld.instance.nodes.set(elem.id, elem)
                        cloned.children[1].children.push(elem)
                        elem.finalize()
                        let pose = { 'id': elem.id, "scale": scales[parseInt(index / 2)] };
                        webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                        pose = { 'id': elem.id, "translation": translations[index] };
                        webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                    })
                    webotsView._view.animation._view.x3dScene.render();
                    // raise the soil if need be, if raised bed
                    let zOffset = -0.08
                    let xOffset = 0.01
                    {
                        let numSpaces = self.botLength / 1000;
                        let numSupports = numSpaces + 1;
                        let spacing = (self.botLength / 1000) / numSpaces;
                        let js = [((-self.botWidth / 1000) / 2 - diff / 2), ((self.botWidth / 1000) / 2 + diff / 2)];
                        let concretesuppport = cloned.children[0].children[1]
                        let dragChainTemplate = cloned.children[0].children[2]
                        for (let i = 0; i < numSupports;) {
                            let y = (i * spacing) - ((self.botLength / 1000) / 2);
                            for (let j = 0; j < 2; j++) {
                                let location = [js[j] + (j == 0 ? +1 : -1) * xOffset, y, 0.01 + zOffset];
                                let elem = concretesuppport.clone()
                                let tmp = WbWorld.instance.nodes.get(elem.children[0].id)
                                tmp.delete()
                                elem.children = [elem.children[1]]
                                elem.parent = cloned.children[1].id
                                WbWorld.instance.nodes.set(elem.id, elem)
                                cloned.children[1].children.push(elem)
                                elem.finalize()
                                let pose = { 'id': elem.id, "translation": location.join(",") };
                                webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                                pose = { 'id': elem.id, "scale": [1, 1, 1].join(",") };
                                webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                                if (j == 1) // right side
                                {           // rotate it
                                    let location = [0, 0, 1, 3.142];
                                    pose = { 'id': elem.id, "rotation": location.join(",") };
                                    webotsView._view.x3dScene._applyPoseToObject(pose, elem)

                                    let elem_ = dragChainTemplate.clone()
                                    elem_.parent = cloned.children[1].id
                                    WbWorld.instance.nodes.set(elem_.id, elem_)
                                    cloned.children[1].children.push(elem_)
                                    elem_.finalize()
                                   // console.log("DRAGCHAIN_s:", elem_)
                                    location = [js[j] + 0.008 - xOffset, y, 0.251 + zOffset];
                                    pose = { 'id': elem_.id, "translation": location.join(",") };
                                    webotsView._view.x3dScene._applyPoseToObject(pose, elem_)

                                } else {
                                    let location = [0, 0, 1, 0];
                                    pose = { 'id': elem.id, "rotation": location.join(",") };
                                    webotsView._view.x3dScene._applyPoseToObject(pose, elem)
                                }
                            }
                            i++;
                        }
                    }
                    {
                        let VSLOT = cloned.children[0].children[3]
                        let length = self.botLength
                        let js = [((-self.botWidth / 1000) / 2), ((self.botWidth / 1000) / 2)];
                        let locations = [
                            [js[0] - 0.015 + xOffset - diff / 2, -(length / 1000) / 2, 0.37 + zOffset], // left track
                            [js[1] + 0.015 - xOffset + diff / 2, -(length / 1000) / 2, 0.37 + zOffset]// right track
                        ]
                        locations.map(location => {
                            let elem_ = VSLOT.clone()
                            elem_.parent = cloned.children[1].id
                            WbWorld.instance.nodes.set(elem_.id, elem_)
                            cloned.children[1].children.push(elem_)
                            elem_.finalize()
                            let scale = [1, 1, length / 1500];
                            let pose = { 'id': elem_.id, "scale": scale.join(",") };
                            webotsView._view.x3dScene._applyPoseToObject(pose, elem_)
                            pose = { 'id': elem_.id, "translation": location.join(",") };
                            webotsView._view.x3dScene._applyPoseToObject(pose, elem_)
                        })
                    }
                }
                break;
            case "Concrete":
                let raisedTranslation = 0
                let pose = { 'id': cloned.children[1].id, "translation": `0,0,${raisedTranslation}` };
                webotsView._view.x3dScene._applyPoseToObject(pose, cloned.children[1])
                let soilPose = { 'id': soilInstanceId, "translation": `0,0,0.0001` };
                webotsView._view.x3dScene._applyPoseToObject(soilPose, soilInstance)
                break;
        }
    }
    initBot = (instanceNumber, params) => {
        let self = this.instances[instanceNumber]
        this.applyInstance(instanceNumber)
        if (self.botContoller) self.botContoller.destroy()
        self.botContoller = new farmbotController(this, params, instanceNumber)
    }
    /*
     * Get plant location
    */
    processPoints = (plantPoints, instanceNumber) => {
        let self = this.instances[instanceNumber]
        if (self.plants === undefined) {
            self.plants = {}
        }
        for (let i in self.plants) {
            self.plants[i]["deleted"] = true
        }
        plantPoints.map(item => {
            self.plants[item.id] = self.plants[item.id] || {}
            self.plants[item.id]["plantData"] = item
            self.plants[item.id]["deleted"] = false
        })
        let options = {
            botWidth: self.botWidth,
            botLength: self.botLength,
            date: new Date().toISOString(), // check. Needs to be read from somewhere
        }
        planter.place(this, options, instanceNumber)
        this.positionPlants(instanceNumber)
    }
    positionPlants = (instanceNumber) => {
        planter.positionPlants(this, instanceNumber)
    }
    emergencyStop = (instanceNumber) => {
        let self = this.instances[instanceNumber]
        self.movingRequestId++
    }
    moveRelative = (msg, instanceNumber) => {
        let self = this.instances[instanceNumber]
        try {
            msg = JSON.parse(msg)
        } catch (error) {

        }
        try {
            // msg.x *= 1000
            // msg.y *= 1000
            // msg.z *= 1000
            msg.z *= -1
            msg.x += self.location.x
            msg.y += self.location.y
            msg.z += self.location.z
            msg.x = Math.round(msg.x)
            msg.y = Math.round(msg.y)
            msg.z = Math.round(msg.z)
        } catch (error) { }
        this.moveBot(instanceNumber, false, msg, 'relative')
    }

    publishLogs = (finalLocation, relative, instanceNumber) => {
        let self = this.instances[instanceNumber]
        let logData = {
            /*"channels": [],
            "created_at": new Date().getTime().toString().slice(0, 10),
            "major_version": 15,
            "message": `Moving ${relative ? "relative " : ""}to (${finalLocation.x},${finalLocation.y},${finalLocation.z})`,
            "meta": {
                "assertion_passed": null,
                "assertion_type": null
            },
            "minor_version": 3,
            "patch_version": 3,
            "type": "info",
            "verbosity": 2,*/
            "x": Math.round(self.location.x),
            "y": Math.round(self.location.y),
            "z": Math.round(self.location.z)
        }

        self.botContoller.publishGeneralData(logData, 'logs')
    }
    moveAbsolute = (msg, instanceNumber) => {
        try {
            msg = JSON.parse(msg)
        } catch (error) {

        }
        try {
            // msg.x *= 1000
            // msg.y *= 1000
            // msg.z *= 1000
        } catch (error) { }
        msg.x = Math.round(msg.x)
        msg.y = Math.round(msg.y)
        msg.z = Math.round(msg.z)
        let immediate = msg.immediate || false
        this.moveBot(instanceNumber, immediate, msg, 'absolute')
    }
}
export const angelBot = new angelBot_();