import React, { createContext, useContext, useCallback, useEffect, useState, useMemo, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    GameState,
    StoryNode,
    StoryChoice,
    initialGameState,
    storyNodes,
} from '@/constants/gameData';
import { SaveSlotIndex } from '@/constants/saveSystem/types';
import { saveManager } from '@/constants/saveSystem/SaveSlotManager';

export interface GameContextType {
    gameState: GameState;
    currentNode: StoryNode | null;
    makeChoice: (choice: StoryChoice) => void;
    updateBattleStats: (health: number, stamina: number) => void;
    resetGame: () => void;
    canGoBack: boolean;
    goBack: () => void;
    isLoading: boolean;
    slotIndex: SaveSlotIndex;
    setActiveSlot: (slot: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [gameState, setGameState] = useState<GameState>(initialGameState);
    const [activeSlot, setActiveSlot] = useState<number>(0);

    const savedQuery = useQuery({
        queryKey: ['gameSave', activeSlot],
        queryFn: async (): Promise<GameState | null> => {
            await saveManager.initialize();
            return await saveManager.loadGame(activeSlot);
        },
    });

    useEffect(() => {
        if (savedQuery.data) {
            setGameState(savedQuery.data);
        }
    }, [savedQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (state: GameState) => {
            await saveManager.saveGame(activeSlot, state);
            return state;
        },
        onSuccess: (data) => {
            queryClient.setQueryData(['gameSave', activeSlot], data);
        },
    });

    const currentNode: StoryNode | null = useMemo(() => {
        return storyNodes[gameState.currentNodeId] ?? null;
    }, [gameState.currentNodeId]);

    const makeChoice = useCallback(
        (choice: StoryChoice) => {
            setGameState((prev) => {
                const newStats = { ...prev.stats };
                if (choice.statChanges) {
                    newStats.darkness = Math.min(100, Math.max(0, newStats.darkness + (choice.statChanges.darkness ?? 0)));
                    newStats.light = Math.min(100, Math.max(0, newStats.light + (choice.statChanges.light ?? 0)));
                    newStats.gaia = Math.min(100, Math.max(0, newStats.gaia + (choice.statChanges.gaia ?? 0)));
                }

                const newInventory = [...prev.inventory];
                if (choice.itemGain && !newInventory.includes(choice.itemGain)) {
                    newInventory.push(choice.itemGain);
                }

                const newState: GameState = {
                    currentNodeId: choice.nextNodeId,
                    stats: newStats,
                    inventory: newInventory,
                    storyHistory: [...prev.storyHistory, prev.currentNodeId],
                    visitedNodes: Array.from(new Set([...prev.visitedNodes, prev.currentNodeId])),
                };

                saveMutation.mutate(newState);
                return newState;
            });
        },
        [saveMutation],
    );

    const updateBattleStats = useCallback((health: number, stamina: number) => {
        // This can be expanded to sync health/stamina to global RPG state if desired
        console.log('[GameContext] Syncing battle stats:', { health, stamina });
    }, []);

    const resetGame = useCallback(() => {
        setGameState(initialGameState);
        saveMutation.mutate(initialGameState);
    }, [saveMutation]);

    const canGoBack = gameState.storyHistory.length > 0;

    const goBack = useCallback(() => {
        setGameState((prev) => {
            if (prev.storyHistory.length === 0) return prev;
            const history = [...prev.storyHistory];
            const previousNodeId = history.pop()!;
            const newState: GameState = {
                ...prev,
                currentNodeId: previousNodeId,
                storyHistory: history,
            };
            saveMutation.mutate(newState);
            return newState;
        });
    }, [saveMutation]);

    const value = {
        gameState,
        currentNode,
        makeChoice,
        updateBattleStats,
        resetGame,
        canGoBack,
        goBack,
        isLoading: savedQuery.isLoading,
        slotIndex: saveManager.getAllSlotsInfo(),
        setActiveSlot,
    };

    return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
