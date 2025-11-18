import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import EventDef from '../../constants/EventDef';
import { PanelConfigs } from '../../configs/PanelConfigs';
const { ccclass, property } = _decorator;

@ccclass('LoadingPanel')
export class LoadingPanel extends PanelComponent {
    show(option: PanelShowOption): void {
        option.onShowed();
    }
    hide(option: PanelHideOption): void {
        option.onHided();
    }

    protected onEnable(): void {
        qc.eventManager.on(EventDef.CloseLoadingPanel, this._closeLoadingPanel, this);
    }

    protected onDisable(): void {
        qc.eventManager.off(EventDef.CloseLoadingPanel, this._closeLoadingPanel, this);
    }

    private _closeLoadingPanel() {
        qc.panelRouter.hide({ panel: PanelConfigs.loadingPanel });
    }
}
