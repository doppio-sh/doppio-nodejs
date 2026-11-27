import { describe, expect, test } from 'vitest';

import { Doppio, DoppioError } from '../src/index.js';
import { API_KEY } from './helpers.js';

describe('Doppio constructor', () => {
  test('creates a client with an API key', () => {
    expect(new Doppio(API_KEY)).toBeInstanceOf(Doppio);
  });

  test.each([
    ['an empty string', ''],
    ['undefined', undefined],
  ])('throws a DoppioError when the API key is %s', (_label, apiKey) => {
    expect(() => new Doppio(apiKey as string)).toThrow(DoppioError);
    expect(() => new Doppio(apiKey as string)).toThrow(
      'You must set your Doppio.sh API key'
    );
  });
});

describe('DoppioError', () => {
  test('is an Error named DoppioError', () => {
    const error = new DoppioError('boom');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('DoppioError');
    expect(error.message).toBe('boom');
  });
});
