import { httpMgr } from "../framework/lib/net/httpMgr";
import { PlatformConfig } from "../framework/lib/platform/configs/PlatformConfig";
export default class Login {
    private static _instance: Login = null;
    public static get ins(): Login {
        if (this._instance == null) {
            this._instance = new Login();
        }
        return this._instance;
    }

    // 登录
    public async login(api: string, data: any, cb: Function) {
        try {
            let res = await httpMgr.ins.xhrRequest<any>(api, 'POST', data);
            if (res && res.code === 200) {
                let { token, user_id } = res.data;
                PlatformConfig.ins.config.token = token;
                PlatformConfig.ins.config.userId = user_id;
                cb && cb(res);
            }
        } catch (error) {
            console.log(error);
        }
    }
}