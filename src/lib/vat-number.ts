export type VatCountryCode =
  | "AT"
  | "BE"
  | "BG"
  | "CY"
  | "CZ"
  | "DE"
  | "DK"
  | "EE"
  | "EL"
  | "ES"
  | "FI"
  | "FR"
  | "GB"
  | "HR"
  | "HU"
  | "IE"
  | "IT"
  | "LT"
  | "LU"
  | "LV"
  | "MT"
  | "NL"
  | "PL"
  | "PT"
  | "RO"
  | "SE"
  | "SI"
  | "SK"
  | "XI";

export type VatCountry = {
  code: VatCountryCode;
  name: string;
  legacy?: boolean;
};

export type VatValidateInput = {
  vatNumber: string;
  countryCode?: string;
};

export type VatValidateResult = {
  valid: boolean;
  normalized: string | null;
  countryCode: VatCountryCode | null;
  countryName: string | null;
  reason: string;
  checkDigitVerified: boolean;
};

type CountryCheck = {
  valid: boolean;
  reason: string;
  checkDigitVerified: boolean;
  body: string;
};

const emptyResult = (reason: string): VatValidateResult => ({
  valid: false,
  normalized: null,
  countryCode: null,
  countryName: null,
  reason,
  checkDigitVerified: false,
});

export const VAT_COUNTRIES: readonly VatCountry[] = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "EE", name: "Estonia" },
  { code: "EL", name: "Greece" },
  { code: "ES", name: "Spain" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "HR", name: "Croatia" },
  { code: "HU", name: "Hungary" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "LV", name: "Latvia" },
  { code: "MT", name: "Malta" },
  { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "SE", name: "Sweden" },
  { code: "SI", name: "Slovenia" },
  { code: "SK", name: "Slovakia" },
  { code: "XI", name: "Northern Ireland" },
  { code: "GB", name: "United Kingdom", legacy: true },
];

const COUNTRY_BY_CODE = new Map(VAT_COUNTRIES.map((country) => [country.code, country]));

const PREFIX_ALIASES: Record<string, VatCountryCode> = {
  GR: "EL",
};

const COUNTRY_CODES = new Set<string>([
  ...VAT_COUNTRIES.map((country) => country.code),
  ...Object.keys(PREFIX_ALIASES),
]);

export function getVatCountry(code: string | null | undefined): VatCountry | undefined {
  if (!code) return undefined;
  const upper = code.trim().toUpperCase();
  const resolved = PREFIX_ALIASES[upper] ?? upper;
  return COUNTRY_BY_CODE.get(resolved as VatCountryCode);
}

export function normalizeVatInput(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[\s.\-/]/g, "")
    .replace(/[^A-Z0-9+*]/g, "");
}

export function detectCountryCode(normalized: string): VatCountryCode | null {
  if (normalized.length < 2) return null;
  const prefix = normalized.slice(0, 2);
  if (PREFIX_ALIASES[prefix]) return PREFIX_ALIASES[prefix];
  if (COUNTRY_BY_CODE.has(prefix as VatCountryCode)) return prefix as VatCountryCode;
  return null;
}

