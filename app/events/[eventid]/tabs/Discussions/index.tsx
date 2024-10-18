'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useQueryState } from 'nuqs';
import { Stack, Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { ZuButton } from '@/components/core';
import { PlusCircleIcon, SparklesIcon, ClockIcon } from '@/components/icons';
import TopicChip from './TopicChip';
import SortChip from './SortChip';
import PostCard from './PostCard';
import DiscussionDetails from './DiscussionDetails';
import NewPost from './NewPost';
import { ZulandReadableBeam, getZulandReadableBeams } from '@/utils/akasha';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-markdown';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AkashaConnectModal from './AkashaConnectModal';
import Link from 'next/link';

const Discussions: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const params = useParams();
  const eventId = params.eventid.toString();

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('NEW-asc');
  const [beams, setBeams] = useState<Array<ZulandReadableBeam> | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isNewPostOpen, setIsNewPostOpen] = useQueryState('newPost', {
    defaultValue: '',
  });
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
  const topicsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
    if (sort === 'NEW' || sort === 'OLDEST') {
      const sortedPosts = [...posts].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return selectedSort === 'OLDEST'
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

  const fetchBeams = async () => {
    const readableBeams = await getZulandReadableBeams(eventId, {
      first: 10,
    });

    if (readableBeams.edges) {
      return readableBeams.edges.map((edge) => edge.node);
    }

    return [];
  };

  const queryClient = useQueryClient();

  const {
    data: fetchedBeams,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['beams', eventId],
    queryFn: fetchBeams,
  });

  const handleNewPostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['beams', eventId] });
    setIsNewPostOpen('');
  };

  useEffect(() => {
    if (fetchedBeams) {
      setBeams(fetchedBeams);
      const newPosts = akashaBeamToMarkdown(fetchedBeams, eventId);
      const sortedPosts = getSortedPosts(newPosts, selectedSort);
      setPosts(sortedPosts);
    }
  }, [fetchedBeams]);

  const handleTopicsMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (topicsRef.current?.offsetLeft || 0));
    setScrollLeft(topicsRef.current?.scrollLeft || 0);
  };

  const handleTopicsMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTopicsMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (topicsRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (topicsRef.current) {
      topicsRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      bgcolor="#222222"
      width="100%"
    >
      {postId && selectedPost ? (
        <Stack
          spacing={3}
          boxSizing={'border-box'}
          sx={{
            width: '100%',
            padding: '20px',
            maxWidth: '1200px',
            px: '240px',
            [theme.breakpoints.down('lg')]: {
              px: '120px',
            },
            [theme.breakpoints.down('md')]: {
              px: '20px',
            },
            [theme.breakpoints.down('sm')]: {
              px: '16px',
            },
          }}
        >
          <DiscussionDetails discussion={selectedPost} postId={postId} />
        </Stack>
      ) : isNewPostOpen !== '' && currentUser ? (
        <Stack
          spacing={3}
          boxSizing={'border-box'}
          sx={{
            width: '100%',
            padding: '20px',
            maxWidth: '1200px',
            px: '240px',
            [theme.breakpoints.down('lg')]: {
              px: '120px',
            },
            [theme.breakpoints.down('md')]: {
              px: '20px',
            },
            [theme.breakpoints.down('sm')]: {
              px: '16px',
            },
          }}
        >
          <NewPost
            eventId={eventId}
            onCancel={() => setIsNewPostOpen('')}
            onPostCreated={handleNewPostCreated}
            currentUser={currentUser}
          />
        </Stack>
      ) : (
        <>
          {/* Hero section */}
          <Box
            justifyContent="center"
            position="relative"
            display="flex"
            flexDirection="row"
            borderRadius="10px"
            padding="40px 40px"
            width="100%"
            sx={{
              marginTop: '20px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'url("/27.jpg")',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
              }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="start"
              spacing={3}
              boxSizing={'border-box'}
              sx={{
                position: 'relative',
                width: '100%',
                padding: '20px',
                maxWidth: '1200px',
                px: '240px',
                [theme.breakpoints.down('lg')]: {
                  px: '120px',
                },
                [theme.breakpoints.down('md')]: {
                  px: '20px',
                },
                [theme.breakpoints.down('sm')]: {
                  px: '16px',
                },
              }}
            >
              <Box
                display="flex"
                flexDirection="column"
                gap={2}
                maxWidth="1200px"
              >
                <Typography
                  color={theme.palette.text.primary}
                  variant={isMobile ? 'h1' : 'hB'}
                >
                  Discussions
                </Typography>
                <Typography color="white" variant="bodyB" marginBottom="20px">
                  Discuss with the members of the community
                </Typography>
              </Box>
              <Link
                href={`/events/${eventId}?tab=discussions&newPost=true`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <ZuButton
                  variant="outlined"
                  size="small"
                  startIcon={<PlusCircleIcon size={5} />}
                  sx={{ padding: '10px 20px' }}
                  onClick={() => {
                    if (currentUser === undefined) {
                      setShowCheckUserConnectionModal(true);
                    }
                  }}
                >
                  New Post
                </ZuButton>
              </Link>
            </Stack>
          </Box>

          <Stack
            spacing={3}
            boxSizing={'border-box'}
            sx={{
              width: '100%',
              padding: '20px',
              maxWidth: '1200px',
              px: '240px',
              [theme.breakpoints.down('lg')]: {
                px: '120px',
              },
              [theme.breakpoints.down('md')]: {
                px: '20px',
              },
              [theme.breakpoints.down('sm')]: {
                px: '16px',
              },
            }}
          >
            {/* Topics */}
            <Stack
              spacing="10px"
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: '#34343499',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '8px 16px',
              }}
            >
              <Typography variant="body2">Topics</Typography>
              <Box
                ref={topicsRef}
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  '&::-webkit-scrollbar': {
                    display: 'none',
                  },
                  cursor: isDragging ? 'grabbing' : 'grab',
                  userSelect: 'none',
                }}
                onMouseDown={handleTopicsMouseDown}
                onMouseLeave={handleTopicsMouseLeave}
                onMouseUp={handleTopicsMouseLeave}
                onMouseMove={handleTopicsMouseMove}
              >
                {topics.map((topic) => (
                  <Box key={topic} sx={{ mr: 1 }}>
                    <TopicChip
                      label={topic}
                      onClick={() => handleTopicClick(topic)}
                      selected={selectedTopics.includes(topic)}
                    />
                  </Box>
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
                  label="Oldest"
                  selected={selectedSort === 'OLDEST'}
                  onClick={() => handleSortClick('OLDEST')}
                  icon={<ClockIcon size={5} />}
                />
                <SortChip
                  label="New"
                  selected={selectedSort === 'NEW'}
                  onClick={() => handleSortClick('NEW')}
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
                setShowAuthenticatedPart={() => setIsNewPostOpen('true')}
                setParentUserAuth={setCurrentUser}
              />
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default Discussions;
