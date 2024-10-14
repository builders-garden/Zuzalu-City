import {
  AkashaApp,
  AkashaAppReleaseInterface,
  CeramicAccount,
  BeamEmbeddedType,
  AkashaReflectInterfaceConnection,
  BeamLabeled,
  BeamBlockRecord,
  AkashaContentBlock,
  ProfileImageSourceInput,
} from '@akashaorg/typings/lib/sdk/graphql-types-new';

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

export type AkashaReadableBeam = {
  active: boolean;
  app?: AkashaApp;
  appID: string;
  appVersion?: AkashaAppReleaseInterface;
  appVersionID: string;
  /** Account controlling the document */
  author: CeramicAccount;
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
  content: AkashaContentBlock[];
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

// export type ZulandAuthor = {
//   id: string;
//   name: string;
//   description?: string | null;
//   appID: any;
//   appVersionID: any;
//   createdAt: any;
//   nsfw?: boolean | null;
//   did: {
//     id: string;
//     isViewer: boolean;
//   };
//   links?: Array<{
//     href: any;
//     label?: string | null;
//   } | null> | null;
//   background?: {
//     alternatives?: Array<{
//       src: any;
//       width: number;
//       height: number;
//     } | null> | null;
//     default: {
//       src: any;
//       width: number;
//       height: number;
//     };
//   } | null;
//   avatar?: {
//     default: {
//       src: any;
//       width: number;
//       height: number;
//     };
//     alternatives?: Array<{
//       src: any;
//       width: number;
//       height: number;
//     } | null> | null;
//   } | null;
//   followers: {
//     pageInfo: {
//       startCursor?: string | null;
//       endCursor?: string | null;
//       hasPreviousPage: boolean;
//       hasNextPage: boolean;
//     };
//   };
// };

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
