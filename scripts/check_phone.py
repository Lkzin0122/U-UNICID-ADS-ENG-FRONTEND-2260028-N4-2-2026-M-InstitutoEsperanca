"""All-region phone metadata and real-browser interaction checks; never sends email.

Run: python -B scripts/check_phone.py
Detailed evidence is saved to docs/phone-checks.json.
"""
import json
from pathlib import Path
from check_contact import run_browser_checks

ROOT = Path(__file__).resolve().parent.parent


def check_phone(client, origin):
    client.navigate(origin + '/contato.html')
    google = json.loads((ROOT / 'scripts/fixtures/phone-examples.json').read_text(encoding='utf-8'))
    client.evaluate('window.googlePhoneExamples = ' + json.dumps(google))
    report = client.evaluate("""(() => {
      const input = document.querySelector('#telefone');
      const widget = intlTelInput.getInstance(input);
      const controller = input.phoneController;
      const lib = libphonenumber;
      const report = {version:esperancaPhoneData.version, browser:navigator.userAgent, googleSource:googlePhoneExamples.source, regions:[], independentExamples:[], fixtures:[], interactions:{}};
      window.phoneTest = {
        report, input, controller, lib,
        set(country, value) {
          controller.reset();
          intlTelInput.getInstance(input).setSelectedCountry(country.toLowerCase());
          input.value = value;
          input.dispatchEvent(new Event('input', {bubbles:true}));
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        },
        paste(text) {
          const data = new DataTransfer();
          data.setData('text', text);
          input.dispatchEvent(new ClipboardEvent('paste', {clipboardData:data,bubbles:true,cancelable:true}));
        },
      };
      const selectable = new Set(intlTelInput.getAllCountries().map(item => item.iso2));
      report.supportedRegions = Object.keys(esperancaPhoneData.countries).filter(code=>selectable.has(code.toLowerCase())).length;
      for (const [country, data] of Object.entries(esperancaPhoneData.countries)) {
        if (!selectable.has(country.toLowerCase())) continue;
        const full = '+' + data.callingCode + data.example;
        const expected = lib.parsePhoneNumberFromString(full);
        phoneTest.set(country, full);
        const selected = intlTelInput.getInstance(input).getSelectedCountry().iso2;
        const example = controller.validate() && controller.getNumber() === expected?.number;
        const national = input.value === expected?.formatNational();
        const max = Math.max(...esperancaPhoneData.countries[selected.toUpperCase()].lengths);
        const extra = '7'.repeat(Math.max(1, max - expected.nationalNumber.length + 1));
        const before = input.value;
        const event = new InputEvent('beforeinput', {inputType:'insertText',data:extra,bubbles:true,cancelable:true});
        input.dispatchEvent(event);
        const cap = event.defaultPrevented && input.value === before;
        const tooLong = expected.number + extra;
        input.value = tooLong;
        const submission = !controller.validate() && controller.getNumber() === '';
        const candidates = ['0'.repeat(data.example.length), ...'0123456789'.split('').map(digit => digit + data.example.slice(1)), '1'];
        const invalidNumber = candidates.find(value => !lib.isValidPhoneNumber(value,{defaultCountry:country,extract:false}));
        phoneTest.set(country, invalidNumber);
        const invalid = !controller.validate() && controller.getNumber() === '';
        const result = {country, selectable:selectable.has(country.toLowerCase()), example, national, max, cap, submission, invalid};
        if (!cap || !submission || !invalid) result.debug = {full,before,extra,tooLong,current:input.value,currentCountry:intlTelInput.getInstance(input).getSelectedCountry().iso2,currentValid:controller.getNumber(),parsedLong:lib.parsePhoneNumberFromString(tooLong,{defaultCountry:country,extract:false})?.number};
        report.regions.push(result);
      }
      for (const [country, examples] of Object.entries(googlePhoneExamples.countries)) {
        const data = esperancaPhoneData.countries[country];
        const selected = selectable.has(country.toLowerCase()) ? country : intlTelInput.getAllCountries().find(item => item.dialCode === data.callingCode)?.iso2;
        for (const [type, national] of Object.entries(examples)) {
          const full = '+' + data.callingCode + national;
          phoneTest.set(selected, full);
          const accepted = controller.validate() && controller.getNumber() === full;
          const formatted = input.value;
          phoneTest.set(selected, '');
          phoneTest.paste(formatted);
          const paste = controller.validate() && controller.getNumber() === full;
          phoneTest.set(selected, '');
          const trace = [];
          for (const character of national) {
            const event = new InputEvent('beforeinput',{inputType:'insertText',data:character,bubbles:true,cancelable:true});
            if (input.dispatchEvent(event)) {
              input.setRangeText(character,input.selectionStart,input.selectionEnd,'end');
              input.dispatchEvent(new InputEvent('input',{inputType:'insertText',data:character,bubbles:true}));
            }
            trace.push({character,value:input.value,country:intlTelInput.getInstance(input).getSelectedCountry()?.iso2,blocked:event.defaultPrevented});
          }
          const typed = controller.validate() && controller.getNumber() === full;
          const result = {country,type,full,accepted,paste,typed,actual:controller.getNumber()};
          if (!typed) result.trace=trace;
          report.independentExamples.push(result);
        }
      }
      const fixtures = [
        ['BR','11961234567',true,'+5511961234567'],
        ['BR','1130123456',true,'+551130123456'],
        ['BR','00123456789',false],
        ['BR','1191234567',false],
        ['BR','20961234567',false],
        ['US','2015550123',true,'+12015550123'],
        ['US','1235550123',false],
        ['US','2011550123',false],
        ['US','5550123',false],
        ['DE','+493012345',true],
        ['DE','+49301234567890123',true],
        ['AT','+4312345',true],
        ['GB','+44169772345',true],
        ['GB','+447400123456',true],
        ['ID','+62812345678',true],
        ['ID','+62812345678901',true],
        ['IT','+390236618300',true,'+390236618300'],
        ['AR','011 15-2345-6789',true,'+5491123456789'],
        ['CA','+15062345678',true,'+15062345678'],
        ['KZ','+77011234567',true,'+77011234567'],
        ['GG','+441481256789',true],
        ['US','٢٠١٥٥٥٠١٢٣',true,'+12015550123'],
        ['US','２０１５５５０１２３',true,'+12015550123'],
        ['US','(201) 555–0123',true,'+12015550123'],
        ['US','+9992015550123',false],
        ['US','2015550123 ext 456',false],
        ['US','Call me at 2015550123',false],
      ];
      for (const [country, value, expected, canonical] of fixtures) {
        phoneTest.set(country, '');
        input.value = value;
        const valid = controller.validate();
        const actual = controller.getNumber();
        report.fixtures.push({country,value,expected,valid,actual,pass:valid === expected && (!canonical || canonical === actual)});
      }
      phoneTest.set('US', '');
      return report;
    })()""")
    # Trusted browser text insertion uses beforeinput/input, as on mobile and autofill.
    for country, number, expected in (('br', '11961234567', '(11) 96123-4567'), ('us', '2015550123', '(201) 555-0123')):
        client.evaluate('phoneTest.set(' + json.dumps(country) + ', "")')
        for character in number:
            client.call('Input.insertText', {'text': character})
        before = client.evaluate('phoneTest.input.value')
        client.call('Input.insertText', {'text': '999'})
        report['interactions'][country + '_trusted_typing_and_cap'] = client.evaluate('phoneTest.input.value === ' + json.dumps(expected) + ' && phoneTest.input.value === ' + json.dumps(before) + ' && phoneTest.controller.validate()')
    cases = {
        'international_paste_switches_country_before_limit': """(() => {phoneTest.set('US','');phoneTest.paste('+49 30 1234567890123');return phoneTest.controller.getNumber()==='+49301234567890123' && intlTelInput.getInstance(phoneTest.input).getSelectedCountry().iso2==='de';})()""",
        'overlong_paste_does_not_silently_change_number': """(() => {phoneTest.set('US','2015550123');const before=phoneTest.input.value;phoneTest.input.select();phoneTest.paste('201555012399');return phoneTest.input.value===before && phoneTest.controller.getNumber()==='+12015550123' && !document.querySelector('#phone-error').hidden;})()""",
        'selection_replacement_at_max': """(() => {phoneTest.set('US','2015550123');phoneTest.input.setSelectionRange(1,4);phoneTest.paste('202');return phoneTest.controller.getNumber()==='+12025550123';})()""",
        'country_change_preserves_digits_and_blocks_invalid_number': """(() => {phoneTest.set('BR','11961234567');const before=phoneTest.input.value.replace(/\\D/g,'');intlTelInput.getInstance(phoneTest.input).setSelectedCountry('us');return phoneTest.input.value.replace(/\\D/g,'')===before && !phoneTest.controller.validate() && phoneTest.controller.getNumber()==='';})()""",
        'noncancelable_input_restores_last_number': """(() => {phoneTest.set('US','2015550123');const before=phoneTest.input.value;phoneTest.input.value+='999';phoneTest.input.dispatchEvent(new InputEvent('input',{inputType:'insertText',data:'999',bubbles:true}));return phoneTest.input.value===before && phoneTest.controller.validate();})()""",
        'optional_phone_can_be_empty': """(() => {phoneTest.set('US','');return phoneTest.controller.validate() && phoneTest.controller.getNumber()==='' && phoneTest.input.checkValidity();})()""",
        'invalid_autofill_cannot_submit': """(() => {phoneTest.set('US','');let calls=0;window.fetch=()=>{calls++;return Promise.resolve({ok:true});};for(const [id,value] of Object.entries({nome:'Teste',email:'teste@example.com',assunto:'outro',mensagem:'Mensagem de teste sem envio real.'}))document.getElementById(id).value=value;phoneTest.input.value='1235550123';document.querySelector('#contact-form').requestSubmit();return calls===0 && !phoneTest.input.checkValidity();})()""",
        'composition_normalises_fullwidth_digits': """(() => {phoneTest.set('US','');phoneTest.input.dispatchEvent(new CompositionEvent('compositionstart'));phoneTest.input.value='２０１５５５０１２３';phoneTest.input.dispatchEvent(new InputEvent('input',{isComposing:true,bubbles:true}));phoneTest.input.dispatchEvent(new CompositionEvent('compositionend'));return phoneTest.controller.getNumber()==='+12015550123';})()""",
        'oversized_paste_is_rejected_without_truncation': """(() => {phoneTest.set('US','2015550123');const before=phoneTest.input.value;phoneTest.input.select();phoneTest.paste('9'.repeat(10000));return phoneTest.input.value===before;})()""",
        'missing_area_code_is_not_inferred': """(() => {phoneTest.set('AI','');phoneTest.input.value='4612345';return !phoneTest.controller.validate() && phoneTest.controller.getNumber()==='';})()""",
    }
    for name, expression in cases.items():
        report['interactions'][name] = client.evaluate(expression)
    client.evaluate("phoneTest.set('US','2015550123');phoneTest.input.setSelectionRange(6,6)")
    client.call('Input.dispatchKeyEvent', {'type': 'keyDown', 'key': 'Backspace', 'code': 'Backspace', 'windowsVirtualKeyCode': 8})
    client.call('Input.dispatchKeyEvent', {'type': 'keyUp', 'key': 'Backspace', 'code': 'Backspace', 'windowsVirtualKeyCode': 8})
    report['interactions']['backspace_over_separator_removes_digit'] = client.evaluate("phoneTest.input.value.replace(/\\D/g,'').length === 9")
    for locale in ('en', 'zh-CN', 'de', 'fr', 'es-419', 'ru', 'ja', 'hi', 'pt-BR'):
        report['interactions']['phone_locale_' + locale] = client.evaluate("""(async () => {
          phoneTest.set('US','2015550123');
          const picker=document.querySelector('#language-picker');
          picker.value=""" + json.dumps(locale) + """;picker.dispatchEvent(new Event('change',{bubbles:true}));
          for(let i=0;i<100 && document.documentElement.lang!==picker.value;i++)await new Promise(resolve=>setTimeout(resolve,20));
          const preserved=phoneTest.controller.getNumber()==='+12015550123' && intlTelInput.instances.size===1;
          phoneTest.input.value='1235550123';phoneTest.controller.validate(true);
          const phrase='Confira o país, o código de área e o número de telefone.';
          const translated=esperancaI18n.t(phrase);
          return preserved && document.querySelector('#phone-error').textContent===translated && (picker.value==='pt-BR' || translated!==phrase);
        })()""")
    for width, height in ((390, 844), (768, 1024), (1440, 1000)):
        client.call('Emulation.setDeviceMetricsOverride', {'width':width,'height':height,'deviceScaleFactor':1,'mobile':width < 600})
        report['interactions']['phone_error_layout_' + str(width)] = client.evaluate("document.documentElement.scrollWidth <= innerWidth + 1 && getComputedStyle(document.querySelector('#phone-error')).display !== 'none'")
    client.call('Network.enable')
    for asset in ('libphonenumber-max.js', 'phone-data.js', 'phone-input.js', 'intlTelInput.min.js'):
        client.call('Network.setBlockedURLs', {'urls':['*' + asset + '*']})
        client.navigate(origin + '/contato.html')
        report['interactions']['failure_closed_' + asset] = client.evaluate("""(async () => {
          let calls=0;
          window.fetch=async () => {calls++;return {ok:true,status:200};};
          for(const [id,value] of Object.entries({nome:'Teste',email:'teste@example.com',assunto:'outro',mensagem:'Mensagem simulada, nenhum e-mail real.',telefone:'2015550123'}))document.getElementById(id).value=value;
          const form=document.querySelector('#contact-form');
          form.requestSubmit();
          const invalidBlocked=calls===0 && !document.querySelector('#telefone').checkValidity();
          const phone=document.querySelector('#telefone');
          phone.value='';phone.dispatchEvent(new Event('input',{bubbles:true}));
          form.requestSubmit();
          await new Promise(resolve=>setTimeout(resolve,0));
          return invalidBlocked && calls===1;
        })()""")
    client.call('Network.setBlockedURLs', {'urls':[]})
    report['javascript_errors'] = [event['params'].get('exceptionDetails') for event in client.events if event.get('method') == 'Runtime.exceptionThrown']
    (ROOT / 'docs/phone-checks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    failures = [region for region in report['regions'] if not all(region[key] for key in ('selectable', 'example', 'national', 'cap', 'submission', 'invalid'))]
    fixture_failures = [fixture for fixture in report['fixtures'] if not fixture['pass']]
    example_failures = [example for example in report['independentExamples'] if not all(example[key] for key in ('accepted', 'paste', 'typed'))]
    print(json.dumps({'regions':len(report['regions']), 'region_failures':failures, 'independent_examples':len(report['independentExamples']), 'example_failures':[{key:value for key,value in example.items() if key != 'trace'} for example in example_failures], 'fixture_failures':fixture_failures}, ensure_ascii=True, indent=2))
    return {'all_regions':len(report['regions']) == report['supportedRegions'] and bool(report['regions']) and not failures, 'google_fixed_and_mobile_examples':bool(report['independentExamples']) and not example_failures, 'specific_fixtures':not fixture_failures, **report['interactions'], 'no_javascript_errors':not report['javascript_errors']}


if __name__ == '__main__':
    run_browser_checks(check_phone)
