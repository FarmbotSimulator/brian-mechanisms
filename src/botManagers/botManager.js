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
    setBotConfig(botConfig) {
        this.botConfig = botConfig
        let apis = Object.values(botConfig.controllers.Cloud).filter(item => item.type === "API").map(item => item.url)
        let proxies = Object.values(botConfig.controllers.Cloud).filter(item => item.type === "proxy").map(item => item.url)
        this.apis = [...new Set(apis)] // unique
        this.proxies = [...new Set(proxies)]
        if (typeof this.controller === 'undefined') this.controller = botConfig.controller
        if (typeof this.API === 'undefined') this.API = this.apis[0]
        if (typeof this.proxy === 'undefined') this.proxy = this.proxies[0]
        if (typeof this.speedFactor === 'undefined') this.speedFactor = 1
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
        appManager.updateParam("speedFactor", 1)
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
        farmBot.bedTypes = siblingBot.bedTypes
        farmBot.canRaise = siblingBot.canRaise
        farmBot.raised = siblingBot.raised
        farmBot.plantHeight = siblingBot.plantHeight
        farmBot.plantHeightLimits = siblingBot.plantHeightLimits
        farmBot.proxy = siblingBot.proxy
        farmBot.API = siblingBot.API
        farmBot.apis = siblingBot.apis
        farmBot.proxies = siblingBot.proxies
        farmBot.controller = siblingBot.controller
        farmBot.email = siblingBot.email
        farmBot.speedFactor = siblingBot.speedFactor
        this.continueCopyFromFromModel(appManager, sibling)
    }
    _getSizeParamsFromModel(appManager, farmBot) {
        let gardenX, gardenY, botLength, botWidth
        gardenX = appManager.gardenLocation.x
        gardenY = appManager.gardenLocation.y
        botWidth = appManager.botSize.width
        botLength = appManager.botSize.length
        let { botType, botModel } = appManager
        let { bedTypes, raised, canRaise, bedType, plantHeight, plantHeightLimits, API, proxy, apis, proxies, controller, email, speedFactor } = farmBot
        return { gardenX, gardenY, botLength, botWidth, plantHeight, botType, botModel, canRaise, bedType, bedTypes, raised, plantHeightLimits, API, proxy, apis, proxies, controller, email, speedFactor }
    }
    updateParamForModel(farmBot, param, val) {
        farmBot[param] = val
    }
}