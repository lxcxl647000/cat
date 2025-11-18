import { qc } from "../framework/qc";
import { PanelConfigs } from "../configs/PanelConfigs";

export enum CommonPopType {
    FishNotEnough,// 鱼干不足
    PropNotEnough,// 道具不足
    GetBallSuccess,// 成功获得毛球
    GetBallFail,// 不能获取毛球
    FeedSuccess,// 喂食成功
}

export default class CommonPopMgr {
    private static _ins: CommonPopMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new CommonPopMgr();
        }
        return this._ins;
    }

    public showPop(type: CommonPopType) {
        qc.panelRouter.showPanel({ panel: PanelConfigs.commonPopPanel, data: { type } });
    }
}