'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';

import {
  Stack,
  Typography,
  Avatar,
  Box,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';

import Drawer from '@/components/drawer';
import { ZuButton } from '@/components/core';
import TopicChip from './TopicChip';
import SortChip from './SortChip';
import CommentDetails from './CommentDetails';
import MarkdownVisualizer from './MarkdownVisualizer';
import ReplyForm from './ReplyForm';
import { Post } from '@/utils/akasha/beam-to-markdown';
import DiscussionSidebar from './DiscussionSidebar';
import ReportPostModal from '@/components/modals/Zuland/ReportPostModal';
import ShareModal from '@/components/modals/Zuland/ShareModal';

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
  SparklesIcon,
  ClockIcon,
  ArrowUpOnSquareIcon,
} from '@/components/icons';

interface DiscussionDetailsProps {
  postId: string;
  discussion: Post;
}
export type ReplyType = {
  id: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  content: string;
  likes: number;
  replyTo?: {
    author: {
      image: string;
      name: string;
    };
    content: string;
  };
};

const DiscussionDetails: React.FC<DiscussionDetailsProps> = ({
  discussion,
}) => {
  const queryClient = useQueryClient();

  const params = useParams();
  const eventId = params.eventid.toString();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedSort, setSelectedSort] = useState<string>('NEW');
  const [openReportModal, setOpenReportModal] = useState(false);
  const [openShareModal, setOpenShareModal] = useState(false);

  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);

  const [openProfileDrawer, setOpenProfileDrawer] = useState(false);

  const postId = useSearchParams().get('postId');
  const [reflectionCount, setReflectionCount] = useState<number>(0);
  const [reflections, setReflections] = useState<ZulandReadableReflection[]>(
    [],
  );

  const { data: reflectionsData, isLoading } = useQuery({
    queryKey: ['reflections', postId],
    queryFn: async () => {
      if (!postId) return null;
      return await getTopReadableReflectionsByBeamId(postId);
    },
    enabled: !!postId,
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

  const handleShare = () => {
    if (isMobile && navigator.share) {
      navigator
        .share({
          title: discussion?.title,
          text: 'Check out this discussion!',
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
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
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ['reflections', postId] });
        queryClient.invalidateQueries({ queryKey: ['beams', eventId] });
        if (parentReflectionId) {
          queryClient.invalidateQueries({
            queryKey: ['childReflections', parentReflectionId],
          });
        }
      }
    } catch (error) {
      console.error('Error creating reflection:', error);
    }
  };

  const toggleProfileDrawer = useCallback(() => {
    setOpenProfileDrawer((v) => !v);
  }, []);

  return (
    <div>
      <Stack spacing={3} sx={{ width: '100%' }}>
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
        <Typography variant="h4">{discussion?.title}</Typography>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          onClick={toggleProfileDrawer}
          sx={{ cursor: 'pointer' }}
        >
          <Avatar
            src={discussion?.author.akashaProfile.avatar?.default.src}
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

        {/* Reply section */}
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
          <Stack
            spacing="10px"
            direction="row"
            sx={{
              flexWrap: 'wrap',
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
              onClick={() => setSelectedSort('OLDEST')}
              icon={<ClockIcon size={4} />}
            />
            <SortChip
              label="New"
              selected={selectedSort === 'NEW'}
              onClick={() => setSelectedSort('NEW')}
              icon={<SparklesIcon size={4} />}
            />
          </Stack>
        </Stack>
        <Divider />

        {/* Existing replies */}
        <Stack spacing={3}>
          {reflections.map(async (reflection) => (
            <CommentDetails
              key={reflection.id}
              reflection={reflection}
              onReplySubmit={handleReplySubmit}
            />
          ))}
        </Stack>
      </Stack>
    </div>
  );
};

export default DiscussionDetails;
