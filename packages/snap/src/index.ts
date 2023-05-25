import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';
import { eth_getEncryptionPublicKey, eth_decrypt } from './encryption';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_confirm` call failed.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'eth_getEncryptionPublicKey':
      if (request?.params?.length !== 1) {
        throw new Error('Invalid parameters');
      }
      return eth_getEncryptionPublicKey((request.params as any)[0]);

    case 'eth_decrypt':
      if (request?.params?.length !== 2) {
        throw new Error('Invalid parameters');
      }
      const [message, account] = request.params as any;
      return eth_decrypt(message, account);

    default:
      throw new Error('Method not found.');
  }
};
