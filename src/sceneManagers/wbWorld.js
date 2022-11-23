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
 *                  Plants
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
    getDescendantNode = (parentNode, childTree) => {
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
}