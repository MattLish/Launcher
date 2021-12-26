import Store from "electron-store";
import { default as modpackConfig } from "../modpack.json";
import { Modpack } from "@/modpack-metadata";

export const modpack: Modpack = modpackConfig;

export const isDevelopment = process.env.NODE_ENV !== "production";

export enum USER_PREFERENCE_KEYS {
  MOD_DIRECTORY = "MOD_DIRECTORY",
  PRESET = "PRESET",
  ENB_PROFILE = "ENB_PROFILE",
  PREVIOUS_ENB_PROFILE = "PREVIOUS_ENB_PROFILE",
  RESOLUTION = "RESOLUTION",
  MANAGE_ENB = "MANAGE_ENB",
  MANAGE_RESOLUTION = "MANAGE_RESOLUTION",
}

export interface UserPreferences {
  [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: string;
  [USER_PREFERENCE_KEYS.PRESET]: string;
  [USER_PREFERENCE_KEYS.MANAGE_ENB]: boolean;
  [USER_PREFERENCE_KEYS.MANAGE_RESOLUTION]: boolean;
}

export const userPreferences = new Store<UserPreferences>({
  name: "userPreferences",
  defaults: {
    [USER_PREFERENCE_KEYS.MOD_DIRECTORY]: "",
    [USER_PREFERENCE_KEYS.PRESET]: "",
    [USER_PREFERENCE_KEYS.MANAGE_ENB]: true,
    [USER_PREFERENCE_KEYS.MANAGE_RESOLUTION]: true,
  },
});

export const skyrimDirectory = () =>
  `${userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY)}/Stock Game`;

export const modDirectory = () =>
  userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);

export const backupDirectory = () => `${modDirectory()}/launcher/_backups`;
