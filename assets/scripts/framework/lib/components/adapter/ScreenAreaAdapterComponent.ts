
import { _decorator, Component, screen, UITransform, view } from "cc";

const { ccclass, property } = _decorator;

@ccclass
export default class ScreenAreaAdapterComponent extends Component {
    onLoad() {
        this._onResize();
    }

    onEnable() {
        let onResize = this._onResize.bind(this);
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
    }

    onDisable() {
        let onResize = this._onResize.bind(this);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
    }

    private _onResize() {
        let designWidth = view.getVisibleSize().width;
        let designHeight = view.getVisibleSize().height;
        let canvasWidth = screen.windowSize.width;
        let canvasHeight = screen.windowSize.height;
        let scaleForShowAll = Math.min(canvasWidth / designWidth, canvasHeight / designHeight);

        this.node.getComponent(UITransform).width = canvasWidth / scaleForShowAll;
        this.node.getComponent(UITransform).height = canvasHeight / scaleForShowAll;
    }
}