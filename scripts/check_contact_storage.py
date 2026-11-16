"""Verifica rascunhos de contato no navegador, sem enviar e-mails reais."""

from check_contact import run_browser_checks


def check_contact_storage(client, origin):
    checks = {}

    def navigate(path="/contato.html"):
        client.navigate(origin + path)
        client.evaluate(
            "window.intlTelInput.getInstance(document.querySelector('#telefone')).promise.then(() => true)"
        )

    navigate()
    checks["salva_os_campos_somente_na_sessao"] = client.evaluate("""(() => {
      const values = {nome:'Pessoa de teste', email:'pessoa@example.com', assunto:'parceria', mensagem:'Quero conhecer o projeto e colaborar.'};
      for (const [id, value] of Object.entries(values)) {
        const field = document.getElementById(id);
        field.value = value;
        field.dispatchEvent(new Event('input', {bubbles:true}));
      }
      const phone = document.querySelector('#telefone');
      window.intlTelInput.getInstance(phone).setNumber('+442079460018');
      phone.dispatchEvent(new Event('input', {bubbles:true}));
      const session = sessionStorage.getItem('esperanca-contact-draft');
      const local = localStorage.getItem('esperanca-contact-draft');
      const draft = JSON.parse(session);
      return local === null && Object.entries(values).every(([key, value]) => draft[key] === value)
        && draft.country === 'gb' && !!draft.telefone;
    })()""")
    navigate()
    checks["restaura_apos_recarregar_incluindo_pais_e_telefone"] = (
        client.evaluate("""document.querySelector('#nome').value === 'Pessoa de teste'
      && document.querySelector('#email').value === 'pessoa@example.com'
      && document.querySelector('#assunto').value === 'parceria'
      && document.querySelector('#mensagem').value === 'Quero conhecer o projeto e colaborar.'
      && document.querySelector('#telefone').phoneController.getNumber() === '+442079460018'
      && window.intlTelInput.getInstance(document.querySelector('#telefone')).getSelectedCountry().iso2 === 'gb'""")
    )
    client.evaluate(
        "localStorage.setItem('esperanca-contact-draft', JSON.stringify({nome:'Rascunho antigo'}))"
    )
    navigate()
    checks["apaga_rascunho_persistente_antigo_sem_alterar_sessao"] = client.evaluate(
        "document.querySelector('#nome').value === 'Pessoa de teste' && !localStorage.getItem('esperanca-contact-draft')"
    )
    client.evaluate("""(() => {
      const draft = JSON.parse(sessionStorage.getItem('esperanca-contact-draft'));
      draft.nome = 'Rascunho da sessao';
      sessionStorage.setItem('esperanca-contact-draft', JSON.stringify(draft));
    })()""")
    navigate("/contato.html?assunto=voluntariado")
    checks["sessao_tem_prioridade_e_assunto_do_link_prevalece"] = client.evaluate(
        "document.querySelector('#nome').value === 'Rascunho da sessao' && document.querySelector('#assunto').value === 'voluntariado'"
    )
    checks["erro_de_envio_preserva_apenas_a_sessao"] = client.evaluate("""(async () => {
      window.fetch = async () => ({ok:false, status:500, text:async () => 'Simulated failure'});
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      return document.querySelector('#form-result').dataset.state === 'error'
        && JSON.parse(sessionStorage.getItem('esperanca-contact-draft')).nome === 'Rascunho da sessao'
        && !localStorage.getItem('esperanca-contact-draft');
    })()""")
    checks["sucesso_limpa_campos_e_ambos_os_armazenamentos"] = client.evaluate("""(async () => {
      window.fetch = async () => ({ok:true, status:200});
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      return document.querySelector('#form-result').dataset.state === 'success'
        && !sessionStorage.getItem('esperanca-contact-draft') && !localStorage.getItem('esperanca-contact-draft')
        && ['nome','email','telefone','assunto','mensagem'].every(id => !document.getElementById(id).value);
    })()""")
    client.evaluate("""sessionStorage.setItem('esperanca-contact-draft', '{invalid');
      localStorage.setItem('esperanca-contact-draft', JSON.stringify({nome:'Recuperado', mensagem:'<script>alert(1)</script>'}));""")
    navigate()
    checks["rascunho_corrompido_nao_recupera_dados_persistentes"] = client.evaluate(
        "document.querySelector('#nome').value === '' && !localStorage.getItem('esperanca-contact-draft')"
    )
    client.evaluate(
        "sessionStorage.setItem('esperanca-contact-draft', JSON.stringify({mensagem:'<script>alert(1)</script>'}))"
    )
    navigate()
    checks["texto_do_rascunho_permanece_literal"] = client.evaluate(
        "document.querySelector('#mensagem').value === '<script>alert(1)</script>'"
    )
    client.call(
        "Page.addScriptToEvaluateOnNewDocument",
        {
            "source": """
      for (const name of ['sessionStorage', 'localStorage']) {
        Object.defineProperty(window, name, {configurable:true, get() { throw new DOMException('Blocked', 'SecurityError'); }});
      }
    """
        },
    )
    navigate()
    checks["armazenamento_bloqueado_nao_impede_envio"] = client.evaluate("""(async () => {
      window.fetch = async () => ({ok:true, status:200});
      const values = {nome:'Sem armazenamento', email:'pessoa@example.com', assunto:'parceria', mensagem:'Mensagem com armazenamento bloqueado.'};
      for (const [id, value] of Object.entries(values)) {
        const field = document.getElementById(id);
        field.value = value;
        field.dispatchEvent(new Event('input', {bubbles:true}));
      }
      document.querySelector('#contact-form').requestSubmit();
      await new Promise(resolve => setTimeout(resolve, 0));
      return document.querySelector('#form-result').dataset.state === 'success';
    })()""")
    checks["sem_erros_javascript"] = not any(
        event.get("method") == "Runtime.exceptionThrown" for event in client.events
    )
    return checks


if __name__ == "__main__":
    run_browser_checks(check_contact_storage)
