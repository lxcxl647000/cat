import { _decorator, Component, Label, ProgressBar } from "cc";
import { PanelHideOption, PanelShowOption } from "../../framework/lib/router/PanelComponent";
import { PanelConfigs } from "../../configs/PanelConfigs";
import { qc } from "../../framework/qc";
import PoolMgr from "../../manager/PoolMgr";
import adapter from "../../framework/lib/platform/adapter/adapter";
import AssetLoader from "../../framework/lib/asset/AssetLoader";
import { BundleConfigs } from "../../configs/BundleConfigs";
import { httpMgr } from "../../framework/lib/net/httpMgr";
import { PlatformConfig } from "../../framework/lib/platform/configs/PlatformConfig";
import CustomSprite from "../../commn/CustomSprite";
import CatMgr from "../../manager/CatMgr";
const { ccclass, property } = _decorator;

/**
 * 启动页面板
 *
 */
@ccclass
// export default class BootPanel extends PanelComponent {
export default class BootPanel extends Component {
    @property(ProgressBar)
    loadingProgressBar: ProgressBar = null;
    @property(CustomSprite)
    ageTip: CustomSprite = null;
    @property(Label)
    ageLabel: Label = null;

    private _initData: boolean = false;
    private _initRes: boolean = false;

    show(option: PanelShowOption): void {
        option.onShowed();
        this._init();
    }

    protected onEnable(): void {
        if (adapter.inst.onWx() || adapter.inst.onTt()) {
            this.ageTip.index = 1;
            this.ageLabel.string = '12';
        }
        else {
            this.ageTip.index = 0;
            this.ageLabel.string = '18';
        }
    }

    protected start(): void {
        this._init();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    private async _init() {
        // 登录平台//
        qc.platform.login(async () => {
            qc.platform.getShareInfo(() => {
                httpMgr.ins.xhrRequest('/Public/xcxct', 'GET', { scene: '0', path: '', adzone_id: PlatformConfig.ins.config.adzoneId });
            });
            await CatMgr.ins.getCatData();
            await CatMgr.ins.getTomorrowData();
            this._initData = true;
            if (this._initRes) {
                this._toMainPanel();
            }
        });
        qc.platform.reportScene(301);
        this._initGame();
    }

    private async _initGame() {
        qc.platform.reportScene(302);
        this._onLoadProgressChanged(0.3, "加载游戏资源...");

        await AssetLoader.loadBundle(BundleConfigs.commonBundle);
        await AssetLoader.loadBundle(BundleConfigs.audioBundle);
        await AssetLoader.loadBundle(BundleConfigs.commonBundle);
        this._onLoadProgressChanged(0.5, "加载游戏资源...");

        await AssetLoader.loadBundle(BundleConfigs.mainBundle);
        await qc.panelRouter.loadAsync(PanelConfigs.mainPanel);
        this._onLoadProgressChanged(.8, "加载游戏资源...");

        await AssetLoader.loadBundle(BundleConfigs.LogListBundle);
        await AssetLoader.loadBundle(BundleConfigs.getPropsBundle);
        await AssetLoader.loadBundle(BundleConfigs.taskBundle);
        await AssetLoader.loadBundle(BundleConfigs.propBundle);
        await AssetLoader.loadBundle(BundleConfigs.loadingBundle);
        await AssetLoader.loadBundle(BundleConfigs.redpackExchangeBundle);
        await AssetLoader.loadBundle(BundleConfigs.strategyBundle);
        this._onLoadProgressChanged(.9, "加载游戏资源...");

        await PoolMgr.ins.preloadPool();
        qc.platform.reportScene(303);

        // 打开主界面
        this._onLoadProgressChanged(1.0);
        this._initRes = true;
        if (this._initData) {
            this._toMainPanel();
        }
    }

    private _toMainPanel() {
        this.scheduleOnce(() => {
            qc.panelRouter.show({
                panel: PanelConfigs.mainPanel,
                onShowed: () => {
                    qc.panelRouter.rootNode.getChildByName('BootPanel').destroy();
                },
            });
        }, .3);
    }

    /**
     * 加载进度更新
     *
     * @param pb 加载进度 [0, 1]
     * @param msg 加载描述信息
     */
    private _onLoadProgressChanged(pb: number, msg: string = null) {
        this.loadingProgressBar.progress = pb;
    }
}
