import { describe, expect, test } from 'vitest';

import { Doppio, DoppioError } from '../src/index.js';

describe('Doppio Template Test Suite', () => {
  describe('Initialization', () => {
    test('should create a Doppio instance with valid API key', () => {
      const doppioClient = new Doppio('test-api-key');
      expect(doppioClient).toBeInstanceOf(Doppio);
    });

    test('should throw DoppioError when API key is missing', () => {
      expect(() => {
        new Doppio('');
      }).toThrow(DoppioError);
      expect(() => {
        new Doppio('');
      }).toThrow('You must set your Doppio.sh API key');
    });
  });
});
