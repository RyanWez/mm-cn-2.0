"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  qrValue: string;
}

export function ActionButtons({ qrValue }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleDownload = () => {
    if (!qrValue) {
      toast({
        title: "Error",
        description: "Please enter content to generate QR code first.",
        variant: "destructive",
      });
      return;
    }

    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `qrcode-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);

        toast({
          title: "Downloaded!",
          description: "QR code has been downloaded successfully.",
        });
      }
    });
  };

  const handleCopy = async () => {
    if (!qrValue) {
      toast({
        title: "Error",
        description: "Please enter content to generate QR code first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
      if (!canvas) return;

      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);

          toast({
            title: "Copied!",
            description: "QR code has been copied to clipboard.",
          });
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy QR code to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleDownload}
        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        disabled={!qrValue}
      >
        <Download className="mr-2 h-4 w-4" />
        DOWNLOAD
      </Button>
      <Button
        onClick={handleCopy}
        variant="outline"
        className="flex-1"
        disabled={!qrValue}
      >
        {copied ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-2 h-4 w-4" />
            COPY
          </>
        )}
      </Button>
    </div>
  );
}
