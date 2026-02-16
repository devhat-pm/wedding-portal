import api from './api';
import {
  Invitation,
  InvitationCreate,
  InvitationUpdate,
  MessageResponse,
} from '../types';

export const getInvitations = async (
  eventId?: string,
  guestId?: string,
  isSent?: boolean
): Promise<Invitation[]> => {
  const params = new URLSearchParams();
  if (eventId) params.append('event_id', eventId);
  if (guestId) params.append('guest_id', guestId);
  if (isSent !== undefined) params.append('is_sent', isSent.toString());

  const response = await api.get<Invitation[]>(`/invitations?${params.toString()}`);
  return response.data;
};

export const getInvitation = async (id: string): Promise<Invitation> => {
  const response = await api.get<Invitation>(`/invitations/${id}`);
  return response.data;
};

export const getInvitationByCode = async (code: string): Promise<Invitation> => {
  const response = await api.get<Invitation>(`/invitations/code/${code}`);
  return response.data;
};

export const createInvitation = async (data: InvitationCreate): Promise<Invitation> => {
  const response = await api.post<Invitation>('/invitations', data);
  return response.data;
};

export const updateInvitation = async (id: string, data: InvitationUpdate): Promise<Invitation> => {
  const response = await api.patch<Invitation>(`/invitations/${id}`, data);
  return response.data;
};

export const deleteInvitation = async (id: string): Promise<MessageResponse> => {
  const response = await api.delete<MessageResponse>(`/invitations/${id}`);
  return response.data;
};

export const bulkCreateInvitations = async (
  guestIds: string[],
  eventId: string
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/invitations/bulk', {
    guest_ids: guestIds,
    event_id: eventId,
  });
  return response.data;
};

export const markInvitationsSent = async (
  invitationIds: string[],
  sentMethod: string
): Promise<MessageResponse> => {
  const response = await api.post<MessageResponse>('/invitations/mark-sent', {
    invitation_ids: invitationIds,
    sent_method: sentMethod,
  });
  return response.data;
};

export const getInvitationStats = async (): Promise<{
  total: number;
  sent: number;
  delivered: number;
  opened: number;
}> => {
  const response = await api.get('/invitations/stats/summary');
  return response.data;
};
