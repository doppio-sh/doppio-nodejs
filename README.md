# Official Doppio.sh Node.js SDK

The Doppio.sh SDK enables developers to easily integrate HTML to PDF, HTML to Screenshot, Template to PDF and Template to Screenshot rendering functionalities into their Node.js applications.

This SDK provides straightforward methods for interacting with the Doppio.sh API, supporting both ECMAScript Modules (ESM) and CommonJS (CJS) formats, ensuring compatibility with various Node.js environments.

Below are examples to get you started. For additional examples, please see our official documentation at https://doc.doppio.sh.

### Key Features:

- Generate PDFs and Screenshots from HTML/CSS/JS.
- Render custom templates.
- Asynchronous and synchronous API calls.
- Lightweight with zero dependencies.

## Install

- Requires node.js >=17.5

```sh
npm install doppio-nodejs
```

Once installed, you can import the library using `import` or `require` :

```js
const doppio = require('doppio-nodejs');
// OR
import { Doppio } from 'doppio-nodejs';
```

## Exemple

### Renders a PDF and writes a file on disk

```js
import fs from 'fs/promises';
import { Doppio } from 'doppio-nodejs';

const doppioClient = new Doppio(process.env.DOPPIO_API_KEY);

const buffer = await doppioClient.renderPdfDirect({
  pdf: {
    printBackground: true,
  },
  setContent: {
    html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
    options: {
      waitUntil: ['networkidle0'],
    },
  },
});

await fs.writeFile('./tmp/pdf-output.pdf', Buffer.from(buffer));
```

### Renders a PDF Async, with a webhook

```js
import { Doppio } from 'doppio-nodejs';
const doppioClient = new Doppio(process.env.DOPPIO_API_KEY);

doppioClient.doppio({
  webhook: {
    url: 'https://webhook.site/your-webhook-url',
    method: 'POST',
  },
});

const response = await doppioClient.renderPdfAsync({
  pdf: {
    printBackground: true,
  },
  setContent: {
    html: 'PGh0bWw+CjxwPnRlc3Q8L3A+CjwvaHRtbD4=',
    options: {
      waitUntil: ['networkidle0'],
    },
  },
});
```

## Functions

```ts
// Sets the Doppio config, similiar to the doppio object in the API
doppio(doppioConfigObject: DoppioConfig | DoppioAsyncConfig): void;

// Sets launch config, similiar to the launch object in the API
launch(launchConfigObject: LaunchConfig): void;

// Renders a PDF, outputs the file as a Buffer
renderPdfDirect(PagePdfConfigObject: PagePdfConfig): Promise<ArrayBuffer>;

// Renders a Screenshot, outputs the file as a Buffer
renderScreenshotDirect(PageScreenshotConfigObject: PageScreenshotConfig): Promise<ArrayBuffer>;

// Renders a PDF, outputs an object with a documentUrl property
renderPdfSync(PagePdfConfigObject: PagePdfConfig): Promise<DoppioResponse>;

// Renders a Screenshot, outputs an object with a documentUrl property
renderScreenshotSync(PageScreenshotConfigObject: PageScreenshotConfig): Promise<DoppioResponse>;

// Starts an async render for a PDF, outputs an object with a requestId property
renderPdfAsync(PagePdfConfigObject: PagePdfConfig): Promise<DoppioResponseAsync>;

// Starts an async render for a Screenshot, outputs an object with a requestId property
renderScreenshotAsync(PageScreenshotConfigObject: PageScreenshotConfig): Promise<DoppioResponseAsync>;

// Renders a template, outputs the file as a Buffer
renderTemplateDirect(TemplateConfigObject: TemplateConfig): Promise<ArrayBuffer>;

// Renders a template, outputs an object with a documentUrl property
renderTemplateSync(TemplateConfigObject: TemplateConfig): Promise<DoppioResponse>;

// Starts an async render for a template, outputs an object with a requestId property
renderTemplateAsync(TemplateConfigObject: TemplateConfig): Promise<DoppioResponseAsync>;
```

## Getting Help

For more detailed examples and API documentation, please visit our official documentation. If you encounter any issues or have questions, feel free to open an issue on GitHub, send an email and reach out on chat.

## Contributing

Contributions to the Doppio.sh SDK are welcome!
