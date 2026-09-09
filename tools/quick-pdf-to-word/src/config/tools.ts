export type ToolLink = {
  slug: string;
  icon: string;
  label: string;
  url: string;
  external: boolean;
};

const TOOLS: Omit<ToolLink, "url" | "external">[] = [
  { slug: "quick-rename", icon: "rename", label: "Quick Rename" },
  { slug: "quick-merge-pdf", icon: "merge", label: "Merge PDF" },
  { slug: "quick-pdf-to-jpg", icon: "image", label: "PDF to JPG" },
  { slug: "quick-resize-pdf", icon: "resize", label: "Resize PDF" },
  { slug: "quick-pdf-to-word", icon: "word", label: "PDF to Word" },
  { slug: "quick-pdf-to-excel", icon: "excel", label: "PDF to Excel" },
  { slug: "quick-pdf-to-powerpoint", icon: "ppt", label: "PDF to PowerPoint" },
];

export function toolsFor(current: string): ToolLink[] {
  return TOOLS.map((t) => {
    if (t.slug === current) {
      return { ...t, url: "./", external: false };
    }
    if (t.slug === "quick-rename") {
      return { ...t, url: "https://quick-rename.vercel.app", external: true };
    }
    return { ...t, url: `https://${t.slug}.vercel.app`, external: true };
  });
}