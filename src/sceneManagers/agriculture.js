import wbWorld from "./wbWorld.js"
const wbWorld_ = new wbWorld()

const plantShapes = {
    "corn-mustard-1": {
        shapeId: 4
    }
}

export default class agriculture /*extends wbWorld*/ {
    constructor() {
        let parentFuncs = Object.getOwnPropertyNames(Object.getPrototypeOf(wbWorld_))
        parentFuncs = parentFuncs.filter(name => (name !== 'constructor' && typeof wbWorld_[name] === 'function'));
        parentFuncs.map(func => { this[func] = wbWorld_[func] })
        const webotsView = document.getElementsByTagName('webots-view')[0];
        const WbWorld = webotsView._view.animation._view.x3dScene.WbWorld
        this.webotsView = webotsView
        this.WbWorld = WbWorld
        this.createdWorkspace = false
        this.movingRequestId = 0
    }
    createWorkspace() {
        if (!this.createdWorkspace) {
            // this.addSelector() // check
            const { webotsView, WbWorld } = this;
            let GARDENCONTAINER = this.getRootNode() // firstTransform from the bottom
            let useNode = GARDENCONTAINER.children[0]
            // let soilId = useNode.id
            let clonedId = ``;
            let cloned = useNode.clone();
            clonedId = cloned.id
            this.rootNodeId = clonedId
            cloned.parent = GARDENCONTAINER.id
            WbWorld.instance.nodes.set(clonedId, cloned)
            GARDENCONTAINER.children.push(cloned)
            cloned.finalize();
            // delete the other children
        }
        this.createdWorkspace = true
        this.resizeGarden()
        return
    }

    getSoilTransform() {
        let rootNode = this.getThisRootNode()
        return rootNode.children[1].children[0]
    }
    getThisRootNode() {
        let clonedId = this.rootNodeId // this is the parent
        return this.WbWorld.instance.nodes.get(clonedId);
    }

