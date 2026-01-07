
import React, { useState, useRef, useEffect } from 'react';
import { TransactionService, AuthService } from '../../services/mockDatabase';
import { verifyFaceMatch } from '../../services/geminiService';
import { TransactionType, PaymentMethod } from '../../types';
import { Send, Smartphone, Building, Globe, Loader2, CheckCircle, ShieldCheck, Camera, AlertTriangle } from 'lucide-react';

interface TransferProps {
  onSuccess: () => void;
  onNavigateToVerify: () => void;
}

const Transfer: React.FC<TransferProps> = ({ onSuccess, onNavigateToVerify }) => {
  const user = AuthService.getCurrentUser();
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.MOBILE_MONEY);
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFaceCheck, setShowFaceCheck] = useState(false);
  const [faceStatus, setFaceStatus] = useState<'idle' | 'capturing' | 'verifying' | 'failed'>('idle');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (showFaceCheck) startCamera();
  }, [showFaceCheck]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Caméra inaccessible pour la vérification.");
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isVerified) {
        setError("Votre compte n'est pas encore validé. Veuillez effectuer la vérification d'identité.");
        return;
    }
    setError('');
    setShowFaceCheck(true);
  };

  const verifyAndFinalize = async () => {
    setFaceStatus('capturing');
    if (videoRef.current && canvasRef.current && user?.faceData) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const capture = canvas.toDataURL('image/jpeg');

        setFaceStatus('verifying');
        const match = await verifyFaceMatch(user.faceData, capture);
        
        if (match) {
            processTransfer();
        } else {
            setFaceStatus('failed');
            setError("Vérification faciale échouée. Identité non reconnue.");
        }
    }
  };

  const processTransfer = () => {
    setIsLoading(true);
    setTimeout(() => {
        try {
            TransactionService.createTransaction({
                type: TransactionType.TRANSFER,
                amount: parseInt(amount),
                method: method,
                recipient: recipient,
                userId: ''
            });
            setIsLoading(false);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onSuccess();
            }, 2000);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
            setShowFaceCheck(false);
        }
    }, 1000);
  };

  const getMethodIcon = (m: PaymentMethod) => {
      switch(m) {
          case PaymentMethod.BANK_TRANSFER: return <Building size={20} />;
          case PaymentMethod.WESTERN_UNION: return <Globe size={20} />;
          default: return <Smartphone size={20} />;
      }
  };

  if (success) {
      return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fade-in text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={40} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Transfert Approuvé !</h2>
              <p className="text-slate-500">Validation biométrique réussie. Demande envoyée.</p>
          </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
          <h2 className="text-2xl font-bold text-slate-800">Effectuer un Transfert</h2>
          <p className="text-slate-500">Validation faciale obligatoire pour chaque transaction.</p>
      </div>

      {!user?.isVerified && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4">
              <AlertTriangle className="text-amber-600 shrink-0" />
              <div>
                  <h4 className="font-bold text-amber-800">Compte non vérifié</h4>
                  <p className="text-sm text-amber-700 mb-2">Vous devez valider votre identité avant de pouvoir effectuer des transferts.</p>
                  <button onClick={onNavigateToVerify} className="text-sm font-bold text-amber-900 underline">Vérifier mon identité maintenant</button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[PaymentMethod.MOBILE_MONEY, PaymentMethod.MOOV_MONEY, PaymentMethod.BANK_TRANSFER, PaymentMethod.WESTERN_UNION].map((m) => (
            <button
                key={m}
                disabled={!user?.isVerified}
                onClick={() => setMethod(m)}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-3 transition-all ${
                    method === m 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 disabled:opacity-50'
                }`}
            >
                {getMethodIcon(m)}
                <span className="text-sm font-bold text-center">{m}</span>
            </button>
        ))}
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <form onSubmit={handleInitialSubmit} className="space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2 mb-4">Détails du transfert</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Montant (FCFA)</label>
                    <input 
                        type="number" 
                        required
                        disabled={!user?.isVerified}
                        min="500"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ex: 10000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Bénéficiaire</label>
                    <input 
                        type="text" 
                        required
                        disabled={!user?.isVerified}
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Infos destinataire"
                    />
                </div>
            </div>

            {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

            <div className="pt-4">
                <button 
                    type="submit" 
                    disabled={!user?.isVerified || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    <ShieldCheck size={18} />
                    Vérifier et Envoyer
                </button>
            </div>
        </form>
      </div>

      {showFaceCheck && (
          <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Vérification Biométrique</h3>
                  <p className="text-slate-500 text-sm mb-6">Regardez la caméra pour confirmer votre identité.</p>
                  
                  <div className="relative w-64 h-64 mx-auto bg-slate-100 rounded-full overflow-hidden border-4 border-blue-100 mb-8">
                      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`w-48 h-48 border-2 rounded-full ${faceStatus === 'verifying' ? 'border-blue-500 border-dashed animate-spin' : 'border-blue-400'}`}></div>
                      </div>
                  </div>

                  <div className="space-y-4">
                      {faceStatus === 'idle' && (
                          <button 
                            onClick={verifyAndFinalize}
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                          >
                              <Camera size={20} /> Scanner mon visage
                          </button>
                      )}
                      {faceStatus === 'verifying' && <div className="text-blue-600 font-bold animate-pulse">Analyse Gemini AI en cours...</div>}
                      {faceStatus === 'failed' && (
                          <button 
                            onClick={() => { setFaceStatus('idle'); setError(''); }}
                            className="w-full py-3 bg-red-600 text-white font-bold rounded-lg"
                          >
                              Réessayer le scan
                          </button>
                      )}
                      
                      <button 
                        onClick={() => setShowFaceCheck(false)}
                        className="text-slate-500 text-sm hover:underline"
                      >
                          Annuler le transfert
                      </button>
                  </div>
              </div>
              <canvas ref={canvasRef} className="hidden" />
          </div>
      )}
    </div>
  );
};

export default Transfer;
