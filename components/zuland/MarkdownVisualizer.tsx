import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { Components } from 'react-markdown';

export const MarkdownVisualizer = ({
  content,
  isPreview = false,
}: {
  content: string;
  isPreview?: boolean;
}) => {
  const components: Components = isPreview
    ? {
        // Simplified components for preview
        img: () => null,
        table: () => null,
        thead: () => null,
        tbody: () => null,
        tr: () => null,
        th: () => null,
        td: () => null,
      }
    : {
        // Full components for non-preview
        img: ({ src, alt, width, height, ...props }) => (
          <Image
            src={src || ''}
            alt={alt || ''}
            width={width ? parseInt(width as string, 10) : 500}
            height={height ? parseInt(height as string, 10) : 300}
            style={{ maxWidth: '100%', height: 'auto' }}
            {...props}
          />
        ),
        table: ({ children }) => <Table sx={{ my: 2 }}>{children}</Table>,
        thead: ({ children }) => <TableHead>{children}</TableHead>,
        tbody: ({ children }) => <TableBody>{children}</TableBody>,
        tr: ({ children }) => <TableRow>{children}</TableRow>,
        th: ({ children }) => (
          <TableCell sx={{ fontWeight: 'bold' }}>{children}</TableCell>
        ),
        td: ({ children }) => <TableCell>{children}</TableCell>,
      };

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      remarkRehypeOptions={{ passThrough: ['link'] }}
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownVisualizer;
