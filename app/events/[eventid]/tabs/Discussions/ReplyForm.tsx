import React, { useEffect, useState } from 'react';
import { Typography, TextField, Button, Stack, Box } from '@mui/material';
import TopicChip from './TopicChip';
import akashaSdk from '@/utils/akasha/akasha';

interface ReplyFormProps {
  onCancel: () => void;
  onSubmit: (content: string, topics: string[]) => void;
  replyingTo?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  onCancel,
  onSubmit,
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
        console.log('auth res can', authRes);
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
    onSubmit(content, selectedTopics);
    setContent('');
    setSelectedTopics([]);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">
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
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!content}
        >
          Post
        </Button>
      </Stack>
    </Stack>
  );
};

export default ReplyForm;
