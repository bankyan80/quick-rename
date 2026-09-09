import { describe, expect, it } from "vitest";
import { resolveSelectedPages } from "../src/engine";
import { validateFiles } from "../src/Workflow";

describe("resolveSelectedPages", () => {
  it("returns all pages by default", () => {
    expect(resolveSelectedPages(undefined, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(resolveSelectedPages([], 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("clamps and sorts the selection", () => {
    expect(resolveSelectedPages([5, 1, 3, 99, -2], 5)).toEqual([1, 3, 5]);
  });

  it("dedups-by-filter invalid entries", () => {
    expect(resolveSelectedPages([0, 0.5, "x", 2], 3)).toEqual([2]);
  });
});

describe("validateFiles", () => {
  it("accepts .pdf files and rejects others", () => {
    const ok = new File(["x"], "doc.pdf", { type: "application/pdf" });
    const bad = new File(["x"], "doc.txt", { type: "text/plain" });
    const res = validateFiles([ok, bad], ".pdf,application/pdf", 50);
    expect(res.valid).toHaveLength(1);
    expect(res.rejections).toHaveLength(1);
    expect(res.valid[0].name).toBe("doc.pdf");
    expect(res.rejections[0].reason).toContain("tidak didukung");
  });

  it("rejects empty files", () => {
    const empty = new File([""], "empty.pdf", { type: "application/pdf" });
    const res = validateFiles([empty], ".pdf,application/pdf", 50);
    expect(res.valid).toHaveLength(0);
    expect(res.rejections[0].reason).toContain("0 byte");
  });
});