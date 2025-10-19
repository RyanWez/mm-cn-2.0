// QR Code Generator Types

export type QRType = "url" | "text" | "wifi";

export type QRLogo = "none" | "dino" | "wavepay" | "kbzpay" | "custom";

export type LogoShape = "circle" | "square" | "rounded";

export interface WifiData {
  ssid: string;
  password: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden?: boolean;
}

export interface LogoSettings {
  logo: QRLogo;
  size: number; // 30-70px
  shape: LogoShape;
  borderEnabled: boolean;
  borderColor: string;
  borderWidth: number; // 1-5px
  customLogo?: File;
}

export interface QRCodeState {
  type: QRType;
  content: string;
  wifiData: WifiData;
  logoSettings: LogoSettings;
}

export const DEFAULT_LOGO_SETTINGS: LogoSettings = {
  logo: "none",
  size: 50,
  shape: "rounded",
  borderEnabled: true,
  borderColor: "#000000",
  borderWidth: 2,
};

export const DEFAULT_QR_STATE: QRCodeState = {
  type: "url",
  content: "",
  wifiData: {
    ssid: "",
    password: "",
    encryption: "WPA",
    hidden: false,
  },
  logoSettings: DEFAULT_LOGO_SETTINGS,
};
