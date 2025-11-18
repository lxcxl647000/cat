import { _decorator, Component, Sprite, Label, Node, Color } from 'cc';
import { qc } from '../../framework/qc';
import CocosUtils from "../../utils/CocosUtils";
import { rewardedVideoAd } from '../../framework/lib/platform/platform_interface';
import EventDef from '../../constants/EventDef';
import { taskApi, Task } from '../../../scripts/api/task';
import CustomSprite from "db://assets/scripts/commn/CustomSprite";
const { ccclass, property } = _decorator;

@ccclass('taskItems')
export class taskItems extends Component {
    @property(Sprite)
    taskBg: Sprite = null;
    @property(Label)
    title: Label = null;
    @property(Label)
    subtitle: Label = null;
    @property(Node)
    taskBtn: Node = null;
    @property(Label)
    feed: Label = null;
    @property(Node)
    corner: Node = null;
    @property(Sprite)
    taskImg: Sprite = null;

    private _task: Task = null;

    public get task() {
        return this._task;
    }

    // 加载远程图片
    setRemoteImage(url: string, nodeSprite: Sprite) {
        CocosUtils.loadRemoteTexture(url, nodeSprite);
    }

    // 任务中心
    public setData(task: Task) {
        this._task = task;
        this.title.string = task.title;
        this.subtitle.string = task.subtitle;
        this.feed.string = `+${task.feed}g` ;
        this.taskBtn.getChildByName('btnLabel').getComponent(Label).string = task.button_text;
        this.setRemoteImage(task.image, this.taskImg);

        const btnLabel = this.taskBtn.getChildByName('btnLabel').getComponent(Label);
        if (task.corner !== '') {
            this.corner.active = true;
            this.corner.getComponentInChildren(Label).string = task.corner;
        }
        if (task.temp_type === '') {
            this.taskBtn.getComponent(CustomSprite).index = 0;
            // this.title.getComponent(Label).color = new Color(0, 0, 0, 255);
            // this.subtitle.getComponent(Label).color = new Color(127, 127, 127, 255);
            // this.feed.getComponent(Label).color = new Color(255, 60, 0, 255);
        } else {
            this.setRemoteImage(task.template, this.taskBg);
            if (task.temp_type === '1') {
                this.taskBtn.getComponent(CustomSprite).index = 1;
                this.subtitle.getComponent(Label).color = new Color(186, 73, 24, 255);
            } else if (task.temp_type === '2' || task.temp_type === '5') {
                if (task.temp_type === '2') {
                    this.taskBtn.getComponent(CustomSprite).index = 2;
                    btnLabel.color = new Color(174, 44, 4, 255);
                } else if (task.temp_type === '5') {
                    this.taskBtn.getComponent(CustomSprite).index = 5;
                    btnLabel.color = new Color(255, 98, 63, 255);
                }
                this.title.getComponent(Label).color = new Color(255, 255, 255, 255);
                this.subtitle.getComponent(Label).color = new Color(255, 255, 255, 255);
                this.feed.getComponent(Label).color = new Color(255, 246, 148, 255);
            } else if (task.temp_type === '3') {
                this.taskBtn.getComponent(CustomSprite).index = 3;
                this.title.getComponent(Label).color = new Color(146, 39, 0, 255);
                this.subtitle.getComponent(Label).color = new Color(196, 93, 49, 255);
            } else if (task.temp_type === '4') {
                this.taskBtn.getComponent(CustomSprite).index = 4;
                this.title.getComponent(Label).color = new Color(97, 60, 0, 255);
                this.subtitle.getComponent(Label).color = new Color(158, 98, 0, 255);
                this.feed.getComponent(Label).color = new Color(255, 106, 0, 255);
            }
        }
    }

    // 去完成
    handleComplete() {
        if (!this._task) {
            return;
        }
        try {
            taskApi.ins.jumpTask = this._task;
            taskApi.ins.clickTask(+this._task.id, () => {
                taskApi.ins.recordTime = new Date();
                let task_type = +this._task.task_type;
                switch (task_type) {
                    case 8:// 跳转//
                        if (this._task.jump_pages) {
                            taskApi.ins.jumpTask = this._task;
                            location.href = this._task.jump_pages;
                        }
                        break;
                    case 12:// 激励广告//
                        if (this._task.ad_id) {
                            let ad: rewardedVideoAd = {
                                adUnitId: this._task.ad_id,
                                successCb: (e) => {
                                    qc.eventManager.emit(EventDef.TaskCompleted, e.isCompleted);
                                },
                                failCb: (e) => {
                                    qc.eventManager.emit(EventDef.TaskCompleted, e.isCompleted);
                                },
                            }
                            qc.platform.showRewardedAd(ad);
                        }
                        break;
                    default:
                        break;
                }

            });
        } catch (error) {
        }
    }
}