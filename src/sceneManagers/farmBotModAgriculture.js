import agriculture from "./agriculture"

export default class farmBotModAgriculture extends agriculture {
    constructor() {
        super()
    }
    // return the transform that has the robot
    // is different for every bot
    getRobotSNode() {
        this.deleteExcessModels(1)
        let rootNode = this.WbWorld.instance.nodes.get(this.rootNodeId)
        return rootNode.children[1].children[1].children[1]
    }
    resizeGarden() {
        // calculate length & width
        const cloned = this.getThisRootNode()
        const appManager = super.appManager || this.appManager
        let { bedType, numGantries, zAxesperGantry } = appManager.bot
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        this.resizeGarden_(botLength * numGantries, botWidth * zAxesperGantry)
        if (true || bedType === "Concrete") { // why? Oh why the condition
            this.applyTransformation(cloned.children[0], "scale", [0, 0, 0])
        }
        this.createSoilBed_(zAxesperGantry, numGantries);
        this.createTransforms_(zAxesperGantry, numGantries)
        this.createLegs_(zAxesperGantry, numGantries)
        this.createConcrete_(zAxesperGantry, numGantries)
        this.placeRobotZLocation()
        this.resizeRobot()
        this.cloneGantries()
        this.moveBot(true)
        //     this.positionPlants(instanceNumber)
    }
    resizeRobot() {
        let { appManager } = this
        let { bot } = appManager
        let { bedType, raised, raisedHeight, plankThickness, soilDepth, plantHeight, zAxesperGantry, numGantries } = bot,
            width = appManager.botSize.width * parseInt(zAxesperGantry),
            length = appManager.botSize.length * parseInt(numGantries),
            botWidth = appManager.botSize.width * parseInt(zAxesperGantry),
            botLength = appManager.botSize.length * parseInt(numGantries)
        let { rightGantryColumn, leftGantryColumn, gantryBeam, CrossSlideNCo, zAxisNUTM, zAxis, CrossSlideNCoParent } = this.getRobotParts(0)
        {
            this.applyTransformation(gantryBeam, "scale", [1, 1, (botWidth * 4.65) / 3000])
            this.applyTransformation(gantryBeam, "translation", [botWidth / (2 * 1000), gantryBeam.translation.y, /*gantryBeam.translation.z*/0.8 + (plantHeight - 500) / 1000])
        }
        {
            this.applyTransformation(rightGantryColumn, "translation", [botWidth / (2 * 1000), 0, 0])
            this.applyTransformation(rightGantryColumn.children[0], "scale", [1, 1, (650 + plantHeight - 500) / 650]) /// len = 650 mm
            this.applyTransformation(rightGantryColumn.children[12], "translation", [0.012, -0.132, 0.067 + (plantHeight - 500) / 1000])
        }
        {
            this.applyTransformation(leftGantryColumn, "translation", [-botWidth / (2 * 1000), 0, 0])
            this.applyTransformation(leftGantryColumn.children[0], "scale", [1, 1, (650 + plantHeight - 500) / 650]) /// len = 650 mm
            this.applyTransformation(leftGantryColumn.children[12], "translation", [-0.011, 0.001, 0.06 + (plantHeight - 500) / 1000])
        }

        {
            let zAxisLen = 500 + plantHeight
            this.applyTransformation(zAxis, "scale", [1, 1, zAxisLen / 750]) // length is 75cm, but it ought to have been 1 m
        }
        this.applyTransformation(CrossSlideNCo, "translation", [0, 0, -botWidth * zAxesperGantry / (2 * 1000)]) // take it to origin
        {
            // let { zAxesperGantry } = bot
            // let { CrossSlideNCoParent } = this.getRobotParts(0)
            // remove any extra children
            {
                Array.from(CrossSlideNCoParent.children.slice(1)).map((elem, index) => {
                    const object = this.WbWorld.instance.nodes.get(elem.id);
                    object.delete();
                })
                CrossSlideNCoParent.children = CrossSlideNCoParent.children.filter((elem, i) => parseInt(i) < 1)
            }
            for (let i = 1; i < zAxesperGantry; i++) { //clone crossSlieNCos
                let zAxisClone = CrossSlideNCo.clone()
                zAxisClone.parent = CrossSlideNCoParent.id
                this.WbWorld.instance.nodes.set(zAxisClone.id, zAxisClone)
                CrossSlideNCoParent.children.push(zAxisClone)
                zAxisClone.finalize()
                // position it
                this.applyTransformation(zAxisClone, "translation", [0, 0, ((-botWidth * zAxesperGantry / 2) + (i * (botWidth / zAxesperGantry))) / (1000)]) // take it to origin
            }
        }
        this.webotsView._view.x3dScene.render();
    }
    cloneGantries() {
        let { appManager } = this
        let { bot } = appManager
        let { numGantries } = bot
        let { getRobotSNode, robotNodeZeroTransform } = this.getRobotParts(0)
        // remove extraGantries
        {
            Array.from(getRobotSNode.children.slice(1)).map((elem, index) => {
                const object = this.WbWorld.instance.nodes.get(elem.id);
                object.delete();
            })
            getRobotSNode.children = getRobotSNode.children.filter((elem, i) => parseInt(i) < 1)
        }
        for (let i = 1; i < numGantries; i++) {
            let gantry = robotNodeZeroTransform.clone()
            gantry.parent = getRobotSNode.id
            this.WbWorld.instance.nodes.set(gantry.id, gantry)
            getRobotSNode.children.push(gantry)
            gantry.finalize()
        }
        this.webotsView._view.x3dScene.render();
    }
    getRobotParts(root = 0, secondRoot = 0) {
        let getRobotSNode = this.getRobotSNode();
        let rightGantryColumn = this.getDescendantNode(getRobotSNode, [root, 0])
        let leftGantryColumn = this.getDescendantNode(getRobotSNode, [root, 1])
        let gantryBeam = this.getDescendantNode(getRobotSNode, [root, 2, 0])
        let CrossSlideNCo = this.getDescendantNode(getRobotSNode, [root, 2, 1, secondRoot])
        let CrossSlideNCoParent = this.getDescendantNode(getRobotSNode, [root, 2, 1])
        let zAxisNUTM = this.getDescendantNode(getRobotSNode, [root, 2, 1, secondRoot, 1])
        let zAxis = this.getDescendantNode(getRobotSNode, [root, 2, 1, secondRoot, 1, 0])
        let robotNodeZeroTransform = this.getDescendantNode(getRobotSNode, [root])
        return { getRobotSNode, rightGantryColumn, leftGantryColumn, gantryBeam, CrossSlideNCo, zAxisNUTM, zAxis, robotNodeZeroTransform, CrossSlideNCoParent }
    }
    placeRobotZLocation() { // gantry
        let { getRobotSNode, CrossSlideNCoParent } = this.getRobotParts()//this.getRobotSNode()
        let { appManager } = this
        let { bot, orientation } = appManager
        let { bedType } = bot
        let z
        if (bedType === "Concrete") {
            z = 0.05
        }
        else z = 0.02
        this.applyTransformation(getRobotSNode, "translation", [0, 0, z]) // what's the proble here?
        this.webotsView._view.x3dScene.render();
    }

