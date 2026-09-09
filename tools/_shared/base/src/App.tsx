import { useEffect, useState } from "react";
import { Footer, Header, PrivacyModal, TermsModal, TutorialModal } from "./shared/components";
import { useTheme } from "./shared/theme";
import { Workflow, type AppConfig } from "./Workflow";
import { meta } from "./config/meta";
import { toolsFor } from "./config/tools";

export default function App({ config }: { config: AppConfig }) {
  const theme = useTheme();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", meta.accent);
  }, []);

  return (
    <>
      <Header
        meta={meta}
        tools={toolsFor(meta.slug)}
        theme={theme}
        onHelp={() => setTutorialOpen(true)}
      />
      <Workflow config={config} onOpenTutorial={() => setTutorialOpen(true)} />
      <Footer meta={meta} onHelp={() => setTutorialOpen(true)} onPrivacy={() => setPrivacyOpen(true)} onTerms={() => setTermsOpen(true)} />

      {tutorialOpen && <TutorialModal steps={config.texts.tutorial} onClose={() => setTutorialOpen(false)} />}
      {privacyOpen && <PrivacyModal onClose={() => setPrivacyOpen(false)} />}
      {termsOpen && <TermsModal onClose={() => setTermsOpen(false)} meta={meta} />}
    </>
  );
}