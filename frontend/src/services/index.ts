// Base API client
export { default as api, createFormData } from './api';

// Admin API services
export { adminApi } from './admin.api';
export * from './admin.api';

export { guestsApi } from './guests.api';
export * from './guests.api';

export * as hotelsApi from './hotels.api';
export * as dressCodesApi from './dressCodes.api';
export * as foodMenuApi from './foodMenu.api';
export * as activitiesApi from './activities.api';
export * as mediaApi from './media.api';

// Guest portal API services
export * as guestPortalApi from './guestPortal.api';
