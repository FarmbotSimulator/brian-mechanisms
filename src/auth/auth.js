
import FarmbotCloud from "./FarmbotCloud"
const FarmBotCloud = FarmbotCloud // for eval

export default class auth {
    async getAuth(appManager) {
        return new Promise((resolve, reject) => {
            let { controller, authenticationServer, authenticationServerUrl, email } = appManager.bot
            if (controller !== "Cloud") { // we can't handler that here
                return reject(`Unsupported controller ${controller}`)
            }

            let tmp = authenticationServer.replace(/ /g, '');
            let auth
            try{
                auth = eval(`new ${tmp}()`)
            }catch(error){
                return reject(`Unsupported Authentication Server ${authenticationServer}`)
            }
            auth.authenticationServerUrl = authenticationServerUrl
            auth.email = email
            resolve(auth)
        })
    }

}