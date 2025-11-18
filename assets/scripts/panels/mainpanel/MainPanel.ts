import { _decorator, Animation, Color, Label, Node, ProgressBar, Sprite, tween, v3, Vec3 } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import CocosUtils from '../../utils/CocosUtils';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { PanelConfigs } from '../../configs/PanelConfigs';
import { Cat } from './Cat';
import PropsMgr from '../../manager/PropsMgr';
import CatMgr, { DayState } from '../../manager/CatMgr';
import TimeUtils from '../../utils/TimeUtils';
import CommonTipsMgr from '../../manager/CommonTipsMgr';
import { UsePropPanelType } from '../propspanel/UsePropPanel';
import CommonPopMgr, { CommonPopType } from '../../manager/CommonPopMgr';
import CustomSprite from '../../commn/CustomSprite';
import Constant from '../../constants/Constant';
const { ccclass, property } = _decorator;

@ccclass('MainPanel')
export class MainPanel extends PanelComponent {
    @property(Node)
    moreNode: Node = null;
    @property(Animation)
    ballAni: Animation = null;
    @property(Node)
    smallFlyBall: Node = null;
    @property(Node)
    largeFlyBall: Node = null;
    @property(Node)
    mediumFlyBall: Node = null;
    @property(Node)
    flyToTarget: Node = null;
    @property(Sprite)
    propSprite: Sprite = null;
    @property(Node)
    propBtnNode: Node = null;
    @property(Label)
    addPropLabel: Label = null;
    @property(Node)
    flyPropOrigPosNode: Node = null;
    @property(Node)
    usePropOrigPosNode: Node = null;
    @property(Sprite)
    lightCircle: Sprite = null;
    @property(Cat)
    cat: Cat = null;
    @property(Node)
    addSpeedNode: Node = null;
    @property(Label)
    feedCountDownLabel: Label = null;
    @property(Label)
    fishCountLabel: Label = null;
    @property(Label)
    ballProgressLabel: Label = null;
    @property(ProgressBar)
    ballProgressBar: ProgressBar = null;
    @property(Label)
    ballCountLabel: Label = null;
    @property(Label)
    tomorrowGetLabel: Label = null;
    @property(Label)
    tomorrowGetCountLabel: Label = null;
    @property(CustomSprite)
    dayStateBg: CustomSprite = null;
    @property(Label)
    userNameLabel: Label = null;
    @property(Sprite)
    userHead: Sprite = null;

    private _isFlying: boolean = false;
    private _flyPropOrigPos: Vec3 = null;
    private _usePropOrigPos: Vec3 = null;

    show(option: PanelShowOption): void {
        option.onShowed();

        PropsMgr.ins.getPropsData(null);

        this._flyPropOrigPos = this.flyPropOrigPosNode.position.clone();
        this._usePropOrigPos = this.usePropOrigPosNode.position.clone();

        this._initUI();
        this._updateTomorrowGetUI();
        this._initName();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected start(): void {
        this._checkDayState();
    }

    private _checkDayState() {
        let now = new Date();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        let leftHour = 0;// 剩余小时数
        let leftMinute = 60 - minute;// 剩余分钟数
        let leftSecond = 60 - second;// 剩余秒数
        let leftTime = 0;
        if (hour >= 6 && hour < 18) {// 白天
            CatMgr.ins.dayState = DayState.Day;
            leftHour = 18 - hour;
        }
        else {// 晚上
            CatMgr.ins.dayState = DayState.Night;
            if (hour < 6) {
                leftHour = 6 - hour;
            }
            else {
                leftHour = 24 - hour + 6;
            }
        }
        leftTime = leftSecond + (leftMinute - 1) * 60 + (leftHour - 1) * 60 * 60 + 1;
        this.scheduleOnce(this._checkDayState.bind(this), leftTime);
    }

    private _initUI() {
        this._updateFeedUI();
        this._updateBallUI();
        this.cat.updateCatState();
    }

    private _updateFeedUI() {
        this.fishCountLabel.string = `${CatMgr.ins.catData.feed}g`;
        let leftTime = CatMgr.ins.feedEndTime - Date.now();
        if (leftTime > 0) {
            this.addSpeedNode.active = true;
            this._startFeedCountDown();
        }
        else {
            this.addSpeedNode.active = false;
            this._stopFeedCountDown();
        }
    }

    private _updateBallUI() {
        this.ballProgressBar.progress = +CatMgr.ins.catData.furball / 100;
        this.ballProgressLabel.string = CatMgr.ins.catData.furball + '%';
        this.ballCountLabel.string = CatMgr.ins.catData.furball_num;
        if (+CatMgr.ins.catData.furball >= 100) {
            this.ballAni.play();
        }
    }

    private _updateTomorrowGetUI() {
        this.tomorrowGetLabel.string = CatMgr.ins.tomorrowData.canClaim === 1 ? '领鱼干' : '明日可领';
        this.tomorrowGetCountLabel.string = (CatMgr.ins.tomorrowData.canClaim === 1 ? CatMgr.ins.tomorrowData.reward_amount : CatMgr.ins.tomorrowData.today_amount) + 'g';
    }

    private _startFeedCountDown() {
        this.schedule(this._feedCountDown.bind(this), 1);
    }

    private _stopFeedCountDown() {
        this.unschedule(this._feedCountDown.bind(this));
    }

    private _feedCountDown() {
        let leftTime = CatMgr.ins.feedEndTime - Date.now();
        if (leftTime) {
            this.feedCountDownLabel.string = TimeUtils.getHHMM(leftTime);
            qc.eventManager.emit(EventDef.FeedCountDown, leftTime);
        }
        else {
            this._stopFeedCountDown();
            CatMgr.ins.getCatData();
        }
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.UpdateDayState, this._updateDayBg, this);
        qc.eventManager.on(EventDef.UpdateCatData, this._initUI, this);
        qc.eventManager.on(EventDef.UpdateTomrrowData, this._updateTomorrowGetUI, this);
        qc.eventManager.on(EventDef.FlyPropInMainPanel, this._flyProp, this);
        qc.eventManager.on(EventDef.UseCard, this._usePropAni, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.UpdateDayState, this._updateDayBg, this);
        qc.eventManager.off(EventDef.UpdateCatData, this._initUI, this);
        qc.eventManager.off(EventDef.UpdateTomrrowData, this._updateTomorrowGetUI, this);
        qc.eventManager.off(EventDef.FlyPropInMainPanel, this._flyProp, this);
        qc.eventManager.off(EventDef.UseCard, this._usePropAni, this);
    }

