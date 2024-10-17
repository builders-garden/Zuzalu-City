import { ZuButton } from '@/components/core';
import {
  DiscordIcon,
  FarcasterIcon,
  TelegramIcon,
  TwitterIcon,
  XMarkIcon,
} from '@/components/icons';
import { Post } from '@/utils/akasha/beam-to-markdown';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';

interface SidebarProps {
  handleClose: () => void;
  discussion: Post | undefined;
}

const DiscussionSidebar = ({ discussion, handleClose }: SidebarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: '#222222',
        padding: '10px',
      }}
      role="presentation"
      zIndex="10"
      borderLeft="1px solid #383838"
    >
      <Box
        display="flex"
        alignItems="center"
        height="50px"
        justifyContent="space-between"
        borderBottom="1px solid #383838"
        paddingX={3}
        gap={2}
      >
        <Typography variant="subtitleSB">Profile</Typography>
        <ZuButton
          startIcon={<XMarkIcon />}
          onClick={handleClose}
          sx={{
            backgroundColor: 'transparent',
          }}
        >
          Close
        </ZuButton>
      </Box>

      <Box display="flex" flexDirection="column" gap="20px" padding={3}>
        <Box bgcolor="#262626" borderRadius="10px" padding="20px">
          <Typography variant="h6">
            {discussion?.author.akashaProfile.id.slice(0, 6)}
          </Typography>
          <Typography variant="body2">
            {discussion?.author.akashaProfile.description}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle2">Address</Typography>
            <Typography variant="body2" color="text.primary">
              {`${discussion?.author.akashaProfile.id.slice(0, 6)}...${discussion?.author.akashaProfile.id.slice(-4)}`}
            </Typography>
          </Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              borderTop: '1px solid',
              borderColor: 'primary.light',
              paddingTop: '10px',
            }}
          >
            <Typography variant="subtitle2">Socials</Typography>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="center"
              alignItems="center"
              sx={{ padding: '10px' }}
            >
              <Link
                href={`https://x.com/${discussion?.author.akashaProfile.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ZuButton
                  sx={{
                    color: 'white',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '10px 10px',
                  }}
                >
                  <TwitterIcon width="20px" height="20px" />
                </ZuButton>
              </Link>
              <Link
                href={`https://discord.gg/${discussion?.author.akashaProfile.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ZuButton
                  sx={{
                    color: 'white',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '10px 10px',
                  }}
                >
                  <DiscordIcon width="20px" height="20px" />
                </ZuButton>
              </Link>
              <Link
                href={`https://t.me/${discussion?.author.akashaProfile.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ZuButton
                  sx={{
                    color: 'white',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '10px 10px',
                  }}
                >
                  <TelegramIcon width="20px" height="20px" />
                </ZuButton>
              </Link>
              <Link
                href={`https://warpcast.com/${discussion?.author.akashaProfile.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <ZuButton
                  sx={{
                    color: 'white',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '10px 10px',
                  }}
                >
                  <FarcasterIcon width="20px" height="20px" />
                </ZuButton>
              </Link>
            </Stack>
          </Stack>
          <Stack
            direction="column"
            sx={{
              borderTop: '1px solid',
              borderColor: 'primary.light',
              paddingTop: '10px',
            }}
          >
            <Typography variant="subtitle2">Events</Typography>
            <Stack
              direction={isMobile ? 'column' : 'row'}
              spacing={1}
              width="100%"
              sx={{ padding: '10px' }}
            >
              <ZuButton
                sx={{
                  width: '100%',
                  padding: '10px 20px',
                  borderRadius: '10px',
                }}
              >
                <Typography variant="body2">Zuitzerland</Typography>
              </ZuButton>
              <ZuButton
                sx={{
                  width: '100%',
                  padding: '10px 20px',
                  borderRadius: '10px',
                }}
              >
                <Typography variant="body2">ZuVillage Georgia</Typography>
              </ZuButton>
            </Stack>
          </Stack>
          <Stack
            direction="column"
            sx={{
              borderTop: '1px solid',
              borderColor: 'primary.light',
              paddingTop: '10px',
            }}
          >
            <Typography variant="subtitle2">Last Messages</Typography>
            <Typography variant="body2" color="text.secondary">
              List of last messages...
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default DiscussionSidebar;
