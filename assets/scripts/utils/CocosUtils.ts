import { Asset, AssetManager, assetManager, ImageAsset, Node, SkeletalAnimation, sp, Sprite, SpriteFrame, Texture2D, tween, UITransform, v3, Vec2, Vec3 } from "cc";
import AssetLoader from "../framework/lib/asset/AssetLoader";

export default class CocosUtils {
    /**
     * 通过目标节点的世界坐标转换成需要设置的节点的ui坐标
     * @param node 
     * @param target 
     * @returns 
     */
    public static setNodeToTargetPos(node: Node, target: Node): Vec3 {
        let pos = new Vec3(0, 0, 0);
        if (!node || !target || !node.parent) {
            return pos;
        }
        let targetUITransform = target.getComponent(UITransform);
        if (!targetUITransform) {
            return pos;
        }
        let nodeParentUITransform = node.parent.getComponent(UITransform);
        if (!nodeParentUITransform) {
            return pos;
        }
        let targetWorldPos = targetUITransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        pos = nodeParentUITransform.convertToNodeSpaceAR(targetWorldPos);
        return pos;
    }

    /**
     * 加载远程图片
     * @param url 
     * @param sprite 
     */
    public static loadRemoteTexture(url: string, sprite: Sprite, ext: string = '') {
        assetManager.loadRemote<ImageAsset>(url, { ext }, function (err, imageAsset) {
            if (err) {
                console.log(err);
                return;
            }
            const spriteFrame = new SpriteFrame();
            const texture = new Texture2D();
            texture.image = imageAsset;
            spriteFrame.texture = texture;
            sprite.spriteFrame = spriteFrame;
        });
    }

    /**
     * 从自定义bundle里动态加载图片
     * @param bundleName 
     * @param path 
     * @param sprite 
     */
    public static loadTextureFromBundle(bundleName: string, path: string, sprite: Sprite, cb?: Function) {
        CocosUtils.loadFromBundle<ImageAsset>(bundleName, path, Asset).then((imageAsset: ImageAsset) => {
            if (imageAsset) {
                const spriteFrame = new SpriteFrame();
                const texture = new Texture2D();
                texture.image = imageAsset;
                spriteFrame.texture = texture;
                if (sprite) {
                    sprite.spriteFrame = spriteFrame;
                }
                cb && cb();
            }
        })
    }

    public static loadFromBundle<T extends Asset>(bundleName: string, path: string, type: typeof Asset): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            let loadBundle = (bundle: AssetManager.Bundle) => {
                bundle.load(path, type, (error: Error, resLoad: T) => {
                    error ? resolve(null) : resolve(resLoad);
                });
            };
            let bundle: AssetManager.Bundle = assetManager.getBundle(bundleName);
            if (bundle == null) {
                AssetLoader.loadBundle(bundleName).then((bundle: AssetManager.Bundle) => {
                    loadBundle(bundle);
                })
            } else {
                loadBundle(bundle);
            }
        });
    }

    // 打开弹窗动画
    public static openPopAnimation(totalNode: Node, cb: Function) {
        if (totalNode) {
            if (totalNode) {
                totalNode.setScale(0.3, 0.3);
                tween(totalNode)
                    .to(5 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                    .to(4 / 30, { scale: new Vec3(.95, .95, 1) }, { easing: 'sineInOut' })
                    .to(4 / 30, { scale: new Vec3(1, 1, 1) }, { easing: 'sineInOut' })
                    .call(() => {
                        cb && cb();
                    })
                    .start();
            }
        }
        else {
            cb && cb();
        }
    }

    // 关闭弹窗动画
    public static closePopAnimation(totalNode: Node, cb: Function) {
        if (totalNode) {
            if (totalNode) {
                tween(totalNode)
                    .to(5 / 30, { scale: Vec3.ZERO }, { easing: 'sineInOut' })
                    .call(() => {
                        cb && cb();
                    })
                    .start();
            }
        }
        else {
            cb && cb();
        }
    }

    // 贝塞尔曲线
    public static bezierTo(target: any, duration: number, from: Vec3, c1: Vec3, c2: Vec3, to: Vec3, opts: any) {
        opts = opts || Object.create(null);
        let twoBezier = (t: number, p1: Vec3, cp1: Vec3, cp2: Vec3, p2: Vec3) => {
            let x =
                p1.x * (1 - t) * (1 - t) * (1 - t) +
                3 * cp1.x * t * (1 - t) * (1 - t) +
                3 * cp2.x * t * t * (1 - t) +
                p2.x * t * t * t;
            let y =
                p1.y * (1 - t) * (1 - t) * (1 - t) +
                3 * cp1.y * t * (1 - t) * (1 - t) +
                3 * cp2.y * t * t * (1 - t) +
                p2.y * t * t * t;
            return v3(x, y, 0);
        };
        opts.onUpdate = (arg: Vec3, ratio: number) => {
            target.position = twoBezier(ratio, from, c1, c2, to);
        };
        return tween(target).to(duration, {}, opts);
    }

    // 向上升起界面动画
    public static upPanelAnimation(totalNode: Node, distance: number, cb: Function) {
        if (totalNode) {
            if (totalNode) {
                tween(totalNode)
                    .to(10 / 30, { position: new Vec3(totalNode.position.x, totalNode.position.y + distance, totalNode.position.z) }, { easing: 'sineInOut' })
                    .call(() => {
                        cb && cb();
                    })
                    .start();
            }
        }
        else {
            cb && cb();
        }
    }

    // 向下下落界面动画
    public static downPanelAnimation(totalNode: Node, distance: number, cb: Function) {
        if (totalNode) {
            if (totalNode) {
                let pos = totalNode.position.clone();
                tween(totalNode)
                    .to(10 / 30, { position: new Vec3(pos.x, pos.y - distance, pos.z) }, { easing: 'sineInOut' })
                    .call(() => {
                        cb && cb();
                    })
                    .start();
            }
        }
        else {
            cb && cb();
        }
    }

    // 播放骨骼动画
    public static playSkeletonAni(skeleton: sp.Skeleton, name: string, loop: boolean, endCB: Function) {
        if (skeleton) {
            if (endCB) {
                skeleton.setCompleteListener(() => {
                    endCB();
                    skeleton.setCompleteListener(null);
                });
            }
            skeleton.setAnimation(0, name, loop);
        }
    }
}