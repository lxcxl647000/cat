export interface Platform {
    appId: string;
    baseUrl: string;
    domain: string;
    apiVersion: string;
    adzoneId: string;
    token: string;
    userId: number;
    adUnitIds: string[];
    gm: boolean;
}
export class PlatformConfig {
    private _platformConfig: Platform = null;
    private static _ins: PlatformConfig = null;


    public static get ins() {
        if (this._ins == null) {
            this._ins = new PlatformConfig();
        }
        return this._ins;
    }

    public get config() {
        return this._platformConfig;
    }

    public set config(config: Platform) {
        this._platformConfig = config;
    }
}