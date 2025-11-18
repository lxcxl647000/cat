import { _decorator, Color, Component, Label, Node, RichText, Sprite, Widget } from 'cc';
import CustomSprite from '../../commn/CustomSprite';
import PropsMgr from '../../manager/PropsMgr';
import CommonGetMgr, { GetPropFrom, PropType } from '../../manager/CommonGetMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { PropsPanel } from './PropsPanel';
import EventDef from '../../constants/EventDef';
const { ccclass, property } = _decorator;

export enum PropTaskType {
    DrinkWater = 1,
    DriedFish,
    DrinkWaterTask = 5,
    CatFeedTask
}

@ccclass('PropTaskItem')
export class PropTaskItem extends Component {
    @property(RichText)
    itemName: RichText = null;
    @property(Label)
    itemDesc: Label = null;
    @property(Node)
    cardNode: Node = null;
    @property(Label)
    cardNum: Label = null;
    @property(CustomSprite)
    icon: CustomSprite = null;
    @property(Sprite)
    btnSprite: Sprite = null;
    @property(Label)
    btnLabel: Label = null;

    private _type: PropTaskType = PropTaskType.DrinkWater;
    private _btnColor_normal = new Color(255, 146, 1, 255);
    private _btnColor_grey = new Color(127, 127, 127, 255);
    private _propsPanel: PropsPanel = null;
    private _drinkTimeArr = [8, 12, 18, 21];

    protected onEnable(): void {
        qc.eventManager.on(EventDef.UpdatePropTaskItem, this._updateTaskItem, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.UpdatePropTaskItem, this._updateTaskItem, this);
    }

    public init(type: PropTaskType, propsPanel: PropsPanel) {
        this._propsPanel = propsPanel;
        this._type = type;
        this._updateTaskItem(type);
    }

    private _updateItem() {
        let taskName = '';
        let taskDesc = '';
        let spriteIndex = 0;
        this.cardNode.active = this._type !== PropTaskType.DrinkWater;
        switch (this._type) {
            case PropTaskType.DrinkWater:
                taskName = '喝水打卡领加速卡';
                taskDesc = '每日8点/12点/18点/21点各领一次';
                spriteIndex = 0;
                break;
            case PropTaskType.DriedFish:
                taskName = `完成鱼干任务领加速卡（<color=#FFAD73>${PropsMgr.ins.propsData.completeNum}</color> / 10）`;
                taskDesc = '完成10个任务可领取';
                this.cardNum.string = '+3';
                spriteIndex = 1;
                break;
            case PropTaskType.DrinkWaterTask:
                taskName = `完成喝水打卡任务（<color=#FFAD73>${PropsMgr.ins.propsData.drinkWaterNum}</color> / 4）`;
                taskDesc = '每日完成打卡任务可领取';
                this.cardNum.string = '+1';
                spriteIndex = 2;
                break;
            case PropTaskType.CatFeedTask:
                taskName = '完成喂猫任务领加速卡';
                taskDesc = '每日首次/第二次喂猫各领取一次';
                this.cardNum.string = '+1';
                spriteIndex = 3;
                break;
        }
        this.itemName.string = taskName;
        this.itemDesc.string = taskDesc;
        this.icon.index = spriteIndex;
        setTimeout(() => {
            this.cardNode.getComponent(Widget).updateAlignment();
        }, 20);
    }

    private _updateBtn() {
        let btnStr = '';
        let btnColor: Color = null;
        let data = PropsMgr.ins.propsData;
        switch (this._type) {
            case PropTaskType.DrinkWater:
                btnStr = data.drinkWater === 1 ? '喝水' : `${this._getNextDrinkTime()}点可领`;
                btnColor = this._btnColor_normal;
                break;
            case PropTaskType.DriedFish:
                btnStr = data.driedFish === 2 ? '已领取' : (data.driedFish === 1 ? '领取' : '去做任务');
                btnColor = data.driedFish === 2 ? this._btnColor_grey : this._btnColor_normal;
                break;
            case PropTaskType.DrinkWaterTask:
                btnStr = data.drinkWaterTask === 2 ? '已领取' : '领取';
                btnColor = data.drinkWaterTask !== 1 ? this._btnColor_grey : this._btnColor_normal;
                break;
            case PropTaskType.CatFeedTask:
                btnStr = data.catFeedTask === 1 ? '领取' : (data.catFeedTask === 2 ? '已领取' : '去喂食');
                btnColor = data.catFeedTask === 2 ? this._btnColor_grey : this._btnColor_normal;
                break;
        }
        this.btnLabel.string = btnStr;
        this.btnSprite.color = btnColor;
    }

