import { DoppioConfig, LaunchConfig, PagePdfConfig, TemplateConfig, PageScreenshotConfig, DoppioResponse, DoppioResponseAsync, DoppioAsyncConfig } from './../types';
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
