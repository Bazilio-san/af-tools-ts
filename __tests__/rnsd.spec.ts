// Test script for the rnsd function
import { rnsd } from '../src/utils';

// Add a debug function to log the input and output
const debugRnsd = (input: number, digits: number): number => {
  console.log(`Debug: rnsd(${input}, ${digits}) = ${rnsd(input, digits)}`);
  return rnsd(input, digits);
};

// Test case interface
interface TestCase {
  input: number;
  digits: number;
  expected: number;
}

// Test cases
const testCases: TestCase[] = [
  // Original test cases
  { input: 12345, digits: 2, expected: 12000 },
  { input: 12345, digits: 3, expected: 12300 },
  { input: 12345, digits: 4, expected: 12350 },
  { input: 0.012345, digits: 2, expected: 0.012 },
  { input: 0.012345, digits: 3, expected: 0.0123 },
  { input: -12345, digits: 2, expected: -12000 },
  { input: 0, digits: 2, expected: 0 },
  { input: 9.99, digits: 2, expected: 10 },
  { input: 0.0099, digits: 2, expected: 0.0099 },

  // Additional test cases for edge cases
  // Very small numbers
  { input: 0.0000123, digits: 2, expected: 0.000012 },
  { input: 0.0000123, digits: 3, expected: 0.0000123 },

  // Very large numbers
  { input: 123456789, digits: 2, expected: 120000000 },
  { input: 123456789, digits: 3, expected: 123000000 },

  // Numbers with different patterns of significant digits
  { input: 1.005, digits: 3, expected: 1.01 },
  { input: 1.005, digits: 4, expected: 1.005 },

  // Numbers close to powers of 10
  { input: 0.999, digits: 1, expected: 1 },
  { input: 9.99, digits: 3, expected: 9.99 },
];

describe('rnsd function', () => {
  testCases.forEach(({ input, digits, expected }) => {
    it(`should round ${input} to ${digits} significant digits and return ${expected}`, () => {
      let result: number;
      
      if (input === 1.005 && digits === 3) {
        // Use the debug function for the problematic case
        result = debugRnsd(input, digits);
      } else {
        result = rnsd(input, digits);
      }
      
      expect(Math.abs(result - expected)).toBeLessThan(1e-10);
    });
  });

  // Additional describe block for grouped tests
  describe('edge cases', () => {
    it('should handle zero correctly', () => {
      expect(rnsd(0, 2)).toBe(0);
    });

    it('should handle negative numbers correctly', () => {
      expect(rnsd(-12345, 2)).toBe(-12000);
    });

    it('should handle very small numbers correctly', () => {
      expect(Math.abs(rnsd(0.0000123, 2) - 0.000012)).toBeLessThan(1e-10);
    });

    it('should handle very large numbers correctly', () => {
      expect(rnsd(123456789, 2)).toBe(120000000);
    });

    it('should handle numbers close to powers of 10', () => {
      expect(rnsd(0.999, 1)).toBe(1);
      expect(rnsd(9.99, 3)).toBe(9.99);
    });
  });
});
