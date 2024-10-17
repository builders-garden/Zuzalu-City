import akashaSdk from '../akasha';
import { ZulandCreateAppReleaseInput } from '../akasha.d';

export async function createAppRelease(params: ZulandCreateAppReleaseInput) {
  const createAppReleaseResult =
    await akashaSdk.services.gql.client.SetAppRelease(
      {
        i: {
          content: {
            applicationID: params.applicationID,
            source: params.source,
            version: params.version,
            createdAt: new Date().toISOString(),
          },
        },
      },
      {
        context: { source: akashaSdk.services.gql.contextSources.composeDB },
      },
    );
  return createAppReleaseResult.setAkashaAppRelease;
}
