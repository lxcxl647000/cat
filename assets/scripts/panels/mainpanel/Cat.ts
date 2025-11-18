import { _decorator, Component, Node, sp } from 'cc';
import CocosUtils from '../../utils/CocosUtils';
import CatMgr, { CatAniName, DayState } from '../../manager/CatMgr';
const { ccclass, property } = _decorator;

@ccclass('Cat')
export class Cat extends Component {
    @property(sp.Skeleton)
    catSkeleton: sp.Skeleton = null;

    onClickCat() {
        CocosUtils.playSkeletonAni(this.catSkeleton, CatAniName.Click, false, () => {
            this.updateCatState();
        });
    }

    public updateCatState() {
        let catMgr = CatMgr.ins;
        let aniName = '';
        if (catMgr.catData.feeding_status === '1') {// 在吃鱼
            aniName = CatAniName.Eat_Fish
        }
        else if (catMgr.dayState === DayState.Day) {// 白天
            if (catMgr.catData.mood_status === 'normal') {
                aniName = CatAniName.Routine;
            }
            else if (catMgr.catData.mood_status === 'sad') {
                aniName = CatAniName.Sad;
            }
            else {
                aniName = CatAniName.Happy;
            }
        }
        else {// 晚上
            aniName = CatAniName.Sleep;
        }
        CocosUtils.playSkeletonAni(this.catSkeleton, aniName, true, null);
    }
}