    onBtn() {
        switch (this._type) {
            case PropTaskType.DrinkWater:
                this._doDrinkWater(1);
                break;
            case PropTaskType.DriedFish:
                this._doDriedFish(3);
                break;
            case PropTaskType.DrinkWaterTask:
                this._doDrinkWaterTask(1);
                break;
            case PropTaskType.CatFeedTask:
                this._doCatFeedTask(1);
                break;
        }
    }

    private _doDrinkWater(getCardNum: number) {
        if (PropsMgr.ins.propsData.drinkWater !== 1) {
            CommonTipsMgr.ins.showTips(`${this._getNextDrinkTime()}点可领`);
        }
        else {
            this._propsPanel.showDrink(() => {
                PropsMgr.ins.getCard(PropTaskType.DrinkWater, () => {
                    PropsMgr.ins.addCard(getCardNum);
                    CommonGetMgr.ins.showGetProps(getCardNum, GetPropFrom.FromPropPanel, PropType.SpeedCard);
                    this._updateDataAndUI();
                });
            });
        }
    }

    private _doDriedFish(getCardNum: number) {
        if (PropsMgr.ins.propsData.driedFish === 2) {
            CommonTipsMgr.ins.showTips('已领取');
            return;
        }
        if (PropsMgr.ins.propsData.driedFish === 1) {
            PropsMgr.ins.getCard(PropTaskType.DriedFish, () => {
                PropsMgr.ins.addCard(getCardNum);
                CommonGetMgr.ins.showGetProps(getCardNum, GetPropFrom.FromPropPanel, PropType.SpeedCard);
                this._updateDataAndUI();
            });
        }
        // 去做任务
        else {
            this._propsPanel.onClickClose(() => {
                qc.panelRouter.showPanel({ panel: PanelConfigs.taskPanel });
            });
        }
    }

    private _doDrinkWaterTask(getCardNum: number) {
        if (PropsMgr.ins.propsData.drinkWaterTask === 2) {
            CommonTipsMgr.ins.showTips('已领取');
            return;
        }
        if (PropsMgr.ins.propsData.drinkWaterTask === 0) {
            CommonTipsMgr.ins.showTips('去完成任务');
            return;
        }
        PropsMgr.ins.getCard(PropTaskType.DrinkWaterTask, () => {
            PropsMgr.ins.addCard(getCardNum);
            CommonGetMgr.ins.showGetProps(getCardNum, GetPropFrom.FromPropPanel, PropType.SpeedCard);
            this._updateDataAndUI();
        });
    }

    private _doCatFeedTask(getCardNum: number) {
        if (PropsMgr.ins.propsData.catFeedTask === 2) {
            return;
        }
        if (PropsMgr.ins.propsData.catFeedTask === 1) {
            PropsMgr.ins.getCard(PropTaskType.CatFeedTask, () => {
                PropsMgr.ins.addCard(getCardNum);
                CommonGetMgr.ins.showGetProps(getCardNum, GetPropFrom.FromPropPanel, PropType.SpeedCard);
                this._updateDataAndUI();
            });
        }
        // 去喂食
        else {
            this._propsPanel.onClickClose(null);
        }
    }

    private _updateDataAndUI() {
        PropsMgr.ins.getPropsData(() => {
            this._updateTaskItem(this._type);
            qc.eventManager.emit(EventDef.UpdatePropTaskItem, PropTaskType.DrinkWaterTask);
        });
    }

    private _getNextDrinkTime() {
        let nextTime = -1;
        let nowTime = new Date();
        let hour = nowTime.getHours();
        for (let time of this._drinkTimeArr) {
            if (hour < time) {
                nextTime = time;
                break;
            }
        }
        if (nextTime === -1) {
            nextTime = this._drinkTimeArr[0];
        }
        return nextTime;
    }

    private _updateTaskItem(type: PropTaskType) {
        if (type !== this._type) return;
        this._updateItem();
        this._updateBtn();
    }
}