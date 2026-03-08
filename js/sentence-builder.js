export const createSentenceBuilder = () => {
  let sentence = [];

  return {
    getItems: () => sentence,
    add: (card) => {
      sentence = [...sentence, card];
      return sentence;
    },
    remove: (index) => {
      sentence = sentence.filter((_, i) => i !== index);
      return sentence;
    },
    moveLeft: (index) => {
      if (index <= 0) return sentence;
      [sentence[index - 1], sentence[index]] = [sentence[index], sentence[index - 1]];
      return [...sentence];
    },
    moveRight: (index) => {
      if (index >= sentence.length - 1) return sentence;
      [sentence[index], sentence[index + 1]] = [sentence[index + 1], sentence[index]];
      return [...sentence];
    },
    clear: () => {
      sentence = [];
      return sentence;
    }
  };
};
