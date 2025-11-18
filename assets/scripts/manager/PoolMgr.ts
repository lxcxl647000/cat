import { NodePool, Prefab, Node, instantiate } from "cc";
import CocosUtils from "../utils/CocosUtils";
import { BundleConfigs } from "../configs/BundleConfigs";

export default class PoolMgr {
    private nodePools: { [index: string]: NodePool } = null;
    private preloadConfig: { bundle: string, path: string, defaultNum: number }[] = [
        { bundle: BundleConfigs.commonBundle, path: 'prefabs/commonTips', defaultNum: 1 },
        { bundle: BundleConfigs.mainBundle, path: 'prefabs/cat', defaultNum: 1 },
    ];

    private static _ins: PoolMgr;
    public static get ins(): PoolMgr {
        if (!this._ins) {
            this._ins = new PoolMgr();
        }
        return this._ins;
    }

    public preloadPool(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (!this.nodePools) {
                this.nodePools = {};
            }
            let count = 0;
            if (this.preloadConfig.length === 0) {
                resolve();
            }
            else {
                for (let config of this.preloadConfig) {
                    let pool = new NodePool();
                    let key = `${config.bundle}/${config.path}`;
                    this.nodePools[key] = pool;
                    let count2 = 0;
                    for (let i = 0; i < config.defaultNum; i++) {
                        setTimeout(() => {
                            CocosUtils.loadFromBundle<Prefab>(config.bundle, config.path, Prefab).then((prefab: Prefab) => {
                                if (prefab) {
                                    let node = instantiate(prefab);
                                    node['poolkey'] = key;
                                    pool.put(node);
                                }
                                count2++;
                                if (count2 === config.defaultNum) {
                                    count++;
                                    if (count === this.preloadConfig.length) {
                                        resolve();
                                    }
                                }
                            });
                        }, i * 100);
                    }
                }
            }
        });
    }

    public getNodeFromPool(bundle: string, path: string, cb: Function) {
        if (!this.nodePools) {
            this.nodePools = {};
        }
        let key = `${bundle}/${path}`;
        let pool = this.nodePools[key];
        if (!pool) {
            pool = new NodePool();
            this.nodePools[key] = pool;
        }
        let node = pool.get();
        if (!node) {
            CocosUtils.loadFromBundle<Prefab>(bundle, path, Prefab).then((prefab: Prefab) => {
                if (prefab) {
                    node = instantiate(prefab);
                    node['poolkey'] = key;
                    cb && cb(node);
                }
            });
        }
        else {
            cb && cb(node);
        }
    }

    public putNodeToPool(node: Node) {
        if (!node.isValid) {
            return;
        }
        if (!this.nodePools) {
            this.nodePools = {};
        }
        node.removeFromParent();
        let key = node['poolkey'];
        if (key) {
            let pool = this.nodePools[key];
            if (!pool) {
                pool = new NodePool();
                this.nodePools[key] = pool;
            }
            pool.put(node);
        }
    }
}