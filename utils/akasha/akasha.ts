import getSDK from '@akashaorg/core-sdk';
import {
  AkashaBeam,
  AkashaBeamEdge,
  AkashaBeamFiltersInput,
  AkashaBeamInput,
  AkashaBeamSortingInput,
  AkashaContentBlock,
  AkashaContentBlockInput,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  AkashaReadableBeam,
  BeamsByAuthorDid,
  decodeb64SlateContent,
} from '@/utils/akasha';
import { nodeServerAppPaths } from 'next/dist/build/webpack/plugins/pages-manifest-plugin';

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
    active: beam.active,
    appID: beam.appID,
    appVersionID: beam.appVersionID,
    createdAt: beam.createdAt,
    id: beam.id,
    reflectionsCount: beam.reflectionsCount,
    version: beam.version,
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

export default akashaSdk;
