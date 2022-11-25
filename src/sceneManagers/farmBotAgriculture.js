import agriculture from "./agriculture"

export default class farmBotAgriculture extends agriculture {
    constructor() {
        super()
    }
    // return the transform that has the robot
    // is different for every bot
    getRobotSNode() {
        let rootNode = this.WbWorld.instance.nodes.get(this.rootNodeId)
        return rootNode.children[1].children[1].children[1]
    }
    resizeGarden() {
        console.log("require resize");
        // calculate length & width
        const cloned = this.getThisRootNode()
        const appManager = super.appManager || this.appManager
        let { bedType } = appManager.bot
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        this.resizeGarden_(botLength, botWidth)
        if (true || bedType === "Concrete") { // why? Oh why the condition
            this.applyTransformation(cloned.children[0], "scale", [0, 0, 0])
        }
        this.createSoilBed_();
        this.createTransforms_()
        this.createLegs_()
        this.createConcrete_()
        this.placeRobotZLocation()
        this.resizeRobot()
        this.moveBot(true)
        //     this.positionPlants(instanceNumber)
    }
    resizeRobot() {
        let { appManager } = this
        let { bot } = appManager
        let { bedType, raised, raisedHeight, plankThickness, soilDepth, plantHeight } = bot,
            width = appManager.botSize.width,
            length = appManager.botSize.length,
            botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { rightGantryColumn, leftGantryColumn, gantryBeam, CrossSlideNCo, zAxisNUTM, zAxis } = this.getRobotParts()
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

        this.applyTransformation(CrossSlideNCo, "translation", [0, 0, -botWidth / (2 * 1000)]) // take it to origin
        {
            let zAxisLen = 500 + plantHeight
            this.applyTransformation(zAxis, "scale", [1, 1, zAxisLen / 750]) // length is 75cm, but it ought to have been 1 m
        }
        this.webotsView._view.x3dScene.render();
    }
    getRobotParts() {
        let getRobotSNode = this.getRobotSNode();
        let rightGantryColumn = this.getDescendantNode(getRobotSNode, [0, 0])
        let leftGantryColumn = this.getDescendantNode(getRobotSNode, [0, 1])
        let gantryBeam = this.getDescendantNode(getRobotSNode, [0, 2, 0])
        let CrossSlideNCo = this.getDescendantNode(getRobotSNode, [0, 2, 1, 0])
        let zAxisNUTM = this.getDescendantNode(getRobotSNode, [0, 2, 1, 0, 1])
        let zAxis = this.getDescendantNode(getRobotSNode, [0, 2, 1, 0, 1, 0])
        return { getRobotSNode, rightGantryColumn, leftGantryColumn, gantryBeam, CrossSlideNCo, zAxisNUTM, zAxis }
    }
    placeRobotZLocation() { // gantry
        let getRobotSNode = this.getRobotSNode()
        let { appManager } = this
        let { bot, orientation } = appManager
        let { bedType } = bot
        let z
        if (bedType === "Concrete") {
            z = 0.05
        }
        else z = 0.02
        this.applyTransformation(getRobotSNode, "translation", [0, 0, z])
    }

    moveBot(immediate = false, location, motionType = 'dontcare') {
        let { appManager } = this
        let { bot } = appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { zAxis, getRobotSNode, CrossSlideNCo, zAxisNUTM } = this.getRobotParts()
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
            x: [-botWidth / 2000, (botWidth / 2000) - 0.2],
            y: [(-botLength / 2000), (botLength / 2000) - 0.2],
            z: [0, zAxisLenMax],
        }
        let premits = { x, y, z }
        let offsets = { x: -botWidth / 2, y: (-botLength / 2), z: 0 }
        for (let key in limits) { limits[key] = limits[key].map(item => (item * 1000) - offsets[key]) }
        if (x < limits["x"][0]) x = limits["x"][0]
        else if (x > limits["x"][1]) x = limits["x"][1]
        if (y < limits["y"][0]) y = limits["y"][0]
        else if (y > limits["y"][1]) y = limits["y"][1]
        if (z < limits["z"][0]) z = limits["z"][0]
        else if (z > limits["z"][1]) z = limits["z"][1]
        // console.log({ premits, limits, x, y, z })

        if (immediate) {
            this.applyTransformation(CrossSlideNCo, "translation", [0, 0, (-botWidth / 2000) + x / 1000])
            this.applyTransformation(getRobotSNode, "translation", [0, (-botLength / 2000) + y / 1000, getRobotSNode.translation.z])
            this.applyTransformation(zAxisNUTM, "translation", [-z / 1000, 0, 0])
            bot.location.x = x
            bot.location.y = y
            bot.location.z = z
            this.webotsView._view.x3dScene.render();
        } else {// from the server. Joystick control will use immediate mode
            let currentX = CrossSlideNCo.translation.z - (-botWidth / 2000)
            let currentY = getRobotSNode.translation.y - (-botLength / 2000)
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
                if (this.movingRequestId != movingRequestId) {
                    clearInterval(movingInterval)
                    this.publishLogs({ x, y, z }, motionType === 'relative', instanceNumber)
                    return
                }
                currentX = CrossSlideNCo.translation.z - (-botWidth / 2000) // in meters
                currentY = getRobotSNode.translation.y - (-botLength / 2000)
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
                    this.movingRequestId++ // to clear interval
                }
                // console.log({ x1, y1, z1, x, y, z })
                this.applyTransformation(CrossSlideNCo, "translation", [0, 0, (-botWidth / 2000) + x1 / 1000])
                this.applyTransformation(getRobotSNode, "translation", [0, (-botLength / 2000) + y1 / 1000, getRobotSNode.translation.z])
                this.applyTransformation(zAxisNUTM, "translation", [-z1 / 1000, 0, 0])
                bot.location.x = x1
                bot.location.y = y1
                bot.location.z = z1
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
}