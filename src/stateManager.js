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
"use strict";
/**
 * @module statemanager
 */
import mqtt from 'mqtt'
import axios from 'axios'
import to from 'await-to-js'

// const FARMBOTURL = "https://my.farmbot.io/api"; // FamBot REST API

export class statemanager {
    // /*
    //  * simulates uptime. Starts updating on successful log in
    //  */

    // uptime = 0;
    // /*
    //  *  updates uptime
    //  */
    // timer;
    // /*
    //  *  mqtt broker as contained in unencoded FarmBot token
    //  */
    // broker;
    // /*
    //  *  FarmBot authorization token
    //  */
    // token;
    // /*
    //  *  Id of FarmBot device as contained in unencoded FarmBot token
    //  */
    // botId;
    // /*
    //  *  If device is online
    //  */
    // deviceOnline = false;
    // /*
    //  *  If other clients connected
    //  */
    // otherClients = false;
    // /*
    //  *  mqtt connection status
    //  */
    // mqttStatus = false;
    // /*
    //  *  FarmBotUserEnv
    //  */
    // userEnv = {};
    // /*
    //  *  end effector location
    //  */
    // location = {
    //     x: 0,
    //     y: 0,
    //     z: 0
    // };

    botInstances = {

    };

    /**
     * Constructor
     * @param {Object} options
     * @param {function} options.events - event emitter
     * @param {boolean} options.debug - display debug messages
     * @param {number} options.port - port to communicate with Mathematica simulation application
     */
    constructor(options = {}) {
        this.events = options.events;
        this.debug = options.debug || false;
        this.port = options.port || 8787

        /*
         * simulates uptime. Starts updating on successful log in
         */
        this.uptime = 0;
        /*
         *  updates uptime
         */
        this.timer = null;
        /*
         *  mqtt broker as contained in unencoded FarmBot token
         */
        this.broker = null;
        /*
         *  FarmBot authorization token
         */
        this.token = null;

        this.botId = null;
        /*
         *  If device is online
         */
        this.deviceOnline = false;
        /*
         *  If other clients connected
         */
        this.otherClients = false;
        /*
         *  mqtt connection status
         */
        this.mqttStatus = false;
        /*
         *  FarmBotUserEnv
         */
        this.userEnv = {};
        /*
         *  end effector location
         */
        this.location = {
            x: 0,
            y: 0,
            z: 0
        };
    }

    // /**
    //  * Verify token and refresh if valid
    //  *
    //  * @returns {Promise} A promise that is resolved with token if token is valid but rejected otherwise
    //  */
    // async checkTokenAndRefresh() {
    //     let status = {}
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             status = JSON.parse(window.localStorage.getItem('farmbotSimulator')).status;
    //             if (status === undefined) throw "missing token"
    //         } catch (err) {
    //             return reject('missing token')
    //         }
    //         let token = status.token;
    //         if (token === null) return reject('missing token');

    //         let headers = {
    //             'content-type': 'application/json',
    //             'Authorization': `Bearer ${token}`
    //         }
    //         let params = {}
    //         let [err, care] = await to(axios.get(`${FARMBOTURL}/tokens`, {
    //             params,
    //             headers
    //         }))
    //         if(err){
    //             return reject(err)
    //         }
    //         this.setStatus({
    //             token: care.data.token.encoded
    //         })
    //         this.refreshTokenData();
    //         resolve(true);
    //        // console.log('------')
    //         // axios.get(`${FARMBOTURL}/tokens`, {
    //         //     params,
    //         //     headers
    //         // }).then(response => {
    //         //     this.setStatus({
    //         //         token: response.data.token.encoded
    //         //     })
    //         //     this.refreshTokenData();
    //         //     resolve(true)
    //         // }).catch(error => {
    //         //     reject(true);
    //         // })
    //     })
    // }

    // /**
    //  * persist token & other data in local storage
    //  *
    //  * @param {Object} status
    //  * @param {string} status.token
    //  * @param {string} status.broker
    //  * @param {string} status.botId
    //  */
    // setStatus(status) {
    //    // console.log(status)
    //     let localStatus = {};
    //     try {
    //         localStatus = JSON.parse(window.localStorage.getItem('farmbotSimulator')) || {};
    //     } catch (err) {
    //         localStatus = {};
    //     }
    //     if (localStatus.status === undefined) {
    //         localStatus.status = {}
    //     }

    //     for (let i in status) {
    //         localStatus.status[i] = status[i]
    //     }
    //     localStatus = JSON.stringify(localStatus)
    //     window.localStorage.setItem('farmbotSimulator', localStatus);
    // }

