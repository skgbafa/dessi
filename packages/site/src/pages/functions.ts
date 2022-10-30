import { encrypt } from "eciesjs";
import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;
const encryptMessage = (message: string, publicKey: string) => {
  const encryptedMessage = encrypt(publicKey, Buffer.from(message));
  return encryptedMessage.toString("hex");
}


export { encryptMessage };
