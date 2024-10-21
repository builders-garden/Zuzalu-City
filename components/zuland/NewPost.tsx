'use client';

import React, { useState } from 'react';

import { createBeamFromBlocks, encodeSlateToBase64 } from '@/utils/akasha';
import { AkashaContentBlockBlockDef } from '@akashaorg/typings/lib/sdk/graphql-types-new';

import { Typography, TextField, Stack, InputAdornment } from '@mui/material';
import { ZuButton } from '@/components/core';
import AkashaCreateProfileModal from '@/components/modals/Zuland/AkashaCreateProfileModal';
import TopicList from './TopicList';

interface NewPostProps {
  eventId: string;
  onCancel: () => void;
  onPostCreated: () => void;
}

const NewPost: React.FC<NewPostProps> = ({
  eventId,
  onCancel,
  onPostCreated,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const MAX_TITLE_LENGTH = 300;
  const MAX_CONTENT_LENGTH = 10000;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setTitle(newTitle);
  };

  const handleSubmit = async () => {
    try {
      await createBeamPassingBlocks();
      onPostCreated();
    } catch (error) {
      console.error('Error creating beam', error);
      onCancel();
    }
  };

  async function createBeamPassingBlocks() {
    if (!title || !content) {
      throw new Error('Beam title and content are required');
    }
    try {
      await createBeamFromBlocks({
        eventId,
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
        tags: selectedTopics.map((topic) => ({
          labelType: '@bg/zuland#tag',
          value: topic,
        })),
      });
    } catch (err) {
      console.error('createBeamFromBlocks error', err);
      throw err;
    }
  }

  return (
    <>
      <Stack spacing={3}>
        <Typography variant="h4">Create a new post</Typography>
        <Stack spacing={1}>
          <Typography variant="body1">Title</Typography>
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

        <TopicList
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
        />

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
            inputProps={{
              maxLength: MAX_CONTENT_LENGTH,
            }}
            helperText={`${MAX_CONTENT_LENGTH - content.length} characters remaining`}
            FormHelperTextProps={{
              sx: { textAlign: 'right' },
            }}
          />
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <ZuButton onClick={onCancel}>Cancel</ZuButton>
          <ZuButton
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!title || !content}
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
      <AkashaCreateProfileModal eventId={eventId} />
    </>
  );
};

export default NewPost;
