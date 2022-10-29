import { expect } from 'chai';
import { encrypt } from 'eciesjs';
import { eth_getEncryptionPublicKey, eth_decrypt } from '../src/encryption';

// example values from [EIP-5630](https://eips.ethereum.org/EIPS/eip-5630)
const exampleSigningSecret =
  '0x439047a312c8502d7dd276540e89fe6639d39da1d8466f79be390579d7eaa3b2';
const exampleAccountAddress = '0x72682F2A3c160947696ac3c9CC48d290aa89549c';
const exampleEncryptionPublicKey =
  '0x023e5feced05739d8aad239b037787ba763706fb603e3e92ff0a629e8b4ec2f9be';
const exampleMessage = 'My name is Satoshi Buterin';
const exampleVersion = 'secp256k1-sha512kdf-aes256cbc-hmacsha256';

// helper functions
const encryptMessage = (message: string, publicKey: string) => {
  const encryptedMessage = encrypt(publicKey, Buffer.from(message));
  return encryptedMessage.toString('hex');
};

describe('eth_getEncryptionPublicKey', () => {
  it('should return the public key', () => {
    const result = eth_getEncryptionPublicKey(exampleAccountAddress);
    expect(result).to.equal(exampleEncryptionPublicKey);
  });
});

describe('eth_decrypt', () => {
  it('should decrypt the message', () => {
    const encryptedMessage = encryptMessage(
      exampleMessage,
      exampleEncryptionPublicKey,
    );
    const result = eth_decrypt(
      {
        version: exampleVersion,
        ciphertext: encryptedMessage,
      },
      exampleAccountAddress,
    );
    expect(result).to.equal(exampleMessage);
  });
});