    moveBot(immediate = false, location, motionType = 'dontcare') { // move all gantries and their children... 
        let { appManager } = this
        let { bot, controller } = appManager
        let { numGantries, zAxesperGantry } = bot
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { zAxis, getRobotSNode, CrossSlideNCo, zAxisNUTM, robotNodeZeroTransform } = this.getRobotParts(0) // check
        location = location || {}
        let { x, y, z, speed } = location // in meters
        x = typeof x === 'number' ? x : bot.location.x
        y = typeof y === 'number' ? y : bot.location.y
        z = typeof z === 'number' ? z : bot.location.z
        speed = speed || bot.location.speed
        speed *= bot.speedFactor
        let movingRequestId = ++this.movingRequestId
        // calculate limits
        let zAxisLen = zAxis.scale.z * 0.75
        let zAxisLenMax = zAxisLen - 0.35
        let limits = {                                  // in mm
            x: [-botWidth * zAxesperGantry / 2000, (((-botWidth * zAxesperGantry) + botWidth) / 2000) - 0.2],
            y: [(-botLength * numGantries / 2000), (((-botLength * numGantries) + botLength) / 2000) - 0.2],
            z: [0, zAxisLenMax],
        }
        let premits = { x, y, z }
        let offsets = { x: -botWidth * zAxesperGantry / 2, y: (-botLength * numGantries / 2), z: 0 }
        for (let key in limits) { limits[key] = limits[key].map(item => (item * 1000) - offsets[key]) }
        if (x < limits["x"][0]) x = limits["x"][0]
        else if (x > limits["x"][1]) x = limits["x"][1]
        if (y < limits["y"][0]) y = limits["y"][0]
        else if (y > limits["y"][1]) y = limits["y"][1]
        if (z < limits["z"][0]) z = limits["z"][0]
        else if (z > limits["z"][1]) z = limits["z"][1]
        if (immediate) {
            // this.applyTransformation(CrossSlideNCo, "translation", [0, 0, (-botWidth / 2000) + x / 1000])
            // this.applyTransformation(getRobotSNode, "translation", [0, (-botLength / 2000) + y / 1000, getRobotSNode.translation.z])
            // this.applyTransformation(zAxisNUTM, "translation", [-z / 1000, 0, 0])
            this.applyCrossSlideTransform(x)
            this.applyGantryTransform(y);
            this.applyZAxisTransform(z);
            bot.location.x = x
            bot.location.y = y
            bot.location.z = z
            this.webotsView._view.x3dScene.render();
        } else {// from the server. Joystick control will use immediate mode
            let currentX = CrossSlideNCo.translation.z - (-botWidth * zAxesperGantry / 2000)
            let currentY = robotNodeZeroTransform.translation.y - (-botLength * numGantries / 2000)
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

            let timeStep = 1 / 10 // in secs n frames per sec
            let loggedTime = 0
            let logInterval = 0.5    // every 5 seconds
            let movingInterval = setInterval(() => {
                if (this.movingRequestId != movingRequestId) {
                    clearInterval(movingInterval)
                    controller.publishLogs({ x, y, z }, motionType === 'relative')
                    return
                }
                currentX = CrossSlideNCo.translation.z - (-botWidth * zAxesperGantry / 2000) // in meters
                currentY = robotNodeZeroTransform.translation.y - (-botLength * numGantries / 2000)
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
                    x1 = x
                    y1 = y
                    z1 = z
                    this.movingRequestId++ // to clear interval
                }
                this.applyCrossSlideTransform(x1)
                this.applyGantryTransform(y1);
                this.applyZAxisTransform(z1);
                bot.location.x = x1
                bot.location.y = y1
                bot.location.z = z1
                //checking for the last step
                this.webotsView._view.x3dScene.render();
                // every two seconds and at the end
                if (isLastStep || loggedTime >= logInterval) {
                    controller.publishLogs({ x, y, z }, motionType === 'relative')
                    loggedTime = 0
                } else loggedTime += timeStep

            }, timeStep * 1000)
            // send back location log every 5 seconds
        }

    }
    applyZAxisTransform(z1) {
        let { appManager } = this
        let { bot } = appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { bedType, numGantries, zAxesperGantry } = bot
        for (let j = 0; j < numGantries; j++) {
            for (let i = 0; i < zAxesperGantry; i++) {
                let { zAxis, getRobotSNode, CrossSlideNCo, zAxisNUTM } = this.getRobotParts(j, i)
                this.applyTransformation(zAxisNUTM, "translation", [-z1 / 1000, 0, 0])
            }
        }
    }
    applyGantryTransform(y1) {
        let { appManager } = this
        let { bot } = appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { bedType, numGantries, zAxesperGantry } = bot
        for (let i = 0; i < numGantries; i++) {
            let { zAxis, getRobotSNode, CrossSlideNCo, zAxisNUTM, robotNodeZeroTransform } = this.getRobotParts(i)
            this.applyTransformation(robotNodeZeroTransform, "translation", [0, ((-botLength * numGantries / 2) + y1 + (i * (botLength))) / 1000, robotNodeZeroTransform.translation.z])
        }
    }

    applyCrossSlideTransform(x1) {
        let { appManager } = this
        let { bot } = appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { bedType, numGantries, zAxesperGantry } = bot
        for (let j = 0; j < numGantries; j++)
            for (let i = 0; i < zAxesperGantry; i++) {
                let { zAxis, getRobotSNode, CrossSlideNCo, zAxisNUTM } = this.getRobotParts(j, i)// I see where the problem is
                this.applyTransformation(CrossSlideNCo, "translation", [0, 0, ((-botWidth * zAxesperGantry / 2) + x1 + (i * (botWidth))) / 1000])
            }
    }
}