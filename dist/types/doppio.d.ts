export type WaitUntilOption = 'domcontentloaded' | 'networkidle0' | 'networkidle2' | 'load';
export type HttpMethodOption = 'POST' | 'PUT' | 'GET' | 'DELETE' | 'PATCH';
export type PageFormat = 'Letter' | 'Legal' | 'Ledger' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';
export type ScreenshotType = 'png' | 'jpg' | 'jpeg' | 'webp';
export type ContentDisposition = 'inline' | 'attachment';
export type ScreenshotClip = {
    width: number;
    height: number;
    x: number;
    y: number;
};
export interface DoppioConfig {
    presignedUrl?: string;
    contentDisposition?: ContentDisposition;
}
export interface DoppioAsyncConfig extends DoppioConfig {
    webhook: {
        url: string;
        method: HttpMethodOption;
        headers?: Record<string, any>;
    };
}
export interface LaunchConfig {
    defaultViewport: {
        width?: number;
        height?: number;
        deviceScaleFactor?: number;
        isMobile?: boolean;
        hasTouch?: boolean;
        isLandscape?: boolean;
    };
}
export interface SetContentConfig {
    html: string;
    options?: {
        waitUntil: WaitUntilOption[];
    };
}
export interface GotoConfig {
    url: string;
    options?: {
        waitUntil: WaitUntilOption[];
    };
}
export interface MarginConfig {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
}
export interface PdfConfig {
    scale?: number;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    printBackground?: boolean;
    landscape?: boolean;
    pageRanges?: string;
    format?: PageFormat;
    width?: string | number;
    height?: string | number;
    preferCSSPageSize?: boolean;
    omitBackground?: boolean;
    margin?: MarginConfig;
}
export interface AuthenticateConfig {
    username: string;
    password: string;
}
export interface CookiesConfig {
    name: string;
    value: string;
    domain: string;
    url?: string;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: string;
    expires?: string;
}
export interface LocalStorageConfig {
    key: string;
    value: string;
}
export interface WaitForFunctionConfig {
    pageFunction: string;
    options?: {
        polling?: string | number;
        timeout?: number;
    };
}
export interface WaitForSelectorConfig {
    selector: string;
    options?: {
        hidden?: boolean;
        timeout?: number;
        visible?: boolean;
    };
}
export interface PagePdfConfig {
    goto?: GotoConfig;
    setContent?: SetContentConfig;
    setJavaScriptEnabled?: boolean;
    emulateMediaType?: string;
    setExtraHTTPHeaders?: Record<string, string>;
    authenticate?: AuthenticateConfig;
    pdf?: PdfConfig;
    setCookies?: CookiesConfig[];
    setLocalStorageItems?: LocalStorageConfig[];
    waitForFunction?: WaitForFunctionConfig;
    waitForSelector?: WaitForSelectorConfig;
    setUserAgent?: string;
}
export interface ScreenshotConfig {
    captureBeyondViewport?: boolean;
    clip?: ScreenshotClip;
    fullPage?: boolean;
    omitBackground?: boolean;
    quality?: number;
    type?: ScreenshotType;
}
export interface PageScreenshotConfig extends Omit<PagePdfConfig, 'pdf'> {
    screenshot?: ScreenshotConfig;
}
export interface DoppioResponse {
    doppioRequestId: string;
    renderStatus: string;
    documentUrl: string;
    isAsync: boolean;
    isCustomBucket: boolean;
}
export interface DoppioResponseAsync {
    requestId: string;
    jobId: string;
}
export interface TemplateConfig {
    templateId: string;
    templateData?: Record<any, any>;
    doppio?: DoppioConfig;
}
export declare class Doppio {
    #private;
    constructor(apiKey: string);
    private mergedConfigs;
    doppio(doppioConfigObject: DoppioConfig | DoppioAsyncConfig): void;
    launch(launchConfigObject: LaunchConfig): void;
    renderPdfDirect(PagePdfConfigObject: PagePdfConfig): Promise<ArrayBuffer>;
    renderScreenshotDirect(PageScreenshotConfigObject: PageScreenshotConfig): Promise<ArrayBuffer>;
    renderPdfSync(PagePdfConfigObject: PagePdfConfig): Promise<DoppioResponse>;
    renderScreenshotSync(PageScreenshotConfigObject: PageScreenshotConfig): Promise<DoppioResponse>;
    renderPdfAsync(PagePdfConfigObject: PagePdfConfig): Promise<DoppioResponseAsync>;
    renderScreenshotAsync(PageScreenshotConfigObject: PageScreenshotConfig): Promise<DoppioResponseAsync>;
    renderTemplateDirect(TemplateConfigObject: TemplateConfig): Promise<ArrayBuffer>;
    renderTemplateSync(TemplateConfigObject: TemplateConfig): Promise<DoppioResponse>;
    renderTemplateAsync(TemplateConfigObject: TemplateConfig): Promise<DoppioResponseAsync>;
}
export declare class DoppioError extends Error {
    constructor(message: string);
}
