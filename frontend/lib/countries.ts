// ISO country code → flag emoji
export function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

export interface Country {
  code: string;
  name: string;
  flag: string;
}

// Broad set covering the common origins of international students.
const ENTRIES: [string, string][] = [
  ["AF", "Afghanistan"], ["AL", "Albania"], ["DZ", "Algeria"], ["AR", "Argentina"],
  ["AM", "Armenia"], ["AU", "Australia"], ["AT", "Austria"], ["AZ", "Azerbaijan"],
  ["BD", "Bangladesh"], ["BY", "Belarus"], ["BE", "Belgium"], ["BO", "Bolivia"],
  ["BA", "Bosnia and Herzegovina"], ["BR", "Brazil"], ["BG", "Bulgaria"], ["KH", "Cambodia"],
  ["CM", "Cameroon"], ["CA", "Canada"], ["CL", "Chile"], ["CN", "China"],
  ["CO", "Colombia"], ["CR", "Costa Rica"], ["HR", "Croatia"], ["CU", "Cuba"],
  ["CY", "Cyprus"], ["CZ", "Czechia"], ["DK", "Denmark"], ["EC", "Ecuador"],
  ["EG", "Egypt"], ["EE", "Estonia"], ["ET", "Ethiopia"], ["FI", "Finland"],
  ["FR", "France"], ["GE", "Georgia"], ["DE", "Germany"], ["GH", "Ghana"],
  ["GR", "Greece"], ["GT", "Guatemala"], ["HK", "Hong Kong"], ["HU", "Hungary"],
  ["IS", "Iceland"], ["IN", "India"], ["ID", "Indonesia"], ["IR", "Iran"],
  ["IQ", "Iraq"], ["IE", "Ireland"], ["IL", "Israel"], ["IT", "Italy"],
  ["JM", "Jamaica"], ["JP", "Japan"], ["JO", "Jordan"], ["KZ", "Kazakhstan"],
  ["KE", "Kenya"], ["KR", "South Korea"], ["KW", "Kuwait"], ["LV", "Latvia"],
  ["LB", "Lebanon"], ["LT", "Lithuania"], ["LU", "Luxembourg"], ["MY", "Malaysia"],
  ["MT", "Malta"], ["MX", "Mexico"], ["MD", "Moldova"], ["MA", "Morocco"],
  ["NP", "Nepal"], ["NL", "Netherlands"], ["NZ", "New Zealand"], ["NG", "Nigeria"],
  ["MK", "North Macedonia"], ["NO", "Norway"], ["PK", "Pakistan"], ["PS", "Palestine"],
  ["PA", "Panama"], ["PY", "Paraguay"], ["PE", "Peru"], ["PH", "Philippines"],
  ["PL", "Poland"], ["PT", "Portugal"], ["QA", "Qatar"], ["RO", "Romania"],
  ["RU", "Russia"], ["SA", "Saudi Arabia"], ["RS", "Serbia"], ["SG", "Singapore"],
  ["SK", "Slovakia"], ["SI", "Slovenia"], ["ZA", "South Africa"], ["ES", "Spain"],
  ["LK", "Sri Lanka"], ["SE", "Sweden"], ["CH", "Switzerland"], ["SY", "Syria"],
  ["TW", "Taiwan"], ["TZ", "Tanzania"], ["TH", "Thailand"], ["TN", "Tunisia"],
  ["TR", "Türkiye"], ["UG", "Uganda"], ["UA", "Ukraine"], ["AE", "United Arab Emirates"],
  ["GB", "United Kingdom"], ["US", "United States"], ["UY", "Uruguay"], ["UZ", "Uzbekistan"],
  ["VE", "Venezuela"], ["VN", "Vietnam"], ["ZM", "Zambia"], ["ZW", "Zimbabwe"],
];

export const COUNTRIES: Country[] = ENTRIES
  .map(([code, name]) => ({ code, name, flag: countryCodeToFlag(code) }))
  .sort((a, b) => a.name.localeCompare(b.name));
