import { LocalStorageProvider } from "./local";
import {
  isSupabaseStorageConfigured,
  SupabaseStorageProvider,
} from "./supabase";
import type { StorageProvider } from "./types";

export type { StorageProvider } from "./types";

let _provider: StorageProvider | null = null;

function setStorageProvider(provider: StorageProvider) {
  _provider = provider;
}

export function getStorageProvider(): StorageProvider {
  if (!_provider) {
    setStorageProvider(
      isSupabaseStorageConfigured()
        ? SupabaseStorageProvider()
        : LocalStorageProvider(),
    );
  }
  return _provider as StorageProvider;
}
