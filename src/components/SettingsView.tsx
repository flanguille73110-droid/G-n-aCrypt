import React, { useState } from 'react';
import { 
  Settings, 
  Trash2, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Database, 
  Info,
  X,
  RefreshCw,
  HelpCircle,
  KeyRound,
  Check,
  AlertCircle
} from 'lucide-react';
import { FamilyTreeData } from '../types';
import { PRESET_SECURITY_QUESTIONS } from '../utils/crypto';

interface SettingsViewProps {
  treeData: FamilyTreeData;
  activeSecurityQuestion?: string;
  onUpdateSecurityQuestion: (question: string, answer: string, currentPass: string) => { success: boolean; message: string };
  onResetToEmpty: () => void;
  onResetToSample: () => void;
  onWipeStorageAndLock: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  treeData,
  activeSecurityQuestion,
  onUpdateSecurityQuestion,
  onResetToEmpty,
  onResetToSample,
  onWipeStorageAndLock,
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [resetMode, setResetMode] = useState<'empty' | 'sample' | 'wipe'>('empty');
  const [confirmText, setConfirmText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Security Question Settings State
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_SECURITY_QUESTIONS[0]);
  const [customQuestionText, setCustomQuestionText] = useState<string>('');
  const [newAnswer, setNewAnswer] = useState<string>('');
  const [confirmNewAnswer, setConfirmNewAnswer] = useState<string>('');
  const [currentPassForQuestion, setCurrentPassForQuestion] = useState<string>('');
  const [questionMsg, setQuestionMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleOpenResetModal = (mode: 'empty' | 'sample' | 'wipe') => {
    setResetMode(mode);
    setConfirmText('');
    setIsConfirmModalOpen(true);
  };

  const handleSaveSecurityQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setQuestionMsg(null);

    const questionText = selectedPreset === 'CUSTOM' ? customQuestionText.trim() : selectedPreset;

    if (!questionText) {
      setQuestionMsg({ text: 'Veuillez saisir le texte de votre question secrète.', isError: true });
      return;
    }

    if (!newAnswer.trim()) {
      setQuestionMsg({ text: 'Veuillez saisir votre réponse secrète.', isError: true });
      return;
    }

    if (newAnswer !== confirmNewAnswer) {
      setQuestionMsg({ text: 'Les deux réponses secrètes ne correspondent pas.', isError: true });
      return;
    }

    if (!currentPassForQuestion) {
      setQuestionMsg({ text: 'Veuillez saisir votre mot de passe maître actuel.', isError: true });
      return;
    }

    const res = onUpdateSecurityQuestion(questionText, newAnswer, currentPassForQuestion);

    if (res.success) {
      setQuestionMsg({ text: res.message, isError: false });
      setNewAnswer('');
      setConfirmNewAnswer('');
      setCurrentPassForQuestion('');
      if (selectedPreset === 'CUSTOM') setCustomQuestionText('');
    } else {
      setQuestionMsg({ text: res.message, isError: true });
    }
  };

