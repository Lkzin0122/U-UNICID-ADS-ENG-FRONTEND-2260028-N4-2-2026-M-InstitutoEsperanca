# International phone input

The contact form uses the locally bundled **libphonenumber-js/max 1.13.15** for complete numbering patterns, parsing, formatting and precise validation. **intl-tel-input 29.5.10** supplies the searchable country selector and flags. Country lengths and placeholder examples are generated from the same libphonenumber package, rather than maintained as handwritten rules.

The selector covers 244 regions. The underlying metadata covers 245, including Tristan da Cunha, whose +290 numbers can also be entered through the shared Saint Helena calling code or pasted internationally.

## Behaviour

- Supports fixed-line and mobile contact numbers, including plans where the two cannot be distinguished. The phone remains optional; any nonempty value must be complete and valid.
- Brazil accepts 11-digit mobiles and valid 10-digit landlines. US numbers require 10 national digits, with valid area and exchange patterns. Other plans use their own permitted lengths and prefix patterns.
- Caps national significant digits, allowing necessary national trunk/carrier prefixes and significant leading zeros. It does not impose one global mask or stop at the first valid length. Variable-length plans and long valid German numbers remain supported.
- Formats using national conventions and sends the validated international number to EmailJS. The controller also exposes a canonical number through `document.querySelector('#telefone').phoneController.getNumber()`.
- Accepts international paste and switches the country before applying length checks. An overlong paste is rejected as a whole, preserving the previous value instead of silently sending a truncated number.
- Handles mobile `beforeinput`/`input`, selection replacement, formatting separators, Unicode decimal digits, IME composition, paste, drop and autofill. Invalid input assigned without events is checked again before submission.
- Does not accept a local subscriber number merely because a parser can infer missing area-code digits. International input must preserve its significant digits when canonicalised.
- Keeps entered digits when changing country and marks incompatible values invalid. Recreating the selector for another interface language preserves the number.
- Shows translated validation feedback associated with the field for screen readers. If numbering code or data fails to load, nonempty phone values fail validation; an empty optional phone remains usable.
- Extensions, vanity numbers, short codes, premium-rate and other special service types are outside this personal contact field.

## Verification

```powershell
python -B scripts/check_phone.py
python -B scripts/check_contact.py
python -B scripts/check_site.py
```

The phone suite checks every selectable region for a valid example, national formatting, a digit cap, rejection of excessive length, and rejection of an invalid number. It additionally exercises 489 independent fixed-line/mobile examples from a pinned revision of [Google's numbering metadata](https://github.com/google/libphonenumber/blob/8593ab70fa4fadffc042b2714034f4c52bef7daf/resources/PhoneNumberMetadata.xml), including typing the digits individually and pasting national formatting. Fixtures and source provenance are stored in `scripts/fixtures/phone-examples.json`.

Additional browser checks cover variable lengths, shared calling codes, significant Italian zeros, Argentine mobile prefixes, invalid area codes, incomplete numbers, editing, Unicode, and dependency failure. Results are saved in [phone-checks.json](phone-checks.json). EmailJS requests in automated checks are simulated.

Verified on 31 October 2026 in installed Chrome and Microsoft Edge: all 244 selectable-region checks and all 489 Google fixed-line/mobile examples passed. Phone feedback was checked in all eight interface languages and at widths of 390, 768 and 1440 pixels. The 33 contact regression checks passed, the structural audit found no issues across 12 pages, and the W3C Nu Validator returned no messages for the contact HTML.

## Updating numbering plans

Precise prefix rules change over time. Update both pinned versions deliberately, regenerate the derived lengths, then rerun the browser suites:

```powershell
python -B scripts/update_phone_vendor.py --phone-version <version> --intl-version <version>
```

The updater downloads official npm packages, verifies their published integrity hashes, and extracts only named assets. Review changes and the metadata schema before publishing. The deployed page makes no runtime calls to a numbering or geolocation service.

Numbering-plan validation cannot prove that a number is assigned, reachable or belongs to the visitor; confirming those properties requires a call or verification message. Browser validation also remains a user-interface check: any future backend must validate untrusted submitted numbers independently.

References: [libphonenumber-js and complete metadata](https://github.com/catamphetamine/libphonenumber-js), [Google libphonenumber FAQ](https://github.com/google/libphonenumber/blob/master/FAQ.md), [intl-tel-input documentation](https://intl-tel-input.com/docs/).
