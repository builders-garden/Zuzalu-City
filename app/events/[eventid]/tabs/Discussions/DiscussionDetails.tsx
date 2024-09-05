import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import {
  HeartIcon,
  ChatBubbleIcon,
  FlagIcon,
  FireIcon,
  ArrowUpCircleIcon,
  SparklesIcon,
  ArrowDownIcon,
} from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TopicChip from './TopicChip';
import Link from 'next/link';
import SortChip from './SortChip';
import CommentDetails from './CommentDetails';
import { PostCardProps } from './PostCard';
import MarkdownVisualizer from './MarkdownVisualizer';

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

  const handleSortClick = (sort: string) => {
    setSelectedSort(sort);
  };

  return (
    <Stack spacing={3}>
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
          >
            Report
          </Button>
          <Button
            startIcon={<ArrowUpOnSquareIcon size={4} />}
            variant="contained"
            size="small"
          >
            Share
          </Button>
        </Stack>
        <Button variant="contained" size="small">
          Reply
        </Button>
      </Stack>

      {/* Reply section */}
      <Stack
        direction="row"
        gap={1}
        alignItems="center"
        justifyContent="space-between"
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
          </Box>
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
