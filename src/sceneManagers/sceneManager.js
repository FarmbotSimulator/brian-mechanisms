import farmBotAgriculture from "./farmBotAgriculture"
const FarmBotAgriculture = farmBotAgriculture // for eval

export default class sceneManager {
    async getSceneManager(appManager) {
        return new Promise((resolve, reject) => {
            let { application } = appManager.parent
            let { botType } = appManager
            botType = botType.replace(/ /g, '')
            application = application.replace(/ /g, '')
            let sceneManagerName = `${botType}${application}`
            let sceneManager;
            try {
                let prevSceneManager = appManager.sceneManager
                let prevSceneManagerName;
                if (typeof prevSceneManager !== 'undefined') {
                    prevSceneManagerName = prevSceneManager.name
                }
                if (sceneManagerName === prevSceneManagerName) {
                    sceneManager = prevSceneManager
                }
                else sceneManager = eval(`new ${sceneManagerName}()`)
                sceneManager.name = sceneManagerName
                appManager.sceneManager = sceneManager
                resolve(sceneManager)
            } catch (error) {
                console.log(error)
                reject('Failed to start scene manager')
            }
        })
    }
}