function isDigits(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function digitList(value: string): number[] {
  return [...value].map((char) => Number(char));
}

function weightedSum(digits: number[], weights: number[]): number {
  return digits.reduce((sum, digit, index) => sum + digit * weights[index], 0);
}

function iso7064Mod11_10(digits: number[]): boolean {
  let product = 10;
  for (const digit of digits.slice(0, -1)) {
    let sum = (digit + product) % 10;
    if (sum === 0) sum = 10;
    product = (sum * 2) % 11;
  }
  const check = (11 - product) % 10;
  return check === digits[digits.length - 1];
}

function luhnEvenFromLeft(digits: number[]): boolean {
  let sum = 0;
  for (let index = 0; index < digits.length; index += 1) {
    let value = digits[index];
    if (index % 2 === 0) {
      value *= 2;
      if (value > 9) value -= 9;
    }
    sum += value;
  }
  return sum % 10 === 0;
}

function letterValue(char: string): number {
  return char.charCodeAt(0) - 55;
}

function mod97(numeric: string): number {
  let remainder = 0;
  for (const char of numeric) {
    remainder = (remainder * 10 + Number(char)) % 97;
  }
  return remainder;
}

function fail(reason: string): CountryCheck {
  return { valid: false, reason, checkDigitVerified: false, body: "" };
}

function pass(body: string, reason: string, checkDigitVerified: boolean): CountryCheck {
  return { valid: true, reason, checkDigitVerified, body };
}

function checkAT(body: string): CountryCheck {
  const core = body.startsWith("U") ? body.slice(1) : body;
  if (!/^[0-9]{8}$/.test(core)) {
    return fail("Austrian VAT IDs are ATU followed by 8 digits.");
  }
  const digits = digitList(core);
  const weights = [1, 2, 1, 2, 1, 2, 1];
  let total = 0;
  for (let index = 0; index < 7; index += 1) {
    const product = digits[index] * weights[index];
    total += product > 9 ? Math.floor(product / 10) + (product % 10) : product;
  }
  let check = 10 - ((total + 4) % 10);
  if (check === 10) check = 0;
  if (check !== digits[7]) {
    return fail("The check digit does not match the Austrian VAT algorithm.");
  }
  return pass(`U${core}`, "Austrian format and check digit match.", true);
}

function checkBE(body: string): CountryCheck {
  const core = body.length === 9 && isDigits(body) ? `0${body}` : body;
  if (!/^[0-1][0-9]{9}$/.test(core)) {
    return fail("Belgian VAT IDs are BE followed by 10 digits (a leading 0 is added to older 9-digit numbers).");
  }
  const firstEight = Number(core.slice(0, 8));
  const check = Number(core.slice(8, 10));
  if (97 - (firstEight % 97) !== check) {
    return fail("The check digits do not match the Belgian modulo-97 VAT algorithm.");
  }
  return pass(core, "Belgian format and check digits match.", true);
}

function checkBG(body: string): CountryCheck {
  if (!/^[0-9]{9,10}$/.test(body)) {
    return fail("Bulgarian VAT IDs are BG followed by 9 or 10 digits.");
  }
  if (body.length === 9) {
    const digits = digitList(body);
    let remainder = weightedSum(digits.slice(0, 8), [1, 2, 3, 4, 5, 6, 7, 8]) % 11;
    if (remainder === 10) {
      remainder = weightedSum(digits.slice(0, 8), [3, 4, 5, 6, 7, 8, 9, 10]) % 11;
      if (remainder === 10) remainder = 0;
    }
    if (remainder !== digits[8]) {
      return fail("The check digit does not match the Bulgarian 9-digit VAT algorithm.");
    }
    return pass(body, "Bulgarian format and check digit match.", true);
  }
  return pass(body, "Bulgarian 10-digit format matches. Check digits are not verified for this length.", false);
}

function checkCY(body: string): CountryCheck {
  if (!/^[0-9]{8}[A-Z]$/.test(body)) {
    return fail("Cypriot VAT IDs are CY followed by 8 digits and one letter.");
  }
  const map = [1, 0, 5, 7, 9, 13, 15, 17, 19, 21];
  let total = 0;
  for (let index = 0; index < 8; index += 1) {
    const digit = Number(body[index]);
    total += index % 2 === 0 ? map[digit] : digit;
  }
  const expected = String.fromCharCode(65 + (total % 26));
  if (expected !== body[8]) {
    return fail("The check letter does not match the Cypriot VAT algorithm.");
  }
  return pass(body, "Cypriot format and check letter match.", true);
}

function checkCZ(body: string): CountryCheck {
  if (!/^[0-9]{8,10}$/.test(body)) {
    return fail("Czech VAT IDs are CZ followed by 8, 9, or 10 digits.");
  }
  if (body.length === 8) {
    const digits = digitList(body);
    const remainder = weightedSum(digits.slice(0, 7), [8, 7, 6, 5, 4, 3, 2]) % 11;
    let check = 11 - remainder;
    if (check === 10) check = 0;
    if (check === 11) check = 1;
    if (check !== digits[7]) {
      return fail("The check digit does not match the Czech 8-digit VAT algorithm.");
    }
    return pass(body, "Czech format and check digit match.", true);
  }
  return pass(body, "Czech 9- or 10-digit format matches. Check digits are not verified for this length.", false);
}

function checkDE(body: string): CountryCheck {
  if (!/^[0-9]{9}$/.test(body)) {
    return fail("German VAT IDs are DE followed by 9 digits.");
  }
  if (!iso7064Mod11_10(digitList(body))) {
    return fail("The check digit does not match the German ISO 7064 VAT algorithm.");
  }
  return pass(body, "German format and check digit match.", true);
}

function checkDK(body: string): CountryCheck {
  if (!/^[0-9]{8}$/.test(body)) {
    return fail("Danish VAT IDs are DK followed by 8 digits.");
  }
  const digits = digitList(body);
  if (weightedSum(digits, [2, 7, 6, 5, 4, 3, 2, 1]) % 11 !== 0) {
    return fail("The check digit does not match the Danish weighted VAT algorithm.");
  }
  return pass(body, "Danish format and check digit match.", true);
}

function checkEE(body: string): CountryCheck {
  if (!/^[0-9]{9}$/.test(body)) {
    return fail("Estonian VAT IDs are EE followed by 9 digits.");
  }
  const digits = digitList(body);
  const check = (10 - (weightedSum(digits.slice(0, 8), [3, 7, 1, 3, 7, 1, 3, 7]) % 10)) % 10;
  if (check !== digits[8]) {
    return fail("The check digit does not match the Estonian VAT algorithm.");
  }
  return pass(body, "Estonian format and check digit match.", true);
}

function checkEL(body: string): CountryCheck {
  if (!/^[0-9]{9}$/.test(body)) {
    return fail("Greek VAT IDs are EL (or GR) followed by 9 digits.");
  }
  const digits = digitList(body);
  const check = (weightedSum(digits.slice(0, 8), [256, 128, 64, 32, 16, 8, 4, 2]) % 11) % 10;
  if (check !== digits[8]) {
    return fail("The check digit does not match the Greek VAT algorithm.");
  }
  return pass(body, "Greek format and check digit match.", true);
}

const ES_DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";
const ES_CIF_LETTERS = "JABCDEFGHI";

function spanishCifControl(body: string): number {
  const weights = [2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let index = 0; index < 7; index += 1) {
    const product = Number(body[index + 1]) * weights[index];
    total += product > 9 ? Math.floor(product / 10) + (product % 10) : product;
  }
  return (10 - (total % 10)) % 10;
}

function checkES(body: string): CountryCheck {
  if (!/^[A-Z0-9][0-9]{7}[A-Z0-9]$/.test(body)) {
    return fail("Spanish VAT IDs are ES followed by a letter or digit, 7 digits, and a letter or digit.");
  }

  const first = body[0];
  const last = body[8];

  if (/^[0-9YZ]$/.test(first) && /[A-Z]/.test(last)) {
    const mapped = first === "Y" ? "1" : first === "Z" ? "2" : first === "X" ? "0" : first;
    const index = Number(`${mapped}${body.slice(1, 8)}`) % 23;
    if (ES_DNI_LETTERS[index] !== last) {
      return fail("The check letter does not match the Spanish NIF/NIE algorithm.");
    }
    return pass(body, "Spanish personal NIF/NIE format and check letter match.", true);
  }

  if (/^[KLMX]$/.test(first) && /[A-Z]/.test(last)) {
    const index = Number(`0${body.slice(1, 8)}`) % 23;
    if (ES_DNI_LETTERS[index] !== last) {
      return fail("The check letter does not match the Spanish K/L/M/X VAT algorithm.");
    }
    return pass(body, "Spanish format and check letter match.", true);
  }

  if (/^[ABCDEFGHJNPQRSUVW]$/.test(first)) {
    const control = spanishCifControl(body);
    const letterOk = /[A-Z]/.test(last) && ES_CIF_LETTERS[control] === last;
    const digitOk = /[0-9]/.test(last) && Number(last) === control;
    const letterOnly = /[PQSNW]/.test(first);
    const digitOnly = /[ABEH]/.test(first);
    if ((letterOnly && letterOk) || (digitOnly && digitOk) || (!letterOnly && !digitOnly && (letterOk || digitOk))) {
      return pass(body, "Spanish company CIF format and check character match.", true);
    }
    return fail("The check character does not match the Spanish CIF algorithm.");
  }

  return fail("That Spanish VAT pattern is not a recognized NIF, NIE, or CIF shape.");
}

function checkFI(body: string): CountryCheck {
  if (!/^[0-9]{8}$/.test(body)) {
    return fail("Finnish VAT IDs are FI followed by 8 digits.");
  }
  const digits = digitList(body);
  const remainder = weightedSum(digits.slice(0, 7), [7, 9, 10, 5, 8, 4, 2]) % 11;
  if (remainder === 1) {
    return fail("The check digit does not match the Finnish VAT algorithm.");
  }
  const check = remainder === 0 ? 0 : 11 - remainder;
  if (check !== digits[7]) {
    return fail("The check digit does not match the Finnish VAT algorithm.");
  }
  return pass(body, "Finnish format and check digit match.", true);
}

function checkFR(body: string): CountryCheck {
  if (!/^[0-9A-Z]{2}[0-9]{9}$/.test(body)) {
    return fail("French VAT IDs are FR followed by a 2-character key and a 9-digit SIREN.");
  }
  const key = body.slice(0, 2);
  const siren = body.slice(2);
  if (/^[0-9]{2}$/.test(key)) {
    if ((Number(siren) * 100 + 12) % 97 !== Number(key)) {
      return fail("The key does not match the French SIREN modulo-97 VAT algorithm.");
    }
    return pass(body, "French format and numeric key match.", true);
  }
  return pass(body, "French alphanumeric-key format matches. Letter keys are not check-digit verified.", false);
}

function checkGB(body: string, label: string): CountryCheck {
  if (/^GD[0-4][0-9]{2}$/.test(body)) {
    return pass(body, `${label} government-department format matches.`, false);
  }
  if (/^HA[5-9][0-9]{2}$/.test(body)) {
    return pass(body, `${label} health-authority format matches.`, false);
  }
  if (!/^[0-9]{9}([0-9]{3})?$/.test(body)) {
    return fail(
      `${label} VAT IDs are 9 digits, 12 digits, GD000–GD499, or HA500–HA999.`,
    );
  }
  const weights = [8, 7, 6, 5, 4, 3, 2];
  const base = weightedSum(digitList(body.slice(0, 7)), weights);
  const withCheck = base + Number(body[7]) * 10 + Number(body[8]);
  if (withCheck % 97 !== 0 && (withCheck + 55) % 97 !== 0) {
    return fail(`The check digits do not match the ${label} modulo-97 VAT algorithm.`);
  }
  return pass(body, `${label} format and check digits match.`, true);
}

function checkHR(body: string): CountryCheck {
  if (!/^[0-9]{11}$/.test(body)) {
    return fail("Croatian VAT IDs are HR followed by 11 digits.");
  }
  if (!iso7064Mod11_10(digitList(body))) {
    return fail("The check digit does not match the Croatian ISO 7064 VAT algorithm.");
  }
  return pass(body, "Croatian format and check digit match.", true);
}

function checkHU(body: string): CountryCheck {
  if (!/^[0-9]{8}$/.test(body)) {
    return fail("Hungarian VAT IDs are HU followed by 8 digits.");
  }
  const digits = digitList(body);
  const check = (10 - (weightedSum(digits.slice(0, 7), [9, 7, 3, 1, 9, 7, 3]) % 10)) % 10;
  if (check !== digits[7]) {
    return fail("The check digit does not match the Hungarian VAT algorithm.");
  }
  return pass(body, "Hungarian format and check digit match.", true);
}

const IE_CHECK_LETTERS = "WABCDEFGHIJKLMNOPQRSTUV";

function irelandNumericBody(body: string): string | null {
  if (/^[0-9][A-Z+*][0-9]{5}[A-Z]$/.test(body)) {
    return `0${body.slice(2, 7)}${body[0]}${body[7]}`;
  }
  if (/^[0-9]{7}[A-Z][A-Z]?$/.test(body)) {
    return body;
  }
  return null;
}

function checkIE(body: string): CountryCheck {
  const prepared = irelandNumericBody(body);
  if (!prepared) {
    return fail(
      "Irish VAT IDs are 7 digits plus a letter, 7 digits plus two letters, or a digit, a letter, 5 digits, and a letter.",
    );
  }
  const weights = [8, 7, 6, 5, 4, 3, 2];
  let total = weightedSum(digitList(prepared.slice(0, 7)), weights);
  if (body.length === 9 && /[A-Z]/.test(body[8])) {
    total += (body.charCodeAt(8) - 64) * 9;
  }
  const expected = IE_CHECK_LETTERS[total % 23];
  if (expected !== prepared[7]) {
    return fail("The check letter does not match the Irish VAT algorithm.");
  }
  return pass(body, "Irish format and check letter match.", true);
}

function checkIT(body: string): CountryCheck {
  if (!/^[0-9]{11}$/.test(body)) {
    return fail("Italian VAT IDs are IT followed by 11 digits.");
  }
  const office = Number(body.slice(7, 10));
  if (office < 1 || (office > 201 && office !== 888 && office !== 999)) {
    return fail("The Italian office code (digits 8–10) must be 001–201, 888, or 999.");
  }
  const digits = digitList(body);
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  let total = 0;
  for (let index = 0; index < 10; index += 1) {
    const product = digits[index] * weights[index];
    total += product > 9 ? Math.floor(product / 10) + (product % 10) : product;
  }
  const check = (10 - (total % 10)) % 10;
  if (check !== digits[10]) {
    return fail("The check digit does not match the Italian VAT algorithm.");
  }
  return pass(body, "Italian format and check digit match.", true);
}

function lithuaniaCheck(digits: number[], weightsA: number[], weightsB: number[]): boolean {
  const body = digits.slice(0, -1);
  let remainder = weightedSum(body, weightsA) % 11;
  if (remainder === 10) {
    remainder = weightedSum(body, weightsB) % 11;
    if (remainder === 10) remainder = 0;
  }
  return remainder === digits[digits.length - 1];
}

function checkLT(body: string): CountryCheck {
  if (!/^[0-9]{9}([0-9]{3})?$/.test(body)) {
    return fail("Lithuanian VAT IDs are LT followed by 9 or 12 digits.");
  }
  const digits = digitList(body);
  const ok =
    body.length === 9
      ? lithuaniaCheck(digits, [1, 2, 3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8, 9, 10])
      : lithuaniaCheck(
          digits,
          [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
        );
  if (!ok) {
    return fail("The check digit does not match the Lithuanian VAT algorithm.");
  }
  return pass(body, "Lithuanian format and check digit match.", true);
}

function checkLU(body: string): CountryCheck {
  if (!/^[0-9]{8}$/.test(body)) {
    return fail("Luxembourg VAT IDs are LU followed by 8 digits.");
  }
  if (Number(body.slice(0, 6)) % 89 !== Number(body.slice(6, 8))) {
    return fail("The check digits do not match the Luxembourg modulo-89 VAT algorithm.");
  }
  return pass(body, "Luxembourg format and check digits match.", true);
}

function checkLV(body: string): CountryCheck {
  if (!/^[0-9]{11}$/.test(body)) {
    return fail("Latvian VAT IDs are LV followed by 11 digits.");
  }
  return pass(body, "Latvian 11-digit format matches. Check digits are not verified for LV.", false);
}

function checkMT(body: string): CountryCheck {
  if (!/^[0-9]{8}$/.test(body)) {
    return fail("Maltese VAT IDs are MT followed by 8 digits.");
  }
  if (Number(body.slice(0, 6)) % 37 !== Number(body.slice(6, 8))) {
    return fail("The check digits do not match the Maltese modulo-37 VAT algorithm.");
  }
  return pass(body, "Maltese format and check digits match.", true);
}

function checkNL(body: string): CountryCheck {
  if (!/^[0-9]{9}B[0-9]{2}$/.test(body)) {
    return fail("Dutch VAT IDs are NL followed by 9 digits, B, and 2 digits.");
  }
  const company = body.slice(0, 9);
  const digits = digitList(company);
  const remainder = weightedSum(digits.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2]) % 11;
  const mod11 = remainder !== 10 && remainder === digits[8];
  const converted = body.replace(/[A-Z]/g, (char) => String(letterValue(char)));
  const mod97Ok = mod97(converted) === 1;
  if (!mod11 && !mod97Ok) {
    return fail("The check digits do not match the Dutch modulo-11 or ISO 7064 VAT algorithms.");
  }
  return pass(body, "Dutch format and check digits match.", true);
}

function checkPL(body: string): CountryCheck {
  if (!/^[0-9]{10}$/.test(body)) {
    return fail("Polish VAT IDs are PL followed by 10 digits.");
  }
  const digits = digitList(body);
  const remainder = weightedSum(digits.slice(0, 9), [6, 5, 7, 2, 3, 4, 5, 6, 7]) % 11;
  if (remainder === 10 || remainder !== digits[9]) {
    return fail("The check digit does not match the Polish VAT algorithm.");
  }
  return pass(body, "Polish format and check digit match.", true);
}

function checkPT(body: string): CountryCheck {
  if (!/^[0-9]{9}$/.test(body)) {
    return fail("Portuguese VAT IDs are PT followed by 9 digits.");
  }
  const digits = digitList(body);
  const remainder = 11 - (weightedSum(digits.slice(0, 8), [9, 8, 7, 6, 5, 4, 3, 2]) % 11);
  const check = remainder >= 10 ? 0 : remainder;
  if (check !== digits[8]) {
    return fail("The check digit does not match the Portuguese VAT algorithm.");
  }
  return pass(body, "Portuguese format and check digit match.", true);
}

function checkRO(body: string): CountryCheck {
  if (!/^[1-9][0-9]{1,9}$/.test(body)) {
    return fail("Romanian VAT IDs are RO followed by 2 to 10 digits, without a leading zero.");
  }
  const weights = [7, 5, 3, 2, 1, 7, 5, 3, 2];
  const digits = digitList(body);
  const bodyLength = digits.length - 1;
  let total = 0;
  for (let index = 0; index < bodyLength; index += 1) {
    total += digits[index] * weights[weights.length - bodyLength + index];
  }
  let check = total % 11;
  if (check === 10) check = 0;
  if (check !== digits[bodyLength]) {
    return fail("The check digit does not match the Romanian VAT algorithm.");
  }
  return pass(body, "Romanian format and check digit match.", true);
}

function checkSE(body: string): CountryCheck {
  if (!/^[0-9]{12}$/.test(body)) {
    return fail("Swedish VAT IDs are SE followed by 12 digits (10-digit org number plus 01–94).");
  }
  const suffix = Number(body.slice(10, 12));
  if (suffix < 1 || suffix > 94) {
    return fail("The last two digits of a Swedish VAT ID should be 01–94 (usually 01).");
  }
  if (!luhnEvenFromLeft(digitList(body.slice(0, 10)))) {
    return fail("The check digit does not match the Swedish Luhn VAT algorithm.");
  }
  return pass(body, "Swedish format and Luhn check digit match.", true);
}

function checkSI(body: string): CountryCheck {
  if (!/^[0-9]{8}$/.test(body)) {
    return fail("Slovenian VAT IDs are SI followed by 8 digits.");
  }
  const digits = digitList(body);
  let check = 11 - (weightedSum(digits.slice(0, 7), [8, 7, 6, 5, 4, 3, 2]) % 11);
  if (check === 10) {
    return fail("The check digit does not match the Slovenian VAT algorithm.");
  }
  if (check === 11) check = 0;
  if (check !== digits[7]) {
    return fail("The check digit does not match the Slovenian VAT algorithm.");
  }
  return pass(body, "Slovenian format and check digit match.", true);
}

function checkSK(body: string): CountryCheck {
  if (!/^[0-9]{10}$/.test(body)) {
    return fail("Slovak VAT IDs are SK followed by 10 digits.");
  }
  if (mod97(`00${body}`) % 11 !== 0 && Number(body) % 11 !== 0) {
    return fail("The number is not divisible by 11, which Slovak VAT IDs require.");
  }
  return pass(body, "Slovak format and modulo-11 check match.", true);
}

function checkCountry(code: VatCountryCode, body: string): CountryCheck {
  switch (code) {
    case "AT":
      return checkAT(body);
    case "BE":
      return checkBE(body);
    case "BG":
      return checkBG(body);
    case "CY":
      return checkCY(body);
    case "CZ":
      return checkCZ(body);
    case "DE":
      return checkDE(body);
    case "DK":
      return checkDK(body);
    case "EE":
      return checkEE(body);
    case "EL":
      return checkEL(body);
    case "ES":
      return checkES(body);
    case "FI":
      return checkFI(body);
    case "FR":
      return checkFR(body);
    case "GB":
      return checkGB(body, "United Kingdom");
    case "HR":
      return checkHR(body);
    case "HU":
      return checkHU(body);
    case "IE":
      return checkIE(body);
    case "IT":
      return checkIT(body);
    case "LT":
      return checkLT(body);
    case "LU":
      return checkLU(body);
    case "LV":
      return checkLV(body);
    case "MT":
      return checkMT(body);
    case "NL":
      return checkNL(body);
    case "PL":
      return checkPL(body);
    case "PT":
      return checkPT(body);
    case "RO":
      return checkRO(body);
    case "SE":
      return checkSE(body);
    case "SI":
      return checkSI(body);
    case "SK":
      return checkSK(body);
    case "XI":
      return checkGB(body, "Northern Ireland");
    default: {
      const exhaustive: never = code;
      return fail(`Unsupported country ${exhaustive}.`);
    }
  }
}

function resolveSelection(rawCountry: string | undefined): VatCountryCode | null | "invalid" {
  if (rawCountry === undefined || rawCountry.trim() === "") return null;
  const upper = rawCountry.trim().toUpperCase();
  if (PREFIX_ALIASES[upper]) return PREFIX_ALIASES[upper];
  if (COUNTRY_BY_CODE.has(upper as VatCountryCode)) return upper as VatCountryCode;
  return "invalid";
}

function stripKnownPrefix(normalized: string): { prefix: VatCountryCode | null; body: string } {
  if (normalized.length >= 2 && COUNTRY_CODES.has(normalized.slice(0, 2))) {
    const prefix = normalized.slice(0, 2);
    const code = PREFIX_ALIASES[prefix] ?? (prefix as VatCountryCode);
    return { prefix: code, body: normalized.slice(2) };
  }
  return { prefix: null, body: normalized };
}

export function validateVatNumber(input: VatValidateInput): VatValidateResult {
  const normalized = normalizeVatInput(input.vatNumber);
  if (!normalized) {
    return emptyResult("Enter a VAT number to validate.");
  }

  const selected = resolveSelection(input.countryCode);
  if (selected === "invalid") {
    return emptyResult("Choose an EU member country, Northern Ireland (XI), or the United Kingdom (GB).");
  }

  const stripped = stripKnownPrefix(normalized);

  if (selected && stripped.prefix && stripped.prefix !== selected) {
    return {
      valid: false,
      normalized: `${stripped.prefix}${stripped.body}`,
      countryCode: stripped.prefix,
      countryName: getVatCountry(stripped.prefix)?.name ?? null,
      reason: `The number starts with ${stripped.prefix}, but ${selected} is selected.`,
      checkDigitVerified: false,
    };
  }

  const countryCode = selected ?? stripped.prefix;
  if (!countryCode) {
    return emptyResult(
      "Add a country prefix (for example DE) or choose a country. This tool does not guess a country from digits alone.",
    );
  }

  const body = stripped.prefix ? stripped.body : normalized;
  if (!body) {
    return {
      valid: false,
      normalized: countryCode,
      countryCode,
      countryName: getVatCountry(countryCode)?.name ?? null,
      reason: `Enter the digits after ${countryCode}.`,
      checkDigitVerified: false,
    };
  }

  const country = getVatCountry(countryCode);
  const checked = checkCountry(countryCode, body);
  const fullId = `${countryCode}${checked.body || body}`;

  if (!checked.valid) {
    return {
      valid: false,
      normalized: fullId,
      countryCode,
      countryName: country?.name ?? null,
      reason: checked.reason,
      checkDigitVerified: false,
    };
  }

  return {
    valid: true,
    normalized: `${countryCode}${checked.body}`,
    countryCode,
    countryName: country?.name ?? null,
    reason: `${checked.reason} Format and check digits only — this does not confirm the number is registered or active.`,
    checkDigitVerified: checked.checkDigitVerified,
  };
}
