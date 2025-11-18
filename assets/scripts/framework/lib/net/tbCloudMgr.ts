import cloud from '@tbmp/mp-cloud-sdk';
import { PlatformConfig } from '../platform/configs/PlatformConfig';

export class tbCloudMgr {
    private static _instance: tbCloudMgr;
    private _cloudObject = null;
    public static get ins() {
        if (!tbCloudMgr._instance) {
            tbCloudMgr._instance = new tbCloudMgr();
        }
        return tbCloudMgr._instance;
    }
    public init(cb: Function): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('appid : === ' + PlatformConfig.ins.config.appId);
            if (!this._cloudObject) {
                this._cloudObject = new cloud['Cloud']();
                try {
                    this._cloudObject.init({
                        env: 'online'
                    });
                    this.getToken(cb);
                    resolve();
                } catch (e) {
                    console.error("cloud初始化错误：" + e);
                    reject();
                }
            }
            else {
                this.getToken(cb);
                resolve();
            }
        });
    }
    async getToken(cb: Function) {
        const config = {
            path: '/TaoBaoCallback/happyCatchingCatBack',
            method: 'GET',
            headers: {
                "Content-Type": "application/json;charset=UTF-8"
            },
            params: {
                name: "hanruo",
                action: "test"
            },
            exts: {
                cloudAppId: "56171",
                timeout: 4000,
                domain: PlatformConfig.ins.config.domain
            }
        };
        console.log("请求配置:", JSON.stringify(config, null, 2));
        try {
            const result = await this._cloudObject.application.httpRequest(config);
            console.log("请求结果:", JSON.stringify(result, null, 2));
            let res = JSON.parse(result);
            console.log('userid : === ' + res.user_id);
            console.log('token : === ' + res.token);
            PlatformConfig.ins.config.token = res.token;
            PlatformConfig.ins.config.userId = res.user_id;
            cb && cb();
        } catch (error) {
            console.error("请求失败:", error);
        }
    }
}