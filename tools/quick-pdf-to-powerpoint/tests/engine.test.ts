import { describe, expect, it } from "vitest";
import { aspectClass } from "../src/engine";

describe("aspectClass", () => {
  it("detects landscape", () => {
    expect(aspectClass(900, 600)).toBe("landscape");
  });

  it("detects portrait", () => {
    expect(aspectClass(600, 900)).toBe("portrait");
  });

  it("treats near-square ratios as square", () => {
    expect(aspectClass(841, 842)).toBe("square");
    expect(aspectClass(595, 595)).toBe("square");
  });

  it("handles the exact boundary", () => {
    expect(aspectClass(107, 100)).toBe("landscape");
    expect(aspectClass(93, 100)).toBe("portrait");
  });
});