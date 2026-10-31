# libphonenumber-js 1.13.15

Locally bundled `max` build: complete Google libphonenumber numbering metadata, precise validation and formatting. MIT license.

`phone-data.js` contains mobile/fixed-line lengths and example numbers generated from the exact same package metadata. No country rules are handwritten.

Upstream: https://github.com/catamphetamine/libphonenumber-js

Refresh: `python -B scripts/update_phone_vendor.py --phone-version <version> --intl-version <version>`, then run the phone and contact browser checks.
