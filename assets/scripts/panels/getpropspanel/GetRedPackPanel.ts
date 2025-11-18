import { _decorator, Animation, Label } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import CocosUtils from '../../utils/CocosUtils';
const { ccclass, property } = _decorator;

@ccclass('GetRedPackPanel')
export class GetRedPackPanel extends PanelComponent {
    @property(Animation)
    ani: Animation = null;
    @property(Animation)
    lightRotate: Animation = null;
    @property(Animation)
    redpackAni: Animation = null;
    @property(Label)
    cashLabel: Label = null;

    private _num: number = 0;

    show(option: PanelShowOption): void {
        CocosUtils.openPopAnimation(this.node.getChildByName('SafeArea'), () => {
            option.onShowed();
        });
        this._num = option.data.num;
        this.cashLabel.string = this._num.toFixed(2);
        this.ani.play();
        this.lightRotate.play();
        this.redpackAni.play();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    onClickClose() {
        CocosUtils.closePopAnimation(this.node.getChildByName('SafeArea'), () => {
            qc.panelRouter.hide({ panel: PanelConfigs.getRedPackPanel });
        });
    }
}