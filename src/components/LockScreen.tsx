import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Sparkles, Upload, AlertCircle, FileKey, HelpCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { EncryptedPayload, FamilyTreeData } from '../types';
import { decryptData, PRESET_SECURITY_QUESTIONS, normalizeSecretAnswer } from '../utils/crypto';
import { INITIAL_SAMPLE_TREE } from '../data/sampleData';

interface LockScreenProps {
  encryptedPayload: EncryptedPayload | null;
  onUnlockSuccess: (data: FamilyTreeData, password: string, securityQuestion?: string, secretAnswer?: string) => void;
  onInitializeNewTree: (masterPassword: string, initialData?: FamilyTreeData, securityQuestion?: string, secretAnswer?: string) => void;
  onImportEncryptedFile: (payload: EncryptedPayload) => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  encryptedPayload,
  onUnlockSuccess,
  onInitializeNewTree,
  onImportEncryptedFile,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNewSetup, setIsNewSetup] = useState(!encryptedPayload);

  // Forgot password flow states
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [secretAnswerInput, setSecretAnswerInput] = useState('');
  const [isAnswerVerified, setIsAnswerVerified] = useState(false);
  const [recoveredData, setRecoveredData] = useState<FamilyTreeData | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // New account / tree security question setup states
  const [selectedQuestion, setSelectedQuestion] = useState<string>(PRESET_SECURITY_QUESTIONS[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [setupSecretAnswer, setSetupSecretAnswer] = useState('');
  const [confirmSetupSecretAnswer, setConfirmSetupSecretAnswer] = useState('');

  const getEffectiveQuestion = () => {
    return selectedQuestion === 'CUSTOM' ? customQuestion.trim() : selectedQuestion;
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe maître.');
      return;
    }

    if (!encryptedPayload) {
      setErrorMessage('Aucune donnée chiffrée trouvée.');
      return;
    }

    try {
      const data = decryptData(encryptedPayload, password);
      onUnlockSuccess(data, password, encryptedPayload.securityQuestion);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message || 'Échec du déchiffrement. Vérifiez le mot de passe.');
      } else {
        setErrorMessage('Mot de passe incorrect ou fichier altéré.');
      }
    }
  };

  const handleVerifySecretAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!secretAnswerInput.trim()) {
      setErrorMessage('Veuillez saisir votre réponse secrète.');
      return;
    }

    if (!encryptedPayload?.recoveryPayload) {
      setErrorMessage("Aucune question secrète n'a été préalablement configurée pour cette base.");
      return;
    }

    try {
      const normalizedAns = normalizeSecretAnswer(secretAnswerInput);
      const data = decryptData(encryptedPayload.recoveryPayload, normalizedAns);
      setRecoveredData(data);
      setIsAnswerVerified(true);
      setSuccessMessage('Réponse correcte ! Vous pouvez maintenant définir votre nouveau mot de passe maître.');
    } catch {
      setErrorMessage('Réponse secrète incorrecte. Veuillez réessayer.');
    }
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 4) {
      setErrorMessage('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    if (!recoveredData) {
      setErrorMessage('Erreur lors de la récupération des données.');
      return;
    }

    onUnlockSuccess(
      recoveredData,
      newPassword,
      encryptedPayload?.securityQuestion,
      secretAnswerInput
    );
  };

  const handleCreateNewMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 4) {
      setErrorMessage('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les deux mots de passe ne correspondent pas.');
      return;
    }

    const finalQuestion = getEffectiveQuestion();

    if (setupSecretAnswer || confirmSetupSecretAnswer) {
      if (!setupSecretAnswer) {
        setErrorMessage('Veuillez saisir la réponse à votre question secrète.');
        return;
      }
      if (setupSecretAnswer !== confirmSetupSecretAnswer) {
        setErrorMessage('Les deux réponses secrètes ne correspondent pas.');
        return;
      }
      if (!finalQuestion) {
        setErrorMessage('Veuillez spécifier votre question secrète.');
        return;
      }
    }

    onInitializeNewTree(
      password,
      INITIAL_SAMPLE_TREE,
      setupSecretAnswer ? finalQuestion : undefined,
      setupSecretAnswer ? setupSecretAnswer : undefined
    );
  };

  const handleLoadDemoDataset = () => {
    const demoPass = '1234';
    onInitializeNewTree(
      demoPass,
      INITIAL_SAMPLE_TREE,
      PRESET_SECURITY_QUESTIONS[0],
      'Medor'
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.encrypted && parsed.ciphertext) {
          onImportEncryptedFile(parsed as EncryptedPayload);
          setIsNewSetup(false);
          setIsForgotMode(false);
          setErrorMessage('Fichier chiffré chargé. Entrez le mot de passe maître pour le déchiffrer.');
        } else if (Array.isArray(parsed.persons)) {
          onInitializeNewTree('1234', parsed as FamilyTreeData);
        } else {
          setErrorMessage('Format de fichier JSON non reconnu.');
        }
      } catch {
        setErrorMessage('Fichier invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-[#2D2926] font-sans relative overflow-hidden bg-[radial-gradient(#d9d2c2_1px,transparent_1px)] bg-[size:24px_24px]">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        
        {/* Lock Icon Emblem */}
        <div className="mx-auto h-16 w-16 bg-[#5C4D3F] flex items-center justify-center text-[#F9F6F0] shadow-md border border-[#4A3E32]">
          <Lock className="h-8 w-8" />
        </div>

        <h2 className="mt-5 text-3xl font-bold tracking-tight text-[#5C4D3F] font-serif italic">
          GénéaCrypt
        </h2>
        <p className="mt-1 text-xs text-[#8C7B6B] uppercase font-bold tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-700" /> Base chiffrée en AES-256
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-[#EFE9DB] py-8 px-6 shadow-xl border border-[#D9D2C2] sm:px-10">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-800 text-xs p-3.5 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. FORGOT PASSWORD MODE */}
          {isForgotMode ? (
            <div className="space-y-5">
              <div className="flex items-center space-x-2 border-b border-[#D9D2C2] pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setIsAnswerVerified(false);
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="p-1 hover:bg-white text-[#5C4D3F] border border-[#D9D2C2] cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <h3 className="text-sm font-serif font-bold text-[#5C4D3F] uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-[#D97706]" /> Mot de passe oublié
                  </h3>
                  <p className="text-[11px] text-[#8C7B6B]">Récupération via la question secrète</p>
                </div>
              </div>

              {!isAnswerVerified ? (
                /* Step 1: Secret Question & Answer Form */
                <form onSubmit={handleVerifySecretAnswer} className="space-y-4">
                  <div className="bg-white border border-[#D9D2C2] p-3.5 space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C7B6B]">
                      Question Secrète Définie :
                    </label>
                    <p className="font-serif font-bold text-sm text-[#5C4D3F] italic">
                      "{encryptedPayload?.securityQuestion || 'Nom de ton premier animal ?'}"
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-[#8C7B6B] mb-1">
                      Réponse à la question secrète
                    </label>
                    <input
                      type="text"
                      required
                      value={secretAnswerInput}
                      onChange={(e) => setSecretAnswerInput(e.target.value)}
                      placeholder="Saisissez votre réponse secrète..."
                      className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                      autoFocus
                    />
                    <p className="mt-1 text-[10px] text-[#8C7B6B] italic font-serif">
                      La dérivation PBKDF2 testera votre réponse en local.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-widest py-3 px-4 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-300" />
                    Vérifier la réponse secrète
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(false);
                        setIsAnswerVerified(false);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-xs text-[#8C7B6B] hover:text-[#5C4D3F] underline cursor-pointer"
                    >
                      Retour à la connexion par mot de passe
                    </button>
                  </div>
                </form>
              ) : (
                /* Step 2: Set New Master Password Form */
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-[#8C7B6B] mb-1">
                      Nouveau Mot de Passe Maître
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold text-[#8C7B6B] mb-1">
                      Confirmer le Nouveau Mot de Passe
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirmez le nouveau mot de passe"
                      className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-sm px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-widest py-3 px-4 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="h-4 w-4 text-emerald-400" />
                    Définir le nouveau mot de passe & Ouvrir
                  </button>
                </form>
              )}
            </div>
          ) : encryptedPayload && !isNewSetup ? (
            /* 2. UNLOCK FORM */
            <form onSubmit={handleUnlock} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#8C7B6B] mb-1.5">
                  Mot de Passe Maître (Clé AES-256)
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C7B6B]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe"
                    className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-sm pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-[#8C7B6B] italic font-serif">
                    Données chiffrées localement sans aucun serveur.
                  </p>
                  
                  {/* BOTTON MOT DE PASSE OUBLIÉ */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs font-bold text-[#B45309] hover:text-[#78350F] underline cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Mot de passe oublié ?</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-widest py-3 px-4 shadow-sm transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="h-4 w-4" />
                Déchiffrer et Ouvrir l'Arbre
              </button>

              <div className="pt-3 border-t border-[#D9D2C2] flex items-center justify-between text-xs text-[#8C7B6B]">
                <button
                  type="button"
                  onClick={() => setIsNewSetup(true)}
                  className="hover:text-[#5C4D3F] underline cursor-pointer"
                >
                  Créer un nouvel arbre
                </button>

                <label className="hover:text-[#5C4D3F] underline cursor-pointer flex items-center gap-1">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Importer .genea</span>
                  <input
                    type="file"
                    accept=".json,.genea"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </form>
          ) : (
            /* 3. FIRST SETUP FORM (NEW ACCOUNT / TREE) */
            <form onSubmit={handleCreateNewMasterPassword} className="space-y-4">
              <div className="text-center mb-1">
                <h3 className="text-base font-serif font-bold text-[#5C4D3F]">
                  Initialiser votre coffre généalogique
                </h3>
                <p className="text-xs text-[#8C7B6B] mt-0.5">
                  Définissez un mot de passe maître et une question secrète de secours.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#8C7B6B] mb-1">
                  Nouveau Mot de Passe Maître
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Exemple: MonArbreSecurise2026!"
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-[#8C7B6B] mb-1">
                  Confirmer le Mot de Passe
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez le mot de passe"
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#8C7B6B]"
                />
              </div>

              {/* Secret Question Section on Setup */}
              <div className="pt-3 border-t border-[#D9D2C2] space-y-3 bg-white p-3 border">
                <div className="flex items-center space-x-1.5 text-[#5C4D3F] font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="h-4 w-4 text-[#D97706]" />
                  <span>Question Secrète (Optionnelle / Récupération)</span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C7B6B] mb-1">
                    Choisissez votre question secrète :
                  </label>
                  <select
                    value={selectedQuestion}
                    onChange={(e) => setSelectedQuestion(e.target.value)}
                    className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-2.5 py-1.5 focus:outline-none"
                  >
                    {PRESET_SECURITY_QUESTIONS.map((q, idx) => (
                      <option key={idx} value={q}>{q}</option>
                    ))}
                    <option value="CUSTOM">Question personnalisée...</option>
                  </select>
                </div>

                {selectedQuestion === 'CUSTOM' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7B6B] mb-1">
                      Votre question personnalisée :
                    </label>
                    <input
                      type="text"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      placeholder="Ex: Quel est le prénom de mon meilleur ami d'enfance ?"
                      className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7B6B] mb-1">
                      Réponse secrète
                    </label>
                    <input
                      type="text"
                      value={setupSecretAnswer}
                      onChange={(e) => setSetupSecretAnswer(e.target.value)}
                      placeholder="Ex: Médor"
                      className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7B6B] mb-1">
                      Confirmer la réponse
                    </label>
                    <input
                      type="text"
                      value={confirmSetupSecretAnswer}
                      onChange={(e) => setConfirmSetupSecretAnswer(e.target.value)}
                      placeholder="Confirmez la réponse"
                      className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs px-2.5 py-1.5 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-sans text-xs uppercase tracking-widest py-3 px-4 shadow-sm transition flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <ShieldCheck className="h-4 w-4" />
                Créer l'Arbre et Chiffrer en AES-256
              </button>

              {/* Demo button */}
              <div className="pt-3 border-t border-[#D9D2C2] space-y-2">
                <button
                  type="button"
                  onClick={handleLoadDemoDataset}
                  className="w-full bg-white hover:bg-[#F9F6F0] border border-[#D9D2C2] text-[#5C4D3F] font-bold py-2.5 px-3 text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#D97706]" />
                  Charger la Famille Dupont-Martin (Démo)
                </button>

                <div className="flex justify-between items-center text-xs text-[#8C7B6B] pt-1">
                  {encryptedPayload && (
                    <button
                      type="button"
                      onClick={() => setIsNewSetup(false)}
                      className="hover:text-[#5C4D3F] underline cursor-pointer"
                    >
                      Retour au déchiffrement
                    </button>
                  )}

                  <label className="hover:text-[#5C4D3F] underline cursor-pointer flex items-center gap-1">
                    <FileKey className="h-3.5 w-3.5" />
                    <span>Restaurer .json</span>
                    <input
                      type="file"
                      accept=".json,.genea"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </form>
          )}

        </div>

        {/* Technical Footer Notice */}
        <div className="mt-6 text-center text-[11px] text-[#8C7B6B] space-y-1 font-serif italic">
          <p>Chiffrement AES-256 avec dérivation de clé PBKDF2 (10 000 itérations SHA-256)</p>
          <p>Toutes vos fiches familiales, photos et documents restent strictement confidentiels.</p>
        </div>

      </div>
    </div>
  );
};
