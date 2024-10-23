import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

import {
  getReadableReflectionsByReflectionId,
  standardDateFormat,
  ZulandReadableReflection,
} from '@/utils/akasha';

import { Stack, Typography, Avatar, Divider } from '@mui/material';
import { Box } from '@mui/material';
import { ZuButton } from '@/components/core';

import ReplyForm from './ReplyForm';
import { ChatBubbleIcon } from '@/components/icons';

interface CommentDetailsProps {
  eventId: string;
  reflection: ZulandReadableReflection;
  onReplySubmit: (
    content: string,
    topics: string[],
    parentReflectionId?: string,
  ) => void;
}

const CommentDetails: React.FC<CommentDetailsProps> = ({
  eventId,
  reflection,
  onReplySubmit,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyFormRef = useRef<HTMLDivElement>(null);

  const { data: childReflections } = useQuery({
    queryKey: ['childReflections', reflection.id],
    queryFn: async () => {
      try {
        return await getReadableReflectionsByReflectionId(reflection.id);
      } catch (error) {
        console.error('Error getting child reflections:', error);
        return {
          pageInfo: null,
          edge: [],
        };
      }
    },
  });

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
    onReplySubmit(content, topics, reflection.id);
    setShowReplyForm(false);
  };

  return (
    <Box flexGrow={1} sx={{ padding: '10px 0px' }}>
      <Stack spacing={2} sx={{ marginLeft: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={reflection.author.akashaProfile?.avatar?.default.src}
            alt={reflection.author.akashaProfile?.name}
            sx={{ width: 32, height: 32 }}
          />
          <Stack>
            <Typography variant="body2">
              {reflection.author.akashaProfile?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {standardDateFormat(reflection.createdAt)}
            </Typography>
          </Stack>
        </Stack>
        {reflection.content.map((block, key) => {
          switch (block.propertyType) {
            case 'slate-block':
              return (
                <Typography key={key} variant="body1">
                  {typeof block.value !== 'string' &&
                    block.value &&
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
                    alt={block.value.caption ?? ''}
                    width={block.value.images[0].size.width}
                    height={block.value.images[0].size.height}
                  />
                )
              );
            default:
              return `Unable to render block of type ${(block as any).propertyType}`;
          }
        })}
        <Stack direction="row" spacing={2}>
          <ZuButton
            onClick={handleReplyClick}
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
            <ChatBubbleIcon size={4} />
            Reply
          </ZuButton>
        </Stack>
        {showReplyForm && (
          <div>
            <ReplyForm
              eventId={eventId}
              onCancel={() => setShowReplyForm(false)}
              onReplySubmit={handleReplySubmit}
              replyingTo={reflection.author.akashaProfile?.name}
            />
            <div ref={replyFormRef} />
          </div>
        )}
        {childReflections && childReflections.edge.length > 0 && (
          <Stack spacing={1}>
            {childReflections.edge.map((childReflection) => (
              <Stack
                key={childReflection.node.id}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                sx={{
                  backgroundColor: 'rgba(215, 255, 196, 0.05)',
                }}
              >
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ ml: 1, width: 2 }}
                  color="#D7FFC4"
                />
                <CommentDetails
                  eventId={eventId}
                  reflection={childReflection.node}
                  onReplySubmit={handleReplySubmit}
                />
              </Stack>
            ))}
          </Stack>
        )}
        <Divider />
      </Stack>
    </Box>
  );
};

export default CommentDetails;
