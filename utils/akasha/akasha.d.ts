import {
  AkashaApp,
  AkashaAppReleaseInterface,
  CeramicAccount,
  BeamEmbeddedType,
  AkashaReflectInterfaceConnection,
  BeamLabeled,
  AkashaContentBlock,
  ProfileImageSourceInput,
  AkashaContentBlockBlockDef,
  BlockLabeledValue,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { AkashaProfile } from '@akashaorg/typings/lib/ui';

export type BeamsByAuthorDid = {
  akashaBeamListCount: number;
  isViewer: boolean;
  akashaBeamList: {
    edges: Array<{
      cursor: string;
      node: {
        id: string;
        reflectionsCount: number;
        active: boolean;
        version: any;
        createdAt: any;
        nsfw: boolean | null;
        appVersionID: any;
        appID: any;
        embeddedStream: {
          label: string;
          embeddedID: any;
        } | null;
        author: {
          id: string;
          isViewer: boolean;
        };
        content: AkashaContentBlock[];
        tags: Array<{
          labelType: string;
          value: string;
        } | null> | null;
        mentions: Array<{
          id: string;
        } | null> | null;
        reflections: {
          edges: Array<{
            cursor: string;
          } | null> | null;
          pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string | null;
            endCursor: string | null;
          };
        };
      } | null;
    } | null> | null;
    pageInfo: {
      startCursor: string | null;
      endCursor: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  } | null;
};

export type ZulandReadableBeam = {
  active: boolean;
  app?: AkashaApp;
  appID: string;
  appVersion?: AkashaAppReleaseInterface;
  appVersionID: string;
  /** Account controlling the document */
  author: {
    akashaProfile: AkashaProfile;
    isViewer: boolean;
  };
  createdAt: string;
  embeddedStream?: BeamEmbeddedType;
  id: string;
  mentions?: Array<CeramicAccount>;
  nsfw?: boolean;
  reflections: AkashaReflectInterfaceConnection;
  reflectionsCount: number;
  tags?: Array<BeamLabeled>;
  /** Current version of the document */
  version: string;
  content: ZulandReadbleBlock[];
};

export type ZulandReadbleBlock = {
  active: boolean;
  appVersion?: AkashaAppReleaseInterface;
  appVersionID: string;
  /** Account controlling the document */
  author: CeramicAccount;
  content: ZulandReadableBlockContent[];
  createdAt: string;
  id: string;
  kind?: AkashaContentBlockBlockDef;
  nsfw?: string;
  /** Current version of the document */
  version: string;
  order: number;
};

export type ZulandProfileInput = {
  avatar?: {
    default: ProfileImageSourceInput;
    alternatives?: Array<ProfileImageSourceInput>;
  };
  description?: string;
  name: string;
  links?: Array<{ href: string; url: string }>;
};

export type ZulandCreateAppInput = {
  eventID: string;
  displayName: string;
  description: string;
  license?: string;
};

export type ZulandCreateAppReleaseInput = {
  applicationID: string;
  version: string;
  source: string;
};

export type ZulandReadableReflectionResult = {
  reflections: {
    edges: {
      node: ZulandReadableReflection;
      cursor: string;
    }[];
    pageInfo: {
      startCursor?: string | null;
      endCursor?: string | null;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  };
  reflectionsCount: number;
};

export type ZulandReadableReflection = {
  content: ZulandReadableBlockContent[];
  id: string;
  version: any;
  active: boolean;
  isReply?: boolean | null;
  reflection?: any | null;
  createdAt: any;
  nsfw?: boolean | null;
  author: {
    akashaProfile: AkashaProfile;
    isViewer: boolean;
  };
  // author: {
  //   id: string;
  //   isViewer: boolean;
  // };
  beam?: {
    id: string;
    author: {
      id: string;
      isViewer: boolean;
    };
  };
};

export type AkashaReadableSlateBlockContent = {
  type: 'paragraph';
  children: {
    text: string;
    align?: string;
    italic?: boolean;
    bold?: boolean;
    // TODO: add here more properties if available
  }[];
};

export type AkashaReadableImageBlockContent = {
  images: {
    src: string;
    size: {
      width: number;
      height: number;
    };
    name: string;
  }[];
  caption?: string;
  align?: string;
};

export type ZulandReadableBlockContent =
  | {
      label: string;
      propertyType: 'slate-block';
      value: AkashaReadableSlateBlockContent[];
    }
  | {
      label: string;
      propertyType: 'image-block';
      value: AkashaReadableImageBlockContent;
    }
  | BlockLabeledValue;
// | {
//     label: string;
//     propertyType: string;
//     value: string;
//   }
