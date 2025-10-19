// QR Code Generator Types

export type QRType = "url" | "text" | "wifi";

export type QRFrame = "classic" | "easy" | "rain" | "dot";

export type QRLogo = "none" | "dino" | "wavepay" | "kbzpay" | "custom";

export interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}

export interface QRCodeState {
  type: QRType;
  content: string;
  wifiData: WifiData;
  logo: QRLogo;
  customLogo?: File;
}

export const DEFAULT_QR_STATE: QRCodeState = {
  type: "url",
  content: "",
  wifiData: {
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  },
  logo: "none",
};
