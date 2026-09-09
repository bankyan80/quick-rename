import { meta } from "./meta";
import { texts } from "./texts";
import { engine, enrich } from "../engine";
import { OptionsPanel } from "../app/options";
import { PreviewPanel } from "../app/preview";
import type { AppConfig } from "../Workflow";

export function buildApp(): AppConfig {
  return {
    meta,
    texts,
    single: meta.single,
    accept: meta.accept,
    maxMb: meta.maxMb,
    steps: [texts.step1, texts.step2, texts.step3, texts.step4, texts.step5],
    defaultOptions: meta.defaultOptions,
    renderOptions: (ctx) => <OptionsPanel {...ctx} />,
    renderPreview: (ctx) => <PreviewPanel {...ctx} />,
    engine,
    enrich,
  };
}