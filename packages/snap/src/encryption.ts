import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
import keccak256 from 'keccak256';
import secp256k1 from 'secp256k1';
import { decrypt, utils } from 'eciesjs';

const getPrivateKeyFromAccount = async (account: string) => {
  const node: any = await wallet.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 60,
    },
  });

  const deriveAccount = await getBIP44AddressKeyDeriver(node);
  const MAX_ACCOUNTS = 10;

  for(let index = 0; index < MAX_ACCOUNTS; index++) {
    const accountNode = await deriveAccount(index);
    const address = accountNode.address;
    if (address === account) {
      return accountNode.privateKey;
    }
  }
  return null;
};

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

const getEncryptionKeyFromAccount = async (account: string) => {
  const privateKey = await getPrivateKeyFromAccount(account);
  console.log("privateKey", privateKey);
  if (!privateKey) {
    throw new Error('No private key found');
  }
  // get encryption key from private key
  const privateKeyBuffer = Buffer.from(utils.remove0x(privateKey), 'hex');
  const publicKeyBuffer = secp256k1.publicKeyCreate(privateKeyBuffer, false);
  const address = publicKeyToAddress(publicKeyBuffer);
  const addressBuffer = Buffer.from(address, 'hex');
  const encryptionKey = X963KDF(addressBuffer, privateKeyBuffer);
  return encryptionKey;
};

const eth_getEncryptionPublicKey = async (account: string) => {
  const encryptionKey = await getEncryptionKeyFromAccount(account.toLowerCase());
  const publicKey = Buffer.from(secp256k1.publicKeyCreate(encryptionKey));
  return `0x${publicKey.toString('hex')}`;
};

const eth_decrypt = async (
  encryptedMessage: { version: string; ciphertext: string },
  account: string,
) => {
  const { version, ciphertext } = encryptedMessage;
  switch (version) {
    case 'secp256k1-sha512kdf-aes256cbc-hmacsha256':
      const privateKey = await getEncryptionKeyFromAccount(account.toLowerCase());
      if(!privateKey) {
        throw new Error('No private key found');
      }
      return decrypt(privateKey, Buffer.from(ciphertext, 'hex')).toString(
        'utf8',
      );
    case 'x25519-xsalsa20-poly1305':
    default:
      throw new Error('Unsupported encryption version');
  }
};

export { eth_getEncryptionPublicKey, eth_decrypt };
