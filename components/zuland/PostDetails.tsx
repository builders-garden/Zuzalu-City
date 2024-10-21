'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';

import {
  Stack,
  Typography,
  Avatar,
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from '@mui/material';

import Drawer from '@/components/drawer';
import { ZuButton } from '@/components/core';
import TopicChip from './TopicChip';
import CommentDetails from './CommentDetails';
import MarkdownVisualizer from './MarkdownVisualizer';
import ReplyForm from './ReplyForm';
import DiscussionSidebar from './DiscussionSidebar';
import ReportPostModal from '@/components/modals/Zuland/ReportPostModal';
import ShareModal from '@/components/modals/Zuland/ShareModal';
import SortList from './SortList';

import { buildIpfsUrl, Post } from '@/utils/akasha/beam-to-markdown';
import {
  createReflection,
  encodeSlateToBase64,
  getTopReadableReflectionsByBeamId,
  standardDateFormat,
  ZulandReadableReflection,
} from '@/utils/akasha';

import {
  ChatBubbleIcon,
  FlagIcon,
  ArrowUpOnSquareIcon,
} from '@/components/icons';

interface PostDetailsProps {
  postId: string;
  discussion: Post;
  eventId: string;
}

const PostDetails: React.FC<PostDetailsProps> = ({
  postId,
  discussion,
  eventId,
}) => {
  const queryClient = useQueryClient();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedReflectionsSort, setSelectedReflectionsSort] =
    useState<string>('NEW');
  const [openReportModal, setOpenReportModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);

  const [openProfileDrawer, setOpenProfileDrawer] = useState<boolean>(false);

  const [reflectionCount, setReflectionCount] = useState<number>(0);
  const [reflections, setReflections] = useState<ZulandReadableReflection[]>(
    [],
  );

  const {
    data: reflectionsData,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ['reflections', postId],
    queryFn: async () => {
      if (!postId) return null;
      return await getTopReadableReflectionsByBeamId(postId);
    },
  });

  useEffect(() => {
    if (reflectionsData) {
      setReflections(
        reflectionsData.reflections.edges
          .map((edge) => (edge ? edge.node : null))
          .filter((node) => node !== null) as ZulandReadableReflection[],
      );
      setReflectionCount(reflectionsData.reflectionsCount);
    }
  }, [reflectionsData]);

  useEffect(() => {
    const sortedReflections = reflections.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return selectedReflectionsSort === 'OLDEST'
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });
    setReflections(sortedReflections);
  }, [selectedReflectionsSort, reflections]);

  const handleShare = () => {
    if (isMobile && navigator.share) {
      navigator
        .share({
          title: discussion?.title,
          text: 'Check out this discussion!',
          url: window.location.href,
        })
        .catch((error) => console.error('Error sharing:', error));
    } else {
      setOpenShareModal(true);
    }
  };

  const handleReplyClick = () => {
    setShowReplyForm(true);
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }, 0);
  };

  const handleReplySubmit = async (
    content: string,
    topics: string[],
    parentReflectionId: string = '',
  ) => {
    setShowReplyForm(false);

    try {
      await createReflection({
        beamID: postId,
        createdAt: new Date().toISOString(),
        active: true,
        tags: topics,
        isReply: parentReflectionId !== '' ? true : null,
        reflection: parentReflectionId !== '' ? parentReflectionId : null,
        content: [
          {
            label: '@bg/zuland/reflection',
            propertyType: 'slate-block',
            value: encodeSlateToBase64([
              {
                type: 'paragraph',
                children: [
                  {
                    text: content,
                  },
                ],
              },
            ]),
          },
        ],
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['reflections', postId] });
      queryClient.invalidateQueries({ queryKey: ['beams', eventId] });
      if (parentReflectionId) {
        queryClient.invalidateQueries({
          queryKey: ['childReflections', parentReflectionId],
        });
      }
    } catch (error) {
      console.error('Error creating reflection:', error);
    }
  };

  const toggleProfileDrawer = () => setOpenProfileDrawer((v) => !v);

  return (
    <div>
      {/* Profile Sidebar */}
      <Drawer
        open={openProfileDrawer}
        onClose={toggleProfileDrawer}
        onOpen={toggleProfileDrawer}
      >
        <DiscussionSidebar
          discussion={discussion}
          handleClose={toggleProfileDrawer}
        />
      </Drawer>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Typography variant="h4">{discussion?.title}</Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ cursor: 'pointer' }}
          onClick={toggleProfileDrawer}
        >
          <Avatar
            src={buildIpfsUrl(
              discussion?.author.akashaProfile.avatar?.default.src,
            )}
            alt={discussion?.author.akashaProfile.name}
            sx={{ width: 32, height: 32 }}
          />
          <Stack direction="column" justifyContent="space-around">
            <Typography variant="body2">
              {discussion?.author.akashaProfile.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {standardDateFormat(discussion.createdAt)}
            </Typography>
          </Stack>
        </Stack>

        {/* Markdown Visualizer */}
        <MarkdownVisualizer content={discussion?.body || ''} />

        {/* Tags */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {discussion?.tags?.map((tag, index) => (
            <TopicChip key={index} label={tag} selected={false} />
          ))}
        </Box>

        {/* Actions */}
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <ZuButton
              onClick={() => setOpenReportModal(true)}
              sx={{
                color: 'white',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 20px',
                fontSize: '14px',
                fontWeight: '700',
                gap: '10px',
                '& > span': {
                  margin: '0px',
                },
              }}
            >
              <FlagIcon size={4} />
              Report
            </ZuButton>
            <ZuButton
              onClick={handleShare}
              sx={{
                color: 'white',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '4px 20px',
                fontSize: '14px',
                fontWeight: '700',
                gap: '10px',
                '& > span': {
                  margin: '0px',
                },
              }}
            >
              <ArrowUpOnSquareIcon size={4} />
              Share
            </ZuButton>
          </Stack>
          <ZuButton
            onClick={handleReplyClick}
            sx={{
              color: '#D7FFC4',
              backgroundColor: 'rgba(215, 255, 196, 0.2)',
              borderRadius: '10px',
              border: '1px solid rgba(215, 255, 196, 0.2)',
              padding: '4px 20px',
              fontSize: '14px',
              fontWeight: '700',
              gap: '10px',
              '& > span': {
                margin: '0px',
              },
            }}
          >
            Reply
          </ZuButton>
        </Stack>

        {/* Reply Form */}
        {showReplyForm && (
          <div>
            <ReplyForm
              onCancel={() => setShowReplyForm(false)}
              onReplySubmit={handleReplySubmit}
            />
            <div ref={replyFormRef} />
          </div>
        )}

        {/* Report Modal */}
        <ReportPostModal
          openReportModal={openReportModal}
          setOpenReportModal={setOpenReportModal}
        />

        {/* Share Modal */}
        <ShareModal
          discussionTitle={discussion?.title}
          openShareModal={openShareModal}
          setOpenShareModal={setOpenShareModal}
        />

        {/* Reply count and sort list section */}
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          justifyContent="space-between"
          sx={{ flexGrow: 1, flexWrap: 'wrap' }}
        >
          <Stack direction="row" alignItems="center">
            <IconButton size="medium" sx={{ color: 'white' }}>
              <ChatBubbleIcon size={6} />
            </IconButton>
            <Typography variant="body1">
              {reflectionCount} {reflectionCount === 1 ? 'Reply' : 'Replies'}
            </Typography>
          </Stack>

          <SortList
            selectedSort={selectedReflectionsSort}
            setSelectedSort={setSelectedReflectionsSort}
          />
        </Stack>
        <Divider />

        {/* Existing replies */}
        <Stack spacing={3}>
          {reflections.map((reflection) => (
            <CommentDetails
              key={reflection.id}
              reflection={reflection}
              onReplySubmit={handleReplySubmit}
            />
          ))}
        </Stack>

        {/* Pagination */}
        <Stack direction="row" justifyContent="center" spacing="10px">
          <ZuButton sx={{ width: '150px', display: 'flex', gap: '10px' }}>
            {isLoading || isFetching ? (
              <>
                <CircularProgress size="20px" color="info" />
                Loading...
              </>
            ) : (
              <>Load More</>
            )}
          </ZuButton>
        </Stack>
      </Stack>
    </div>
  );
};

export default PostDetails;
