/**
 * Save System Type Definitions
 */

import { GameState } from '@/constants/gameData';

export type SaveGameState = GameState;

export interface SaveMetadata {
  slotId: number;
  createdAt: number;
  updatedAt: number;
  playTime: number;
  gameVersion: string;
  characterName?: string;
  description?: string;
}

export interface SaveSlotData {
  metadata: SaveMetadata;
  state: SaveGameState;
  backup?: SaveSlotData;
}

export interface SaveSlotIndex {
  slots: Array<{
    id: number;
    exists: boolean;
    updatedAt: number;
  }>;
}
