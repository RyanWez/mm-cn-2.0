// QR Code Generator Types

export type QRType = "url" | "text" | "wifi";

export type QRFrame = "none" | "basic" | "rounded" | "banner";

export type QRShape = "square" | "rounded" | "dots" | "extra-rounded";

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
  frame: QRFrame;
  shape: QRShape;
  fgColor: string;
  bgColor: string;
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
  frame: "none",
  shape: "square",
  fgColor: "#000000",
  bgColor: "#ffffff",
  logo: "none",
};
