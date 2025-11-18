import { _decorator, Color, Component, EventTouch, Label, Node, Sprite } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
import LogList from '../../api/logList';
import ListCom from '../../framework/lib/components/scrollviewplus/ListCom';
const { ccclass, property } = _decorator;

@ccclass('LogListPanel')

export class logListPanel extends PanelComponent {
    @property(ListCom)
    list: ListCom;
    active_num: number = 1;
    pages: number = 1;
    total: number = 0;
    logList: any[] = [];
    pageSize: number = 20;
    endPage: boolean = true;
    show(option: PanelShowOption): void {
        option.onShowed();
        this.getNewList()

    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected start(): void {
        this.list.scrollView.node.on('scroll-to-bottom', () => {
            if (this.enabled) {
                return
            }
            this.pages++
            this.getNewList();
        })
    }

    protected onEnable(): void {

    }

    protected onDisable(): void {

    }
    closeModel() {
        qc.panelRouter.hide({
            panel: PanelConfigs.logListPanel,
            onHided: () => {
                console.log('close test panel-----------');

            }
        });
    }
    getNewList() {
        LogList.ins.getLogList({ type: this.active_num, pageSize: this.pageSize, page: this.pages }).then(res => {
            this.logList = this.logList.concat(res.data.list);

            this.total = res.data.total;
            this.endPage = res.data.endPage;
            // this.list.numItems = this.logList.length;

            this.list.numItems = this.logList.length;


        });
    }
    changeActiveClick(e: EventTouch, val) {
        console.log(e);
        this.logList = []
        let t = e.currentTarget as Node;
        const color = new Color();
        color.fromHEX('#333333');
        t.parent.children.forEach(item => {

            item.getComponentInChildren(Label).color = color
            item.getComponentInChildren(Label).isBold = false;
            // item.getComponentInChildren(Sprite).node.active = false;
            item.getChildByName('active_bottom').active = false;

        });
        const active_color = new Color();
        active_color.fromHEX('#028CFD');
        e.currentTarget.getComponentInChildren(Label).color = active_color
        e.currentTarget.getComponentInChildren(Label).isBold = true;
        e.currentTarget.getChildByName('active_bottom').active = true;
        if (val) {
            this.active_num = Number(val);
            this.getNewList()
        }


    }

    onRenderItem(item: Node, index: number) {
        item.active = true;

        let data = this.logList[index];
        item.getChildByName('name').getComponent(Label).string = data.type_name;
        item.getChildByName('time').getComponent(Label).string = data.time;
        item.getChildByName('num').getComponent(Label).string = data.num + '' + data.unit;
        if (index == this.total - 1) {
            item.getChildByName('bottom').active = false
        }
        console.log(data.id);

    }
}


