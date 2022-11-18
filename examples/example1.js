import {brianMechanisms} from "../index.js"

// List areas of application of registered robots
let applications = brianMechanisms.applications()

// list robots which can be used in a given area of appliation
let firstApp = applications[0]
let appBotTypes = brianMechanisms.botTypes(firstApp)
console.log(appBotTypes)

// get models of selected robot type
let firstBot = appBotTypes[0]
let botModels = brianMechanisms.botModels(firstBot)
console.log({botModels})

let firstBotModel = botModels[0]
let botModelParams = brianMechanisms.botModelParams(firstBot, firstBotModel)
console.log({botModelParams})
