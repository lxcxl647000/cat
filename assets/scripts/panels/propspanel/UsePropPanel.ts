import { _decorator, Component, EventTouch, Label, Node, ProgressBar, RichText } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import PropsMgr from '../../manager/PropsMgr';
import EventDef from '../../constants/EventDef';
import TimeUtils from '../../utils/TimeUtils';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
const { ccclass, property } = _decorator;

export enum UsePropPanelType {
    Type1,// 在道具界面点击使用
    Type2
}

@ccclass('UsePropPanel')
export class UsePropPanel extends PanelComponent {
    @property(RichText)
    tips: RichText = null;
    @property(RichText)
    useCount: RichText = null;
    @property(Label)
    num: Label = null;
    @property(Node)
    type1: Node = null;
    @property(Node)
    type2: Node = null;
    @property(Label)
    timeLabel: Label = null;
    @property(ProgressBar)
    timeProgress: ProgressBar = null;
    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    type2Num: Label = null;
    @property(Node)
    maskBg: Node = null;

    private _useCount: number = 1;
    private _type: UsePropPanelType = UsePropPanelType.Type1;
    private _totalTime = 4 * 60 * 60 * 1000;
    private _leftTime = 0;

    show(option: PanelShowOption): void {
        option.onShowed();
        CocosUtils.openPopAnimation(this.node.getChildByName('SafeArea'), () => { });
        this._type = option.data.type;
        this.type1.active = this._type === UsePropPanelType.Type1;
        this.type2.active = this._type === UsePropPanelType.Type2;
        if (this._type === UsePropPanelType.Type2) {
            PropsMgr.ins.getPropsData(() => { this._init(); });
        }
        else {
            this._init();
        }
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.FeedCountDown, this._updateLeftTimeUI, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.FeedCountDown, this._updateLeftTimeUI, this);
    }

    private _init() {
        if (this._type === UsePropPanelType.Type1) {
            this._useCount = 1;
            this.num.string = `加速卡*${PropsMgr.ins.cardNum}`;
            this._updateUseCountUI();
        }
        else {
            this.type2Num.string = `还有${PropsMgr.ins.cardNum}张`;
        }
    }

    private _updateUseCountUI() {
        this.useCount.string = `<color=#FF0D0D>${this._useCount}</color>/${PropsMgr.ins.cardNum}`;
    }

    private _updateLeftTimeUI(leftTime: number) {
        this._leftTime = leftTime;
        if (this._type === UsePropPanelType.Type1) {
            let timeStr = TimeUtils.getHHMM(leftTime);
            this.tips.string = `小猫还有<color=#FF4F06>${timeStr}</color>进食完成`;
        }
        else {
            this.timeLabel.string = TimeUtils.getTimeHHMMSS0(leftTime);
            let progressVal = (this._totalTime - leftTime) / this._totalTime;
            this.timeProgress.progress = progressVal;
            this.progressLabel.string = `${(progressVal * 100).toFixed(0)}%`;
        }
    }

    onClose(e: EventTouch) {
        if (e && e.currentTarget === this.maskBg && this._type === UsePropPanelType.Type2) {
            return;
        }
        CocosUtils.closePopAnimation(this.node.getChildByName('SafeArea'), () => {
            qc.panelRouter.hide({ panel: PanelConfigs.usePropPanel });
        });
    }

    onUse() {
        let num = 0;
        if (this._type === UsePropPanelType.Type1) {
            num = this._useCount;
        }
        else {
            // 一张卡加速一小时
            let hour = Math.ceil(this._leftTime / (60 * 60 * 1000));
            num = PropsMgr.ins.cardNum > hour ? hour : PropsMgr.ins.cardNum;
        }
        if (num <= 0) {
            CommonTipsMgr.ins.showTips('加速卡不足');
            return;
        }
        PropsMgr.ins.useCard(num.toString(), () => {
            PropsMgr.ins.addCard(-num);
            qc.eventManager.emit(EventDef.UseCard);
            this.onClose(null);
        });
    }

    onMinus() {
        if (this._useCount > 1) {
            this._useCount -= 1;
            this._updateUseCountUI();
        }
    }

    onAdd() {
        if (this._useCount < PropsMgr.ins.cardNum) {
            // 一张卡加速一小时
            let hour = Math.ceil(this._leftTime / (60 * 60 * 1000));
            if (this._useCount + 1 <= hour) {
                this._useCount += 1;
                this._updateUseCountUI();
            }
        }
    }
}