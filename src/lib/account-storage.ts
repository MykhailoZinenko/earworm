import { SpotifyProfile } from "@auth/core/providers/spotify";

export interface StoredAccount {
  id: string;
  displayName: string;
  email: string;
  imageUrl?: string;
}

const ACCOUNTS_STORAGE_KEY = "earworm_accounts";

export function getPreviousAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to retrieve previous accounts:", error);
    return [];
  }
}

export function saveAccount(user: SpotifyProfile): StoredAccount[] {
  if (typeof window === "undefined" || !user || !user.id) return [];

  try {
    const accounts = getPreviousAccounts();

    const newAccount: StoredAccount = {
      id: user.id,
      displayName: user.display_name || "Spotify User",
      email: user.email || "",
      imageUrl: user.images?.[0]?.url,
    };

    // Check if account already exists
    const existingIndex = accounts.findIndex(
      (account) => account.id === user.id
    );

    if (existingIndex >= 0) {
      // Update existing account
      accounts[existingIndex] = newAccount;
    } else {
      // Add new account
      accounts.push(newAccount);
    }

    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));

    return accounts;
  } catch (error) {
    console.error("Failed to save account:", error);
    return [];
  }
}

export function removeAccount(id: string): StoredAccount[] {
  if (typeof window === "undefined") return [];

  try {
    let accounts = getPreviousAccounts();
    accounts = accounts.filter((account) => account.id !== id);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    return accounts;
  } catch (error) {
    console.error("Failed to remove account:", error);
    return [];
  }
}
