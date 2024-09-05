'use client';

import * as React from 'react';
import { Typography, Stack } from '@mui/material';
import {
  CalendarIcon,
  SessionIcon,
  ChatBubbleIcon,
  LockIcon,
} from 'components/icons';

interface SubbarProps {
  tabName: string;
  setTabName: (value: string | ((prevVar: string) => string)) => void;
  canViewSessions: boolean;
  canViewDiscussions: boolean;
}

const Subbar: React.FC<SubbarProps> = ({
  tabName,
  setTabName,
  canViewSessions,
  canViewDiscussions,
}) => {
  return (
    <Stack
      direction="row"
      paddingX={2}
      spacing={3}
      bgcolor="#222"
      height="45px"
      alignItems="center"
      borderBottom="1px solid rgba(255, 255, 255, 0.1)"
      position={'sticky'}
      top={'50px'}
      zIndex={3}
    >
      <Stack direction="row" spacing={2} height="100%">
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          borderBottom={tabName === 'About' ? '1px solid white' : 'none'}
          sx={{ cursor: 'pointer' }}
        >
          <CalendarIcon />
          <Typography
            onClick={() => setTabName('About')}
            color="white"
            variant="bodyMB"
          >
            About
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          borderBottom={tabName === 'Sessions' ? '1px solid white' : 'none'}
          sx={{ cursor: 'pointer' }}
        >
          {canViewSessions ? <SessionIcon /> : <LockIcon />}
          <Typography
            onClick={() => canViewSessions && setTabName('Sessions')}
            color="white"
            variant="bodyMB"
            sx={{ cursor: canViewSessions ? 'pointer' : 'not-allowed' }}
          >
            Sessions
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          borderBottom={tabName === 'Discussions' ? '1px solid white' : 'none'}
          sx={{ cursor: 'pointer' }}
        >
          {canViewDiscussions ? <ChatBubbleIcon /> : <LockIcon />}
          <Typography
            onClick={() => canViewDiscussions && setTabName('Discussions')}
            color="white"
            variant="bodyMB"
            sx={{ cursor: canViewDiscussions ? 'pointer' : 'not-allowed' }}
          >
            Discussions
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Subbar;
