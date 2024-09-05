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

export const MarkdownVisualizer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
      remarkRehypeOptions={{ passThrough: ['link'] }}
      components={{
        img: ({ node, ...props }) => (
          <Image
            src={props.src || ''}
            alt={props.alt || ''}
            width={300}
            height={200}
            style={{ maxWidth: '100%', height: 'auto' }}
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownVisualizer;
