import agriculture from "./agriculture"

export default class bMCableBotAgriculture extends agriculture {
    constructor() {
        super()
        let boxLen = 100
        let holderRadius = 150
        this.centerCenter = holderRadius + boxLen / 2 // mm
        this.boxLen = boxLen
    }
    // return the transform that has the robot
    // is different for every bot
    getRobotSNode() {
        let rootNode = this.WbWorld.instance.nodes.get(this.rootNodeId)
        this.deleteExcessModels(2)
        return rootNode.children[1].children[1].children[1]
    }
    resizeGarden() {
        const appManager = super.appManager || this.appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        this.resizeGarden_(botLength, botWidth)
        this.createTransforms_()
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
        let { WbWorld } = this
        let { getRobotSNode, poleNco, poleTransform, cableholder, cable1, cable2, box } = this.getRobotParts(0)
        if (getRobotSNode.children.length > 2) { //check if other poles already exist

        }
        else {
            for (let i = 0; i < 3; i++) {
                let poleNcoCLone = poleNco.clone()
                poleNcoCLone.parent = poleNco.parent
                let poleNcoParent = WbWorld.instance.nodes.get(poleNco.parent)
                WbWorld.instance.nodes.set(poleNcoCLone.id, poleNcoCLone)
                poleNcoParent.children.push(poleNcoCLone)
                poleNcoCLone.finalize()
            }
           this.applyTransformation(box, "translation", [0, 0, cableholder.translation.z])
        }

        this.positionPoles()
    }
    getRobotParts(root = 0) {
        root += 1
        let getRobotSNode = this.getRobotSNode();
        let poleNco = this.getDescendantNode(getRobotSNode, [root]) // this is what we want to duplicate
        let poleTransform = this.getDescendantNode(getRobotSNode, [root, 0]) // scale to change height. Initial height =2m. Also the z transform
        let cableholder = this.getDescendantNode(getRobotSNode, [root, 1]) // z, rotation
        let cableZeroTransform = this.getDescendantNode(getRobotSNode, [root, 1, 0]) // rotate z 
        let cableSubZeroTransform = this.getDescendantNode(getRobotSNode, [root, 1, 0, 0]) //  Len translation x
        let cable1 = this.getDescendantNode(getRobotSNode, [root, 1, 0, 0, 0]) // Cable Len translation x, scale z
        let cable2 = this.getDescendantNode(getRobotSNode, [root, 1, 0, 0, 1]) // Cable Len 
        let box = this.getDescendantNode(getRobotSNode, [0]) // only one box 
        let zAxis = this.getDescendantNode(getRobotSNode, [0, 1])
        return { getRobotSNode, poleNco, poleTransform, cableholder, cable1, cable2, box, cableZeroTransform, cableSubZeroTransform, zAxis }
    }
    positionPoles() {
        let { appManager } = this
        let { bot, controller } = appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let locations = [
            [-botWidth / 2000, -botLength / 2000, 0],
            [botWidth / 2000, -botLength / 2000, 0],
            [botWidth / 2000, botLength / 2000, 0],
            [-botWidth / 2000, botLength / 2000, 0]
        ]
        for (let i = 0; i < 4; i++) {
            let { poleNco } = this.getRobotParts(i)
            this.applyTransformation(poleNco, "translation", locations[i])
        }
    }

    moveBot(immediate = false, location, motionType = 'dontcare') {
        let { appManager } = this
        let { bot, controller } = appManager
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        let { getRobotSNode, box, zAxis } = this.getRobotParts(0)
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
            x: [(-botWidth / 2000) + this.centerCenter / 1000, (botWidth / 2000) - this.centerCenter / 1000],
            y: [(-botLength / 2000) + this.centerCenter / 1000, (botLength / 2000) - this.centerCenter / 1000],
            z: [0, zAxisLenMax],
            // z: [0, 0],
        }
        let premits = { x, y, z }
        let offsets = { x: (-botWidth / 2) + this.centerCenter, y: (-botLength / 2) + this.centerCenter, z: 0 }
        for (let key in limits) { limits[key] = limits[key].map(item => (item * 1000) - offsets[key]) }
        if (x < limits["x"][0]) x = limits["x"][0]
        else if (x > limits["x"][1]) x = limits["x"][1]
        if (y < limits["y"][0]) y = limits["y"][0]
        else if (y > limits["y"][1]) y = limits["y"][1]
        if (z < limits["z"][0]) z = limits["z"][0]
        else if (z > limits["z"][1]) z = limits["z"][1]

