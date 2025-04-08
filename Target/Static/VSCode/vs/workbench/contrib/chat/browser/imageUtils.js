var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
async function resizeImage(data, mimeType) {
  const isGif = mimeType === "image/gif";
  if (typeof data === "string") {
    data = convertStringToUInt8Array(data);
  }
  return new Promise((resolve, reject) => {
    const blob = new Blob([data], { type: mimeType });
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.src = url;
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if ((width <= 768 || height <= 768) && !isGif) {
        resolve(data);
        return;
      }
      if (width > 2048 || height > 2048) {
        const scaleFactor2 = 2048 / Math.max(width, height);
        width = Math.round(width * scaleFactor2);
        height = Math.round(height * scaleFactor2);
      }
      const scaleFactor = 768 / Math.min(width, height);
      width = Math.round(width * scaleFactor);
      height = Math.round(height * scaleFactor);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob2) => {
          if (blob2) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(new Uint8Array(reader.result));
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(blob2);
          } else {
            reject(new Error("Failed to create blob from canvas"));
          }
        }, "image/png");
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };
  });
}
__name(resizeImage, "resizeImage");
function convertStringToUInt8Array(data) {
  const base64Data = data.includes(",") ? data.split(",")[1] : data;
  if (isValidBase64(base64Data)) {
    return Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));
  }
  return new TextEncoder().encode(data);
}
__name(convertStringToUInt8Array, "convertStringToUInt8Array");
function convertUint8ArrayToString(data) {
  try {
    const decoder = new TextDecoder();
    const decodedString = decoder.decode(data);
    return decodedString;
  } catch {
    return "";
  }
}
__name(convertUint8ArrayToString, "convertUint8ArrayToString");
function isValidBase64(str) {
  return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && (() => {
    try {
      atob(str);
      return true;
    } catch {
      return false;
    }
  })();
}
__name(isValidBase64, "isValidBase64");
export {
  convertStringToUInt8Array,
  convertUint8ArrayToString,
  resizeImage
};
//# sourceMappingURL=imageUtils.js.map
