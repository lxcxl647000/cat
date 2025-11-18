import { _decorator, Component, Label, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import CustomSprite from '../../commn/CustomSprite';
import CatMgr from '../../manager/CatMgr';
import { CommonPopType } from '../../manager/CommonPopMgr';
const { ccclass, property } = _decorator;

@ccclass('CommonPopPanel')
export class CommonPopPanel extends PanelComponent {
    @property(CustomSprite)
    titleSprite: CustomSprite = null;
    @property(Label)
    btnLabel: Label = null;
    @property(Node)
    fishNode: Node = null;
    @property(Node)
    propNode: Node = null;
    @property(Node)
    getBallSuccessNode: Node = null;
    @property(Node)
    getBallFailNode: Node = null;
    @property(Node)
    getBallFailLabel1: Node = null;
    @property(Node)
    getBallFailLabel2: Node = null;
    @property(Label)
    getBallFailLabel2_progress: Label = null;
    @property(Node)
    feedSuccessNode: Node = null;

    private _type: CommonPopType = CommonPopType.FishNotEnough;
    show(option: PanelShowOption): void {
        option.onShowed();
        CocosUtils.openPopAnimation(this.node.getChildByName('SafeArea'), () => { });

        this._type = option.data.type;
        this._initUI();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private _initUI() {
        this.fishNode.active = this._type === CommonPopType.FishNotEnough;
        this.propNode.active = this._type === CommonPopType.PropNotEnough;
        this.getBallSuccessNode.active = this._type === CommonPopType.GetBallSuccess;
        this.getBallFailNode.active = this._type === CommonPopType.GetBallFail;
        this.feedSuccessNode.active = this._type === CommonPopType.FeedSuccess;

        if (this._type === CommonPopType.FishNotEnough || this._type === CommonPopType.PropNotEnough) {
            this.titleSprite.index = 1;
            this.btnLabel.string = '去做任务';
        }
        else if (this._type === CommonPopType.GetBallSuccess) {
            this.titleSprite.index = 0;
            this.btnLabel.string = '去逛逛';
        }
        else if (this._type === CommonPopType.GetBallFail) {
            this.titleSprite.index = 1;
            this.btnLabel.string = CatMgr.ins.feedEndTime > 0 ? '去使用' : '去喂食';
            if (CatMgr.ins.feedEndTime > 0) {
                this.getBallFailLabel2_progress.string = (100 - +CatMgr.ins.catData.furball) + '%';
            }
        }
        else if (this._type === CommonPopType.FeedSuccess) {
            this.titleSprite.index = 0;
            this.btnLabel.string = '我知道了';
        }
    }

    onBtn() {
        this.onClose(() => {
            if (this._type === CommonPopType.FishNotEnough || this._type === CommonPopType.PropNotEnough) {
                qc.panelRouter.showPanel({ panel: PanelConfigs.taskPanel });
            }
            else if (this._type === CommonPopType.GetBallSuccess) {
                // 跳提现
            }
            else if (this._type === CommonPopType.GetBallFail) {
                if (CatMgr.ins.feedEndTime > 0) {
                    qc.panelRouter.showPanel({ panel: PanelConfigs.propsPanel });
                }
            }
        });
    }

    onClose(cb: Function) {
        CocosUtils.closePopAnimation(this.node.getChildByName('SafeArea'), () => {
            qc.panelRouter.hide({ panel: PanelConfigs.commonPopPanel });
            cb && cb instanceof Function && cb();
        });
    }
}