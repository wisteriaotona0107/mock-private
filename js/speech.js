export const createSpeaker = () => {
  const support = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

  const speakText = (text, settings) => {
    if (!support || !settings.speechEnabled || !text) return false;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = settings.locale;
    utter.rate = Number(settings.speechRate) || 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
    return true;
  };

  return {
    support,
    speakCard: (card, settings) => speakText(card.reading || card.label, settings),
    speakSentence: (cards, settings) => speakText(cards.map((c) => c.reading || c.label).join('、'), settings)
  };
};
