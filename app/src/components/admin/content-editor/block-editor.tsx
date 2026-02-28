'use client';

import { TextBlockEditor } from './editors/text-block-editor';
import { CodeExampleEditor } from './editors/code-example-editor';
import { CodeChallengeEditor } from './editors/code-challenge-editor';
import { QuizBlockEditor } from './editors/quiz-block-editor';
import { CalloutBlockEditor } from './editors/callout-block-editor';
import { ImageBlockEditor } from './editors/image-block-editor';
import { VideoEmbedEditor } from './editors/video-embed-editor';
import type { ContentBlock, ContentBlockData } from '@/types/content';

interface BlockEditorProps {
  block: ContentBlock;
  onChange: (data: ContentBlockData) => void;
}

export function BlockEditor({ block, onChange }: BlockEditorProps) {
  switch (block.data.type) {
    case 'text':
      return <TextBlockEditor data={block.data} onChange={onChange} />;
    case 'code_example':
      return <CodeExampleEditor data={block.data} onChange={onChange} />;
    case 'code_challenge':
      return <CodeChallengeEditor data={block.data} onChange={onChange} />;
    case 'quiz':
      return <QuizBlockEditor data={block.data} onChange={onChange} />;
    case 'callout':
      return <CalloutBlockEditor data={block.data} onChange={onChange} />;
    case 'image':
      return <ImageBlockEditor data={block.data} onChange={onChange} />;
    case 'video_embed':
      return <VideoEmbedEditor data={block.data} onChange={onChange} />;
    default:
      return null;
  }
}
