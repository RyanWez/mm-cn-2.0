"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QRCodeState } from "./types";
import Image from "next/image";

interface QRPreviewProps {
  state: QRCodeState;
  qrValue: string;
}

export function QRPreview({ state, qrValue }: QRPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  if (!qrValue) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25">
        <p className="text-muted-foreground text-sm">
          Enter content to generate QR code
        </p>
      </div>
    );
  }

  // Get logo path based on selection
  const getLogoPath = () => {
    switch (state.logo) {
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

  const logoPath = getLogoPath();

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center p-8 bg-white rounded-lg"
      style={{
        backgroundColor: state.bgColor,
      }}
    >
      <div className="relative">
        <QRCodeSVG
          id="qr-code-svg"
          value={qrValue}
          size={300}
          level="H"
          includeMargin={true}
          fgColor={state.fgColor}
          bgColor={state.bgColor}
        />
        
        {/* Logo Overlay */}
        {logoPath && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-lg shadow-md">
            <Image
              src={logoPath}
              alt="Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
