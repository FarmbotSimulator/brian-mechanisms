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


import axios from 'axios'
import to from 'await-to-js'


const FARMBOTURL = "https://my.farmbot.io/api"; // FamBot REST API

/**
 * authController
 */

export default class FarmbotCloud {
    constructor() {

    }
    /**
     * Verify token and refresh if valid
     *
     * @returns {Promise} A promise that is resolved with token if token is valid but rejected otherwise
     */
    async checkTokenAndRefresh() {
        let status = {}
        return new Promise(async (resolve, reject) => {
            try {
                status = JSON.parse(window.localStorage.getItem('farmbotSimulator')).status;
                if (status === undefined) throw "missing token"
            } catch (err) {
                return reject('missing token')
            }
            let token = status.token;
            if (token === null) return reject('missing token');

            let headers = {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
            let params = {}
            let [err, care] = await to(axios.get(`${FARMBOTURL}/tokens`, {
                params,
                headers
            }))
            if (err) {
                return reject(err)
            }
            this.setStatus({
                token: care.data.token.encoded
            })
            this.refreshTokenData();
            resolve(true);
        })
    }

    /**
     * persist token & other data in local storage
     *
     * @param {Object} status
     * @param {string} status.token
     * @param {string} status.broker
     * @param {string} status.botId
     */
    setStatus(status) {
        let localStatus = {};
        try {
            localStatus = JSON.parse(window.localStorage.getItem('farmbotSimulator')) || {};
        } catch (err) {
            localStatus = {};
        }
        if (localStatus.status === undefined) {
            localStatus.status = {}
        }

        for (let i in status) {
            localStatus.status[i] = status[i]
        }
        localStatus = JSON.stringify(localStatus)
        window.localStorage.setItem('farmbotSimulator', localStatus);
    }

    /**
     * Log in and get token from FarmBot REST API
     *
     * @param {object} params - {user: {email, password}}
     * @param {string} params.email - FarmBot webapp email
     * @param {string} params.password  - FarmBot webapp email
     * @returns {Promise} A promise that is resolved with token if log in is successful or rejected if unsuccessful
     */
    async logIn(password) {
        return new Promise(async (resolve, reject) => {
            let [err, care] = await to(axios
                .post(`https://${this.authenticationServerUrl}/tokens`, { user: {email:this.email, password} }));
            if (err) {
                return reject(
                    err.response.data.auth || err
                );
            }
            this.loggedIn(care.data)
            return resolve(care.data)
        });
    }

    /**
     * Save token received from REST API to local storage
     *
     * @param {object} tokenData - response from REST API
     * @returns void
     */
    loggedIn(data) {
        let tokenData = data.token
        let token = tokenData.encoded;
        let broker = tokenData.unencoded.mqtt
        let botId = tokenData.unencoded.bot

        this.setStatus({
            token,
            broker,
            botId,
            user: data.user
        })
        this.refreshTokenData();
    }

    /** Logout. Delete token from localStorage */
    logout() {
        try {
            let farmbotSimulatorStatus = JSON.parse(window.localStorage.getItem('farmbotSimulator'))
            let tmp = {};
            for (let i in farmbotSimulatorStatus) {
                if (i !== 'status') {
                    tmp[i] = farmbotSimulatorStatus[i]
                }
            }
            tmp = JSON.stringify(tmp)
            window.localStorage.setItem('farmbotSimulator', tmp);
            this.refreshTokenData();
        } catch (err) {
        }
    }

    /** update FarmBot parameters (broker, token, botId) of this instance from local storage */
    refreshTokenData() {
        let store = JSON.parse(window.localStorage.getItem('farmbotSimulator')).status
        let {
            broker,
            token,
            botId
        } = store
        this.broker = broker
        this.token = token
        this.botId = botId
    }
}

// export const auth = new authController();