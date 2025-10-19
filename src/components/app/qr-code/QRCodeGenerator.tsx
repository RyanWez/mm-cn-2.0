"use client";

import { useState, useMemo } from "react";
import { TypeSelector } from "./TypeSelector";
import { InputArea } from "./InputArea";
import { QRPreview } from "./QRPreview";
import { LogoSelector } from "./LogoSelector";
import { ActionButtons } from "./ActionButtons";
import { DEFAULT_QR_STATE, QRCodeState, QRType, LogoSettings, WifiData } from "./types";

export function QRCodeGenerator() {
  const [state, setState] = useState<QRCodeState>(DEFAULT_QR_STATE);

  // Generate QR value based on type
  const qrValue = useMemo(() => {
    if (state.type === "url" || state.type === "text") {
      return state.content;
    }
    
    if (state.type === "wifi") {
      const { ssid, password, encryption, hidden } = state.wifiData;
      if (!ssid) return "";
      
      // WiFi QR format: WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;;
      return `WIFI:T:${encryption};S:${ssid};P:${password};H:${hidden ? "true" : "false"};;`;
    }
    
    return "";
  }, [state.type, state.content, state.wifiData]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Input Controls */}
        <div className="space-y-4 sm:space-y-6">
          {/* Type Selector */}
          <TypeSelector
            selectedType={state.type}
            onTypeChange={(type: QRType) =>
              setState({ ...state, type, content: "" })
            }
          />

          {/* Input Area */}
          <InputArea
            type={state.type}
            content={state.content}
            wifiData={state.wifiData}
            onContentChange={(content: string) =>
              setState({ ...state, content })
            }
            onWifiDataChange={(wifiData: WifiData) =>
              setState({ ...state, wifiData })
            }
          />
        </div>

        {/* Right Column - QR Preview & Customization */}
        <div className="space-y-3 sm:space-y-4">
          {/* QR Code Preview */}
          <QRPreview state={state} qrValue={qrValue} />

          {/* Logo Settings */}
          <LogoSelector
            logoSettings={state.logoSettings}
            onLogoSettingsChange={(logoSettings: LogoSettings) =>
              setState({ ...state, logoSettings })
            }
          />

          {/* Action Buttons */}
          <ActionButtons qrValue={qrValue} />
        </div>
      </div>
    </div>
  );
}
