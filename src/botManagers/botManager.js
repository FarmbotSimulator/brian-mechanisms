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
        let authenticationServers = botConfig.controllers.Cloud["Authentication Server"]
        let controlServers = botConfig.controllers.Cloud["Control Server"]
        this.controlServers = controlServers
        this.authenticationServers = authenticationServers
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
        appManager.updateParam("raisedHeight", 750)
        appManager.updateParam("raised", true)
        this.canRaise = canRaise
        this.plankThickness = 18
        this.soilDepth = 100
        this.raised = true
        this.bedType = ""
        this.legs = {
            width: 100,
            length: 100,
        }
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
        farmBot.raisedHeight = siblingBot.raisedHeight
        farmBot.plantHeight = siblingBot.plantHeight
        farmBot.plantHeightLimits = siblingBot.plantHeightLimits
        farmBot.proxy = siblingBot.proxy
        farmBot.legs = siblingBot.legs
        farmBot.plankThickness = siblingBot.plankThickness
        farmBot.soilDepth = siblingBot.soilDepth

        farmBot.authenticationServers = siblingBot.authenticationServers
        farmBot.authenticationServer = siblingBot.authenticationServer
        farmBot.authenticationServerUrl = siblingBot.authenticationServerUrl
        farmBot.controlServers = siblingBot.controlServers
        farmBot.controlServer = siblingBot.controlServer
        farmBot.controlServerUrl = siblingBot.controlServerUrl

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
        let { bedTypes, raised, canRaise, raisedHeight, bedType, plantHeight, plantHeightLimits, controlServers, authenticationServer, authenticationServerUrl, controlServer, controlServerUrl, authenticationServers, controller, email, speedFactor } = farmBot
        return { gardenX, gardenY, botLength, botWidth, plantHeight, botType, botModel, canRaise, bedType, bedTypes, raised, raisedHeight, authenticationServer, authenticationServerUrl, controlServerUrl, controlServer, plantHeightLimits, controlServers, authenticationServers, controller, email, speedFactor }
    }
    updateParamForModel(farmBot, param, val) {
        farmBot[param] = val
    }
}