import React, { useEffect, useState } from 'react';
import { Typography, TextField, Button, Stack, Box } from '@mui/material';
import TopicChip from './TopicChip';
import akashaSdk from '@/utils/akasha/akasha';
import { ZuButton } from '@/components/core';

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
  // Akasha User Authentication (required for creating a beam)
  const [userAuth, setUserAuth] = useState<
    | ({
        id?: string;
        ethAddress?: string;
      } & {
        isNewUser: boolean;
      })
    | null
  >(null);
  const [content, setContent] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    async function loginAkasha() {
      try {
        const authRes = await akashaSdk.api.auth.signIn({
          provider: 2,
          checkRegistered: false,
          resumeSignIn: false,
        });
        setUserAuth(authRes.data);
      } catch (error) {
        console.error('Error logging in to Akasha', error);
      }
    }

    if (!userAuth) {
      loginAkasha();
    }
  }, [userAuth]);

  const topics = [
    'Announcement',
    'TagOne',
    'Event',
    // Add more topics as needed
  ];

  const handleTopicClick = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleSubmit = () => {
    onReplySubmit(content, selectedTopics);
    setContent('');
    setSelectedTopics([]);
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2">
        {replyingTo ? `Reply to ${replyingTo}` : 'Create a reply'}
      </Typography>
      <Stack spacing={1}>
        <Typography variant="body1">Add topics</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {topics.map((topic) => (
            <TopicChip
              key={topic}
              label={topic}
              onClick={() => handleTopicClick(topic)}
              selected={selectedTopics.includes(topic)}
            />
          ))}
        </Box>
      </Stack>
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
