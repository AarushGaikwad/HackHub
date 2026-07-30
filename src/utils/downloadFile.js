import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // avoid call-stack limits on large files
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  
  return btoa(binary);
}

export async function savePdfAndShare(arrayBuffer, filename) {
  const base64 = arrayBufferToBase64(arrayBuffer);
  const fileUri = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', dialogTitle: filename });
  }

  return fileUri;
}