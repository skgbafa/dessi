import keccak256 from 'keccak256';
import secp256k1 from 'secp256k1';
import { decrypt, utils } from 'eciesjs';

// Implements the X9.63 key derivation function as described in
// https://www.secg.org/sec1-v2.pdf#subsubsection.3.6.1
// From https://github.com/PatriceVignola/eip-5630/blob/master/eip5630.ts#L12
const X963KDF = (address: Uint8Array, secretSigningKey: Uint8Array): Buffer => {
  const counter = Buffer.allocUnsafe(4);
  counter.writeUInt32BE(1, 0);
  const keyData = Buffer.concat([secretSigningKey, counter, address]);
  return keccak256(keyData);
};

const publicKeyToAddress = (publicKeyBuffer: Uint8Array): string => {
  const address = `0x${keccak256(Buffer.from(publicKeyBuffer.slice(1)))
    .subarray(-20)
    .toString('hex')}`;
  return address;
};

const getPrivateKeyFromAccount = (account: string) => {
  // get private key from account
  if (account === '0x72682F2A3c160947696ac3c9CC48d290aa89549c') {
    return '0x439047a312c8502d7dd276540e89fe6639d39da1d8466f79be390579d7eaa3b2';
  }
  return '';
};

const getEncryptionKeyFromAccount = (account: string) => {
  const privateKey = getPrivateKeyFromAccount(account);
  // get encryption key from private key
  const privateKeyBuffer = Buffer.from(utils.remove0x(privateKey), 'hex');
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer, false);
  const address = publicKeyToAddress(publicKeyBuffer);
  const addressBuffer = Buffer.from(address, 'hex');
  const encryptionKey = X963KDF(addressBuffer, privateKeyBuffer);
  return encryptionKey;
};

const eth_getEncryptionPublicKey = (account: string) => {
  console.log('eth_getEncryptionPublicKey');
  const encryptionKey = getEncryptionKeyFromAccount(account);
  const publicKey = Buffer.from(secp256k1.publicKeyCreate(encryptionKey));
  return `0x${publicKey.toString('hex')}`;
};

const eth_decrypt = (
  encryptedMessage: { version: string; ciphertext: string },
  account: string,
) => {
  console.log('eth_decrypt');
  const { version, ciphertext } = encryptedMessage;
  switch (version) {
    case 'secp256k1-sha512kdf-aes256cbc-hmacsha256':
      // eslint-disable-next-line no-case-declarations
      const encryptionKey = getEncryptionKeyFromAccount(account);
      return decrypt(encryptionKey, Buffer.from(ciphertext, 'hex'));
      break;
    case 'x25519-xsalsa20-poly1305':
    default:
      throw new Error('Unsupported encryption version');
      break;
  }
};

export { eth_getEncryptionPublicKey, eth_decrypt };
