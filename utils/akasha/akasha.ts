import getSDK from '@akashaorg/core-sdk';
import {
  AkashaAppApplicationType,
  AkashaBeam,
  AkashaBeamEdge,
  AkashaBeamFiltersInput,
  AkashaBeamInput,
  AkashaBeamSortingInput,
  AkashaContentBlock,
  AkashaContentBlockInput,
  AkashaIndexedStreamFiltersInput,
  AkashaIndexedStreamSortingInput,
  AkashaReflectInput,
  CreateOptionsInput,
  SetOptionsInput,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  AkashaReadableBeam,
  BeamsByAuthorDid,
  decodeb64SlateContent,
  ZulandCreateAppInput,
  ZulandCreateAppReleaseInput,
  ZulandProfileInput,
} from '@/utils/akasha';

const akashaSdk = getSDK();

const DEFAULT_BEAMS_TAKE = 10;

export async function getBeams(options?: {
  before?: string;
  after?: string;
  first?: number;
  last?: number;
  filters?: AkashaBeamFiltersInput;
  sorting?: AkashaBeamSortingInput;
}) {
  const beams = await akashaSdk.services.gql.client.GetBeams({
    first: DEFAULT_BEAMS_TAKE,
    ...options,
  });
  return beams.akashaBeamIndex;
}

export async function getBeamById(id: string) {
  const beam = await akashaSdk.services.gql.client.GetBeamById({
    id,
  });
  return await extractBeamReadableContent(beam.node as AkashaBeam);
}

export function extractBlocksFromBeam(beam: AkashaBeamEdge) {
  const beamBlocksContent: AkashaContentBlock[] | undefined = [];

  beam.node?.content.map((beamBlock) => {
    akashaSdk.services.gql.client
      .GetContentBlockById({
        id: beamBlock.blockID,
      })
      .then((block) => {
        block.node &&
          JSON.stringify(block.node) != '{}' &&
          beamBlocksContent.push(block.node as AkashaContentBlock);
      });
  });

  return beamBlocksContent;
}

export function extractBlocksFromBeams(beams: AkashaBeamEdge[]) {
  const beamsContent:
    | {
        [x: string]: AkashaContentBlock[];
      }[]
    | undefined = [];

  beams.map((beam) => {
    if (beam.node?.id) {
      beamsContent.push({
        [beam.node?.id]: extractBlocksFromBeam(beam),
      });
    }
  });

  return beamsContent;
}

export async function createBlockContent(block: AkashaContentBlockInput) {
  const createAkashaContentBlockResponse =
    await akashaSdk.services.gql.client.CreateContentBlock(
      {
        i: {
          content: block,
        },
      },
      {
        context: { source: akashaSdk.services.gql.contextSources.composeDB },
      },
    );

  return createAkashaContentBlockResponse?.createAkashaContentBlock ?? null;
}

export async function createBeam(beam: AkashaBeamInput) {
  const createAkashaBeamResponse =
    await akashaSdk.services.gql.client.CreateBeam(
      {
        i: {
          content: beam,
        },
      },
      {
        context: { source: akashaSdk.services.gql.contextSources.composeDB },
      },
    );

  return createAkashaBeamResponse?.createAkashaBeam ?? null;
}

export async function createBeamFromBlocks(params: {
  appID: string;
  appVersionID: string;
  active: boolean;
  blocks: AkashaContentBlockInput[];
}) {
  // step 1: create the blocks
  console.log('creating blocks before Beam creation...');
  const blockCreationResults = await Promise.all(
    params.blocks.map(createBlockContent),
  );
  console.log("Beam's blocks created");

  // step 2: create the beam
  const beamContent = blockCreationResults.map((block, index) => ({
    blockID: block?.document?.id,
    order: index,
  }));
  console.log('Creating beam...');
  const beamToCreate: AkashaBeamInput = {
    active: params.active,
    appID: params.appID,
    appVersionID: params.appVersionID,
    createdAt: new Date().toISOString(),
    content: beamContent,
  };
  const beam = await createBeam(beamToCreate);
  console.log('Beam created');
  return beam;
}

export async function getRawBeamsByAuthorDid(
  did: string,
  options?: {
    before?: string;
    after?: string;
    first?: number;
    last?: number;
    filters?: AkashaBeamFiltersInput;
    sorting?: AkashaBeamSortingInput;
  },
): Promise<BeamsByAuthorDid | null> {
  const beams = await akashaSdk.services.gql.client.GetBeamsByAuthorDid(
    {
      id: did,
      first: DEFAULT_BEAMS_TAKE,
      ...options,
    },
    {
      context: { source: akashaSdk.services.gql.contextSources.composeDB },
    },
  );
  if (JSON.stringify(beams.node) === '{}') {
    return null;
  }
  return beams.node as BeamsByAuthorDid | null;
}