  const handleConfirmReset = () => {
    if (confirmText.trim().toUpperCase() !== 'REINITIALISER') {
      return;
    }

    if (resetMode === 'empty') {
      onResetToEmpty();
      setStatusMessage('L\'application a été réinitialisée. Tous les noms et dates ont été effacés.');
    } else if (resetMode === 'sample') {
      onResetToSample();
      setStatusMessage('L\'application a été réinitialisée avec la structure de démonstration.');
    } else if (resetMode === 'wipe') {
      onWipeStorageAndLock();
      return;
    }

    setIsConfirmModalOpen(false);
    setConfirmText('');
    
    // Clear status message after 6 seconds
    setTimeout(() => {
      setStatusMessage(null);
    }, 6000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-[#2D2926] space-y-8 font-sans">
      
      {/* Header Banner */}
      <div className="bg-[#EFE9DB] border border-[#D9D2C2] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 bg-[#5C4D3F] flex items-center justify-center text-white shadow-xs shrink-0">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-[#5C4D3F]">
              Paramètres de l'Application
            </h2>
            <p className="text-xs text-[#8C7B6B] mt-0.5">
              Gestion de la confidentialité locale, préférences et réinitialisation globale.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-[#D9D2C2] text-xs text-[#5C4D3F] font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Application 100% Hors-Ligne & Chiffrée (AES-256)</span>
        </div>
      </div>

      {/* Status Notification Banner */}
      {statusMessage && (
        <div className="p-4 bg-[#EFE9DB] border border-[#D9D2C2] text-[#5C4D3F] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Settings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Offline Security Guarantee */}
        <div className="bg-white border border-[#D9D2C2] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#D9D2C2]">
            <Lock className="h-5 w-5 text-[#D97706]" />
            <h3 className="font-bold font-serif text-lg text-[#5C4D3F]">
              Garantie de Confidentialité
            </h3>
          </div>

          <div className="space-y-3 text-xs text-[#2D2926] font-serif leading-relaxed">
            <div className="p-3 bg-[#F9F6F0] border border-[#D9D2C2] space-y-2">
              <p className="font-bold text-[#5C4D3F] font-sans flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Aucun Serveur, Aucun Cloud
              </p>
              <p className="text-[#8C7B6B]">
                Toutes les données généalogiques restent exclusivement stockées dans le navigateur local de votre appareil.
              </p>
            </div>

            <div className="p-3 bg-[#F9F6F0] border border-[#D9D2C2] space-y-2">
              <p className="font-bold text-[#5C4D3F] font-sans flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Chiffrement Maître AES-256
              </p>
              <p className="text-[#8C7B6B]">
                Vos informations personnelles, actes d'état civil, photos et dispositions patrimoniales sont chiffrés avant d'être sauvegardés.
              </p>
            </div>

            <div className="p-3 bg-[#F9F6F0] border border-[#D9D2C2] space-y-2">
              <p className="font-bold text-[#5C4D3F] font-sans flex items-center gap-1.5">
                <Info className="h-4 w-4 text-[#D97706]" />
                Zero Télémétrie
              </p>
              <p className="text-[#8C7B6B]">
                Aucun log, aucune métadonnée ni aucune image ne sont jamais transmis sur Internet.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: App Statistics Summary */}
        <div className="bg-white border border-[#D9D2C2] p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#D9D2C2]">
            <Database className="h-5 w-5 text-[#5C4D3F]" />
            <h3 className="font-bold font-serif text-lg text-[#5C4D3F]">
              État Actuel de la Base
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-4 bg-[#F9F6F0] border border-[#D9D2C2]">
              <span className="block text-2xl font-bold font-serif text-[#5C4D3F]">
                {treeData.persons.length}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6B]">
                Membres Répertoriés
              </span>
            </div>

            <div className="p-4 bg-[#F9F6F0] border border-[#D9D2C2]">
              <span className="block text-2xl font-bold font-serif text-[#5C4D3F]">
                {treeData.customEvents?.length || 0}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6B]">
                Événements Marquants
              </span>
            </div>

            <div className="p-4 bg-[#F9F6F0] border border-[#D9D2C2]">
              <span className="block text-2xl font-bold font-serif text-[#5C4D3F]">
                {treeData.persons.reduce((acc, p) => acc + (p.documents?.length || 0), 0)}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6B]">
                Actes & Documents
              </span>
            </div>

            <div className="p-4 bg-[#F9F6F0] border border-[#D9D2C2]">
              <span className="block text-2xl font-bold font-serif text-[#5C4D3F]">
                {treeData.auditLogs?.length || 0}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C7B6B]">
                Entrées d'Historique
              </span>
            </div>
          </div>

          <p className="text-xs text-[#8C7B6B] font-serif italic pt-2">
            Dernière modification enregistrée le : {new Date(treeData.updatedAt).toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Card 3: Security Question Management */}
      <div className="bg-white border border-[#D9D2C2] p-6 shadow-xs space-y-5">
        <div className="flex items-center space-x-2 pb-3 border-b border-[#D9D2C2]">
          <HelpCircle className="h-5 w-5 text-[#D97706]" />
          <div>
            <h3 className="font-bold font-serif text-lg text-[#5C4D3F]">
              Question Secrète (Récupération en cas d'oubli)
            </h3>
            <p className="text-xs text-[#8C7B6B]">
              Permet de réinitialiser votre mot de passe maître sur cet appareil sans aucun serveur ni cloud.
            </p>
          </div>
        </div>

        {activeSecurityQuestion ? (
          <div className="p-3 bg-[#EFE9DB] border border-[#D9D2C2] text-xs text-[#5C4D3F] flex items-center justify-between">
            <div>
              <span className="font-bold text-[#8C7B6B] block uppercase text-[10px] tracking-wider">Question secrète active :</span>
              <span className="font-serif font-bold text-sm text-[#5C4D3F] italic">"{activeSecurityQuestion}"</span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold px-2 py-1 border border-emerald-300 flex items-center gap-1 shrink-0">
              <Check className="h-3 w-3" /> Configurée
            </span>
          </div>
        ) : (
          <div className="p-3 bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
            <span>Aucune question secrète n'est encore configurée pour cette base de données.</span>
          </div>
        )}

        {questionMsg && (
          <div className={`p-3 text-xs border flex items-center gap-2 ${
            questionMsg.isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            {questionMsg.isError ? <AlertCircle className="h-4 w-4 shrink-0 text-red-600" /> : <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
            <span>{questionMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveSecurityQuestion} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3F] mb-1">
                Choisissez ou personnalisez la question :
              </label>
              <select
                value={selectedPreset}
                onChange={(e) => setSelectedPreset(e.target.value)}
                className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 focus:outline-none focus:border-[#5C4D3F]"
              >
                {PRESET_SECURITY_QUESTIONS.map((q, idx) => (
                  <option key={idx} value={q}>{q}</option>
                ))}
                <option value="CUSTOM">Question personnalisée...</option>
              </select>
            </div>

            {selectedPreset === 'CUSTOM' ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3F] mb-1">
                  Intitulé de votre question personnalisée :
                </label>
                <input
                  type="text"
                  required
                  value={customQuestionText}
                  onChange={(e) => setCustomQuestionText(e.target.value)}
                  placeholder="Ex: Nom de mon professeur préféré ?"
                  className="w-full bg-[#F9F6F0] border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 focus:outline-none focus:border-[#5C4D3F]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8C7B6B] mb-1">
                  Information :
                </label>
                <div className="p-2.5 bg-[#F9F6F0] border border-[#D9D2C2] text-[11px] text-[#8C7B6B] italic font-serif">
                  La réponse sera chiffrée localement via PBKDF2 pour autoriser le déchiffrement de secours.
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3F] mb-1">
                Nouvelle Réponse Secrète :
              </label>
              <input
                type="text"
                required
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Votre réponse secrète"
                className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 focus:outline-none focus:border-[#5C4D3F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3F] mb-1">
                Confirmer la Réponse Secrète :
              </label>
              <input
                type="text"
                required
                value={confirmNewAnswer}
                onChange={(e) => setConfirmNewAnswer(e.target.value)}
                placeholder="Confirmez la réponse"
                className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 focus:outline-none focus:border-[#5C4D3F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5C4D3F] mb-1 flex items-center gap-1">
              <KeyRound className="h-3.5 w-3.5 text-[#8C7B6B]" />
              Mot de Passe Maître Actuel (Requis pour valider) :
            </label>
            <input
              type="password"
              required
              value={currentPassForQuestion}
              onChange={(e) => setCurrentPassForQuestion(e.target.value)}
              placeholder="Mot de passe maître actuel"
              className="w-full md:w-1/2 bg-white border border-[#D9D2C2] text-[#2D2926] text-xs p-2.5 focus:outline-none focus:border-[#5C4D3F]"
            />
          </div>

          <button
            type="submit"
            className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 transition cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Enregistrer la Question Secrète</span>
          </button>
        </form>
      </div>

      {/* Card 3: Danger Zone - Reset Options */}
      <div className="bg-white border border-red-200 p-6 shadow-xs space-y-6">
        <div className="flex items-center space-x-2 pb-3 border-b border-red-200">
          <AlertTriangle className="h-5 w-5 text-red-800" />
          <div>
            <h3 className="font-bold font-serif text-lg text-red-900">
              Réinitialisation & Remise à Zéro
            </h3>
            <p className="text-xs text-red-700">
              Zone sensible : réinitialiser l'application pour effacer tous les noms et dates déjà renseignés.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Action 1: Reset to empty */}
          <div className="p-4 bg-red-50/50 border border-red-200 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-sm text-red-900 font-serif flex items-center gap-1.5">
                <RotateCcw className="h-4 w-4 text-red-800" />
                Arbre Vierge (Remise à Zéro)
              </h4>
              <p className="text-xs text-[#2D2926] mt-1 font-serif">
                Efface l'ensemble des membres, noms, prénoms, dates, mariages, lieux, documents et notes enregistrés. Permet de repartir immédiatement d'un arbre généalogique totalement vide.
              </p>
            </div>

            <button
              onClick={() => handleOpenResetModal('empty')}
              className="w-full bg-red-800 hover:bg-red-900 text-white font-bold text-xs py-2.5 px-4 transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Réinitialiser l'Application (Arbre Vide)</span>
            </button>
          </div>

          {/* Action 2: Reset to sample data */}
          <div className="p-4 bg-[#F9F6F0] border border-[#D9D2C2] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-sm text-[#5C4D3F] font-serif flex items-center gap-1.5">
                <RefreshCw className="h-4 w-4 text-[#D97706]" />
                Réinitialiser avec Données de Démonstration
              </h4>
              <p className="text-xs text-[#2D2926] mt-1 font-serif">
                Remplace les données actuelles par l'arbre généalogique de démonstration (Famille Dupont-Martin) pour tester à nouveau les fonctionnalités de l'application.
              </p>
            </div>

            <button
              onClick={() => handleOpenResetModal('sample')}
              className="w-full bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-bold text-xs py-2.5 px-4 transition cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Recharger la Démo</span>
            </button>
          </div>

        </div>
      </div>

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F9F6F0] border border-red-300 w-full max-w-lg shadow-2xl overflow-hidden my-8 text-[#2D2926] flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="bg-red-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 bg-white/10 flex items-center justify-center text-white font-bold">
                  <AlertTriangle className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif">
                    Modal de Confirmation de Réinitialisation
                  </h3>
                  <p className="text-xs text-red-200">
                    Action irréversible sur votre base de données locale
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsConfirmModalOpen(false)}
                className="text-white/80 hover:text-white p-1.5 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs font-sans">
              
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 space-y-1">
                <p className="font-bold text-sm">
                  ⚠️ Êtes-vous absolument certain(e) de vouloir continuer ?
                </p>
                <p className="leading-relaxed">
                  {resetMode === 'empty' 
                    ? 'Toutes les personnes, tous les noms, dates de naissance, dates de décès, lieux, actes numérisés et histoires familiales déjà renseignés vont être DÉFINITIVEMENT EFFACÉS de cet appareil.'
                    : 'Les données actuelles de votre arbre généalogique vont être remplacées par l\'arbre de démonstration.'
                  }
                </p>
              </div>

              <div className="space-y-2">
                <p className="font-bold text-[#5C4D3F]">
                  Pour confirmer cette réinitialisation, veuillez saisir le mot <span className="font-mono text-red-800 bg-red-100 px-1 py-0.5">REINITIALISER</span> ci-dessous :
                </p>
                
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Tapez REINITIALISER en majuscules..."
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] p-2.5 font-mono text-sm focus:outline-none focus:border-red-800"
                  autoFocus
                />
              </div>

              <div className="pt-4 border-t border-[#D9D2C2] flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-[#EFE9DB] text-[#5C4D3F] border border-[#D9D2C2] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Annuler
                </button>

                <button
                  type="button"
                  disabled={confirmText.trim().toUpperCase() !== 'REINITIALISER'}
                  onClick={handleConfirmReset}
                  className={`px-5 py-2 font-bold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer ${
                    confirmText.trim().toUpperCase() === 'REINITIALISER'
                      ? 'bg-red-800 hover:bg-red-900 text-white shadow-xs'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Confirmer la Réinitialisation</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
