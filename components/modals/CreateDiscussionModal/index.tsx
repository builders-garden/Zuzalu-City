'use client';

import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { ZuButton, ZuInput } from '@/components/core';
import akashaSdk, {
  createApp,
  createAppRelease,
  getAppByEventId,
} from '@/utils/akasha/akasha';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

interface CreateDiscussionModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  eventId: string;
  eventName: string;
  eventDescription: string;
}

export default function CreateDiscussionModal({
  showModal,
  setShowModal,
  eventId,
  eventName,
  eventDescription,
}: CreateDiscussionModalProps) {
  const [displayName, setDisplayName] = useState<string>(eventName);
  const [description, setDescription] = useState<string>(eventDescription);
  const [appAlreadyExists, setAppAlreadyExists] = useState<boolean>(false);
  useEffect(() => {
    async function checkAppExists() {
      const appAlreadyExists = await getAppByEventId(eventId);
      console.log('appAlreadyExists', appAlreadyExists);
      if (appAlreadyExists) {
        console.log('app already exists');
        setAppAlreadyExists(true);
        setDisplayName(appAlreadyExists.name);
        setDescription(appAlreadyExists.description);
      }
    }
    checkAppExists();
  }, [eventId]);

  // akasha user auth
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
      const authRes = await akashaSdk.api.auth.signIn({
        provider: 2,
        checkRegistered: false,
        resumeSignIn: false,
      });
      console.log('auth res can', authRes);
      setUserAuth(authRes.data);
    }

    if (!userAuth) {
      loginAkasha();
    }
  }, [userAuth]);

  const handleCreateDiscussion = async () => {
    const appAlreadyExists = await getAppByEventId(eventId);
    if (appAlreadyExists) {
      console.log('app already exists');
      return;
    }
    const createAppResult = await createApp({
      eventID: eventId,
      displayName: displayName,
      description: description,
    });
    console.log('createAppResult', createAppResult);
    if (createAppResult) {
      const createAppReleaseResult = await createAppRelease({
        applicationID: createAppResult?.document.id,
        source: `https://zuzalu.city/events/${eventId}`,
        version: '1.0.0',
      });
      console.log('createAppReleaseResult', createAppReleaseResult);
    }
  };

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <Dialog
      open={showModal}
      onClose={onClose}
      PaperProps={{
        style: {
          width: '692px',
          height: 'auto',
          padding: '20px 16px',
          backgroundColor: 'rgba(34, 34, 34, 0.9)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(40px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '20px',
          margin: '0px',
          maxWidth: 'unset',
        },
      }}
    >
      <DialogTitle
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          fontSize: '25px',
          fontWeight: 'bold',
        }}
      >
        {appAlreadyExists
          ? 'Discussion already exists'
          : 'Create a Discussion for this event'}
      </DialogTitle>
      <DialogContent style={{ width: '100%', color: 'white', padding: '10px' }}>
        <Stack
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <Typography fontSize={'18px'}>Display Name</Typography>
          <ZuInput
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={appAlreadyExists}
          />
          <Typography fontSize={'18px'}>Description</Typography>
          <ZuInput
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={appAlreadyExists}
          />
        </Stack>
      </DialogContent>
      <DialogActions
        style={{
          justifyContent: 'center',
          width: '100%',
          padding: 0,
          flexDirection: 'column',
        }}
      >
        <ZuButton
          sx={{
            width: '100%',
            fontSize: '18px',
          }}
          onClick={handleCreateDiscussion}
          disabled={appAlreadyExists}
        >
          Create
        </ZuButton>
      </DialogActions>
    </Dialog>
  );
}
