class CryptoManager {
  constructor() {
    this.SALT = 'vertex-ai-clone-salt'
    this.IV_LENGTH = 12
    this.iterations = 100000
  }

  async deriveKey(password) {
    const encoder = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(this.SALT),
        iterations: this.iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )
  }

  async encrypt(text, password) {
    const key = await this.deriveKey(password)
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH))
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )

    const combined = new Uint8Array(iv.length + encryptedData.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encryptedData), iv.length)

    return btoa(String.fromCharCode(...combined))
  }

  async decrypt(encryptedText, password) {
    try {
      const key = await this.deriveKey(password)
      const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0))
      
      const iv = combined.slice(0, this.IV_LENGTH)
      const data = combined.slice(this.IV_LENGTH)

      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      )

      const decoder = new TextDecoder()
      return decoder.decode(decryptedData)
    } catch {
      throw new Error('Failed to decrypt. Invalid password or corrupted data.')
    }
  }

  async hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + this.SALT)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
  }

  async verifyPassword(password, hash) {
    const newHash = await this.hashPassword(password)
    return newHash === hash
  }
}

export const cryptoManager = new CryptoManager()

export class SecureStorage {
  constructor(prefix = 'secure_') {
    this.prefix = prefix
    this.masterPasswordKey = `${this.prefix}master_hash`
  }

  async setMasterPassword(password) {
    const hash = await cryptoManager.hashPassword(password)
    localStorage.setItem(this.masterPasswordKey, hash)
  }

  async verifyMasterPassword(password) {
    const storedHash = localStorage.getItem(this.masterPasswordKey)
    if (!storedHash) return false
    return cryptoManager.verifyPassword(password, storedHash)
  }

  hasMasterPassword() {
    return !!localStorage.getItem(this.masterPasswordKey)
  }

  async setItem(key, value, password) {
    const encryptedValue = await cryptoManager.encrypt(value, password)
    localStorage.setItem(this.prefix + key, encryptedValue)
  }

  async getItem(key, password) {
    const encryptedValue = localStorage.getItem(this.prefix + key)
    if (!encryptedValue) return null
    
    try {
      return await cryptoManager.decrypt(encryptedValue, password)
    } catch (error) {
      console.error('Failed to decrypt item:', error)
      return null
    }
  }

  removeItem(key) {
    localStorage.removeItem(this.prefix + key)
  }

  clear() {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.prefix) && key !== this.masterPasswordKey) {
        localStorage.removeItem(key)
      }
    })
  }
}

export const secureStorage = new SecureStorage()