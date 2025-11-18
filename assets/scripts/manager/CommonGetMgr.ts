import { PanelConfigs } from "../configs/PanelConfigs";
import { qc } from "../framework/qc";

export enum GetPropFrom {
    FromOther = -1,
    FromMainPanel = 0,
    FromPropPanel
}

export enum PropType {
    SpeedCard,// 加速卡
    Fish,// 鱼干
}

export default class CommonGetMgr {
    private static _ins: CommonGetMgr = null;
    public static get ins() {
        if (this._ins == null) {
            this._ins = new CommonGetMgr();
        }
        return this._ins;
    }

    public showGetProps(num: number, from: GetPropFrom, type: PropType) {
        qc.panelRouter.showPanel({ panel: PanelConfigs.getPropsPanel, data: { num, from, type } });
    }

    public showGetRedPack(num: number) {
        qc.panelRouter.showPanel({ panel: PanelConfigs.getRedPackPanel, data: { num } });
    }
}