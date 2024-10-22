'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { useAkashaAuthStore } from '@/hooks/zuland-akasha-store';

import { Stack } from '@mui/material';
import DiscussionsHome from '@/components/zuland/DiscussionsHome';
import PostDetails from '@/components/zuland/PostDetails';
import NewPost from '@/components/zuland/NewPost';

import { ZulandReadableBeam, getZulandReadableBeams } from '@/utils/akasha';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-post';
import Container from '@/components/zuland/Container';

interface DiscussionsProps {
  eventId: string;
}

const Discussions: React.FC<DiscussionsProps> = ({ eventId }) => {
  const queryClient = useQueryClient();
  const { currentAkashaUser } = useAkashaAuthStore();

  const [selectedSort, setSelectedSort] = useState<string>('NEW');
  const [beams, setBeams] = useState<Array<ZulandReadableBeam> | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isNewPostOpen, setIsNewPostOpen] = useQueryState('newPost', {
    defaultValue: '',
  });
  const [postId, setPostId] = useQueryState('postId', {
    defaultValue: '',
  });

  const {
    data: fetchedBeams,
    isLoading: isLoadingBeams,
    isFetching: isFetchingBeams,
    error,
  } = useQuery({
    queryKey: ['beams', eventId],
    queryFn: async () => {
      const readableBeams = await getZulandReadableBeams(eventId, {
        first: 10,
      });
      return readableBeams.edges
        ? readableBeams.edges.map((edge) => edge.node)
        : [];
    },
  });

  const selectedPost = posts.find((post) => post.id === postId);

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

  useEffect(() => {
    if (fetchedBeams) {
      setBeams(fetchedBeams);
      const newPosts = akashaBeamToMarkdown(fetchedBeams, eventId);
      const sortedPosts = getSortedPosts(newPosts, selectedSort);
      // console.log({ fetchedBeams, newPosts });
      setPosts(sortedPosts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedBeams]);

  useEffect(() => {
    const sortedPosts = getSortedPosts(posts, selectedSort);
    setPosts(sortedPosts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSort]);

  const handleNewPostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['beams', eventId] });
    setIsNewPostOpen('');
  };

  return (
    <>
      <Stack
        justifyContent="center"
        alignItems="center"
        bgcolor="#222222"
        width="100%"
      >
        {postId && selectedPost ? (
          <Container>
            <PostDetails
              postId={postId}
              discussion={selectedPost}
              eventId={eventId}
            />
          </Container>
        ) : isNewPostOpen !== '' && currentAkashaUser ? (
          <Container>
            <NewPost
              eventId={eventId}
              onCancel={() => setIsNewPostOpen('')}
              onPostCreated={handleNewPostCreated}
            />
          </Container>
        ) : (
          <DiscussionsHome
            eventId={eventId}
            posts={posts}
            isLoadingBeams={isLoadingBeams || isFetchingBeams}
            setIsNewPostOpen={setIsNewPostOpen}
            selectedSort={selectedSort}
            setSelectedSort={setSelectedSort}
          />
        )}
      </Stack>
    </>
  );
};

export default Discussions;
