'use strict';

export class DoppioError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DoppioError';
  }
}
