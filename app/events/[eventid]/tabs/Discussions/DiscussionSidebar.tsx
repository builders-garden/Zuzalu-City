import { Post } from '@/utils/akasha/beam-to-markdown';
import { Box, Card, Stack, Typography } from '@mui/material';
import Link from 'next/link';
interface SidebarProps {
  discussion: Post | undefined;
}

const DiscussionSidebar = ({ discussion }: SidebarProps) => {
  return (
    <Stack spacing={3} sx={{ position: 'sticky', top: 20, padding: '1rem' }}>
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
        <Stack direction="row" spacing={1}>
          <Link
            href={`https://x.com/${discussion?.author.akashaProfile.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            X
          </Link>
          <Link
            href={`https://discord.gg/${discussion?.author.akashaProfile.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Discord
          </Link>
          <Link
            href={`https://t.me/${discussion?.author.akashaProfile.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Telegram
          </Link>
          <Link
            href={`https://warpcast.com/${discussion?.author.akashaProfile.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            Farcaster
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
        <Stack direction="row" spacing={1} width="100%">
          <Card
            sx={{
              bgcolor: 'transparent',
              padding: '1vrem 2rem',
              width: '100%',
            }}
          >
            <Typography variant="body2">Zuitzerland</Typography>
          </Card>
          <Card
            sx={{ bgcolor: 'transparent', padding: '1rem 2rem', width: '100%' }}
          >
            <Typography variant="body2">ZuVillage Georgia</Typography>
          </Card>
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
    </Stack>
  );
};

export default DiscussionSidebar;
