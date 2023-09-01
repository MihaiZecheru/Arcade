import uuid, { uuid_regex } from '../src/models/ID';
import { describe, test, expect } from '@jest/globals';

describe('Test the uuid generation function', () => {
  test('generated UUID should match the UUID regex pattern', () => {
    const id = uuid();
    expect(id).toMatch(uuid_regex);
  });

  test('generated UUID should not start with a number', () => {
    const id = uuid();
    expect(id[0]).not.toMatch(/[0-9]/g);
  });
});
