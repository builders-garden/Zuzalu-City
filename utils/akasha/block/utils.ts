import { BlockLabeledValue } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import {
  AkashaReadableImageBlockContent,
  AkashaReadableSlateBlockContent,
  ZulandReadableBlockContent,
} from '../akasha.d';
import { decodeb64SlateContent } from '../akasha-utils';

export function convertBlockContentToReadableBlock(
  block: BlockLabeledValue,
): ZulandReadableBlockContent {
  switch (block.propertyType) {
    case 'slate-block':
      return {
        ...block,
        propertyType: 'slate-block',
        value: decodeb64SlateContent(
          block.value,
        ) as AkashaReadableSlateBlockContent[],
      };
    case 'image-block':
      return {
        ...block,
        propertyType: 'image-block',
        value: JSON.parse(block.value) as AkashaReadableImageBlockContent,
      };
    default:
      return block; // return the block as it is if I don't know how to convert it
  }
}
