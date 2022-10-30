import { useContext, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// import { useProvider } from '@web3modal/react'

import { SSX, SSXConfig } from '@spruceid/ssx';

import { MetamaskActions, MetaMaskContext } from '../hooks';
import { encrypt } from 'eciesjs';
import {
  connectSnap,
  getSnap,
  getEncryptionPublicKey,
  decrypt,
  shouldDisplayReconnectButton,
} from '../utils';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
  Button,
} from '../components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  color: ${({ theme }) => theme.colors.text.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error.muted};
  border: 1px solid ${({ theme }) => theme.colors.error.default};
  color: ${({ theme }) => theme.colors.error.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const Index = () => {
  // const { provider, isReady } = useProvider();
  const ssxHost = 'http://localhost:3001';
  const ssxConfig = {
    providers: {
      web3: { driver: window.ethereum },
      server: { host: ssxHost },
    }
  };
  const newSSX = new SSX(ssxConfig);
  const [ssx, setSSX] = useState(newSSX);

  const apiInstance = axios.create({
    baseURL: ssxHost,
    withCredentials: true,
  });

  const [state, dispatch] = useContext(MetaMaskContext);

  const [encryptionPublicKey, setEncryptionPublicKey] = useState('');
  const [message, setMessage] = useState('');
  const [cipherText, setCipherText] = useState(localStorage.getItem('cipherText') || '');
  const [encryptedMessage, setEncryptedMessage] = useState('');
  const [decryptedMessage, setDecryptedMessage] = useState('');

  const getStorage = async () => {
    const response = await apiInstance.get('/storage');
    console.log(response);
  };

  const handleConnectClick = async () => {
    try {
      await ssx.signIn();
      await connectSnap();
      const installedSnap = await getSnap();
      await getStorage();

      dispatch({
        type: MetamaskActions.SetInstalled,
        payload: installedSnap,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleGetEncryptionPublicKey = async () => {
    try {
      const account = ssx.address();
      if (!account) {
        throw new Error('No account found');
      }
      const publicKey: any = await getEncryptionPublicKey(account);
      setEncryptionPublicKey(publicKey);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  const handleEncryptAndStoreMessage = async () => {
    try {
      // todo: encrypt message
      await handleGetEncryptionPublicKey();
      // const encryptedMessage = encrypt(message, encryptionPublicKey);
      const encryptedMessage = message;
      localStorage.setItem('cipherText', encryptedMessage);
      setCipherText(encryptedMessage);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDecryptMessage = async () => {
    try {
      const account = ssx.address();
      if (!account) {
        throw new Error('No account found');
      }
      const decrypted: any = await decrypt(cipherText, account);
      setDecryptedMessage(decrypted);
    } catch (e) {
      console.error(e);
      dispatch({ type: MetamaskActions.SetError, payload: e });
    }
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {state.error && (
          <ErrorMessage>
            <b>An error happened:</b> {state.error.message}
          </ErrorMessage>
        )}
        {!state.isFlask && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!state.installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={handleConnectClick}
                  disabled={!state.isFlask}
                />
              ),
            }}
            disabled={!state.isFlask}
          />
        )}
        {shouldDisplayReconnectButton(state.installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={handleConnectClick}
                  disabled={!state.installedSnap}
                />
              ),
            }}
            disabled={!state.installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Get Encryption Public Key',
            description: 'Get the public key used for encryption.',
            button: (
              <Button onClick={handleGetEncryptionPublicKey} disabled={false}>
                eth_getEncryptionPublicKey
              </Button>
            ),
          }}
          disabled={false}
          fullWidth={false}
        />
        <Card
          content={{
            title: 'Encrypt Message',
            description: 'Encrypt a message using the public key.',
            button: (
              <>
                <input type="text" value={message} onChange={(e) => {setMessage(e.target.value)}}/>
                <Button onClick={handleEncryptAndStoreMessage} disabled={false}>
                  Encrypt and Store
                </Button>
              </>
            ),
          }}
          disabled={false}
          fullWidth={false}
        />
        <Card
          content={{
            title: 'Decrypt Message',
            description: 'Decrypt a message using the public key.',
            button: (
              <>
                <p>cipherText: {cipherText}</p>
                <p>Decrypted Message: {decryptedMessage}</p>
                <Button onClick={handleDecryptMessage} disabled={false}>
                  Fetch and Decrypt
                </Button>
              </>
            ),
          }}
          disabled={false}
          fullWidth={false}
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
