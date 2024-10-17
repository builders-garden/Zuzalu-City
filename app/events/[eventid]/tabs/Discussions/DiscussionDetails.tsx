import React, { useState, useRef, useEffect } from 'react';
import {
  Stack,
  Typography,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Modal,
  Chip,
  TextField,
  SwipeableDrawer,
  useTheme,
} from '@mui/material';
import {
  ChatBubbleIcon,
  FlagIcon,
  FireIcon,
  ArrowUpCircleIcon,
  SparklesIcon,
  ArrowDownIcon,
  TwitterIcon,
  FarcasterIcon,
  WhatsappIcon,
  CopyIcon,
} from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';
import TopicChip from './TopicChip';
import SortChip from './SortChip';
import CommentDetails from './CommentDetails';
import MarkdownVisualizer from './MarkdownVisualizer';
import { useMediaQuery } from '@mui/material';
import ReplyForm from './ReplyForm';
import { Post } from '@/utils/akasha/beam-to-markdown';
import DiscussionSidebar from './DiscussionSidebar';
import { Anchor } from '@/types';
import { useSearchParams, useParams } from 'next/navigation';
import {
  createReflection,
  encodeSlateToBase64,
  getReadableReflectionsByBeamId,
  standardDateFormat,
  ZulandReadableReflection,
} from '@/utils/akasha';
import { useQueryClient, useQuery } from '@tanstack/react-query';

