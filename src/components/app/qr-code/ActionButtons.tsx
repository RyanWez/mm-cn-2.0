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

    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 400;
    canvas.height = 400;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      
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

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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
      const svg = document.getElementById("qr-code-svg");
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      canvas.width = 400;
      canvas.height = 400;

      img.onload = async () => {
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
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
      };

      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
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
