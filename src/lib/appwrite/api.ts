import { ID, OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, databases } from "./config";
import { AuthError } from "@/types";

export async function getCurrentUser() {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("$id", currentAccount.$id)]
    );

    if (!currentUser.documents[0]) throw Error;

    return { data: currentUser.documents[0], error: null };
  } catch (error) {
    console.log("Get current user error:", error);
    return { data: null, error: error as AuthError };
  }
}

export async function createOAuth2Session() {
  try {
    const session = await account.createOAuth2Session(
      OAuthProvider.Spotify,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/auth/error`,
      [
        "ugc-image-upload",
        "user-read-playback-state",
        "user-modify-playback-state",
        "user-read-currently-playing",
        "app-remote-control",
        "streaming",
        "playlist-read-private",
        "playlist-read-collaborative",
        "playlist-modify-public",
        "playlist-modify-private",
        "user-library-modify",
        "user-library-read",
        "user-top-read",
        "user-read-playback-position",
        "user-read-recently-played",
        "user-follow-read",
        "user-follow-modify",
        "user-read-email",
        "user-read-private",
      ]
    );
    return { data: session, error: null };
  } catch (error) {
    console.error("OAuth session error:", error);
    return {
      data: null,
      error: {
        type: "auth_error",
        message: "Failed to create OAuth session",
      } as AuthError,
    };
  }
}

export async function saveSpotifyUserToDB() {
  try {
    const currentAccount = await account.get();
    const currentSession = await account.getSession("current");

    // Check if user already exists
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("$id", currentAccount.$id)]
    );

    if (users.documents.length > 0) {
      return { data: users.documents[0], error: null };
    }

    // Get Spotify profile data
    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${currentSession.providerAccessToken}`,
      },
    });

    const spotifyProfile = await response.json();

    // Create user document
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      currentAccount.$id,
      {
        email: spotifyProfile.email,
        displayName: spotifyProfile.display_name || "Spotify User",
        spotifyId: spotifyProfile.id,
        country: spotifyProfile.country,
        product: spotifyProfile.product,
        imageUrl: spotifyProfile.images?.[0]?.url,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }
    );

    // Create default settings
    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.settingsCollectionId,
      ID.unique(),
      {
        userId: newUser.$id,
        continuousTracking: false,
        trackingConsent: false,
        trackingInterval: 5,
        emailNotifications: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    return { data: newUser, error: null };
  } catch (error) {
    console.error("Save user to DB error:", error);
    return {
      data: null,
      error: {
        type: "database_error",
        message: "Failed to save user to database",
      } as AuthError,
    };
  }
}

export async function getUserSettings(userId: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.settingsCollectionId,
      [Query.equal("userId", userId)]
    );

    if (response.documents.length === 0) {
      throw new Error("Settings not found");
    }

    return { data: response.documents[0], error: null };
  } catch (error) {
    console.error("Get user settings error:", error);
    return {
      data: null,
      error: {
        type: "database_error",
        message: "Failed to get user settings",
      } as AuthError,
    };
  }
}

export async function updateUserSettings(settingsId: string, updates: any) {
  try {
    const updatedSettings = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.settingsCollectionId,
      settingsId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    return { data: updatedSettings, error: null };
  } catch (error) {
    console.error("Update settings error:", error);
    return {
      data: null,
      error: {
        type: "database_error",
        message: "Failed to update settings",
      } as AuthError,
    };
  }
}

export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");
    return { data: session, error: null };
  } catch (error) {
    console.error("Sign out error:", error);
    return {
      data: null,
      error: {
        type: "auth_error",
        message: "Failed to sign out",
      } as AuthError,
    };
  }
}
