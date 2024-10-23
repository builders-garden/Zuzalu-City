'use client';

import React, { useState, useRef } from 'react';

import { useAkashaAuthStore } from '@/hooks/zuland-akasha-store';
import {
  createZulandBeamFromBlocks,
  encodeSlateToBase64,
} from '@/utils/akasha';

import { Typography, TextField, Stack, InputAdornment } from '@mui/material';
import { ZuButton } from '@/components/core';
import AkashaCreateProfileModal from '@/components/modals/Zuland/AkashaCreateProfileModal';
import TopicList from './TopicList';
import SlateEditorBlock, { SlateEditorBlockRef } from './SlateEditorBlock';
import { IPublishData } from '@akashaorg/typings/lib/ui';

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
  const { currentAkashaUser, currentAkashaUserStats } = useAkashaAuthStore();

  const [reopenCreateProfileModal, setReopenCreateProfileModal] =
    useState(false);
  const [title, setTitle] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const MAX_TITLE_LENGTH = 300;

  const editorBlockRef = useRef<SlateEditorBlockRef>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.slice(0, MAX_TITLE_LENGTH);
    setTitle(newTitle);
  };

  const handleSubmit = async () => {
    if (
      currentAkashaUser &&
      (!currentAkashaUserStats || !currentAkashaUserStats.akashaProfile)
    ) {
      setReopenCreateProfileModal(true);
      return;
    }
    try {
      const editorsContent = editorBlockRef.current?.getAllContents() || [];
      await createBeamPassingBlocks(editorsContent);
      onPostCreated();
    } catch (error) {
      console.error('Error creating beam', error);
      onCancel();
    }
  };

  async function createBeamPassingBlocks(editorContents: IPublishData[]) {
    if (!title || editorContents.length === 0) {
      throw new Error('Beam title and content are required');
    }
    try {
      const blocks = editorContents.map((content, index) => ({
        label: `beam-content-${index + 1}`,
        propertyType: 'slate-block',
        value: encodeSlateToBase64(content.slateContent),
      }));

      await createZulandBeamFromBlocks({
        eventId,
        blocks: [
          {
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
              ...blocks,
            ],
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
          {currentAkashaUserStats?.akashaProfile?.did ? (
            <SlateEditorBlock
              authenticatedDID={currentAkashaUserStats.akashaProfile.did.id}
              ref={editorBlockRef}
            />
          ) : null}
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <ZuButton onClick={onCancel}>Cancel</ZuButton>
          <ZuButton
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!title}
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
      <AkashaCreateProfileModal
        eventId={eventId}
        reOpen={reopenCreateProfileModal}
      />
    </>
  );
};

export default NewPost;
