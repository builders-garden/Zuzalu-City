'use client';

import React, {
  createRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useRef,
} from 'react';
import EditorBox, { EditorActions } from '@/components/zuland/EditorBox';
import { type IPublishData } from '@akashaorg/typings/lib/ui';
import { encodeSlateToBase64 } from '@/utils/akasha';
import Button from '@mui/material/Button';
import { Box, Icon, IconButton, Stack } from '@mui/material';
import { TrashcanIcon } from '@/components/icons';

interface SlateEditorBlockProps {
  authenticatedDID: string;
}

export type SlateEditorBlockRef = {
  getAllContents: () => IPublishData[];
};

export const SlateEditorBlock = forwardRef<
  SlateEditorBlockRef,
  SlateEditorBlockProps
>(({ authenticatedDID }, ref) => {
  const editorBlockRef = useRef<EditorActions[]>([]);

  const [editors, setEditors] = useState<
    {
      key: number;
      ref: React.RefObject<EditorActions>;
    }[]
  >([
    {
      key: 0,
      ref: createRef<EditorActions>(),
    },
  ]);

  const onPublish = (data: IPublishData) => {
    console.log('onPublish', data);
  };

  const addEditor = () => {
    setEditors((prevEditors) => [
      ...prevEditors,
      {
        key: prevEditors.length,
        ref: createRef<EditorActions>(),
      },
    ]);
  };

  const removeEditor = (key: number) => {
    setEditors((prevEditors) => prevEditors.filter((p) => p.key !== key));
  };

  useImperativeHandle(
    ref,
    () => ({
      getAllContents: () => {
        return editors
          .map((_, index) => {
            return editorBlockRef.current[index]?.getContent() ?? null;
          })
          .filter((content) => content !== null);
      },
    }),
    [editors],
  );

  return (
    <Box>
      {editors.map((editor, index) => (
        <Box key={editor.key} mb={2}>
          <EditorBox
            showAvatar={false}
            profileId={authenticatedDID}
            placeholderLabel={'Write here'}
            maxEncodedLengthErrLabel={
              'Text block exceeds line limit, please review!'
            }
            withMeter={true}
            withToolbar={true}
            showPostButton={false}
            showCancelButton={false}
            initialEditorValue={undefined}
            editorActionsRef={editor.ref}
            handleDisablePublish={() => false}
            encodingFunction={encodeSlateToBase64}
            onPublish={onPublish}
            ref={(el) => {
              if (el) {
                editorBlockRef.current[index] = el;
              }
            }}
          />
          {index > 0 && (
            <Stack alignItems="flex-end" width="100%">
              <IconButton
                onClick={() => removeEditor(editor.key)}
                sx={{
                  width: '2rem',
                  height: '2rem',
                }}
              >
                <Icon>
                  <TrashcanIcon />
                </Icon>
              </IconButton>
            </Stack>
          )}
        </Box>
      ))}
      <Button variant="contained" color="primary" onClick={addEditor}>
        Add Block
      </Button>
    </Box>
  );
});

SlateEditorBlock.displayName = 'SlateEditorBlock';

export default SlateEditorBlock;
