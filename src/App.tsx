import React, { useState, useEffect } from 'react';
import { 
  FamilyTreeData, 
  EncryptedPayload, 
  Person, 
  ViewMode, 
  DocumentItem, 
  AuditLogEntry 
} from './types';
import { encryptData, decryptData } from './utils/crypto';
import { 
  synchronizeRelations, 
  removePersonAndCleanRelations, 
  createAuditLog 
} from './utils/genealogy';
import { INITIAL_SAMPLE_TREE } from './data/sampleData';

import { Header } from './components/Header';
import { LockScreen } from './components/LockScreen';
import { TreeView } from './components/TreeView';
import { PersonDetailModal } from './components/PersonDetailModal';
import { PersonFormModal } from './components/PersonFormModal';
import { TimelineView } from './components/TimelineView';
import { MapView } from './components/MapView';
import { SuccessionView } from './components/SuccessionView';
import { AuditLogView } from './components/AuditLogView';
import { PersonListView } from './components/PersonListView';
import { SecurityModal } from './components/SecurityModal';
import { SettingsView } from './components/SettingsView';

const LOCAL_STORAGE_KEY = 'geneacrypt_data_v1';

export default function App() {
  // Encrypted Payload from local storage
  const [encryptedPayload, setEncryptedPayload] = useState<EncryptedPayload | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active Unlocked State
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [treeData, setTreeData] = useState<FamilyTreeData | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [activeSecurityQuestion, setActiveSecurityQuestion] = useState<string | undefined>(
    encryptedPayload?.securityQuestion
  );
  const [activeSecretAnswer, setActiveSecretAnswer] = useState<string | undefined>(undefined);

  // Active View Mode & Filters
  const [currentView, setCurrentView] = useState<ViewMode>('tree');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  // Modals
  const [selectedPersonForDetail, setSelectedPersonForDetail] = useState<Person | null>(null);
  const [selectedPersonForEdit, setSelectedPersonForEdit] = useState<Person | null>(null);
  const [presetRelation, setPresetRelation] = useState<{
    targetPerson: Person;
    relationType: 'father' | 'mother' | 'spouse' | 'child';
  } | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);

  /**
   * Helper function to save updated TreeData back to state and localStorage encrypted in AES-256.
   */
  const persistAndSetTreeData = (
    newData: FamilyTreeData,
    password: string = masterPassword || '1234',
    securityQuestion: string | undefined = activeSecurityQuestion || encryptedPayload?.securityQuestion,
    secretAnswer: string | undefined = activeSecretAnswer
  ) => {
    setTreeData(newData);
    try {
      const existingRecoveryPayload = encryptedPayload?.recoveryPayload;
      const newPayload = encryptData(
        newData,
        password,
        securityQuestion,
        secretAnswer,
        secretAnswer ? undefined : existingRecoveryPayload
      );
      setEncryptedPayload(newPayload);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newPayload));
    } catch (err) {
      console.error('Échec de la sauvegarde chiffrée en AES-256:', err);
    }
  };

  /**
   * Unlock Session Callback
   */
  const handleUnlockSuccess = (
    data: FamilyTreeData,
    password: string,
    securityQuestion?: string,
    secretAnswer?: string
  ) => {
    setTreeData(data);
    setMasterPassword(password);
    if (securityQuestion) setActiveSecurityQuestion(securityQuestion);
    if (secretAnswer) setActiveSecretAnswer(secretAnswer);
    setIsLocked(false);
    persistAndSetTreeData(data, password, securityQuestion, secretAnswer);
  };

  /**
   * Create New Tree / Initialize with Master Password
   */
  const handleInitializeNewTree = (
    password: string,
    initialDataset: FamilyTreeData = INITIAL_SAMPLE_TREE,
    securityQuestion?: string,
    secretAnswer?: string
  ) => {
    setMasterPassword(password);
    setActiveSecurityQuestion(securityQuestion);
    setActiveSecretAnswer(secretAnswer);
    persistAndSetTreeData(initialDataset, password, securityQuestion, secretAnswer);
    setIsLocked(false);
  };

  /**
   * Lock Active Session
   */
  const handleLockSession = () => {
    setIsLocked(true);
    setMasterPassword(null);
    setTreeData(null);
    setSelectedPersonForDetail(null);
    setActiveSecretAnswer(undefined);
  };

  /**
   * Update Security Question from SettingsView
   */
  const handleUpdateSecurityQuestion = (
    question: string,
    answer: string,
    currentPass: string
  ): { success: boolean; message: string } => {
    if (!treeData) return { success: false, message: 'Aucune donnée chargée.' };
    if (currentPass !== masterPassword) {
      return { success: false, message: 'Le mot de passe maître actuel est incorrect.' };
    }

    setActiveSecurityQuestion(question);
    setActiveSecretAnswer(answer);

    const newLog = createAuditLog(
      'CHIFFREMENT',
      'Question Secrète AES-256',
      `Mise à jour de la question secrète : "${question}"`
    );

    const updatedTreeData: FamilyTreeData = {
      ...treeData,
      auditLogs: [newLog, ...(treeData.auditLogs || [])]
    };

    persistAndSetTreeData(updatedTreeData, currentPass, question, answer);

    return {
      success: true,
      message: 'Question secrète mise à jour et réponse chiffrée en local !'
    };
  };

  /**
   * Import Encrypted File from Lock Screen or Security Modal
   */
  const handleImportEncryptedFile = (payload: EncryptedPayload) => {
    setEncryptedPayload(payload);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
  };

  /**
   * Save (Add or Modify) Person with Automatic Bi-Directional Relation Synchronization
   */
  const handleSavePerson = (personToSave: Person) => {
    if (!treeData) return;

    const isEdit = treeData.persons.some(p => p.id === personToSave.id);
    
    // 1. Bi-directional relation synchronization
    const updatedPersons = synchronizeRelations(treeData.persons, personToSave);

    // 2. Audit Log
    const newLog = createAuditLog(
      isEdit ? 'MODIFICATION' : 'AJOUT',
      `${personToSave.firstName} ${personToSave.lastName}`,
      isEdit ? 'Mise à jour de la fiche individuelle et synchronisation des relations' : 'Ajout d\'une nouvelle personne dans l\'arbre'
    );

    const updatedTreeData: FamilyTreeData = {
      ...treeData,
      updatedAt: new Date().toISOString(),
      persons: updatedPersons,
      auditLogs: [newLog, ...(treeData.auditLogs || [])]
    };

    persistAndSetTreeData(updatedTreeData);

    // If modal detail was open for this person, refresh detail view
    if (selectedPersonForDetail?.id === personToSave.id) {
      const refreshed = updatedPersons.find(p => p.id === personToSave.id) || null;
      setSelectedPersonForDetail(refreshed);
    }
  };

  /**
   * Delete Person
   */
  const handleDeletePerson = (personId: string) => {
    if (!treeData) return;

    const targetPerson = treeData.persons.find(p => p.id === personId);
    if (!targetPerson) return;

    const cleanedPersons = removePersonAndCleanRelations(treeData.persons, personId);

    const newLog = createAuditLog(
      'SUPPRESSION',
      `${targetPerson.firstName} ${targetPerson.lastName}`,
      'Suppression de la personne et nettoyage des liens parentés'
    );

    const updatedTreeData: FamilyTreeData = {
      ...treeData,
      updatedAt: new Date().toISOString(),
      persons: cleanedPersons,
      auditLogs: [newLog, ...(treeData.auditLogs || [])]
    };

    persistAndSetTreeData(updatedTreeData);

    if (selectedPersonForDetail?.id === personId) {
      setSelectedPersonForDetail(null);
    }
  };

  /**
   * Add Document to Person
   */
  const handleAddDocumentToPerson = (personId: string, document: DocumentItem) => {
    if (!treeData) return;

    const updatedPersons = treeData.persons.map(p => {
      if (p.id === personId) {
        return {
          ...p,
          documents: [document, ...(p.documents || [])],
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    const targetPerson = updatedPersons.find(p => p.id === personId);

    const newLog = createAuditLog(
      'MODIFICATION',
      `${targetPerson?.firstName} ${targetPerson?.lastName}`,
      `Ajout du document numérisé: ${document.title}`
    );

    const updatedTreeData: FamilyTreeData = {
      ...treeData,
      updatedAt: new Date().toISOString(),
      persons: updatedPersons,
      auditLogs: [newLog, ...(treeData.auditLogs || [])]
    };

    persistAndSetTreeData(updatedTreeData);

    if (selectedPersonForDetail?.id === personId && targetPerson) {
      setSelectedPersonForDetail(targetPerson);
    }
  };

  /**
   * Add relative directly from tree view button
   */
  const handleAddRelativeFromTree = (targetPerson: Person, relationType: 'father' | 'mother' | 'spouse' | 'child') => {
    setPresetRelation({ targetPerson, relationType });
    setSelectedPersonForEdit(null);
    setIsFormModalOpen(true);
  };

  /**
   * Update Master Password in Security Modal
   */
  const handleUpdateMasterPassword = (newPass: string) => {
    if (!treeData) return;
    setMasterPassword(newPass);

    const newLog = createAuditLog(
      'CHIFFREMENT',
      'Coffre Maître AES-256',
      'Mise à jour du mot de passe maître et re-chiffrement complet'
    );

    const updatedTreeData: FamilyTreeData = {
      ...treeData,
      auditLogs: [newLog, ...(treeData.auditLogs || [])]
    };

    persistAndSetTreeData(updatedTreeData, newPass);
  };

  /**
   * Reset App to Empty Dataset
   */
  const handleResetToEmpty = () => {
    const emptyData: FamilyTreeData = {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      persons: [],
      customEvents: [],
      auditLogs: [
        createAuditLog(
          'SUPPRESSION',
          'Réinitialisation complète',
          'Remise à zéro de l\'ensemble des noms, dates, événements et archives'
        )
      ],
      generalNotes: ''
    };

    persistAndSetTreeData(emptyData);
    setSelectedPersonForDetail(null);
    setSelectedPersonForEdit(null);
  };

  /**
   * Reset App to Initial Sample Dataset
   */
  const handleResetToSample = () => {
    const resetSample: FamilyTreeData = {
      ...INITIAL_SAMPLE_TREE,
      updatedAt: new Date().toISOString(),
      auditLogs: [
        createAuditLog(
          'IMPORT',
          'Réinitialisation Démo',
          'Rechargement des données généalogiques de démonstration'
        ),
        ...(INITIAL_SAMPLE_TREE.auditLogs || [])
      ]
    };

    persistAndSetTreeData(resetSample);
    setSelectedPersonForDetail(null);
    setSelectedPersonForEdit(null);
  };

  /**
   * Wipe LocalStorage Completely and Return to Lock / Creation Screen
   */
  const handleWipeStorageAndLock = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setEncryptedPayload(null);
    setTreeData(null);
    setMasterPassword(null);
    setIsLocked(true);
    setSelectedPersonForDetail(null);
    setSelectedPersonForEdit(null);
  };

  // If session is locked, display LockScreen
  if (isLocked || !treeData) {
    return (
      <LockScreen
        encryptedPayload={encryptedPayload}
        onUnlockSuccess={handleUnlockSuccess}
        onInitializeNewTree={handleInitializeNewTree}
        onImportEncryptedFile={handleImportEncryptedFile}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header Navigation */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAddModal={() => {
          setSelectedPersonForEdit(null);
          setPresetRelation(null);
          setIsFormModalOpen(true);
        }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onLockSession={handleLockSession}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        personCount={treeData.persons.length}
        branchFilter={branchFilter}
        onBranchFilterChange={setBranchFilter}
      />

      {/* Main View Display */}
      <main className="flex-1 overflow-x-hidden">
        {currentView === 'tree' && (
          <TreeView
            persons={treeData.persons}
            onSelectPerson={setSelectedPersonForDetail}
            onAddRelative={handleAddRelativeFromTree}
            searchQuery={searchQuery}
            branchFilter={branchFilter}
          />
        )}

        {currentView === 'timeline' && (
          <TimelineView
            persons={treeData.persons}
            customEvents={treeData.customEvents || []}
            onSelectPerson={setSelectedPersonForDetail}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'map' && (
          <MapView
            persons={treeData.persons}
            onSelectPerson={setSelectedPersonForDetail}
            onEditPerson={(p) => {
              setSelectedPersonForEdit(p);
              setPresetRelation(null);
              setIsFormModalOpen(true);
            }}
            onSavePerson={handleSavePerson}
          />
        )}

        {currentView === 'succession' && (
          <SuccessionView
            persons={treeData.persons}
            generalNotes={treeData.generalNotes}
            onUpdateGeneralNotes={(notes) => {
              const updatedTreeData = { ...treeData, generalNotes: notes };
              persistAndSetTreeData(updatedTreeData);
            }}
            onSelectPerson={setSelectedPersonForDetail}
          />
        )}

        {currentView === 'history' && (
          <AuditLogView
            logs={treeData.auditLogs || []}
          />
        )}

        {currentView === 'list' && (
          <PersonListView
            persons={treeData.persons}
            onSelectPerson={setSelectedPersonForDetail}
            onEditPerson={(p) => {
              setSelectedPersonForEdit(p);
              setPresetRelation(null);
              setIsFormModalOpen(true);
            }}
            onDeletePerson={handleDeletePerson}
            searchQuery={searchQuery}
            branchFilter={branchFilter}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            treeData={treeData}
            activeSecurityQuestion={activeSecurityQuestion || encryptedPayload?.securityQuestion}
            onUpdateSecurityQuestion={handleUpdateSecurityQuestion}
            onResetToEmpty={handleResetToEmpty}
            onResetToSample={handleResetToSample}
            onWipeStorageAndLock={handleWipeStorageAndLock}
          />
        )}
      </main>

      {/* Fiche Détaillée Modal */}
      {selectedPersonForDetail && (
        <PersonDetailModal
          person={selectedPersonForDetail}
          allPersons={treeData.persons}
          onClose={() => setSelectedPersonForDetail(null)}
          onEdit={(p) => {
            setSelectedPersonForEdit(p);
            setPresetRelation(null);
            setIsFormModalOpen(true);
          }}
          onDelete={handleDeletePerson}
          onSelectPerson={(p) => setSelectedPersonForDetail(p)}
          onAddDocument={handleAddDocumentToPerson}
          onToggleShowOnTree={(p, showOnTree) => handleSavePerson({ ...p, showOnTree })}
        />
      )}

      {/* Form Modal (Add / Edit Person) */}
      <PersonFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedPersonForEdit(null);
          setPresetRelation(null);
        }}
        onSave={handleSavePerson}
        personToEdit={selectedPersonForEdit}
        allPersons={treeData.persons}
        presetRelation={presetRelation}
      />

      {/* Security & AES-256 Modal */}
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        treeData={treeData}
        masterPassword={masterPassword || ''}
        onUpdateMasterPassword={handleUpdateMasterPassword}
        onImportNewData={(newData) => persistAndSetTreeData(newData)}
      />

    </div>
  );
}