    // /**
    //  * Log in and get token from FarmBot REST API
    //  *
    //  * @param {object} params - {user: {email, password}}
    //  * @param {string} params.email - FarmBot webapp email
    //  * @param {string} params.password  - FarmBot webapp email
    //  * @returns {Promise} A promise that is resolved with token if log in is successful or rejected if unsuccessful
    //  */
    // async logIn(params) {
    //     return new Promise(async (resolve, reject) =>{
    //         let [err, care] = await to( axios
    //             .post(`${FARMBOTURL}/tokens`, {user:params}));
    //         if(err){
    //             return reject(
    //                 error.response || {
    //                     data: {
    //                         error: error.message
    //                     }
    //                 }
    //             );
    //         }
    //         this.loggedIn(care.data)
    //         return resolve(care.data)
    //         // axios
    //         //     .post(`${FARMBOTURL}/tokens`, {user:params})
    //         //     .then(function (response) {
    //         //         return resolve(response.data);
    //         //     })
    //         //     .catch(function (error) {
    //         //         return reject(
    //         //             error.response || {
    //         //                 data: {
    //         //                     error: error.message
    //         //                 }
    //         //             }
    //         //         );
    //         //     });
    //     });
    // }

    // /**
    //  * Save token received from REST API to local storage
    //  *
    //  * @param {object} tokenData - response from REST API
    //  * @returns void
    //  */
    // loggedIn(data) {
    //    // console.log('passed to Tokendata')
    //    // console.log(data)
    //     let tokenData = data.token
    //    // console.log(tokenData)

    //     let token = tokenData.encoded;
    //     let broker = tokenData.unencoded.mqtt
    //     let botId = tokenData.unencoded.bot

    //     this.setStatus({
    //         token,
    //         broker,
    //         botId,
    //         user:data.user
    //     })
    //     this.refreshTokenData();
    // }

    // /** Logout. Delete token from localStorage */
    // logout() {
    //     try {
    //         let farmbotSimulatorStatus = JSON.parse(window.localStorage.getItem('farmbotSimulator'))
    //         let tmp = {};
    //         for (let i in farmbotSimulatorStatus) {
    //             if (i !== 'status') {
    //                 tmp[i] = farmbotSimulatorStatus[i]
    //             }
    //         }
    //         tmp = JSON.stringify(tmp)
    //         window.localStorage.setItem('farmbotSimulator', tmp);
    //         this.refreshTokenData();
    //     } catch (err) {
    //     }
    // }

    // /** update FarmBot parameters (broker, token, botId) of this instance from local storage */
    // refreshTokenData() {
    //     let store = JSON.parse(window.localStorage.getItem('farmbotSimulator')).status
    //     let {
    //         broker,
    //         token,
    //         botId
    //     } = store
    //     this.broker = broker
    //     this.token = token
    //     this.botId = botId
    // }

    /** Simulate device uptime. Start/restart clock after successful login */
    stopTimerRunTimer() {
        try {
            this.uptime = 0;
            clearInterval(this.timer)
        } catch (err) {

        }
        this.timer = setInterval(() => {
            this.uptime++
        }, 1000)
    }

    /**
     * connect to MQTT Broker
     *
     * @returns {Promise} A promise that is resolved with mqtt instance if connection is successful or rejected with the error
     */
    async connectMQTT() {
        let store = JSON.parse(window.localStorage.getItem('farmbotSimulator')).status
        let {
            broker,
            token,
            botId
        } = store
        broker = `wss://${broker}:443/ws/mqtt`

       // console.log(`bot/${botId}/#`)
       // console.log({
        //     broker,
        //     token,
        //     botId
        // } )
        this.broker = broker
        this.token = token
        this.botId = botId
        // return;

        return new Promise((resolve, reject) => {
            const client = mqtt.connect(broker, {
                clean: true,
                // clientId: `FBJS-${Farmbot.VERSION}-${genUuid()}`,
                password: token,
                protocolId: "MQIsdp",
                protocolVersion: 3,
                // reconnectPeriod,
                username: botId,
            });

           // console.log(botId)
           // console.log(botId)
           // console.log(botId)

            client.on("error", function (error) {
               // console.log("Can't connect" + error);
                reject(error)
            })
            client.on("connect", async () => {
                client.subscribe(`bot/${botId}/#`, {
                    qos: 1
                });
                resolve(client)
            })
        })
    }

