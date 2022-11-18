import botManager from "./botManager"
export default class bMCableBot extends botManager {
    constructor() {
        super()
    }
    continuechangeModel() {
        let botModelParams = this.botModelParams()
        let {bedTypes, numCableSets } = botModelParams
        this.bedTypes = bedTypes.map(item => {
            if (item === "W") return "Wooden"
            if (item === "N") return "None"
        })
        this.numCableSets = numCableSets
    }
    getSizeParamsFromModel(appManager, farmBot) {
        let gardenX, gardenY, botLength, botWidth
        gardenX = appManager.gardenLocation.x
        gardenY = appManager.gardenLocation.y
        botWidth = appManager.botSize.width
        botLength = appManager.botSize.length
        let { botType, botModel } = appManager
        let { numCableSets, bedTypes, raised, canRaise, bedType, plantHeight } = farmBot
        return { gardenX, gardenY, botLength, botWidth, plantHeight, botType, botModel, canRaise, bedType, bedTypes, raised, numCableSets }
    }
    // copyFromFromModel(appManager, sibling) {
    //     let farmBot = appManager.bot
    //     let siblingBot = sibling.bot
    //     appManager.botModel = sibling.botModel
    //     farmBot.bedType = siblingBot.bedType
    //     farmBot.canRaise = siblingBot.canRaise
    //     farmBot.raised = siblingBot.raised
    //     farmBot.numCableSets = siblingBot.numCableSets
    // }
    continueCopyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot
        let siblingBot = sibling.bot
        farmBot.numCableSets = siblingBot.numCableSets
    }
    updateParamForModel(farmBot, param, val) {
        farmBot[param] = val
    }

}