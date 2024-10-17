import React, { useState, useRef } from 'react';
import { Stack, Typography, Avatar, Button, Divider } from '@mui/material';
import { ChatBubbleIcon } from '@/components/icons';
import { ArrowUpOnSquareIcon } from '@/components/icons/ArrowUpOnSquare';
import ReplyForm from './ReplyForm';
import {
  AkashaReadableImageBlockContent,
  standardDateFormat,
  ZulandReadableReflection,
} from '@/utils/akasha';
import Image from 'next/image';

interface CommentDetailsProps {
  reflection: ZulandReadableReflection;
  parentReflection?: ZulandReadableReflection;
  onReply: (
    content: string,
    topics: string[],
    parentReflectionId: string,
  ) => void;
}

const CommentDetails: React.FC<CommentDetailsProps> = ({
  reflection,
  parentReflection,
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
    onReply(content, topics, reflection.id);
    setShowReplyForm(false);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          src={reflection.author.akashaProfile.avatar?.default.src}
          alt={reflection.author.akashaProfile.name}
          sx={{ width: 32, height: 32 }}
        />
        <Stack>
          <Typography variant="body2">
            {reflection.author.akashaProfile.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {standardDateFormat(reflection.createdAt)}
          </Typography>
        </Stack>
      </Stack>
      {parentReflection && (
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
              src={parentReflection.author.akashaProfile.avatar?.default.src}
              alt={parentReflection.author.akashaProfile.name}
              sx={{ width: 18, height: 18 }}
            />
            <Typography variant="body2" fontWeight="bold">
              {parentReflection.author.akashaProfile.name}
            </Typography>
          </Stack>
          <Typography variant="body2" noWrap>
            {JSON.stringify(parentReflection.content)}
          </Typography>
        </Stack>
      )}
      {reflection.content.map((block, key) => {
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
      {/* <Typography variant="body1">{reflection.content}</Typography> */}
      <Stack direction="row" spacing={2}>
        {/* <Button
          startIcon={<HeartIcon size={4} />}
          variant="contained"
          size="small"
        >
          {reflection.likes}
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
      {showReplyForm && (
        <div>
          <ReplyForm
            onCancel={() => setShowReplyForm(false)}
            onSubmit={handleReplySubmit}
            replyingTo={reflection.author.akashaProfile.name}
          />
          <div ref={replyFormRef} />
        </div>
      )}
      <Divider />
    </Stack>
  );
};

export default CommentDetails;
