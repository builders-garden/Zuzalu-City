import React, { useEffect, useState } from 'react';

import { Typography, TextField, Stack } from '@mui/material';
import { ZuButton } from '@/components/core';

import { useAkashaAuthStore } from '@/hooks/zuland-akasha-store';

interface ReplyFormProps {
  onCancel: () => void;
  onReplySubmit: (
    content: string,
    topics: string[],
    parentReflectionId?: string,
  ) => void;
  replyingTo?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onCancel,
  onReplySubmit,
  replyingTo,
}) => {
  const { currentAkashaUser, loginAkasha } = useAkashaAuthStore();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (!currentAkashaUser) {
      loginAkasha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAkashaUser]);

  const handleSubmit = () => {
    onReplySubmit(content, []);
    setContent('');
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        {replyingTo ? `Reply to ${replyingTo}` : 'Create a reply'}
      </Typography>
      <Stack spacing={1}>
        <Typography variant="body1">Compose your reply</Typography>
        <TextField
          fullWidth
          label="Body"
          variant="outlined"
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your reply here..."
        />
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <ZuButton
          onClick={onCancel}
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
          Cancel
        </ZuButton>
        <ZuButton
          onClick={handleSubmit}
          disabled={!content}
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
          Post
        </ZuButton>
      </Stack>
    </Stack>
  );
};

export default ReplyForm;
