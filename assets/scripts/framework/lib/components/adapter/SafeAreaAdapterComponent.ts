
import { _decorator, Component, screen, sys, UITransform, view } from "cc";
import { JSB } from "cc/env";

const { ccclass, property } = _decorator;

@ccclass
export default class SafeAreaAdapterComponent extends Component {
    onLoad() {
        this._onResize();
    }

    onEnable() {
        let onResize = this._onResize.bind(this);
        window.addEventListener("resize", onResize);
        window.addEventListener("orientationchange", onResize);
    }

    onDisable() {
        let onResize = this._onResize.bind(this);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
    }

    private _onResize() {
        SafeAreaAdapterComponent.safeArea = null;
        if (this.node) {
            this.node.getComponent(UITransform).width = SafeAreaAdapterComponent.safeArea.safeAreaWidth / SafeAreaAdapterComponent.safeArea.designPxToScreenPxRatio;
            this.node.getComponent(UITransform).height = SafeAreaAdapterComponent.safeArea.safeAreaHeight / SafeAreaAdapterComponent.safeArea.designPxToScreenPxRatio;

            this.node.setPosition(
                SafeAreaAdapterComponent.safeArea.safeAreaXOffset / SafeAreaAdapterComponent.safeArea.designPxToScreenPxRatio,
                SafeAreaAdapterComponent.safeArea.safeAreaYOffset / SafeAreaAdapterComponent.safeArea.designPxToScreenPxRatio, 0
            );
        }
    }

    private static _safeArea: SafeArea;

    static set safeArea(value: SafeArea) {
        this._safeArea = value;
    }

    static get safeArea() {
        if (this._safeArea == null || this._safeArea == undefined) {
            let screenWidth = screen.windowSize.width;
            let screenHeight = screen.windowSize.height;

            let safeAreaMarginTop = 0;
            let safeAreaMarginBottom = 0;
            let safeAreaMarginLeft = 0;
            let safeAreaMarginRight = 0;

            let designWidth = view.getVisibleSize().width;
            let designHeight = view.getVisibleSize().height;
            let designPxToScreenPxRatio = Math.min(screenWidth / designWidth, screenHeight / designHeight);

            if (JSB) {
                let safeAreaRectInDesignPx = sys.getSafeAreaRect();
                let screenWidthToDesgignWidth = screenWidth / designPxToScreenPxRatio;
                let screenHeightToDesignHeight = screenHeight / designPxToScreenPxRatio;

                let safeAreaRectLeftBottomXInDesign = -designWidth * 0.5 + safeAreaRectInDesignPx.x;
                let safeAreaRectLeftBottomYInDesign = -designHeight * 0.5 + safeAreaRectInDesignPx.y;
                let safeAreaRectWidthInDesign = safeAreaRectInDesignPx.width;
                let safeAreaRectHeightInDesign = safeAreaRectInDesignPx.height;

                let safeAreaMarginTopInDesign = screenHeightToDesignHeight * 0.5 - (safeAreaRectLeftBottomYInDesign + safeAreaRectHeightInDesign);
                let safeAreaMarginBottomInDesign = Math.abs(-screenHeightToDesignHeight * 0.5 - safeAreaRectLeftBottomYInDesign);
                let safeAreaMarginLeftInDesign = Math.abs(-screenWidthToDesgignWidth * 0.5 - safeAreaRectLeftBottomXInDesign);
                let safeAreaMarginRightInDesign = screenWidthToDesgignWidth * 0.5 - (safeAreaRectLeftBottomXInDesign + safeAreaRectWidthInDesign);

                safeAreaMarginTop = safeAreaMarginTopInDesign * designPxToScreenPxRatio;
                safeAreaMarginBottom = safeAreaMarginBottomInDesign * designPxToScreenPxRatio;
                safeAreaMarginLeft = safeAreaMarginLeftInDesign * designPxToScreenPxRatio;
                safeAreaMarginRight = safeAreaMarginRightInDesign * designPxToScreenPxRatio;
            }

            let safeAreaWidth = screenWidth - safeAreaMarginLeft - safeAreaMarginRight;
            let safeAreaHeight = screenHeight - safeAreaMarginTop - safeAreaMarginBottom;

            let safeAreaXOffset = (safeAreaMarginLeft - safeAreaMarginRight) * 0.5;
            let safeAreaYOffset = (safeAreaMarginBottom - safeAreaMarginTop) * 0.5;

            this._safeArea = {
                screenWidth: screenWidth,
                screenHeight: screenHeight,
                safeAreaWidth: safeAreaWidth,
                safeAreaHeight: safeAreaHeight,
                safeAreaMarginTop: safeAreaMarginTop,
                safeAreaMarginBottom: safeAreaMarginBottom,
                safeAreaMarginLeft: safeAreaMarginLeft,
                safeAreaMarginRight: safeAreaMarginRight,
                safeAreaXOffset: safeAreaXOffset,
                safeAreaYOffset: safeAreaYOffset,
                designPxToScreenPxRatio: designPxToScreenPxRatio,
            };
        }
        return this._safeArea;
    }

    static screenPxToDesignPx(screenPx: number) {
        return screenPx / this.safeArea.designPxToScreenPxRatio;
    }

    static designPxToScreenPx(designPx: number) {
        return designPx * this.safeArea.designPxToScreenPxRatio;
    }
}

export interface SafeArea {
    screenWidth: number;
    screenHeight: number;
    safeAreaWidth: number;
    safeAreaHeight: number;
    safeAreaMarginTop: number;
    safeAreaMarginBottom: number;
    safeAreaMarginLeft: number;
    safeAreaMarginRight: number;
    safeAreaXOffset: number;
    safeAreaYOffset: number;
    designPxToScreenPxRatio: number;
}
