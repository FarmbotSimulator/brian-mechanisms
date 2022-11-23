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
        //     this.resizeRobot(instanceNumber)
        //     this.moveBot(instanceNumber, true)
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
            this.applyTransformation(gantryBeam, "scale", [1, 1, (botWidth * 4.65) / 3000])
            this.applyTransformation(gantryBeam, "translation", [botWidth / (2 * 1000), gantryBeam.translation.y, /*gantryBeam.translation.z*/0.8 + (plantHeight - 500) / 1000])
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
        let { bot } = appManager
        let { bedType } = bot
        let z
        if (bedType === "Concrete") {
            z = 0.05
        }
        else z = 0.02
        this.applyTransformation(getRobotSNode, "translation", [0, 0, z])
    }
    // createSoilBed(){
    //     this.createSoilBed_()
    // }
    // createTransforms(){
    //     this.createTransforms_()
    // }
}