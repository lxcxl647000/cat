import { _decorator, Component, Node } from "cc";
import { qc } from "../framework/qc";
const { ccclass, property } = _decorator;

@ccclass
export default class MainSceneCtrl extends Component {
    @property(Node)
    rootLayerNode: Node = null;

    onLoad() {
        // 初始化平台
        qc.platform.init();
        // 初始化面板路由器
        qc.panelRouter.init(this.rootLayerNode);
    }

    async start() {

    }
}