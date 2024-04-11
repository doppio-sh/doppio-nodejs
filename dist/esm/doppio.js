'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Doppio_apiKey, _Doppio_doppioConfig, _Doppio_launchConfig;
export class Doppio {
    constructor(apiKey) {
        _Doppio_apiKey.set(this, void 0);
        _Doppio_doppioConfig.set(this, void 0);
        _Doppio_launchConfig.set(this, void 0);
        if (!apiKey) {
            throw new DoppioError('You must set your Doppio.sh API key');
        }
        __classPrivateFieldSet(this, _Doppio_apiKey, apiKey, "f");
        __classPrivateFieldSet(this, _Doppio_doppioConfig, null, "f");
        __classPrivateFieldSet(this, _Doppio_launchConfig, null, "f");
    }
    mergedConfigs() {
        let config = {};
        if (__classPrivateFieldGet(this, _Doppio_doppioConfig, "f")) {
            config = Object.assign(Object.assign({}, config), { doppio: Object.assign({}, __classPrivateFieldGet(this, _Doppio_doppioConfig, "f")) });
        }
        if (__classPrivateFieldGet(this, _Doppio_launchConfig, "f")) {
            config = Object.assign(Object.assign({}, config), { launch: Object.assign({}, __classPrivateFieldGet(this, _Doppio_launchConfig, "f")) });
        }
        return config;
    }
    doppio(doppioConfigObject) {
        __classPrivateFieldSet(this, _Doppio_doppioConfig, doppioConfigObject, "f");
    }
    launch(launchConfigObject) {
        __classPrivateFieldSet(this, _Doppio_launchConfig, launchConfigObject, "f");
    }
    renderPdfDirect(PagePdfConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PagePdfConfigObject) {
                throw new DoppioError('PagePdfConfigObject must be defined.');
            }
            if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
                throw new DoppioError('You cannot use setContent and goto at the same time.');
            }
            if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
                throw new DoppioError('You need to set setContent or goto');
            }
            const response = yield fetch('https://api.doppio.sh/v1/render/pdf/direct', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), { page: PagePdfConfigObject })),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const buffer = yield response.arrayBuffer();
            return buffer;
        });
    }
    renderScreenshotDirect(PageScreenshotConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PageScreenshotConfigObject) {
                throw new DoppioError('PageScreenshotConfigObject must be defined.');
            }
            if (PageScreenshotConfigObject.setContent &&
                PageScreenshotConfigObject.goto) {
                throw new DoppioError('You cannot use setContent and goto at the same time.');
            }
            if (!PageScreenshotConfigObject.setContent &&
                !PageScreenshotConfigObject.goto) {
                throw new DoppioError('You need to set setContent or goto');
            }
            const response = yield fetch('https://api.doppio.sh/v1/render/screenshot/direct', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), { page: PageScreenshotConfigObject })),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const buffer = yield response.arrayBuffer();
            return buffer;
        });
    }
    renderPdfSync(PagePdfConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PagePdfConfigObject) {
                throw new DoppioError('PagePdfConfigObject must be defined.');
            }
            if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
                throw new DoppioError('You cannot use setContent and goto at the same time.');
            }
            if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
                throw new DoppioError('You need to set setContent or goto');
            }
            const response = yield fetch('https://api.doppio.sh/v1/render/pdf/sync', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), { page: PagePdfConfigObject })),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const parsedBody = yield response.json();
            return parsedBody;
        });
    }
    renderScreenshotSync(PageScreenshotConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PageScreenshotConfigObject) {
                throw new DoppioError('PageScreenshotConfigObject must be defined.');
            }
            if (PageScreenshotConfigObject.setContent &&
                PageScreenshotConfigObject.goto) {
                throw new DoppioError('You cannot use setContent and goto at the same time.');
            }
            if (!PageScreenshotConfigObject.setContent &&
                !PageScreenshotConfigObject.goto) {
                throw new DoppioError('You need to set setContent or goto');
            }
            const response = yield fetch('https://api.doppio.sh/v1/render/screenshot/sync', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), { page: PageScreenshotConfigObject })),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const parsedBody = yield response.json();
            return parsedBody;
        });
    }
    renderPdfAsync(PagePdfConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PagePdfConfigObject) {
                throw new DoppioError('PagePdfConfigObject must be defined.');
            }
            if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
                throw new DoppioError('You cannot use setContent and goto at the same time.');
            }
            if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
                throw new DoppioError('You need to set setContent or goto');
            }
            if (!__classPrivateFieldGet(this, _Doppio_doppioConfig, "f").webhook) {
                throw new DoppioError('You need to set a webhook property to work with the async render method');
            }
            const response = yield fetch('https://api.doppio.sh/v1/render/pdf/async', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), { page: PagePdfConfigObject })),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const parsedBody = yield response.json();
            return parsedBody;
        });
    }
    renderScreenshotAsync(PageScreenshotConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!PageScreenshotConfigObject) {
                throw new DoppioError('PageScreenshotConfigObject must be defined.');
            }
            if (PageScreenshotConfigObject.setContent &&
                PageScreenshotConfigObject.goto) {
                throw new DoppioError('You cannot use setContent and goto at the same time.');
            }
            if (!PageScreenshotConfigObject.setContent &&
                !PageScreenshotConfigObject.goto) {
                throw new DoppioError('You need to set setContent or goto');
            }
            if (!__classPrivateFieldGet(this, _Doppio_doppioConfig, "f").webhook) {
                throw new DoppioError('You need to set a webhook property to work with the async render method');
            }
            const response = yield fetch('https://api.doppio.sh/v1/render/screenshot/async', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), { page: PageScreenshotConfigObject })),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const parsedBody = yield response.json();
            return parsedBody;
        });
    }
    renderTemplateDirect(TemplateConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('https://api.doppio.sh/v1/template/direct', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), TemplateConfigObject)),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const buffer = yield response.arrayBuffer();
            return buffer;
        });
    }
    renderTemplateSync(TemplateConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('https://api.doppio.sh/v1/template/sync', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), TemplateConfigObject)),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const parsedBody = yield response.json();
            return parsedBody;
        });
    }
    renderTemplateAsync(TemplateConfigObject) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch('https://api.doppio.sh/v1/template/async', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                    'User-Agent': 'Doppio/0.0.1',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.assign(Object.assign({}, this.mergedConfigs()), TemplateConfigObject)),
            });
            if (response.status === 400) {
                const errorBody = yield response.json();
                throw new DoppioError(`${errorBody.message}`);
            }
            if (!response.ok) {
                throw new DoppioError(`HTTP error! status: ${response.status}`);
            }
            const parsedBody = yield response.json();
            return parsedBody;
        });
    }
}
_Doppio_apiKey = new WeakMap(), _Doppio_doppioConfig = new WeakMap(), _Doppio_launchConfig = new WeakMap();
export class DoppioError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DoppioError';
    }
}
