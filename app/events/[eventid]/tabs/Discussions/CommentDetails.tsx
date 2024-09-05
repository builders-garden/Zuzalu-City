import React from 'react';
import { Stack, Typography, Avatar, Button, Divider } from '@mui/material';
import { HeartIcon, ChatBubbleIcon } from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';

interface CommentDetailsProps {
  reply: {
    author: {
      name: string;
      image: string;
    };
    date: string;
    content: string;
    likes: number;
  };
  replyTo?: {
    author: {
      name: string;
      image?: string;
    };
    content: string;
  };
}

const CommentDetails: React.FC<CommentDetailsProps> = ({ reply, replyTo }) => {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          src={reply.author.image}
          alt={reply.author.name}
          sx={{ width: 32, height: 32 }}
        />
        <Stack>
          <Typography variant="body2">{reply.author.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {reply.date}
          </Typography>
        </Stack>
      </Stack>
      {replyTo && (
        <Stack
          spacing={1}
          sx={{
            backgroundColor: 'rgba(215, 255, 196, 0.1)',
            padding: 2,
            borderRadius: 1,
            borderLeft: '2px solid #D7FFC4',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={replyTo.author.image}
              alt={replyTo.author.name}
              sx={{ width: 18, height: 18 }}
            />
            <Typography variant="body2" fontWeight="bold">
              {replyTo.author.name}
            </Typography>
          </Stack>
          <Typography variant="body2" noWrap>
            {replyTo.content}
          </Typography>
        </Stack>
      )}
      <Typography variant="body1">{reply.content}</Typography>
      <Stack direction="row" spacing={2}>
        <Button
          startIcon={<HeartIcon size={4} />}
          variant="contained"
          size="small"
        >
          {reply.likes}
        </Button>
        <Button
          startIcon={<ChatBubbleIcon size={4} />}
          variant="contained"
          size="small"
        >
          Reply
        </Button>
        <Button
          startIcon={<ArrowUpOnSquareIcon size={4} />}
          variant="contained"
          size="small"
        >
          Share
        </Button>
      </Stack>
      <Divider />
    </Stack>
  );
};

export default CommentDetails;
