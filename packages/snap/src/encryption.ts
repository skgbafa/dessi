const eth_getEncryptionPublicKey = (account: string) => {
  console.log('eth_getEncryptionPublicKey');
  return '';
};

const eth_decrypt = (
  encryptedMessage: { version: string; ciphertext: string },
  account: string,
) => {
  console.log('eth_decrypt');
  return '';
};

export { eth_getEncryptionPublicKey, eth_decrypt };
