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
        let ret = super._getSizeParamsFromModel(appManager, farmBot)
        return ret;
    }
    continueCopyFromFromModel(appManager, sibling) {
    }

}