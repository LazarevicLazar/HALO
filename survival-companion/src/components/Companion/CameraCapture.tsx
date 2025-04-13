import React, { useRef, useState, useEffect } from 'react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  onCancel: () => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Start the camera when the component mounts
    const startCamera = async () => {
      try {
        console.log('Requesting camera access...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } // Use the back camera if available
        });
        
        if (videoRef.current) {
          console.log('Camera access granted, setting up video stream');
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('Could not access camera. Please check permissions and try again.');
      }
    };

    startCamera();

    // Clean up function to stop the camera when component unmounts
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        console.log('Stopping camera stream');
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      console.log(`Capturing image at ${canvas.width}x${canvas.height}`);
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to base64 image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8); // Use 80% quality to reduce size
        console.log('Image captured, data URL length:', imageData.length);
        onCapture(imageData);
        
        // Stop the camera stream
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    } else {
      console.error('Cannot capture image: video or canvas not available, or stream not active');
      setError('Could not capture image. Please try again.');
    }
  };

  return (
    <div className="camera-capture">
      <h3 style={{ marginBottom: '0.5rem' }}>Capture Image for Analysis</h3>
      
      {error && (
        <div className="alert alert-danger" style={{
          backgroundColor: 'var(--danger-color)',
          color: 'var(--text-color)',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        position: 'relative',
        width: '100%',
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: 'var(--primary-color)',
        border: '1px solid var(--border-color)'
      }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ 
            width: '100%',
            display: 'block'
          }}
        />
        
        {!isStreaming && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <div style={{ marginBottom: '1rem' }}>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </div>
              <p>Initializing camera...</p>
            </div>
          </div>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="camera-controls" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '1rem' 
      }}>
        <button 
          className="button" 
          onClick={onCancel}
          style={{
            backgroundColor: 'var(--danger-color)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        
        <button 
          className="button" 
          onClick={captureImage}
          style={{
            backgroundColor: isStreaming ? 'var(--accent-color)' : 'var(--primary-color)',
            border: isStreaming ? 'none' : '1px solid var(--border-color)',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: isStreaming ? 'pointer' : 'not-allowed',
            opacity: isStreaming ? 1 : 0.5
          }}
          disabled={!isStreaming}
        >
          Capture
        </button>
      </div>
      
      <p style={{ 
        fontSize: '0.8rem', 
        marginTop: '1rem', 
        color: 'var(--text-secondary-color)',
        textAlign: 'center'
      }}>
        Image will be analyzed for survival insights
      </p>
    </div>
  );
};

export default CameraCapture;