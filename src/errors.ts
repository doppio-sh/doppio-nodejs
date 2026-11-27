/**
 * Stable error codes returned by the Doppio API. New codes can appear at any
 * time, so always handle unknown values.
 */
export type DoppioErrorCode =
  | 'INVALID_API_KEY'
  | 'UNPAID_INVOICES'
  | 'ASYNC_NOT_ALLOWED'
  | 'TEMPLATES_NOT_ALLOWED'
  | 'TEMPLATE_NOT_FOUND'
  | 'MONTHLY_QUOTA_REACHED'
  | 'RATE_LIMIT_EXCEEDED'
  | (string & Record<never, never>);

/** Base class of every error thrown by the SDK. */
export class DoppioError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'DoppioError';
  }
}

/** The Doppio API answered with an error status. */
export class DoppioAPIError extends DoppioError {
  /** HTTP status of the response. */
  readonly status: number;
  /** Stable error code. Rely on it rather than on the message. */
  readonly code: DoppioErrorCode | undefined;
  /** Every message sent by the API. Validation errors can contain several. */
  readonly messages: string[];
  /** Parsed JSON body, or the raw text when the body is not JSON. */
  readonly body: unknown;
  /** Response headers, such as `Retry-After` and the rate-limit headers. */
  readonly headers: Headers;

  constructor(status: number, body: unknown, headers: Headers) {
    const messages = messagesOf(body);
    super(
      messages.length > 0 ? messages.join(', ') : fallbackMessage(status, body)
    );
    this.name = 'DoppioAPIError';
    this.status = status;
    this.code =
      isRecord(body) && typeof body.code === 'string' ? body.code : undefined;
    this.messages = messages;
    this.body = body;
    this.headers = headers;
  }
}

/** The request never got a response from the Doppio API. */
export class DoppioConnectionError extends DoppioError {
  constructor(options?: ErrorOptions) {
    super('Could not reach the Doppio API', options);
    this.name = 'DoppioConnectionError';
  }
}

/** The call took longer than the configured timeout. */
export class DoppioTimeoutError extends DoppioError {
  /** The timeout that was exceeded, in milliseconds. */
  readonly timeout: number;

  constructor(timeout: number, options?: ErrorOptions) {
    super(`Request timed out after ${timeout} ms`, options);
    this.name = 'DoppioTimeoutError';
    this.timeout = timeout;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function messagesOf(body: unknown): string[] {
  if (!isRecord(body)) return [];
  const { message } = body;
  if (typeof message === 'string') return [message];
  if (Array.isArray(message)) {
    return message.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function fallbackMessage(status: number, body: unknown): string {
  if (isRecord(body) && body.renderStatus === 'ERROR') {
    return 'The render failed';
  }
  return `Request failed with status ${status}`;
}
