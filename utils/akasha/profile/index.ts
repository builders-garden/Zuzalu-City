import { AkashaProfile } from '@akashaorg/typings/lib/ui';
import akashaSdk from '../akasha';
import { AkashaProfileStats, ZulandProfileInput } from '../akasha.d';
import { SetOptionsInput } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { getAppByEventId } from '../app';

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
  return profile.viewer?.akashaProfile ?? null;
}

export async function getProfileById(
  id: string,
): Promise<AkashaProfile | null> {
  const profile = await akashaSdk.services.gql.client.GetProfileByID({
    id,
  });
  if (!profile || !profile.node || Object.keys(profile.node).length === 0) {
    return null;
  }
  return profile.node as AkashaProfile;
}

export async function getProfileStatsByDid(
  did: string,
): Promise<AkashaProfileStats | null> {
  const profileStats = await akashaSdk.services.gql.client.GetProfileStatsByDid(
    {
      id: did,
    },
  );
  if (
    !profileStats ||
    !profileStats.node ||
    Object.keys(profileStats.node).length === 0
  ) {
    return null;
  }
  return profileStats.node as AkashaProfileStats;
}

export async function createProfile(
  profile: ZulandProfileInput,
  appID: string,
  appVersionID: string,
  clientMutationId?: string,
  options?: SetOptionsInput,
) {
  const createProfileResponse =
    await akashaSdk.services.gql.client.CreateProfile(
      {
        i: {
          clientMutationId: clientMutationId,
          content: {
            appID,
            appVersionID,
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

export async function createZulandProfile(
  eventId: string,
  profile: ZulandProfileInput,
  clientMutationId?: string,
  options?: SetOptionsInput,
) {
  const zulandApp = await getAppByEventId(eventId);
  if (!zulandApp) {
    throw new Error('App not found for the given event ID');
  }
  const appID = zulandApp.id;
  const appVersionID = zulandApp.releases?.edges?.[0]?.node?.id;
  if (!appVersionID) {
    throw new Error('App version not found for this app');
  }

  const createProfileResponse = await createProfile(
    profile,
    appID,
    appVersionID,
    clientMutationId,
    options,
  );

  return createProfileResponse?.document ?? null;
}
