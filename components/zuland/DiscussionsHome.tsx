'use client';

import React, { useState, SetStateAction, Dispatch } from 'react';
import Link from 'next/link';

import {
  Stack,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';
import { ZuButton } from '@/components/core';
import { PlusCircleIcon } from '@/components/icons';

import Container from '@/components/zuland/Container';
import SortList from '@/components/zuland/SortList';
import PostCard from '@/components/zuland/PostCard';
import AkashaConnectModal from '@/components/modals/AkashaConnectModal';
import TopicList from '@/components/zuland/TopicList';
import { Post } from '@/utils/akasha/beam-to-markdown';

type IUser =
  | ({
      id?: string;
      ethAddress?: string;
    } & {
      isNewUser?: boolean;
    })
  | undefined;

interface DiscussionsHomeProps {
  eventId: string;
  currentUser: IUser;
  posts: Post[];
  isLoadingBeams: boolean;
  setIsNewPostOpen: (value: string) => void;
  setCurrentUser: Dispatch<SetStateAction<IUser>>;
  selectedSort: string;
  setSelectedSort: Dispatch<SetStateAction<string>>;
}

const DiscussionsHome = ({
  eventId,
  currentUser,
  posts,
  isLoadingBeams,
  setIsNewPostOpen,
  setCurrentUser,
  selectedSort,
  setSelectedSort,
}: DiscussionsHomeProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [showCheckUserConnectionModal, setShowCheckUserConnectionModal] =
    useState(false);

  return (
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
        <Container>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
            sx={{
              position: 'relative',
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
        </Container>
      </Box>

      <Container>
        {/* Topics */}
        <TopicList
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />

        {/* Sort */}
        <SortList
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />

        {/* Posts */}
        <Stack direction="column" spacing="10px">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </Stack>

        {/* Pagination */}
        <Stack direction="row" justifyContent="center" spacing="10px">
          <ZuButton sx={{ width: '150px', display: 'flex', gap: '10px' }}>
            {isLoadingBeams ? (
              <>
                <CircularProgress size="20px" color="info" />
                Loading...
              </>
            ) : (
              <>Load More</>
            )}
          </ZuButton>
        </Stack>

        {showCheckUserConnectionModal && (
          <AkashaConnectModal
            showModal={showCheckUserConnectionModal}
            setShowModal={setShowCheckUserConnectionModal}
            setShowAuthenticatedPart={() => setIsNewPostOpen('true')}
            setParentUserAuth={setCurrentUser}
          />
        )}
      </Container>
    </>
  );
};

export default DiscussionsHome;
