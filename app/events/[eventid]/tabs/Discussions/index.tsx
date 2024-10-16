'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Stack, Box, Typography, useTheme } from '@mui/material';
import { ZuButton } from '@/components/core';
import {
  PlusCircleIcon,
  ArrowUpCircleIcon,
  FireIcon,
  SparklesIcon,
} from '@/components/icons';
import TopicChip from './TopicChip';
import SortChip from './SortChip';
import PostCard from './PostCard';
import DiscussionDetails from './DiscussionDetails'; // You'll need to create this component
import NewPost from './NewPost';
import {
  ZulandReadableBeam,
  extractBeamsReadableContent,
  getAppByEventId,
  getBeams,
} from '@/utils/akasha';
import { AkashaBeam } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-markdown';
import { useQuery } from '@tanstack/react-query';
import AkashaConnectModal from './AkashaConnectModal';

const Discussions: React.FC = () => {
  const { breakpoints } = useTheme();

  const params = useParams();
  const eventId = params.eventid.toString();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('NEW-asc');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [beams, setBeams] = useState<Array<ZulandReadableBeam> | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postId, setPostId] = useQueryState('postId', {
    defaultValue: '',
  });
  const [currentUser, setCurrentUser] = useState<
    | ({
        id?: string;
        ethAddress?: string;
      } & {
        isNewUser?: boolean;
      })
    | undefined
  >(undefined);

  const [showCheckUserConnectionModal, setShowCheckUserConnectionModal] =
    useState(false);

  const selectedPost = posts.find((post) => post.id === postId);

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

  const handleTopicClick = (topic: string) => {
    setSelectedTopics((prevTopics) => {
      if (prevTopics.includes(topic)) {
        return prevTopics.filter((t) => t !== topic);
      } else {
        return [...prevTopics, topic];
      }
    });
  };

  const getSortedPosts = (posts: Post[], sort: string): Post[] => {
    if (sort === 'NEW-asc' || sort === 'NEW-desc') {
      const sortedPosts = [...posts].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return selectedSort === 'NEW-desc'
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      });
      return sortedPosts;
    }
    return posts;
  };

  const handleSortClick = (sort: string) => {
    const sortedPosts = getSortedPosts(posts, sort);
    setPosts(sortedPosts);
    setSelectedSort(sort);
  };

  // const handleGetCurrentUser = async () => {
  //   if (!currentUser) {
  //     const currentUserResult = await akashaSdk.api.auth.getCurrentUser();
  //     console.log('currentUserResult', currentUserResult);
  //     setCurrentUser(currentUserResult ? currentUserResult : undefined);
  //   }
  // };

  const fetchBeams = async () => {
    const app = await getAppByEventId(eventId);

    const fetchedBeams = await getBeams({
      first: 10,
      filters: {
        where: {
          appID: {
            equalTo: app?.id,
          },
        },
      },
    });

    if (fetchedBeams?.edges) {
      return extractBeamsReadableContent(
        fetchedBeams.edges.map((beam) => beam?.node) as AkashaBeam[],
      );
    }

    return [];
  };

  const {
    data: fetchedBeams,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['beams', eventId],
    queryFn: fetchBeams,
  });

  useEffect(() => {
    if (fetchedBeams) {
      setBeams(fetchedBeams);
      const newPosts = akashaBeamToMarkdown(fetchedBeams, eventId);
      const sortedPosts = getSortedPosts(newPosts, selectedSort);
      setPosts(sortedPosts);
    }
  }, [fetchedBeams]);

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      bgcolor="#222222"
      width="100%"
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
            width: '100%',
            padding: '20px',
            maxWidth: '1200px',
            px: '240px',
            [breakpoints.down('lg')]: {
              px: '120px',
            },
            [breakpoints.down('md')]: {
              px: '20px',
            },
            [breakpoints.down('sm')]: {
              px: '16px',
            },
          }}
        >
          {postId && selectedPost ? (
            <DiscussionDetails discussion={selectedPost} />
          ) : isNewPostOpen ? (
            <NewPost
              eventId={eventId}
              onCancel={() => setIsNewPostOpen(false)}
            />
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
                  onClick={() => {
                    if (currentUser === undefined) {
                      setShowCheckUserConnectionModal(true);
                    } else {
                      setIsNewPostOpen(true);
                    }
                  }}
                >
                  New Post
                </ZuButton>
              </Stack>

              {/* Topics */}
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

              {/* Sort */}
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

              {/* Posts */}
              <Stack direction="column" spacing="10px">
                {posts.map((post) => (
                  <PostCard key={post.id} {...post} />
                ))}
              </Stack>

              {showCheckUserConnectionModal && (
                <AkashaConnectModal
                  showModal={showCheckUserConnectionModal}
                  setShowModal={setShowCheckUserConnectionModal}
                  setShowAuthenticatedPart={setIsNewPostOpen}
                  setParentUserAuth={setCurrentUser}
                />
              )}
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Discussions;
