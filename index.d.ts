export type AnimationDirection = 1 | -1;
export type AnimationSegment = [number, number];
export type AnimationEventName = 'drawnFrame' | 'enterFrame' | 'loopComplete' | 'complete' | 'segmentStart' | 'destroy' | 'config_ready' | 'data_ready' | 'DOMLoaded' | 'error' | 'data_failed' | 'loaded_images';
export type AnimationEventCallback<T = any> = (args: T) => void;

/** Specifies the data for each event type. */
export interface AnimationEvents {
  DOMLoaded: undefined;
  complete: BMCompleteEvent;
  config_ready: undefined;
  data_failed: undefined;
  data_ready: undefined;
  destroy: BMDestroyEvent;
  drawnFrame: BMEnterFrameEvent;
  enterFrame: BMEnterFrameEvent;
  error: undefined;
  loaded_images: undefined;
  loopComplete: BMCompleteLoopEvent;
  segmentStart: BMSegmentStartEvent;
}

export interface BMCompleteEvent {
  direction: number;
  type: "complete";
}

export interface BMCompleteLoopEvent {
  currentLoop: number;
  direction: number;
  totalLoops: number;
  type: "loopComplete";
}

export interface BMDestroyEvent {
  type: "destroy";
}

export interface BMEnterFrameEvent {
  /** The current time in frames. */
  currentTime: number;
  direction: number;
  /** The total number of frames. */
  totalTime: number;
  type: "enterFrame";
}

export interface BMSegmentStartEvent {
  firstFrame: number;
  totalFrames: number;
  type: "segmentStart";
}

export type AnimationItem = {
    name: string;
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
    loop: boolean | number;
    renderer: any;
    animationID: string;
    assetsPath: string;
    timeCompleted: number;
    segmentPos: number;
    isSubframeEnabled: boolean;
    segments: AnimationSegment | AnimationSegment[];
    play(name?: string): void;
    stop(name?: string): void;
    togglePause(name?: string): void;
    destroy(name?: string): void;
    pause(name?: string): void;
    goToAndStop(value: number | string, isFrame?: boolean, name?: string): void;
    goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void;
    includeLayers(data: any): void;
    setSegment(init: number, end: number): void;
    resetSegments(forceFlag: boolean): void;
    hide(): void;
    show(): void;
    resize(): void;
    setSpeed(speed: number): void;
    setDirection(direction: AnimationDirection): void;
    setLoop(isLooping: boolean): void;
    playSegments(segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean): void;
    setSubframe(useSubFrames: boolean): void;
    getDuration(inFrames?: boolean): number;
    triggerEvent<T extends AnimationEventName>(name: T, args: AnimationEvents[T]): void;
    addEventListener<T extends AnimationEventName>(name: T, callback: AnimationEventCallback<AnimationEvents[T]>): () => void;
    removeEventListener<T extends AnimationEventName>(name: T, callback?: AnimationEventCallback<AnimationEvents[T]>): void;
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
    filterSize?: FilterSizeConfig;
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

export type RendererType = 'svg' | 'canvas' | 'html';

export type AnimationConfig<T extends RendererType = 'svg'> = {
    container: Element;
    renderer?: T;
    loop?: boolean | number;
    autoplay?: boolean;
    initialSegment?: AnimationSegment;
    name?: string;
    assetsPath?: string;
    rendererSettings?: {
        svg: SVGRendererConfig;
        canvas: CanvasRendererConfig;
        html: HTMLRendererConfig;
    }[T]
    audioFactory?(assetPath: string): {
        play(): void
        seek(): void
        playing(): void
        rate(): void
        setVolume(): void
    }
}

export type TextDocumentData = {
    t?: string;
    s?: number;
    f?: string;
    ca?: number;
    j?: number;
    tr?: number;
    lh?: number;
    ls?: number;
    fc?: [number, number, number];
}

export type AnimationConfigWithPath<T extends RendererType = 'svg'> = AnimationConfig<T> & {
    path?: string;
}

export type AnimationConfigWithData<T extends RendererType = 'svg'> = AnimationConfig<T> & {
    animationData?: any;
}

export type FilterSizeConfig = {
    width: string;
    height: string;
    x: string;
    y: string;
};

export type LottiePlayer = {
    play(name?: string): void;
    pause(name?: string): void;
    stop(name?: string): void;
    setSpeed(speed: number, name?: string): void;
    setDirection(direction: AnimationDirection, name?: string): void;
    searchAnimations(animationData?: any, standalone?: boolean, renderer?: string): void;
    loadAnimation<T extends RendererType = 'svg'>(params: AnimationConfigWithPath<T> | AnimationConfigWithData<T>): AnimationItem;
    destroy(name?: string): void;
    registerAnimation(element: Element, animationData?: any): void;
    setQuality(quality: string | number): void;
    setLocationHref(href: string): void;
    setIDPrefix(prefix: string): void;
    updateDocumentData(path: (string|number)[], documentData: TextDocumentData, index: number): void;
};

declare const Lottie: LottiePlayer;

export default Lottie;
