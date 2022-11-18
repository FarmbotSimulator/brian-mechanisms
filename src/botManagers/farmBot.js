import botManager from "./botManager"
export default class farmBot extends botManager {
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
        this.bedType = ""
    }
    getSizeParamsFromModel(appManager, farmBot) {
        let gardenX, gardenY, botLength, botWidth
        gardenX = appManager.gardenLocation.x
        gardenY = appManager.gardenLocation.y
        botWidth = appManager.botSize.width
        botLength = appManager.botSize.length
        let {  botType, botModel } = appManager
        let { bedTypes, raised, canRaise, bedType, plantHeight, plantHeightLimits } = farmBot
        return { gardenX, gardenY, botLength, botWidth, plantHeight, botType, botModel, canRaise, bedType, bedTypes, raised, plantHeightLimits }
    }
    continueCopyFromFromModel(appManager, sibling) {
    }
    updateParamForModel(farmBot, param, val) {
        farmBot[param] = val
    }

}