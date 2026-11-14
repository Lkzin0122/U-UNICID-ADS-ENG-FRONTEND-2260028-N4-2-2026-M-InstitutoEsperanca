# Vozes incluidas no site

O leitor inclui o motor eSpeak NG, distribuido no pacote `espeak-ng` 1.0.2,
com dados locais para os nove idiomas do site. Ha variantes feminina e
masculina. Estas vozes sao sintetizadas e tem sonoridade robotica.

As vozes do dispositivo continuam disponiveis e recebem prioridade quando
compativeis com o idioma e a preferencia escolhida. Quando nao existem, o
leitor seleciona uma voz incluida. A lista identifica essas opcoes como
"Voz pronta do site". Tambem podem ser selecionadas manualmente.

O motor e os dados estao em `assets/vendor/espeak-ng/`. O arquivo WebAssembly
tem aproximadamente 18,5 MB e so e carregado ao usar uma voz incluida.
A sintese ocorre em um Web Worker e o texto permanece no navegador.
Nao ha chave, assinatura ou chamada a um servico externo de voz.
O navegador ainda exige uma interacao para permitir audio. O primeiro uso
pode demorar enquanto os dados sao carregados. Sirva o site por HTTP/HTTPS.
O navegador precisa oferecer WebAssembly, Web Workers e Web Audio. O port
de teste do WebKit para Windows nao inclui Web Audio e nao permite validar
este motor; as vozes nativas continuam sendo usadas quando disponiveis.

`js/speech-engine.js` integra Web Audio e as vozes nativas aos controles
existentes. `js/speech-worker.js` executa a sintese sem bloquear a interface.
Parar, trocar de idioma e sair do trecho cancelam o audio anterior.

Teste com vozes do sistema desativadas e reproducao silenciada:

```sh
uv run --with playwright python scripts/check_bundled_speech.py chromium
uv run --with playwright python scripts/check_bundled_speech.py firefox
uv run --with playwright python scripts/check_bundled_speech.py webkit
```

O teste gera e decodifica audio real nos nove idiomas e verifica sinal nao
silencioso, variantes, hover e cancelamento. Nao avalia a pronuncia como
uma pessoa falante nativa. A suite `check_speech_reader.py` isola as vozes
nativas, mantendo seus testes de falhas independentes do motor incluido.

Licenca e origem: veja `assets/vendor/espeak-ng/LICENSE`, `README.md` e
`PROVENANCE.json`. O motor e distribuido sob GPL-3.0-or-later.
Fontes: https://github.com/ianmarmour/espeak-ng.js e
https://github.com/espeak-ng/espeak-ng.
