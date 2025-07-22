import { Readable } from 'stream';
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  return Buffer.from(buffer).toString('base64');
};

export function arrayBufferToStream(buffer: ArrayBuffer): Readable {
  const readable = new Readable();
  readable.push(Buffer.from(buffer));
  readable.push(null); // Signals the end of the stream
  return readable;
}
