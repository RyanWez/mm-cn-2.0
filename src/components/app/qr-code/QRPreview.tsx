"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { QRCodeState } from "./types";
import Image from "next/image";

interface QRPreviewProps {
  state: QRCodeState;
  qrValue: string;
}

export function QRPreview({ state, qrValue }: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!qrValue || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Generate QR code
    QRCode.toCanvas(
      canvas,
      qrValue,
      {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "H",
      },
      (error) => {
        if (error) {
          console.error("QR Code generation error:", error);
          return;
        }

        // Add logo if selected
        if (state.logoSettings.logo !== "none") {
          addLogo(ctx, canvas, state.logoSettings);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrValue, state.logoSettings]);

  const addLogo = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    logoSettings: any
  ) => {
    const logoPath = getLogoPath(logoSettings.logo);
    if (!logoPath) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const logoSize = logoSettings.size;
      const padding = 8;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;

      // Draw background based on shape
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();

      if (logoSettings.shape === "circle") {
        ctx.arc(
          x + logoSize / 2,
          y + logoSize / 2,
          (logoSize + padding * 2) / 2,
          0,
          Math.PI * 2
        );
      } else if (logoSettings.shape === "square") {
        ctx.rect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2);
      } else {
        // rounded
        ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 12);
      }
      ctx.fill();

      // Add border if enabled
      if (logoSettings.borderEnabled) {
        ctx.strokeStyle = logoSettings.borderColor;
        ctx.lineWidth = logoSettings.borderWidth;
        ctx.stroke();
      }

      // Add subtle shadow for depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 3;

      // Clip to shape for logo
      ctx.save();
      ctx.beginPath();
      if (logoSettings.shape === "circle") {
        ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
      } else if (logoSettings.shape === "square") {
        ctx.rect(x, y, logoSize, logoSize);
      } else {
        ctx.roundRect(x, y, logoSize, logoSize, 8);
      }
      ctx.clip();

      // Draw logo with high quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, logoSize, logoSize);

      ctx.restore();

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    };
    img.src = logoPath;
  };

  const getLogoPath = (logo: string) => {
    switch (logo) {
      case "dino":
        return "/logo/Dino.svg";
      case "wavepay":
        return "/logo/Wave-Pay.png";
      case "kbzpay":
        return "/logo/KBZ-Pay.webp";
      default:
        return null;
    }
  };

  if (!qrValue) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <p className="text-muted-foreground text-sm">
          Enter content to generate QR code
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center p-8 rounded-lg bg-white">
      <canvas
        ref={canvasRef}
        id="qr-code-canvas"
        className="max-w-full h-auto"
      />
    </div>
  );
}
