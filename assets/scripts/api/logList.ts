import { httpMgr } from "../framework/lib/net/httpMgr";
export default class LogList {
    private static _instance: LogList = null;
    public static get ins(): LogList {
        if (this._instance == null) {
            this._instance = new LogList();
        }
        return this._instance;
    }

    public async getLogList(data) {

        try {
            let res = await httpMgr.ins.xhrRequest<any>('/XcxLog/getLogList', 'GET', data)

            return res
        } catch (error) {

            // 可以抛出错误或返回默认值
            throw error;
        }

    }
}