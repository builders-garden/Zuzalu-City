import { ChatBubbleIcon, HeartIcon } from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Box,
  Button,
  IconButton,
} from '@mui/material';
import TopicChip from './TopicChip';

interface PostCardProps {
  title: string;
  body: string;
  author: {
    name: string;
    image: string;
  };
  date: string;
  tags: string[];
  image?: string;
  likes: number;
  comments: number;
}

const PostCard = ({
  title,
  body,
  author,
  date,
  tags,
  image,
  likes,
  comments,
}: PostCardProps) => {
  const getDaysAgo = (dateString: string): string => {
    const postDate = new Date(dateString);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - postDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays > 30) return `${Math.floor(diffDays / 30)} months ago`;
    if (diffDays > 7) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${diffDays} days ago`;
  };

  const daysAgo = getDaysAgo(date);

  return (
    <Card
      sx={{
        bgcolor: 'grey.800',
        color: 'white',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'grey.600',
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2}>
          {image && (
            <Box
              component="img"
              src={image}
              alt={title}
              sx={{
                width: 176,
                height: 176,
                objectFit: 'cover',
                borderRadius: '10px',
              }}
            />
          )}
          <Stack flex={1} justifyContent="space-between">
            <Stack direction="row" spacing="8px" alignItems="center" mb={2}>
              <Avatar
                src={author.image}
                alt={author.name}
                sx={{ width: 18, height: 18 }}
              />
              <Typography variant="body2">{author.name}</Typography>
              <Typography variant="caption" color="grey.400">
                /
              </Typography>
              <Typography variant="caption" color="grey.500">
                {daysAgo}
              </Typography>
            </Stack>
            <Typography variant="h6" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body2" color="grey.500" mb={2}>
              {body.length > 358 ? `${body.slice(0, 358)}...` : body}
            </Typography>
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
              <Stack direction="row" spacing="10px" alignItems="center">
                <PostButton
                  icon={<HeartIcon size={4} />}
                  label={`${likes}`}
                  onClick={() => {}}
                />
                <PostButton
                  icon={<ChatBubbleIcon size={4} />}
                  label={`${comments}`}
                  onClick={() => {}}
                />
                <PostButton
                  icon={<ArrowUpOnSquareIcon size={3} />}
                  onClick={() => {}}
                />
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
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
      variant="contained"
      startIcon={icon}
      onClick={onClick}
      size="small"
      sx={{
        backgroundColor: 'primary.main',
        padding: '10px',
        width: '32px',
        height: '32px',
      }}
    >
      <Typography variant="caption">{label}</Typography>
    </Button>
  );
};

export default PostCard;
