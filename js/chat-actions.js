/* Catálogo compartilhado: a IA só pode sugerir IDs; a interface executa ações conhecidas. */
(function (global) {
  'use strict';
  const pages = {
    inicio: ['index.html', 'Início'],
    sobre: ['sobre.html', 'Sobre o Instituto'],
    projetos: ['projetos.html', 'Projetos'],
    impacto: ['impacto.html', 'Impacto'],
    acessibilidade: ['acessibilidade.html', 'Acessibilidade'],
    galeria: ['galeria.html', 'Galeria'],
    midia: ['midia.html', 'Mídia'],
    noticias: ['noticias.html', 'Notícias'],
    contato: ['contato.html', 'Contato'],
    hospedagem: ['orcamento_hospedagem.html', 'Hospedagem'],
    participar: ['participar.html', 'Como participar'],
    duvidas: ['perguntas-frequentes.html', 'Perguntas frequentes'],
  };
  const languages = {
    'pt-BR': 'Português',
    en: 'English',
    'es-419': 'Español',
    fr: 'Français',
    de: 'Deutsch',
    'zh-CN': '中文',
    ru: 'Русский',
    ja: '日本語',
    hi: 'हिन्दी',
  };
  const catalog = Object.fromEntries([
    ...Object.entries(pages).map(([key, [path, label]]) => [
      `page:${key}`,
      { kind: 'page', path, label },
    ]),
    ...Object.entries(languages).map(([language, label]) => [
      `language:${language}`,
      { kind: 'language', language, label },
    ]),
    ['contact:open', { kind: 'contact', label: 'Enviar contato' }],
    ['theme:light', { kind: 'visual', patch: { theme: 'light' }, label: 'Tema claro' }],
    ['theme:dark', { kind: 'visual', patch: { theme: 'dark' }, label: 'Tema escuro' }],
    ['contrast:on', { kind: 'visual', patch: { contrast: true }, label: 'Ativar alto contraste' }],
    [
      'contrast:off',
      { kind: 'visual', patch: { contrast: false }, label: 'Desativar alto contraste' },
    ],
    ['font:increase', { kind: 'font', step: 0.1, label: 'Aumentar texto' }],
    ['font:decrease', { kind: 'font', step: -0.1, label: 'Diminuir texto' }],
  ]);
  const normalize = (text) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[.!?]+$/, '');
  function detect(message) {
    const text = normalize(message);
    if (
      /^(?:quero |gostaria de |pode |por favor,? )?(?:enviar|mandar|escrever|preparar) (?:um |uma |o )?(?:contato|e-?mail|mensagem)|^(?:entrar em contato|falar com (?:a )?equipe|contato|send (?:an? )?(?:email|message)|contact (?:the )?(?:team|institute)|संपर्क)$/i.test(
        text,
      )
    )
      return 'contact:open';
    if (
      /(?:mudar|mude|trocar|troque|alterar|altere|idioma|language|switch|change|cambiar|passer|sprache|langue|язык|语言|言語|भाषा)/i.test(
        text,
      )
    ) {
      const aliases = {
        'pt-BR': /portugu[eê]s|portuguese|portugues/,
        en: /ingles|english|ingl[eé]s|अंग्रेज़ी/,
        hi: /hindi|हिन्दी|हिंदी/,
        'es-419': /espanhol|espanol|spanish/,
        fr: /frances|french|francais/,
        de: /alemao|german|deutsch/,
        'zh-CN': /chines|chinese|中文/,
        ru: /russo|russian|русский/,
        ja: /japones|japanese|日本語/,
      };
      const language = Object.keys(aliases).find((key) => aliases[key].test(text));
      if (language) return 'language:' + language;
    }
    if (
      /^(?:ative|ativar|enable|turn on|quero)?\s*(?:o )?(?:alto contraste|high contrast)$/.test(
        text,
      )
    )
      return 'contrast:on';
    if (
      /^(?:desative|desativar|disable|turn off) (?:o )?(?:alto contraste|high contrast)$/.test(text)
    )
      return 'contrast:off';
    if (
      /^(?:(?:mude|mudar|troque|trocar|ativar|ative|switch|change|enable) (?:para )?)?(?:o )?(?:tema|modo|dark|light) (?:escuro|claro|mode|theme)$/.test(
        text,
      )
    )
      return /escuro|dark/.test(text) ? 'theme:dark' : 'theme:light';
    if (/^(?:aumente|aumentar|increase|bigger) (?:o )?(?:texto|fonte|text|font)$/.test(text))
      return 'font:increase';
    if (/^(?:diminua|diminuir|decrease|smaller) (?:o )?(?:texto|fonte|text|font)$/.test(text))
      return 'font:decrease';
    const navigation = text.match(
      /^(?:(?:abra|abrir|acesse|acessar|ir para|va para|me leve (?:para|a)|open|go to|visit) (?:a |o |os |as |the )?(?:pagina (?:de |do |da )?)?)(.+)$/,
    );
    if (navigation) {
      const aliases = {
        inicio: /^(?:inicio|home|home page)$/,
        sobre: /^(?:sobre|sobre o instituto|about)$/,
        projetos: /^(?:projetos|projects)$/,
        impacto: /^(?:impacto|impact)$/,
        acessibilidade: /^(?:acessibilidade|accessibility)$/,
        galeria: /^(?:galeria|gallery)$/,
        midia: /^(?:midia|media)$/,
        noticias: /^(?:noticias|news)$/,
        contato: /^(?:contato|contact)$/,
        participar: /^(?:participar|como participar|voluntariado|participate|volunteering)$/,
        hospedagem: /^(?:hospedagem|orcamento|hosting)$/,
        duvidas: /^(?:duvidas|perguntas frequentes|faq)$/,
      };
      const page = Object.keys(aliases).find((key) => aliases[key].test(navigation[1]));
      if (page) return 'page:' + page;
    }
    return null;
  }
  const actions = { catalog, pages, languages, detect };
  if (typeof module !== 'undefined' && module.exports) module.exports = actions;
  else global.esperancaChatActions = actions;
})(typeof window !== 'undefined' ? window : globalThis);
