export type AnimationDirection = 1 | -1;
export type AnimationSegment = [number, number];
export type AnimationEventName = 'enterFrame' | 'loopComplete' | 'complete' | 'segmentStart' | 'destroy' | 'config_ready' | 'data_ready' | 'DOMLoaded' | 'error' | 'data_failed' | 'loaded_images';
export type AnimationEventCallback<T = any> = (args: T) => void;

export type AnimationItem = {
    name: string;
    path: string;
    isLoaded: boolean;
    currentFrame: number;
    currentRawFrame: number;
    firstFrame: number;
    totalFrames: number;
    frameRate: number;
    frameMult: number;
    playSpeed: number;
    playDirection: number;
    playCount: number;
    isPaused: boolean;
    autoplay: boolean;
    loop: boolean;
    renderer: any;
    animationID: string;
    assetsPath: string;
    timeCompleted: number;
    segmentPos: number;
    subframeEnabled, boolean;
    segments: AnimationSegment | AnimationSegment[];
    _idle: boolean;
    _completedLoop: boolean;
    animationData: any;
    assets: any;
    imagePreloader: {
        loadAssets(assets?: any[], cb?: any): void;
        setAssetsPath(path?: string): void;
        setPath(path?: string): void;
        loaded(): void;
        destroy(): void;
        getImage(assetData: any): void;
        _createImageData(assetData: any): void;
        _imageLoaded(): void;
        assetsPath: string;
        path: string;
        totalImages: number;
        loadedAssets: number;
        imagesLoadedCb: any;
        images: any[];
    }
    play(name?: string): void;
    stop(name?: string): void;
    togglePause(name?: string): void;
    destroy(name?: string): void;
    pause(name?: string): void;
    resize(): void;
    setSpeed(speed: number): void;
    goToAndStop(value: number, isFrame?: boolean, name?: string): void;
    goToAndPlay(value: number, isFrame?: boolean, name?: string): void;
    setDirection(direction: AnimationDirection): void;
    playSegments(segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean): void;
    setSubframe(useSubFrames: boolean): void;
    getDuration(inFrames?: boolean): number;
    triggerEvent<T = any>(name: AnimationEventName, args: T): void;
    addEventListener<T = any>(name: AnimationEventName, callback: AnimationEventCallback<T>): void;
    removeEventListener<T = any>(name: AnimationEventName, callback: AnimationEventCallback<T>): void;
    setParams(params: AnimationConfigWithPath | AnimationConfigWithData): void;
    setData(wrapper: Element, animationData: any): void;
    includeLayers(data: any): void;
    loadNextSegment(): void;
    loadSegments(): void;
    imagesLoaded(): void;
    preloadImages(): void;
    configAnimation(animData: any): void,
    waitForFontsLoaded(): void;
    checkLoaded(): void;
    gotoFrame(): void;
    renderFrame(): void;
    advanceTime(value: number): void;
    adjustSegment(arr: AnimationSegment | AnimationSegment[], offset: number): void;
    setSegment(init: number, end: number): void;
    resetSegments(forceFlag: boolean): void;
    checkSegments(offset: number): boolean;
    setCurrentRawFrameValue(value: number): void;
    updaFrameModifier(): void;
    getPath(): string;
    getAssetsPath(): string;
    getAssetData(id: any): string;
    hide(): void;
    show(): void;
    trigger(name: AnimationEventName): void;
    triggerRenderFrameError:(nativeError: any) => void;
    triggerConfigError:(nativeError: any) => void;
}

export type BaseRendererConfig = {
    imagePreserveAspectRatio?: string;
    className?: string;
};

export type SVGRendererConfig = BaseRendererConfig & {
    title?: string;
    description?: string;
    preserveAspectRatio?: string;
    progressiveLoad?: boolean;
    hideOnTransparent?: boolean;
    viewBoxOnly?: boolean;
    viewBoxSize?: string;
    focusable?: boolean;
};

export type CanvasRendererConfig = BaseRendererConfig & {
    clearCanvas?: boolean;
    context?: CanvasRenderingContext2D;
    progressiveLoad?: boolean;
    preserveAspectRatio?: string;
};

export type HTMLRendererConfig = BaseRendererConfig & {
    hideOnTransparent?: boolean;
};

export type AnimationConfig = {
    container: Element;
    renderer?: 'svg' | 'canvas' | 'html';
    loop?: boolean | number;
    autoplay?: boolean;
    name?: string;
    assetsPath?: string;
    rendererSettings?: SVGRendererConfig | CanvasRendererConfig | HTMLRendererConfig;
}

export type AnimationConfigWithPath = AnimationConfig & {
    path?: string;
}

export type AnimationConfigWithData = AnimationConfig & {
    animationData?: any;
}

type LottiePlayer = {
    play(name?: string): void;
    stop(name?: string): void;
    setSpeed(speed: number, name?: string): void;
    setDirection(direction: AnimationDirection, name?: string): void;
    searchAnimations(animationData?: any, standalone?: boolean, renderer?: string): void;
    loadAnimation(params: AnimationConfigWithPath | AnimationConfigWithData): AnimationItem;
    destroy(name?: string): void;
    registerAnimation(element: Element, animationData?: any): void;
    setQuality(quality: string | number): void;
    setLocationHref(href: string): void;
};

declare const Lottie: LottiePlayer;

export default Lottie;
