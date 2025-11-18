import { _decorator, Component, Node } from 'cc';
import { PanelComponent, PanelHideOption, PanelShowOption } from '../../framework/lib/router/PanelComponent';
import { qc } from '../../framework/qc';
import { PanelConfigs } from '../../configs/PanelConfigs';
const { ccclass, property } = _decorator;

@ccclass('StrategyPanel')
export class StrategyPanel extends PanelComponent {
    show(option: PanelShowOption): void {
        option.onShowed();
        qc.platform.hideBackButton();
        qc.platform.setNavigationBarStyle(' ');
    }
    hide(option: PanelHideOption): void {
        option.onHided();
        qc.platform.showBackButton();
        qc.platform.setNavigationBarStyle('养个招财猫');
    }

    onClickClose() {
        qc.panelRouter.hide({ panel: PanelConfigs.strategyPanel });
    }
}


