/* Copyright 2020 Brian Onang'o
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import mqtt from 'mqtt'

export default class FarmbotProxy {
    constructor() {
        console.log("starting proxy...")
        this.askForPlantInterval = null
    }
    /**
     * connect to MQTT Broker
     *
     * @returns {Promise} A promise that is resolved with mqtt instance if connection is successful or rejected with the error
     */
     async connect(password) {
        let broker = this.controlServerUrl
        let {email} = this.parent.bot
        let userName = email
        console.log({email, broker})
        return new Promise((resolve, reject) => {
            const client = mqtt.connect(broker, {
                clean: true,
                // clientId: `FBJS-${Farmbot.VERSION}-${genUuid()}`,
                password: password,
                protocolId: "MQIsdp",
                protocolVersion: 3,
                // reconnectPeriod,
                username: userName,
            });
            this.client = client

            client.on("error", function (error) {
                reject(error)
            })
            client.on("connect", async () => {
                console.log("connected")
                client.subscribe(`${userName}`, {
                    qos: 1
                });
                this.askCurrentLocation()
                resolve(client)
            })
            client.on("message", (wholeTopic, message) => {
                if (wholeTopic === userName) {
                    client.unsubscribe(userName);
                    this.botId = message.toString()
                    let topic = `/` + this.botId + `/#`
                    client.subscribe(topic, { qos: 1 })
                    this.askForPlantLocations()
                    this.askForPlantInterval = setInterval(() => {
                        this.askForPlantLocations()
                    }, 10000)
                }
                let msg = message.toString()

                switch (wholeTopic.split("/")[2]) {
                    case "SET":
                        let setWhat = wholeTopic.split("/")[3];
                        switch (setWhat) {
                            case "points":
                                this.parent.processPoints(JSON.parse(msg), instanceNumber) // check
                                break;
                        }
                        break;
                    case "move_relative":
                        this.parent.moveRelative(JSON.parse(msg), instanceNumber)  // check
                        break;
                    case "move_absolute":
                        this.parent.moveAbsolute(JSON.parse(msg), instanceNumber)  // check
                        break;
                    case "emergency_lock":
                        this.parent.emergencyStop(instanceNumber)
                        break;
                }
            })
        })
    }
    askCurrentLocation() {
        let topic = `/${this.botId}/CURRENTLOCATION`
        this.client.publish(topic, JSON.stringify({}))
    }
    updateLocation() { // check... We may  
        let self = this.parent.instances[this.instanceNumber] // where to we save the x,y,z?
        let logData = {
            "x": Math.round(self.location.x),
            "y": Math.round(self.location.y),
            "z": Math.round(self.location.z)
        }
        this.publishGeneralData(logData, 'logs')
    }
    publishGeneralData(msgData, msgType) {
        if (typeof msgData === 'object') {
            msgData = JSON.stringify(msgData);
        }
        // let topic = `/${this.botId}/BOT/bot/${this.botId}/${msgType}` // passthrough
        let topic = `/${this.botId}/LOCATION`
        this.client.publish(topic, msgData)

    }

    askForPlantLocations() {
        this.client.publish(`/${this.botId}/GET`, "points") // work out this one
    }

    // sendLocationData(location) {

    // }


    destroy() {
        try {
            clearTimeout(this.askForPlantInterval)
            this.client.end()
        } catch (error) { }
    }
    
}