/* Optional speech assistance. Uses the voices offered by the browser; no API key. */
(() => {
  'use strict';
  const copy = {
    'pt-BR': {
      title:'Leitura em voz alta', open:'Ouvir o site', close:'Fechar',
      intro:'Ouça os textos no idioma escolhido no site. Ative a leitura e passe o mouse sobre um trecho ou navegue com Tab.',
      enable:'Ativar leitura ao apontar', disable:'Desativar leitura ao apontar',
      gender:'Preferência de voz', auto:'Automática', female:'Feminina', male:'Masculina',
      voice:'Voz disponível', speed:'Velocidade', preview:'Ouvir amostra', page:'Ler esta página', stop:'Parar leitura',
      hint:'As vozes dependem do navegador e do dispositivo. Algumas precisam de internet. Pressione Esc para parar.',
      ready:'Escolha uma voz e ouça uma amostra.', active:'Leitura ativada. Aponte para um texto ou navegue com Tab.',
      stopped:'Leitura interrompida.', sample:'Olá! Esta é a voz que vai acompanhar sua leitura no Instituto Esperança.',
      unavailable:'Nenhuma voz disponível neste idioma. Instale uma voz nas configurações de fala do dispositivo ou tente outro navegador.',
      genderMissing:'Essa preferência não foi identificada nas vozes deste idioma. Escolha uma voz da lista e ouça uma amostra.',
      unsupported:'Este navegador não oferece leitura em voz alta. Experimente outro navegador ou o leitor de tela do dispositivo.',
      error:'Não foi possível iniciar a voz. Tente ouvir uma amostra ou selecione outra voz.',
      blocked:'O navegador precisa de um clique para liberar o áudio. Abra Ouvir o site e ative a leitura.',
      reading:'Lendo o conteúdo desta página.', done:'Leitura concluída.', empty:'Não há texto disponível para leitura.',
      configure:'Configurar leitura em voz alta', inline:'Ouça os trechos ao passar o mouse ou navegar com o teclado. Escolha a voz e a velocidade.',
    },
    en: {
      title:'Read aloud', open:'Listen to the site', close:'Close', intro:'Listen in the language selected on the site. Turn reading on, then point to text or navigate with Tab.',
      enable:'Enable reading on hover', disable:'Disable reading on hover', gender:'Voice preference', auto:'Automatic', female:'Female', male:'Male', voice:'Available voice', speed:'Speed', preview:'Preview voice', page:'Read this page', stop:'Stop reading',
      hint:'Voices depend on your browser and device. Some need internet access. Press Esc to stop.', ready:'Choose a voice and listen to a sample.', active:'Reading enabled. Point to text or navigate with Tab.', stopped:'Reading stopped.', sample:'Hello! This voice will accompany your reading at Instituto Esperança.',
      unavailable:'No voice is available in this language. Install a voice in your device speech settings or try another browser.', genderMissing:'This preference could not be identified among voices in this language. Select a voice and listen to a sample.', unsupported:'This browser does not support reading aloud. Try another browser or your device screen reader.', error:'The voice could not start. Try a sample or select another voice.', blocked:'Your browser needs a click to allow audio. Open Listen to the site and enable reading.', reading:'Reading this page’s content.', done:'Reading complete.', empty:'No text is available to read.', configure:'Configure reading aloud', inline:'Listen to text by pointing to it or using the keyboard. Choose the voice and speed.',
    },
    'es-419': {
      title:'Lectura en voz alta', open:'Escuchar el sitio', close:'Cerrar', intro:'Escucha en el idioma elegido en el sitio. Activa la lectura y apunta al texto o navega con Tab.', enable:'Activar lectura al apuntar', disable:'Desactivar lectura al apuntar', gender:'Preferencia de voz', auto:'Automática', female:'Femenina', male:'Masculina', voice:'Voz disponible', speed:'Velocidad', preview:'Escuchar muestra', page:'Leer esta página', stop:'Detener lectura', hint:'Las voces dependen del navegador y del dispositivo. Algunas necesitan internet. Pulsa Esc para detener.', ready:'Elige una voz y escucha una muestra.', active:'Lectura activada. Apunta al texto o navega con Tab.', stopped:'Lectura detenida.', sample:'¡Hola! Esta voz te acompañará en tu lectura en el Instituto Esperança.', unavailable:'No hay voces en este idioma. Instala una en los ajustes de voz del dispositivo o prueba otro navegador.', genderMissing:'No se identificó esta preferencia entre las voces de este idioma. Elige una voz y escucha una muestra.', unsupported:'Este navegador no admite lectura en voz alta. Prueba otro navegador o el lector de pantalla del dispositivo.', error:'No se pudo iniciar la voz. Prueba una muestra o elige otra voz.', blocked:'El navegador necesita un clic para permitir audio. Abre Escuchar el sitio y activa la lectura.', reading:'Leyendo el contenido de esta página.', done:'Lectura terminada.', empty:'No hay texto para leer.', configure:'Configurar lectura en voz alta', inline:'Escucha los textos al apuntar con el mouse o navegar con el teclado. Elige la voz y la velocidad.',
    },
    fr: {
      title:'Lecture à voix haute', open:'Écouter le site', close:'Fermer', intro:'Écoutez dans la langue choisie sur le site. Activez la lecture, puis survolez un texte ou naviguez avec Tab.', enable:'Activer la lecture au survol', disable:'Désactiver la lecture au survol', gender:'Préférence de voix', auto:'Automatique', female:'Féminine', male:'Masculine', voice:'Voix disponible', speed:'Vitesse', preview:'Écouter un extrait', page:'Lire cette page', stop:'Arrêter la lecture', hint:'Les voix dépendent du navigateur et de l’appareil. Certaines nécessitent internet. Appuyez sur Échap pour arrêter.', ready:'Choisissez une voix et écoutez un extrait.', active:'Lecture activée. Survolez un texte ou naviguez avec Tab.', stopped:'Lecture arrêtée.', sample:'Bonjour ! Cette voix accompagnera votre lecture à l’Institut Esperança.', unavailable:'Aucune voix dans cette langue. Installez une voix dans les réglages de votre appareil ou essayez un autre navigateur.', genderMissing:'Cette préférence n’a pas été identifiée parmi les voix de cette langue. Choisissez une voix et écoutez un extrait.', unsupported:'Ce navigateur ne prend pas en charge la lecture à voix haute. Essayez un autre navigateur ou le lecteur d’écran de votre appareil.', error:'La voix n’a pas pu démarrer. Écoutez un extrait ou choisissez une autre voix.', blocked:'Le navigateur demande un clic pour autoriser l’audio. Ouvrez Écouter le site et activez la lecture.', reading:'Lecture du contenu de cette page.', done:'Lecture terminée.', empty:'Aucun texte à lire.', configure:'Configurer la lecture à voix haute', inline:'Écoutez les textes au survol ou avec le clavier. Choisissez la voix et la vitesse.',
    },
    de: {
      title:'Vorlesen', open:'Website anhören', close:'Schließen', intro:'Hören Sie Texte in der gewählten Website-Sprache. Aktivieren Sie das Vorlesen und zeigen Sie auf Text oder navigieren Sie mit Tab.', enable:'Vorlesen beim Zeigen aktivieren', disable:'Vorlesen beim Zeigen deaktivieren', gender:'Bevorzugte Stimme', auto:'Automatisch', female:'Weiblich', male:'Männlich', voice:'Verfügbare Stimme', speed:'Geschwindigkeit', preview:'Stimmprobe anhören', page:'Diese Seite vorlesen', stop:'Vorlesen stoppen', hint:'Stimmen hängen von Browser und Gerät ab. Manche benötigen Internet. Mit Esc stoppen.', ready:'Wählen Sie eine Stimme und hören Sie eine Probe.', active:'Vorlesen aktiviert. Zeigen Sie auf Text oder navigieren Sie mit Tab.', stopped:'Vorlesen gestoppt.', sample:'Hallo! Diese Stimme begleitet Sie beim Lesen auf der Website des Instituto Esperança.', unavailable:'Keine Stimme für diese Sprache verfügbar. Installieren Sie eine in den Spracheinstellungen des Geräts oder verwenden Sie einen anderen Browser.', genderMissing:'Diese Präferenz wurde bei den Stimmen dieser Sprache nicht erkannt. Wählen Sie eine Stimme und hören Sie eine Probe.', unsupported:'Dieser Browser unterstützt kein Vorlesen. Nutzen Sie einen anderen Browser oder den Screenreader Ihres Geräts.', error:'Die Stimme konnte nicht gestartet werden. Hören Sie eine Probe oder wählen Sie eine andere Stimme.', blocked:'Der Browser benötigt einen Klick zur Audiofreigabe. Öffnen Sie Website anhören und aktivieren Sie das Vorlesen.', reading:'Seiteninhalt wird vorgelesen.', done:'Vorlesen abgeschlossen.', empty:'Kein Text zum Vorlesen verfügbar.', configure:'Vorlesen einrichten', inline:'Hören Sie Texte beim Zeigen oder bei der Tastaturnavigation. Wählen Sie Stimme und Geschwindigkeit.',
    },
    'zh-CN': {
      title:'语音朗读', open:'收听网站', close:'关闭', intro:'使用网站所选语言朗读。开启后，将鼠标移到文字上或使用 Tab 键导航。', enable:'开启指向朗读', disable:'关闭指向朗读', gender:'声音偏好', auto:'自动', female:'女声', male:'男声', voice:'可用声音', speed:'语速', preview:'试听', page:'朗读本页', stop:'停止朗读', hint:'可用声音取决于浏览器和设备。部分声音需要联网。按 Esc 停止。', ready:'选择声音并试听。', active:'朗读已开启。请指向文字或使用 Tab 键导航。', stopped:'朗读已停止。', sample:'您好！这个声音将陪伴您阅读希望研究所的网站。', unavailable:'没有此语言的可用声音。请在设备的语音设置中安装声音，或尝试其他浏览器。', genderMissing:'未能在此语言的声音中识别该偏好。请选择声音并试听。', unsupported:'此浏览器不支持语音朗读。请使用其他浏览器或设备的屏幕阅读器。', error:'无法启动声音。请试听或选择其他声音。', blocked:'浏览器需要点击才能播放声音。请打开“收听网站”并开启朗读。', reading:'正在朗读本页内容。', done:'朗读完成。', empty:'没有可朗读的文字。', configure:'设置语音朗读', inline:'将鼠标移到文字上或使用键盘导航即可收听。可以选择声音和语速。',
    },
    ru: {
      title:'Чтение вслух', open:'Слушать сайт', close:'Закрыть', intro:'Слушайте на выбранном языке сайта. Включите чтение и наведите указатель на текст или используйте Tab.', enable:'Включить чтение при наведении', disable:'Выключить чтение при наведении', gender:'Предпочтение голоса', auto:'Автоматически', female:'Женский', male:'Мужской', voice:'Доступный голос', speed:'Скорость', preview:'Прослушать образец', page:'Прочитать страницу', stop:'Остановить чтение', hint:'Голоса зависят от браузера и устройства. Некоторым нужен интернет. Нажмите Esc для остановки.', ready:'Выберите голос и прослушайте образец.', active:'Чтение включено. Наведите указатель на текст или используйте Tab.', stopped:'Чтение остановлено.', sample:'Здравствуйте! Этот голос будет сопровождать чтение на сайте Института Эсперанса.', unavailable:'Нет голоса для этого языка. Установите голос в настройках речи устройства или попробуйте другой браузер.', genderMissing:'Это предпочтение не распознано среди голосов этого языка. Выберите голос и прослушайте образец.', unsupported:'Этот браузер не поддерживает чтение вслух. Используйте другой браузер или экранный диктор устройства.', error:'Не удалось запустить голос. Прослушайте образец или выберите другой голос.', blocked:'Для звука браузеру нужен щелчок. Откройте «Слушать сайт» и включите чтение.', reading:'Чтение содержимого страницы.', done:'Чтение завершено.', empty:'Нет текста для чтения.', configure:'Настроить чтение вслух', inline:'Слушайте текст при наведении или навигации с клавиатуры. Выберите голос и скорость.',
    },
    ja: {
      title:'音声読み上げ', open:'サイトを聴く', close:'閉じる', intro:'サイトで選択した言語で読み上げます。有効にして文字にマウスを合わせるか、Tab キーで移動してください。', enable:'マウス位置の読み上げを有効にする', disable:'マウス位置の読み上げを無効にする', gender:'声の設定', auto:'自動', female:'女性', male:'男性', voice:'利用できる音声', speed:'速度', preview:'試聴する', page:'このページを読む', stop:'読み上げを停止', hint:'音声はブラウザーと端末によって異なります。一部はインターネット接続が必要です。Esc キーで停止できます。', ready:'音声を選択して試聴してください。', active:'読み上げを有効にしました。文字にマウスを合わせるか、Tab キーで移動してください。', stopped:'読み上げを停止しました。', sample:'こんにちは。この音声がエスペランサ研究所のサイトを読み上げます。', unavailable:'この言語の音声はありません。端末の音声設定で追加するか、別のブラウザーをお試しください。', genderMissing:'この言語の音声では指定された声の種類を確認できませんでした。一覧から選んで試聴してください。', unsupported:'このブラウザーは読み上げに対応していません。別のブラウザーか端末のスクリーンリーダーをご利用ください。', error:'音声を開始できませんでした。試聴するか、別の音声を選んでください。', blocked:'音声を許可するにはクリックが必要です。「サイトを聴く」を開き、読み上げを有効にしてください。', reading:'ページの内容を読み上げています。', done:'読み上げが完了しました。', empty:'読み上げる文字がありません。', configure:'読み上げを設定する', inline:'文字にマウスを合わせるか、キーボードで移動して聴けます。音声と速度を選べます。',
    },
    hi: {
      title:'सुनकर पढ़ें', open:'साइट सुनें', close:'बंद करें', intro:'साइट पर चुनी गई भाषा में सुनें। पढ़ना चालू करें और टेक्स्ट पर माउस रखें या Tab से आगे बढ़ें।', enable:'माउस रखने पर पढ़ना चालू करें', disable:'माउस रखने पर पढ़ना बंद करें', gender:'पसंदीदा आवाज़', auto:'अपने आप', female:'महिला', male:'पुरुष', voice:'उपलब्ध आवाज़', speed:'गति', preview:'नमूना सुनें', page:'यह पेज पढ़ें', stop:'पढ़ना रोकें', hint:'आवाज़ें ब्राउज़र और डिवाइस पर निर्भर करती हैं। कुछ को इंटरनेट चाहिए। रोकने के लिए Esc दबाएँ।', ready:'आवाज़ चुनें और नमूना सुनें।', active:'पढ़ना चालू है। टेक्स्ट पर माउस रखें या Tab से आगे बढ़ें।', stopped:'पढ़ना रोक दिया गया।', sample:'नमस्ते! इंस्टीट्यूटो एस्पेरांसा की साइट पढ़ने में यह आवाज़ आपका साथ देगी।', unavailable:'इस भाषा में कोई आवाज़ उपलब्ध नहीं है। डिवाइस की वाणी सेटिंग में आवाज़ जोड़ें या दूसरा ब्राउज़र आज़माएँ।', genderMissing:'इस भाषा की आवाज़ों में इस पसंद की पहचान नहीं हुई। सूची से आवाज़ चुनें और नमूना सुनें।', unsupported:'यह ब्राउज़र आवाज़ में पढ़ने की सुविधा नहीं देता। दूसरा ब्राउज़र या डिवाइस का स्क्रीन रीडर इस्तेमाल करें।', error:'आवाज़ शुरू नहीं हो सकी। नमूना सुनें या दूसरी आवाज़ चुनें।', blocked:'आवाज़ चलाने के लिए ब्राउज़र को एक क्लिक चाहिए। साइट सुनें खोलें और पढ़ना चालू करें।', reading:'इस पेज का टेक्स्ट पढ़ा जा रहा है।', done:'पढ़ना पूरा हुआ।', empty:'पढ़ने के लिए कोई टेक्स्ट नहीं है।', configure:'आवाज़ में पढ़ने की सेटिंग', inline:'माउस रखने या कीबोर्ड से आगे बढ़ने पर टेक्स्ट सुनें। आवाज़ और गति चुनें।',
    },
  };
  const voiceCopy = {
    'pt-BR': {system:'Automática do dispositivo', refresh:'Atualizar vozes', loading:'Carregando vozes. Você já pode tentar a voz automática.', unavailable:'O navegador não listou vozes neste idioma. Tente a voz automática, atualize a lista ou instale uma voz nas configurações de fala do dispositivo.', activate:'Liberar áudio', blocked:'Selecione Liberar áudio para permitir a leitura nesta página.', fallback:'A voz escolhida falhou. Tentando outra voz do dispositivo.'},
    en: {system:'Device automatic voice', refresh:'Refresh voices', loading:'Loading voices. You can already try the automatic voice.', unavailable:'The browser did not list voices in this language. Try the automatic voice, refresh the list or install a voice in your device speech settings.', activate:'Enable audio', blocked:'Select Enable audio to allow reading on this page.', fallback:'The selected voice failed. Trying another device voice.'},
    'es-419': {system:'Voz automática del dispositivo', refresh:'Actualizar voces', loading:'Cargando voces. Ya puedes probar la voz automática.', unavailable:'El navegador no enumeró voces en este idioma. Prueba la voz automática, actualiza la lista o instala una voz en los ajustes del dispositivo.', activate:'Habilitar audio', blocked:'Selecciona Habilitar audio para permitir la lectura en esta página.', fallback:'La voz elegida falló. Probando otra voz del dispositivo.'},
    fr: {system:'Voix automatique de l’appareil', refresh:'Actualiser les voix', loading:'Chargement des voix. Vous pouvez déjà essayer la voix automatique.', unavailable:'Le navigateur ne répertorie aucune voix dans cette langue. Essayez la voix automatique, actualisez la liste ou installez une voix dans les réglages de l’appareil.', activate:'Autoriser l’audio', blocked:'Sélectionnez Autoriser l’audio pour permettre la lecture sur cette page.', fallback:'La voix choisie a échoué. Essai d’une autre voix de l’appareil.'},
    de: {system:'Automatische Gerätestimme', refresh:'Stimmen aktualisieren', loading:'Stimmen werden geladen. Sie können die automatische Stimme bereits ausprobieren.', unavailable:'Der Browser hat keine Stimmen für diese Sprache aufgelistet. Versuchen Sie die automatische Stimme, aktualisieren Sie die Liste oder installieren Sie eine Stimme auf Ihrem Gerät.', activate:'Audio aktivieren', blocked:'Wählen Sie Audio aktivieren, um das Vorlesen auf dieser Seite zu erlauben.', fallback:'Die gewählte Stimme ist fehlgeschlagen. Eine andere Gerätestimme wird versucht.'},
    'zh-CN': {system:'设备自动语音', refresh:'刷新语音', loading:'正在加载语音。您现在就可以尝试自动语音。', unavailable:'浏览器未列出此语言的语音。请尝试自动语音、刷新列表或在设备设置中安装语音。', activate:'允许音频', blocked:'请选择“允许音频”以在此页面启用朗读。', fallback:'所选语音播放失败。正在尝试设备上的其他语音。'},
    ru: {system:'Автоматический голос устройства', refresh:'Обновить голоса', loading:'Загрузка голосов. Уже можно попробовать автоматический голос.', unavailable:'Браузер не перечислил голоса для этого языка. Попробуйте автоматический голос, обновите список или установите голос в настройках устройства.', activate:'Разрешить звук', blocked:'Выберите «Разрешить звук», чтобы включить чтение на этой странице.', fallback:'Выбранный голос не работает. Пробуем другой голос устройства.'},
    ja: {system:'端末の自動音声', refresh:'音声を更新', loading:'音声を読み込み中です。自動音声は今すぐ試せます。', unavailable:'この言語の音声が一覧にありません。自動音声を試すか、一覧を更新するか、端末に音声を追加してください。', activate:'音声を許可', blocked:'このページで読み上げるには「音声を許可」を選んでください。', fallback:'選択した音声を再生できません。端末の別の音声を試しています。'},
    hi: {system:'डिवाइस की स्वचालित आवाज़', refresh:'आवाज़ें अपडेट करें', loading:'आवाज़ें लोड हो रही हैं। आप अभी स्वचालित आवाज़ आज़मा सकते हैं।', unavailable:'ब्राउज़र ने इस भाषा की आवाज़ें नहीं दिखाईं। स्वचालित आवाज़ आज़माएँ, सूची अपडेट करें या डिवाइस में आवाज़ जोड़ें।', activate:'ऑडियो चालू करें', blocked:'इस पेज पर पढ़ने के लिए ऑडियो चालू करें चुनें।', fallback:'चुनी गई आवाज़ नहीं चली। डिवाइस की दूसरी आवाज़ आज़मा रहे हैं।'},
  };
  for (const language of Object.keys(copy)) Object.assign(copy[language], voiceCopy[language]);
  const root = document.documentElement;
  const synth = window.speechSynthesis;
  const supported = Boolean(synth && window.SpeechSynthesisUtterance);
  const storageKey = 'esperanca-speech-preferences';
  const settings = { enabled:false, gender:'auto', rate:1, voices:{} };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && typeof saved === 'object') {
      settings.enabled = saved.enabled === true && supported;
      settings.gender = ['auto','female','male'].includes(saved.gender) ? saved.gender : 'auto';
      settings.rate = [.75,1,1.25,1.5].includes(saved.rate) ? saved.rate : 1;
      if (saved.voices && typeof saved.voices === 'object' && !Array.isArray(saved.voices)) settings.voices = saved.voices;
    }
  } catch { /* Speech still works when storage is unavailable. */ }
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(settings)); } catch {} };
  const locale = () => root.lang || 'pt-BR';
  const t = key => (copy[locale()] || copy['pt-BR'])[key];
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4V5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>';
  const launcher = document.createElement('button');
  launcher.type = 'button';
  launcher.className = 'reader-launcher';
  launcher.setAttribute('data-reader-ui', '');
  launcher.setAttribute('data-no-translate', '');
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-controls', 'speech-reader-panel');
  launcher.innerHTML = icon + '<span data-reader-key="open"></span>';
  (document.querySelector('.topbar .container') || document.body).append(launcher);
  const panel = document.createElement('dialog');
  panel.id = 'speech-reader-panel';
  panel.className = 'reader-panel';
  panel.setAttribute('data-reader-ui', '');
  panel.setAttribute('data-no-translate', '');
  panel.setAttribute('aria-labelledby', 'reader-title');
  panel.setAttribute('aria-describedby', 'reader-intro');
  panel.innerHTML = `
    <div class="reader-heading"><span class="reader-icon">${icon}</span><h2 id="reader-title" data-reader-key="title"></h2><button type="button" class="reader-close" data-reader-close>×</button></div>
    <p id="reader-intro" data-reader-key="intro"></p>
    <button type="button" class="button button-primary reader-enable" aria-pressed="false" data-reader-enable></button>
    <div class="reader-fields">
      <div class="field"><label for="reader-gender" data-reader-key="gender"></label><select id="reader-gender"><option value="auto" data-reader-key="auto"></option><option value="female" data-reader-key="female"></option><option value="male" data-reader-key="male"></option></select></div>
      <div class="field"><label for="reader-rate" data-reader-key="speed"></label><select id="reader-rate"><option value="0.75">0.75×</option><option value="1">1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select></div>
      <div class="field reader-voices"><label for="reader-voice" data-reader-key="voice"></label><select id="reader-voice" aria-describedby="reader-voice-note"></select><span id="reader-voice-note" class="field-hint" role="status"></span><button type="button" class="button button-outline reader-refresh" data-reader-refresh data-reader-key="refresh"></button></div>
    </div>
    <div class="reader-actions"><button type="button" class="button button-primary" data-reader-activate data-reader-key="activate" hidden></button><button type="button" class="button button-outline" data-reader-preview data-reader-key="preview"></button><button type="button" class="button button-outline" data-reader-page data-reader-key="page"></button><button type="button" class="button button-outline" data-reader-stop data-reader-key="stop"></button></div>
    <p class="reader-status" role="status" aria-live="polite" data-reader-status></p>
    <p class="reader-hint" data-reader-key="hint"></p>`;
  document.body.append(panel);
  const dock = document.createElement('div');
  dock.className = 'reader-dock';
  dock.setAttribute('data-reader-ui', '');
  dock.setAttribute('data-no-translate', '');
  // A non-modal top-layer control stays in the viewport even when a visual
  // accessibility filter on body changes the containing block of fixed elements.
  const dockPopover = typeof dock.showPopover === 'function';
  if (dockPopover) dock.setAttribute('popover', 'manual');
  dock.hidden = true;
  dock.innerHTML = '<p class="reader-dock-status" role="status" aria-live="polite" data-reader-status></p><div class="reader-dock-actions"><button type="button" data-reader-activate data-reader-key="activate" hidden></button><button type="button" data-reader-stop><span aria-hidden="true">■</span> <span data-reader-key="stop"></span></button><button type="button" data-reader-open>' + icon + '</button></div>';
  document.body.append(dock);
  const $ = selector => panel.querySelector(selector);
  const voiceSelect = $('#reader-voice');
  let voices = [];
  let statusKey = 'ready';
  let generation = 0;
  let timer = null;
  let target = null;
  let targetOrigin = null;
  let highlighted = null;
  let currentUtterance = null;
  let playbackTimer = null;
  let voiceTimer = null;
  let voicesLoading = false;
  let voiceSignature = '';
  let audioUnlocked = false;
  let activationDenied = false;
  let pendingSpeech = null;
  let pageMode = false;
  let suppressFocus = false;
  const status = key => {
    statusKey = key;
    for (const element of [panel, dock]) element.querySelector('[data-reader-status]').textContent = t(key);
  };
  const normalize = value => String(value || '').toLowerCase().replaceAll('_', '-');
  const languageVoices = () => voices.filter(voice => normalize(voice.lang).split('-')[0] === normalize(locale()).split('-')[0]);
  const voiceId = voice => `${voice.voiceURI}|${voice.lang}|${voice.name}`;
  // The Web Speech API has no gender field. Classify explicit voice labels and
  // known catalog names only. Never fake gender by changing pitch.
  // Catalog: support.microsoft.com/en-us/accessibility/windows/narrator/appendix-a-supported-languages-and-voices
  const knownVoices = {
    female: /\b(maria|francisca|thalita|brenda|zira|hazel|susan|jenny|aria|hedda|katja|hortense|julie|denise|helena|laura|sabina|dalia|elvira|irina|svetlana|ayumi|haruka|nanami|huihui|yaoyao|xiaoxiao|xiaoyi|kalpana|swara)(?:neural|multilingual)?\b/i,
    male: /\b(daniel|antonio|david|mark|george|guy|ryan|stefan|conrad|paul|henri|pablo|raul|alvaro|jorge|pavel|dmitry|ichiro|keita|kangkang|yunxi|yunjian|hemant|madhur)(?:neural|multilingual)?\b/i,
  };
  const genderOf = voice => {
    const name = voice.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (/\b(female|feminina|feminine)\b/i.test(name)) return 'female';
    if (/\b(male|masculina|masculine)\b/i.test(name)) return 'male';
    if (/microsoft/i.test(name)) return Object.keys(knownVoices).find(gender => knownVoices[gender].test(name)) || null;
    if (normalize(voice.lang).split('-')[0] === 'pt') {
      if (/\b(luciana|joana)\b/i.test(name)) return 'female';
      if (/\b(felipe|joaquim)\b/i.test(name)) return 'male';
    }
    return null;
  };
  const selectedVoice = () => languageVoices().find(voice => voiceId(voice) === voiceSelect.value);
  const needsActivation = () => !audioUnlocked && (activationDenied || navigator.userActivation?.hasBeenActive !== true);
  const sync = () => {
    $('[data-reader-enable]').textContent = t(settings.enabled ? 'disable' : 'enable');
    $('[data-reader-enable]').setAttribute('aria-pressed', String(settings.enabled));
    for (const selector of ['[data-reader-enable]', '[data-reader-preview]', '[data-reader-page]', '[data-reader-refresh]', '#reader-voice', '#reader-gender', '#reader-rate']) $(selector).disabled = !supported;
    $('[data-reader-stop]').disabled = !settings.enabled && !currentUtterance;
    for (const element of [panel, dock]) {
      const button = element.querySelector('[data-reader-activate]');
      button.hidden = !supported || (statusKey !== 'blocked' && (!settings.enabled || !needsActivation()));
      if (button.hidden && document.activeElement === button) element.querySelector('[data-reader-stop]').focus({preventScroll:true});
    }
    const dockHadFocus = dock.contains(document.activeElement);
    dock.hidden = panel.open || (!settings.enabled && !currentUtterance && !['blocked','error'].includes(statusKey));
    if (dockPopover) {
      if (dock.hidden && dock.matches(':popover-open')) dock.hidePopover();
      else if (!dock.hidden && !dock.matches(':popover-open')) dock.showPopover();
    }
    if (dock.hidden && dockHadFocus && !panel.open) launcher.focus({preventScroll:true});
  };
  const populateVoices = (resetSelection = false) => {
    try { voices = supported ? Array.from(synth.getVoices()).filter(voice => voice && typeof voice.lang === 'string' && typeof voice.name === 'string') : []; }
    catch { voices = []; }
    const available = languageVoices().sort((a,b) => Number(normalize(b.lang) === normalize(locale())) - Number(normalize(a.lang) === normalize(locale())) || Number(Boolean(b.default)) - Number(Boolean(a.default)) || a.name.localeCompare(b.name));
    const preferred = available.filter(voice => genderOf(voice) === settings.gender);
    const saved = available.find(voice => voiceId(voice) === settings.voices[locale()]);
    const selected = saved || (settings.gender === 'auto' ? available[0] : preferred[0] || available[0]);
    const signature = JSON.stringify([locale(), available.map(voice => [voiceId(voice), genderOf(voice)])]);
    // Identical voiceschanged events must not close a desktop select's popup.
    if (signature !== voiceSignature || resetSelection === true) {
      const changed = signature !== voiceSignature;
      voiceSignature = signature;
      if (changed) {
        voiceSelect.replaceChildren(new Option(t('system'), 'auto'));
        for (const voice of available) {
          const gender = genderOf(voice);
          voiceSelect.append(new Option(`${voice.name} · ${voice.lang}${gender ? ` · ${t(gender)}` : ''}`, voiceId(voice)));
        }
      }
      voiceSelect.value = settings.voices[locale()] === 'auto' ? 'auto' : selected ? voiceId(selected) : 'auto';
    }
    $('#reader-voice-note').textContent = !supported ? t('unsupported') : !available.length ? t(voicesLoading ? 'loading' : 'unavailable') : settings.gender !== 'auto' && !preferred.length ? t('genderMissing') : '';
    sync();
  };
  const refreshVoices = () => {
    clearTimeout(voiceTimer);
    let attempt = 0;
    const poll = () => {
      voicesLoading = supported && attempt < 6;
      populateVoices();
      if (supported && !languageVoices().length && attempt < 6) {
        voiceTimer = setTimeout(poll, [250,500,1000,2000,4000,4000][attempt++]);
      } else { voicesLoading = false; populateVoices(); }
    };
    poll();
  };
  const clearHighlight = () => { highlighted?.classList.remove('reader-highlight'); highlighted = null; };
  const cancel = () => {
    generation++;
    clearTimeout(timer);
    clearTimeout(playbackTimer);
    timer = null;
    playbackTimer = null;
    target = null;
    targetOrigin = null;
    currentUtterance = null;
    pageMode = false;
    clearHighlight();
    if (supported) { try { synth.cancel(); } catch { /* Keep controls usable if the speech service fails. */ } }
    sync();
  };
  const stop = () => {
    const restoreFocus = dock.contains(document.activeElement);
    settings.enabled = false;
    pendingSpeech = null;
    save();
    cancel();
    status('stopped');
    sync();
    if (restoreFocus) launcher.focus({preventScroll:true});
  };
  const chunks = text => {
    const parts = [];
    let rest = text.replace(/\s+/g, ' ').trim();
    while (rest.length > 220) {
      const prefix = rest.slice(0, 220);
      const sentence = [...prefix.matchAll(/[.!?。！？](?:\s|$)/g)].pop();
      const boundary = sentence && sentence.index > 60 ? sentence.index + 1 : prefix.lastIndexOf(' ');
      const end = boundary > 0 ? boundary : 220;
      parts.push(rest.slice(0, end));
      rest = rest.slice(end).trimStart();
    }
    if (rest) parts.push(rest);
    return parts;
  };
  const speak = (items, fullPage = false) => {
    cancel();
    if (!supported) { status('unsupported'); return; }
    activationDenied = false;
    pendingSpeech = {items, fullPage};
    const queue = items.flatMap(item => chunks(item.text).map(text => ({ text, element:item.element })));
    if (!queue.length) { pendingSpeech = null; status('empty'); sync(); return; }
    const selected = selectedVoice();
    const alternatives = languageVoices().filter(voice => voice !== selected).sort((a,b) => Number(genderOf(b) === settings.gender) - Number(genderOf(a) === settings.gender) || Number(Boolean(b.localService)) - Number(Boolean(a.localService)));
    const candidates = selected ? [selected, ...alternatives.slice(0, 1), null] : [null, ...alternatives.slice(0, 2)];
    let voiceIndex = 0;
    const token = generation;
    pageMode = fullPage;
    status(fullPage ? 'reading' : settings.enabled ? 'active' : 'ready');
    let index = 0;
    const next = () => {
      if (token !== generation) return;
      clearHighlight();
      if (index === queue.length) {
        currentUtterance = null;
        pendingSpeech = null;
        pageMode = false;
        if (fullPage) status('done');
        sync();
        return;
      }
      const item = queue[index];
      const voice = candidates[voiceIndex];
      const utterance = new SpeechSynthesisUtterance(item.text);
      currentUtterance = utterance;
      utterance.lang = voice?.lang || locale();
      if (voice) utterance.voice = voice;
      utterance.rate = settings.rate;
      utterance.onstart = () => {
        if (token !== generation || currentUtterance !== utterance) return;
        audioUnlocked = true;
        if (statusKey === 'blocked') status(fullPage ? 'reading' : settings.enabled ? 'active' : 'ready');
        clearTimeout(playbackTimer);
        playbackTimer = setTimeout(() => utterance.onerror({error:'timeout'}), Math.max(30000, item.text.length * 180 / settings.rate + 15000));
        highlighted = item.element;
        highlighted?.classList.add('reader-highlight');
        sync();
      };
      utterance.onend = () => {
        if (token !== generation || currentUtterance !== utterance) return;
        clearTimeout(playbackTimer);
        currentUtterance = null;
        index++;
        next();
      };
      utterance.onerror = event => {
        if (token !== generation || currentUtterance !== utterance) return;
        clearTimeout(playbackTimer);
        currentUtterance = null;
        if (['voice-unavailable','language-unavailable','network','synthesis-failed','synthesis-unavailable','audio-busy','timeout'].includes(event.error) && voiceIndex + 1 < candidates.length) {
          voiceIndex++;
          try { synth.cancel(); } catch {}
          status('fallback');
          next();
          return;
        }
        cancel();
        if (event.error === 'not-allowed') { audioUnlocked = false; activationDenied = true; }
        else { settings.enabled = false; pendingSpeech = null; }
        save();
        status(event.error === 'not-allowed' ? 'blocked' : 'error');
        sync();
      };
      sync();
      playbackTimer = setTimeout(() => utterance.onerror({error:'timeout'}), 10000);
      try {
        if (synth.paused) synth.resume();
        synth.speak(utterance);
      } catch { utterance.onerror({error:'synthesis-failed'}); }
    };
    next();
  };
  const ignored = 'script,style,noscript,svg,[hidden],[inert],[aria-hidden="true"],[data-reader-ui],dialog:not([open]),[contenteditable]:not([contenteditable="false"])';
  const visible = element => element && !element.closest(ignored) && element.getClientRects().length > 0 && getComputedStyle(element).visibility === 'visible';
  const labelText = element => {
    const labelled = element.getAttribute('aria-labelledby');
    if (labelled) return labelled.split(/\s+/).map(id => document.getElementById(id)?.textContent || '').join(' ');
    return element.getAttribute('aria-label') || [...(element.labels || [])].map(label => label.innerText).join(' ');
  };
  const plainText = element => {
    if (!visible(element)) return '';
    if (element.matches('input,textarea')) return labelText(element); // Never speak typed private data.
    if (element.matches('select')) return `${labelText(element)}. ${element.selectedOptions[0]?.textContent || ''}`;
    if (element.matches('img')) return element.alt;
    const label = labelText(element);
    if (label) return label;
    const words = [];
    const visit = node => {
      if (node.nodeType === Node.TEXT_NODE) { words.push(node.nodeValue); return; }
      if (!(node instanceof Element) || !visible(node) || node.matches('input,textarea,select')) return;
      if (node.matches('img')) { if (node.alt) words.push(node.alt); return; }
      if (node.matches('br')) { words.push(' '); return; }
      for (const child of node.childNodes) visit(child);
    };
    visit(element);
    return words.join(' ').replace(/\s+/g, ' ').trim();
  };
  const interactive = 'a,button,summary,label,input,select,textarea,[role="button"]';
  const blocks = 'h1,h2,h3,h4,h5,h6,p,li,dt,dd,th,td,figcaption,caption,blockquote,img,.field-hint';
  const readableTarget = element => {
    if (!(element instanceof Element) || !visible(element)) return null;
    const candidate = element.closest(interactive) || element.closest(blocks);
    return candidate && visible(candidate) ? candidate : null;
  };
  const schedule = (element, origin) => {
    if (!settings.enabled || pageMode || panel.open || !element || element === target) return;
    if (needsActivation()) { status('blocked'); sync(); return; }
    const text = plainText(element);
    if (!text.trim()) return;
    cancel();
    target = element;
    targetOrigin = origin;
    timer = setTimeout(() => {
      if (!settings.enabled || !visible(element)) return;
      speak([{text, element}]);
      target = element;
      targetOrigin = origin;
    }, 350);
  };
  const readPage = () => {
    const items = [];
    const visit = element => {
      if (!visible(element)) return;
      if (element.matches(`${blocks},${interactive}`)) {
        const text = plainText(element);
        if (text.trim()) items.push({text, element});
      } else for (const child of element.children) visit(child);
    };
    const main = document.querySelector('main');
    if (main) visit(main);
    speak(items, true);
  };
  const closePanel = () => {
    suppressFocus = true;
    panel.close();
    sync();
    queueMicrotask(() => { suppressFocus = false; });
  };
  const openPanel = () => { cancel(); pendingSpeech = null; refreshVoices(); if (!panel.open) panel.showModal(); sync(); };
  launcher.addEventListener('click', openPanel);
  document.querySelectorAll('[data-reader-open]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', openPanel);
  });
  $('[data-reader-close]').addEventListener('click', () => { cancel(); closePanel(); });
  panel.addEventListener('click', event => {
    if (event.target !== panel) return;
    const rect = panel.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) { cancel(); closePanel(); }
  });
  panel.addEventListener('cancel', () => stop());
  panel.addEventListener('close', sync);
  document.querySelectorAll('[data-reader-stop]').forEach(button => button.addEventListener('click', stop));
  $('[data-reader-enable]').addEventListener('click', () => {
    if (settings.enabled) { stop(); return; }
    settings.enabled = true;
    save();
    closePanel();
    status('active');
    speak([{text:t('active')}]);
  });
  $('[data-reader-preview]').addEventListener('click', () => speak([{text:t('sample')}]));
  $('[data-reader-page]').addEventListener('click', () => { closePanel(); readPage(); });
  $('[data-reader-refresh]').addEventListener('click', refreshVoices);
  document.querySelectorAll('[data-reader-activate]').forEach(button => button.addEventListener('click', () => {
    const pending = pendingSpeech;
    status(settings.enabled ? 'active' : 'ready');
    speak(pending?.items || [{text:t('active')}], pending?.fullPage || false);
  }));
  $('#reader-gender').addEventListener('change', event => {
    cancel();
    settings.gender = event.target.value;
    delete settings.voices[locale()];
    save();
    populateVoices(true);
  });
  voiceSelect.addEventListener('change', () => { cancel(); settings.voices[locale()] = voiceSelect.value; save(); });
  $('#reader-rate').addEventListener('change', event => { cancel(); settings.rate = Number(event.target.value); save(); });
  document.addEventListener('pointerover', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') schedule(readableTarget(event.target), 'pointer');
  });
  document.addEventListener('pointerout', event => {
    if (targetOrigin === 'pointer' && target && !target.contains(event.relatedTarget) && readableTarget(event.relatedTarget) !== target) cancel();
  });
  document.addEventListener('focusin', event => { if (!suppressFocus) schedule(readableTarget(event.target), 'focus'); });
  document.addEventListener('focusout', event => { if (targetOrigin === 'focus' && target?.contains(event.target)) cancel(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancel(); pendingSpeech = null; status(settings.enabled ? 'active' : 'stopped'); sync(); }
  });
  window.addEventListener('pagehide', () => { clearTimeout(voiceTimer); cancel(); });
  window.addEventListener('focus', refreshVoices);
  const translate = () => {
    for (const element of document.querySelectorAll('[data-reader-key]')) element.textContent = t(element.dataset.readerKey);
    for (const element of [launcher, panel, dock]) element.lang = locale();
    $('[data-reader-close]').setAttribute('aria-label', t('close'));
    dock.querySelector('[data-reader-open]').setAttribute('aria-label', t('title'));
    $('#reader-gender').value = settings.gender;
    $('#reader-rate').value = String(settings.rate);
    status(statusKey);
    populateVoices();
  };
  document.addEventListener('esperanca:languagechange', () => { cancel(); pendingSpeech = null; statusKey = 'ready'; translate(); refreshVoices(); });
  if (supported) {
    if (typeof synth.addEventListener === 'function') synth.addEventListener('voiceschanged', populateVoices);
    else synth.onvoiceschanged = populateVoices;
  }
  translate();
  refreshVoices();
  if (settings.enabled) { status(needsActivation() ? 'blocked' : 'active'); sync(); }
})();
