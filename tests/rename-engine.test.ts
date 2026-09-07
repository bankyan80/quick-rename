import { describe, it, expect } from "vitest";
import {
  applyPrefix,
  applySuffix,
  findAndReplace,
  applyCase,
  removeText,
  formatNumber,
  applyPattern,
  generateNewName,
  validateFilename,
  detectDuplicates,
  sortFiles,
  generatePreview,
  autoResolveConflicts,
} from "@/lib/rename-engine";
import type { FileEntry, RenameRule } from "@/types";

function makeFile(name: string, extension: string, size = 1000): FileEntry {
  return {
    id: `${name}${extension}-${Math.random()}`,
    name,
    extension,
    size,
    lastModified: new Date("2026-09-07T10:00:00Z"),
    type: "file",
    selected: true,
    selectionOrder: 1,
  };
}

describe("rename-engine", () => {
  describe("formatNumber", () => {
    it("pads numbers with zeros", () => {
      expect(formatNumber(1, 3)).toBe("001");
      expect(formatNumber(42, 2)).toBe("42");
      expect(formatNumber(7, 5)).toBe("00007");
    });
  });

  describe("applyPrefix", () => {
    it("adds a prefix", () => {
      expect(applyPrefix("IMG_001", ".jpg", "Vacation_")).toBe("Vacation_IMG_001");
    });
    it("works with empty prefix", () => {
      expect(applyPrefix("IMG_001", ".jpg", "")).toBe("IMG_001");
    });
  });

  describe("applySuffix", () => {
    it("adds a suffix", () => {
      expect(applySuffix("IMG_001", ".jpg", "_Final")).toBe("IMG_001_Final");
    });
  });

  describe("findAndReplace", () => {
    it("replaces case-sensitive text", () => {
      expect(findAndReplace("IMG_001_IMG", "IMG", "Holiday", true)).toBe(
        "Holiday_001_Holiday"
      );
    });
    it("replaces case-insensitive text", () => {
      expect(findAndReplace("IMg_001", "img", "Holiday", false)).toBe(
        "Holiday_001"
      );
    });
    it("returns original when find is empty", () => {
      expect(findAndReplace("IMG_001", "", "Holiday", true)).toBe("IMG_001");
    });
  });

  describe("applyCase", () => {
    it("converts to uppercase", () => {
      expect(applyCase("laporan sekolah", "uppercase")).toBe("LAPORAN SEKOLAH");
    });
    it("converts to lowercase", () => {
      expect(applyCase("LAPORAN SEKOLAH", "lowercase")).toBe("laporan sekolah");
    });
    it("converts to title case", () => {
      expect(applyCase("laporan sekolah", "title")).toBe("Laporan Sekolah");
    });
    it("converts to sentence case", () => {
      expect(applyCase("LAPORAN SEKOLAH", "sentence")).toBe("Laporan sekolah");
    });
  });

  describe("removeText", () => {
    it("removes all occurrences", () => {
      expect(removeText("Laporan (1)", "(1)")).toBe("Laporan ");
    });
    it("works with empty remove text", () => {
      expect(removeText("IMg_001", "")).toBe("IMg_001");
    });
  });

  describe("applyPattern", () => {
    it("generates numbered names with padding", () => {
      expect(applyPattern("PPPK_{nnn}", "IMG_001", ".pdf", 0, 1, 1, 3)).toBe(
        "PPPK_001"
      );
      expect(applyPattern("PPPK_{nnn}", "IMG_002", ".pdf", 1, 1, 1, 3)).toBe(
        "PPPK_002"
      );
      expect(applyPattern("PPPK_{nnn}", "IMG_003", ".pdf", 2, 1, 1, 3)).toBe(
        "PPPK_003"
      );
    });
    it("uses start number and increment", () => {
      expect(
        applyPattern("Dokumen_{n}", "a", ".pdf", 0, 10, 5, 3)
      ).toBe("Dokumen_010");
      expect(
        applyPattern("Dokumen_{n}", "b", ".pdf", 1, 10, 5, 3)
      ).toBe("Dokumen_015");
    });
    it("inserts date", () => {
      const pattern = applyPattern("Dokumen_{date}_{n}", "a", ".pdf", 0, 1, 1, 3);
      expect(pattern).toMatch(/^Dokumen_\d{4}-\d{2}-\d{2}_001$/);
    });
    it("inserts extension", () => {
      expect(applyPattern("{name}.{ext}", "IMG_001", ".pdf", 0, 1, 1, 3)).toBe(
        "IMG_001.pdf"
      );
    });
    it("replaces {n} with min padding of 1", () => {
      expect(applyPattern("f{n}", "a", ".jpg", 0, 1, 1, 0)).toBe("f1");
    });
  });

  describe("generateNewName", () => {
    const file = makeFile("IMG_001", ".pdf");

    it("applies prefix rule", () => {
      const rule: RenameRule = { mode: "prefix", prefix: "PPPK_" };
      expect(generateNewName(file, rule, 0)).toBe("PPPK_IMG_001");
    });

    it("applies pattern rule", () => {
      const rule: RenameRule = { mode: "pattern", pattern: "PPPK_{nnn}" };
      expect(generateNewName(file, rule, 0)).toBe("PPPK_001");
    });

    it("applies numbering rule", () => {
      const rule: RenameRule = { mode: "numbering", startNumber: 1, increment: 1, padding: 3 };
      expect(generateNewName(makeFile("a", ".jpg"), rule, 0)).toBe("001");
      expect(generateNewName(makeFile("b", ".jpg"), rule, 1)).toBe("002");
    });

    it("PRD example: IMG_001.pdf with PPPK_{n} gives PPPK_001.pdf", () => {
      const rule: RenameRule = {
        mode: "pattern",
        pattern: "PPPK_{nnn}",
        padding: 3,
      };
      const preview = generatePreview([file], rule, "name-asc");
      expect(preview[0].newName).toBe("PPPK_001.pdf");
    });
  });

  describe("validateFilename", () => {
    it("accepts valid filenames", () => {
      expect(validateFilename("IMG_001").valid).toBe(true);
      expect(validateFilename("holiday-photo 2026").valid).toBe(true);
    });
    it("rejects empty filenames", () => {
      expect(validateFilename("").valid).toBe(false);
      expect(validateFilename("   ").valid).toBe(false);
    });
    it("rejects Windows-invalid characters", () => {
      for (const char of ["<", ">", ":", '"', "/", "\\", "|", "?", "*"]) {
        expect(validateFilename(`bad${char}name`).valid).toBe(false);
      }
    });
    it("rejects reserved names", () => {
      expect(validateFilename("CON").valid).toBe(false);
      expect(validateFilename("PRN").valid).toBe(false);
      expect(validateFilename("com1").valid).toBe(false);
    });
    it("rejects trailing period or space", () => {
      expect(validateFilename("file.").valid).toBe(false);
      expect(validateFilename("file ").valid).toBe(false);
    });
  });

  describe("detectDuplicates", () => {
    it("detects duplicate target names", () => {
      const previews = [
        { original: "a.jpg", newName: "x.jpg", status: "ready" as const, file: makeFile("a", ".jpg") },
        { original: "b.jpg", newName: "x.jpg", status: "ready" as const, file: makeFile("b", ".jpg") },
      ];
      const result = detectDuplicates(previews);
      expect(result.filter((p) => p.status === "duplicate").length).toBe(2);
    });
    it("does not flag unique names", () => {
      const previews = [
        { original: "a.jpg", newName: "a.jpg", status: "ready" as const, file: makeFile("a", ".jpg") },
        { original: "b.jpg", newName: "b.jpg", status: "ready" as const, file: makeFile("b", ".jpg") },
      ];
      const result = detectDuplicates(previews);
      expect(result.filter((p) => p.status === "duplicate").length).toBe(0);
    });
  });

  describe("autoResolveConflicts", () => {
    it("renames duplicate targets into unique names", () => {
      const previews = [
        { original: "a.jpg", newName: "x.jpg", status: "duplicate" as const, file: makeFile("a", ".jpg") },
        { original: "b.jpg", newName: "x.jpg", status: "duplicate" as const, file: makeFile("b", ".jpg") },
        { original: "c.jpg", newName: "x.jpg", status: "duplicate" as const, file: makeFile("c", ".jpg") },
      ];
      const result = autoResolveConflicts(previews);
      const names = result.map((p) => p.newName);
      expect(new Set(names).size).toBe(3);
      expect(names[0]).toBe("x.jpg");
      expect(names[1]).toBe("x (1).jpg");
      expect(names[2]).toBe("x (2).jpg");
      expect(result.every((p) => p.status === "ready")).toBe(true);
    });

    it("avoids colliding with an existing target name", () => {
      const previews = [
        { original: "a.jpg", newName: "a.jpg", status: "ready" as const, file: makeFile("a", ".jpg") },
        { original: "b.jpg", newName: "a.jpg", status: "duplicate" as const, file: makeFile("b", ".jpg") },
      ];
      const result = autoResolveConflicts(previews);
      expect(result[1].newName).toBe("a (1).jpg");
    });

    it("leaves invalid entries untouched", () => {
      const previews = [
        { original: "a.jpg", newName: "<bad>", status: "invalid" as const, file: makeFile("a", ".jpg") },
        { original: "b.jpg", newName: "b.jpg", status: "ready" as const, file: makeFile("b", ".jpg") },
      ];
      const result = autoResolveConflicts(previews);
      expect(result[0].status).toBe("invalid");
      expect(result[0].newName).toBe("<bad>");
    });
  });

  describe("generatePreview", () => {
    it("preserves extension by default", () => {
      const preview = generatePreview([makeFile("IMG_001", ".pdf")], { mode: "pattern", pattern: "PPPK_{nnn}" }, "name-asc");
      expect(preview[0].newName).toBe("PPPK_001.pdf");
    });

    it("allows extension changes when preserveExtensions is false", () => {
      const file = makeFile("IMG_001", ".pdf");
      const preview = generatePreview([file], { mode: "find-replace", findText: "pdf", replaceText: "txt" }, "name-asc", false);
      expect(preview[0].newName).toBe("IMG_001.txt");
    });
  });

  describe("sortFiles", () => {
    const a = makeFile("b", ".jpg", 300);
    const b = makeFile("a", ".png", 100);
    const c = makeFile("c", ".doc", 200);

    it("sorts by name ascending", () => {
      const sorted = sortFiles([a, b, c], "name-asc");
      expect(sorted.map((f) => f.name)).toEqual(["a", "b", "c"]);
    });
    it("sorts by name descending", () => {
      const sorted = sortFiles([a, b, c], "name-desc");
      expect(sorted.map((f) => f.name)).toEqual(["c", "b", "a"]);
    });
    it("sorts by size", () => {
      const sorted = sortFiles([a, b, c], "size");
      expect(sorted.map((f) => f.name)).toEqual(["a", "c", "b"]);
    });
  });
});