import { ChatBubbleIcon, HeartIcon } from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';
import {
  Stack,
  Typography,
  Card,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import TopicChip from './TopicChip';
import { CardContent } from '@mui/material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import MarkdownVisualizer from './MarkdownVisualizer';
import { Post } from '@/utils/akasha/beam-to-markdown';

const CardContentCustom = styled(CardContent)(({ theme }) => ({
  padding: '10px',
  '&:last-child': {
    paddingBottom: '10px',
  },
}));

const getDaysAgo = (dateString: string): string => {
  const postDate = new Date(dateString);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - postDate.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 30) return `${Math.floor(diffDays / 30)} months ago`;
  if (diffDays > 7) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${diffDays} days ago`;
};

const PostCard = ({
  eventId,
  id,
  title,
  body,
  author,
  createdAt,
  tags = [],
  replies = 0,
}: Post) => {
  const daysAgo = getDaysAgo(createdAt);

  return (
    <Link
      href={`/events/${eventId}?tab=discussions&postId=${id}`}
      style={{
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          width: '100%',
          padding: '10px',
          color: 'white',
          borderRadius: 2,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardContentCustom sx={{ padding: '10px' }}>
          <Box sx={{ padding: 0, display: 'flex' }} gap={2}>
            <Stack flex={1} justifyContent="space-between" gap={2}>
              <Stack direction="row" spacing="8px" alignItems="center">
                <Typography variant="body2">
                  {author.akashaProfile.name}
                </Typography>
                <Typography variant="caption" color="grey.400">
                  /
                </Typography>
                <Typography variant="caption" color="grey.500">
                  {daysAgo}
                </Typography>
              </Stack>
              <Stack direction="column" gap={0}>
                <Typography variant="h6" gutterBottom>
                  {title}
                </Typography>

                <Box
                  sx={{
                    minHeight: '55px',
                    color: 'grey.500',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: '6',
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  <MarkdownVisualizer content={body} isPreview={true} />
                </Box>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  {tags.map((tag, index) => (
                    <TopicChip key={index} label={tag} selected={false} />
                  ))}
                </Box>
                <Stack
                  direction="row"
                  spacing="10px"
                  alignItems="center"
                  justifyContent="flex-end"
                >
                  <PostButton
                    icon={<ChatBubbleIcon size={4} />}
                    label={`${replies}`}
                    onClick={() => {}}
                  />
                  <PostButton
                    icon={<ArrowUpOnSquareIcon size={4} />}
                    onClick={() => {}}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </CardContentCustom>
      </Box>
    </Link>
  );
};

const PostButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactElement;
  label?: string;
  onClick: () => void;
}) => {
  if (!label) {
    return (
      <IconButton
        onClick={onClick}
        size="small"
        color="inherit"
        sx={{
          backgroundColor: 'primary.main',
          padding: '8px',
          width: '32px',
          height: '32px',
          borderRadius: '10px',
        }}
      >
        {icon}
      </IconButton>
    );
  }
  return (
    <Button
      color="inherit"
      startIcon={icon}
      onClick={onClick}
      sx={{
        backgroundColor: 'primary.main',
        height: '32px',
        borderRadius: '10px',
      }}
    >
      <Typography variant="caption">{label}</Typography>
    </Button>
  );
};

export default PostCard;
