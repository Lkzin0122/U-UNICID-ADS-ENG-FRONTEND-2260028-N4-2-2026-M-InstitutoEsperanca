"""Conteúdo das páginas Galeria e Mídia; o layout global é gerado por build_site.py."""

PHOTOS = [
    {
        'file': 'comunidade-acolhimento.jpg', 'category': 'acolhimento',
        'label': 'Acolhimento', 'title': 'Pertencer faz diferença.',
        'alt': 'Crianças reunidas ao ar livre, próximas umas das outras, em um momento de convivência.',
        'description': 'A convivência inspira nossa proposta de uma comunidade que acolhe.',
        'credit': 'Larm Rmah / Unsplash',
        'source': 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c',
    },
    {
        'file': 'educacao.jpg', 'category': 'educacao',
        'label': 'Educação', 'title': 'Aprender abre caminhos.',
        'alt': 'Livros empilhados com uma maçã, lápis coloridos e blocos com as letras A, B e C sobre uma mesa.',
        'description': 'Livros, curiosidade e espaço para descobrir o mundo.',
        'credit': 'Element5 Digital / Unsplash',
        'source': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
    },
    {
        'file': 'natureza.jpg', 'category': 'ambiente',
        'label': 'Meio ambiente', 'title': 'Cuidar também é plantar.',
        'alt': 'Duas pessoas com luvas e máscaras plantam uma muda em uma área arborizada, acompanhadas por um grupo.',
        'description': 'Pequenos cuidados com o ambiente podem ser compartilhados.',
        'credit': 'Unsplash',
        'source': 'https://images.unsplash.com/photo-1598335624134-5bceb5de202d',
    },
    {
        'file': 'voluntariado.jpg', 'category': 'acolhimento',
        'label': 'Voluntariado', 'title': 'Presença que soma.',
        'alt': 'Pessoa de costas, com boné e camiseta identificada com a palavra Volunteer, participa de um evento.',
        'description': 'Tempo, habilidades e disposição para fazer parte.',
        'credit': 'Unsplash',
        'source': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a',
    },
    {
        'file': 'livros.jpg', 'category': 'educacao',
        'label': 'Leitura', 'title': 'Histórias para compartilhar.',
        'alt': 'Estantes altas de madeira cheias de livros de diferentes tamanhos e cores.',
        'description': 'A leitura aproxima pessoas de novas ideias e possibilidades.',
        'credit': 'Unsplash',
        'source': 'https://images.unsplash.com/photo-1507842217343-583bb7270b66',
    },
]


def gallery_photos():
    return '\n'.join(f'''
      <figure class="gallery-item" data-filter-item data-category="{photo['category']}">
        <button type="button" class="gallery-image-button" data-lightbox="img/{photo['file']}" data-caption="{photo['title']} {photo['alt']} Imagem ilustrativa. {photo['credit']}." aria-label="Ampliar imagem: {photo['title']}">
          <img src="img/{photo['file']}" alt="{photo['alt']}" loading="lazy" width="1100" height="760">
          <span class="gallery-expand" aria-hidden="true">↗</span>
        </button>
        <figcaption>
          <span class="tag">{photo['label']}</span>
          <strong>{photo['title']}</strong>
          <p>{photo['description']}</p>
          <small>Imagem ilustrativa · <a href="{photo['source']}" rel="noopener noreferrer">{photo['credit']}</a></small>
        </figcaption>
      </figure>''' for photo in PHOTOS)


