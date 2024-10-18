'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';

import { Stack } from '@mui/material';
import DiscussionsHome from '@/components/zuland/DiscussionsHome';
import DiscussionDetails from '@/components/zuland/DiscussionDetails';
import NewPost from '@/components/zuland/NewPost';

import { ZulandReadableBeam, getZulandReadableBeams } from '@/utils/akasha';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-markdown';
import Container from '@/components/zuland/Container';

interface DiscussionsProps {
  eventId: string;
}

const Discussions: React.FC<DiscussionsProps> = ({ eventId }) => {
  const queryClient = useQueryClient();

  const [selectedSort, setSelectedSort] = useState<string>('NEW');
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

  const {
    data: fetchedBeams,
    isLoading: isLoadingBeams,
    isFetching: isFetchingBeams,
    error,
  } = useQuery({
    queryKey: ['beams', eventId],
    queryFn: () => fetchBeams(),
  });

  const selectedPost = posts.find((post) => post.id === postId);

  useEffect(() => {
    if (fetchedBeams) {
      setBeams(fetchedBeams);
      const newPosts = akashaBeamToMarkdown(fetchedBeams, eventId);
      const sortedPosts = getSortedPosts(newPosts, selectedSort);
      // console.log({ fetchedBeams, sortedPosts });
      setPosts(sortedPosts);
    }
  }, [fetchedBeams]);

  useEffect(() => {
    const sortedPosts = getSortedPosts(posts, selectedSort);
    setPosts(sortedPosts);
  }, [selectedSort]);

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

  const fetchBeams = async () => {
    const readableBeams = await getZulandReadableBeams(eventId, {
      first: 15,
    });
    return readableBeams.edges
      ? readableBeams.edges.map((edge) => edge.node)
      : [];
  };

  const handleNewPostCreated = () => {
    queryClient.invalidateQueries({ queryKey: ['beams', eventId] });
    setIsNewPostOpen('');
  };

  return (
    <Stack
      justifyContent="center"
      alignItems="center"
      bgcolor="#222222"
      width="100%"
    >
      {postId && selectedPost ? (
        <Container>
          <DiscussionDetails discussion={selectedPost} postId={postId} />
        </Container>
      ) : isNewPostOpen !== '' && currentUser ? (
        <Container>
          <NewPost
            eventId={eventId}
            onCancel={() => setIsNewPostOpen('')}
            onPostCreated={handleNewPostCreated}
            currentUser={currentUser}
          />
        </Container>
      ) : (
        <DiscussionsHome
          eventId={eventId}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          posts={posts}
          isLoadingBeams={isLoadingBeams || isFetchingBeams}
          setIsNewPostOpen={setIsNewPostOpen}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      )}
    </Stack>
  );
};

export default Discussions;
