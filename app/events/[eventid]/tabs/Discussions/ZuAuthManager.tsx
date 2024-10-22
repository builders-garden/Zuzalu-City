'use client';

import { Zuconfig } from '@/constant';
import { litConnect, litDecryptText, litEncryptText } from '@/utils/lit';
import { zuAuthPopup } from '@pcd/zuauth/client';
import { useCallback, useEffect, useReducer, useState } from 'react';

type AuthState =
  | 'logged out'
  | 'auth-start'
  | 'authenticating'
  | 'authenticated'
  | 'error';

export default function Home() {
  const [pcdStr, setPcdStr] = useState<string>('');
  const [authState, setAuthState] = useState<AuthState>('logged out');
  const [log, addLog] = useReducer((currentLog: string, toAdd: string) => {
    return `${currentLog}${currentLog === '' ? '' : '\n'}${toAdd}`;
  }, '');
  const [user, setUser] = useState<Record<string, string> | undefined>();

  async function litActionTest(plainText: string) {
    const accessControlConditions = [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',
        },
      },
    ];
    const result = await litEncryptText(plainText, accessControlConditions);
    console.log('litActionTest result', result);
  }

  async function connectionTest() {
    await litConnect();
  }

  async function executeLitActionCodeTest() {
    // console.log('executing simple example with number check');
    // const result = await executeLitActionCode(litActionCode, {
    //   magicNumber: 43,
    // });
    // console.log('executeLitActionCodeTest result', result);

    // console.log('executing complex example with decryption');
    // const accessControlConditions = [
    //   {
    //     contractAddress: '',
    //     standardContractType: '',
    //     chain: 'ethereum',
    //     method: 'eth_getBalance',
    //     parameters: [':userAddress', 'latest'],
    //     returnValueTest: {
    //       comparator: '>=',
    //       value: '0',
    //     },
    //   },
    // ];
    // const encryptData = await litEncryptText('naaamo', accessControlConditions);
    // console.log('params for the complex Lit Action', {
    //   code: litActionDecryptAndCombine,
    //   accessControlConditions: [
    //     {
    //       contractAddress: '',
    //       standardContractType: '',
    //       chain: 'ethereum',
    //       method: 'eth_getBalance',
    //       parameters: [':userAddress', 'latest'],
    //       returnValueTest: {
    //         comparator: '>=',
    //         value: '0',
    //       },
    //     },
    //   ],
    //   ciphertext: encryptData.ciphertext,
    //   dataToEncryptHash: encryptData.dataToEncryptHash,
    // });
    // const result2 = await executeLitActionCode(litActionDecryptAndCombine, {
    //   accessControlConditions: [
    //     {
    //       contractAddress: '',
    //       standardContractType: '',
    //       chain: 'ethereum',
    //       method: 'eth_getBalance',
    //       parameters: [':userAddress', 'latest'],
    //       returnValueTest: {
    //         comparator: '>=',
    //         value: '0',
    //       },
    //     },
    //   ],
    //   ciphertext: encryptData.ciphertext,
    //   dataToEncryptHash: encryptData.dataToEncryptHash,
    // });
    // console.log('executeLitActionCodeTest result2', result2);

    // console.log('executing complex example with decryption');
    const accessControlConditions = [
      {
        contractAddress: '0xAe8ccE7d5aF9D7f2A0e2295b7F2e53f249E9cAdE',
        standardContractType: 'ERC721',
        chain: 'sepolia',
        method: 'balanceOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ];

    // -------- WRITE
    // const accessControlConditions = [
    //   {
    //     contractAddress: '',
    //     standardContractType: '',
    //     chain: 'ethereum',
    //     method: 'eth_getBalance',
    //     parameters: [':userAddress', 'latest'],
    //     returnValueTest: {
    //       comparator: '>=',
    //       value: '0',
    //     },
    //   },
    // ];
    const encryptData = await litEncryptText('naaamo', accessControlConditions);
    console.log('params for the complex Lit Action', {
      // code: verifyZuPassPCDCode,
      accessControlConditions,
      ciphertext: encryptData.ciphertext,
      dataToEncryptHash: encryptData.dataToEncryptHash,
    });
    // -------- GET
    // const result2 = await executeLitActionCode(verifyZuPassPCDCode, {
    //   accessControlConditions,
    //   ciphertext: encryptData.ciphertext,
    //   dataToEncryptHash: encryptData.dataToEncryptHash,
    //   pcdStr: '1234567',
    // });
    // console.log('[USING PCD LITACTION]', result2);
    const result3 = await litDecryptText(
      encryptData.ciphertext,
      encryptData.dataToEncryptHash,
      accessControlConditions,
    );
    console.log('[decryptToString Lit function]', result3);
  }

  async function litDecryptAkashaBeams() {
    const accessControlConditions = [
      {
        contractAddress:
          'ipfs://QmRob5h9QPKxtHg49jLWs3orJWUzB88vktsB9S9od9kGk7',
        standardContractType: 'LitAction',
        chain: 'ethereum',
        method: 'verifyZuPassPCD',
        parameters: [
          '{"type":"zk-eddsa-event-ticket-pcd","pcd":"{\\"id\\":\\"021bd813-d34e-46ca-b7b6-42d9c70af18b\\",\\"claim\\":{\\"partialTicket\\":{\\"eventId\\":\\"3cf75131-6631-5096-b2e8-03c25d00f4de\\",\\"productId\\":\\"f4cbd4c9-819e-55eb-8c68-90a660bacf49\\",\\"attendeeEmail\\":\\"\\",\\"attendeeName\\":\\"Example Ticket\\"},\\"watermark\\":\\"1579110783339923609088358952425362921828168090816491822313739335002792120\\",\\"signer\\":[\\"1ebfb986fbac5113f8e2c72286fe9362f8e7d211dbc68227a468d7b919e75003\\",\\"10ec38f11baacad5535525bbe8e343074a483c051aa1616266f3b1df3fb7d204\\"],\\"nullifierHash\\":\\"11775318844383433911786813669836550522765747986101720535467718365461083070425\\",\\"externalNullifier\\":\\"1579110783339923609088358952425362921828168090816491822313739335002792120\\"},\\"proof\\":{\\"pi_a\\":[\\"2223560781199743083146853629472148885478341529558640762593487089489656436157\\",\\"6113850433094144241233514593311533478653105427522318257650865673412801635228\\",\\"1\\"],\\"pi_b\\":[[\\"13915890691146838047063893428073018495907666912082704337738673424071954541936\\",\\"10350826314075268491782447132795551263554894095170575411926854050754151285778\\"],[\\"8083467419515928283947171691336794853757122272914452269364317560992259661114\\",\\"7722101257028462432859011588631108113904646166525924651697855430887359369734\\"],[\\"1\\",\\"0\\"]],\\"pi_c\\":[\\"5263042543680239467879547058412679942702764513207003384048656538947910694260\\",\\"4842140666732855027308509607592033835577936611759880488443269438092212717891\\",\\"1\\"],\\"protocol\\":\\"groth16\\",\\"curve\\":\\"bn128\\"},\\"type\\":\\"zk-eddsa-event-ticket-pcd\\"}"}',
          'topical-sole-suited.ngrok-free.app',
        ],
        returnValueTest: {
          comparator: '=',
          value: 'true',
        },
      },
    ];
    const encryptedData = await litEncryptText(
      'naaaaaamo',
      accessControlConditions,
    );
    console.log('params for the complex Lit Action', {
      accessControlConditions,
      ciphertext: encryptedData.ciphertext,
      dataToEncryptHash: encryptedData.dataToEncryptHash,
    });

    const decryptedResult = await litDecryptText(
      encryptedData.ciphertext,
      encryptedData.dataToEncryptHash,
      accessControlConditions,
    );
    console.log('[decryptToString Lit function]', decryptedResult);
  }

  useEffect(() => {
    (async () => {
      if (authState === 'auth-start') {
        addLog('Fetching watermark');
        const watermark = (await (await fetch('/api/watermark')).json())
          .watermark;
        addLog('Got watermark');
        addLog('Opening popup window');
        setAuthState('authenticating');
        const result = await zuAuthPopup({
          zupassUrl: process.env.NEXT_PUBLIC_ZUPASS_SERVER_URL as string,
          fieldsToReveal: {
            revealAttendeeEmail: true,
            revealAttendeeName: true,
            revealEventId: true,
            revealProductId: true,
          },
          watermark,
          config: Zuconfig,
        });

        if (result.type === 'pcd') {
          addLog('Received PCD');
          setPcdStr(result.pcdStr);

          // doing here stuff with Lit

          console.log('AAAAA result.pcdStr', JSON.stringify(result.pcdStr));

          const loginResult = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pcd: result.pcdStr }),
          });

          setUser((await loginResult.json()).user);
          addLog('Authenticated successfully');
          setAuthState('authenticated');
        } else if (result.type === 'popupBlocked') {
          addLog('The popup was blocked by your browser');
          setAuthState('error');
        } else if (result.type === 'popupClosed') {
          addLog('The popup was closed before a result was received');
          setAuthState('error');
        } else {
          addLog(`Unexpected result type from zuAuth: ${result.type}`);
          setAuthState('error');
        }
      }
    })();
  }, [addLog, authState]);

  const auth = useCallback(() => {
    if (authState === 'logged out' || authState === 'error') {
      addLog('Beginning authentication');
      setAuthState('auth-start');
    }
  }, [addLog, authState]);

  const logout = useCallback(() => {
    setUser(undefined);
    setPcdStr('');
    setAuthState('logged out');
    addLog('Logged out');
  }, []);

  const stateClasses: Record<AuthState, string> = {
    'logged out': '',
    'auth-start': 'text-blue-300',
    authenticated: 'text-green-300',
    error: 'text-red-300',
    authenticating: 'text-blue-300',
  };

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}
    >
      <div className="z-10 max-w-5xl w-full text-sm">
        <button
          onClick={authState === 'authenticated' ? logout : auth}
          className="border rounded border-gray-400 px-4 py-2 font-medium text-md"
          disabled={
            authState === 'auth-start' || authState === 'authenticating'
          }
        >
          {authState === 'authenticated' ? `Log out` : `Authenticate`}
        </button>
        <div className="my-4">
          Current authentication state is{' '}
          <span className={`font-semibold ${stateClasses[authState]}`}>
            {authState}
          </span>{' '}
          {user && (
            <>
              as{' '}
              <span className="font-medium text-yellow-200">{`${user.attendeeName} (${user.attendeeEmail})`}</span>
            </>
          )}
        </div>
        <h3 className="text-lg font-semibold my-2">Log</h3>
        <pre className="whitespace-pre-line border rounded-md border-gray-500 px-2 py-1">
          {log}
        </pre>
        <h3 className="text-lg font-semibold mt-2">PCD</h3>
        <pre className="whitespace-pre-line border rounded-md border-gray-500 px-2 py-1">
          {pcdStr}
        </pre>

        <button
          onClick={() => litActionTest('naaamo')}
          className="border rounded border-gray-400 px-4 py-2 font-medium text-md"
        >
          Lit Action Test
        </button>
        <button
          onClick={executeLitActionCodeTest}
          className="border rounded border-gray-400 px-4 py-2 font-medium text-md"
        >
          Execute Lit Action Code Test
        </button>
        <button
          onClick={litDecryptAkashaBeams}
          className="border rounded border-gray-400 px-4 py-2 font-medium text-md"
          disabled={!pcdStr}
        >
          Decrypt Akasha Beams
        </button>
        <button
          onClick={connectionTest}
          className="border rounded border-gray-400 px-4 py-2 font-medium text-md"
        >
          Connection Test
        </button>
      </div>
    </main>
  );
}
