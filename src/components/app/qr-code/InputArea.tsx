"use client";

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
  if (type === "url") {
    return (
      <div className="space-y-2">
        <Label htmlFor="url-input">Enter URL</Label>
        <Input
          id="url-input"
          type="url"
          placeholder="https://example.com"
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full"
        />
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className="space-y-2">
        <Label htmlFor="text-input">Enter your text</Label>
        <Textarea
          id="text-input"
          placeholder="Type your text here..."
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="w-full min-h-[200px] resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {content.length} characters
        </p>
      </div>
    );
  }

  if (type === "wifi") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wifi-ssid">Network Name (SSID)</Label>
          <Input
            id="wifi-ssid"
            placeholder="My WiFi Network"
            value={wifiData.ssid}
            onChange={(e) =>
              onWifiDataChange({ ...wifiData, ssid: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wifi-password">Password</Label>
          <Input
            id="wifi-password"
            type="password"
            placeholder="Enter password"
            value={wifiData.password}
            onChange={(e) =>
              onWifiDataChange({ ...wifiData, password: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="wifi-encryption">Encryption</Label>
          <Select
            value={wifiData.encryption}
            onValueChange={(value: "WPA" | "WEP" | "nopass") =>
              onWifiDataChange({ ...wifiData, encryption: value })
            }
          >
            <SelectTrigger id="wifi-encryption">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WPA">WPA/WPA2</SelectItem>
              <SelectItem value="WEP">WEP</SelectItem>
              <SelectItem value="nopass">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="wifi-hidden"
            checked={wifiData.hidden}
            onCheckedChange={(checked) =>
              onWifiDataChange({ ...wifiData, hidden: checked as boolean })
            }
          />
          <Label htmlFor="wifi-hidden" className="text-sm font-normal cursor-pointer">
            Hidden network
          </Label>
        </div>
      </div>
    );
  }

  return null;
}
