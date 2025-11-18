import { httpMgr } from "../framework/lib/net/httpMgr";


export interface ExchangeData {
    count: number;
    endPage: boolean;
    list: ExchangeItem[];
}

export interface ExchangeItem {
    id: string;
    type: string;
    name: string;
    full: string;
    price: string;
    hairball: string;
    stock_limit: string;
    stock: string;
    get_num: string;
}

export interface RedpackData {
    id: string;
    type: string;
    name: string;
    full: string;
    price: string;
    hairball: string;
    stock_limit: string;
    stock: string;
    get_fake: string;
    get_num: string;
    use_num: string;
    start_get_time: string;
    end_get_time: string;
    expire_day: string;
    sort: string;
    status: string;
    create_time: string;
    update_time: string;
    appid: string;
    furball_num: string;
}

export default class RedpackExchangeMgr {
    private _exchangeData: ExchangeData = null;
    public get exchangeData() {
        return this._exchangeData;
    }

    private static _instance: RedpackExchangeMgr = null;
    public static get ins(): RedpackExchangeMgr {
        if (this._instance == null) {
            this._instance = new RedpackExchangeMgr();
        }
        return this._instance;
    }

    public async getRedpackExchangeList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<ExchangeData>('/RedPacket/getList', 'GET', { type: '3' });
        if (res && res.code === 200) {
            this._exchangeData = res.data;
            this._exchangeData.list = this._exchangeData.list.filter((item: ExchangeItem) => item.type === '3');
            cb && cb();
        }
    }

    public async getRedpack(packet_id: string, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<RedpackData>('/RedPacket/getDetail', 'GET', { packet_id });
        if (res && res.code === 200) {
            cb && cb(res.data);
        }
    }

    public async exchangeRedpack(packet_id: string, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/RedPacket/exchange', 'POST', { packet_id });
        if (res && res.code === 200) {
            cb && cb(res.data);
        }
    }

    public async getExchangeRecordList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<any>('/RedPacket/getLogList', 'GET');
        if (res && res.code === 200) {
            cb && cb(res.data.fake_tips);
        }
    }
}