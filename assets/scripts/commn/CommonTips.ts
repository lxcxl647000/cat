import { _decorator, Component, Label, Layout, Node, tween, UIOpacity, v3, Vec3 } from 'cc';
import PoolMgr from '../manager/PoolMgr';
const { ccclass, property } = _decorator;

@ccclass('CommonTips')
export class CommonTips extends Component {
    @property(Label)
    tipsLabel: Label = null;
    @property(UIOpacity)
    private uiOpacity: UIOpacity = null;  // 透明度组件
    @property(Node)
    labelTips: Node = null;
    @property(Node)
    propTips: Node = null;
    @property(Label)
    propLabel: Label = null;
    @property(UIOpacity)
    propOpacity: UIOpacity = null;

    private _doAnimation() {
        this.labelTips.scale = v3(0, 0, 0)
        const pos = this.labelTips.getPosition()
        // 播放提示文本的动画
        tween(this.labelTips)
            .to(0.3, { scale: Vec3.ONE }, { easing: "elasticOut" })
            .delay(0.8)
            .parallel( // 同时执行透明度变化
                tween(this.labelTips).to(0.5, { position: v3(0, pos.y + 300, 0) }),
                tween(this.uiOpacity)
                    .to(0.5, { opacity: 0 }) // 逐渐变透明
            )
            .call(() => {
                this.labelTips.active = false;
                PoolMgr.ins.putNodeToPool(this.node);
            })
            .start();
    }

    private _doPropAni() {
        tween(this.propTips)
            .parallel(
                tween(this.propOpacity)
                    .to(10 / 30, { opacity: 255 })
                    .to(20 / 30, { opacity: 255 })
                    .to(5 / 30, { opacity: 0 }),
                tween(this.propTips)
                    .to(1, { position: v3(0, 214, 0) })
            )
            .call(() => {
                this.propTips.active = false;
                PoolMgr.ins.putNodeToPool(this.node);
            })
            .start();
    }

    public setTips(tips: string) {
        this.labelTips.setPosition(Vec3.ZERO);
        this.labelTips.active = true;
        this.uiOpacity.opacity = 255;
        this.tipsLabel.string = tips;
        this._doAnimation()
    }

    public setPropTips(num: number) {
        this.propTips.setPosition(Vec3.ZERO);
        this.propOpacity.opacity = 0;
        this.propTips.active = true;
        this.propLabel.string = `+${num}g`;
        this.propTips.getComponent(Layout).updateLayout();
        this._doPropAni();
    }
}


