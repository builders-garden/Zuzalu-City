'use client';
import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import { useParams } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import {
  Stack,
  Box,
  Typography,
  SwipeableDrawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ZuButton } from '@/components/core';
import {
  PlusCircleIcon,
  ArrowUpCircleIcon,
  FireIcon,
  SparklesIcon,
} from '@/components/icons';
import { useCeramicContext } from '@/context/CeramicContext';
import { CeramicResponseType, EventEdge, Event } from '@/types';
import { supabase } from '@/utils/supabase/client';
import { Anchor, Contract } from '@/types';
import { LatLngLiteral } from 'leaflet';
import getLatLngFromAddress from '@/utils/osm';
import TopicChip from './TopicChip';
import SortChip from './SortChip';
import PostCard from './PostCard';
import DiscussionDetails from './DiscussionDetails'; // You'll need to create this component
import NewPost from './NewPost';

interface IDiscussions {
  eventData: Event | undefined;
  setVerify: React.Dispatch<React.SetStateAction<boolean>> | any;
}

const Discussions: React.FC<IDiscussions> = ({ eventData, setVerify }) => {
  const [location, setLocation] = useState<string>('');

  const [whitelist, setWhitelist] = useState<boolean>(false);
  const [sponsor, setSponsor] = useState<boolean>(false);

  const [isInitial, setIsInitial] = useState<boolean>(false);
  const [isDisclaimer, setIsDisclaimer] = useState<boolean>(false);
  const [isEmail, setIsEmail] = useState<boolean>(false);
  const [isPayment, setIsPayment] = useState<boolean>(false);

  const [isVerify, setIsVerify] = useState<boolean>(false);
  const [isAgree, setIsAgree] = useState<boolean>(false);
  const [isMint, setIsMint] = useState<boolean>(false);
  const [isTransaction, setIsTransaction] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<string>('');
  const [isSponsorAgree, setIsSponsorAgree] = useState<boolean>(false);
  const [isSponsorMint, setIsSponsorMint] = useState<boolean>(false);
  const [isSponsorTransaction, setIsSponsorTransaction] =
    useState<boolean>(false);
  const [isSponsorComplete, setIsSponsorComplete] = useState<boolean>(false);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [ticketMinted, setTicketMinted] = useState<any[]>([]);
  const [mintedContract, setMintedContract] = useState<Contract>();
  const [transactionLog, setTransactionLog] = useState<any>();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('Hot');

  const params = useParams();
  const eventId = params.eventid.toString();

  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('sm'));

  const { composeClient } = useCeramicContext();

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

  const posts = [
    {
      id: '1',
      title: 'Post 1',
      body: `
# Welcome to our Event!

![Event Banner](https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1645&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

We're excited to have you join us for this amazing event. Here are some highlights:

- Keynote speakers
- Interactive workshops
- Networking opportunities

## Schedule

| Time | Activity |
|------|----------|
| 9:00 AM | Registration |
| 10:00 AM | Opening Ceremony |
| 11:00 AM | Keynote Speech |

Don't forget to check out our sponsor booths!

![Sponsor Area](https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

See you there!
    `,
      author: {
        name: 'Author 1',
        image:
          'https://images.unsplash.com/profile-1574363570516-50a9209e8f08image?w=150&dpr=1&crop=faces&bg=%23fff&h=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      },
      date: '2021-01-01',
      tags: ['Tag 1', 'Tag 2'],
      image:
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1645&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      likes: 132,
      replies: 15,
      eventId: eventId,
    },
    {
      id: '2',
      title: 'Post 2',
      body: 'Post 2',
      author: {
        name: 'Author 1',
        image:
          'https://images.unsplash.com/profile-1722954188660-e468abf54fc5image?w=150&dpr=1&crop=faces&bg=%23fff&h=150&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      },
      date: '2024-09-01',
      tags: ['Tag 3', 'Tag 4'],
      likes: 322,
      replies: 105,
      eventId: eventId,
    },
  ];

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
    setSelectedSort(sort);
  };

  const searchParams = useSearchParams();
  const discussionId = searchParams.get('discussionId');
  const selectedDiscussion = posts.find((post) => post.id === discussionId);

  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  const handleOpenNewPost = () => setIsNewPostOpen(true);
  const handleCloseNewPost = () => setIsNewPostOpen(false);

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
      {eventData && (
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
                      selected={selectedSort === 'Hot'}
                      onClick={() => handleSortClick('Hot')}
                      icon={<FireIcon size={4} />}
                    />
                    <SortChip
                      label="Top"
                      selected={selectedSort === 'Top'}
                      onClick={() => handleSortClick('Top')}
                      icon={<ArrowUpCircleIcon size={4} />}
                    />
                    <SortChip
                      label="New"
                      selected={selectedSort === 'New'}
                      onClick={() => handleSortClick('New')}
                      icon={<SparklesIcon size={4} />}
                    />
                  </Box>
                </Stack>

                <Stack direction="column" spacing="10px">
                  <Typography variant="body1">Posts</Typography>
                  {posts.map((post) => (
                    <PostCard key={post.title} {...post} />
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
      )}
    </Stack>
  );
};

export default Discussions;
