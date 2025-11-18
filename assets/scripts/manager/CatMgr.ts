import EventDef from "../constants/EventDef";
import { httpMgr } from "../framework/lib/net/httpMgr";
import { qc } from "../framework/qc";
import { UsePropPanelType } from "../panels/propspanel/UsePropPanel";
import CommonPopMgr, { CommonPopType } from "./CommonPopMgr";
import PropsMgr from "./PropsMgr";

export interface CatData {
    percent: number;
    can_clean: number;
    need_task: number;
    feed: string;// 鱼干数量
    furball: string;// 毛球进度
    furball_num: string;// 毛球数量
    mood: string;
    feed_end: string;
    feeding_status: string;// 0未吃鱼干 1吃鱼干
    mood_status: string;// 白天正常'normal'  白天高兴'happy'  白天难过'sad'
}

export interface TomorrowData {
    reward_amount: number;// canClaim为0时显示today_amount
    canClaim: number;// 0不可领 1可领
    today_amount: number;// canClaim为1时显示today_amount
    wearType: number;
    bee_feed: number;
    talk: Talk;
    carpetType: number;
    bee_canClaim: number;
}

interface Talk {
    feeding_touch: TalkInfo[];
    after_feeding: TalkInfo[];
    hungry_touch: TalkInfo[];
    after_clean: TalkInfo[];
    sad: TalkInfo[];
    sad_touch: TalkInfo[];
    friend_home: TalkInfo[];
}

interface TalkInfo {
    type: string;
    content: string;
    status: number;
}

export enum CatAniName {
    Routine = 'routine',// 常规状态
    Eat_Fish = 'eat_fish',// 吃鱼干
    Sad = 'nanguo',// 难过
    Drink = 'drink',// 喝水
    Sleep = 'sleep',// 睡觉
    Touch = 'fumo',// 手掌抚摸
    Click = 'dianji',// 互动点击
    Happy = 'happy',// 开心
}

export enum DayState {
    Day,// 白天
    Night,// 晚上
}

export default class CatMgr {
    private _catData: CatData = null;
    public get catData() {
        return this._catData;
    }

    private _tomorrowData: TomorrowData = null;
    public get tomorrowData() {
        return this._tomorrowData;
    }

    private _feedEndTime: number = 0;
    public get feedEndTime() {
        return this._feedEndTime;
    }
    public set feedEndTime(val: number) {
        this._feedEndTime = val;
        if (this._catData) {
            this._catData.feed_end = val.toString();
        }
    }

    private _dayState: DayState = DayState.Day;
    public get dayState() {
        return this._dayState;
    }
    public set dayState(val: DayState) {
        this._dayState = val;
        qc.eventManager.emit(EventDef.UpdateDayState);
    }

    private static _instance: CatMgr = null;
    public static get ins(): CatMgr {
        if (this._instance == null) {
            this._instance = new CatMgr();
        }
        return this._instance;
    }

    public async getCatData(cb?: Function) {
        let res = await httpMgr.ins.xhrRequest<CatData>('/cats/getCatInfo', 'GET');
        if (res && res.code === 200) {
            this._catData = res.data;
            this._feedEndTime = this._catData && this._catData.feed_end && this._catData.feed_end !== '' ? +this._catData.feed_end * 1000 : 0;
            cb && cb();
            qc.eventManager.emit(EventDef.UpdateCatData);
        }
    }

    public async feedCat() {
        let res = await httpMgr.ins.xhrRequest('/cats/feed', 'GET');
        if (res) {
            if (res.code === 200) {// 成功
                CommonPopMgr.ins.showPop(CommonPopType.FeedSuccess);
                CatMgr.ins.getCatData();
            }
            else if (res.code === 2) {// 鱼干不足
                CommonPopMgr.ins.showPop(CommonPopType.FishNotEnough);
            }
            else {// 在喂食去用加速卡
                PropsMgr.ins.showUsePropPanel(UsePropPanelType.Type2);
            }
        }
    }

    public async getBall(cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/cats/collectFurball', 'GET');
        if (res && res.code === 200) {
            cb && cb();
        }
    }

    public async tomorrowGetFish(cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/cats/claimTomorrowReward', 'GET');
        if (res && res.code === 200) {
            cb && cb();
        }
    }

    public async getTomorrowData(cb?: Function) {
        let res = await httpMgr.ins.xhrRequest<TomorrowData>('/Cats/getTomorrowData', 'GET');
        if (res && res.code === 200) {
            this._tomorrowData = res.data;
            cb && cb(res.data);
            qc.eventManager.emit(EventDef.UpdateTomrrowData);
        }
    }
}