export async function getReadableBeamsByAuthorDid(
  did: string,
  options?: {
    before?: string;
    after?: string;
    first?: number;
    last?: number;
    filters?: AkashaBeamFiltersInput;
    sorting?: AkashaBeamSortingInput;
  },
): Promise<BeamsByAuthorDid | null> {
  const beams = await getRawBeamsByAuthorDid(did, options);
  if (!beams) {
    return null;
  }
  const akashaBeamList = beams?.akashaBeamList ? beams.akashaBeamList : null;
  if (!akashaBeamList) {
    return null;
  }
  return {
    ...beams,
    akashaBeamList: {
      pageInfo: akashaBeamList.pageInfo,
      edges: akashaBeamList.edges
        ? ((await Promise.all(
            akashaBeamList.edges.map(async (edge) => {
              if (edge) {
                return {
                  cursor: edge.cursor,
                  node: await extractBeamReadableContent(
                    edge.node as unknown as AkashaBeam,
                  ),
                };
              }
              return null;
            }),
          )) as any)
        : null,
    },
  };
}

export async function extractBeamReadableContent(
  beam: AkashaBeam,
): Promise<AkashaReadableBeam> {
  const readableBeam = {
    ...beam,
    content: await Promise.all(
      beam.content.map(async (contentBlock) => {
        const block = await akashaSdk.services.gql.client.GetContentBlockById({
          id: contentBlock.blockID,
        });
        if (block.node && JSON.stringify(block.node) !== '{}') {
          const encodedBlock = block.node as AkashaContentBlock;
          return {
            ...encodedBlock,
            content: encodedBlock.content.map((content) => {
              return {
                ...content,
                value: decodeb64SlateContent(content.value),
              };
            }),
          };
        }
        return null;
      }),
    ),
    author: await getProfileByDid(beam.author.id),
  };
  return readableBeam as AkashaReadableBeam;
}

export async function extractBeamsReadableContent(
  beams: AkashaBeam[],
): Promise<AkashaReadableBeam[]> {
  const readableBeams = await Promise.all(
    beams.map(async (beam) => extractBeamReadableContent(beam)),
  );
  return readableBeams as AkashaReadableBeam[];
}

export async function createReflection(
  reflection: AkashaReflectInput,
  clientMutationId?: string,
  options?: CreateOptionsInput,
) {
  const createAkashaReflectionResponse =
    await akashaSdk.services.gql.client.CreateReflect(
      {
        i: {
          clientMutationId,
          content: reflection,
          options,
        },
      },
      {
        context: { source: akashaSdk.services.gql.contextSources.composeDB },
      },
    );

  return createAkashaReflectionResponse?.createAkashaReflect ?? null;
}

export async function getReadableReflectionsByBeamId(beamId: string) {
  const reflections =
    await akashaSdk.services.gql.client.GetReflectionsFromBeam(
      {
        id: beamId,
        first: DEFAULT_BEAMS_TAKE,
      },
      {
        context: { source: akashaSdk.services.gql.contextSources.composeDB },
      },
    );

  if (!reflections.node) {
    return null;
  }

  if (Object.keys(reflections.node).length === 0) {
    return null; // or return an empty array, depending on your preference
  }

  const unreadableReflections = reflections.node as {
    reflectionsCount: number;
    reflections: {
      edges?: Array<{
        cursor: string;
        node?: {
          id: string;
          version: any;
          active: boolean;
          isReply?: boolean | null;
          reflection?: any | null;
          createdAt: any;
          nsfw?: boolean | null;
          author: {
            id: string;
            isViewer: boolean;
          };
          content: Array<{
            label: string;
            propertyType: string;
            value: string;
          }>;
          beam?: {
            id: string;
            author: {
              id: string;
              isViewer: boolean;
            };
          } | null;
        } | null;
      } | null> | null;
      pageInfo: {
        startCursor?: string | null;
        endCursor?: string | null;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      };
    };
  };

  if (!unreadableReflections.reflections.edges) {
    return null;
  }

  const readableReflections = await Promise.all(
    unreadableReflections.reflections.edges?.map(
      async (
        edge: {
          cursor: string;
          node?: {
            id: string;
            version: any;
            active: boolean;
            isReply?: boolean | null;
            reflection?: any | null;
            createdAt: any;
            nsfw?: boolean | null;
            author: {
              id: string;
              isViewer: boolean;
            };
            content: Array<{
              label: string;
              propertyType: string;
              value: string;
            }>;
            beam?: {
              id: string;
              author: {
                id: string;
                isViewer: boolean;
              };
            } | null;
          } | null;
        } | null,
      ) => {
        if (!edge?.node) {
          return null;
        }
        const reflection = edge.node;
        return {
          ...edge,
          node: {
            ...reflection,
            content: reflection.content.map(
              (content: {
                label: string;
                propertyType: string;
                value: string;
              }) => {
                return {
                  ...content,
                  value: decodeb64SlateContent(content.value),
                };
              },
            ),
          },
        };
      },
    ),
  );
  return {
    ...unreadableReflections,
    reflections: {
      ...unreadableReflections.reflections,
      edges: readableReflections,
    },
  };
}

