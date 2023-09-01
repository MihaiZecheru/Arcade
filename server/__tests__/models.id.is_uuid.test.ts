import { is_uuid } from '../src/models/ID';
import { describe, test, expect } from '@jest/globals';

describe('Test the is_uuid function', () => {
  test('valid UUID should return true', () => {
    const uuid = 'e52a556f-6a14-4fc2-9c5c-82b5a63c3cf6';
    expect(is_uuid(uuid)).toBe(true);
  });

  test('invalid UUID should return false', () => {
    expect(is_uuid('invalid-uuid')).toBe(false);
  });

  test('valid UUID with incorrect casing should return false', () => {
    const uuid = 'E52A556F-6A14-4FC2-9C5C-82B5A63C3CF6';
    expect(is_uuid(uuid)).toBe(false);
  });

  test('UUID with missing hyphens should return false', () => {
    const uuid = 'e52a556f6a144fc29c5c82b5a63c3cf6';
    expect(is_uuid(uuid)).toBe(false);
  });

  test('UUID with extra characters should return false', () => {
    const uuid = 'e52a556f-6a14-4fc2-9c5c-82b5a63c3cf6-extra';
    expect(is_uuid(uuid)).toBe(false);
  });

  test('UUID with invalid characters should return false', () => {
    const uuid = 'g52a556f-6a14-4fc2-9c5c-82b5a63c3cf6';
    expect(is_uuid(uuid)).toBe(false);
  });

  test('UUID with incorrect format should return false', () => {
    const uuid = 'e52a556f6a144fc29c5c82b5a63c3cf6';
    expect(is_uuid(uuid)).toBe(false);
  });
});
