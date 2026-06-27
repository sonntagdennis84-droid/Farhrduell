import QRCode from "qrcode";

export async function createJoinQrCode(joinUrl: string) {
  return QRCode.toDataURL(joinUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    color: { dark: "#08182E", light: "#FFFFFF" },
    width: 320
  });
}
