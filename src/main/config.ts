import Store from "electron-store";

export const isDevelopment = process.env.NODE_ENV !== "production";

export enum USER_PREFERENCE_KEYS {
  SKYRIM_DIRECTORY = "SKYRIM_DIRECTORY",
  MOD_DIRECTORY = "MOD_DIRECTORY",
  PRESET = "PRESET",
}

export interface UserPreferences {
  [USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: string;
}

export const userPreferences = new Store<UserPreferences>({
  name: "userPreferences",
  defaults: {
    [USER_PREFERENCE_KEYS.SKYRIM_DIRECTORY]: "",
    [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: "",
    [USER_PREFERENCE_KEYS.PRESET]: "",
  },
});
