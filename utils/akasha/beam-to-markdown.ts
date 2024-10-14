import { AkashaReadableBeam } from '@/utils/akasha';
import { AkashaContentBlock } from '@akashaorg/typings/lib/sdk/graphql-types-new';

/**
 * Utility to convert Akasha Beam JSON to Markdown
 */
export interface Post {
  id: string;
  title: string;
  body: string;
  author: {
    id: string;
  };
  tags?: string[];
  createdAt: string;
  applicationID: string;
  eventId: string;
  likes?: number;
  replies?: number;
}

export const akashaBeamToMarkdown = (
  beams: AkashaReadableBeam[],
  eventId: string,
): Post[] => {
  if (!beams || beams.length === 0) {
    return [];
  }

  const posts: Post[] = [];

  for (const beam of beams) {
    const { title, body } = processBeam(beam);
    posts.push({
      id: beam.id,
      title: title,
      body: body,
      author: {
        id: `${beam.id}-author`,
      },
      createdAt: beam.createdAt,
      applicationID: beam.appID,
      eventId: eventId,
      likes: 0,
      replies: 0,
    });
  }

  return posts;
};

const processBeam = (
  beam: AkashaReadableBeam,
): { title: string; body: string } => {
  let beamMarkdown = '';
  let beamTitle = '';
  for (const block of beam.content) {
    const { title, body } = processContentBlock(block);
    beamMarkdown += body;
    beamTitle = title;
  }

  return { title: beamTitle, body: beamMarkdown.trim() };
};

const processContentBlock = (
  block: AkashaContentBlock,
): { title: string; body: string } => {
  let blockMarkdown = '';
  let blockTitle = '';

  for (const contentItem of block.content) {
    let isTitle = contentItem.label === 'beam-title';
    switch (contentItem.propertyType) {
      case 'slate-block':
        for (const slateBlock of contentItem.value) {
          if (isTitle) {
            blockTitle = (
              slateBlock as unknown as {
                children: { text: string }[];
              }
            ).children[0].text;
            isTitle = false;
          }
          blockMarkdown += processSlateBlock(slateBlock);
        }
        break;
    }
  }

  return { title: blockTitle, body: blockMarkdown };
};

const processSlateBlock = (blockLabeledValue: any): string => {
  let blockMarkdown = '';
  switch (blockLabeledValue.type) {
    case 'paragraph':
      blockMarkdown +=
        processParagraph(blockLabeledValue.children, blockLabeledValue.align) +
        '\n\n';
      break;
    case 'numbered-list':
      blockMarkdown += processNumberedList(blockLabeledValue.children) + '\n';
      break;
    case 'bulleted-list':
      blockMarkdown += processBulletedList(blockLabeledValue.children) + '\n';
      break;
  }

  return blockMarkdown;
};

const processParagraph = (
  node: {
    text: string;
    children?: any[];
    align?: string;
  }[],
  align?: string,
): string => {
  let text = '';
  for (const child of node) {
    switch (align) {
      case 'center':
        text =
          '<p style="text-align: center">' + processTextNode(child) + '</p>';
        break;
      case 'right':
        text =
          '<p style="text-align: right">' + processTextNode(child) + '</p>';
        break;
      default:
        text = processTextNode(child);
    }
    if (child.children) {
      for (const children of child.children) {
        text += processTextNode(children);
      }
    }
  }
  return text;
};

const processTextNode = (node: {
  text: string;
  bold?: string;
  italic?: string;
  underline?: string;
}): string => {
  let text = node.text;
  if (node.bold) text = `**${text}**`;
  if (node.italic) text = `*${text}*`;
  if (node.underline) text = `<ins>${text}</ins>`;
  return text;
};

const processNumberedList = (
  node:
    | {
        type: string;
        children: { type: string; children: { text: string }[] }[];
      }[]
    | null,
): string => {
  if (!node) {
    return '';
  }
  let markdown = '';
  node.forEach((item: any) => {
    if (item.children.length > 0) {
      item.children.forEach((child: any, i: number) => {
        markdown += `${i + 1}. ${child.text}\n`;
      });
    }
  });
  return markdown;
};

const processBulletedList = (
  node:
    | {
        type: string;
        children: { type: string; children: { text: string }[] }[];
      }[]
    | null,
): string => {
  if (!node) {
    return '';
  }
  let markdown = '';
  node.forEach((item: any) => {
    if (item.children.length > 0) {
      item.children.forEach((child: any) => {
        markdown += `- ${child.text}\n`;
      });
    }
  });
  return markdown;
};

// ... existing code ...