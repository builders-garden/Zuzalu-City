import * as LitJsSdk from '@lit-protocol/lit-node-client';
import akashaSdk from '../akasha/akasha';
import { AccessControlCondition } from './types';

const client = new LitJsSdk.LitNodeClient({
  litNetwork: 'datil-dev',
  debug: true, // process.env.NODE_ENV !== 'production',
});

export async function litConnect() {
  await client.connect();
}

export async function litDisconnect() {
  await client.disconnect();
}

export async function litEncryptText(
  text: string,
  accessControlConditions: AccessControlCondition[],
) {
  await litConnect();

  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions: accessControlConditions,
      dataToEncrypt: text,
    },
    client,
  );
  return { ciphertext, dataToEncryptHash };
}

export async function litDecryptText(
  ciphertext: string,
  dataToEncryptHash: string,
  accessControlConditions: AccessControlCondition[],
) {
  await litConnect();

  // here you can pass the session signatures or authSig
  const sessionSignatures = await generateSessionSignature();
  console.log('sessionSignatures:', sessionSignatures);
  // const authSig = await getSessionSigs();
  // console.log('authSig:', authSig);

  const decryptedText = await LitJsSdk.decryptToString(
    {
      ciphertext,
      dataToEncryptHash,
      chain: 'ethereum',
      accessControlConditions: accessControlConditions,
      sessionSigs: sessionSignatures,
      // authSig: authSig,
    },
    client,
  );

  console.log('decrypted text:', decryptedText);
  await litDisconnect();
  await akashaDisconnect();
  return decryptedText;
}

export async function executeLitActionCode(
  litActionCode: string,
  jsParams: any,
) {
  await litConnect();
  const sessionSignatures = await generateSessionSignature();
  const response = await client.executeJs({
    sessionSigs: sessionSignatures,
    code: litActionCode,
    jsParams: jsParams,
  });
  return response;
}

export async function akashaDisconnect() {
  console.log('disconnecting from akasha Lit client...');
  await akashaSdk.services.common.lit.disconnect();
}

export async function akashaConnect() {
  console.log('connecting to akasha Lit client...');
  await akashaSdk.services.common.lit.connect();
}

// export async function getSessionSigs() {
//   const sessionSigs = await LitJsSdk.checkAndSignAuthMessage({
//     chain: 'sepolia',
//     resources: ['*'],
//     nonce: 'aaabbbccc',
//     uri: 'https://topical-sole-suited.ngrok-free.app',
//   });
//   console.log('sessionSigs:', sessionSigs);
//   return sessionSigs;
// }

// we are using Akasha SDK for users interactions so we need to generate session signatures using Akasha SDK
export async function generateSessionSignature() {
  await akashaSdk.services.common.lit.connect();
  const sessionSignatures = await akashaSdk.services.common.lit.createSession();

  return sessionSignatures;
}
