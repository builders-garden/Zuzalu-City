'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { useAkashaAuthStore } from '@/hooks/zuland-akasha-store';

import { Stack } from '@mui/material';
import DiscussionsHome from '@/components/zuland/DiscussionsHome';
import PostDetails from '@/components/zuland/PostDetails';
import NewPost from '@/components/zuland/NewPost';

import {
  ZulandReadableBeam,
  createZulandAppRelease,
  getAppByEventId,
  getZulandReadableBeams,
} from '@/utils/akasha';
import { akashaBeamToMarkdown, Post } from '@/utils/akasha/beam-to-markdown';
import Container from '@/components/zuland/Container';
import { ZulandLit } from '@/utils/lit';

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

  const zulandLitTests = async () => {
    const zulandLit = new ZulandLit('sepolia');
    zulandLit.connect();

    // this will be taken from the appReleases metadata
    const accessControlConditions = [
      {
        // contractAddress: "0x47D5541aF9F4a8D613713F11f51Fa401f6D4D124",
        contractAddress: '0xAe8ccE7d5aF9D7f2A0e2295b7F2e53f249E9cAdE',
        standardContractType: 'ERC721',
        chain: 'sepolia',
        method: 'balanceOf',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ];
    const encryptedData = await zulandLit.encryptString(
      'naaaaaamo',
      accessControlConditions,
    );
    const decryptedData = await zulandLit.decryptString(
      encryptedData.ciphertext,
      encryptedData.dataToEncryptHash,
      accessControlConditions,
    );
    console.log({ encryptedData, decryptedData });
    zulandLit.disconnect();
  };

  const getThisEventApp = async (_eventId: string) => {
    const app = await getAppByEventId(_eventId);
    console.log({ app });
    return app;
  };

  const createNewAppReleaseExample = async () => {
    const currentApp = await getThisEventApp(eventId);
    if (!currentApp) {
      console.error('No app found for this event');
      return;
    }

    const newAppRelease = await createZulandAppRelease({
      applicationID: currentApp?.id,
      version: '0.0.2',
      source:
        'https://zuzalu.city/events/kjzl6kcym7w8yas4ufufni8r125ycgw1zcj9bu6paswnosj4edxqqutlko9fg5j',
      ticketRequirements: {
        contractAddress: '0xAe8ccE7d5aF9D7f2A0e2295b7F2e53f249E9cAdE',
        chain: 'sepolia',
        // commented the data below because it's not required
        // method: 'balanceOf',
        // comparator: '>',
        // value: '0',
      },
    });
    console.log({ newAppRelease });

    // output: "k2t6wzhkhabz206cnydbywu98w9hx5w6zxxw2idj7pilbd3m6jxsavpmkxyhj5"
  };

  return (
    <>
      <Stack
        justifyContent="center"
        alignItems="center"
        bgcolor="#222222"
        width="100%"
      >
        {/* <Container>
          <button onClick={zulandLitTests}>Zuland Lit Tests</button>
          <button onClick={createNewAppReleaseExample}>
            Create New App Release Example
          </button>
          <button onClick={() => getThisEventApp(eventId)}>
            Get Current App
          </button>
        </Container> */}

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
