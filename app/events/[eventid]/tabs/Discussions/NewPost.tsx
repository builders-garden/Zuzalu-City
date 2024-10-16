import React, { useEffect, useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Stack,
  Box,
  InputAdornment,
} from '@mui/material';
import TopicChip from './TopicChip';
import { createBeamFromBlocks, encodeSlateToBase64 } from '@/utils/akasha';
import { AkashaContentBlockBlockDef } from '@akashaorg/typings/lib/sdk/graphql-types-new';
import akashaSdk from '@/utils/akasha/akasha';

interface NewPostProps {
  eventId: string;
  onCancel: () => void;
}

const NewPost: React.FC<NewPostProps> = ({ eventId, onCancel }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const topics = [
    'Announcements',
    'Question',
    'Meetup',
    'Event',
    'Community information',
    'Coding',
    'Logistics',
    'Q&A',
    'Workshop',
    'Afterparty',
    'Other',
  ];

  const MAX_TITLE_LENGTH = 300;

  const handleTopicClick = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic],
    );
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setTitle(newTitle);
  };

  const handleSubmit = () => {
    // Implement post submission logic here
    console.log({ title, content, selectedTopics, eventId });
    try {
      createBeamPassingBlocks();
    } catch (error) {
      console.error('Error creating beam', error);
      onCancel(); // Go back to the discussions list after posting
    }
  };

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

  function createBeamPassingBlocks() {
    if (!title || !content) {
      throw new Error('Beam title and content are required');
    }
    createBeamFromBlocks({
      appID: 'k2t6wzhkhabz0onog2r6n2zwtxvfn497xne1eiozqjoqnxigqvizhvwgz5dykh',
      appVersionID:
        'k2t6wzhkhabz6lner6bf752deto2nuous4374g4powmfyn14vg36fkaymc9sbv',
      active: true,
      blocks: [
        {
          active: true,
          content: [
            {
              label: 'beam-title',
              propertyType: 'slate-block',
              value: encodeSlateToBase64([
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: title,
                    },
                  ],
                },
              ]),
            },
            {
              label: 'beam-content',
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
          createdAt: new Date().toISOString(),
          kind: AkashaContentBlockBlockDef.Text,
          nsfw: false,
          appVersionID:
            'k2t6wzhkhabz6lner6bf752deto2nuous4374g4powmfyn14vg36fkaymc9sbv',
        },
      ],
    })
      .then((res) => {
        console.log('createBeamFromBlocks res', res);
      })
      .catch((err) => {
        console.error('createBeamFromBlocks error', err);
      });
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Create a new discussion</Typography>
      <Stack spacing={1}>
        <Typography variant="body1">Write a title</Typography>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={handleTitleChange}
          inputProps={{
            maxLength: MAX_TITLE_LENGTH,
          }}
          helperText={`${MAX_TITLE_LENGTH - title.length} characters remaining`}
          FormHelperTextProps={{
            sx: { textAlign: 'right' },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {title.length}/{MAX_TITLE_LENGTH}
              </InputAdornment>
            ),
          }}
        />
      </Stack>
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
        <Typography variant="body1">Compose your post</Typography>
        <TextField
          fullWidth
          label="Content"
          variant="outlined"
          multiline
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
          disabled={!title || !content}
        >
          Post
        </Button>
      </Stack>
    </Stack>
  );
};

export default NewPost;
