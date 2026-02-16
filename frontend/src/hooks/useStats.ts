import { useQuery } from '@tanstack/react-query';
import {
  getDashboardStats,
  getRSVPBreakdown,
  getSideBreakdown,
  getRelationBreakdown,
} from '../services/stats';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useRSVPBreakdown = () => {
  return useQuery({
    queryKey: ['stats', 'rsvp'],
    queryFn: getRSVPBreakdown,
  });
};

export const useSideBreakdown = () => {
  return useQuery({
    queryKey: ['stats', 'side'],
    queryFn: getSideBreakdown,
  });
};

export const useRelationBreakdown = () => {
  return useQuery({
    queryKey: ['stats', 'relation'],
    queryFn: getRelationBreakdown,
  });
};
