import { _decorator, Node, instantiate, Label, Color, Animation, EventTouch } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import CustomSprite from "../../commn/CustomSprite";
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
import { taskItems } from './TaskItems';
import EventDef from '../../constants/EventDef';
import { taskApi } from '../../../scripts/api/task';
import {rewardedVideoAd} from "db://assets/scripts/framework/lib/platform/platform_interface";
import CatMgr from '../../manager/CatMgr';
import CommonGetMgr, { GetPropFrom, PropType } from '../../manager/CommonGetMgr';
const { ccclass, property } = _decorator;

@ccclass('TaskPanel')
export class TaskPanel extends PanelComponent {
    @property(Node)
    stageNode: Node = null;
    @property(Node)
    stageNodeLayout: Node = null;
    @property(Node)
    progressBarNode: Node = null;
    @property(ListCom)
    list: ListCom = null;
    @property(Node)
    noDataNode: Node = null;
    @property(Node)
    ruleNode: Node = null;
    @property(Node)
    doubleNode: Node = null;
    private reward = null;
    private taskRewardStateList: any = {};

    // 获取阶段性奖励
    private async getRewardStages() {
        await taskApi.ins.getTaskRewardStages(async (res) => {
            console.log(res);
            this.stageNodeLayout.destroyAllChildren();
            this.taskRewardStateList = res.list;
            const completeCount = [];

            for (let i = 0; i < this.taskRewardStateList.length; i++) {
                let itemNode = instantiate(this.stageNode);
                itemNode.active = true;
                this.stageNodeLayout.addChild(itemNode);
                completeCount.push(this.taskRewardStateList[i].stage);

                const completeLabel = itemNode.getChildByName('completeLabel');
                completeLabel.getComponent(Label).string = `${completeCount[i].toString()}次`;

                if (this.taskRewardStateList[i].claimed === 2) { // 已领取
                    itemNode.getChildByName('completeIcon').active = true;
                    itemNode.getChildByName('dot').getComponent(CustomSprite).index = 2;
                    itemNode.getComponent(Animation).stop();
                } else if (this.taskRewardStateList[i].claimed === 1) {// 待领取
                    completeLabel.getComponent(Label).string = '待领取';
                    itemNode.getComponent(Animation).play();
                    completeLabel.getComponent(Label).color = new Color(255, 81, 43, 255);
                    itemNode.getChildByName('dot').getComponent(CustomSprite).index = 1;
                }

                // 1,3--礼包，2,4,5--红包
                if (i === 0 || i === 2) {
                    if (this.taskRewardStateList[i].claimed === 2) { // 已领取
                        itemNode.getComponentInChildren(CustomSprite).index = 2;
                    } else if (this.taskRewardStateList[i].claimed === 1) { // 待领取
                        itemNode.getComponentInChildren(CustomSprite).index = 1;
                    } else {
                        itemNode.getComponentInChildren(CustomSprite).index = 0;
                    }
                }

                const moneyLabel = itemNode.getChildByName('image').getChildByName('money');
                if (i === 1 || i === 3 || i === 4) {
                    if (this.taskRewardStateList[i].claimed === 2) { // 已领取
                        itemNode.getComponentInChildren(CustomSprite).index = 5;
                    } else if (this.taskRewardStateList[i].claimed === 1) { // 待领取
                        itemNode.getComponentInChildren(CustomSprite).index = 4;
                        moneyLabel.active = true;
                        moneyLabel.getChildByName('yuan').active = true;
                    } else {
                        itemNode.getComponentInChildren(CustomSprite).index = 3;
                        moneyLabel.active = true;
                        moneyLabel.getChildByName('yuan').active = true;
                    }
                }
                if (i === 1) {
                    moneyLabel.getComponent(Label).string = '0.3';
                } else if (i === 3) {
                    moneyLabel.getComponent(Label).string = '1';
                } else if (i === 4) {
                    moneyLabel.getComponent(Label).string = '3';
                }
            }
        });
    }

    // 领取阶段性奖励
    private clickStageReward(e: EventTouch) {
        let node = e.currentTarget;
        let stage = node['item'];
        if (stage.claimed == 2) {
            return;
        }
        taskApi.ins.claimStageReward(stage.stage, res => {
            this.getRewardStages();
            // res.data.type: 1--鱼干，2--加速卡，3--红包
            if (res.type == 1) {
                CommonGetMgr.ins.showGetProps(res.desc, GetPropFrom.FromOther, PropType.Fish);
            } else if (res.type == 2) {
                CommonGetMgr.ins.showGetProps(res.desc, GetPropFrom.FromOther, PropType.SpeedCard);
            } else {
                CommonGetMgr.ins.showGetRedPack(res.desc);
            }
        });
    }

