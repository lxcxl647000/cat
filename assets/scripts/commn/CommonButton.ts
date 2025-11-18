import { _decorator, Button, EventTouch } from 'cc';
import { musicMgr } from '../manager/musicMgr';
const { ccclass, property } = _decorator;

@ccclass('CommonButton')
export class CommonButton extends Button {
    protected _onTouchBegan(event?: EventTouch): void {
        musicMgr.ins.playSound('click');
        super._onTouchBegan(event);
    }
}