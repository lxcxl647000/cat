import { Color, Node, Sprite, tween, v3, Vec3 } from "cc";
import CocosUtils from "../utils/CocosUtils";
import { httpMgr } from "../framework/lib/net/httpMgr";
import { UsePropPanelType } from "../panels/propspanel/UsePropPanel";
import { qc } from "../framework/qc";
import { PanelConfigs } from "../configs/PanelConfigs";
import CommonPopMgr, { CommonPopType } from "./CommonPopMgr";

export interface PropsData {
    box_num: string;
    board_num: string;
    accelerate_card: string;// 加速卡数量
    drinkWater: number;// 加速卡喝水任务领取状态 0-不可领取 1-可领取 2-已领取
    driedFish: number;// 加速卡鱼干任务领取状态 0-不可领取 1-可领取 2-已领取
    completeNum: number;// 鱼干任务完成数量
    drinkWaterNum: string;// 喝水次数
    drinkWaterTask: number;// 喝水任务状态 0:不可领取，1:可领取，2:已领取
    catFeedTask: number;// 喂猫任务状态 0:未喂猫，1:可领取，2:已领取
    catFeedReceiveNum: number;// 喂猫领取次数
    catFeedCanReceiveNum: number;// 
}

export default class PropsMgr {
    private _propsData: PropsData = null;
    public get propsData() {
        return this._propsData;
    }

    public get cardNum() {
        return this._propsData.accelerate_card ? +this._propsData.accelerate_card : 0;
    }
    public addCard(val: number) {
        let num = this.cardNum;
        num += val;
        this._propsData.accelerate_card = num.toString();
    }

    private static _instance: PropsMgr = null;
    public static get ins(): PropsMgr {
        if (this._instance == null) {
            this._instance = new PropsMgr();
        }
        return this._instance;
    }

    // 获取道具信息
    public async getPropsData(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<PropsData>('/Cats/getPropInfo', 'GET');
        if (res && res.code === 200) {
            this._propsData = res.data;
            cb && cb();
        }
    }

    // 领取加速卡任务
    public async getCard(type: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/Cats/receiveAccelerationCard', 'GET', { type });
        if (res && res.code === 200) {
            cb && cb();
        }
    }

    // 使用加速卡
    public async useCard(num: string, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/cats/useFeedAccelerateCard', 'GET', { num });
        if (res && res.code === 200) {
            cb && cb();
        }
    }

    public flyProps(propSprite: Sprite, origPos: Vec3, targetNode: Node, cb: Function) {
        propSprite.node.setPosition(origPos);
        propSprite.node.scale = Vec3.ZERO;
        propSprite.node.eulerAngles = Vec3.ZERO;
        propSprite.color = new Color(255, 255, 255, 255);
        propSprite.node.active = true;
        let toPos = CocosUtils.setNodeToTargetPos(propSprite.node, targetNode);

        tween(propSprite.node)
            .to(5 / 30, { scale: v3(1.3, 1.3, 1) })
            .to(10 / 30, { scale: v3(1.3, 1.3, 1) })
            .to(15 / 30, { scale: v3(.6, .6, 1) })
            .to(5 / 30, { scale: Vec3.ZERO })
            .start();
        setTimeout(() => {
            tween(propSprite.node)
                .to(5 / 30, { eulerAngles: v3(0, 0, -10) })
                .to(5 / 30, { eulerAngles: v3(0, 0, 0) })
                .start();
        }, 5 / 30 * 1000);
        setTimeout(() => {
            tween(propSprite.node)
                .to(20 / 30, { position: toPos })
                .call(() => {
                    propSprite.node.active = false;
                    cb && cb();
                })
                .start();
        }, 15 / 30 * 1000);
    }

    public showUsePropPanel(type: UsePropPanelType) {
        if (PropsMgr.ins.cardNum > 0) {
            qc.panelRouter.showPanel({ panel: PanelConfigs.usePropPanel, data: { type } });
        }
        else {
            CommonPopMgr.ins.showPop(CommonPopType.PropNotEnough);
        }
    }
}