import { generateEncryptionKey, encryptData, decryptData } from './crypto-utils'

export interface UserProfile {
  username: string
  bio: string
  createdAt: string
  updatedAt: string
}

export interface SelectiveDisclosure {
  id: string
  name: string
  selectedAttributes: Record<string, boolean>
  qrCode?: string
  createdAt: string
}

/**
 * Get user profile from encrypted local storage
 * Returns default if not found
 */
export async function getUserProfile(walletAddress: string): Promise<UserProfile> {
  try {
    const encrypted = localStorage.getItem('shadowid-user-profile')
    if (!encrypted) {
      return {
        username: '',
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    const key = await generateEncryptionKey(walletAddress)
    const decrypted = await decryptData(encrypted, key)
    const profile = JSON.parse(new TextDecoder().decode(decrypted)) as UserProfile
    return profile
  } catch (err) {
    console.error('[v0] Error reading profile:', err)
    return {
      username: '',
      bio: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

/**
 * Save user profile with encryption
 * Uses wallet address as encryption seed for privacy
 */
export async function saveUserProfile(walletAddress: string, profile: UserProfile): Promise<void> {
  try {
    const key = await generateEncryptionKey(walletAddress)
    const profileData = new TextEncoder().encode(JSON.stringify(profile))
    const encrypted = await encryptData(profileData, key)
    localStorage.setItem('shadowid-user-profile', encrypted)
  } catch (err) {
    console.error('[v0] Error saving profile:', err)
    throw err
  }
}

/**
 * Get or create selective disclosure
 */
export function getSelectiveDisclosures(): SelectiveDisclosure[] {
  try {
    const data = localStorage.getItem('shadowid-selective-disclosures')
    return data ? JSON.parse(data) : []
  } catch (err) {
    console.error('[v0] Error reading disclosures:', err)
    return []
  }
}

/**
 * Save selective disclosure
 */
export function saveSelectiveDisclosure(disclosure: SelectiveDisclosure): void {
  try {
    const existing = getSelectiveDisclosures()
    const index = existing.findIndex(d => d.id === disclosure.id)
    if (index >= 0) {
      existing[index] = disclosure
    } else {
      existing.push(disclosure)
    }
    localStorage.setItem('shadowid-selective-disclosures', JSON.stringify(existing))
  } catch (err) {
    console.error('[v0] Error saving disclosure:', err)
    throw err
  }
}
