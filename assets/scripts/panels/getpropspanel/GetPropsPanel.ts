import { _decorator, Animation, Label, Node, v3, Vec3 } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import { GetPropFrom, PropType } from '../../manager/CommonGetMgr';
import CustomSprite from '../../commn/CustomSprite';
const { ccclass, property } = _decorator;

@ccclass('GetPropsPanel')
export class GetPropsPanel extends PanelComponent {
    @property(Animation)
    ani: Animation = null;
    @property(Animation)
    lightRotate: Animation = null;
    @property(Label)
    countLabel: Label = null;
    @property(Node)
    descNode: Node = null;
    @property(CustomSprite)
    icon: CustomSprite = null;

    private _num: number = 0;
    private _from: GetPropFrom = GetPropFrom.FromOther;
    private _type: PropType = PropType.SpeedCard;

    show(option: PanelShowOption): void {
        CocosUtils.openPopAnimation(this.node.getChildByName('SafeArea'), () => {
            option.onShowed();
        });
        this._num = option.data.num;
        this._from = option.data.from || GetPropFrom.FromOther;
        this._type = option.data.type;

        this._init();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _init() {
        this.descNode.active = this._type === PropType.SpeedCard;
        this.countLabel.string = `${this._type === PropType.SpeedCard ? '加速卡' : '鱼干'}*${this._num}`;
        this.icon.index = this._type === PropType.SpeedCard ? 0 : 1;
        this.ani.play();
        this.lightRotate.play();
    }

    onClickClose() {
        this._closePanel(() => {
            if (this._from === GetPropFrom.FromPropPanel) {
                qc.eventManager.emit(EventDef.FlyPropInPropPanel);
            }
        });
    }

    private _closePanel(cb: Function) {
        CocosUtils.closePopAnimation(this.node.getChildByName('SafeArea'), () => {
            qc.panelRouter.hide({ panel: PanelConfigs.getPropsPanel });
            cb && cb();
        });
    }
}