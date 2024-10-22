export const litActionDecryptAndCombine = `(async () => {
  const resp = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });

  Lit.Actions.setResponse({ response: resp });
})();`;

export const verifyZuPassAndDecrypt = async () => {
  const url = `https://${baseUrl}//api/zupass`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pcd: pcdStr,
    }),
  });
  const verificationResultData = await resp.json();
  if (
    verificationResultData.status === 'ok' &&
    verificationResultData.data.isVerified
  ) {
    const decryptedContent = await Lit.Actions.decryptAndCombine({
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig: null,
      chain: 'ethereum',
    });
    LitActions.setResponse({
      response: JSON.stringify({
        verified: true,
        message: 'The PCD is verified!',
        decryptedContent,
      }),
    });
  } else {
    LitActions.setResponse({
      response: JSON.stringify({
        verified: false,
        message: 'The PCD is not verified!',
      }),
    });
  }
};

export const verifyZuPassPCDCode = `(${verifyZuPassAndDecrypt.toString()})();`;

export const verifyZuPassPCD = async (pcdStr, baseUrl) => {
  const url = `https://${baseUrl}/api/zupass`;
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pcd: pcdStr,
      }),
    });
    const verificationResultData = await resp.json();
    if (
      verificationResultData.status === 'ok' &&
      verificationResultData.data.isVerified
    ) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
  return false;
};
