import { _decorator } from "cc";
import { EnhancedComponent } from "../components/EnhancedComponent";

const { ccclass, property } = _decorator;

@ccclass
export abstract class PanelComponent extends EnhancedComponent {
    abstract show(option: PanelShowOption): void;
    abstract hide(option: PanelHideOption): void;
}

export interface PanelHideOption {
    data?: any;
    onHided: Function;
}

export interface PanelShowOption {
    data?: any;
    onShowed: Function;
}
