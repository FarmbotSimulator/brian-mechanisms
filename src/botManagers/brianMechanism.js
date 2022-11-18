import botManager from "./botManager"
export default class brianMechanism extends botManager {
    constructor() {
        super()
    }
    continuechangeModel() {
        let botModelParams = this.botModelParams()
        let { bedTypes,orientation } = botModelParams
        this.bedTypes = bedTypes.map(item => {
            if (item === "W") return "Wooden"
            if (item === "C") return "Cable"
        })
        this.orientation = orientation
    }
    getSizeParamsFromModel(appManager, farmBot) {
        let gardenX, gardenY, botLength, botWidth
        gardenX = appManager.gardenLocation.x
        gardenY = appManager.gardenLocation.y
        botWidth = appManager.botSize.width
        botLength = appManager.botSize.length
        let { botType, botModel, bedType } = appManager
        let { bedTypes, raised, orientation, canRaise, plantHeight } = farmBot
        return { gardenX, gardenY, botLength, botWidth, plantHeight, botType, botModel, canRaise, bedType, bedTypes, raised, orientation }
    }
    // copyFromFromModel(appManager, sibling) {
    //     let farmBot = appManager.bot
    //     let siblingBot = sibling.bot
    //     appManager.botModel = sibling.botModel
    //     farmBot.bedType = siblingBot.bedType
    //     farmBot.canRaise = siblingBot.canRaise
    //     farmBot.raised = siblingBot.raised
    //     farmBot.orientation = siblingBot.orientation
    // }
    continueCopyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot
        let siblingBot = sibling.bot
        farmBot.orientation = siblingBot.orientation
    }
    updateParamForModel(farmBot, param, val) {
        farmBot[param] = val
    }

}