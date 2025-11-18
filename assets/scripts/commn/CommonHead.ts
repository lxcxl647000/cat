import { _decorator, Component, Node, Sprite } from 'cc';
import { qc } from '../framework/qc';
import Constant from '../constants/Constant';
import CocosUtils from '../utils/CocosUtils';
import EventDef from '../constants/EventDef';
const { ccclass, property } = _decorator;

@ccclass('CommonHead')
export class CommonHead extends Component {
    @property(Sprite)
    headSprite: Sprite = null;

    protected onEnable(): void {
        qc.eventManager.on(EventDef.UpdateAvatar, this._initHead, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.UpdateAvatar, this._initHead, this);
    }

    protected start(): void {
        this._initHead();
    }

    private _initHead() {
        let avatar = qc.storage.getItem(Constant.AVATAR);
        if (avatar) {
            CocosUtils.loadRemoteTexture(avatar, this.headSprite, '.png');
        }
    }
}


