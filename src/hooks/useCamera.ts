import { useState } from 'react';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export function useCamera() {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = Capacitor.isNativePlatform() || Capacitor.getPlatform() === 'web';

  const takePhoto = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });
      
      setPhoto(image);
      return image;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to take photo';
      setError(message);
      console.error('Camera error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromGallery = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });
      
      setPhoto(image);
      return image;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to pick photo';
      setError(message);
      console.error('Gallery error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setError(null);
  };

  return {
    photo,
    isLoading,
    error,
    isSupported,
    takePhoto,
    pickFromGallery,
    clearPhoto,
  };
}
