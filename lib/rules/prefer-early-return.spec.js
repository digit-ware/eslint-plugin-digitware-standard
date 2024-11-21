import { describe, it } from "vitest";
import { RuleTester } from "eslint";

import preferEarlyReturnRule from "./prefer-early-return";

describe("prefer-early-return", () => {
  const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2015 },
    settings: { custom: { preferEarlyReturn: true } },
  });

  it("should pass when there are no nested ifs in functions", () => {
    ruleTester.run(
      "prefer-early-return", // rule name
      preferEarlyReturnRule, // rule code
      {
        // checks
        // 'valid' checks cases that should pass
        valid: [
          {
            code: `
          () => {
            if (!foo) { return false; }
            if (foo.bar) { return true; }
          }
        `,
          },
        ],
        // 'invalid' checks cases that should not pass
        invalid: [
          {
            code: `
          () => {
            if (foo) {
              if (foo.bar) { return true; }
              else { return false; }
            }
          }`,
            output: `
          () => {
            if (foo) {
              if (foo.bar) { return true; }
              else { return false; }
            }
          }`,
            errors: 1,
          },
        ],
      }
    );
  });
});
