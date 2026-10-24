import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unavailable' | 'error';

interface TorchCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface TorchConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function describeError(error: unknown): { status: CameraStatus; message: string } {
  if (!(error instanceof DOMException)) {
    return { status: 'error', message: 'The camera could not be started.' };
  }

  switch (error.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return {
        status: 'denied',
        message: 'Camera access was blocked. Tap the preview to try again.',
      };
    case 'NotFoundError':
    case 'DevicesNotFoundError':
    case 'OverconstrainedError':
      return {
        status: 'unavailable',
        message: 'No usable camera was found. Simulation and the offline code still work.',
      };
    case 'NotReadableError':
    case 'AbortError':
      return {
        status: 'error',
        message: 'The camera is busy. Close other camera apps and tap to retry.',
      };
    default:
      return { status: 'error', message: 'The camera could not be started. Tap to retry.' };
  }
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const mountedRef = useRef(false);
  const resumeOnVisibleRef = useRef(false);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const statusRef = useRef<CameraStatus>('idle');

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const detach = useCallback(() => {
    const stream = streamRef.current;
    streamRef.current = null;
    stopStream(stream);

    const video = videoRef.current;
    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  const start = useCallback(async () => {
    if (!mountedRef.current) return;

    const request = ++requestRef.current;
    detach();
    setMessage(null);
    setStatus('requesting');

    if (!window.isSecureContext) {
      setStatus('unavailable');
      setMessage('Camera access needs the secure HTTPS link. Simulation and the offline code still work.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      setMessage('This browser does not support camera access. Simulation and the offline code still work.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (!mountedRef.current || request !== requestRef.current) {
        stopStream(stream);
        return;
      }

      const video = videoRef.current;
      if (!video) {
        stopStream(stream);
        setStatus('error');
        setMessage('The camera preview could not be attached. Tap to retry.');
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;

      try {
        await video.play();
      } catch {
        // The video is muted and inline; autoplay failure should not invalidate the stream.
      }

      if (!mountedRef.current || request !== requestRef.current) {
        detach();
        return;
      }

      const track = stream.getVideoTracks()[0];
      const capabilities = track?.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchSupported(Boolean(capabilities?.torch));
      setStatus('active');
    } catch (error) {
      if (!mountedRef.current || request !== requestRef.current) return;

      const described = describeError(error);
      setStatus(described.status);
      setMessage(described.message);
    }
  }, [detach]);

  const toggleTorch = useCallback(async () => {
    const next = !torchOn;
    setTorchOn(next);

    if (!torchSupported) return;

    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;

    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as TorchConstraintSet],
      });
    } catch {
      setTorchSupported(false);
    }
  }, [torchOn, torchSupported]);

  useEffect(() => {
    mountedRef.current = true;

    // Defer the request so React Strict Mode's development remount only opens the camera once.
    const startTimer = window.setTimeout(() => {
      void start();
    }, 0);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const shouldResume =
          statusRef.current === 'active' ||
          statusRef.current === 'requesting' ||
          statusRef.current === 'idle';

        resumeOnVisibleRef.current = shouldResume;
        requestRef.current += 1;
        detach();

        if (shouldResume) {
          setStatus('idle');
          setMessage(null);
        }
        return;
      }

      if (resumeOnVisibleRef.current) {
        resumeOnVisibleRef.current = false;
        void start();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearTimeout(startTimer);
      mountedRef.current = false;
      requestRef.current += 1;
      document.removeEventListener('visibilitychange', onVisibilityChange);
      detach();
    };
  }, [detach, start]);

  return {
    videoRef,
    status,
    message,
    torchOn,
    toggleTorch,
    retry: start,
  };
}
