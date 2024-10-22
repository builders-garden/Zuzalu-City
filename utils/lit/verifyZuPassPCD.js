const verifyZuPassPCD = async (pcdStr, baseUrl) => {
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
