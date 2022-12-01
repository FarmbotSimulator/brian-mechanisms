/**
 * up to 4 per stuff
 * GARDENCONTAINER :: getRootNode() first transform from down
 * **-> GARDENTRANSFORM
 * ****     -> COLLECTIONSTRANSFORM
 *                  WoodenBlock
 *                  Concrete Support
 *                  DragChain Support
 *                  20X40Vslot
 *                  Corn
 *                  Anemone
 * ****     -> BEDTRANSFORM
 *                  Soil
 *                  Plants & Bots
 *                      Corn
 *                      FarmBot
 *                      CableBot
 *                  Legs
 *                  Concrete
 *                         
 */
export default class wbWorld {
    constructor() {
        // this.appManager = null
        // const webotsView = document.getElementsByTagName('webots-view')[0];
        // this.webotsView = webotsView
        // const WbWorld = webotsView._view.x3dScene.WbWorld
        // this.WbWorld = WbWorld
    }
    deleteExcessModels(id) {
        let ids = [1, 2, 3].filter(elem => elem !== id) // list all bot models here
        let rootNode = this.WbWorld.instance.nodes.get(this.rootNodeId)
        if (typeof this.deletedStrangers === 'undefined') {
            this.deletedStrangers = true
            // remove elements 2 & 3
            {   // cloned.children[1].children.slice(2)
                Array.from(rootNode.children[1].children[1].children).map((elem, index) => {
                    if (ids.includes(parseInt(index))) {
                        const object = this.WbWorld.instance.nodes.get(elem.id);
                        object.delete();
                    }
                })
                // rootNode.children[1].children[1].children = rootNode.children[1].children[1].children.filter((elem, i) => parseInt(i) != 2 && parseInt(i) != 3)
            }
        }
    }
    getDescendantNode(parentNode, childTree) {
        let ret = parentNode;
        childTree.map(item => ret = ret.children[item])
        return ret
    }
    getRootNode() {
        const { WbWorld } = this
        let sceneTree = WbWorld.instance.sceneTree
        let funcNameRegex = /class ([^ ]+)/;
        return Array.from(sceneTree).reverse().filter((a, b) => (funcNameRegex).exec(Object.getPrototypeOf(a).constructor.toString())[1] === "WbTransform")[0]
    }
    applyTransformation(node, transformType, transform) {
        if (typeof transform !== 'string') transform = transform.join(",")
        let pose = { 'id': node.id, [transformType]: transform };
        this.webotsView._view.x3dScene._applyPoseToObject(pose, node);
        this.webotsView._view.x3dScene.render();
    }
    getDescendantNode(parentNode, childTree) {
        let ret = parentNode;
        childTree.map(item => ret = ret.children[item])
        return ret
    }
    setAppManager(appManager) {
        this.appManager = appManager
    }
    degrees_to_radians(degrees) {
        let pi = Math.PI;
        return degrees * (pi / 180);
    }
    destroy() {
        const object = this.getThisRootNode();
        object.delete();
        this.webotsView._view.x3dScene.render();
    }
}