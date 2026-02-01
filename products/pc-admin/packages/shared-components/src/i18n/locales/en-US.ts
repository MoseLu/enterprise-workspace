/**
 * English global common messages
 * 
 * Note: All i18n definitions are referenced from @btc/shared-core/locales to ensure single source of truth
 * Here we convert shared-core's flat structure to nested structure for compatibility with createAppI18n's nested format requirements
 */
import type { GlobalLocaleMessages } from '../types';
import { unflattenObject } from '@btc/shared-core/utils/i18n/locale-utils';
import sharedCoreEn from '@btc/shared-core/locales/en-US';

// Get flat structure i18n messages from shared-core
const sharedCoreEnMessages = (sharedCoreEn as any)?.default ?? sharedCoreEn;

// Convert shared-core's flat structure to nested structure
// Only extract keys related to common, layout, app, convert to nested format
const nestedMessages = unflattenObject(sharedCoreEnMessages as Record<string, any>);

// Extract common, layout, app parts (if they exist)
export const enUS: GlobalLocaleMessages = {
  common: nestedMessages.common || {},
  layout: nestedMessages.layout || {},
  app: nestedMessages.app || {},
};

