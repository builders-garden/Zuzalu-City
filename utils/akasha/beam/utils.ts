import {
  AkashaAppRelease,
  AkashaBeam,
  AkashaBeamEdge,
  AkashaContentBlock,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import akashaSdk from '../akasha';
import { decodeb64SlateContent } from '../akasha-utils';
import { getProfileByDid } from '../profile';
import { ZulandReadableBeam, ZulandReadbleBlock } from '../akasha.d';
import { AccessControlCondition } from '@/utils/lit/types';
import { ZulandLit } from '@/utils/lit';

export async function extractBeamReadableContent(
  beam: AkashaBeam,
): Promise<ZulandReadableBeam> {
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
              switch (content.propertyType) {
                case 'slate-block':
                  return {
                    ...content,
                    value: decodeb64SlateContent(content.value),
                  };
                case 'image-block':
                  return {
                    ...content,
                    value: JSON.parse(content.value),
                  };
                default:
                  return content;
              }
            }),
            order: contentBlock.order,
          } as unknown as ZulandReadbleBlock;
        }
        return null;
      }),
    ),
    author: await getProfileByDid(beam.author.id),
  };
  return readableBeam as ZulandReadableBeam;
}

export async function extractDecryptedBeamReadableContent(
  beam: AkashaBeam,
  appReleases: {
    id: string;
    createdAt: any;
    source: any;
    version: string;
    meta?: Array<{
      property: string;
      provider: string;
      value: string;
    } | null> | null;
  }[],
): Promise<ZulandReadableBeam> {
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
            content: await Promise.all(
              encodedBlock.content.map(async (content) => {
                let decryptedContent = content.value;
                const blockAppRelease = appReleases.find(
                  (appRelease) => appRelease.id === encodedBlock.appVersionID,
                );
                if (blockAppRelease) {
                  try {
                    const ticketRequirements =
                      blockAppRelease?.meta?.find(
                        (meta) => meta?.property === 'TEXT#ENCRYPTED',
                      ) ?? null;
                    if (ticketRequirements) {
                      const litAcc: AccessControlCondition = JSON.parse(
                        ticketRequirements.value,
                      );
                      const zulandLit = new ZulandLit(litAcc.chain);
                      const { ciphertext, dataToEncryptHash } = JSON.parse(
                        content.value,
                      ) as {
                        ciphertext: string;
                        dataToEncryptHash: string;
                      };
                      decryptedContent = await zulandLit.decryptString(
                        ciphertext,
                        dataToEncryptHash,
                        [litAcc],
                      );
                      await zulandLit.disconnect();
                    }
                  } catch (error) {
                    console.warn(
                      'Block content with unknown format, ignoring:',
                      error,
                    );
                    throw new Error('Block content with unknown format');
                  }
                }
                switch (content.propertyType) {
                  case 'slate-block':
                    return {
                      ...content,
                      value: decodeb64SlateContent(decryptedContent),
                    };
                  case 'image-block':
                    return {
                      ...content,
                      value: JSON.parse(decryptedContent),
                    };
                  default:
                    return content;
                }
              }),
            ),
            order: contentBlock.order,
          } as unknown as ZulandReadbleBlock;
        }
        return null;
      }),
    ),
    author: await getProfileByDid(beam.author.id),
  };
  return readableBeam as ZulandReadableBeam;
}

export async function extractBlocksFromBeam(beam: AkashaBeamEdge) {
  const beamBlocksContent: AkashaContentBlock[] | undefined = [];

  beam.node?.content.map(async (beamBlock) => {
    const contentBlock =
      await akashaSdk.services.gql.client.GetContentBlockById({
        id: beamBlock.blockID,
      });

    if (contentBlock.node && JSON.stringify(contentBlock.node) !== '{}') {
      beamBlocksContent.push(contentBlock.node as AkashaContentBlock);
    }
  });

  return beamBlocksContent;
}

export function extractBlocksFromBeams(beams: AkashaBeamEdge[]) {
  const beamsContent:
    | {
        [x: string]: AkashaContentBlock[];
      }[]
    | undefined = [];

  beams.map(async (beam) => {
    if (beam.node?.id) {
      beamsContent.push({
        [beam.node?.id]: await extractBlocksFromBeam(beam),
      });
    }
  });

  return beamsContent;
}

export async function extractBeamsReadableContent(
  beams: AkashaBeam[],
): Promise<ZulandReadableBeam[]> {
  const readableBeams = await Promise.all(
    beams.map(async (beam) => extractBeamReadableContent(beam)),
  );
  return readableBeams as ZulandReadableBeam[];
}
