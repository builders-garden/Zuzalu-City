import {
  AkashaBeam,
  AkashaBeamFiltersInput,
  AkashaBeamInput,
  AkashaBeamSortingInput,
  AkashaContentBlockInput,
  SortOrder,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import akashaSdk from '../akasha';
import { BeamsByAuthorDid, ZulandReadableBeam } from '../akasha.d';
import {
  extractBeamReadableContent,
  extractBeamsReadableContent,
} from './utils';
import { getAppByEventId } from '../app';
import { createBlockContent } from '../block';

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
    first: options?.first ?? DEFAULT_BEAMS_TAKE,
    last: options?.last,
    before: options?.before,
    after: options?.after,
    sorting: options?.sorting ?? { createdAt: SortOrder.Desc },
    // filters: options?.filters,
  });
  if (beams.akashaBeamIndex === undefined) {
    return null;
  }
  return beams.akashaBeamIndex;
}

export async function getBeamById(id: string): Promise<AkashaBeam | null> {
  const beam = await akashaSdk.services.gql.client.GetBeamById({
    id,
  });
  return (beam.node as AkashaBeam) ?? null;
}

export async function getBeamsByAuthorDid(
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
      first: options?.first ?? DEFAULT_BEAMS_TAKE,
      last: options?.last,
      before: options?.before,
      after: options?.after,
      sorting: options?.sorting ?? { createdAt: SortOrder.Desc },
      // filters: options?.filters,
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
  eventId: string;
  active: boolean;
  blocks: AkashaContentBlockInput[];
}) {
  // step 0: retrieve the app and app version ID from the event ID
  const app = await getAppByEventId(params.eventId);
  if (!app) {
    throw new Error('App not found');
  }
  const appVersionID = app.releases?.edges?.[0]?.node?.id;
  if (!appVersionID) {
    throw new Error(
      'App version not found. An app version is required to create a beam',
    );
  }

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
    appID: app.id,
    appVersionID: appVersionID,
    createdAt: new Date().toISOString(),
    content: beamContent,
  };
  const beam = await createBeam(beamToCreate);
  console.log('Beam created');
  return beam;
}

/***************************************************
 *
 *                READABLE FUNCTIONS
 *
 **************************************************/

export async function getReadableBeams(options?: {
  before?: string;
  after?: string;
  first?: number;
  last?: number;
  filters?: AkashaBeamFiltersInput;
  sorting?: AkashaBeamSortingInput;
}): Promise<ZulandReadableBeam[]> {
  const beams = await getBeams(options);
  if (!beams || !beams.edges) {
    return [];
  }
  return await extractBeamsReadableContent(
    beams.edges.map((beam) => beam?.node) as AkashaBeam[],
  );
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
  const beams = await getBeamsByAuthorDid(did, options);
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

export async function getReadableBeamById(
  id: string,
): Promise<ZulandReadableBeam | null> {
  const beam = await getBeamById(id);
  if (!beam) {
    return null;
  }
  return await extractBeamReadableContent(beam);
}

// TODO: remove this if it's not necessary
export * from './utils';