interface DiscussionDetailsProps {
  discussion: Post | undefined;
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
  const { breakpoints } = useTheme();
  const [state, setState] = useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });
  const ref = useRef<HTMLDivElement | null>(null);

  const queryClient = useQueryClient();

  const [selectedSort, setSelectedSort] = useState<string>('Hot');
  const [openReportModal, setOpenReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);

  const postId = useSearchParams().get('postId');
  const [reflectionCount, setReflectionCount] = useState<number>(0);
  const [reflections, setReflections] = useState<ZulandReadableReflection[]>(
    [],
  );

  const { data: reflectionsData, isLoading } = useQuery({
    queryKey: ['reflections', postId],
    queryFn: async () => {
      if (!postId) return null;
      return await getReadableReflectionsByBeamId(postId);
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

  const toggleDrawer = (anchor: Anchor, open: boolean) => {
    setState({ ...state, [anchor]: open });
  };

  const handleSortClick = (sort: string) => {
    setSelectedSort(sort);
  };

  const handleOpenReportModal = () => {
    setOpenReportModal(true);
    setSelectedReason(null); // Reset selected reason when opening modal
  };
  const handleCloseReportModal = () => setOpenReportModal(false);

  const handleReasonSelect = (reason: string) => {
    setSelectedReason(reason);
  };

  const handleReportUser = () => {
    if (selectedReason) {
      // Implement the report logic here
      console.log(`Reporting user for: ${selectedReason}`);
      handleCloseReportModal();
    }
  };

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

  const handleCloseShareModal = () => setOpenShareModal(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    // Optionally, show a success message
  };

  const getEncodedText = () => {
    const textEncoded = encodeURIComponent(
      `Zuzalu, follow this discussion ${discussion?.title} on ${window.location.href}`,
    );
    return textEncoded;
  };

  const shareToTwitter = () => {
    const textEncoded = getEncodedText();
    window.open(
      `https://twitter.com/intent/tweet?text=${textEncoded}`,
      '_blank',
    );
  };

  const shareToFarcaster = () => {
    const textEncoded = getEncodedText();
    window.open(`https://warpcast.com/~/compose?text=${textEncoded}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const textEncoded = getEncodedText();
    window.open(`https://wa.me/?text=${textEncoded}`, '_blank');
  };

  const reportReasons = [
    'Harassment',
    'Fraud or scam',
    'Spam',
    'Misinformation',
    'Hateful speech',
    'Threat or violence',
    'Self harm',
    'Graphic content',
    'Sexual content',
    'Fake account',
    'Bot account',
  ];

  const handleReplyClick = () => {
    setShowReplyForm(true);
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }, 0);
  };

  const params = useParams();
  const eventId = params.eventid.toString();

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

      // Refetch reflections after creating a new one
      if (postId) {
        queryClient.invalidateQueries({ queryKey: ['reflections', postId] });
        queryClient.invalidateQueries({ queryKey: ['beams', eventId] });
        const reflectionsResult = await getReadableReflectionsByBeamId(postId);
        if (reflectionsResult) {
          setReflections(
            reflectionsResult.reflections.edges
              .map((edge) => (edge ? edge.node : null))
              .filter((node) => node !== null) as ZulandReadableReflection[],
          );
          setReflectionCount(reflectionsResult.reflectionsCount);
        }
      }
    } catch (error) {
      console.error('Error creating reflection:', error);
      // Optionally, show an error message to the user
    }
  };

  const getParentReflection = async (
    reflection: ZulandReadableReflection,
  ): Promise<ZulandReadableReflection | undefined> => {
    if (!reflection.isReply) {
      return undefined;
    }

    const parentReflection = reflections.find((r) => r.id === reflection.id);
    if (!parentReflection) {
      console.error(
        'Parent reflection not found on cached reflections, fetching...',
      );
      // TODO: fetch parent reflection from getReadableReflectionsByReflectionId
      const fetchReflectionById = await getReadableReflectionsByBeamId(
        reflection.id,
      );
      if (!fetchReflectionById) {
        console.error('Parent reflection not found');
        return undefined;
      }
      const parentReflection = fetchReflectionById.reflections.edges
        .map((edge) => (edge ? edge.node : null))
        .filter((node) => node !== null) as ZulandReadableReflection[];
      console.log('Parent reflection:', parentReflection);
    }
    return parentReflection;
  };

  return (
    <div>
      <Stack spacing={3} sx={{ width: '100%' }}>
        {postId && discussion ? (
          <>
            <Typography variant="h4">{discussion?.title}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar
                src={discussion?.author.akashaProfile.avatar?.default.src}
                alt={discussion?.author.akashaProfile.name}
                sx={{ width: 32, height: 32 }}
              />
              <Stack direction="column" justifyContent="space-around">
                <Typography variant="body2">
                  {/* {discussion?.author.id.slice(0, 10)} */}
                  {discussion?.author.akashaProfile.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {standardDateFormat(discussion.createdAt)}
                </Typography>
              </Stack>
            </Stack>
            <MarkdownVisualizer content={discussion?.body || ''} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {discussion?.tags?.map((tag, index) => (
                <TopicChip key={index} label={tag} selected={false} />
              ))}
            </Box>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <Button
                  startIcon={<FlagIcon size={4} />}
                  size="small"
                  onClick={handleOpenReportModal}
                >
                  Report
                </Button>
                <Button
                  startIcon={<ArrowUpOnSquareIcon size={4} />}
                  variant="contained"
                  size="small"
                  onClick={handleShare}
                >
                  Share
                </Button>
              </Stack>
              <Button
                variant="contained"
                size="small"
                onClick={handleReplyClick}
              >
                Reply
              </Button>
            </Stack>

            {showReplyForm && (
              <div>
                <ReplyForm
                  onCancel={() => setShowReplyForm(false)}
                  onSubmit={handleReplySubmit}
                />
                <div ref={replyFormRef} />
              </div>
            )}

            {/* Report Modal */}
            <Modal
              open={openReportModal}
              onClose={handleCloseReportModal}
              aria-labelledby="report-modal-title"
            >
              <Box
                sx={{
                  position: 'absolute' as 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.default',
                  border: '2px solid #222222',
                  borderRadius: '10px',
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <Typography
                  id="report-modal-title"
                  variant="h6"
                  component="h2"
                  gutterBottom
                >
                  Report this discussion
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Select a reason that applies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {reportReasons.map((reason) => (
                    <Chip
                      key={reason}
                      label={reason}
                      onClick={() => handleReasonSelect(reason)}
                      color={
                        selectedReason === reason ? 'primary' : 'secondary'
                      }
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                  }}
                >
                  <Button
                    onClick={handleCloseReportModal}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<FlagIcon size={4} />}
                    disabled={!selectedReason}
                    onClick={handleReportUser}
                  >
                    Report user
                  </Button>
                </Box>
              </Box>
            </Modal>

            {/* Share Modal */}
            <Modal
              open={openShareModal}
              onClose={handleCloseShareModal}
              aria-labelledby="share-modal-title"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 400,
                  bgcolor: 'background.default',
                  border: '2px solid #222222',
                  borderRadius: '10px',
                  boxShadow: 24,
                  p: 4,
                }}
              >
                <Typography
                  id="share-modal-title"
                  variant="h6"
                  component="h2"
                  gutterBottom
                >
                  Share this discussion
                </Typography>
                <TextField
                  fullWidth
                  value={window.location.href}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <IconButton onClick={copyToClipboard}>
                        <CopyIcon />
                      </IconButton>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                <Stack direction="row" spacing={2} justifyContent="center">
                  <IconButton onClick={shareToTwitter}>
                    <TwitterIcon />
                  </IconButton>
                  <IconButton onClick={shareToFarcaster}>
                    <FarcasterIcon />
                  </IconButton>
                  <IconButton onClick={shareToWhatsApp}>
                    <WhatsappIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Modal>

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
                  {reflectionCount}{' '}
                  {reflectionCount === 1 ? 'Reply' : 'Replies'}
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
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<ArrowDownIcon size={4} />}
                >
                  Jump to start
                </Button>
              </Stack>
            </Stack>
            <Divider />

            {/* Existing replies */}
            <Stack spacing={3}>
              {reflections.map(async (reflection) => {
                const parentReflection = await getParentReflection(reflection);
                return (
                  <CommentDetails
                    key={reflection.id}
                    reflection={reflection}
                    parentReflection={parentReflection}
                    onReply={handleReplySubmit}
                  />
                );
              })}
            </Stack>
          </>
        ) : null}
      </Stack>

      {/* Sidebar */}
      <SwipeableDrawer
        hideBackdrop={true}
        sx={{
          color: 'primary',
          '& .MuiDrawer-paper': {
            width: '30% !important',
            boxShadow: 'none',
          },
          [breakpoints.down('lg')]: {
            '& .MuiDrawer-paper': {
              width: '50% !important',
            },
          },
          [breakpoints.down('md')]: {
            '& .MuiDrawer-paper': {
              width: '70% !important',
            },
          },
          [breakpoints.down('sm')]: {
            '& .MuiDrawer-paper': {
              width: '90% !important',
            },
          },
        }}
        anchor="right"
        open={state['right']}
        onClose={() => toggleDrawer('right', false)}
        onOpen={() => toggleDrawer('right', true)}
        ref={ref}
      >
        <DiscussionSidebar discussion={discussion} />
      </SwipeableDrawer>
    </div>
  );
};

export default DiscussionDetails;