    resizeGarden_(botLength, botWidth) {
        const cloned = this.getThisRootNode()
        let { appManager } = this
        let { orientation } = appManager
        this.applyTransformation(cloned, "translation", [appManager.gardenLocation.y / 1000, appManager.gardenLocation.x / 1000, 0])
        this.applyTransformation(cloned, "scale", [1, 1, 1])
        this.applyTransformation(cloned, "rotation", [0, 0, 1, this.degrees_to_radians(orientation)])
        console.log({ cloned })
        let soilInstance = this.getSoilTransform() // SOILTRANSFORM
        let stringList = `${botWidth / 1000},${botLength / 1000}`.replace(/,/g, ' ').split(/\s/).filter(element => element);
        stringList = stringList.map(element => parseFloat(element));
        let elem = soilInstance.children[0].geometry
        elem.size = new this.WbWorld.instance.viewpoint.WbVector2(stringList[0], stringList[1]);;
        elem.updateSize()
        this.webotsView._view.animation._view.x3dScene.render();
    }
    createSoilBed_(widthMux = 1, lenMux = 1, initer = false) {
        let { appManager } = this
        let { bot } = appManager
        let { bedTypes, bedType, raised, raisedHeight, plankThickness, soilDepth } = bot,
            width = appManager.botSize.width * widthMux,
            length = appManager.botSize.length * lenMux,
            botWidth = appManager.botSize.width * widthMux,
            botLength = appManager.botSize.length * lenMux
        if (typeof bedType === undefined || bedType === '') bedTypes = bedTypes[0]
        const { webotsView, WbWorld } = this
        const cloned = this.getThisRootNode()
        let soilInstance = this.getSoilTransform() // SOILTRANSFORM
        // delete all wooden elements, retain soil and plants
        {
            Array.from(cloned.children[1].children.slice(2)).map((elem, index) => {
                const object = this.WbWorld.instance.nodes.get(elem.id);
                object.delete();
            })
            cloned.children[1].children = cloned.children[1].children.filter((elem, i) => parseInt(i) < 2)
        }
        if (initer) {
            this.applyTransformation(soilInstance, "translation", [0, 0, 0.0001])
            return
        }
        switch (bedType) {
            case "Wooden":
                {
                    let woodenBlock = cloned.children[0].children[0]
                    {
                        let template = cloned.children[0].children[0]
                        this.applyTransformation(template, "scale", [0, 0, 0])
                    }
                    let woodenBlockB = woodenBlock.clone()
                    let woodenBlockF = woodenBlock.clone()
                    let woodenBlockL = woodenBlock.clone()
                    let woodenBlockR = woodenBlock.clone()
                    let diff = 2 * (25 - plankThickness) / 1000
                    let plankThicknessM = plankThickness / 1000
                    let soilDepthM = soilDepth / 1000
                    let soilTranslation;
                    let lowerTranslation;
                    if (!raised) {
                        soilTranslation = soilDepthM
                        lowerTranslation = 0;
                        soilDepthM *= (1 + 1)
                    } else {
                        soilTranslation = soilDepthM * (1.25)
                        lowerTranslation = soilDepthM
                        soilDepthM *= (1 + 1 + 1 / 4)
                    }
                    if (raised) {
                        let woodenBlockBottom = woodenBlock.clone()
                        woodenBlockBottom.parent = cloned.children[1].id
                        WbWorld.instance.nodes.set(woodenBlockBottom.id, woodenBlockBottom)
                        cloned.children[1].children.push(woodenBlockBottom)
                        woodenBlockBottom.finalize()
                        this.applyTransformation(woodenBlockBottom, "scale", [(width / 1000) + diff, (length / 1000), plankThicknessM])
                        this.applyTransformation(woodenBlockBottom, "translation", [0, 0, lowerTranslation])
                        // raise the bed and create the legs
                        let raisedTranslation = raisedHeight / 1000 - (lowerTranslation - plankThicknessM / 2)
                        this.applyTransformation(cloned.children[1], "translation", [0, 0, raisedTranslation])
                    } else {
                        let raisedTranslation = 0
                        this.applyTransformation(cloned.children[1], "translation", [0, 0, raisedTranslation])
                    }
                    this.applyTransformation(soilInstance, "translation", [0, 0, soilTranslation])
                    let elems = [woodenBlockB, woodenBlockF, woodenBlockL, woodenBlockR]
                    let scales = [
                        [width / 1000 + plankThicknessM * 2 + diff, plankThicknessM, soilDepthM], [plankThicknessM, length / 1000, soilDepthM]
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
                        this.applyTransformation(elem, "scale", scales[parseInt(index / 2)])
                        this.applyTransformation(elem, "translation", translations[index])
                    })
                    webotsView._view.animation._view.x3dScene.render();
                    // raise the soil if need be, if raised bed
                    let zOffset = -0.08
                    let xOffset = 0.01
                    {
                        let numSpaces = botLength / 1000;
                        let numSupports = numSpaces + 1;
                        let spacing = (botLength / 1000) / numSpaces;
                        let js = [((-botWidth / 1000) / 2 - diff / 2), ((botWidth / 1000) / 2 + diff / 2)];
                        let concretesuppport = cloned.children[0].children[1]
                        let dragChainTemplate = cloned.children[0].children[2]
                        for (let i = 0; i < numSupports;) {
                            let y = (i * spacing) - ((botLength / 1000) / 2);
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
                                this.applyTransformation(elem, "translation", location)
                                this.applyTransformation(elem, "scale", [1, 1, 1])
                                if (j == 1) // right side
                                {           // rotate it
                                    let location = [0, 0, 1, 3.142];
                                    this.applyTransformation(elem, "rotation", location)

                                    let elem_ = dragChainTemplate.clone()
                                    elem_.parent = cloned.children[1].id
                                    WbWorld.instance.nodes.set(elem_.id, elem_)
                                    cloned.children[1].children.push(elem_)
                                    elem_.finalize()
                                    location = [js[j] + 0.008 - xOffset, y, 0.251 + zOffset];
                                    this.applyTransformation(elem_, "translation", location)

                                } else {
                                    let location = [0, 0, 1, 0];
                                    this.applyTransformation(elem, "rotation", location)
                                }
                            }
                            i++;
                        }
                    }
                    {
                        let VSLOT = cloned.children[0].children[3]
                        let length = botLength
                        let js = [((-botWidth / 1000) / 2), ((botWidth / 1000) / 2)];
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
                            this.applyTransformation(elem_, "scale", scale)
                            this.applyTransformation(elem_, "translation", location)
                        })
                    }
                }
                break;
            case "Concrete":
                let raisedTranslation = 0
                this.applyTransformation(cloned.children[1], "translation", [0, 0, raisedTranslation])
                this.applyTransformation(soilInstance, "translation", [0, 0, 0.0001])
                break;
        }
    }
    /*
    * 2 for legs
    * 3 for concrete elements
    */
    createTransforms_() {
        let templateParent = this.getThisRootNode()
        let template = templateParent.children[1]
        let numTransforms = 6
        Array.from(templateParent.children).slice(2).map((elem, index) => {
            const object = this.WbWorld.instance.nodes.get(elem.id);
            try {
                object.delete();
            } catch (error) { console.log(error) }
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
            cloned.finalize()
        }
    }
    createLegs_(widthMux = 1, lenMux = 1) {
        let { appManager } = this
        let { bot } = appManager
        let { bedType, raised, raisedHeight, plankThickness, legs } = bot,
            width = appManager.botSize.width * widthMux,
            length = appManager.botSize.length * lenMux,
            botWidth = appManager.botSize.width * widthMux,
            botLength = appManager.botSize.length * lenMux
        if (bedType !== "Wooden" || !raised) return
        let { webotsView, WbWorld } = this
        let cloned = this.getThisRootNode()
        let woodenBlock = cloned.children[0].children[0]
        let woodenBlockBL = woodenBlock.clone()
        let woodenBlockBM = woodenBlock.clone()
        let woodenBlockBR = woodenBlock.clone()
        let woodenBlockFL = woodenBlock.clone()
        let woodenBlockFM = woodenBlock.clone()
        let woodenBlockFR = woodenBlock.clone()
        let legThickness = legs.width / 1000
        let diff = 2 * (25 - plankThickness) / 1000
        let elems = [woodenBlockBL, woodenBlockBM, woodenBlockBR, woodenBlockFL, woodenBlockFM, woodenBlockFR]
        let scaleTemplate = [
            [legThickness, legThickness, raisedHeight / 1000],
            [width / 1000 - 2 * legThickness + diff, legThickness, legThickness]
        ]
        let scales = [
            0, 1, 0, 0, 1, 0
        ]
        let raisedHeightHalf = (raisedHeight / 1000) / 2
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
            this.applyTransformation(elem, "scale", scaleTemplate[scales[index]])
            this.applyTransformation(elem, "translation", translations[index])
        })
        {
            this.applyTransformation(cloned.children[2], "translation", [0, 0, raisedHeightHalf])
        }
    }

    createConcrete_(widthMux = 1, lenMux = 1) {
        let { appManager } = this
        let { bot } = appManager
        let { bedType, raised, raisedHeight, plankThickness, legs } = bot,
            width = appManager.botSize.width * widthMux,
            length = appManager.botSize.length * lenMux,
            botWidth = appManager.botSize.width * widthMux,
            botLength = appManager.botSize.length * lenMux
        if (bedType !== "Concrete") return
        let { webotsView, WbWorld } = this
        let cloned = this.getThisRootNode()
        {
            let template = cloned.children[0].children[0]
            this.applyTransformation(template, "scale", [0, 0, 0])
        }
        let numSpaces = botLength / 1000;
        let numSupports = numSpaces + 1;
        let spacing = (botLength / 1000) / numSpaces;
        let js = [((-botWidth / 1000) / 2), ((botWidth / 1000) / 2)];
        let concretesuppport = cloned.children[0].children[1]
        let dragChainTemplate = cloned.children[0].children[2]
        for (let i = 0; i < numSupports;) {
            let y = (i * spacing) - ((botLength / 1000) / 2);
            for (let j = 0; j < 2; j++) {
                let location = [js[j], y, 0.01];
                let elem = concretesuppport.clone()
                elem.parent = cloned.children[3].id
                WbWorld.instance.nodes.set(elem.id, elem)
                cloned.children[3].children.push(elem)
                elem.finalize()
                this.applyTransformation(elem, "translation", location)
                this.applyTransformation(elem, "scale", [1, 1, 1])
                if (j == 1) // right side
                {           // rotate it
                    let location = [0, 0, 1, 3.142];
                    this.applyTransformation(elem, "rotation", location)
                    let elem_ = dragChainTemplate.clone()
                    elem_.parent = cloned.children[3].id
                    WbWorld.instance.nodes.set(elem_.id, elem_)
                    cloned.children[3].children.push(elem_)
                    elem_.finalize()
                    location = [js[j] + 0.008, y, 0.251];
                    this.applyTransformation(elem_, "translation", location)
                } else {
                    let location = [0, 0, 1, 0];
                    this.applyTransformation(elem, "rotation", location)
                }
            }
            i++;
        }
        let VSLOT = cloned.children[0].children[3]
        {
            let length = botLength
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
                this.applyTransformation(elem_, "scale", scale)
                this.applyTransformation(elem_, "translation", location)
            })
        }
        cloned.children[3]
        {
            this.applyTransformation(cloned.children[3], "translation", [0, 0, -0.05])
        }
        // webotsView._view.animation._view.x3dScene.render();
    }
    moveRelative(msg) {
        let { appManager } = this
        let { bot } = appManager
        try {
            msg = JSON.parse(msg)
        } catch (error) {

        }
        try {
            msg.z *= -1
            msg.x += bot.location.x
            msg.y += bot.location.y
            msg.z += bot.location.z
            msg.x = Math.round(msg.x)
            msg.y = Math.round(msg.y)
            msg.z = Math.round(msg.z)
        } catch (error) { }
        this.moveBot(false, msg, 'relative')
    }
    emergencyStop() {
        this.movingRequestId++
    }

    moveAbsolute(msg) {
        try {
            msg = JSON.parse(msg)
        } catch (error) {

        }
        try {
        } catch (error) { }
        msg.x = Math.round(msg.x)
        msg.y = Math.round(msg.y)
        msg.z = Math.round(msg.z)
        let immediate = msg.immediate || false
        this.moveBot(immediate, msg, 'absolute')
    }
    processPoints(plantPoints) {
        let { appManager } = this
        let { bot } = appManager,
            width = appManager.botSize.width,
            length = appManager.botSize.length,
            botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        if (this.plants === undefined) {
            this.plants = {}
        }
        for (let i in this.plants) {
            this.plants[i]["deleted"] = true
        }
        plantPoints.map(item => {
            this.plants[item.id] = this.plants[item.id] || {}
            this.plants[item.id]["plantData"] = item
            this.plants[item.id]["deleted"] = false
        })
        let options = {
            botWidth: botWidth,
            botLength: botLength,
            date: new Date().toISOString(), // check. Needs to be read from somewhere
        }
        this.place(options)
        this.positionPlants()
    }
    place(options) {
        let points = this.plants
        let missingPoints = Object.values(points).filter(item => item.nodeId === undefined)
        missingPoints.map(item => {
            let { planted_at, plant_stage, x, y, z, name, pointer_type, id } = item.plantData
            let nodeId;
            nodeId = this.placeGeneric(name)
            if (nodeId) points[id]["nodeId"] = nodeId
        })
        this.webotsView._view.x3dScene.render();
    }
    getPlantShapeId(plantName) {
        if (Object.keys(plantShapes).includes(plantName)) {
            return plantShapes[plantName].shapeId
        } else {
            return Object.values(plantShapes).slice(-1)[0].shapeId
        }
    }
    placeGeneric(plantName) {
        let cloned = this.getRootNode()
        let shapeId = this.getPlantShapeId(plantName)
        console.log({ cloned })
        let Corn = this.getDescendantNode(cloned, [0, 0, 4]) //cloned.children[0].children[shapeId]
        let elem = Corn.clone()
        elem.parent = cloned.children[1].children[1].id
        this.WbWorld.instance.nodes.set(elem.id, elem)
        cloned.children[1].children[1].children.push(elem)
        elem.finalize()
        this.applyTransformation(elem, "scale", [0.0001, 0.0001, 0.0001])
        return elem.id
    }

    removeDeleted() {
        let points = this.plants
        if (points === undefined) return
        Object.values(points).map(item => {
            let { nodeId, deleted } = item
            if (deleted) {
                let object = this.WbWorld.instance.nodes.get(nodeId)
                let objectId = object.id
                let parentId = object.parent
                let parentObj = this.WbWorld.instance.nodes.get(parentId)
                object.delete();
                parentObj.children = parentObj.children.filter((elem, i) => elem.id !== objectId)
                delete this.plants[nodeId]
            }
        })
        this.webotsView._view.animation._view.x3dScene.render();
    }

    // move to each
    // move settings to json
    positionPlants() {
        let { appManager } = this,
            botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let points = this.plants
        if (points === undefined) return
        Object.values(points).map(item => {
            let { nodeId } = item
            let { x, y } = item.plantData
            x = parseFloat(x)
            y = parseFloat(y)
            let tmpItem = this.WbWorld.instance.nodes.get(nodeId)
            if (tmpItem === undefined) return
            this.applyTransformation(tmpItem, "translation", [(y - botWidth / 2) / 1000, (x - botLength / 2) / 1000, 0])
            this.applyTransformation(tmpItem, "scale", [0.01, 0.01, 0.01])
        })
        this.webotsView._view.x3dScene.render();
        this.removeDeleted()
    }
}
