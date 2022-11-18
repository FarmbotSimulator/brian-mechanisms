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
        let ret = super._getSizeParamsFromModel(appManager, farmBot)
        let { orientation} = farmBot
        ret.orientation = orientation
        return ret;
    }
    continueCopyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot
        let siblingBot = sibling.bot
        farmBot.orientation = siblingBot.orientation
    }
}