        if (immediate) { // ck
            console.log({ premits, x, y, z, limits })
            this.moveAxes(x, y, z)
            bot.location.x = x
            bot.location.y = y
            bot.location.z = z
            this.webotsView._view.x3dScene.render();
        } else {// from the server. Joystick control will use immediate mode
            let currentX = box.translation.x - (-botWidth / 2000) - this.centerCenter / 1000
            let currentY = box.translation.y - (-botLength / 2000) - this.centerCenter / 1000
            let currentZ = 0 //- zAxisNUTM.translation.x // ck
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
                    controller.publishLogs({ x, y, z }, motionType === 'relative') // take from controllers
                    return
                }
                currentX = box.translation.x - (-botWidth / 2000) - this.centerCenter / 1000 // in meters
                currentY = box.translation.y - (-botLength / 2000) - this.centerCenter / 1000
                currentZ = 0//- zAxisNUTM.translation.x // ck
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
                // if (directionZ === -1 && z1 < z) isLastStep = true // ck
                // else if (directionZ === 1 && z1 > z) isLastStep = true // ck
                if (isLastStep) {
                    x1 = x
                    y1 = y
                    z1 = z
                    this.movingRequestId++ // to clear interval
                }
                this.moveAxes(x1, y1, z1)
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

    moveAxes(x, y, z) {
        let { getRobotSNode, poleNco, poleTransform, cableholder, cable1, cable2, box, cableZeroTransform, cableSubZeroTransform, zAxis } = this.getRobotParts(0)
        const appManager = super.appManager || this.appManager
        // let { bedType } = appManager.bot
        let botWidth = appManager.botSize.width,
            botLength = appManager.botSize.length
        console.log("moving to ...", x, y, z)
        let x_ = x + this.centerCenter, y_ = y + this.centerCenter, z_ = z // center of box; with offsets applied
        this.applyTransformation(box, "translation", [(-botWidth / 2 + x_) / 1000, (-botLength / 2 + y_) / 1000, cableholder.translation.z])
        this.applyTransformation(zAxis, "translation", [-z / 1000, 0, 0])
        let xes = [
            x_ - this.boxLen / 2,
            x_ + this.boxLen / 2,
            x_ + this.boxLen / 2,
            x_ - this.boxLen / 2 // corners
        ] // in mm
        xes = xes.map(elem => elem + (-botWidth / 2))
        let yes = [
            y_ - this.boxLen / 2,
            y_ - this.boxLen / 2,
            y_ + this.boxLen / 2,
            y_ + this.boxLen / 2 // corners
        ] // in mm
        yes = yes.map(elem => elem + (-botLength / 2))
        for (let i = 0; i < 4; i++) {
            let { getRobotSNode, poleNco, cable1, cable2, cableZeroTransform, cableSubZeroTransform } = this.getRobotParts(i)
            let cableLen = Math.sqrt(Math.pow(xes[i] - poleNco.translation.x * 1000, 2) + Math.pow(yes[i] - poleNco.translation.y * 1000, 2))
            cableLen /= 1000
            this.applyTransformation(cable1, "scale", [1, 1, cableLen / 5]) // initial len is 5m
            this.applyTransformation(cable2, "scale", [1, 1, cableLen / 5]) // initial len is 5
            this.applyTransformation(cableSubZeroTransform, "translation", [(cableLen) / 2, 0, 0])
            let ango = Math.atan((yes[i] - poleNco.translation.y * 1000) / (xes[i] - poleNco.translation.x * 1000))
            switch (i) {
                case 1:
                    ango = Math.PI + ango // Angle is negative
                    break
                case 2:
                    ango = Math.PI + ango // angle is positive
                    break
                case 3:
                    ango = ango // angle is negative
                    break
            }

            this.applyTransformation(cableZeroTransform, "rotation", [0, 0, 1, ango])
        }
    }

}