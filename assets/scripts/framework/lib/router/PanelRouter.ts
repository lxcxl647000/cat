import { assetManager, AssetManager, instantiate, Node, Prefab, v3, Widget } from "cc";
import { PanelComponent } from "./PanelComponent";
import { PanelConfig } from "./PanelConfig";
import { PanelStateEnum } from "./PanelStateEnum";
import { PanelConfigs } from "../../../configs/PanelConfigs";

export default class PanelRouter {
    private static Tag = "PanelRouter";
    private _rootNode: Node = null;
    public get rootNode(): Node { return this._rootNode; }
    private _layerNodeMap: Map<number, Node> = new Map();
    private _panelCacheMap: Map<string, PanelCache> = new Map();
    init(rootNode: Node) {
        this._rootNode = rootNode;
    }
    preload(panelConfig: PanelConfig) {
        let preloadBundlePrefab = (bundle: AssetManager.Bundle) => {
            let prefabPath = panelConfig.prefabPath.substring(panelConfig.prefabPath.indexOf("/") + 1);
            bundle.preload(prefabPath);
        };
        let bundleName = panelConfig.prefabPath.substring(0, panelConfig.prefabPath.indexOf("/"));
        let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
        if (bundle == null) {
            assetManager.loadBundle(bundleName, (error: Error, bundle: AssetManager.Bundle) => {
                preloadBundlePrefab(bundle);
            });
        } else {
            preloadBundlePrefab(bundle);
        }
    }

