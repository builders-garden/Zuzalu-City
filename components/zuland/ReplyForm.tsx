import React, { useEffect, useRef } from 'react';

import { Typography, Stack } from '@mui/material';
import { ZuButton } from '@/components/core';

import { useAkashaAuthStore } from '@/hooks/zuland-akasha-store';
import AkashaCreateProfileModal from '../modals/Zuland/AkashaCreateProfileModal';
import SlateEditorBlock, { SlateEditorBlockRef } from './SlateEditorBlock';
import { IPublishData } from '@akashaorg/typings/lib/ui';

interface ReplyFormProps {
  eventId: string;
  onCancel: () => void;
  onReplySubmit: (
    content: IPublishData[],
    topics: string[],
    parentReflectionId?: string,
  ) => void;
  replyingTo?: string;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  eventId,
  onCancel,
  onReplySubmit,
  replyingTo,
}) => {
  const editorBlockRef = useRef<SlateEditorBlockRef>(null);
  const { currentAkashaUserStats } = useAkashaAuthStore();
  const { currentAkashaUser, loginAkasha } = useAkashaAuthStore();

  useEffect(() => {
    if (!currentAkashaUser) {
      loginAkasha();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAkashaUser]);

  const handleSubmit = () => {
    const editorsContent = editorBlockRef.current?.getAllContents() || [];
    onReplySubmit(editorsContent, []);
  };

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="body2">
          {replyingTo ? `Reply to ${replyingTo}` : 'Create a reply'}
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body1">Compose your reply</Typography>
          {currentAkashaUserStats?.akashaProfile?.did ? (
            <SlateEditorBlock
              authenticatedDID={currentAkashaUserStats.akashaProfile.did.id}
              ref={editorBlockRef}
            />
          ) : null}
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

export default ReplyForm;
