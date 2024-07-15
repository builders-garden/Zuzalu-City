import * as React from 'react';
import { Alert, Box, Snackbar, Stack, Typography } from '@mui/material';
import { ZuButton } from 'components/core';
import { EventIcon, LockIcon, MapIcon } from 'components/icons';
import { useCeramicContext } from '@/context/CeramicContext';
import { CeramicResponseType, Event, EventEdge } from '@/types';
import { useParams } from 'next/navigation';
import { convertDateStringFormat } from '@/utils';
import Link from 'next/link';
import CopyToClipboard from 'react-copy-to-clipboard';
import TextEditor from '@/components/editor/editor';

interface PropTypes {
  eventData?: Event;
}

const OverviewDetail = ({ eventData }: PropTypes) => {
  const params = useParams();
  const eventId = params.eventid.toString();

  // const [eventData, setEventData] = React.useState<Event>();
  // const { composeClient } = useCeramicContext();

  // const getEventDetailInfo = async () => {
  //   try {
  //     const response: CeramicResponseType<EventEdge> =
  //       (await composeClient.executeQuery(
  //         `
  //       query MyQuery ($id: ID!) {
  //         node (id: $id) {
  //           ...on Event {
  //             id
  //             title
  //             description
  //             status
  //             endTime
  //             spaceId
  //             tagline
  //             timezone
  //             createdAt
  //             image_url
  //             profileId
  //             startTime
  //             description
  //             meeting_url
  //             external_url
  //             max_participant
  //             space {
  //               name
  //               gated
  //               avatar
  //             }
  //           }
  //         }
  //       }
  //     `,
  //         {
  //           id: eventId,
  //         },
  //       )) as CeramicResponseType<EventEdge>;

  //     if (response.data) {
  //       if (response.data.node) {
  //         setEventData(response.data.node);
  //       }
  //     }
  //   } catch (err) {
  //     console.log('Failed to fetch event: ', err);
  //   }
  // };

  // React.useEffect(() => {
  //   getEventDetailInfo();
  // }, []);
  const [showCopyToast, setShowCopyToast] = React.useState(false);

  return eventData ? (
    <Stack
      marginY={4}
      padding={2}
      direction="row"
      spacing={2}
      bgcolor="#283734"
      borderRadius={3}
    >
      <Box
        component="img"
        src={eventData.image_url ? eventData.image_url : '/12.webp'}
        borderRadius={3}
        height={450}
        width={450}
      />
      <Stack direction="column" flex={1} spacing={2}>
        <Stack direction="row" spacing={2}>
          <ZuButton sx={{ backgroundColor: '#2F4541', flex: 1 }}>
            Edit Event Details
          </ZuButton>
          <Link href={'/events/' + eventId}>
            <ZuButton sx={{ backgroundColor: '#2F4541', flex: 1 }}>
              View Event
            </ZuButton>
          </Link>
          <CopyToClipboard
            text={`${window.origin}/events/${eventId}`}
            onCopy={() => {
              setShowCopyToast(true);
            }}
          >
            <ZuButton sx={{ backgroundColor: '#2F4541', flex: 1 }}>
              Share Event
              <Snackbar
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                open={showCopyToast}
                autoHideDuration={800}
                onClose={() => {
                  setShowCopyToast(false);
                }}
              >
                <Alert severity="success" variant="filled">
                  Copy share link to clipboard
                </Alert>
              </Snackbar>
            </ZuButton>
          </CopyToClipboard>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" color="white">
            BY:
          </Typography>
          <Box
            component="img"
            src={eventData.space?.avatar}
            height={18}
            width={18}
            borderRadius={40}
          />
          <Typography variant="bodyS" color="white">
            {eventData.space && eventData.space.name}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          {/* <EventIcon /> */}
          <Typography variant="bodyM" color="white">
            {convertDateStringFormat(eventData.startTime)} -{' '}
            {convertDateStringFormat(eventData.endTime)}
          </Typography>
        </Stack>
        <Typography variant="subtitleLB" color="white">
          {eventData.title}
        </Typography>
        <TextEditor
          holder="event-detail-editor"
          readonly={true}
          value={JSON.parse(eventData.description.replaceAll('\\"', '"'))}
          sx={{
            fontFamily: 'Inter',
            color: 'white',
            fontSize: '14px',
            borderRadius: '10px',
            height: 'auto',
            overflow: 'auto',
            padding: '0px',
            '& > div > div': {
              paddingBottom: '0px !important',
            },
            '& .ce-block__content': {
              maxWidth: '100% !important', // Adjust the margin value as needed
            },
          }}
        />
        {eventData.timezone && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <MapIcon size={4} />
            <Typography variant="caption" color="white">
              {eventData.timezone}
            </Typography>
          </Stack>
        )}
        {eventData.status && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <MapIcon size={4} />
            <Typography variant="caption" color="white">
              {eventData.status}
            </Typography>
          </Stack>
        )}
        {eventData.space && eventData.space.gated && (
          <ZuButton
            startIcon={<LockIcon size={4} />}
            sx={{ backgroundColor: '#2F4541', maxWidth: '20%' }}
          >
            GATED
          </ZuButton>
        )}
      </Stack>
    </Stack>
  ) : (
    <></>
  );
};

export default OverviewDetail;
