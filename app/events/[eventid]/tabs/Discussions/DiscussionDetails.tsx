import React, { useState } from 'react';
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
} from '@mui/material';
import {
  HeartIcon,
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TopicChip from './TopicChip';
import Link from 'next/link';
import SortChip from './SortChip';
import CommentDetails from './CommentDetails';
import { PostCardProps } from './PostCard';
import MarkdownVisualizer from './MarkdownVisualizer';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface DiscussionDetailsProps {
  discussion: PostCardProps | undefined;
  eventId: string;
}

const DiscussionDetails: React.FC<DiscussionDetailsProps> = ({
  discussion,
  eventId,
}) => {
  // Updated replies data to include replyTo
  const replies = [
    {
      author: { name: 'vitalik.eth', image: 'https://picsum.photos/200/300' },
      date: '2 days ago',
      content: 'Sei il miglior insegnante che ETHWarsaw abbia mai avuto.',
      likes: 133,
      replyTo: {
        author: { name: 'Frankkcap' },
        content: 'Fra sto tutto fatto',
      },
    },
    // Add more replies as needed
  ];

  const [selectedSort, setSelectedSort] = useState<string>('Hot');
  const [openReportModal, setOpenReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [openShareModal, setOpenShareModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      <Link href={`/events/${eventId}`} passHref>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
        >
          Back
        </Button>
      </Link>
      <Typography variant="h4">{discussion?.title}</Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          src={discussion?.author.image}
          alt={discussion?.author.name}
          sx={{ width: 32, height: 32 }}
        />
        <Stack direction="column" justifyContent="space-around">
          <Typography variant="body2">{discussion?.author.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {discussion?.date}
          </Typography>
        </Stack>
      </Stack>
      <MarkdownVisualizer content={discussion?.body || ''} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {discussion?.tags.map((tag, index) => (
          <TopicChip key={index} label={tag} selected={false} />
        ))}
      </Box>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<HeartIcon size={4} />}
            variant="contained"
            size="small"
          >
            {discussion?.likes}
          </Button>
          <Button
            startIcon={<FlagIcon size={4} />}
            variant="contained"
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
        <Button variant="contained" size="small">
          Reply
        </Button>
      </Stack>

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
                color={selectedReason === reason ? 'primary' : 'secondary'}
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
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
            {discussion?.replies}{' '}
            {discussion?.replies === 1 ? 'Reply' : 'Replies'}
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
        {replies.map((reply, index) => (
          <CommentDetails key={index} reply={reply} replyTo={reply.replyTo} />
        ))}
      </Stack>
    </Stack>
  );
};

export default DiscussionDetails;
