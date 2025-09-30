export const sendInquiry = (payload) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const reference = `INQ-2025-${Math.floor(1000 + Math.random() * 9000)}`;
      resolve({ success: true, reference, payload });
    }, 1200);
  });
};