    onClickMore() {
        this.moreNode.active = !this.moreNode.active;
    }

    onClickBg() {
        if (this.moreNode.active) {
            this.moreNode.active = false;
        }
    }

    onClickBall() {
        if (+CatMgr.ins.catData.furball >= 100) {
            CatMgr.ins.getBall(() => {
                this._flyBall(() => {
                    CommonTipsMgr.ins.showTips('领取成功');
                    CatMgr.ins.getCatData(() => {
                        CommonPopMgr.ins.showPop(CommonPopType.GetBallSuccess);
                    });
                });
            });
        }
        else {
            CommonPopMgr.ins.showPop(CommonPopType.GetBallFail);
        }
    }

    onClickTask() {
        qc.panelRouter.showPanel({ panel: PanelConfigs.taskPanel });
    }

    private _flyBall(cb: Function) {
        if (this._isFlying) return;
        this._isFlying = true;
        this.ballAni.play('ballGetAni');
        // 小球
        this._flyBallAni(this.smallFlyBall, this.flyToTarget, v3(0.6, 0.6, 0), 1, 2, 20 / 30);
        // 大球
        this._flyBallAni(this.largeFlyBall, this.flyToTarget, v3(0.4, 0.4, 0), 32 / 30, 62 / 30, 22 / 30);
        // 中球
        this._flyBallAni(this.mediumFlyBall, this.flyToTarget, v3(0.55, 0.55, 0), 34 / 30, 64 / 30, 24 / 30, () => {
            this._isFlying = false;
            cb && cb();
        });
    }

    private _flyBallAni(ball: Node, toPosNode: Node, toScale: Vec3, delayFly: number, delayScale: number, delayColorA: number, cb?: Function) {
        let startPos = CocosUtils.setNodeToTargetPos(ball, this.ballAni.node);
        ball.position = startPos;
        let toPos = CocosUtils.setNodeToTargetPos(ball, toPosNode);
        let sprite = ball.getComponent(Sprite);
        sprite.color = new Color(255, 255, 255, 0);

        this.scheduleOnce(() => {
            tween(sprite)
                .to(10 / 30, { color: new Color(255, 255, 255, 255) })
                .to(35 / 30, { color: new Color(255, 255, 255, 255) })
                .to(15 / 30, { color: new Color(255, 255, 255, 0) })
                .call(() => {
                    ball.position = startPos;
                    ball.scale = Vec3.ONE;
                    cb && cb();
                })
                .start();
        }, delayColorA);
        this.scheduleOnce(() => {
            CocosUtils.bezierTo(ball, 35 / 30, startPos, v3(-400, 0, 0), v3(0, 900, 0), toPos, null).start();
        }, delayFly);
        this.scheduleOnce(() => {
            tween(ball).to(5 / 30, { scale: toScale }).start();
        }, delayScale);
    }

    private _flyProp() {
        PropsMgr.ins.flyProps(this.propSprite, this._flyPropOrigPos, this.propBtnNode, () => {
            tween(this.addPropLabel)
                .parallel(
                    tween(this.addPropLabel)
                        .to(10 / 30, { color: new Color(255, 255, 255, 255) })
                        .to(15 / 30, { color: new Color(255, 255, 255, 0) }),
                    tween(this.addPropLabel.node)
                        .to(25 / 30, { position: v3(this.addPropLabel.node.x, this.addPropLabel.node.y + 44, this.addPropLabel.node.z) })
                        .call(() => {
                            this.addPropLabel.node.position = v3(this.addPropLabel.node.x, this.addPropLabel.node.y - 44, this.addPropLabel.node.z);
                        })
                )
                .start();
        });
    }

