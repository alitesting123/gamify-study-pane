// src/hooks/useUserProgress.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProgressRequest } from '@/services/userService';

export const useUserProgress = (userId: string) => {
  return useQuery({
    queryKey: ['userProgress', userId],
    queryFn: () => userService.getUserProgress(userId),
    enabled: !!userId,
  });
};

export const useUpdateProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateProgressRequest }) =>
      userService.updateProgress(userId, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProgress', variables.userId] });
    },
  });
};