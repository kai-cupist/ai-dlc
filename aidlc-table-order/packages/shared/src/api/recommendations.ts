import { apiClient } from './client';
import type { RecommendationRequest, RecommendationResponse, ApiResponse } from '../types';

export const recommendationsApi = {
  getRecommendations: (data: RecommendationRequest) =>
    apiClient.post<ApiResponse<RecommendationResponse>>('/recommendations', data),
};