    private _usePropAni() {
        this._setPropSprite(this._usePropOrigPos);
        this.propSprite.node.active = true;
        this.lightCircle.node.scale = Vec3.ZERO;
        this.lightCircle.color = new Color(255, 255, 255, 255);
        let toPos = CocosUtils.setNodeToTargetPos(this.propSprite.node, this.lightCircle.node);
        toPos.y += 50;
        let toPos2 = CocosUtils.setNodeToTargetPos(this.propSprite.node, this.cat.node);
        toPos2.y += 80;

        tween(this.propSprite.node)
            .parallel(
                tween(this.propSprite.node)
                    .to(20 / 30, { position: toPos })
                    .to(15 / 30, { position: v3(toPos.x, toPos.y + 144, toPos.z) })
                    .to(10 / 30, { position: toPos })
                    .to(5 / 30, { position: toPos })
                    .to(25 / 30, { position: toPos2 }),
                tween(this.propSprite.node)
                    .to(20 / 30, { scale: Vec3.ONE })
                    .to(1, { scale: Vec3.ONE })
                    .to(25 / 30, { scale: Vec3.ZERO })
                    .call(() => {
                        this._stopFeedCountDown();
                        CatMgr.ins.getCatData();
                        CatMgr.ins.getTomorrowData();
                    })
            )
            .start();
        this.scheduleOnce(() => {
            tween(this.propSprite)
                .to(25 / 30, { color: new Color(255, 255, 255, 0) })
                .start();
        }, 50 / 30);

        // 光圈
        this.scheduleOnce(() => {
            tween(this.lightCircle.node)
                .to(15 / 30, { scale: v3(.85, .15, 1) })
                .to(10 / 30, { scale: v3(2.66, .5, 1) })
                .start();
            this.scheduleOnce(() => {
                tween(this.lightCircle)
                    .to(10 / 30, { color: new Color(255, 255, 255, 0) })
                    .start();
            }, 15 / 30);
        }, 20 / 30);
    }

    private _setPropSprite(pos: Vec3) {
        this.propSprite.node.setPosition(pos);
        this.propSprite.node.scale = Vec3.ZERO;
        this.propSprite.node.eulerAngles = Vec3.ZERO;
        this.propSprite.color = new Color(255, 255, 255, 255);
    }

    onClickProp() {
        qc.panelRouter.showPanel({ panel: PanelConfigs.propsPanel });
    }

    onFeedCat() {
        CatMgr.ins.feedCat();
    }

    onTomorrowGet() {
        if (CatMgr.ins.tomorrowData.canClaim === 1) {
            CatMgr.ins.tomorrowGetFish(() => {
                CommonTipsMgr.ins.showTips('领取成功');
                CatMgr.ins.getTomorrowData();
                CatMgr.ins.getCatData();
            });
        }
        else {
            CommonTipsMgr.ins.showTips('明日可领');
        }
    }

    onAddSpeed() {
        PropsMgr.ins.showUsePropPanel(UsePropPanelType.Type2);
    }

    private _updateDayBg() {
        this.dayStateBg.index = CatMgr.ins.dayState === DayState.Day ? 0 : 1;
    }

    onClickHead() {
        let flag = this._initName();
        if (flag) {
            return;
        }
        qc.platform.getUserInfo((userInfo: { nickName: string, avatar: string }) => {
            if (userInfo) {
                qc.storage.setItem(Constant.NICK_NAME, userInfo.nickName);
                qc.storage.setItem(Constant.AVATAR, userInfo.avatar);
                this.userNameLabel.string = userInfo.nickName || '点击获取头像';
                qc.eventManager.emit(EventDef.UpdateAvatar);
            }
        });
    }

    private _initName() {
        let flag = false;
        let nickName = qc.storage.getItem(Constant.NICK_NAME);
        if (nickName) {
            this.userNameLabel.string = nickName;
            flag = true;
        }
        return flag;
    }

    onRedpackExchange() {
        qc.panelRouter.showPanel({ panel: PanelConfigs.redpackExchangePanel });

        // test
        // let url1 = 'https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?app_id=2021005128650302&scope=auth_user&redirect_uri=https://mobile.yundps.com';
        // // let url = 'alipays://platformapi/startapp?appId=20000067&url=https%3A%2F%2Fopenauth.alipay.com%2Foauth2%2FpublicAppAuthorize.htm%3Fapp_id%3D3000000132351722%26scope%3Dauth_user%26redirect_uri%3Dhttps%3A%2F%2Fmobile.yundps.com';
        // let url = `alipays://platformapi/startapp?appId=20000067&url=${encodeURIComponent(url1)}`;
        // location.href = url;
        // test
    }

    onStrategy() {
        qc.panelRouter.showPanel({ panel: PanelConfigs.strategyPanel });
    }
}