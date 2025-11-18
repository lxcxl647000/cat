import { _decorator, Component, Label, Node, sp, Sprite, tween, Vec3 } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import EventDef from '../../constants/EventDef';
import PropsMgr from '../../manager/PropsMgr';
import { PropTaskItem, PropTaskType } from './PropTaskItem';
import { UsePropPanelType } from './UsePropPanel';
import PoolMgr from '../../manager/PoolMgr';
import { BundleConfigs } from '../../configs/BundleConfigs';
import { CatAniName } from '../../manager/CatMgr';
const { ccclass, property } = _decorator;

@ccclass('PropsPanel')
export class PropsPanel extends PanelComponent {
    @property(Node)
    bgNode: Node = null;
    @property(Node)
    bgTop: Node = null;
    @property(Node)
    bgBottom: Node = null;
    @property(Node)
    startPosNode: Node = null;
    @property(Sprite)
    propSprite: Sprite = null;
    @property(Node)
    noneNode: Node = null;
    @property(Node)
    flyPropOrigPosNode: Node = null;
    @property(Node)
    useNode: Node = null;
    @property(Label)
    cardNumLabel: Label = null;
    @property(Node)
    taskLayout: Node = null;
    @property(Node)
    catPosNode: Node = null;
    @property(Node)
    showDrinkNode: Node = null;


    private _flyPropOrigPos: Vec3 = null;
    private _propsTasks: PropTaskType[] = [PropTaskType.DrinkWater, PropTaskType.DriedFish, PropTaskType.DrinkWaterTask, PropTaskType.CatFeedTask];

    show(option: PanelShowOption): void {
        this._flyPropOrigPos = this.flyPropOrigPosNode.position.clone();
        option.onShowed();
        this._init();
        setTimeout(() => {
            this.bgNode.setPosition(this.startPosNode.position);
            let distance = this.bgTop.position.y - this.bgBottom.position.y;
            CocosUtils.upPanelAnimation(this.bgNode, distance, null);
        }, 50);
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.FlyPropInPropPanel, this._flyProps, this);
        qc.eventManager.on(EventDef.UseCard, this.onClickClose, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.FlyPropInPropPanel, this._flyProps, this);
        qc.eventManager.off(EventDef.UseCard, this.onClickClose, this);
    }

    private _init() {
        PropsMgr.ins.getPropsData(() => {
            this._updateUI();
        });
    }

    private _updateUI() {
        this._updatePropItem();
        this._updatePropTask();
    }

    private _updatePropItem() {
        if (PropsMgr.ins.cardNum > 0) {
            this.useNode.active = true;
            this.noneNode.active = false;
            this.cardNumLabel.string = PropsMgr.ins.cardNum + '张可用';
        }
        else {
            this.useNode.active = false;
            this.noneNode.active = true;
        }
    }

    private _updatePropTask() {
        for (let i = 0; i < this._propsTasks.length; i++) {
            let type = this._propsTasks[i];
            let item = this.taskLayout.children[i];
            let taskItem = item.getComponent(PropTaskItem);
            if (taskItem) {
                taskItem.init(type, this);
            }
        }
    }

    onClickClose(cb: Function) {
        let distance = this.bgTop.position.y - this.bgBottom.position.y;
        CocosUtils.downPanelAnimation(this.bgNode, distance, () => {
            cb && cb instanceof Function && cb();
            qc.panelRouter.hide({ panel: PanelConfigs.propsPanel });
        });
    }

    onUseCard() {
        PropsMgr.ins.showUsePropPanel(UsePropPanelType.Type1);
    }

    private _flyProps() {
        PropsMgr.ins.flyProps(this.propSprite, this._flyPropOrigPos, this.noneNode, () => {
            this._updatePropItem();
        });
    }

    public showDrink(cb: Function) {
        this.showDrinkNode.active = true;
        PoolMgr.ins.getNodeFromPool(BundleConfigs.mainBundle, 'prefabs/cat', (node: Node) => {
            this.node.addChild(node);
            node.active = false;
            let startPos = CocosUtils.setNodeToTargetPos(node, this.startPosNode);
            startPos.y -= 50;
            node.setPosition(startPos);
            node.active = true;
            let toPos = CocosUtils.setNodeToTargetPos(node, this.catPosNode);
            tween(node)
                .to(10 / 30, { position: toPos })
                .call(() => {
                    CocosUtils.playSkeletonAni(node.getComponent(sp.Skeleton), CatAniName.Drink, false, () => {
                        let toPos = CocosUtils.setNodeToTargetPos(node, this.startPosNode);
                        tween(node)
                            .to(5 / 30, { position: toPos })
                            .call(() => {
                                PoolMgr.ins.putNodeToPool(node);
                                this.showDrinkNode.active = false;
                                cb && cb();
                            })
                            .start();
                    });
                })
                .start();
        });
    }
}