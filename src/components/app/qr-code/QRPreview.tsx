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
        if (state.logo !== "none") {
          addLogo(ctx, canvas, state.logo);
        }
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrValue, state.logo]);

  const addLogo = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    logo: string
  ) => {
    const logoPath = getLogoPath(logo);
    if (!logoPath) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const logoSize = 50; // Optimized size for clarity and scanning
      const padding = 6;
      const x = (canvas.width - logoSize) / 2;
      const y = (canvas.height - logoSize) / 2;

      // White rounded background for logo
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(x - padding, y - padding, logoSize + padding * 2, logoSize + padding * 2, 8);
      ctx.fill();

      // Optional: Add subtle shadow for depth
      ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;

      // Draw logo with better quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, x, y, logoSize, logoSize);

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
