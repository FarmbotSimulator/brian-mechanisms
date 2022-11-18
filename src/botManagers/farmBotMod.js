import botManager from "./botManager"
export default class farmBotMod extends botManager {
    constructor() {
        super()
    }
    continuechangeModel() {
        let botModelParams = this.botModelParams()
        let { bedTypes } = botModelParams
        this.bedTypes = bedTypes.map(item => {
            if (item === "W") return "Wooden"
            if (item === "C") return "Concrete"
        })
        this.numGantries = 2
        this.zAxesperGantry = 2
    }
    getSizeParamsFromModel(appManager, farmBot) {
        let gardenX, gardenY, botLength, botWidth
        gardenX = appManager.gardenLocation.x
        gardenY = appManager.gardenLocation.y
        botWidth = appManager.botSize.width
        botLength = appManager.botSize.length
        let { botType, botModel } = appManager
        let { numGantries, zAxesperGantry, bedTypes, raised, canRaise, bedType, plantHeight } = farmBot
        return { gardenX, gardenY, botLength, botWidth, plantHeight, botType, botModel, canRaise, bedType, bedTypes, raised, numGantries, zAxesperGantry }
    }
    // copyFromFromModel(appManager, sibling) {
    //     let farmBot = appManager.bot 
    //     let siblingBot = sibling.bot
    //     appManager.botModel = sibling.botModel
    //     farmBot.bedType = siblingBot.bedType
    //     farmBot.canRaise = siblingBot.canRaise
    //     farmBot.raised = siblingBot.raised
    //     farmBot.numGantries = siblingBot.numGantries
    //     farmBot.zAxesperGantry = siblingBot.zAxesperGantry
    // }
    continueCopyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot
        let siblingBot = sibling.bot
        farmBot.numGantries = siblingBot.numGantries
        farmBot.zAxesperGantry = siblingBot.zAxesperGantry
    }
    updateParamForModel(farmBot, param, val) {
        farmBot[param] = val
    }

}