PAGES = {
    'galeria.html': {
        'title': 'Galeria',
        'description': 'Imagens que inspiram a proposta do Instituto Esperança: educação, convivência, voluntariado e cuidado com o meio ambiente.',
        'section': 'conteudos',
        'content': '''
<section class="page-hero">
  <div class="container">
    <p class="eyebrow">NOSSO OLHAR</p>
    <h1>Imagens que inspiram <em>novos caminhos.</em></h1>
    <p class="lead">Aprender, cuidar e estar junto. Um olhar para os temas que dão sentido à nossa proposta.</p>
  </div>
</section>
<section class="section" aria-labelledby="titulo-galeria">
  <div class="container" data-filter-group>
    <div class="section-heading">
      <div><p class="eyebrow">GALERIA DE INSPIRAÇÕES</p><h2 id="titulo-galeria">O cuidado tem muitas formas.</h2></div>
      <p>Selecione um tema e abra as imagens para ver os detalhes.</p>
    </div>
    <div class="filter-bar" role="group" aria-label="Filtrar imagens por tema">
      <button type="button" data-filter="todos" aria-pressed="true">Todas as imagens</button>
      <button type="button" data-filter="educacao" aria-pressed="false">Educação</button>
      <button type="button" data-filter="acolhimento" aria-pressed="false">Convivência</button>
      <button type="button" data-filter="ambiente" aria-pressed="false">Meio ambiente</button>
    </div>
    <p class="filter-status sr-only" data-filter-status role="status" aria-live="polite"></p>
    <div class="gallery-grid">''' + gallery_photos() + '''
    </div>
    <p class="notice">As fotografias são ilustrativas e foram selecionadas no Unsplash. Elas representam os temas do projeto e não documentam atividades realizadas pelo Instituto. <a href="https://unsplash.com/license" rel="noopener noreferrer">Conheça a licença das imagens.</a></p>
  </div>
</section>
<section class="section section-tint" aria-labelledby="galeria-proximo">
  <div class="container split">
    <div><p class="eyebrow">DA INSPIRAÇÃO À PROPOSTA</p><h2 id="galeria-proximo">Conheça as ideias por trás das imagens.</h2></div>
    <div><p>Em Projetos, você encontra as frentes de atuação propostas e as formas de se aproximar de cada uma delas.</p><a href="projetos.html" class="button button-primary">Explorar os projetos <span aria-hidden="true">↗</span></a></div>
  </div>
</section>''',
    },
    'midia.html': {
        'title': 'Mídia',
        'description': 'Conheça a proposta do Instituto Esperança em vídeo, trilha instrumental e apresentação interativa, com alternativas textuais.',
        'section': 'conteudos',
        'content': '''
<section class="page-hero">
  <div class="container">
    <p class="eyebrow">VER, OUVIR E CONHECER</p>
    <h1>Uma ideia que ganha <em>voz e movimento.</em></h1>
    <p class="lead">Conheça a essência da nossa proposta no seu ritmo. Aqui, cada conteúdo também tem uma alternativa em texto.</p>
  </div>
</section>
<section class="section" aria-labelledby="titulo-manifesto">
  <div class="container">
    <div class="section-heading">
      <div><p class="eyebrow">01 / MANIFESTO VISUAL</p><h2 id="titulo-manifesto">Esperança é um convite.</h2></div>
      <p>Quatro mensagens que traduzem o que queremos construir juntos.</p>
    </div>
    <figure class="media-feature">
      <video controls playsinline preload="metadata" poster="assets/manifesto-poster.svg" width="960" height="540" aria-label="Manifesto visual do Instituto Esperança" aria-describedby="descricao-video">
        <source src="assets/manifesto.webm" type="video/webm">
        <track kind="captions" src="assets/manifesto.vtt" srclang="pt-BR" label="Português">
        Seu navegador não reproduz este vídeo. Leia a descrição completa abaixo.
      </video>
      <figcaption id="descricao-video">Vídeo autoral · 14 segundos · Sem áudio. Animação de textos sobre fundo azul, com detalhes amarelos. Criado para este projeto acadêmico.</figcaption>
    </figure>
    <div class="faq-list">
      <details>
        <summary>Ler o conteúdo do vídeo</summary>
        <div>
          <p><strong>1. Acolher.</strong> Esperança que acolhe. Solidariedade que transforma.</p>
          <p><strong>2. Incluir.</strong> Oportunidades para crescer. Aprender, participar e pertencer.</p>
          <p><strong>3. Cuidar.</strong> Pessoas e planeta. O mesmo cuidado. Acolhimento e consciência ambiental.</p>
          <p><strong>4. Participar.</strong> O próximo passo pode ser seu. Conheça os projetos e as formas de participar.</p>
          <p>A animação apresenta a proposta do Instituto Esperança, um projeto acadêmico da UNICID.</p>
        </div>
      </details>
    </div>
  </div>
</section>
<section class="section section-tint" aria-labelledby="titulo-audio">
  <div class="container split">
    <div>
      <p class="eyebrow">02 / UMA PAUSA</p>
      <h2 id="titulo-audio">Pausa para acolher.</h2>
      <p>Uma pequena composição instrumental para acompanhar a ideia de presença e cuidado. Aperte o play quando quiser ouvir.</p>
      <p class="small-text">Trilha original criada para o projeto · 16 segundos · Sem fala.</p>
    </div>
    <div class="card audio-card">
      <span class="tag">Trilha instrumental</span>
      <h3>Um momento de calma</h3>
      <audio controls preload="metadata" aria-label="Ouvir Pausa para acolher, trilha instrumental de 16 segundos">
        <source src="assets/pausa-para-acolher.wav" type="audio/wav">
        Seu navegador não reproduz este áudio. <a href="assets/pausa-para-acolher.wav">Baixar a trilha instrumental.</a>
      </audio>
      <p><strong>Descrição sonora:</strong> sequência suave de notas sintetizadas em quatro acordes, com sons que diminuem gradualmente. Não há voz, palavras ou informações adicionais no áudio.</p>
    </div>
  </div>
</section>
<section class="section" aria-labelledby="titulo-apresentacao">
  <div class="container">
    <div class="section-heading">
      <div><p class="eyebrow">03 / APRESENTAÇÃO INTERATIVA</p><h2 id="titulo-apresentacao">Nossa proposta, de perto.</h2></div>
      <p>Explore os três caminhos que conectam educação, inclusão e cuidado.</p>
    </div>
    <iframe class="presentation-frame" src="assets/apresentacao.html" title="Apresentação interativa: os três caminhos do Instituto Esperança" loading="lazy" width="1100" height="550"></iframe>
    <p class="media-caption">Conteúdo autoral do projeto. <a href="assets/apresentacao.html" class="text-link">Abrir a apresentação em página própria <span aria-hidden="true">↗</span></a></p>
  </div>
</section>''',
    },
}
