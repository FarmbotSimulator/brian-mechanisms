import farmBot from "../botManagers/farmBot"
const FarmBot = farmBot // for eval
import farmBotMod from "../botManagers/farmBotMod"
const FarmBotMod = farmBotMod
import bMCableBot from "../botManagers/bMCableBot"
const BMCableBot = bMCableBot // for eval
import brianMechanism from "../botManagers/brianMechanism"
const BrianMechanism = brianMechanism // for eval
const botTypes = require("../../store/botTypes.json");
export default class appManager {
    constructor() {
        this.parent = null
        this.gardenLocation = {
            x: 0, y: 0
        }
        this.botSize = {
            width: 0, length: 0
        }
        this.workspaceSize = {
            width: 0, length: 0
        }
        this.plantHeight = 0
    }
    setParent(parent) {
        this.parent = parent
    }
    setHelper(helper) {
        this.helper = helper
    }
    init() {
        let parent = this.parent
        this.gardenLocation.x = parent.x
        this.gardenLocation.y = parent.y
        this.botSize.width = parent.botWidth
        this.botSize.length = parent.botLength
        this.workspaceSize.width = parent.workSpaceWidth
        this.workspaceSize.length = parent.workSpaceLength
        // this.plantHeight = parent.plantHeight
        this.botType = ""
        this.botModel = ""
    }
    copyFrom(sibling) {
        // if (typeof this.copyFromFromModel !== 'undefined') return this.copyFromFromModel(sibling)
        // this.parent.application  = sibling.application
        // this.gardenLocation.x = sibling.x
        // this.gardenLocation.y = sibling.y
        // this.botSize.width = sibling.width
        // this.botSize.length = sibling.length
        // this.workspaceSize.width = sibling.width
        // this.workspaceSize.length = sibling.length
        this.gardenLocation.x = sibling.gardenLocation.x
        this.gardenLocation.y = sibling.gardenLocation.y
        this.botSize.width = sibling.botSize.width =
        this.botSize.length = sibling.botSize.length
        this.workspaceSize.width = sibling.workspaceSize.width 
        this.workspaceSize.length = sibling.workspaceSize.length

        this.botType = sibling.botType
        if (typeof sibling.bot !== 'undefined' && sibling.bot) this.initBot(sibling)
    }
    getSizeParams() {
        if (typeof this.getSizeParamsFromModel !== 'undefined') return this.getSizeParamsFromModel(this, this.bot)
        let gardenX, gardenY, botLength, botWidth
        gardenX = this.gardenLocation.x
        gardenY = this.gardenLocation.y
        botWidth = this.botSize.width
        botLength = this.botSize.length
        let { botType, botModel/*, plantHeight */} = this
        return { gardenX, gardenY, botLength, botWidth,/* plantHeight,*/ botType, botModel }
    }
    updateParam(param, val) { // only on _appManager
        switch (param) {
            case "gardenX":
                this.gardenLocation.x = val
                break;
            case "gardenY":
                this.gardenLocation.y = val
                break;
            case "botWidth":
                this.botSize.width = val
                break;
            case "botLength":
                this.botSize.length = val
                break;
            // case "plantHeight":
            //     this.plantHeight = val
                break;
            case "botType":
                this.botType = val
                this.botModel = (this.parent.appManager && this.parent.appManager.botType === this.botType) ? this.parent.appManager.botModel : ""
                this.initBot()
                break;
            case "botModel":
                this.botModel = val
                this.bot.changeModel()
                break;
            default:
                if (typeof this.updateParamForModel !== 'undefined') this.updateParamForModel(this.bot, param, val)
        }
    }
    initBot(sibling) {
        let botManagerName = this.botType.replace(/ /g, '')
        this.bot = eval(`new ${botManagerName}()`)
        this.bot.setBotConfig(botTypes[this.botType])
        this.bot.setAppManager(this)
        if (sibling) {
            this.bot.copyFromFromModel(this, sibling)
        }
    }
    // check. start here.... Even cloud controllers should have different types
    // And proxies should have different types
    initBotController = (instanceNumber, params, proxyUrl) => {
        this.parent.applyInstance()
        if (this.botContoller) this.botContoller.destroy()
        self.botContoller = new farmbotController(this, params, instanceNumber)
    }

}