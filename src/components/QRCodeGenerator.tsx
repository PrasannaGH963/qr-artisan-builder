import React, { useState, useCallback } from 'react';
import QRCode from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
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

  const handleDownload = useCallback((format: string) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    let url, filename;
    if (format === 'svg') {
      const svgData = new XMLSerializer().serializeToString(document.querySelector('svg')!);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      url = URL.createObjectURL(svgBlob);
      filename = 'qrcode.svg';
    } else {
      url = canvas.toDataURL(`image/${format}`);
      filename = `qrcode.${format}`;
    }

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR Code downloaded successfully!');
  }, []);

  const copyToClipboard = useCallback(async () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    try {
      const blob = await new Promise(resolve => canvas.toBlob(resolve));
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob as Blob,
        }),
      ]);
      toast.success('QR Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy QR Code');
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
        <p className="text-muted-foreground">Generate and customize your QR codes instantly</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6 animate-slideUp">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Enter URL or text</Label>
              <Input
                id="text"
                placeholder="https://example.com"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full"
              />
            </div>

            <QRCustomizer qrStyle={qrStyle} setQrStyle={setQrStyle} size={size} setSize={setSize} />
          </div>
        </Card>

        <Card className="p-6 animate-slideUp delay-100">
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              {text ? (
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <QRCode
                    value={text || ' '}
                    size={size}
                    fgColor={qrStyle.fgColor}
                    bgColor={qrStyle.bgColor}
                    level={qrStyle.level as "L" | "M" | "Q" | "H"}
                    includeMargin={qrStyle.includeMargin}
                    renderAs="svg"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-64 h-64 bg-secondary rounded-lg">
                  <p className="text-muted-foreground text-sm">Enter text to generate QR code</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
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
                <TabsList className="grid w-full grid-cols-3">
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