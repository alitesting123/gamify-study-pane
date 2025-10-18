// src/hooks/useGames.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService, ProcessNotesRequest } from '@/services/gameService';
import { toast } from 'sonner';
import { GameTemplate, UserGame } from '@/types/game';

/**
 * Hook to fetch game templates with optional filters
 */
export const useGameTemplates = (filters?: any) => {
  return useQuery({
    queryKey: ['gameTemplates', filters],
    queryFn: () => gameService.getTemplates(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single game template by ID
 */
export const useGameTemplate = (id: number) => {
  return useQuery({
    queryKey: ['gameTemplate', id],
    queryFn: () => gameService.getTemplate(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch user's games
 */
export const useUserGames = (userId: string) => {
  return useQuery({
    queryKey: ['userGames', userId],
    queryFn: () => gameService.getUserGames(userId),
    enabled: !!userId,
  });
};

/**
 * Hook to fetch a specific game by ID
 */
export const useGame = (gameId: string) => {
  return useQuery({
    queryKey: ['game', gameId],
    queryFn: () => gameService.getGameById(gameId),
    enabled: !!gameId,
  });
};

/**
 * Hook to process notes and create a game
 * This is used in the UploadNotesDialog component
 */
export const useProcessNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      request, 
      onProgress 
    }: { 
      request: ProcessNotesRequest; 
      onProgress?: (progress: number) => void 
    }) => gameService.processNotes(request, onProgress),
    onSuccess: (data) => {
      // Invalidate and refetch user games
      queryClient.invalidateQueries({ queryKey: ['userGames'] });
      
      toast.success('Notes processed successfully!', {
        description: `Generated ${data.data.questionsGenerated} questions`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to process notes', {
        description: error.response?.data?.message || error.message || 'Please try again later',
      });
    },
  });
};

/**
 * Hook to delete a game
 */
export const useDeleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => gameService.deleteGame(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userGames'] });
      toast.success('Game deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to delete game', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
};

/**
 * Hook to update game progress
 */
export const useUpdateGameProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, progress }: { gameId: string; progress: number }) =>
      gameService.updateGameProgress(gameId, progress),
    onSuccess: (data, variables) => {
      // Update the specific game in cache
      queryClient.invalidateQueries({ queryKey: ['game', variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ['userGames'] });
    },
    onError: (error: any) => {
      toast.error('Failed to update progress', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
};

/**
 * Hook to submit game score
 */
export const useSubmitGameScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      gameId, 
      score, 
      completedAt 
    }: { 
      gameId: string; 
      score: number; 
      completedAt: string 
    }) => gameService.submitGameScore(gameId, score, completedAt),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['game', variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ['userGames'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
      
      toast.success('Score submitted!', {
        description: `You earned ${variables.score} points`,
      });
    },
    onError: (error: any) => {
      toast.error('Failed to submit score', {
        description: error.response?.data?.message || 'Please try again',
      });
    },
  });
};