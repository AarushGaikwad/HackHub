import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

function arrayBufferToBase64(buffer) {
  let binary = '';

  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);

    binary += String.fromCharCode.apply(null, chunk);
  }

  return btoa(binary);
}

export async function savePdfLocally(arrayBuffer, filename) {
  try {
    const base64 = arrayBufferToBase64(arrayBuffer);

    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(
      fileUri,
      base64,
      {
        encoding: FileSystem.EncodingType.Base64,
      }
    );

    return fileUri;
  } catch (error) {
    console.error('PDF save error:', error);
    throw error;
  }
}

export async function sharePdf(arrayBuffer, filename) {
  try {
    const fileUri = await savePdfLocally(
      arrayBuffer,
      filename
    );

    const canShare = await Sharing.isAvailableAsync();

    if (!canShare) {
      throw new Error(
        'Sharing is not available on this device.'
      );
    }

    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/pdf',
      dialogTitle: filename,
      UTI: 'com.adobe.pdf',
    });

    return fileUri;
  } catch (error) {
    console.error('PDF share error:', error);
    throw error;
  }
}

export async function downloadPdf(arrayBuffer, filename) {
  try {
    if (Platform.OS === 'android') {
      const base64 = arrayBufferToBase64(arrayBuffer);

      // Ask the user to select/create the Downloads folder.
      const permissions =
        await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        throw new Error(
          'Storage permission was not granted.'
        );
      }

      const directoryUri = permissions.directoryUri;

      // Create the PDF file in the selected directory.
      const fileUri =
        await FileSystem.StorageAccessFramework.createFileAsync(
          directoryUri,
          filename,
          'application/pdf'
        );

      // Write PDF contents.
      await FileSystem.writeAsStringAsync(
        fileUri,
        base64,
        {
          encoding: FileSystem.EncodingType.Base64,
        }
      );

      return fileUri;
    }
    // IOS
    const fileUri = await savePdfLocally(
      arrayBuffer,
      filename
    );

    const canShare = await Sharing.isAvailableAsync();

    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Save ${filename}`,
        UTI: 'com.adobe.pdf',
      });
    }

    return fileUri;

  } catch (error) {
    console.error('PDF download error:', error);
    throw error;
  }
}