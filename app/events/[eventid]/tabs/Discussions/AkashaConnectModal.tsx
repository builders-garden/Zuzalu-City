'use client';

import { useState, Dispatch, SetStateAction, useEffect } from 'react';
import { ZuButton, ZuInput } from '@/components/core';
import akashaSdk from '@/utils/akasha/akasha';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';

interface AkashaConnectModalProps {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setShowAuthenticatedPart: () => void;
  setParentUserAuth: Dispatch<
    SetStateAction<
      | ({
          id?: string;
          ethAddress?: string;
        } & {
          isNewUser?: boolean;
        })
      | undefined
    >
  >;
}

export default function AkashaConnectModal({
  showModal,
  setShowModal,
  setShowAuthenticatedPart,
  setParentUserAuth,
}: AkashaConnectModalProps) {
  // akasha user auth
  const [localUserAuth, setLocalUserAuth] = useState<
    | ({
        id?: string;
        ethAddress?: string;
      } & {
        isNewUser: boolean;
      })
    | undefined
  >(undefined);

  async function loginAkasha() {
    const authRes = await akashaSdk.api.auth.signIn({
      provider: 2,
      checkRegistered: true,
      resumeSignIn: false,
    });
    setLocalUserAuth(authRes.data ? authRes.data : undefined);
    setParentUserAuth(authRes.data ? authRes.data : undefined);
  }

  // useEffect(() => {
  //   async function test() {
  //     const result = await akashaSdk.api.auth.getToken();
  //     console.log('result', result);
  //     const result2 = await akashaSdk.api.auth.getCurrentUser();
  //   }
  //   test();
  // }, []);

  // useEffect(() => {
  //   async function loginAkasha() {
  //     const authRes = await akashaSdk.api.auth.signIn({
  //       provider: 2,
  //       checkRegistered: false,
  //       resumeSignIn: false,
  //     });
  //     setUserAuth(authRes.data);
  //   }

  //   if (!userAuth) {
  //     loginAkasha();
  //   }
  // }, [userAuth]);

  const handleCreateProfile = async () => {};

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
          zIndex: 0,
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
        To be able to write and comment on posts, you need to connect to Akasha
        ecosystem.
      </DialogTitle>
      <DialogContent style={{ width: '100%', color: 'white', padding: '10px' }}>
        <Stack
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          <Typography fontSize={'18px'}>
            Please click on sign in to proceed
          </Typography>
          {/* <Typography fontSize={'18px'}>Description</Typography>
          <ZuInput
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={appAlreadyExists}
          /> */}
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
          onClick={() => {
            loginAkasha()
              .then(() => {
                setShowModal(false);
                setShowAuthenticatedPart();
              })
              .catch((err) => {
                console.log('err', err);
              });
          }}
          disabled={false}
        >
          Sign In
        </ZuButton>
      </DialogActions>
    </Dialog>
  );
}
