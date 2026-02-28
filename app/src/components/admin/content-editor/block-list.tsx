'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockEditor } from './block-editor';
import { BlockTypePicker } from './block-type-picker';
import { cn } from '@/lib/utils';
import type {
  ContentBlock,
  ContentBlockData,
  ContentBlockType,
} from '@/types/content';

interface BlockListProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const BLOCK_TYPE_LABELS: Record<ContentBlockType, string> = {
  text: 'Text',
  code_example: 'Code Example',
  code_challenge: 'Code Challenge',
  quiz: 'Quiz',
  callout: 'Callout',
  image: 'Image',
  video_embed: 'Video',
};

/**
 * Creates the default data payload for a given content block type.
 */
function createDefaultData(type: ContentBlockType): ContentBlockData {
  switch (type) {
    case 'text':
      return { type: 'text', content: null };
    case 'code_example':
      return { type: 'code_example', language: 'typescript', code: '' };
    case 'code_challenge':
      return {
        type: 'code_challenge',
        language: 'typescript',
        starterCode: '',
        solutionCode: '',
        testCases: [],
        hints: [],
      };
    case 'quiz':
      return {
        type: 'quiz',
        questionType: 'mcq',
        content: '',
        responseConfig: null,
      };
    case 'callout':
      return { type: 'callout', calloutType: 'info', content: '' };
    case 'image':
      return { type: 'image', src: '', alt: '' };
    case 'video_embed':
      return { type: 'video_embed', url: '' };
  }
}

export function BlockList({ blocks, onChange }: BlockListProps) {
  const [showPicker, setShowPicker] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(blocks, oldIndex, newIndex).map(
      (block, index) => ({ ...block, sortOrder: index })
    );
    onChange(reordered);
  }

  function handleAddBlock(type: ContentBlockType) {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      sortOrder: blocks.length,
      data: createDefaultData(type),
    };
    onChange([...blocks, newBlock]);
  }

  function handleUpdateBlock(blockId: string, data: ContentBlockData) {
    onChange(
      blocks.map((b) => (b.id === blockId ? { ...b, data } : b))
    );
  }

  function handleDeleteBlock(blockId: string) {
    onChange(
      blocks
        .filter((b) => b.id !== blockId)
        .map((block, index) => ({ ...block, sortOrder: index }))
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              onUpdate={(data) => handleUpdateBlock(block.id, data)}
              onDelete={() => handleDeleteBlock(block.id)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No content blocks yet. Add your first block to get started.
          </p>
        </div>
      )}

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full border-dashed"
        >
          <Plus className="size-4" />
          Add Block
        </Button>

        {showPicker && (
          <div className="absolute left-1/2 z-50 mt-2 -translate-x-1/2">
            <BlockTypePicker
              onSelect={handleAddBlock}
              onClose={() => setShowPicker(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface SortableBlockItemProps {
  block: ContentBlock;
  onUpdate: (data: ContentBlockData) => void;
  onDelete: () => void;
}

function SortableBlockItem({ block, onUpdate, onDelete }: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border bg-card transition-shadow',
        isDragging && 'shadow-lg opacity-90 z-50'
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <button
          type="button"
          className={cn(
            'flex size-7 shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors',
            'hover:bg-muted hover:text-foreground active:cursor-grabbing'
          )}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <Badge variant="neutral" className="text-[11px]">
          {BLOCK_TYPE_LABELS[block.type]}
        </Badge>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="p-4">
        <BlockEditor block={block} onChange={onUpdate} />
      </div>
    </div>
  );
}
