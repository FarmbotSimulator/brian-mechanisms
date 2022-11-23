/* Copyright 2022 Brian Onang'o
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
 * @module plantPlacer
 */
const plantShapes = {
    "corn-mustard-1": {
        shapeId: 4
    }
}

export class plantPlacer {
    constructor(parent) {
        this.parent = parent
        // this.plantBed = plantBed
    }

    /**
     * place 
     *
     */
    place(parent, options, instanceNumber) {
        let self = parent.instances[instanceNumber]
        let points = self.plants
        let missingPoints = Object.values(points).filter(item => item.nodeId === undefined)
        missingPoints.map(item => {
            let { planted_at, plant_stage, x, y, z, name, pointer_type, id } = item.plantData
            let nodeId;
            nodeId = this.placeGeneric(parent, instanceNumber, name)
            if (nodeId) points[id]["nodeId"] = nodeId
        })
        parent.webotsView._view.animation._view.x3dScene.render();
    }
    getPlantShapeId(plantName) {
        if (Object.keys(plantShapes).includes(plantName)) {
            return plantShapes[plantName].shapeId
        } else {
            return Object.values(plantShapes).slice(-1)[0].shapeId
        }
    }
    placeGeneric(parent, instanceNumber, plantName) {
        let cloned = parent.getRootNode(instanceNumber)
        let shapeId = this.getPlantShapeId(plantName)
        let Corn = cloned.children[0].children[shapeId]
        let elem = Corn.clone()
        elem.parent = cloned.children[1].children[1].id
        parent.WbWorld.instance.nodes.set(elem.id, elem)
        cloned.children[1].children[1].children.push(elem)
        elem.finalize()
        let pose = { 'id': elem.id, "scale": [0.0001, 0.0001, 0.0001].join(",") };
        parent.webotsView._view.x3dScene._applyPoseToObject(pose, elem)
        return elem.id
    }
    positionPlants(parent, instanceNumber) {
        let self = parent.instances[instanceNumber]
        let points = self.plants
        if (points === undefined) return
        Object.values(points).map(item => {
            let { nodeId } = item
            let { x, y } = item.plantData
            x = parseFloat(x)
            y = parseFloat(y)
            let tmpItem = parent.WbWorld.instance.nodes.get(nodeId)
            if(tmpItem === undefined)return
            let pose = { 'id': tmpItem.id, "translation": [(y - self.botWidth / 2) / 1000, (x - self.botLength / 2) / 1000, 0].join(",") };
            parent.webotsView._view.x3dScene._applyPoseToObject(pose, tmpItem)
            pose = { 'id': tmpItem.id, "scale": [0.01, 0.01, 0.01].join(",") };
            parent.webotsView._view.x3dScene._applyPoseToObject(pose, tmpItem)
        })
        parent.webotsView._view.animation._view.x3dScene.render();
        this.removeDeleted(parent, instanceNumber)
    }
    removeDeleted(parent, instanceNumber) {
        let self = parent.instances[instanceNumber]
        let points = self.plants
        if (points === undefined) return
        Object.values(points).map(item => {
            let { nodeId, deleted } = item
            if (deleted) {
                let object = parent.WbWorld.instance.nodes.get(nodeId)
                let objectId = object.id
                let parentId = object.parent
                let parentObj = parent.WbWorld.instance.nodes.get(parentId)
                object.delete();
                parentObj.children = parentObj.children.filter((elem, i) => elem.id !== objectId)
                delete self.plants[nodeId]
            }
        })
        parent.webotsView._view.animation._view.x3dScene.render();
    }
    position() {

    }
}