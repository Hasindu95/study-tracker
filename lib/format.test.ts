import { describe, it, expect } from "vitest";
import { minutesToHours } from "./format";

describe("minutesToHours", () => {
  it("converts 90 minutes to 1.5", () => {
    expect(minutesToHours(90)).toBe("1.5");
  });

  it("converts 0 minutes to 0.0", () => {
    expect(minutesToHours(0)).toBe("0.0");
  });

  it("converts 100 minutes to 1.7", () => {
    expect(minutesToHours(100)).toBe("1.7");
  });
});