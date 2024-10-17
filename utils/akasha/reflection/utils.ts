import {
  AkashaReflectEdge,
  BlockLabeledValue,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { ZulandReadableReflection } from '../akasha.d';
import { getProfileByDid } from '../profile';
import { convertBlockContentToReadableBlock } from '../block/utils';

export async function extractReadableReflections(
  reflections: AkashaReflectEdge[],
): Promise<
  {
    node: ZulandReadableReflection;
    cursor: string;
  }[]
> {
  const readableReflections = await Promise.all(
    reflections.map(async (reflection) => {
      return await extractReadableReflection(reflection);
    }),
  );
  return readableReflections;
}

export async function extractReadableReflection(
  reflection: AkashaReflectEdge,
): Promise<{
  node: ZulandReadableReflection;
  cursor: string;
}> {
  return {
    cursor: reflection.cursor,
    node: reflection.node
      ? {
          ...reflection.node,
          content: reflection.node.content.map((content: BlockLabeledValue) => {
            return convertBlockContentToReadableBlock(content);
          }),
          author:
            (await getProfileByDid(reflection.node.author.id)) ??
            reflection.node.author,
        }
      : null,
  } as {
    node: ZulandReadableReflection;
    cursor: string;
  };
}