    loadAsync(panelConfig: PanelConfig): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.load(panelConfig, (error: Error) => {
                error ? reject(error) : resolve();
            });
        });
    }

    load(panelConfig: PanelConfig, onCompleted: (error?: Error) => void) {
        let prefabPath = panelConfig.prefabPath;
        let panelCache = this._panelCacheMap.get(prefabPath);
        if (panelCache) {
            onCompleted(null);
            return;
        }

        panelCache = {
            node: null,
            prefab: null,
            state: PanelStateEnum.Loading,
        };
        this._panelCacheMap.set(prefabPath, panelCache);

        panelCache.state = PanelStateEnum.Loading;
        this._loadBundlePrefab(panelConfig, null, (error: Error, prefab: Prefab) => {
            panelCache = this._panelCacheMap.get(prefabPath);
            if (error) {
                if (!panelCache) {
                } else {
                    if (
                        panelCache.state === PanelStateEnum.LoadFailure ||
                        panelCache.state === PanelStateEnum.LoadSuccess ||
                        panelCache.state === PanelStateEnum.Showing ||
                        panelCache.state === PanelStateEnum.Showed ||
                        panelCache.state === PanelStateEnum.Hiding ||
                        panelCache.state === PanelStateEnum.Hided
                    ) {
                    } else {
                        panelCache.node = null;
                        panelCache.prefab = null;
                        panelCache.state = PanelStateEnum.LoadFailure;
                    }
                }
            } else {
                if (!panelCache) {
                    prefab.decRef();
                } else {
                    if (
                        panelCache.state === PanelStateEnum.LoadFailure ||
                        panelCache.state === PanelStateEnum.LoadSuccess ||
                        panelCache.state === PanelStateEnum.Showing ||
                        panelCache.state === PanelStateEnum.Showed ||
                        panelCache.state === PanelStateEnum.Hiding ||
                        panelCache.state === PanelStateEnum.Hided
                    ) {
                    } else {
                        panelCache.node = null;
                        panelCache.prefab = prefab;
                        panelCache.state = PanelStateEnum.LoadSuccess;
                        panelCache.prefab.addRef();
                    }
                }
            }
            onCompleted(error);
        });
    }

    private _loadBundlePrefab(
        panelConfig: PanelConfig,
        onProgress: (finish: number, total: number, item: AssetManager.RequestItem) => void,
        onCompleted: (error: Error, prefab: Prefab) => void
    ) {
        let loadBundlePrefab = (bundle: AssetManager.Bundle) => {
            let prefabPath = panelConfig.prefabPath.substring(panelConfig.prefabPath.indexOf("/") + 1);
            bundle.load(prefabPath, Prefab, onProgress, (error: Error, prefab: Prefab) => {
                onCompleted(error, prefab);
            });
        };
        let bundleName = panelConfig.prefabPath.substring(0, panelConfig.prefabPath.indexOf("/"));
        let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
        if (bundle == null) {
            assetManager.loadBundle(bundleName, (error: Error, bundle: AssetManager.Bundle) => {
                loadBundlePrefab(bundle);
            });
        } else {
            loadBundlePrefab(bundle);
        }
    }

    showAsync(option: CommonPanelOption) {
        return new Promise<void>((resolve, reject) => {
            this.show({
                panel: option.panel,
                data: option.data,
                onShowed: (error) => {
                    error ? reject(error) : resolve();
                },
            });
        });
    }

    show(option: ShowPanelOption) {
        let prefabPath = option.panel.prefabPath;
        let panelCache = this._panelCacheMap.get(prefabPath);
        if (!panelCache) {
            option.onShowed && option.onShowed(new Error("show error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.Loading) {
            option.onShowed && option.onShowed(new Error("show error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.LoadFailure) {
            option.onShowed && option.onShowed(new Error("show error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.LoadSuccess) {
            this._showPanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Showing) {
            this._showPanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Showed) {
            this._showPanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Hiding) {
            this._showPanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Hided) {
            this._showPanel(option, panelCache);
            return;
        }
    }

    private _showPanel(option: ShowPanelOption, panelCache: PanelCache) {
        if (panelCache.node == null) {
            let panelLayerNode = this._layerNodeMap.get(option.panel.layerZIndex);
            if (panelLayerNode == null) {
                panelLayerNode = new Node();
                let widget: Widget = panelLayerNode.addComponent(Widget);
                widget.top = 0;
                widget.bottom = 0;
                widget.left = 0;
                widget.right = 0;
                widget.isAlignTop = true;
                widget.isAlignBottom = true;
                widget.isAlignLeft = true;
                widget.isAlignRight = true;
                widget.alignMode = Widget.AlignMode.ON_WINDOW_RESIZE;
                this._rootNode.addChild(panelLayerNode);
                panelLayerNode.setSiblingIndex(option.panel.index);
                this._layerNodeMap.set(option.panel.layerZIndex, panelLayerNode);
            }
            let panelNode = instantiate(panelCache.prefab);
            panelNode.setPosition(v3(0, 0, 0));
            panelNode.setParent(panelLayerNode);
            panelCache.node = panelNode;
        }
        panelCache.state = PanelStateEnum.Showing;
        panelCache.node.active = true;
        panelCache.node.getComponent(PanelComponent).show({
            data: option.data,
            onShowed: () => {
                panelCache.state = PanelStateEnum.Showed;
                option.onShowed && option.onShowed();
            },
        });
    }

    hideAsync(option: CommonPanelOption) {
        return new Promise<void>((resolve, reject) => {
            this.hide({
                panel: option.panel,
                data: option.data,
                onHided: (error) => {
                    error ? reject(error) : resolve();
                },
            });
        });
    }

    hide(option: HidePanelOption) {
        let prefabPath = option.panel.prefabPath;
        let panelCache = this._panelCacheMap.get(prefabPath);
        if (!panelCache) {
            option.onHided && option.onHided(new Error("hide error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.Loading) {
            option.onHided && option.onHided(new Error("hide error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.LoadFailure) {
            option.onHided && option.onHided(new Error("hide error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.LoadSuccess) {
            option.onHided && option.onHided(new Error("hide error"));
            return;
        }
        if (panelCache.state === PanelStateEnum.Showing) {
            this._hidePanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Showed) {
            this._hidePanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Hiding) {
            this._hidePanel(option, panelCache);
            return;
        }
        if (panelCache.state === PanelStateEnum.Hided) {
            this._hidePanel(option, panelCache);
            return;
        }
    }

    private _hidePanel(option: HidePanelOption, panelCache: PanelCache) {
        panelCache.state = PanelStateEnum.Hiding;
        panelCache.node.getComponent(PanelComponent).hide({
            data: option.data,
            onHided: () => {
                panelCache.state = PanelStateEnum.Hided;
                panelCache.node.active = false;
                option.onHided && option.onHided();
            },
        });
    }

    destroy(option: CommonPanelOption) {
        let prefabPath = option.panel.prefabPath;
        let panel = this._panelCacheMap.get(prefabPath);
        if (!panel) {
            return;
        }
        if (panel.state === PanelStateEnum.Loading) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
        if (panel.state === PanelStateEnum.LoadFailure) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
        if (panel.state === PanelStateEnum.LoadSuccess) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
        if (panel.state === PanelStateEnum.Showing) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
        if (panel.state === PanelStateEnum.Showed) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
        if (panel.state === PanelStateEnum.Hiding) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
        if (panel.state === PanelStateEnum.Hided) {
            this._destroyPanel(panel, prefabPath);
            return;
        }
    }

    private _destroyPanel(panelCache: PanelCache, prefabPath: string) {
        if (panelCache.node) {
            panelCache.node.destroy();
            panelCache.node = null;
        }
        if (panelCache.prefab) {
            panelCache.prefab.decRef();
            panelCache.prefab = null;
        }
        this._panelCacheMap.delete(prefabPath);
    }

    getPanelState(panelConfig: PanelConfig): PanelStateEnum {
        let panel = this._panelCacheMap.get(panelConfig.prefabPath);
        if (!panel) {
            return null;
        }
        return panel.state;
    }

    public async showPanel(option: ShowPanelOption, withLoading?: boolean) {
        if (withLoading) {
            let _onShowed = option.onShowed;
            option.onShowed = () => {
                _onShowed && _onShowed();
                this.showPanel({
                    panel: PanelConfigs.loadingPanel,
                });
            };
        }
        await this.loadAsync(option.panel);
        this.show(option);
    }
}

interface PanelCache {
    node: Node;
    prefab: Prefab;
    state: PanelStateEnum;
}

export interface CommonPanelOption {
    panel: PanelConfig;
    data?: any;
}

export interface ShowPanelOption extends CommonPanelOption {
    onShowed?(
        error?: Error
    ): void;
}

export interface HidePanelOption extends CommonPanelOption {
    onHided?(
        error?: Error
    ): void;
}