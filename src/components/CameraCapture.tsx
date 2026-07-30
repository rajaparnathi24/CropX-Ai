'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, X, RefreshCw, Check, SwitchCamera, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

type PermissionState = 'checking' | 'prompt' | 'granted' | 'denied' | 'unsupported';

interface CameraDevice {
  deviceId: string;
  label: string;
}

const DEBUG = true;

function log(...args: unknown[]): void {
  if (DEBUG) {
    console.log('[CameraCapture]', ...args);
  }
}

function logError(...args: unknown[]): void {
  if (DEBUG) {
    console.error('[CameraCapture]', ...args);
  }
}

export default function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const permissionStatusRef = useRef<PermissionStatus | null>(null);
  const permissionListenerRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef<boolean>(true);
  const initializingRef = useRef<boolean>(false);
  const retryCountRef = useRef<number>(0);
  const frameCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const facingModeRef = useRef<'environment' | 'user'>('environment');

  const [currentFacingMode, setCurrentFacingModeState] = useState<'environment' | 'user'>('environment');

  // Wrapper that keeps ref and state in sync
  const setCurrentFacingMode = useCallback((mode: 'environment' | 'user') => {
    facingModeRef.current = mode;
    setCurrentFacingModeState(mode);
  }, []);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState<number>(0);
  const [permissionState, setPermissionState] = useState<PermissionState>('checking');
  const [isVideoReady, setIsVideoReady] = useState<boolean>(false);

  const isMobile = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  const clearFrameCheckInterval = useCallback((): void => {
    if (frameCheckIntervalRef.current) {
      clearInterval(frameCheckIntervalRef.current);
      frameCheckIntervalRef.current = null;
      log('Frame check interval cleared');
    }
  }, []);

  const stopStream = useCallback((): void => {
    log('Stopping stream...');
    clearFrameCheckInterval();

    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach((track) => {
        log(`Stopping track: ${track.kind}, ${track.label}`);
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load();
    }

    setIsVideoReady(false);
    log('Stream stopped');
  }, [clearFrameCheckInterval]);

  const enumerateCameras = useCallback(async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
        }));
      log('Enumerated cameras:', videoDevices);
      return videoDevices;
    } catch (err) {
      logError('Failed to enumerate devices:', err);
      return [];
    }
  }, []);

  const getErrorMessage = useCallback((err: unknown): string => {
    const error = err as DOMException;
    const errorName = error?.name || 'UnknownError';
    const errorMessage = error?.message || '';

    log(`Error occurred: ${errorName} - ${errorMessage}`);

    switch (errorName) {
      case 'NotAllowedError':
        return 'Camera access was denied. Please allow camera access in your browser settings.';
      case 'NotFoundError':
        return 'No camera found on this device.';
      case 'NotReadableError':
        return 'Camera is already in use by another application. Please close other apps using the camera.';
      case 'OverconstrainedError':
        return 'Camera does not support the requested settings. Trying with default settings...';
      case 'AbortError':
        return 'Camera initialization was interrupted. Please try again.';
      case 'SecurityError':
        return 'Camera access is blocked due to security settings. Please use HTTPS.';
      default:
        return `Could not access the camera: ${errorMessage || errorName}. Please use "Browse Files" instead.`;
    }
  }, []);

  const waitForVideoReady = useCallback((video: HTMLVideoElement): Promise<void> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Video initialization timeout'));
      }, 10000);

      let metadataLoaded = false;
      let dataLoaded = false;
      let canPlayFired = false;

      const checkReady = (): void => {
        log(`Video ready check - metadata: ${metadataLoaded}, data: ${dataLoaded}, canplay: ${canPlayFired}`);
        if (metadataLoaded && dataLoaded && canPlayFired) {
          clearTimeout(timeoutId);
          cleanup();
          resolve();
        }
      };

      const onLoadedMetadata = (): void => {
        log('Event: loadedmetadata', { videoWidth: video.videoWidth, videoHeight: video.videoHeight });
        metadataLoaded = true;
        checkReady();
      };

      const onLoadedData = (): void => {
        log('Event: loadeddata');
        dataLoaded = true;
        checkReady();
      };

      const onCanPlay = (): void => {
        log('Event: canplay');
        canPlayFired = true;
        checkReady();
      };

      const onError = (e: Event): void => {
        clearTimeout(timeoutId);
        cleanup();
        logError('Video element error:', e);
        reject(new Error('Video element error'));
      };

      const cleanup = (): void => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata);
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('canplay', onCanPlay);
        video.removeEventListener('error', onError);
      };

      video.addEventListener('loadedmetadata', onLoadedMetadata);
      video.addEventListener('loadeddata', onLoadedData);
      video.addEventListener('canplay', onCanPlay);
      video.addEventListener('error', onError);

      if (video.readyState >= 1) {
        metadataLoaded = true;
      }
      if (video.readyState >= 2) {
        dataLoaded = true;
      }
      if (video.readyState >= 3) {
        canPlayFired = true;
      }

      checkReady();
    });
  }, []);

  const checkVideoProducingFrames = useCallback((video: HTMLVideoElement): boolean => {
    const hasValidDimensions = video.videoWidth > 0 && video.videoHeight > 0;
    const isPlaying = !video.paused && !video.ended;
    const hasCurrentTime = video.currentTime > 0;

    log(`Frame check - dimensions: ${video.videoWidth}x${video.videoHeight}, playing: ${isPlaying}, currentTime: ${video.currentTime}`);

    return hasValidDimensions && isPlaying;
  }, []);

  const startFrameCheck = useCallback((video: HTMLVideoElement, onFailure: () => void): void => {
    clearFrameCheckInterval();

    let checkCount = 0;
    const maxChecks = 10;

    frameCheckIntervalRef.current = setInterval(() => {
      checkCount++;
      log(`Frame check attempt ${checkCount}/${maxChecks}`);

      if (checkVideoProducingFrames(video)) {
        log('Video is producing frames successfully');
        clearFrameCheckInterval();
        setIsVideoReady(true);
        return;
      }

      if (checkCount >= maxChecks) {
        log('Video not producing frames after max checks');
        clearFrameCheckInterval();
        onFailure();
      }
    }, 500);
  }, [checkVideoProducingFrames, clearFrameCheckInterval]);

  const startCameraWithConstraints = useCallback(
    async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
      log('Requesting camera with constraints:', JSON.stringify(constraints));
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      log('Got stream:', stream.id);
      return stream;
    },
    []
  );

  const startCamera = useCallback(
    async (facingMode?: 'environment' | 'user', isRetry: boolean = false): Promise<void> => {
      // Use the ref to read the current facing mode without adding it as a dependency
      const effectiveFacingMode = facingMode ?? facingModeRef.current;
      if (!mountedRef.current) {
        log('Component not mounted, aborting startCamera');
        return;
      }

      if (initializingRef.current && !isRetry) {
        log('Camera initialization already in progress, skipping');
        return;
      }

      initializingRef.current = true;
      setError(null);
      setLoading(true);
      setIsVideoReady(false);
      stopStream();

      log(`Starting camera with facingMode: ${effectiveFacingMode}, isRetry: ${isRetry}, retryCount: ${retryCountRef.current}`);

      if (!navigator.mediaDevices?.getUserMedia) {
        log('getUserMedia not supported');
        setPermissionState('unsupported');
        setLoading(false);
        initializingRef.current = false;
        return;
      }

      const video = videoRef.current;
      if (!video) {
        logError('Video element not available');
        setError('Video element not ready. Please try again.');
        setLoading(false);
        initializingRef.current = false;
        return;
      }

      const constraintOptions: MediaStreamConstraints[] = [
        {
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
            facingMode: effectiveFacingMode,
          },
          audio: false,
        },
        {
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: effectiveFacingMode,
          },
          audio: false,
        },
        {
          video: {
            facingMode: effectiveFacingMode,
          },
          audio: false,
        },
        {
          video: true,
          audio: false,
        },
      ];

      let stream: MediaStream | null = null;
      let lastError: unknown = null;

      for (const constraints of constraintOptions) {
        if (!mountedRef.current) {
          log('Component unmounted during constraint attempts');
          initializingRef.current = false;
          return;
        }

        try {
          stream = await startCameraWithConstraints(constraints);
          break;
        } catch (err) {
          lastError = err;
          const error = err as DOMException;
          log(`Constraint attempt failed: ${error.name} - ${error.message}`);

          if (error.name === 'NotAllowedError') {
            setPermissionState('denied');
            setLoading(false);
            initializingRef.current = false;
            return;
          }

          if (error.name !== 'OverconstrainedError' && error.name !== 'NotFoundError') {
            break;
          }
        }
      }

      if (!stream) {
        if (effectiveFacingMode === 'environment' && !isRetry) {
          log('Environment camera failed, trying user camera as fallback');
          setCurrentFacingMode('user');
          initializingRef.current = false;
          await startCamera('user', true);
          return;
        }

        const errorMsg = getErrorMessage(lastError);
        setError(errorMsg);
        setLoading(false);
        initializingRef.current = false;
        return;
      }

      if (!mountedRef.current) {
        log('Component unmounted after getting stream');
        stream.getTracks().forEach((track) => track.stop());
        initializingRef.current = false;
        return;
      }

      streamRef.current = stream;
      setPermissionState('granted');

      try {
        video.srcObject = stream;
        log('Stream assigned to video element');

        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('muted', '');
        video.muted = true;

        await waitForVideoReady(video);
        log('Video ready, attempting to play');

        await video.play();
        log('Video playing successfully');

        startFrameCheck(video, async () => {
          if (retryCountRef.current < 2 && mountedRef.current) {
            retryCountRef.current++;
            log(`Video not producing frames, retry attempt ${retryCountRef.current}`);
            initializingRef.current = false;
            await startCamera(facingModeRef.current, true);
          } else {
            setError('Camera preview is not working. Please try again or use "Browse Files".');
            setLoading(false);
          }
        });

        const detectedCameras = await enumerateCameras();
        setCameras(detectedCameras);

        log(`Detected ${detectedCameras.length} camera(s)`);
      } catch (err) {
        logError('Error during video setup:', err);
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        stopStream();
      } finally {
        setLoading(false);
        initializingRef.current = false;
      }
    },
    [
      stopStream,
      startCameraWithConstraints,
      getErrorMessage,
      waitForVideoReady,
      startFrameCheck,
      enumerateCameras,
      setCurrentFacingMode,
    ]
  );

  const checkCameraPermission = useCallback(async (): Promise<void> => {
    log('Checking camera permission...');
    setPermissionState('checking');

    if (!navigator.mediaDevices?.getUserMedia) {
      log('getUserMedia not supported');
      setPermissionState('unsupported');
      return;
    }

    if (!navigator.permissions?.query) {
      log('Permissions API not supported, showing prompt UI');
      setPermissionState('prompt');
      return;
    }

    try {
      const status = await navigator.permissions.query({ name: 'camera' as PermissionName });
      permissionStatusRef.current = status;
      log(`Permission status: ${status.state}`);

      // Clean up any previous listener before adding a new one
      if (permissionListenerRef.current) {
        status.removeEventListener('change', permissionListenerRef.current);
      }

      const handlePermissionChange = (): void => {
        log(`Permission changed to: ${status.state}`);
        if (mountedRef.current) {
          setPermissionState(status.state as PermissionState);
        }
      };

      permissionListenerRef.current = handlePermissionChange;
      status.addEventListener('change', handlePermissionChange);

      if (status.state === 'granted') {
        retryCountRef.current = 0;
        // Don't call startCamera() directly here — the <video> element
        // only renders when permissionState === 'granted', so it won't
        // be in the DOM yet (permissionState is still 'checking').
        // Setting state to 'granted' triggers a re-render that mounts
        // the <video>, then the useEffect below picks it up and starts
        // the camera after the DOM commit.
        setPermissionState('granted');
      } else {
        setPermissionState(status.state as PermissionState);
      }
    } catch (err) {
      log('Permissions query not supported for camera, showing prompt UI');
      setPermissionState('prompt');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    log('Component mounted');

    return () => {
      log('Component unmounting...');
      mountedRef.current = false;
      stopStream();
      // Clean up permission change listener to prevent memory leak
      if (permissionStatusRef.current && permissionListenerRef.current) {
        permissionStatusRef.current.removeEventListener('change', permissionListenerRef.current);
        permissionListenerRef.current = null;
      }
      permissionStatusRef.current = null;
    };
  }, [stopStream]);

  useEffect(() => {
    if (isOpen) {
      log('Modal opened');
      setCapturedImage(null);
      setError(null);
      setIsVideoReady(false);
      retryCountRef.current = 0;
      initializingRef.current = false;
      checkCameraPermission();
    } else {
      log('Modal closed');
      stopStream();
    }
  }, [isOpen, checkCameraPermission, stopStream]);

  useEffect(() => {
    if (
      isOpen &&
      permissionState === 'granted' &&
      !streamRef.current &&
      !capturedImage &&
      !initializingRef.current
    ) {
      log('Permission granted but no stream, starting camera');
      retryCountRef.current = 0;
      startCamera();
    }
  }, [isOpen, permissionState, capturedImage, startCamera]);

  const handleCapture = useCallback((): void => {
    log('Capture button clicked');
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      logError('Video or canvas element not available');
      toast.error('Could not capture image. Please try again.');
      return;
    }

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      logError('Video dimensions are zero, cannot capture');
      toast.error('Camera not ready. Please wait and try again.');
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      log(`Capturing at ${canvas.width}x${canvas.height}`);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        logError('Could not get canvas context');
        toast.error('Could not process the captured image.');
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

      if (dataUrl === 'data:,') {
        logError('Captured image is empty');
        toast.error('Captured image is empty. Please try again.');
        return;
      }

      log('Image captured successfully');
      setCapturedImage(dataUrl);
      stopStream();
    } catch (err) {
      logError('Error during capture:', err);
      toast.error('Failed to capture image. Please try again.');
    }
  }, [stopStream]);

  const handleRetake = useCallback((): void => {
    log('Retake button clicked');
    setCapturedImage(null);
    setError(null);
    retryCountRef.current = 0;
    startCamera();
  }, [startCamera]);

  const handleClose = useCallback((): void => {
    log('Close button clicked');
    stopStream();
    setCapturedImage(null);
    setError(null);
    setIsVideoReady(false);
    onClose();
  }, [stopStream, onClose]);

  const handleUsePhoto = useCallback((): void => {
    log('Use photo button clicked');
    const canvas = canvasRef.current;

    if (!capturedImage || !canvas) {
      logError('No captured image or canvas available');
      toast.error('No image to use. Please capture again.');
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          logError('Could not create blob from canvas');
          toast.error('Could not process the captured image. Please try again.');
          return;
        }

        const file = new File([blob], `leaf-scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
        log('Created file:', file.name, file.size);
        onCapture(file);
        handleClose();
      },
      'image/jpeg',
      0.92
    );
  }, [capturedImage, onCapture, handleClose]);

  const toggleCamera = useCallback((): void => {
    log('Toggle camera button clicked');
    const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    setCurrentFacingMode(newFacingMode);
    retryCountRef.current = 0;
    initializingRef.current = false;
    startCamera(newFacingMode);
  }, [currentFacingMode, startCamera]);

  const handleRequestPermission = useCallback((): void => {
    log('Request permission button clicked');
    retryCountRef.current = 0;
    startCamera();
  }, [startCamera]);

  const handleRetry = useCallback((): void => {
    log('Retry button clicked');
    setError(null);
    retryCountRef.current = 0;
    initializingRef.current = false;
    startCamera();
  }, [startCamera]);

  if (!isOpen) return null;

  const showVideoControls = permissionState === 'granted' && !error;
  const hasMultipleCameras = cameras.length > 1;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Camera size={18} className="text-primary" /> Scan Leaf with Camera
          </h3>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close camera"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative bg-black aspect-[4/3] flex items-center justify-center overflow-hidden">
          {permissionState === 'checking' && (
            <div className="flex flex-col items-center gap-2 text-white/70">
              <RefreshCw size={24} className="animate-spin" />
              <p className="text-xs">Checking camera access...</p>
            </div>
          )}

          {permissionState === 'unsupported' && (
            <div className="text-center px-6 space-y-2">
              <p className="text-sm text-white">Camera not supported in this browser.</p>
              <p className="text-xs text-white/60">Please use &quot;Browse Files&quot; instead.</p>
            </div>
          )}

          {permissionState === 'prompt' && !error && (
            <div className="text-center px-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
                <Lock size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Camera access needed</p>
                <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
                  Allow camera access so you can scan a leaf directly. Your photo isn&apos;t used
                  until you run a scan.
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                className="btn-primary text-xs px-4 py-2.5 gap-1.5"
                type="button"
              >
                <Camera size={16} /> Allow Camera Access
              </button>
            </div>
          )}

          {permissionState === 'denied' && !error && (
            <div className="text-center px-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto">
                <Lock size={24} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Camera access blocked</p>
                <p className="text-xs text-white/60 mt-1 max-w-xs mx-auto">
                  Camera access is currently blocked for this site. Open your browser&apos;s site
                  settings, allow Camera, then try again.
                </p>
              </div>
              <button
                onClick={handleRetry}
                className="btn-secondary text-xs px-4 py-2"
                type="button"
              >
                Try Again
              </button>
            </div>
          )}

          {error && (
            <div className="text-center px-6 space-y-3">
              <p className="text-sm text-white">{error}</p>
              <button
                onClick={handleRetry}
                className="btn-secondary text-xs px-4 py-2"
                type="button"
              >
                Try Again
              </button>
            </div>
          )}

          {permissionState === 'granted' && !error && (
            <>
              {capturedImage ? (
                <img
                  src={capturedImage}
                  alt="Captured leaf"
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: currentFacingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />
                  {(loading || !isVideoReady) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw size={28} className="animate-spin text-white" />
                        <p className="text-xs text-white/70">Starting camera...</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-center gap-3 px-5 py-4">
          {showVideoControls && !capturedImage && (
            <>
              {hasMultipleCameras && (
                <button
                  onClick={toggleCamera}
                  disabled={loading || !isVideoReady}
                  className="btn-secondary text-xs px-3.5 py-2.5 gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  <SwitchCamera size={16} /> Switch
                </button>
              )}
              <button
                onClick={handleCapture}
                disabled={loading || !isVideoReady}
                className="btn-primary px-6 py-2.5 gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <Camera size={18} /> Capture
              </button>
            </>
          )}

          {showVideoControls && capturedImage && (
            <>
              <button
                onClick={handleRetake}
                className="btn-secondary text-xs px-4 py-2.5 gap-1.5"
                type="button"
              >
                <RefreshCw size={16} /> Retake
              </button>
              <button
                onClick={handleUsePhoto}
                className="btn-primary px-4 py-2.5 gap-1.5"
                type="button"
              >
                <Check size={18} /> Use This Photo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
