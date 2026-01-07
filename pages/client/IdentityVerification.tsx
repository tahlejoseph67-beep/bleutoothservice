
import React, { useRef, useState, useEffect } from 'react';
import { AuthService } from '../../services/mockDatabase';
import { Camera, CheckCircle, RefreshCcw, ShieldCheck } from 'lucide-react';

const IdentityVerification: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Erreur d'accès à la caméra. Veuillez autoriser les permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);
      const data = canvas.toDataURL('image/jpeg');
      setCapturedImage(data);
    }
  };

  const saveVerification = () => {
    if (capturedImage) {
      setIsCapturing(true);
      setTimeout(() => {
        AuthService.updateVerification(capturedImage);
        setIsCapturing(false);
        onComplete();
      }, 1500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <ShieldCheck className="text-blue-600" />
          Vérification d'Identité
        </h2>
        <p className="text-slate-500 mt-2">Enregistrez votre visage pour sécuriser vos futurs transferts.</p>
      </div>

      <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border-4 border-slate-100 shadow-inner">
        {!capturedImage ? (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-[30px] border-slate-900/40 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 border-2 border-blue-400 border-dashed rounded-full animate-pulse"></div>
            </div>
          </>
        ) : (
          <img src={capturedImage} className="w-full h-full object-cover" alt="Capture" />
        )}
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        {!capturedImage ? (
          <button 
            onClick={capturePhoto}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-2 transition-all"
          >
            <Camera size={20} />
            Capturer mon visage
          </button>
        ) : (
          <>
            <button 
              onClick={() => setCapturedImage(null)}
              className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg flex items-center gap-2 transition-all"
            >
              <RefreshCcw size={18} />
              Recommencer
            </button>
            <button 
              onClick={saveVerification}
              disabled={isCapturing}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isCapturing ? "Traitement..." : "Valider l'identité"}
              <CheckCircle size={20} />
            </button>
          </>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default IdentityVerification;
