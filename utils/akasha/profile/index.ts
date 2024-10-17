import { AkashaProfile } from '@akashaorg/typings/lib/ui';
import akashaSdk from '../akasha';
import { ZulandProfileInput } from '../akasha.d';
import { SetOptionsInput } from '@akashaorg/typings/lib/sdk/graphql-types-new';

export async function getProfileByDid(did: string): Promise<{
  akashaProfile: AkashaProfile;
  isViewer: boolean;
} | null> {
  const profile = await akashaSdk.services.gql.client.GetProfileByDid({
    id: did,
  });
  if (JSON.stringify(profile.node) === '{}' || profile.node === undefined) {
    return null;
  }
  return profile?.node as {
    akashaProfile: AkashaProfile;
    isViewer: boolean;
  };
}

/**
 * Get the user profile using the SDK context
 */
export async function getUserProfile() {
  const profile = await akashaSdk.services.gql.client.GetMyProfile();
  return profile;
}

export async function getProfileById(id: string) {
  const profile = await akashaSdk.services.gql.client.GetProfileByID({
    id,
  });
  return profile;
}

export async function getProfileStatsByDid(did: string) {
  const profileStats = await akashaSdk.services.gql.client.GetProfileStatsByDid(
    {
      id: did,
    },
  );
  return profileStats.node;
}

// TODO: make this function dynamic getting the appID and appVersionID from the SDK
export async function createProfile(
  profile: ZulandProfileInput,
  clientMutationId?: string,
  options?: SetOptionsInput,
) {
  const createProfileResponse =
    await akashaSdk.services.gql.client.CreateProfile(
      {
        i: {
          clientMutationId: clientMutationId,
          content: {
            appID:
              'k2t6wzhkhabz5htw8tav1jfb23gh2svpnlrdogwsx7713ce4x86g6ome3lqlel',
            appVersionID:
              'k2t6wzhkhabz19k3ik14jzmon7wnexx6h97nc6hz83vlfegv0iuftjlzfrzkv8',
            createdAt: new Date().toISOString(),
            ...profile,
          },
          options: options,
        },
      },
      {
        context: { source: akashaSdk.services.gql.contextSources.composeDB },
      },
    );

  return createProfileResponse.setAkashaProfile;
}
