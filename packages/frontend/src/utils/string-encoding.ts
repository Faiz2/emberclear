import * as QRCode from 'qrcode';
import libsodiumWrapper from 'libsodium-wrappers';

// for the utils, we don't care about wasm,
// so the conversions don't need to be async
const sodium = libsodiumWrapper.sodium;

export function toBase64(array: Uint8Array): string {
  return sodium.to_base64(array);
}

export function fromBase64(base64: string): Uint8Array {
  return sodium.from_base64(base64);
}

export function fromString(str: string): Uint8Array {
  return sodium.from_string(str);
}

export function toString(uint8Array: Uint8Array): string {
  return sodium.to_string(uint8Array);
}

export function ensureUint8Array(text: string | Uint8Array): Uint8Array {
  if (text.constructor === Uint8Array) {
    return text as Uint8Array;
  }

  return fromString(text as string);
}

export async function convertObjectToQRCodeDataURL(object: any): Promise<string> {
  const string = JSON.stringify(object);

  return await QRCode.toDataURL(string);
}

export function convertObjectToBase64String(object: any): string {
  const json = JSON.stringify(object);
  const base64 = btoa(json);

  return base64;
}

export function convertBase64StringToObject(base64: string): any {
  const json = atob(base64);
  const object = JSON.parse(json);

  return object;
}

export function objectToDataURL(object: any): string {
  const string = convertObjectToBase64String(object);
  return `data:text/json;base64,${string}`;
}

// http://stackoverflow.com/a/39460727
export function base64ToHex(base64: string): string | undefined {
  if (base64 === undefined) return undefined;

  // convert to binary, than to hex
  const raw = atob(base64);
  let hex = '';

  for (let i = 0; i < raw.length; i++) {
    const hexChar = raw.charCodeAt(i).toString(16);
    hex += (hexChar.length === 2 ? hexChar : `0${hexChar}`);
  }

  return hex.toUpperCase();
}