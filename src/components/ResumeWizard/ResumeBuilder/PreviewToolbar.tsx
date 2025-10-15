import React, { useEffect } from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  Save,
  Copy,
  Trash2,
  RotateCw,
  Hash,
  Type,
  Palette,
  FileText,
  Link2,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface PreviewToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onSave: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFullscreen?: () => void;
  onDuplicate?: () => void;
  onClear?: () => void;
  onAddLink?: () => void;
  onAddImage?: () => void;
  onAlignChange?: (align: string) => void;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
  zoom,
  onZoomChange,
  onUndo,
  onRedo,
  onDownload,
  onPrint,
  onSave,
  canUndo,
  canRedo,
  onFullscreen,
  onDuplicate,
  onClear,
  onAddLink,
  onAddImage,
  onAlignChange
}) => {
  const zoomPresets = [50, 75, 90, 100, 125, 150];
  useEffect(() => {
    console.log('[ResumeBuilder] PreviewToolbar mounted', { zoom, canUndo, canRedo });
  }, []);

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b">
      {/* Left side - Edit actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-200 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onDuplicate}
          className="p-2"
          title="Duplicate"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="p-2"
          title="Clear"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-gray-200 mx-1" />
        
        {/* Text formatting */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2" title="Text Alignment">
              <AlignLeft className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAlignChange?.('left')}>
              <AlignLeft className="w-4 h-4 mr-2" /> Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlignChange?.('center')}>
              <AlignCenter className="w-4 h-4 mr-2" /> Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlignChange?.('right')}>
              <AlignRight className="w-4 h-4 mr-2" /> Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAlignChange?.('justify')}>
              <AlignJustify className="w-4 h-4 mr-2" /> Justify
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddLink}
          className="p-2"
          title="Add Link"
        >
          <Link2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddImage}
          className="p-2"
          title="Add Image"
        >
          <Image className="w-4 h-4" />
        </Button>
      </div>

      {/* Center - Zoom controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onZoomChange(Math.max(25, zoom - 10))}
          className="p-2"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-20">
              {Math.round(zoom)}%
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {zoomPresets.map((preset) => (
              <DropdownMenuItem
                key={preset}
                onClick={() => onZoomChange(preset)}
              >
                {preset}%
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          className="p-2"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onFullscreen}
          className="p-2"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
