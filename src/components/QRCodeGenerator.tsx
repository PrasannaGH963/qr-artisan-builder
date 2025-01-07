import React, { useState, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Download, Copy, RefreshCw } from 'lucide-react';
import QRCustomizer from './QRCustomizer';

const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [qrStyle, setQrStyle] = useState({
    fgColor: '#221F26',
    bgColor: '#ffffff',
    level: 'L',
    includeMargin: true,
    cornerRadius: 0,
  });

  // Function to determine appropriate QR error correction level based on data length
  const getErrorCorrectionLevel = (dataLength: number) => {
    if (dataLength <= 100) return 'H'; // High - 30% correction
    if (dataLength <= 500) return 'Q'; // Quartile - 25% correction
    if (dataLength <= 1000) return 'M'; // Medium - 15% correction
    return 'L'; // Low - 7% correction
  };

  // Update text with validation
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    if (newText.length > 2000) { // Set a reasonable maximum length
      toast.error('Text is too long. Maximum 2000 characters allowed.');
      return;
    }
    setText(newText);
    // Automatically adjust error correction level
    setQrStyle(prev => ({
      ...prev,
      level: getErrorCorrectionLevel(newText.length)
    }));
  };

  const handleDownload = useCallback((format: string) => {
    const svg = document.querySelector('.qr-container svg');
    if (!svg) {
      toast.error('QR Code not found');
      return;
    }

    // Set a high resolution for export
    const exportSize = size * 4; // Multiply the size by 4 for higher quality
    const svgData = new XMLSerializer().serializeToString(svg);

    // Create a canvas element with higher resolution
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = exportSize;
    canvas.height = exportSize;

    const img = new Image();

    img.onload = () => {
      if (!ctx) return;
      
      // Fill background
      ctx.fillStyle = qrStyle.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Use better image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the image at high resolution
      ctx.drawImage(img, 0, 0, exportSize, exportSize);

      let url, filename;
      if (format === 'svg') {
        // For SVG, maintain vector quality
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        url = URL.createObjectURL(svgBlob);
        filename = 'qrcode.svg';
      } else {
        // For raster formats, use maximum quality
        url = canvas.toDataURL(`image/${format}`, 1.0);
        filename = `qrcode.${format}`;
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (format === 'svg') URL.revokeObjectURL(url);
      toast.success('High quality QR Code downloaded successfully!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  }, [size, qrStyle.bgColor]);

  const copyToClipboard = useCallback(async () => {
    const svg = document.querySelector('.qr-container svg');
    if (!svg) {
      toast.error('QR Code not found');
      return;
    }

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = size;
      canvas.height = size;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
      });

      if (!ctx) throw new Error('Could not get canvas context');
      ctx.fillStyle = qrStyle.bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to copy QR Code');
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        toast.success('QR Code copied to clipboard!');
      });
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy QR Code');
    }
  }, [size, qrStyle.bgColor]);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl animate-fadeIn">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">QR Code Generator</h1>
        <p className="text-muted-foreground px-2">Generate and customize your QR codes instantly</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 md:gap-8">
        <Card className="p-4 md:p-6 animate-slideUp">
          <div className="space-y-5">
            <div className="space-y-3">
              <Label htmlFor="text">Enter URL or text</Label>
              <Input
                id="text"
                placeholder="https://example.com"
                value={text}
                onChange={handleTextChange}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {text.length}/2000 characters
                {text.length > 0 && ` (Using ${qrStyle.level} error correction)`}
              </p>
            </div>

            <QRCustomizer qrStyle={qrStyle} setQrStyle={setQrStyle} size={size} setSize={setSize} />
          </div>
        </Card>

        <Card className="p-4 md:p-6 animate-slideUp delay-100">
          <div className="space-y-5">
            <div className="flex justify-center mb-8 md:mb-5">
              {text ? (
                <div className="qr-container p-4 bg-white rounded-lg shadow-sm">
                  <QRCodeSVG
                    value={text || ' '}
                    size={size}
                    fgColor={qrStyle.fgColor}
                    bgColor={qrStyle.bgColor}
                    level={qrStyle.level as "L" | "M" | "Q" | "H"}
                    includeMargin={qrStyle.includeMargin}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-64 h-64 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-sm px-4 text-center">Enter text to generate QR code</p>
                </div>
              )}
            </div>

            <div className="space-y-5 mt-8 md:mt-5">
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={copyToClipboard}
                  disabled={!text}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setText('')}
                  disabled={!text}
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <Tabs defaultValue="png" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="png">PNG</TabsTrigger>
                  <TabsTrigger value="jpeg">JPEG</TabsTrigger>
                  <TabsTrigger value="svg">SVG</TabsTrigger>
                </TabsList>
                <TabsContent value="png">
                  <Button
                    onClick={() => handleDownload('png')}
                    disabled={!text}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PNG
                  </Button>
                </TabsContent>
                <TabsContent value="jpeg">
                  <Button
                    onClick={() => handleDownload('jpeg')}
                    disabled={!text}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download JPEG
                  </Button>
                </TabsContent>
                <TabsContent value="svg">
                  <Button
                    onClick={() => handleDownload('svg')}
                    disabled={!text}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download SVG
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default QRCodeGenerator;