'use client';
import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import { Thumbnail, Subbar } from './components';
import { About, Discussions, Sessions } from './tabs';
import { CeramicResponseType, EventEdge, Event } from '@/types';
import { useCeramicContext } from '@/context/CeramicContext';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';

const Home = () => {
  const [tabName, setTabName] = useQueryState('tab', { defaultValue: 'about' });
  const params = useParams();
  const [eventData, setEventData] = useState<Event>();
  const { composeClient, ceramic } = useCeramicContext();
  const [sessionView, setSessionView] = useState<boolean>(false);
  const [discussionsView, setDiscussionsView] = useState<boolean>(true);
  const [verify, setVerify] = useState<boolean>(false);
  const eventId = params.eventid.toString();
  const [urlOption, setUrlOption] = useState<string>('');
  const getEventDetailInfo = async () => {
    try {
      const response: CeramicResponseType<EventEdge> =
        (await composeClient.executeQuery(
          `
        query MyQuery($id: ID!) {
          node (id: $id) {
            ...on ZucityEvent {
              createdAt
              description
              endTime
              externalUrl
              gated
              id
              imageUrl
              meetingUrl
              profileId
              spaceId
              startTime
              status
              tagline
              timezone
              title
              tracks
              contractID
              members{
              id
              }
              admins{
              id
              }
              superAdmin{
              id
              }
              space {
                id
                name
                gated
                avatar
                banner
                description
              }
              profile {
                username
                avatar
              }
              customLinks {
                title
                links
              }
              contracts {
                contractAddress
                description
                image_url
                status
                type
                checkin
              }
            }
          }
        }
      `,
          {
            id: eventId,
          },
        )) as CeramicResponseType<EventEdge>;
      if (response.data) {
        if (response.data.node) {
          setEventData(response.data.node);
          return response.data.node;
        }
      }
    } catch (err) {
      console.log('Failed to fetch event: ', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventDetails = await getEventDetailInfo();
        const admins =
          eventDetails?.admins?.map((admin) => admin.id.toLowerCase()) || [];
        const superadmins =
          eventDetails?.superAdmin?.map((superAdmin) =>
            superAdmin.id.toLowerCase(),
          ) || [];
        const members =
          eventDetails?.members?.map((member) => member.id.toLowerCase()) || [];
        const userDID = ceramic?.did?.parent.toString().toLowerCase() || '';
        if (
          superadmins.includes(userDID) ||
          admins.includes(userDID) ||
          members.includes(userDID)
        ) {
          setSessionView(true);
          setDiscussionsView(true);
        }
        if (sessionStorage.getItem('tab')) {
          sessionStorage.removeItem('tab');
          sessionStorage.removeItem('option');
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [ceramic?.did?.parent, verify]);

  return (
    <Stack color="white">
      <Thumbnail name={eventData?.title} />
      <Subbar
        tabName={tabName}
        setTabName={setTabName}
        canViewSessions={sessionView}
        canViewDiscussions={discussionsView}
      />
      {tabName === 'about' && (
        <About eventData={eventData} setVerify={setVerify} />
      )}
      {tabName === 'sessions' && (
        <Sessions eventData={eventData} option={urlOption} />
      )}
      {tabName === 'discussions' && <Discussions />}
    </Stack>
  );
};

export default Home;
