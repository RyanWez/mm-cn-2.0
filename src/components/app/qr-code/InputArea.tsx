"use client";

import { useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { QRType, WifiData } from "./types";

interface InputAreaProps {
  type: QRType;
  content: string;
  wifiData: WifiData;
  onContentChange: (content: string) => void;
  onWifiDataChange: (data: WifiData) => void;
}

export function InputArea({
  type,
  content,
  wifiData,
  onContentChange,
  onWifiDataChange,
}: InputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current && type === "text") {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content, type]);

  if (type === "url") {
    return (
      <div className="space-y-2">
        <Label htmlFor="url-input" className="text-sm">Enter URL</Label>
        <Input
          id="url-input"
          type="url"
          placeholder="https://example.com"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full text-sm"
        />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-2">
        <Label htmlFor="text-input" className="text-sm">Enter your text</Label>
        <Textarea
          ref={textareaRef}
          id="text-input"
          placeholder="Type your text here..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full min-h-[40px] max-h-[400px] overflow-y-auto resize-none text-sm"
          rows={1}
        />
        <p className="text-xs text-muted-foreground">
          {content.length} characters
        </p>
      </div>
    );
  }

  if (type === "wifi") {
    return (
      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wifi-ssid" className="text-sm">Network Name (SSID)</Label>
          <Input
            id="wifi-ssid"
            placeholder="My WiFi Network"
            value={wifiData.ssid}
            onChange={(e) =>
              onWifiDataChange({ ...wifiData, ssid: e.target.value })
            }
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wifi-password" className="text-sm">Password</Label>
          <Input
            id="wifi-password"
            type="password"
            placeholder="Enter password"
            value={wifiData.password}
            onChange={(e) =>
              onWifiDataChange({ ...wifiData, password: e.target.value })
            }
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wifi-encryption" className="text-sm">Encryption</Label>
          <Select
            value={wifiData.encryption}
            onValueChange={(value: "WPA" | "WEP" | "nopass") =>
              onWifiDataChange({ ...wifiData, encryption: value })
            }
          >
            <SelectTrigger id="wifi-encryption" className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 py-1 sm:py-2">
          <Checkbox
            id="wifi-hidden"
            checked={wifiData.hidden}
            onCheckedChange={(checked) =>
              onWifiDataChange({ ...wifiData, hidden: checked as boolean })
            }
          />
          <Label
            htmlFor="wifi-hidden"
            className="text-xs sm:text-sm font-normal cursor-pointer select-none"
          >
            Hidden network
          </Label>
        </div>
      </div>
    );
  }

  return null;
}
