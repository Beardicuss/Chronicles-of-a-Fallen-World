/**
 * Save Slot Manager
 * Handles game save/load with 3-slot system and backups
 */

import type {
  SaveSlotData,
  SaveGameState,
  SaveMetadata,
  SaveSlotIndex
} from './types.js';

export class SaveSlotManager {
  private readonly SLOT_COUNT = 3;
  private readonly STORAGE_PREFIX = 'game_save_';
  private readonly INDEX_KEY = 'game_save_index';
  private readonly BACKUP_SUFFIX = '_backup';
  private currentSlot: number = 0;
  private slots: Map<number, SaveSlotData>;
  private autoBackupEnabled: boolean;
  private autoBackupInterval: ReturnType<typeof setTimeout> | null;

  constructor(autoBackupEnabled: boolean = true) {
    this.slots = new Map();
    this.autoBackupEnabled = autoBackupEnabled;
    this.autoBackupInterval = null;
  }

  /**
   * Initialize save system
   */
  async initialize(): Promise<void> {
    await this.loadAllSlots();

    if (this.autoBackupEnabled) {
      this.startAutoBackup();
    }

    console.info('[SaveSlotManager] Initialized with', this.SLOT_COUNT, 'slots');
  }

  /**
   * Load all slots from storage
   */
  private async loadAllSlots(): Promise<void> {
    this.slots.clear();

    for (let i = 0; i < this.SLOT_COUNT; i++) {
      try {
        const key = this.getSlotKey(i);
        const data = this.getFromStorage(key);

        if (data) {
          this.slots.set(i, JSON.parse(data));
        }
      } catch (error) {
        console.error(`Failed to load slot ${i}:`, error);
      }
    }
  }

