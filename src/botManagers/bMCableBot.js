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
        let ret = super._getSizeParamsFromModel(appManager, farmBot)
        let { numCableSets} = farmBot
        ret.numCableSets = numCableSets
        return ret;
    }
    continueCopyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot
        let siblingBot = sibling.bot
        farmBot.numCableSets = siblingBot.numCableSets
    }
}