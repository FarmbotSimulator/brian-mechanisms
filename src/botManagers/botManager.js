export default class botManager {
    constructor() {
        this.appManager = null
    }
    setAppManager(appManager) {
        this.appManager = appManager
        try {
            appManager.copyFromFromModel = this.copyFromFromModel
            appManager.getSizeParamsFromModel = this.getSizeParamsFromModel
            appManager.updateParamForModel = this.updateParamForModel
        } catch (error) {

        }
    }
    botModelParams() {
        let { appManager } = this
        return appManager.helper.botModelParams(appManager.botType, appManager.botModel)
    }
    changeModel() {
        let { appManager } = this
        let botModelParams = this.botModelParams()
        let { Length, Width, canRaise, plantHeightLimits } = botModelParams
        let plantHeight = botModelParams["Plant Height"]
        appManager.updateParam("botLength", Length)
        appManager.updateParam("botWidth", Width)
        appManager.updateParam("plantHeight", plantHeight)
        appManager.updateParam("plantHeightLimits", plantHeightLimits)
        this.canRaise = canRaise
        this.raised = true
        this.bedType = ""
        this.continuechangeModel()
    }
    copyFromFromModel(appManager, sibling) {
        let farmBot = appManager.bot 
        let siblingBot = sibling.bot
        appManager.botModel = sibling.botModel
        farmBot.bedType = siblingBot.bedType
        farmBot.canRaise = siblingBot.canRaise
        farmBot.raised = siblingBot.raised
        farmBot.plantHeightLimits = siblingBot.plantHeightLimits
        this.continueCopyFromFromModel(appManager, sibling)
    }
}