    /**
     * Sleep/delay
     * 
     * @param {number} delay_ms - how long to wait in microseconds
     * @returns {Promise} A promise that is resolved after the wait period has elapsed
     */
    async delay(delay_ms) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                return resolve(true)
            }, delay_ms)
        })
    }

    /**
     * set mqttStatus
     * 
     * @param {boolean} status - mqtt connection status
     */
    setMqttStatus(status) {
        if (status !== this.mqttStatus) {
            this.mqttStatus = status
            this.events.emit('mqtt', status ? 'online' : 'offline')
        }
    }

    /**
     * Publish ping/pong messages
     * @param {number} msgData
     * @param {string} msgType - ping/pong
     */
    sendPingPong(msgData, msgType) {
        this.client.publish(`bot/${this.botId}/${msgType}/${msgData}`, msgData.toString())
    }

    /**
     * update instance with device status: device online/online, other-clients
     * @param {boolean} value
     * @param {string} status - deviceOnline/otherclients
     */
    setDeviceStatus(value, status) {
        switch (status) {
            case "deviceOnline":
                this.deviceOnline = value;
                this.events.emit('status', {
                    'Device': value
                })
                break;
            case "otherClients":
                this.otherClients = value;
                this.events.emit('status', {
                    'Other Clients': value
                })
                break;
            default:
                ;
        }
    }

    /** Monitor device status by monitoring ping/pong messages. Has different instance of mqtt connection */
    async scheduleMonitorDeviceStatus() {
        let otherClientPings = [];
        let thisClientPings = [];
        let otherClientPongs = [];
        let thisClientPongs = [];
        let waitPeriod = 2000;
        let pongWaitPeriod = waitPeriod;
        let clientMonitorPeriod = 10000;
        let mPingPeriod = 2000;
        let lastPingTime = 0
        let lastPongTime = 0
        let lastMPingTime = 0

        let pingsFromSelf = []; // [pingMessage]
        let pongsFromSelf = []; // [pongMessage]
        let allPings = {} // [timePingReceived] = pingMessage

        let [err, care] = await to(this.connectMQTT())
        if (err) {
            throw err
        }
        let client = care;
        setInterval(() => {
            let now = new Date().getTime();
            if (now - lastPingTime >= waitPeriod) {
                pingsFromSelf.push(now)
                this.sendPingPong(now, 'ping');
            }
        }, waitPeriod);

        setInterval(() => {
            let now = new Date().getTime();
            for (let i in allPings) {
                let pingTime = parseInt(i)
                let msgData = allPings[i];
                if (now - pingTime >= pongWaitPeriod) {
                    pongsFromSelf.push(parseInt(msgData))
                    this.sendPingPong(msgData, 'pong');
                }
            }
        }, pongWaitPeriod);

        setInterval(() => {
            if (otherClientPings.length > 0.5 * (thisClientPings.length)) {
                this.setDeviceStatus(true, 'otherClients')
            } else {
                this.setDeviceStatus(false, 'otherClients')
            }

            if (otherClientPongs.length > 0.5 * (thisClientPongs.length)) {
                this.setDeviceStatus(true, 'deviceOnline')
            } else {
                this.setDeviceStatus(false, 'deviceOnline')
            }
            thisClientPings = [];
            otherClientPings = [];
            thisClientPongs = [];
            otherClientPongs = [];
        }, clientMonitorPeriod);

        setInterval(() => {
            let now = new Date().getTime()
            // this.publishGeneralData(now.toString(), 'mping');
            if (now - lastMPingTime > (5 * mPingPeriod)) {
                this.setMqttStatus(false);
            }
        }, mPingPeriod);

        client.on("message", (wholeTopic, message) => {
            try {
                message = message.toString();
                let topic = wholeTopic.split('/')[2];
                lastMPingTime = new Date().getTime();
                this.setMqttStatus(true)
                switch (topic) {
                    case "ping":
                        lastPingTime = new Date().getTime()
                        if (pingsFromSelf.includes(parseInt(message))) {
                            thisClientPings.push(lastPingTime)
                            let index = pingsFromSelf.indexOf(message)
                            pingsFromSelf.splice(index, 1);
                        } else { // ping is from other client(s)
                            otherClientPings.push(lastPingTime);
                            this.sendPingPong(message, 'pong');
                            pongsFromSelf.push(parseInt(msgData));
                        }
                        allPings[lastPingTime] = message
                        break;
                    case "pong":
                        lastPongTime = new Date().getTime()
                        if (pongsFromSelf.includes(parseInt(message))) {
                            thisClientPongs.push(lastPongTime)
                            let index = pongsFromSelf.indexOf(message)
                            pongsFromSelf.splice(index, 1);
                        } else {
                            otherClientPongs.push(lastPongTime);
                        }
                        for (let i in allPings) {
                            let pingMsg = allPings[i];
                            if (pingMsg === message) {
                                delete allPings[i];
                            }
                        }
                        break;
                }
            } catch (err) {}
        })
    }

    /**
     * Start simulator
     *
     * @returns {Promise} A promise that is resolved if token is valid but rejected otherwise
     */
    async startOrRestartSimulator() {
        this.stopTimerRunTimer();
        let waitingForConnection = setInterval(() => {
            this.events.emit('mqtt', 'waiting for connection')
        }, 1000)
        let [err, care] = await to(this.connectMQTT())
        if (err) {
            throw err
        }
        clearInterval(waitingForConnection);
        // mqttStatus = true;
        this.client = care;
        this.monitorMQTT();
        this.events.emit('mqtt', 'connected')
        this.scheduleMonitorDeviceStatus();
        this.schedulePublishTelemetry();
        this.schedulePublishLogs();
        this.schedulePublishStatusMessage();
        this.monitorDownlinkMessages();
        // [err, care] = await to(this.monitorDeviceStatus());
        // let isOffline = err ? true : false
        // console.log(err)
        // console.log(care)
        // console.log('passed online. Is offline:', isOffline)
        // console.log("connected");
        // let client = this.client;
        // client.subscribe(`bot/${this.botId}/#`, {
        //     qos: 1
        // });
        // console.log('going to try ping')
        // await tryPing();
        // console.log('tried ping')
        // client.on("message", (wholeTopic, message) => {
        //     this.processMessage(wholeTopic, message)
        // })
    }

    /** Monitor mqtt connection status */
    monitorMQTT() {
        let client = this.client;
        // client.on('disconnect', () => {
        //     this.events.emit('mqtt', 'disconnected')
        // })
        // client.on('offline', () => {
        //     this.events.emit('mqtt', 'offline')
        // })
        this.events.on('mqtt', (message) => {
            if (message === 'offline') {
                this.events.emit('status', {
                    'mqtt': false
                })
            }
            if (message === 'online') {
                this.events.emit('status', {
                    'mqtt': true
                })
            }
           // console.log('listener:', message)
        })
    }

    /**
     * publish response from device
     * @param {object} args - receivedMessage.args
     */
    publishFromDevice(args) {
        let message = {
            "args": {
                "label": args.label
            },
            "kind": "rpc_ok"
        }
        this.publishGeneralData(message, 'from_device')
    }
    /**
     * setUserEnv
     * @param {Array} body 
     */
    setUserEnv(body) {
        for (let i in body) {
            let kind = body[i].kind;
            switch (kind) {
                case "pair":
                    let args = body[i].args;
                    this.userEnv[args.label] = args.value;
                    break;
            }
        }
    }

    /**
     * Move relative. Get the number of steps to move per second along each axis.
     * @param {Array<number>} start - [x,y,z]
     * @param {Array<number>} stop - [x,y,z]
     * @param {number} speed
     * @returns {object} - {distance, time, [speeds]}
     */
    linearPath(start, stop, speed) {
       // console.log(start, stop, speed)
        let index = 0;
        let coordinates = start.map(item => {
            return [stop[index++], item]
        })
        let distances = coordinates.map(point => point[0] - point[1]) // retains the sign
        let distance = Math.sqrt(distances.map(distance => distance * distance).reduce((acc, currentValue) => acc + currentValue))

        let time = distance / speed;
        let speeds = distances.map(distance => distance / time)

        return {
            distance,
            time,
            speeds
        }
    }

    /**
     * Move the bot end effector
     * @param {Array<number>} locationData - [x,y,z] || {x,y,z}
     */
    setPosition(locationData) {
        let [x, y, z] = locationData;
        let locationChange = false;
        if (x !== this.location.x || y !== this.location.y || z !== this.location.z) {
            locationChange = true
        }
        this.location.x = x
        this.location.y = y
        this.location.z = z
        if (locationChange) {
           // console.log('LOCATION', [x, y, z])
            this.events.emit('location', [x, y, z])
        }
    }
    /**
     * Move the bot end effector
     * @param {Object} motionData - { distance, time, speeds}
     * @param {Array} newLocation - [x,y,z]
     * @returns {Promise} args - args from message received
     */
    async moveBot(motionData, newLocation) {
        return new Promise((resolve, reject) => {
            let {
                distance,
                time,
                speeds
            } = motionData;
            let startPos = [this.location.x, this.location.y, this.location.z]
            let timeElapsed = 0;
            let interval = 16;
            let motion = setInterval(() => {
                let index = 0;
                timeElapsed += interval
                let pos = startPos.map(point => point + (speeds[index++] * timeElapsed / 1000))
                this.setPosition(pos)
                this.publishStatusMessage();
            }, interval);

            let stopAfter = time * 1000
            setTimeout(() => {
                clearInterval(motion);
                let index = 0;
                let pos = startPos.map(point => point + (speeds[index++] * stopAfter / 1000));
                this.setPosition(newLocation);
                this.publishStatusMessage();
                resolve(true)
            }, stopAfter)
        })
    }

    /**
     * Move relative
     * @param {Object} body - {location, offset, speed}
     * @param {Object} args - args from message received
     */
    async moveRelative(body, args) {
        let {
            x,
            y,
            z,
            speed
        } = body
        let relativeCoordinates = [x, y, z]
        let logData = {
            "channels": [],
            "created_at": new Date().getTime().toString().slice(0, 10),
            "major_version": 10,
            "message": `Moving relative to (${relativeCoordinates[0]},${relativeCoordinates[1]},${relativeCoordinates[2]})`,
            "meta": {
                "assertion_passed": null,
                "assertion_type": null
            },
            "minor_version": 1,
            "patch_version": 4,
            "type": "info",
            "verbosity": 2,
            "x": this.location.x,
            "y": this.location.y,
            "z": this.location.z
        }
       // console.log(logData);
        this.publishGeneralData(logData, 'logs');
        let offset = [this.location.x, this.location.y, this.location.z];
        let newLocation = [...relativeCoordinates]
        let index = 0;
        newLocation = newLocation.map(item => offset[index++] + item);
        let motionData = this.linearPath(offset, newLocation, speed)
        await this.moveBot(motionData, newLocation);
        this.publishFromDevice(args);

    }
    /**
     * Move absolute
     * @param {Object} body - {location, offset, speed}
     * @param {Object} args - args from message received
     */
    async moveAbsolute(body, args) {
        let offset = body.offset.args;
        let newLocation = body.location.args;
        let speed = body.speed;
        let newLocationCoordinates = [newLocation.x, newLocation.y, newLocation.z]
        newLocation = [newLocation.x, newLocation.y, newLocation.z]
        offset = [offset.x, offset.y, offset.z]
        let localOffset = [this.location.x, this.location.y, this.location.z]
        for (let i in offset) {
            if (offset[i] !== localOffset[i]) offset[i] = localOffset[i]
        }
        let logData = {
            "channels": [],
            "created_at": new Date().getTime().toString().slice(0, 10),
            "major_version": 10,
            "message": `Moving to (${newLocationCoordinates[0]},${newLocationCoordinates[1]},${newLocationCoordinates[2]})`,
            "meta": {
                "assertion_passed": null,
                "assertion_type": null
            },
            "minor_version": 1,
            "patch_version": 4,
            "type": "info",
            "verbosity": 2,
            "x": this.location.x,
            "y": this.location.y,
            "z": this.location.z
        }
       // console.log(logData)
        this.publishGeneralData(logData, 'logs');
        let motionData = this.linearPath(offset, newLocation, speed)
       // console.log(motionData)
        for(let i in this.botInstances){
            this.botInstances[i].moveAbsolute(newLocationCoordinates)
        }
        await this.moveBot(motionData, newLocation);
        this.publishFromDevice(args);
    }

    /**
     * Process rpc_requests
     * @param {Array} messages - array of rpc actions
     * @param {Object} args - args from message received
     */
    async processRpcRequests(messages, args) {
        for (let i in messages) {
            let kind = messages[i].kind
            switch (kind) {
                case "set_user_env":
                    this.setUserEnv(messages[i].body)
                    this.publishFromDevice(args);
                    break;
                case "move_absolute":
                    this.moveAbsolute(messages[i].args, args)
                    break;
                case "move_relative":
                    this.moveRelative(messages[i].args, args);
                    break;
            }
        }
    }

    /**
     * Process messages published to from_clients topic
     * @param {string} wholeTopic - mqtt topic
     * @param {string} message - received message
     */
    async processFromClientTopicMessages(wholeTopic, message) {
        try {
            message = decodeURIComponent(message);
        } catch (error) {}
        try {
            message = JSON.parse(message);
        } catch (error) {}
       // console.log(message)
        let msgType = message.kind;
        let body = message.body;
        let args = message.args;
       // console.log(msgType)
       // console.log(body)
        switch (msgType) {
            case "rpc_request":
                this.processRpcRequests(body, args)
                break;
        }
    }
    /**
     * Process messages published to sync topic
     * @param {string} wholeTopic - mqtt topic
     * @param {string} message - received message
     */
    processSyncMessages(wholeTopic, message) {
        let syncType = wholeTopic.split('/')[3]
        switch (syncType) {
            case "FarmwareEnv":
                this.publishFromDevice(message.args)
                break;
            case "Device":
                this.publishFromDevice(message.args)
                this.deviceSync = message.body;
                break;
        }
    }
    /** Monitor Messages from FarmBot Client sent to device */
    monitorDownlinkMessages() {
        let client = this.client;
        client.on("message", (wholeTopic, message) => {
            try {
                let topic = wholeTopic.split('/')[2];
                switch (topic) {
                    case "from_clients":
                        this.processFromClientTopicMessages(wholeTopic, message);
                        break;
                    case "sync":
                        this.processSyncMessages(wholeTopic, message);
                        break;
                }
            } catch (err) {

            }
        })

    }


    /**
     * Publish general messages
     * @param {string||object} msgData
     * @param {string} msgType
     */
    publishGeneralData(msgData, msgType) {
        if (typeof msgData === 'object') {
            msgData = JSON.stringify(msgData);
        }
        this.client.publish(`bot/${this.botId}/${msgType}`, msgData)
    }

    /** Schedule publish log messages */
    schedulePublishLogs() {
        let logData = {
            "channels": [],
            "created_at": new Date().getTime().toString().slice(0, 10),
            "major_version": 10,
            "message": "Farmbot is up and running!",
            "meta": {
                "assertion_passed": null,
                "assertion_type": null
            },
            "minor_version": 1,
            "patch_version": 4,
            "type": "success",
            "verbosity": 1,
            "x": this.location.x,
            "y": this.location.y,
            "z": this.location.z
        }
        this.publishGeneralData(logData, 'logs');
    }

    /** Handle telemetry data. Send initial messages (which are not absolutely necessary), then send periodic messages */
    schedulePublishTelemetry() {
        let initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "interface_configure",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_os/platform/target/network.ex",
                "function": "{:handle_info, 2}",
                "interface": "wlan0",
                "line": 140,
                "module": "Elixir.FarmbotOS.Platform.Target.Network"
            },
            "telemetry.subsystem": "network",
            "telemetry.uuid": "9ff8173c-5fe2-4b50-b2db-da38ad52ecc4",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "reset",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_os/platform/target/network.ex",
                "function": "{:reset_ntp, 0}",
                "line": 358,
                "module": "Elixir.FarmbotOS.Platform.Target.Network"
            },
            "telemetry.subsystem": "ntp",
            "telemetry.uuid": "95ea2925-53e7-4e3c-a4f5-227cefe99eb6",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "interface_connect",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_os/platform/target/network.ex",
                "function": "{:handle_info, 2}",
                "interface": "wlan0",
                "line": 181,
                "module": "Elixir.FarmbotOS.Platform.Target.Network"
            },
            "telemetry.subsystem": "network",
            "telemetry.uuid": "621e5ee8-0d71-4f79-b5ec-6b67253f5908",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "lan_connect",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_os/platform/target/network.ex",
                "function": "{:handle_info, 2}",
                "interface": "wlan0",
                "line": 196,
                "module": "Elixir.FarmbotOS.Platform.Target.Network"
            },
            "telemetry.subsystem": "network",
            "telemetry.uuid": "a94eb734-bfa8-4664-8e39-e47aba534c4b",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "connection_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/connection_worker.ex",
                "function": "{:handle_info, 2}",
                "line": 120,
                "module": "Elixir.FarmbotExt.AMQP.ConnectionWorker"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "b0acda3b-8e27-438f-aa36-c65e08a5dc93",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "channel_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/log_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 43,
                "module": "Elixir.FarmbotExt.AMQP.LogChannel"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "7b6b7de5-d2f7-469d-afa6-72b8cd065c1c",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "lan_connect",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_os/platform/target/network.ex",
                "function": "{:handle_info, 2}",
                "interface": "wlan0",
                "line": 196,
                "module": "Elixir.FarmbotOS.Platform.Target.Network"
            },
            "telemetry.subsystem": "network",
            "telemetry.uuid": "6d150eb5-0c03-46d9-b17d-bd668711af05",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "channel_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/telemetry_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 58,
                "module": "Elixir.FarmbotExt.AMQP.TelemetryChannel"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "550154f8-93ef-4fb4-8efe-72fc9f9f30bb",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "channel_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/bot_state_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 57,
                "module": "Elixir.FarmbotExt.AMQP.BotStateChannel"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "dbace292-522f-4ce5-a0d9-d70869693a1a",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry_captured_at": new Date().toISOString(),
            "telemetry_cpu_usage": 6,
            "telemetry_disk_usage": 0,
            "telemetry_memory_usage": 44,
            "telemetry_scheduler_usage": 6,
            "telemetry_soc_temp": 50,
            "telemetry_target": "rpi3",
            "telemetry_throttled": "0x0",
            "telemetry_uptime": this.uptime,
            "telemetry_wifi_level": -39,
            "telemetry_wifi_level_percent": 90
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "channel_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/ping_pong_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 73,
                "module": "Elixir.FarmbotExt.AMQP.PingPongChannel"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "fa9183a8-8829-4f67-a743-45a2bb54c38c",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "channel_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/celery_script_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 53,
                "module": "Elixir.FarmbotExt.AMQP.CeleryScriptChannel"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "97d452cf-e39b-4deb-aad2-7256757aec9a",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "queue_bind",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/celery_script_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 54,
                "module": "Elixir.FarmbotExt.AMQP.CeleryScriptChannel",
                "queue_name": `${this.botId}_from_clients`,
                "routing_key": `bot.${this.botId}.from_clients`
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "f5b25e2a-5593-4163-bc01-f9c34cb75cf2",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "queue_bind",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/ping_pong_channel.ex",
                "function": "{:handle_info, 2}",
                "line": 75,
                "module": "Elixir.FarmbotExt.AMQP.PingPongChannel",
                "queue_name": `${this.botId}_ping`,
                "routing_key": `bot.${this.botId}.ping.#`
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "3ca9da32-0812-43e1-a809-482b98708562",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "channel_open",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/connection_worker.ex",
                "function": "{:maybe_connect, 4}",
                "line": 62,
                "module": "Elixir.FarmbotExt.AMQP.ConnectionWorker"
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "2f2988a2-f290-4e1d-b396-8723cd417e81",
            "telemetry.value": null
        }
        this.publishGeneralData(initialTelemetryData, 'telemetry');
        initialTelemetryData = {
            "telemetry.captured_at": new Date().toISOString(),
            "telemetry.kind": "event",
            "telemetry.measurement": "queue_bind",
            "telemetry.meta": {
                "file": "/nerves/build/farmbot_ext/lib/farmbot_ext/amqp/connection_worker.ex",
                "function": "{:maybe_connect, 4}",
                "line": 63,
                "module": "Elixir.FarmbotExt.AMQP.ConnectionWorker",
                "queue_name": `${this.botId}_auto_sync`,
                "routing_key": `bot.${this.botId}.sync.#`
            },
            "telemetry.subsystem": "amqp",
            "telemetry.uuid": "4d265203-176c-4ff5-8748-4523382a6a00",
            "telemetry.value": null
        }

        setInterval(() => {
            let telemetryData = {
                "telemetry_captured_at": new Date().toISOString(),
                "telemetry_cpu_usage": 2,
                "telemetry_disk_usage": 0,
                "telemetry_memory_usage": 53,
                "telemetry_scheduler_usage": 2,
                "telemetry_soc_temp": 41,
                "telemetry_target": "rpi3",
                "telemetry_throttled": "0x0",
                "telemetry_uptime": this.uptime,
                "telemetry_wifi_level": -39,
                "telemetry_wifi_level_percent": 90
            }
            this.publishGeneralData(telemetryData, 'telemetry');
        }, 300000)
    }

    /** Publish status message to update device position, etc */
    publishStatusMessage() {
        let statusData = {
            "configuration": {
                "arduino_debug_messages": false,
                "auto_sync": false,
                "beta_opt_in": false,
                "disable_factory_reset": false,
                "firmware_debug_log": false,
                "firmware_hardware": "farmduino_k14",
                "firmware_input_log": false,
                "firmware_output_log": false,
                "network_not_found_timer": null,
                "os_auto_update": false,
                "sequence_body_log": false,
                "sequence_complete_log": false,
                "sequence_init_log": false
            },
            "informational_settings": {
                "busy": false,
                "cache_bust": null,
                "commit": "1c5ef14bfa90cbbaff792f3a14c7c0707c73bb08",
                "controller_commit": "1c5ef14bfa90cbbaff792f3a14c7c0707c73bb08",
                "controller_uuid": "29417194-a853-55ef-6de8-91dd9b849b0b",
                "controller_version": "10.1.4",
                "cpu_usage": 3,
                "disk_usage": 0,
                "env": "prod",
                "firmware_commit": "1711db1d9923bc295f81a5eb9952f6b3a10db6a9",
                "firmware_version": "6.4.2.G",
                "idle": true,
                "last_status": null,
                "locked": false,
                "memory_usage": 60,
                "node_name": "farmbot@farmbot-000000004ed75c64.local",
                "private_ip": "192.168.100.30",
                "scheduler_usage": 3,
                "soc_temp": 34,
                "sync_status": "sync_now",
                "target": "rpi3",
                "throttled": "0x0",
                "update_available": true,
                "uptime": this.uptime,
                "wifi_level": -37,
                "wifi_level_percent": 91
            },
            "jobs": {},
            "location_data": {
                "axis_states": {
                    "x": "unknown",
                    "y": "unknown",
                    "z": "unknown"
                },
                "load": {
                    "x": null,
                    "y": null,
                    "z": null
                },
                "position": {
                    "x": this.location.x,
                    "y": this.location.y,
                    "z": this.location.z
                },
                "raw_encoders": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0
                },
                "scaled_encoders": {
                    "x": 0.0,
                    "y": 0.0,
                    "z": 0.0
                }
            },
            "mcu_params": {
                "movement_stall_sensitivity_z": 30.0,
                "movement_stop_at_max_y": 0.0,
                "encoder_missed_steps_max_y": 5.0,
                "movement_keep_active_y": 1.0,
                "movement_steps_acc_dec_y": 300.0,
                "movement_invert_2_endpoints_y": 0.0,
                "movement_keep_active_z": 1.0,
                "movement_max_spd_y": 400.0,
                "pin_guard_5_time_out": 60.0,
                "encoder_scaling_z": 5556.0,
                "pin_guard_4_pin_nr": 0.0,
                "pin_guard_3_time_out": 60.0,
                "movement_steps_acc_dec_x": 300.0,
                "encoder_missed_steps_decay_z": 5.0,
                "movement_home_up_x": 0.0,
                "movement_secondary_motor_invert_x": 1.0,
                "encoder_enabled_y": 1.0,
                "movement_axis_nr_steps_x": 0.0,
                "movement_motor_current_x": 600.0,
                "movement_timeout_x": 120.0,
                "movement_invert_endpoints_x": 0.0,
                "movement_home_spd_y": 50.0,
                "encoder_enabled_z": 1.0,
                "movement_enable_endpoints_z": 0.0,
                "movement_home_at_boot_y": 0.0,
                "movement_axis_nr_steps_z": 0.0,
                "movement_invert_motor_x": 0.0,
                "encoder_invert_z": 0.0,
                "movement_home_spd_z": 50.0,
                "encoder_type_y": 0.0,
                "movement_enable_endpoints_y": 0.0,
                "pin_guard_3_active_state": 1.0,
                "encoder_scaling_y": 5556.0,
                "movement_stop_at_max_x": 0.0,
                "encoder_missed_steps_decay_x": 5.0,
                "movement_timeout_z": 120.0,
                "encoder_scaling_x": 5556.0,
                "movement_keep_active_x": 1.0,
                "movement_min_spd_y": 50.0,
                "movement_max_spd_x": 400.0,
                "movement_stop_at_max_z": 0.0,
                "encoder_missed_steps_max_x": 5.0,
                "pin_guard_1_active_state": 1.0,
                "movement_home_up_z": 1.0,
                "encoder_missed_steps_decay_y": 5.0,
                "pin_guard_1_time_out": 60.0,
                "movement_step_per_mm_x": 5.0,
                "movement_home_at_boot_x": 0.0,
                "movement_invert_2_endpoints_z": 0.0,
                "movement_home_spd_x": 50.0,
                "pin_guard_4_active_state": 1.0,
                "movement_stall_sensitivity_x": 30.0,
                "encoder_type_x": 0.0,
                "movement_min_spd_z": 50.0,
                "pin_guard_3_pin_nr": 0.0,
                "pin_guard_2_pin_nr": 0.0,
                "pin_guard_5_active_state": 1.0,
                "pin_guard_2_active_state": 1.0,
                "movement_motor_current_y": 600.0,
                "movement_home_up_y": 0.0,
                "movement_axis_nr_steps_y": 0.0,
                "movement_stall_sensitivity_y": 30.0,
                "movement_invert_endpoints_z": 0.0,
                "movement_home_at_boot_z": 0.0,
                "movement_microsteps_y": 1.0,
                "pin_guard_1_pin_nr": 0.0,
                "movement_invert_motor_z": 0.0,
                "pin_guard_4_time_out": 60.0,
                "encoder_use_for_pos_x": 0.0,
                "pin_guard_5_pin_nr": 0.0,
                "encoder_invert_x": 0.0,
                "movement_step_per_mm_y": 5.0,
                "movement_invert_2_endpoints_x": 0.0,
                "encoder_use_for_pos_y": 0.0,
                "movement_invert_motor_y": 0.0,
                "movement_microsteps_x": 1.0,
                "param_mov_nr_retry": 3.0,
                "movement_min_spd_x": 50.0,
                "movement_invert_endpoints_y": 0.0,
                "movement_steps_acc_dec_z": 300.0,
                "movement_max_spd_z": 400.0,
                "movement_stop_at_home_z": 0.0,
                "param_e_stop_on_mov_err": 0.0,
                "movement_enable_endpoints_x": 0.0,
                "encoder_enabled_x": 1.0,
                "movement_microsteps_z": 1.0,
                "encoder_missed_steps_max_z": 5.0,
                "encoder_invert_y": 0.0,
                "pin_guard_2_time_out": 60.0,
                "movement_step_per_mm_z": 25.0,
                "encoder_type_z": 0.0,
                "movement_timeout_y": 120.0,
                "movement_secondary_motor_x": 1.0,
                "movement_stop_at_home_x": 0.0,
                "movement_motor_current_z": 600.0,
                "movement_stop_at_home_y": 0.0,
                "encoder_use_for_pos_z": 0.0
            },
            "pins": {},
            "process_info": {
                "farmwares": {}
            },
            "user_env": {
                "LAST_CLIENT_CONNECTED": this.userEnv.LAST_CLIENT_CONNECTED || "\"2020-08-25T06:28:44.168Z\"",
                "camera": "\"USB\""
            }
        }
        this.publishGeneralData(statusData, 'status');
    }
    /** Publish status message every so often. */
    schedulePublishStatusMessage() {
        setInterval(() => {
            this.publishStatusMessage();
        }, 5000)

    }

}