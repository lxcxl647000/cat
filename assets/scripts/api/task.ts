import { PlatformConfig } from "../framework/lib/platform/configs/PlatformConfig";
import { httpMgr } from "../framework/lib/net/httpMgr";

interface TaskData {
    category: Category;
    tag: Tag;
    task: Task[];
}

export interface Task {
    id: string;
    title: string;
    subtitle: string;
    button_text: string;
    list_order: string;
    image: string;
    task_type: string;
    is_single: string;
    jump_url: string;
    jump_appid: string;
    jump_pages: string;
    extra_data: string;
    integral: string;
    money: string;
    feed: string;
    reward_type: string;
    is_dev: string;
    is_minute_repeat: string;
    browse_time: string;
    owner_id: string;
    status: string;
    life_task_id: string;
    is_virtual: string;
    life_order: string;
    last_click_time: string;
    today_click_amount: string;
    today_limit_click_amount: string;
    total_click_amount: string;
    total_limit_click_amount: string;
    scene_id: string;
    ad_id: string;
    group_id: string;
    xcx_name: string;
    xcx_logo: string;
    is_block: string;
    finish_num: string;
    is_recommend: string;
    flow_id: string;
    corner: string;
    template: string;
    temp_type: string;
    transfer_config: string;
    transfer_title: string;
    tag: string;
    category_id: string;
    isComplete: number;
    finish_complete_num: number;
    friends_status: number;
}

interface Tag {
    special: string[];
    allList: string[];
    index: string[];
    clean: any[];
    sign: any[];
}

interface Category {
    index: string;
    special: string;
}


interface TaskCompleteData {
    task: number;
    isDouble: boolean;
    card_type: number;
    prop: null;
    award_type: string;
    award: number;
}

export class taskApi {
    private static _ins: taskApi = null;

    private _taskList: Task[] = [];
    public get taskList(): Task[] {
        return this._taskList;
    }

    public jumpTask: Task = null;
    public recordTime: Date = null

    public static get ins() {
        if (this._ins == null) {
            this._ins = new taskApi();
        }
        return this._ins;
    }

    public async getTaskList(cb: Function) {
        let res = await httpMgr.ins.xhrRequest<TaskData>('/task/getList');
        if (res) {
            this._taskList = res.data.task.filter((item: Task) => item.isComplete !== 1);
            cb && cb();
        }
    }

    public async clickTask(taskId: number, cb: Function) {
        let res = await httpMgr.ins.xhrRequest('/Task/taskClickLog', 'GET', { taskId, channelId: PlatformConfig.ins.config.adzoneId });
        if (res) {
            cb && cb();
        }
    }

    public async completeTask(task, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<TaskCompleteData>('/task/complete', 'GET', { taskId: task.id, channelId: PlatformConfig.ins.config.adzoneId });
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 完成翻倍任务
    public async completeDoubleTask(task, cb: Function) {
        let res = await httpMgr.ins.xhrRequest<TaskCompleteData>('/Task/double', 'GET', { task_id: task.id });
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 阶段性奖励
    public async getTaskRewardStages(cb: Function) {
        let res=  await httpMgr.ins.xhrRequest('/cats/getTaskRewardStagesV2', 'GET');
        if (res && res.data) {
            cb && cb(res.data);
        }
    }

    // 领取阶段性奖励
    public async claimStageReward(stage: string, cb: Function) {
        let res=  await httpMgr.ins.xhrRequest('/cats/claimStageRewardV2', 'GET', { stage: stage});
        if (res && res.data) {
            cb && cb(res.data);
        }
    }
}