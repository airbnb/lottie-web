export type AnimationDirection = 1 | -1;
export type AnimationSegment = [number, number];
export type AnimationEventName = 'enterFrame' | 'loopComplete' | 'complete' | 'segmentStart' | 'destroy';
export type AnimationEventCallback<T = any> = (args: T) => void;

export type AnimationItem = {
    play();
    stop();
    pause();
    setLocationHref(href: string);
    setSpeed(speed: number);
    goToAndPlay(value: number, isFrame?: boolean);
    goToAndStop(value: number, isFrame?: boolean);
    setDirection(direction: AnimationDirection);
    playSegments(segments: AnimationSegment | AnimationSegment[], forceFlag?: boolean);
    setSubframe(useSubFrames: boolean);
    destroy();
    getDuration(inFrames?: boolean): number;
    triggerEvent<T = any>(name: AnimationEventName, args: T);
    addEventListener<T = any>(name: AnimationEventName, callback: AnimationEventCallback<T>);
    removeEventListener<T = any>(name: AnimationEventName, callback: AnimationEventCallback<T>);
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
};

export type CanavasRendererConfig = BaseRendererConfig & {
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
    rendererSettings?: SVGRendererConfig | CanavasRendererConfig | HTMLRendererConfig;
}

export type AnimationConfigWithPath = AnimationConfig & {
    path?: string;
}

export type AnimationConfigWithData = AnimationConfig & {
    animationData?: any;
}

type LottiePlayer = {
    play(name?: string);
    stop(name?: string);
    setSpeed(speed: number, name?: string);
    setDirection(direction: AnimationDirection, name?: string);
    searchAnimations(animationData?: any, standalone?: boolean, renderer?: string);
    loadAnimation(params: AnimationConfigWithPath | AnimationConfigWithData): AnimationItem;
    destroy(name?: string);
    registerAnimation(element: Element, animationData?: any);
    setQuality(quality: string | number);
}

const Lottie: LottiePlayer;

export default Lottie;
