import { keccak256 } from '@ethersproject/keccak256';

const getPrivateKeyFromAccount = (account: string) => {
  // get private key from account
  return '';
};

const getEncryptionKeyFromAccount = (account: string) => {
  const privateKey = getPrivateKeyFromAccount(account);
  // get encryption key from private key
  return '';
};

const eth_getEncryptionPublicKey = (account: string) => {
  console.log('eth_getEncryptionPublicKey');
  const encryptionKey = getEncryptionKeyFromAccount(account);
  // get public key from encryption key
  return '';
};

const eth_decrypt = (
  encryptedMessage: { version: string; ciphertext: string },
  account: string,
) => {
  console.log('eth_decrypt');
  const encryptionKey = getEncryptionKeyFromAccount(account);
  // decrypt message
  return '';
};

export { eth_getEncryptionPublicKey, eth_decrypt };
