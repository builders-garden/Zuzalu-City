'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import {
  Stack,
  Box,
  Typography,
  SwipeableDrawer,
  useTheme,
} from '@mui/material';
import { ZuButton } from '@/components/core';
import {
  PlusCircleIcon,
  ArrowUpCircleIcon,
  FireIcon,
  SparklesIcon,
} from '@/components/icons';
import { Event } from '@/types';
import { supabase } from '@/utils/supabase/client';
import { Anchor } from '@/types';
import { LatLngLiteral } from 'leaflet';
import getLatLngFromAddress from '@/utils/osm';
import TopicChip from './TopicChip';
import SortChip from './SortChip';
import PostCard from './PostCard';
import DiscussionDetails from './DiscussionDetails'; // You'll need to create this component
import NewPost from './NewPost';
import {
  AkashaReadableBeam,
  extractBeamsReadableContent,
  getBeams,
} from '@/utils/akasha';
import { AkashaBeam } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-markdown';

interface IDiscussions {
  eventData: Event | undefined;
  setVerify: React.Dispatch<React.SetStateAction<boolean>> | any;
}

const Discussions: React.FC<IDiscussions> = () => {
  const [location, setLocation] = useState<string>('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('HOT');

  const params = useParams();
  const eventId = params.eventid.toString();

  const { breakpoints } = useTheme();

  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const [osm, setOsm] = useState<LatLngLiteral | undefined>({
    lat: 0,
    lng: 0,
  });
  const ref = useRef<HTMLDivElement | null>(null);

  const getLocation = async () => {
    try {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('eventId', eventId);
      if (data !== null) {
        setLocation(data[0].name);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const toggleDrawer = (anchor: Anchor, open: boolean) => {
    setState({ ...state, [anchor]: open });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await getLocation();
      } catch (err) {
        console.log(err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getLatLngFromAddress(location);
      setOsm(res);
    };
    fetchData();
  }, [location]);

  const topics = [
    'Announcements',
    'Question',
    'Meetup',
    'Event',
    'Community information',
    'Coding',
    'Logistics',
    'Q&A',
    'Workshop',
    'Afterparty',
    'Other',
  ];
  const [posts, setPosts] = useState<Post[]>([]);

  const handleTopicClick = (topic: string) => {
    setSelectedTopics((prevTopics) => {
      if (prevTopics.includes(topic)) {
        return prevTopics.filter((t) => t !== topic);
      } else {
        return [...prevTopics, topic];
      }
    });
  };

  const handleSortClick = (sort: string) => {
    if (sort === 'NEW-asc' || sort === 'NEW-desc') {
      const sortedPosts = [...posts].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return selectedSort === 'NEW-desc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
      setPosts(sortedPosts);
    }

    setSelectedSort(sort);
  };

  const searchParams = useSearchParams();
  const discussionId = searchParams.get('discussionId');
  const selectedDiscussion = posts.find((post) => post.id === discussionId);

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  const handleOpenNewPost = () => setIsNewPostOpen(true);
  const handleCloseNewPost = () => setIsNewPostOpen(false);

  // Akasha User Authentication
  // const [userAuth, setUserAuth] = useState<
  //   | ({
  //       id?: string;
  //       ethAddress?: string;
  //     } & {
  //       isNewUser: boolean;
  //     })
  //   | null
  // >(null);
  // useEffect(() => {
  //   if (!userAuth) {
  //     akashaSdk.api.auth
  //       .signIn({
  //         provider: 2,
  //         checkRegistered: false,
  //       })
  //       .then((res) => {
  //         console.log('auth res', res);
  //         setUserAuth(res.data);
  //       });
  //   }
  // }, [userAuth]);

  // const [beamsByAuthor, setBeamsByAuthor] = useState<BeamsByAuthorDid | null>(
  //   null,
  // );
  // const fetchBeamsByAuthorDid = async (id: string) => {
  //   const readableAuthorBeams = await getReadableBeamsByAuthorDid(id);
  //   setBeamsByAuthor(readableAuthorBeams);
  // };
  // useEffect(() => {
  //   if (userAuth?.id) {
  //     fetchBeamsByAuthorDid(userAuth?.id);
  //   }
  // }, [userAuth?.id]);
  // console.log('beamsByAuthor', beamsByAuthor);

  const [beams, setBeams] = useState<Array<AkashaReadableBeam> | null>(null);
  useEffect(() => {
    const fetchBeams = async () => {
      const beams = await getBeams({
        first: 3,
        filters: {
          where: {
            appID: {
              equalTo:
                'k2t6wzhkhabz0onog2r6n2zwtxvfn497xne1eiozqjoqnxigqvizhvwgz5dykh',
            },
          },
        },
      });
      if (beams?.edges) {
        const tmpBeans = await extractBeamsReadableContent(
          beams.edges.map((beam) => beam?.node) as AkashaBeam[],
        );
        setPosts(akashaBeamToMarkdown(tmpBeans, eventId));
        setBeams(tmpBeans);
      }
    };
    fetchBeams();
  }, [eventId]);
  console.log('beams', beams);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      bgcolor="#222222"
      paddingTop="40px"
      sx={{
        width: '100%', // Add this line
        [breakpoints.down('md')]: {
          paddingTop: '20px',
        },
        [breakpoints.down('sm')]: {
          paddingTop: '10px',
        },
      }}
    >
      <Stack
        direction="row"
        justifyContent={'center'}
        sx={{
          width: '100%', // Add this line
          [breakpoints.down('md')]: {
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          },
        }}
      >
        <Stack
          spacing={3}
          boxSizing={'border-box'}
          sx={{
            width: '100%', // Add this line
            maxWidth: '1200px', // Add this line
            px: '240px',
            [breakpoints.down('lg')]: {
              px: '120px',
            },
            [breakpoints.down('md')]: {
              px: '20px',
            },
            [breakpoints.down('sm')]: {
              px: '16px', // Change this from 2px to 16px for better mobile spacing
            },
          }}
        >
          {discussionId && selectedDiscussion ? (
            <DiscussionDetails
              discussion={selectedDiscussion}
              eventId={eventId}
            />
          ) : isNewPostOpen ? (
            <NewPost eventId={eventId} onCancel={handleCloseNewPost} />
          ) : (
            <>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h4">Discussions</Typography>
                <ZuButton
                  variant="outlined"
                  size="small"
                  startIcon={<PlusCircleIcon size={5} />}
                  onClick={handleOpenNewPost}
                >
                  New Post
                </ZuButton>
              </Stack>

              <Stack
                spacing="10px"
                direction="row"
                justifyContent="space-between"
              >
                <Typography variant="body1">Topics</Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  {topics.map((topic) => (
                    <TopicChip
                      key={topic}
                      label={topic}
                      onClick={() => handleTopicClick(topic)}
                      selected={selectedTopics.includes(topic)}
                    />
                  ))}
                </Box>
              </Stack>

              <Stack spacing="10px">
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      lineHeight: '160%',
                    }}
                  >
                    Sort by
                  </Typography>
                  <SortChip
                    label="Hot"
                    selected={selectedSort === 'HOT'}
                    onClick={() => handleSortClick('HOT')}
                    icon={<FireIcon size={4} />}
                  />
                  <SortChip
                    label="Top"
                    selected={selectedSort === 'TOP'}
                    onClick={() => handleSortClick('TOP')}
                    icon={<ArrowUpCircleIcon size={4} />}
                  />
                  <SortChip
                    label="New"
                    selected={
                      selectedSort === 'NEW-asc' || selectedSort === 'NEW-desc'
                    }
                    onClick={() =>
                      handleSortClick(
                        selectedSort === 'NEW-asc' ? 'NEW-desc' : 'NEW-asc',
                      )
                    }
                    icon={<SparklesIcon size={4} />}
                  />
                </Box>
              </Stack>

              <Stack direction="column" spacing="10px">
                <Typography variant="body1">Posts</Typography>
                {posts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </Stack>
            </>
          )}
        </Stack>
        <SwipeableDrawer
          hideBackdrop={true}
          sx={{
            '& .MuiDrawer-paper': {
              boxShadow: 'none',
            },
          }}
          anchor="right"
          open={state['right']}
          onClose={() => toggleDrawer('right', false)}
          onOpen={() => toggleDrawer('right', true)}
          ref={ref}
        >
          {/* {List('right')} */}
        </SwipeableDrawer>
      </Stack>
    </Stack>
  );
};

export default Discussions;
