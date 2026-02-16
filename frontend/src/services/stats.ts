import api from './api';
import { DashboardStats } from '../types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardStats>('/stats');
  return response.data;
};

export const getRSVPBreakdown = async (): Promise<Record<string, number>> => {
  const response = await api.get('/stats/rsvp-breakdown');
  return response.data;
};

export const getSideBreakdown = async (): Promise<Record<string, number>> => {
  const response = await api.get('/stats/side-breakdown');
  return response.data;
};

export const getRelationBreakdown = async (): Promise<Record<string, number>> => {
  const response = await api.get('/stats/relation-breakdown');
  return response.data;
};
