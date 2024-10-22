import * as LitJsSdk from '@lit-protocol/lit-node-client';
import akashaSdk from '../akasha/akasha';
import { AccessControlCondition } from './types';

export class ZulandLit {
  private litNodeClient: LitJsSdk.LitNodeClient;
  chain: string;

  constructor(chain?: string) {
    this.chain = chain ?? 'sepolia';
    this.litNodeClient = new LitJsSdk.LitNodeClient({
      litNetwork: 'datil-dev',
      debug: process.env.NODE_ENV !== 'production',
    });
  }

  async connect() {
    await this.litNodeClient.connect();
  }

  async disconnect() {
    await this.litNodeClient.disconnect();
  }

  async encryptString(
    text: string,
    accessControlConditions: AccessControlCondition[],
  ) {
    await this.litNodeClient.connect();

    const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
      {
        accessControlConditions: accessControlConditions,
        dataToEncrypt: text,
      },
      this.litNodeClient,
    );
    return { ciphertext, dataToEncryptHash };
  }

  async decryptString(
    ciphertext: string,
    dataToEncryptHash: string,
    accessControlConditions: AccessControlCondition[],
  ) {
    await this.litNodeClient.connect();

    // here you can pass the session signatures or authSig
    const sessionSignatures = await generateSessionSignature();
    // const authSig = await getSessionSigs();

    const decryptedText = await LitJsSdk.decryptToString(
      {
        ciphertext,
        dataToEncryptHash,
        chain: this.chain,
        accessControlConditions: accessControlConditions,
        sessionSigs: sessionSignatures,
        // authSig: authSig,
      },
      this.litNodeClient,
    );

    await akashaDisconnect();
    return decryptedText;
  }

  async executeLitActionCode(litActionCode: string, jsParams: any) {
    await this.litNodeClient.connect();
    const sessionSignatures = await generateSessionSignature();
    const response = await this.litNodeClient.executeJs({
      sessionSigs: sessionSignatures,
      code: litActionCode,
      jsParams: jsParams,
    });
    return response;
  }
}

export async function akashaDisconnect() {
  await akashaSdk.services.common.lit.disconnect();
}

export async function akashaConnect() {
  await akashaSdk.services.common.lit.connect();
}

// we are using Akasha SDK for users interactions so we need to generate session signatures using Akasha SDK
export async function generateSessionSignature() {
  await akashaSdk.services.common.lit.connect();
  const sessionSignatures = await akashaSdk.services.common.lit.createSession();

  return sessionSignatures;
}
