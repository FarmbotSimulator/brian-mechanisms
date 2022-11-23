
import keyboard from "./keyboard"
const Keyboard = keyboard // for eval
import joystick from "./joystick"
const Joystick = joystick // for eval
import FarmbotProxy from "./FarmbotProxy"
const FarmBotProxy = FarmbotProxy // for eval

export default class controller {
    async getController(appManager) {
        return new Promise((resolve, reject) => {
            let { controller, controlServer, controlServerUrl } = appManager.bot
            let controller_, tmp
            if (controller !== "Cloud") {
                try {
                    tmp = controller[0].toUpperCase() + controller.slice(1)
                    controller_ = eval(`new ${tmp}()`)
                } catch (error) {
                    return reject(`Unsupported controller ${controller}`)
                }
            } else {
                tmp = controlServer.replace(/ /g, '');
                try {
                    controller_ = eval(`new ${tmp}()`)
                } catch (error) {
                    return reject(`Unsupported control Server ${controlServer}`)
                }
            }
            controller_.controlServerUrl = controlServerUrl
            controller_.parent = appManager
            resolve(controller_)
        })
    }

}