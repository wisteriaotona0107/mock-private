import { qs, createEl, trapFocus, toast } from './utils.js';
import { sendInquiry } from './api.js';

export const initContact = () => {
  const form = qs('#contact-form');
  if (!form) return;

  const fields = {
    name: { input: qs('#name'), error: qs('#error-name') },
    email: { input: qs('#email'), error: qs('#error-email') },
    phone: { input: qs('#phone'), error: qs('#error-phone') },
    purpose: { input: qs('#purpose'), error: qs('#error-purpose') },
    message: { input: qs('#message'), error: qs('#error-message') },
    consent: { input: qs('#consent'), error: qs('#error-consent') }
  };

  const validators = {
    name: (value) => (!value.trim() ? '氏名を入力してください。' : ''),
    email: (value) => {
      if (!value.trim()) return 'メールアドレスを入力してください。';
      const pattern = /^[\w.!#$%&'*+/=?^`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/;
      return pattern.test(value) ? '' : 'メールアドレスの形式が正しくありません。';
    },
    phone: (value) => {
      if (!value.trim()) return '';
      const pattern = /^[0-9+\-()\s]{9,20}$/;
      return pattern.test(value) ? '' : '電話番号は数字と記号で入力してください。';
    },
    purpose: (value) => (!value ? '要件を選択してください。' : ''),
    message: (value) => {
      if (!value.trim()) return 'お問い合わせ内容を入力してください。';
      return value.trim().length >= 20 ? '' : 'お問い合わせ内容は20文字以上で入力してください。';
    },
    consent: (checked) => (checked ? '' : '個人情報の取り扱いに同意してください。')
  };

  const setError = (fieldKey, message) => {
    const field = fields[fieldKey];
    if (!field) return;
    field.error.textContent = message;
    if (message) {
      field.input.setAttribute('aria-invalid', 'true');
    } else {
      field.input.removeAttribute('aria-invalid');
    }
  };

  const validateField = (fieldKey) => {
    const field = fields[fieldKey];
    if (!field) return true;
    const value = fieldKey === 'consent' ? field.input.checked : field.input.value;
    const message = validators[fieldKey](value);
    setError(fieldKey, message);
    return !message;
  };

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    if (!field) return;
    const eventName = key === 'consent' ? 'change' : 'input';
    field.input.addEventListener(eventName, () => validateField(key));
    field.input.addEventListener('blur', () => validateField(key));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const allValid = Object.keys(fields).every((key) => validateField(key));
    if (!allValid) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.consent = fields.consent.input.checked;
    openConfirmationModal(data, () => {
      form.reset();
      Object.keys(fields).forEach((key) => setError(key, ''));
    });
  });
};

const openConfirmationModal = (data, onSuccess) => {
  const overlay = createEl('div', { className: 'modal-overlay', attrs: { role: 'presentation' } });
  const modal = createEl('div', {
    className: 'modal',
    attrs: {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'contact-confirm-title'
    }
  });
  const title = createEl('h3', { id: 'contact-confirm-title', text: '送信内容の確認' });
  const summaryList = createEl('dl');
  const summaryEntries = [
    ['氏名', data.name],
    ['メール', data.email],
    ['電話', data.phone || '未入力'],
    ['要件', getPurposeLabel(data.purpose)],
    ['本文', data.message]
  ];
  summaryEntries.forEach(([label, value]) => {
    summaryList.appendChild(createEl('dt', { text: label }));
    summaryList.appendChild(createEl('dd', { text: value }));
  });
  const notice = createEl('p', { text: '内容をご確認のうえ、「送信する」ボタンを押してください。' });
  const actions = createEl('div', { className: 'modal__actions' });
  const cancelBtn = createEl('button', { className: 'btn btn--secondary', text: '戻る', attrs: { type: 'button' } });
  const submitBtn = createEl('button', { className: 'btn btn--primary', text: '送信する', attrs: { type: 'button' } });

  actions.append(cancelBtn, submitBtn);
  modal.append(title, summaryList, notice, actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const previousActiveElement = document.activeElement;
  const removeTrap = trapFocus(modal);
  submitBtn.focus();

  const closeModal = () => {
    overlay.remove();
    removeTrap();
    if (previousActiveElement && previousActiveElement.focus) {
      previousActiveElement.focus();
    }
  };

  cancelBtn.addEventListener('click', () => {
    closeModal();
  });

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    cancelBtn.disabled = true;
    submitBtn.textContent = '送信中...';
    try {
      const response = await sendInquiry(data);
      if (response.success) {
        toast({
          title: 'お問い合わせを受け付けました',
          message: `受付番号: ${response.reference}`
        });
        closeModal();
        onSuccess();
      }
    } catch (error) {
      toast({ title: '送信に失敗しました', message: '時間をおいて再度お試しください。' });
      submitBtn.disabled = false;
      cancelBtn.disabled = false;
      submitBtn.textContent = '送信する';
    }
  });
};

const getPurposeLabel = (value) => {
  const labels = {
    estimate: '見積のご相談',
    project: 'プロジェクトのご依頼',
    partnership: '協業・パートナーシップ',
    other: 'その他のお問い合わせ'
  };
  return labels[value] || value;
};
