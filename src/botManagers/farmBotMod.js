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
        let ret = super._getSizeParamsFromModel(appManager, farmBot)
        let { numGantries, zAxesperGantry} = farmBot
        ret.numGantries = numGantries
        ret.zAxesperGantry = zAxesperGantry
        return ret;
    }
    continueCopyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot
        let siblingBot = sibling.bot
        farmBot.numGantries = siblingBot.numGantries
        farmBot.zAxesperGantry = siblingBot.zAxesperGantry
    }
}