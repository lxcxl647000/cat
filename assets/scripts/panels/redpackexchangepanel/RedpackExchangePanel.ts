import { _decorator, Component, Label, Node, RichText, Tween, tween, Vec3, Widget } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import Constant from '../../constants/Constant';
import { PlatformConfig } from '../../framework/lib/platform/configs/PlatformConfig';
import CatMgr from '../../manager/CatMgr';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { RedpackExchangeItem } from './RedpackExchangeItem';
import RedpackExchangeMgr, { RedpackData } from '../../manager/RedpackExchangeMgr';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import EventDef from '../../constants/EventDef';
const { ccclass, property } = _decorator;

@ccclass('RedpackExchangePanel')
export class RedpackExchangePanel extends PanelComponent {
    @property(Label)
    ballNum: Label = null;
    @property(Label)
    userID: Label = null;
    @property(Label)
    userNameLabel: Label = null;
    @property(ListCom)
    list: ListCom = null;
    @property(Node)
    exchangeNode: Node = null;
    @property(Node)
    infoNode: Node = null;
    @property(Label)
    cashLabel: Label = null;
    @property(Label)
    cashName: Label = null;
    @property(Label)
    ballNumLabel: Label = null;
    @property(Label)
    exchangeNumLabel: Label = null;
    @property(Label)
    ruleCashName: Label = null;
    @property(Label)
    ruleCashDes: Label = null;
    @property(Label)
    payBallNum: Label = null;
    @property(Label)
    leftBallNum: Label = null;
    @property(Node)
    tipsNode: Node = null;
    @property(RichText)
    tipsLabel: RichText = null;
    @property(RichText)
    tips2Label: RichText = null;
    @property(Node)
    tips_top: Node = null;
    @property(Node)
    tips_mid: Node = null;
    @property(Node)
    tips_bottom: Node = null;

    private _curRedpack: RedpackData = null;
    private _fake_tips: string[] = [];
    private _fake_index = 0;

    show(option: PanelShowOption): void {
        option.onShowed();

        RedpackExchangeMgr.ins.getRedpackExchangeList(() => {
            this._updateItem();
        });
        RedpackExchangeMgr.ins.getExchangeRecordList((fake_tips: string[]) => {
            this._fake_tips = fake_tips;
            this._fake_index = 0;
            if (this._fake_tips.length > 0) {
                this.tipsLabel.string = this._formatFakeTips(this._fake_tips[this._fake_index++]);
                this._hideTips(this.tipsLabel);
            }
            else {
                this.tipsLabel.string = '';
            }
        });
        this.onBackToExchange();
        this._initName();
        this._updateBallNum();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.UpdateCatData, this._updateBallNum, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.UpdateCatData, this._updateBallNum, this);
    }

    onBtnClose() {
        Tween.stopAllByTarget(this.tipsLabel.node);
        Tween.stopAllByTarget(this.tips2Label.node);
        this.tipsLabel.node.position = this.tips_mid.position;
        this.tips2Label.node.position = this.tips_bottom.position;
        qc.panelRouter.hide({ panel: PanelConfigs.redpackExchangePanel });
    }

    private _initName() {
        let nickName = qc.storage.getItem(Constant.NICK_NAME);
        if (nickName) {
            this.userNameLabel.string = nickName;
        }
        this.userID.string = `ID:${PlatformConfig.ins.config.userId}`;
    }

    private _updateBallNum() {
        this.ballNum.string = CatMgr.ins.catData.furball_num;
    }

    onRenderItem(item: Node, index: number) {
        item.active = true;
        let exchangeItem = item.getComponent(RedpackExchangeItem);
        let eItem = RedpackExchangeMgr.ins.exchangeData.list[index];
        if (exchangeItem) {
            exchangeItem.init(this, eItem);
        }
    }

    private _updateItem() {
        this.list.numItems = RedpackExchangeMgr.ins.exchangeData.list.length;
    }

    private _updateInfo() {
        this.cashLabel.string = this._curRedpack.price;
        this.ballNumLabel.string = this._curRedpack.hairball;
        this.payBallNum.string = this._curRedpack.hairball;
        this.leftBallNum.string = `${this._curRedpack.furball_num}毛球`;
        setTimeout(() => {
            this.cashLabel.getComponentInChildren(Widget).updateAlignment();
            this.ballNumLabel.getComponentInChildren(Widget).updateAlignment();
            let widget = this.payBallNum.getComponentInChildren(Widget);
            widget.updateAlignment();
            widget.node.children[0].getComponent(Widget).updateAlignment();
        }, 30);
        this.ruleCashName.string = this.cashName.string = this._curRedpack.name;
        this.exchangeNumLabel.string = `已兑${this._curRedpack.get_num}+`;
        this.ruleCashDes.string = `a. 使用毛球可兑换${this._curRedpack.price}元余额，兑换成功后可在账户余额中提现到支付宝账户；`;
    }

    onBackToExchange() {
        this._curRedpack = null;
        this.exchangeNode.active = true;
        this.infoNode.active = false;
    }

    public toExchangeInfo(data: RedpackData) {
        this._curRedpack = data;
        this.tipsNode.active = false;
        this._updateInfo();
        this.exchangeNode.active = false;
        this.infoNode.active = true;
    }

    onExchange() {
        if (!this._curRedpack) {
            return;
        }
        if (this._curRedpack.furball_num < this._curRedpack.hairball) {
            this.tipsNode.active = true;
            CommonTipsMgr.ins.showTips('毛球不足');
            return;
        }
        RedpackExchangeMgr.ins.exchangeRedpack(this._curRedpack.id, () => {
            CommonTipsMgr.ins.showTips('兑换成功');
            CatMgr.ins.getCatData();
            RedpackExchangeMgr.ins.getRedpackExchangeList(() => {
                this.onBackToExchange();
            });
        });
    }

    onRecord() {
        this.onBtnClose();
        qc.panelRouter.showPanel({ panel: PanelConfigs.logListPanel, data: { active_num: 2 } });
    }

    private _showTips(label: RichText, tips: string) {
        label.string = this._formatFakeTips(tips);
        tween(label.node)
            .to(1, { position: this.tips_mid.position }, { easing: 'sineInOut' })
            .call(() => {
                this._hideTips(label);
            })
            .start();
    }

    private _hideTips(label: RichText) {
        this.scheduleOnce(() => {
            tween(label.node)
                .to(1, { position: this.tips_top.position }, { easing: 'sineInOut' })
                .call(() => {
                    label.node.position = this.tips_bottom.position;
                })
                .start();
            if (this._fake_index >= this._fake_tips.length) {
                this._fake_index = 0;
            }
            this._showTips(label === this.tipsLabel ? this.tips2Label : this.tipsLabel, this._fake_tips[this._fake_index++]);
        }, 2);
    }

    private _formatFakeTips(tips: string) {
        let strArr = tips.split('兑换了');
        let strArr2 = strArr[1].split('元');
        return `${strArr[0]}兑换了<color=#FF4F1B>${strArr2[0]}</color>元${strArr2[1]}`;
    }
}