    init() {
        this.getRewardStages();
        taskApi.ins.getTaskList(() => {
            this._initRenwu();
        });
    }

    onRenderRenwuItem(item: Node, index: number) {
        item.active = true;
        let taskItem = item.getComponent(taskItems);
        if (taskItem) {
            taskItem.setData(taskApi.ins.taskList[index]);
        }
    }

    private _initRenwu() {
        this.noDataNode.active = taskApi.ins.taskList.length === 0;
        this.list.numItems = taskApi.ins.taskList.length === 0 ? 0 : taskApi.ins.taskList.length;
    }

    private _updateList() {
        taskApi.ins.getTaskList(() => {
            this.list.numItems = 0;
            this._initRenwu();
        });
        this.getRewardStages();
    }

    private _onShowPage(isSuccess?: boolean) {
        if (taskApi.ins.jumpTask) {
            // @ts-ignore
            let readTimeBool = (new Date() - taskApi.ins.recordTime) / 1000 < taskApi.ins.jumpTask.browse_time;
            let flag = false;
            if (taskApi.ins.jumpTask.task_type == '12') { // 激励广告
                if (!isSuccess) {
                    CommonTipsMgr.ins.showTips('未完成广告任务');
                }
                else {
                    flag = true;
                }

            } else if (taskApi.ins.jumpTask.task_type == '8') {
                if (readTimeBool) {
                    CommonTipsMgr.ins.showTips(`访问${taskApi.ins.jumpTask.browse_time}秒以上,才能领取奖励哦`);
                    taskApi.ins.recordTime = null;
                }
                else {
                    flag = true;
                }
            }
            if (flag) {
                taskApi.ins.completeTask(taskApi.ins.jumpTask, (res) => {
                    if (res.task === 1) {// res.data.task == 1任务完成，不发奖励
                        this._updateList();
                    } else if (res.task === 2) {
                        this.reward = res.award;
                        CatMgr.ins.getCatData();
                        if (res.isDouble) {
                            // 翻倍任务
                            this.doubleNode.active = true;
                        } else {
                            this._updateList();
                            CommonTipsMgr.ins.showTips(+res.award);
                        }
                    }
                });
            }

            taskApi.ins.jumpTask = null;
        }
    }

    // 直接关闭翻倍弹框
    handleCloseDoubleTask() {
        this.doubleNode.active = false;
        CommonTipsMgr.ins.showTips(this.reward);
        this._updateList();
    }

    // 完成翻倍任务
    handleCompleteDoubleTask() {
        let ad: rewardedVideoAd = {
            adUnitId: 'mm_35753112_3297550185_116044200390',
            successCb: (e) => {
                taskApi.ins.completeDoubleTask(taskApi.ins.jumpTask, (res) => {
                    CommonTipsMgr.ins.showTips(10);
                    CatMgr.ins.getCatData();
                });
            },
            failCb: (e) => {
                CommonTipsMgr.ins.showTips('看完广告后才能领取奖励哦');
            },
        }
        qc.platform.showRewardedAd(ad);
    }

    _onshow() {
        if (taskApi.ins.jumpTask.task_type == '8') {
            this._onShowPage();
        }
    }

    private _taskCompleted(isSuccess?: boolean) {
        this._onShowPage(isSuccess);
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.Update_TaskList, this._updateList, this);
        qc.eventManager.on(EventDef.OnShow, this._onshow, this);
        qc.eventManager.on(EventDef.TaskCompleted, this._taskCompleted, this);
        this.init();
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.Update_TaskList, this._updateList, this);
        qc.eventManager.off(EventDef.OnShow, this._onshow, this);
        qc.eventManager.off(EventDef.TaskCompleted, this._taskCompleted, this);
    }

    show(option: PanelShowOption): void {
        option.onShowed();
    }

    hide(option: PanelHideOption): void {
        option.onHided();
    }

    // 关闭弹框
    handleClosePop() {
        qc.panelRouter.hide({
            panel: PanelConfigs.taskPanel
        })
    }

    // 打开规则弹框
    handleOpenRule() {
        this.ruleNode.active = true;
    }

    // 关闭规则弹框
    handleCloseRule() {
        this.ruleNode.active = false;
    }
}


