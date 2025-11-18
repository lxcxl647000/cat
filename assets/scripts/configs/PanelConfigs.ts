import { PanelConfig } from "../framework/lib/router/PanelConfig";
import { BundleConfigs } from "./BundleConfigs";

/**
 * 面板图层层级（层级大的显示在最前面）
 */
enum PanelLayerEnum {
    /**
     * 普通界面
     */
    UILayer = 200,

    /**
     * 弹窗层级
     */
    PopLayer = 400,
    /**
     * 弹窗层级
     */
    PopLayer1 = 401,
}

/**
 * 游戏面板配置
 */
export const PanelConfigs = {
    // ///////////////////////////////////////////////////////
    // 普通页面层级

    /**
     * 游戏启动页面板
     */
    bootPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.bootBundle}/prefabs/BootPanel`,
        layerZIndex: PanelLayerEnum.UILayer,
        index: 0,
    },
    /**
     * 主界面
     */
    mainPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.mainBundle}/prefabs/MainPanel`,
        layerZIndex: PanelLayerEnum.UILayer,
        index: 0,
    },

    // ///////////////////////////////////////////////////////
    // 弹窗层级
    getPropsPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.getPropsBundle}/prefabs/GetPropsPanel`,
        layerZIndex: PanelLayerEnum.PopLayer1,
        index: 2,
    },
    loadingPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.loadingBundle}/prefabs/LoadingPanel`,
        layerZIndex: PanelLayerEnum.PopLayer1,
        index: 3,
    },
    taskPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.taskBundle}/prefabs/TaskPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1
    },
    getRedPackPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.getPropsBundle}/prefabs/GetRedPackPanel`,
        layerZIndex: PanelLayerEnum.PopLayer1,
        index: 2,
    },
    propsPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.propBundle}/prefabs/PropsPanel`,
        layerZIndex: PanelLayerEnum.UILayer,
        index: 1
    },
    usePropPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.propBundle}/prefabs/UsePropPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1
    },
    commonPopPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.commonPopBundle}/prefabs/CommonPopPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1
    },
    redpackExchangePanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.redpackExchangeBundle}/prefabs/RedpackExchangePanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1
    },
    logListPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.LogListBundle}/prefabs/LogListPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1,
    },
    strategyPanel: <PanelConfig>{
        prefabPath: `${BundleConfigs.strategyBundle}/prefabs/StrategyPanel`,
        layerZIndex: PanelLayerEnum.PopLayer,
        index: 1
    },
};
