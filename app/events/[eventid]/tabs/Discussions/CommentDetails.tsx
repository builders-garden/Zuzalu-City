import React, { useState, useRef } from 'react';
import { Stack, Typography, Avatar, Button, Divider } from '@mui/material';
import { HeartIcon, ChatBubbleIcon } from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';
import ReplyForm from './ReplyForm';
import {
  AkashaReadableImageBlockContent,
  AkashaReadableSlateBlockContent,
  standardDateFormat,
  ZulandReadableReflection,
} from '@/utils/akasha';
import Image from 'next/image';

interface CommentDetailsProps {
  reply: ZulandReadableReflection;
  replyTo?: {
    author: {
      name: string;
      image?: string;
    };
    content: string;
  };
  onReply: (commentId: string, content: string, topics: string[]) => void;
}

const CommentDetails: React.FC<CommentDetailsProps> = ({
  reply,
  replyTo,
  onReply,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);

  const handleReplyClick = () => {
    setShowReplyForm(true);
    setTimeout(() => {
      replyFormRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }, 0);
  };

  const handleReplySubmit = (content: string, topics: string[]) => {
    onReply(reply.id, content, topics);
    setShowReplyForm(false);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          src={reply.author.akashaProfile.avatar?.default.src}
          alt={reply.author.akashaProfile.name}
          sx={{ width: 32, height: 32 }}
        />
        <Stack>
          <Typography variant="body2">
            {reply.author.akashaProfile.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {standardDateFormat(reply.createdAt)}
          </Typography>
        </Stack>
      </Stack>
      {/* {replyTo && (
        <Stack
          spacing={1}
          sx={{
            backgroundColor: 'rgba(215, 255, 196, 0.1)',
            padding: 2,
            borderRadius: 1,
            borderLeft: '2px solid #D7FFC4',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={replyTo.author.image}
              alt={replyTo.author.name}
              sx={{ width: 18, height: 18 }}
            />
            <Typography variant="body2" fontWeight="bold">
              {replyTo.author.name}
            </Typography>
          </Stack>
          <Typography variant="body2" noWrap>
            {replyTo.content}
          </Typography>
        </Stack>
      )} */}
      {reply.content.map((block, key) => {
        switch (block.propertyType) {
          case 'slate-block':
            return (
              <Typography key={key} variant="body1">
                {typeof block.value !== 'string' &&
                  block.value.map((child, index) => (
                    <span key={index}>
                      {child.children.map((text, i) => (
                        <span
                          key={i}
                          style={{
                            fontStyle: text.italic ? 'italic' : 'normal',
                          }}
                        >
                          {text.text}
                        </span>
                      ))}
                    </span>
                  ))}
              </Typography>
            );
          case 'image-block':
            return (
              typeof block.value !== 'string' && (
                <Image
                  key={key}
                  src={block.value.images[0].src}
                  alt={
                    (block.value as AkashaReadableImageBlockContent).caption ??
                    ''
                  }
                />
              )
            );
          default:
            return `Unable to render block of type ${(block as any).propertyType}`;
        }
      })}
      {/* <Typography variant="body1">{reply.content}</Typography> */}
      <Stack direction="row" spacing={2}>
        {/* <Button
          startIcon={<HeartIcon size={4} />}
          variant="contained"
          size="small"
        >
          {reply.likes}
        </Button> */}
        <Button
          startIcon={<ChatBubbleIcon size={4} />}
          variant="contained"
          size="small"
          onClick={handleReplyClick}
        >
          Reply
        </Button>
        <Button
          startIcon={<ArrowUpOnSquareIcon size={4} />}
          variant="contained"
          size="small"
        >
          Share
        </Button>
      </Stack>
      {/* {showReplyForm && (
        <div>
          <ReplyForm
            onCancel={() => setShowReplyForm(false)}
            onSubmit={handleReplySubmit}
            replyingTo={reply.author.name}
          />
          <div ref={replyFormRef} />
        </div>
      )} */}
      <Divider />
    </Stack>
  );
};

export default CommentDetails;
