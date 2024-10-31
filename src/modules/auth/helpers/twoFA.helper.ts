import base32 from 'hi-base32';

export const asciiToHex = (str: string) => {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const decimal = str.charCodeAt(i);
    hex += decimal.toString(16);
  }
  return hex;
};

const stringToBase32 = (text: string) => {
  const utf8Bytes = new TextEncoder().encode(text);
  const data = new Uint8Array(utf8Bytes);
  return base32.encode(data);
};

export const get2FASecret = (text: string) => {
  const salt = '?:SD%oDD<E!^q^1N):??';
  const ascii = `${salt}${text}`;
  const base32 = stringToBase32(ascii);
  return base32;
};
