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
  AkashaReadableBeam,
  extractBeamsReadableContent,
  getBeams,
} from '@/utils/akasha';
import { AkashaBeam } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-markdown';

const Discussions: React.FC = () => {
  const { breakpoints } = useTheme();

  const params = useParams();
  const eventId = params.eventid.toString();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('NEW-asc');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postId, setPostId] = useQueryState('postId', {
    defaultValue: '',
  });

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

  const getSortedPosts = (posts: Post[], sort: string) => {
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
      try {
        // Check if we have cached data in localStorage
        const cachedData = localStorage.getItem(`beams_${eventId}`);
        const cachedTimestamp = localStorage.getItem(
          `beams_${eventId}_timestamp`,
        );

        if (cachedData && cachedTimestamp) {
          const parsedData = JSON.parse(cachedData);
          const timestamp = parseInt(cachedTimestamp, 10);

          // If the cache is less than 60 seconds old, use it
          if (Date.now() - timestamp < 60000) {
            setBeams(parsedData);
            return;
          }
        }

        // If no valid cache, fetch new data
        const fetchedBeams = await getBeams({
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

        if (fetchedBeams?.edges) {
          const tmpBeams = await extractBeamsReadableContent(
            fetchedBeams.edges.map((beam) => beam?.node) as AkashaBeam[],
          );

          setBeams(tmpBeams);

          // Cache the new data
          localStorage.setItem(`beams_${eventId}`, JSON.stringify(tmpBeams));
          localStorage.setItem(
            `beams_${eventId}_timestamp`,
            Date.now().toString(),
          );
        }
      } catch (error) {
        console.error('Error fetching beams:', error);
      }
    };

    fetchBeams();
  }, [eventId]);

  // New useEffect to convert beams to markdown
  useEffect(() => {
    if (beams) {
      const newPosts = akashaBeamToMarkdown(beams, eventId);
      const sortedPosts = getSortedPosts(newPosts, selectedSort);
      setPosts(sortedPosts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [beams, eventId]);

  console.log({ posts, beams });

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
                  onClick={() => setIsNewPostOpen(true)}
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
            </>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Discussions;