export async function createApp(params: ZulandCreateAppInput) {
  const createAppResult = await akashaSdk.services.gql.client.CreateApp(
    {
      i: {
        content: {
          name: `@buildersgarden/zuland/${params.eventID}`,
          description: params.description,
          displayName: params.displayName,
          license: params.license || 'MIT',
          createdAt: new Date().toISOString(),
          applicationType: AkashaAppApplicationType.App,
        },
      },
    },
    {
      context: { source: akashaSdk.services.gql.contextSources.composeDB },
    },
  );
  return createAppResult.setAkashaApp;
}

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

export async function getAppByEventId(eventId: string) {
  const app = await akashaSdk.services.gql.client.GetApps({
    first: 1,
    filters: {
      where: {
        name: {
          equalTo: `@buildersgarden/zuland-${eventId}`,
          // equalTo: `@buildersgarden/zuland-tests`,
        },
      },
    },
  });
  return app.akashaAppIndex?.edges?.[0]?.node;
}

export async function getAkashaStreams(params: {
  indexer: string;
  after?: string;
  before?: string;
  first?: number;
  last?: number;
  filters?: AkashaIndexedStreamFiltersInput;
  sorting?: AkashaIndexedStreamSortingInput;
}) {
  const indexedStream = await akashaSdk.services.gql.client.GetIndexedStream({
    first: DEFAULT_BEAMS_TAKE,
    sorting: { createdAt: SortOrder.Desc },
    ...params,
  });
  console.log('indexedStream', indexedStream);

  const beamStream = await akashaSdk.services.gql.client.GetBeamStream({
    first: DEFAULT_BEAMS_TAKE,
    sorting: { createdAt: SortOrder.Desc },
    indexer: params.indexer,
  });
  console.log('beamStream', beamStream);

  const profileStream = await akashaSdk.services.gql.client.GetBeamStream({
    first: DEFAULT_BEAMS_TAKE,
    sorting: { createdAt: SortOrder.Desc },
    indexer: params.indexer,
  });
  console.log('profileStream', profileStream);

  const appStream = await akashaSdk.services.gql.client.GetAppsStream({
    first: DEFAULT_BEAMS_TAKE,
    sorting: { createdAt: SortOrder.Desc },
    indexer: params.indexer,
  });
  console.log('appStream', appStream);

  const interestStream = await akashaSdk.services.gql.client.GetInterestsStream(
    {
      first: DEFAULT_BEAMS_TAKE,
      sorting: { createdAt: SortOrder.Desc },
      indexer: params.indexer,
    },
  );
  console.log('interestStream', interestStream);

  // const indexProfile = await akashaSdk.services.gql.client.IndexProfile();
  // console.log('indexProfile', indexProfile);

  return {
    indexedStream: indexedStream.node,
    beamStream: beamStream.node,
    profileStream: profileStream.node,
    appStream: appStream.node,
    interestStream: interestStream.node,
    // indexProfile: indexProfile.indexProfile,
  };
}

/**
 * Get the user profile using the SDK context
 */
export async function getUserProfile() {
  const profile = await akashaSdk.services.gql.client.GetMyProfile();
  return profile;
}

export async function getProfileByDid(did: string) {
  const profile = await akashaSdk.services.gql.client.GetProfileByDid({
    id: did,
  });
  if (JSON.stringify(profile.node) === '{}' || profile.node === undefined) {
    return null;
  }
  return profile?.node;
}

// this function does not accept a DID as input
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

export async function setUserInterests(
  topics: { labelType: string; value: string }[],
) {
  const response = await akashaSdk.services.gql.client.CreateInterests(
    {
      i: {
        content: {
          topics,
        },
      },
    },
    {
      context: { source: akashaSdk.services.gql.contextSources.composeDB },
    },
  );
  return response.setAkashaProfileInterests;
}

export async function getUserInterests() {
  const response = await akashaSdk.services.gql.client.GetInterests();
  return response.akashaProfileInterestsIndex;
}

export async function getProfileInterestsByDid(did: string) {
  const response = await akashaSdk.services.gql.client.GetInterestsByDid({
    id: did,
  });
  return response.node;
}

export default akashaSdk;
