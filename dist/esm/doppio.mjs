'use strict';
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
export { Doppio };
class Doppio {
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
            config = {
                ...config,
                doppio: { ...__classPrivateFieldGet(this, _Doppio_doppioConfig, "f") },
            };
        }
        if (__classPrivateFieldGet(this, _Doppio_launchConfig, "f")) {
            config = {
                ...config,
                launch: { ...__classPrivateFieldGet(this, _Doppio_launchConfig, "f") },
            };
        }
        return config;
    }
    doppio(doppioConfigObject) {
        __classPrivateFieldSet(this, _Doppio_doppioConfig, doppioConfigObject, "f");
    }
    launch(launchConfigObject) {
        __classPrivateFieldSet(this, _Doppio_launchConfig, launchConfigObject, "f");
    }
    async renderPdfDirect(PagePdfConfigObject) {
        if (!PagePdfConfigObject) {
            throw new DoppioError('PagePdfConfigObject must be defined.');
        }
        if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
            throw new DoppioError('You cannot use setContent and goto at the same time.');
        }
        if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
            throw new DoppioError('You need to set setContent or goto');
        }
        const response = await fetch('https://api.doppio.sh/v1/render/pdf/direct', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                page: PagePdfConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        return buffer;
    }
    async renderScreenshotDirect(PageScreenshotConfigObject) {
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
        const response = await fetch('https://api.doppio.sh/v1/render/screenshot/direct', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                page: PageScreenshotConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        return buffer;
    }
    async renderPdfSync(PagePdfConfigObject) {
        if (!PagePdfConfigObject) {
            throw new DoppioError('PagePdfConfigObject must be defined.');
        }
        if (PagePdfConfigObject.setContent && PagePdfConfigObject.goto) {
            throw new DoppioError('You cannot use setContent and goto at the same time.');
        }
        if (!PagePdfConfigObject.setContent && !PagePdfConfigObject.goto) {
            throw new DoppioError('You need to set setContent or goto');
        }
        const response = await fetch('https://api.doppio.sh/v1/render/pdf/sync', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                page: PagePdfConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const parsedBody = await response.json();
        return parsedBody;
    }
    async renderScreenshotSync(PageScreenshotConfigObject) {
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
        const response = await fetch('https://api.doppio.sh/v1/render/screenshot/sync', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                page: PageScreenshotConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const parsedBody = await response.json();
        return parsedBody;
    }
    async renderPdfAsync(PagePdfConfigObject) {
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
        const response = await fetch('https://api.doppio.sh/v1/render/pdf/async', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                page: PagePdfConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const parsedBody = await response.json();
        return parsedBody;
    }
    async renderScreenshotAsync(PageScreenshotConfigObject) {
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
        const response = await fetch('https://api.doppio.sh/v1/render/screenshot/async', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                page: PageScreenshotConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const parsedBody = await response.json();
        return parsedBody;
    }
    async renderTemplateDirect(TemplateConfigObject) {
        const response = await fetch('https://api.doppio.sh/v1/template/direct', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                ...TemplateConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const buffer = await response.arrayBuffer();
        return buffer;
    }
    async renderTemplateSync(TemplateConfigObject) {
        const response = await fetch('https://api.doppio.sh/v1/template/sync', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                ...TemplateConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const parsedBody = await response.json();
        return parsedBody;
    }
    async renderTemplateAsync(TemplateConfigObject) {
        const response = await fetch('https://api.doppio.sh/v1/template/async', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${__classPrivateFieldGet(this, _Doppio_apiKey, "f")}`,
                'User-Agent': 'Doppio/0.0.1',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...this.mergedConfigs(),
                ...TemplateConfigObject,
            }),
        });
        if (response.status === 400) {
            const errorBody = await response.json();
            throw new DoppioError(`${errorBody.message}`);
        }
        if (!response.ok) {
            throw new DoppioError(`HTTP error! status: ${response.status}`);
        }
        const parsedBody = await response.json();
        return parsedBody;
    }
}
_Doppio_apiKey = new WeakMap(), _Doppio_doppioConfig = new WeakMap(), _Doppio_launchConfig = new WeakMap();
export default Doppio;
export class DoppioError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DoppioError';
    }
}
