declare module 'page-flip' {
  export interface PageFlipEvent<T = number | string | boolean | object> {
    data: T;
    object: PageFlip;
  }

  export interface PageFlipSettings {
    width: number;
    height: number;
    size: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    startPage?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    loadFromHTML(elements: HTMLElement[] | NodeListOf<HTMLElement>): void;
    on<T = number | string | boolean | object>(eventName: string, callback: (event: PageFlipEvent<T>) => void): PageFlip;
    off(eventName: string): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    update(): void;
    destroy(): void;
  }
}
