import { _decorator, Component, Label, Node, Widget } from 'cc';
import { RedpackExchangePanel } from './RedpackExchangePanel';
import RedpackExchangeMgr, { ExchangeItem, RedpackData } from '../../manager/RedpackExchangeMgr';
const { ccclass, property } = _decorator;

@ccclass('RedpackExchangeItem')
export class RedpackExchangeItem extends Component {
    @property(Label)
    cashLabel: Label = null;
    @property(Label)
    cashName: Label = null;
    @property(Label)
    ballNumLabel: Label = null;
    @property(Label)
    exchangeNumLabel: Label = null;

    private _panel: RedpackExchangePanel = null;
    private _item: ExchangeItem = null;

    public init(panel: RedpackExchangePanel, item: ExchangeItem) {
        this._panel = panel;
        this._item = item;
        this._updateItem();
    }

    private _updateItem() {
        this.cashLabel.string = this._item.price;
        setTimeout(() => {
            this.cashLabel.getComponentInChildren(Widget).updateAlignment();
        }, 30);
        this.cashName.string = this._item.name;
        this.ballNumLabel.string = `毛球*${this._item.hairball}`;
        this.exchangeNumLabel.string = `已兑${this._item.get_num}+`;
    }

    onExchange() {
        RedpackExchangeMgr.ins.getRedpack(this._item.id, (data: RedpackData) => {
            this._panel.toExchangeInfo(data);
        });
    }
}