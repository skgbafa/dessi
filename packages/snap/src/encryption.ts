import { keccak256 } from '@ethersproject/keccak256';
import secp256k1 from 'secp256k1';
import { decrypt } from 'eciesjs';

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
  return Buffer.from('', 'hex');
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
