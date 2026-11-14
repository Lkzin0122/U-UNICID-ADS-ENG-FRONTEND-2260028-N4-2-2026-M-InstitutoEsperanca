/* Canal único de envio do formulário e do chat. Dados de contato não vão à IA. */
(() => {
  'use strict';
  let busy = false;
  // FORMATO DO E-MAIL: valida a estrutura; não comprova que a caixa exista.
  function validEmail(value) {
    if (typeof value !== 'string' || value.length > 254 || /\s/.test(value)) return false;
    const parts = value.split('@');
    if (parts.length !== 2) return false;
    const [local, domain] = parts;
    if (
      !local ||
      local.length > 64 ||
      !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local) ||
      /^\.|\.$|\.\./.test(local)
    )
      return false;
    if (!domain || /[\s/\\?#:%]/.test(domain)) return false;
    try {
      const hostname = new URL('https://' + domain).hostname;
      const labels = hostname.split('.');
      return (
        labels.length >= 2 &&
        labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label)) &&
        /^(?:[a-z]{2,63}|xn--[a-z0-9-]{2,59})$/i.test(labels.at(-1))
      );
    } catch {
      return false;
    }
  }
  // SERVIÇO COMPARTILHADO: formulário e chatbot usam o mesmo envio pelo EmailJS.
  async function send(params, { signal } = {}) {
    if (!validEmail(params.reply_to)) throw new Error('invalid_email');
    if (
      typeof params.from_name !== 'string' ||
      !params.from_name.trim() ||
      typeof params.message !== 'string' ||
      params.message.trim().length < 10 ||
      typeof params.subject !== 'string' ||
      !params.subject.trim()
    )
      throw new Error('invalid_contact');
    if (busy) throw new Error('contact_busy');
    const config = window.ESPERANCA_EMAILJS;
    if (
      !config ||
      !['serviceId', 'templateId', 'publicKey'].every(
        (key) => typeof config[key] === 'string' && config[key].trim(),
      )
    )
      throw new Error('contact_unconfigured');
    busy = true;
    try {
      return await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          service_id: config.serviceId.trim(),
          template_id: config.templateId.trim(),
          user_id: config.publicKey.trim(),
          template_params: { ...params, title: params.subject },
        }),
      });
    } finally {
      busy = false;
    }
  }
  window.esperancaContact = Object.freeze({ validEmail, send });
})();