  /**
   * Save game to slot
   */
  async saveGame(
    slotId: number,
    state: SaveGameState,
    characterName?: string
  ): Promise<boolean> {
    if (!this.isValidSlot(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      const now = Date.now();
      const existingSlot = this.slots.get(slotId);

      const metadata: SaveMetadata = {
        slotId,
        createdAt: existingSlot?.metadata.createdAt ?? now,
        updatedAt: now,
        playTime: existingSlot?.metadata.playTime ?? 0,
        gameVersion: '1.0.0',
        characterName,
        description: `Saved at ${new Date(now).toLocaleString()}`
      };

      const saveData: SaveSlotData = {
        metadata,
        state,
        backup: existingSlot ? { ...existingSlot } : undefined
      };

      this.slots.set(slotId, saveData);

      const key = this.getSlotKey(slotId);
      this.setInStorage(key, JSON.stringify(saveData));

      this.currentSlot = slotId;

      console.info(`[SaveSlotManager] Game saved to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error(`Failed to save game to slot ${slotId}:`, error);
      return false;
    }
  }

  /**
   * Load game from slot
   */
  async loadGame(slotId: number): Promise<SaveGameState | null> {
    if (!this.isValidSlot(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`);
      return null;
    }

    try {
      const slot = this.slots.get(slotId);

      if (!slot) {
        console.warn(`Slot ${slotId} is empty`);
        return null;
      }

      this.currentSlot = slotId;
      console.info(`[SaveSlotManager] Game loaded from slot ${slotId}`);

      return { ...slot.state };
    } catch (error) {
      console.error(`Failed to load game from slot ${slotId}:`, error);
      return null;
    }
  }

  /**
   * Delete save slot
   */
  async deleteSlot(slotId: number): Promise<boolean> {
    if (!this.isValidSlot(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      this.slots.delete(slotId);
      const key = this.getSlotKey(slotId);
      this.removeFromStorage(key);

      console.info(`[SaveSlotManager] Slot ${slotId} deleted`);
      return true;
    } catch (error) {
      console.error(`Failed to delete slot ${slotId}:`, error);
      return false;
    }
  }

  /**
   * Get slot metadata
   */
  getSlotMetadata(slotId: number): SaveMetadata | null {
    if (!this.isValidSlot(slotId)) {
      return null;
    }

    const slot = this.slots.get(slotId);
    return slot ? { ...slot.metadata } : null;
  }

  /**
   * Get all slots info
   */
  getAllSlotsInfo(): SaveSlotIndex {
    const slots = [];

    for (let i = 0; i < this.SLOT_COUNT; i++) {
      const slot = this.slots.get(i);
      slots.push({
        id: i,
        exists: !!slot,
        updatedAt: slot?.metadata.updatedAt ?? 0
      });
    }

    return { slots };
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(slotId: number): Promise<boolean> {
    if (!this.isValidSlot(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      const slot = this.slots.get(slotId);

      if (!slot?.backup) {
        console.warn(`No backup available for slot ${slotId}`);
        return false;
      }

      this.slots.set(slotId, { ...slot.backup });

      const key = this.getSlotKey(slotId);
      this.setInStorage(key, JSON.stringify(slot.backup));

      console.info(`[SaveSlotManager] Slot ${slotId} restored from backup`);
      return true;
    } catch (error) {
      console.error(`Failed to restore backup for slot ${slotId}:`, error);
      return false;
    }
  }

  /**
   * Export save data
   */
  exportSaveData(slotId: number): string | null {
    if (!this.isValidSlot(slotId)) {
      return null;
    }

    const slot = this.slots.get(slotId);
    return slot ? JSON.stringify(slot, null, 2) : null;
  }

  /**
   * Import save data
   */
  async importSaveData(slotId: number, jsonData: string): Promise<boolean> {
    if (!this.isValidSlot(slotId)) {
      console.error(`Invalid slot ID: ${slotId}`);
      return false;
    }

    try {
      const data = JSON.parse(jsonData) as SaveSlotData;

      // Validate data structure
      if (!data.metadata || !data.state) {
        console.error('Invalid save data format');
        return false;
      }

      this.slots.set(slotId, data);

      const key = this.getSlotKey(slotId);
      this.setInStorage(key, JSON.stringify(data));

      console.info(`[SaveSlotManager] Save data imported to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error(`Failed to import save data:`, error);
      return false;
    }
  }

  /**
   * Start auto backup
   */
  private startAutoBackup(): void {
    const INTERVAL = 5 * 60 * 1000; // 5 minutes

    this.autoBackupInterval = setInterval(() => {
      if (this.slots.has(this.currentSlot)) {
        const slot = this.slots.get(this.currentSlot);
        if (slot) {
          console.debug(`[SaveSlotManager] Auto-backup for slot ${this.currentSlot}`);
        }
      }
    }, INTERVAL);
  }

  /**
   * Stop auto backup
   */
  stopAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  /**
   * Validate slot ID
   */
  private isValidSlot(slotId: number): boolean {
    return Number.isInteger(slotId) && slotId >= 0 && slotId < this.SLOT_COUNT;
  }

  /**
   * Get storage key for slot
   */
  private getSlotKey(slotId: number): string {
    return `${this.STORAGE_PREFIX}${slotId}`;
  }

  /**
   * Storage abstraction - get
   */
  private getFromStorage(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        return null;
      }
    } catch (error) {
      console.warn('localStorage not available:', error);
    }
    return null;
  }

  /**
   * Storage abstraction - set
   */
  private setInStorage(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Failed to write to localStorage:', error);
    }
  }

  /**
   * Storage abstraction - remove
   */
  private removeFromStorage(key: string): void {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  /**
   * Get save statistics
   */
  getStats(): {
    totalSlots: number;
    usedSlots: number;
    currentSlot: number;
  } {
    return {
      totalSlots: this.SLOT_COUNT,
      usedSlots: this.slots.size,
      currentSlot: this.currentSlot
    };
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stopAutoBackup();
    this.slots.clear();
  }
}

export const saveManager = new SaveSlotManager();
