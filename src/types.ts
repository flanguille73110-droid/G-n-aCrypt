export type Gender = 'M' | 'F' | 'O';

export type BranchType = 'paternal' | 'maternal' | 'secondary' | 'inlaw';

export type EventType = 'naissance' | 'mariage' | 'deces' | 'evenement_marquant' | 'demenagement';

export type UnionType = 'mariage' | 'divorce' | 'union_libre' | 'pacs';

export interface UnionDetails {
  id: string;
  partnerId: string;
  type: UnionType;
  date?: string;
  place?: string;
  coords?: [number, number]; // [lat, lng]
  endDate?: string;
}

export type DocumentCategory = 'acte_naissance' | 'acte_mariage' | 'acte_deces' | 'heritage' | 'photo' | 'autre';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  urlOrData: string;
  date?: string;
  notes?: string;
}

export interface SuccessionInfo {
  inheritanceNotes?: string;
  legalDocumentsNotes?: string;
  deathInstructions?: string;
  heirs?: string[];
  willsLocation?: string;
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  maidenName?: string;
  gender: Gender;
  birthDate?: string;
  birthPlace?: string;
  birthCoords?: [number, number]; // [lat, lng]
  deathDate?: string;
  deathPlace?: string;
  deathCoords?: [number, number]; // [lat, lng]
  isDeceased: boolean;
  photoUrl?: string;
  notes?: string;
  branch: BranchType;
  profession?: string;
  
  // Direct Relationships
  fatherId?: string;
  motherId?: string;
  spouseIds: string[];
  unions?: UnionDetails[];
  childrenIds: string[];

  // Gallery & Attachments
  documents: DocumentItem[];

  // Estate / Succession
  successionInfo?: SuccessionInfo;

  // Visibility in Visual Tree
  showOnTree?: boolean; // defaults to true if undefined

  createdAt: string;
  updatedAt: string;
}

export interface FamilyEvent {
  id: string;
  type: EventType;
  title: string;
  date: string;
  place?: string;
  coords?: [number, number];
  personIds: string[];
  description?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'AJOUT' | 'MODIFICATION' | 'SUPPRESSION' | 'IMPORT' | 'EXPORT' | 'CHIFFREMENT';
  targetName: string;
  details: string;
}

export interface FamilyTreeData {
  version: string;
  updatedAt: string;
  persons: Person[];
  customEvents: FamilyEvent[];
  auditLogs: AuditLogEntry[];
  generalNotes?: string;
}

export interface EncryptedPayload {
  encrypted: true;
  algorithm: 'AES-256-CBC' | 'AES-256-GCM';
  salt: string;
  iv: string;
  ciphertext: string;
  updatedAt: string;
  securityQuestion?: string;
  recoveryPayload?: {
    encrypted: true;
    algorithm: 'AES-256-CBC' | 'AES-256-GCM';
    salt: string;
    iv: string;
    ciphertext: string;
    updatedAt: string;
  };
}

export type ViewMode = 'tree' | 'timeline' | 'map' | 'succession' | 'history' | 'list' | 'settings';
