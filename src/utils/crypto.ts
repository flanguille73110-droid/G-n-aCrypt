import CryptoJS from 'crypto-js';
import { FamilyTreeData, EncryptedPayload } from '../types';

export const PRESET_SECURITY_QUESTIONS = [
  "Nom de ton premier animal ?",
  "Ville de naissance de ton papa ?",
  "Nom de jeune fille de ta maman ?",
  "Année de naissance de ton grand-père ?"
];

/**
 * Normalizes secret answer so spacing, casing, and accent variations don't break matching
 */
export function normalizeSecretAnswer(answer: string): string {
  if (!answer) return '';
  return answer
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Encrypts data using AES-256 with PBKDF2 key derivation, salt, and IV.
 * Optionally creates a recovery payload using the normalized secret answer.
 */
export function encryptData(
  data: FamilyTreeData,
  password: string,
  securityQuestion?: string,
  secretAnswer?: string,
  existingRecoveryPayload?: EncryptedPayload['recoveryPayload']
): EncryptedPayload {
  const jsonString = JSON.stringify(data);
  
  // Generate random 128-bit salt and 128-bit IV
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);

  // Derive key using PBKDF2 with 10,000 iterations
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000,
    hasher: CryptoJS.algo.SHA256
  });

  // Encrypt with AES-CBC
  const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC
  });

  let recoveryPayload = existingRecoveryPayload;

  // If secret answer is provided, generate a new recovery payload
  if (secretAnswer && secretAnswer.trim()) {
    const normalizedAns = normalizeSecretAnswer(secretAnswer);
    const recSalt = CryptoJS.lib.WordArray.random(16);
    const recIv = CryptoJS.lib.WordArray.random(16);
    const recKey = CryptoJS.PBKDF2(normalizedAns, recSalt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    });
    const recEncrypted = CryptoJS.AES.encrypt(jsonString, recKey, {
      iv: recIv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    recoveryPayload = {
      encrypted: true,
      algorithm: 'AES-256-CBC',
      salt: recSalt.toString(CryptoJS.enc.Hex),
      iv: recIv.toString(CryptoJS.enc.Hex),
      ciphertext: recEncrypted.ciphertext.toString(CryptoJS.enc.Base64),
      updatedAt: new Date().toISOString()
    };
  }

  return {
    encrypted: true,
    algorithm: 'AES-256-CBC',
    salt: salt.toString(CryptoJS.enc.Hex),
    iv: iv.toString(CryptoJS.enc.Hex),
    ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Base64),
    updatedAt: new Date().toISOString(),
    securityQuestion: securityQuestion || undefined,
    recoveryPayload
  };
}

/**
 * Decrypts payload using user password. Throws error if password is wrong or format invalid.
 */
export function decryptData(payload: EncryptedPayload, password: string): FamilyTreeData {
  if (!payload || !payload.ciphertext || !payload.salt || !payload.iv) {
    throw new Error('Format de données chiffrées invalide');
  }

  try {
    const salt = CryptoJS.enc.Hex.parse(payload.salt);
    const iv = CryptoJS.enc.Hex.parse(payload.iv);

    // Derive key using PBKDF2
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256 / 32,
      iterations: 10000,
      hasher: CryptoJS.algo.SHA256
    });

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(payload.ciphertext)
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC
    });

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

    if (!decryptedText) {
      throw new Error('Mot de passe incorrect ou fichier altéré');
    }

    const data: FamilyTreeData = JSON.parse(decryptedText);
    
    // Ensure data schema validity
    if (!Array.isArray(data.persons)) {
      throw new Error('Format des données généalogiques invalide');
    }

    return data;
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('Format')) {
      throw err;
    }
    throw new Error('Mot de passe incorrect ou échec de déchiffrement AES-256');
  }
}

/**
 * Validates if the given password can decrypt the payload.
 */
export function verifyPassword(payload: EncryptedPayload, password: string): boolean {
  try {
    decryptData(payload, password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to trigger browser file download for encrypted or decrypted export.
 */
export function downloadJsonFile(filename: string, contentString: string) {
  const blob = new Blob([contentString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
