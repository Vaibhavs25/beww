import { Image, Platform } from 'react-native';
import {
  buildCdnImageUrl,
  computeTargetDimensions,
  estimateBase64Bytes,
  formatImageByteSize,
  IMAGE_OPTIMIZATION_PRESETS,
  type CdnImageOptions,
  type ImageOptimizationPreset,
  type ImageRenderVariant,
} from '../domain';

export type OptimizedImageUpload = {
  base64: string;
  dataUri: string;
  width: number;
  height: number;
  byteLength: number;
  sizeLabel: string;
  preset: ImageOptimizationPreset;
  wasFurtherCompressed: boolean;
};

const cdnUrlMemoryCache = new Map<string, string>();
const prefetchedUrls = new Set<string>();

/**
 * Resolves a CDN-optimized URL for a remote image or passes through local data/file URIs,
 * memoizing the result in an in-memory LRU-bounded map for fast dashboard rendering.
 */
export function getCdnImageUri(
  uri: string | undefined | null,
  variant: ImageRenderVariant = 'card',
  options?: Omit<CdnImageOptions, 'variant'>
): string {
  if (!uri) return '';
  const cacheKey = `${variant}:${options?.width ?? ''}:${options?.height ?? ''}:${options?.quality ?? ''}:${uri}`;
  const cached = cdnUrlMemoryCache.get(cacheKey);
  if (cached) return cached;

  const optimized = buildCdnImageUrl(uri, { ...options, variant });
  if (cdnUrlMemoryCache.size > 400) {
    const oldestKey = cdnUrlMemoryCache.keys().next().value;
    if (oldestKey) cdnUrlMemoryCache.delete(oldestKey);
  }
  cdnUrlMemoryCache.set(cacheKey, optimized);
  return optimized;
}

/**
 * Prefetches remote CDN image URLs into the native/browser image cache to accelerate
 * Memory Lane and Instant Pic dashboard carousels.
 */
export function prefetchDashboardImages(
  uris: (string | undefined | null)[],
  variant: ImageRenderVariant = 'card'
): void {
  for (const raw of uris) {
    if (!raw || raw.startsWith('data:')) continue;
    const cdnUri = getCdnImageUri(raw, variant);
    if (!cdnUri || !/^https?:\/\//i.test(cdnUri) || prefetchedUrls.has(cdnUri)) continue;
    prefetchedUrls.add(cdnUri);
    if (typeof Image?.prefetch === 'function') {
      void Image.prefetch(cdnUri).catch(() => {
        prefetchedUrls.delete(cdnUri);
      });
    }
  }
}

/**
 * Resizes and compresses a picked/captured image asset according to the feature preset
 * ('instant-pic', 'memory-lane', or 'avatar'). Uses dynamic import of expo-image-manipulator
 * so native/web SharedObject classes are never evaluated at initial bundle startup.
 */
export async function optimizeImageAssetForUpload(
  assetUri: string,
  sourceWidth?: number | null,
  sourceHeight?: number | null,
  preset: ImageOptimizationPreset = 'memory-lane'
): Promise<OptimizedImageUpload> {
  const config = IMAGE_OPTIMIZATION_PRESETS[preset] ?? IMAGE_OPTIMIZATION_PRESETS['memory-lane'];
  const targetDims = computeTargetDimensions(sourceWidth, sourceHeight, config.maxDimension);

  const manipulatorMod = await import('expo-image-manipulator').catch(() => null);
  const manipulator = manipulatorMod?.ImageManipulator;
  const jpegFormat = manipulatorMod?.SaveFormat?.JPEG ?? ('jpeg' as any);

  if (!manipulator || typeof manipulator.manipulate !== 'function') {
    throw new Error('Image optimization is unavailable in this environment.');
  }

  const firstPassContext = manipulator.manipulate(assetUri);
  firstPassContext.resize({ width: targetDims.width });
  const firstRendered = await firstPassContext.renderAsync();
  const firstSaved = await firstRendered.saveAsync({
    format: jpegFormat,
    compress: config.initialQuality,
    base64: true,
  });

  if (!firstSaved.base64) {
    throw new Error('Could not optimize this photo. Please try another image.');
  }

  let finalBase64 = firstSaved.base64;
  let finalWidth = firstSaved.width || targetDims.width;
  let finalHeight = firstSaved.height || targetDims.height || targetDims.width;
  let byteLength = estimateBase64Bytes(finalBase64);
  let wasFurtherCompressed = false;

  // Adaptive second pass if image still exceeds preset's fast-loading byte threshold
  if (byteLength > config.maxBytes) {
    const steppedMaxDim = Math.max(320, Math.round(config.maxDimension * 0.82));
    const secondDims = computeTargetDimensions(finalWidth, finalHeight, steppedMaxDim);
    const secondPassContext = manipulator.manipulate(firstSaved.uri || assetUri);
    secondPassContext.resize({ width: secondDims.width });
    const secondRendered = await secondPassContext.renderAsync();
    const secondSaved = await secondRendered.saveAsync({
      format: jpegFormat,
      compress: config.fallbackQuality,
      base64: true,
    });
    if (secondSaved.base64) {
      finalBase64 = secondSaved.base64;
      finalWidth = secondSaved.width || secondDims.width;
      finalHeight = secondSaved.height || secondDims.height || secondDims.width;
      byteLength = estimateBase64Bytes(finalBase64);
      wasFurtherCompressed = true;
    }
  }

  return {
    base64: finalBase64,
    dataUri: `data:image/jpeg;base64,${finalBase64}`,
    width: finalWidth,
    height: finalHeight,
    byteLength,
    sizeLabel: formatImageByteSize(byteLength),
    preset,
    wasFurtherCompressed,
  };
}

/**
 * Launches the camera or photo library using dynamic import of expo-image-picker
 * and automatically resizes & compresses the selected photo.
 */
export async function pickAndOptimizeImage(options: {
  camera?: boolean;
  preset?: ImageOptimizationPreset;
} = {}): Promise<OptimizedImageUpload | null> {
  const camera = Boolean(options.camera);
  const preset: ImageOptimizationPreset = options.preset ?? 'instant-pic';
  const config = IMAGE_OPTIMIZATION_PRESETS[preset];

  const ImagePicker = await import('expo-image-picker').catch(() => null);
  if (!ImagePicker) {
    throw new Error('Photo picker is unavailable in this environment.');
  }

  if (camera && Platform.OS !== 'web' && typeof ImagePicker.requestCameraPermissionsAsync === 'function') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Camera permission is needed to take a photo. You can choose one from your library instead.');
    }
  }

  const result = camera
    ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: config.pickerQuality })
    : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: config.pickerQuality });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  return optimizeImageAssetForUpload(asset.uri, asset.width, asset.height, preset);
}
