import React, { useState } from 'react';
import { EncryptedPayload, FamilyTreeData } from '../types';
import { downloadJsonFile, encryptData } from '../utils/crypto';
import { X, ShieldCheck, Download, Upload, KeyRound, Lock, Check, AlertCircle } from 'lucide-react';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  treeData: FamilyTreeData;
  masterPassword: string;
  onUpdateMasterPassword: (newPass: string) => void;
  onImportNewData: (data: FamilyTreeData) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  treeData,
  masterPassword,
  onUpdateMasterPassword,
  onImportNewData,
}) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsError(false);

    if (currentPass !== masterPassword) {
      setIsError(true);
      setStatusMsg('Le mot de passe actuel est incorrect.');
      return;
    }

    if (newPass.length < 4) {
      setIsError(true);
      setStatusMsg('Le nouveau mot de passe doit contenir au moins 4 caractères.');
      return;
    }

    if (newPass !== confirmPass) {
      setIsError(true);
      setStatusMsg('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    onUpdateMasterPassword(newPass);
    setStatusMsg('Mot de passe maître mis à jour avec succès et données re-chiffrées en AES-256 !');
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleExportEncryptedJson = () => {
    const payload = encryptData(treeData, masterPassword);
    const jsonStr = JSON.stringify(payload, null, 2);
    const filename = `geneacrypt_chiffre_aes256_${new Date().toISOString().split('T')[0]}.genea`;
    downloadJsonFile(filename, jsonStr);
  };

  const handleExportDecryptedBackup = () => {
    if (confirm('Avertissement : Vous allez télécharger une sauvegarde JSON NON CHIFFRÉE. Conservez-la en lieu sûr.')) {
      const jsonStr = JSON.stringify(treeData, null, 2);
      const filename = `geneacrypt_sauvegarde_clair_${new Date().toISOString().split('T')[0]}.json`;
      downloadJsonFile(filename, jsonStr);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F9F6F0] border border-[#D9D2C2] w-full max-w-xl shadow-2xl overflow-hidden my-8 text-[#2D2926] flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-[#EFE9DB] p-5 border-b border-[#D9D2C2] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 bg-[#5C4D3F] flex items-center justify-center text-white font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#5C4D3F]">Sécurité & Chiffrement AES-256</h2>
              <p className="text-xs text-[#8C7B6B]">Gestion de la clé maître et téléchargement de sauvegardes.</p>
            </div>
          </div>

          <button onClick={onClose} className="text-[#8C7B6B] hover:text-[#2D2926] p-2 bg-white border border-[#D9D2C2] cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto">
          
          {statusMsg && (
            <div className={`p-3 border text-xs flex items-center gap-2 ${
              isError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-[#EFE9DB] border-[#D9D2C2] text-[#5C4D3F]'
            }`}>
              {isError ? <AlertCircle className="h-4 w-4 shrink-0 text-red-800" /> : <Check className="h-4 w-4 shrink-0 text-[#5C4D3F]" />}
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Export Actions */}
          <div className="space-y-3">
            <h3 className="font-bold font-serif text-sm uppercase tracking-wider text-[#5C4D3F]">
              1. Exporter la Base de Données
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportEncryptedJson}
                className="bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-bold p-3 transition text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Exporter Chiffré (.genea)</span>
                  <Download className="h-4 w-4" />
                </div>
                <p className="text-[10px] text-[#D9D2C2] font-normal">
                  Chiffré en AES-256 avec votre mot de passe maître actuel.
                </p>
              </button>

              <button
                onClick={handleExportDecryptedBackup}
                className="bg-white hover:bg-[#EFE9DB] text-[#2D2926] border border-[#D9D2C2] p-3 transition text-left flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Sauvegarde JSON en Clair</span>
                  <Download className="h-4 w-4 text-[#D97706]" />
                </div>
                <p className="text-[10px] text-[#8C7B6B] font-normal">
                  Fichier brut déchiffré pour impression ou transfert manuel.
                </p>
              </button>
            </div>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-3 pt-4 border-t border-[#D9D2C2]">
            <h3 className="font-bold font-serif text-sm uppercase tracking-wider text-[#5C4D3F] flex items-center gap-1.5">
              <KeyRound className="h-4 w-4" /> 2. Modifier le Mot de Passe Maître
            </h3>

            <div>
              <label className="block text-[#5C4D3F] font-bold mb-1">Mot de Passe Actuel</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] p-2 focus:outline-hidden focus:border-[#5C4D3F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#5C4D3F] font-bold mb-1">Nouveau Mot de Passe</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] p-2 focus:outline-hidden focus:border-[#5C4D3F]"
                />
              </div>

              <div>
                <label className="block text-[#5C4D3F] font-bold mb-1">Confirmer le Nouveau</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-white border border-[#D9D2C2] text-[#2D2926] p-2 focus:outline-hidden focus:border-[#5C4D3F]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#5C4D3F] hover:bg-[#4A3E32] text-white font-bold py-2.5 transition mt-2 uppercase tracking-wider cursor-pointer"
            >
              Mettre à jour la Clé de Chiffrement AES-256
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};
