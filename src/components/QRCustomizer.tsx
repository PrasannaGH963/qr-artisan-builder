import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QRCustomizerProps {
  qrStyle: {
    fgColor: string;
    bgColor: string;
    level: string;
    includeMargin: boolean;
    cornerRadius: number;
  };
  setQrStyle: React.Dispatch<React.SetStateAction<{
    fgColor: string;
    bgColor: string;
    level: string;
    includeMargin: boolean;
    cornerRadius: number;
  }>>;
  size: number;
  setSize: React.Dispatch<React.SetStateAction<number>>;
}

const QRCustomizer: React.FC<QRCustomizerProps> = ({
  qrStyle,
  setQrStyle,
  size,
  setSize,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>QR Code Size</Label>
        <Slider
          value={[size]}
          onValueChange={(value) => setSize(value[0])}
          min={128}
          max={512}
          step={8}
          className="w-full"
        />
        <div className="text-sm text-muted-foreground text-right">
          {size}px
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fgColor">Foreground Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            id="fgColor"
            value={qrStyle.fgColor}
            onChange={(e) =>
              setQrStyle((prev) => ({ ...prev, fgColor: e.target.value }))
            }
            className="w-12 h-12 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={qrStyle.fgColor}
            onChange={(e) =>
              setQrStyle((prev) => ({ ...prev, fgColor: e.target.value }))
            }
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bgColor">Background Color</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            id="bgColor"
            value={qrStyle.bgColor}
            onChange={(e) =>
              setQrStyle((prev) => ({ ...prev, bgColor: e.target.value }))
            }
            className="w-12 h-12 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={qrStyle.bgColor}
            onChange={(e) =>
              setQrStyle((prev) => ({ ...prev, bgColor: e.target.value }))
            }
            className="flex-1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Error Correction Level</Label>
        <Select
          value={qrStyle.level}
          onValueChange={(value) =>
            setQrStyle((prev) => ({ ...prev, level: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="L">Low</SelectItem>
            <SelectItem value="M">Medium</SelectItem>
            <SelectItem value="Q">Quartile</SelectItem>
            <SelectItem value="H">High</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QRCustomizer;