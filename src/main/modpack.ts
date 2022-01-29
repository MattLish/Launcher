import { backupOriginalENBs, copyENBFiles, getENBPresets } from "@/main/ENB";
import { USER_PREFERENCE_KEYS, userPreferences } from "@/main/config";
import { backupOriginalProfiles } from "@/main/modOrganizer";
import { buildCustomized } from "./loadOrder";
import { logger } from "@/main/logger";

export async function startupTasks() {
  await backupOriginalENBs();

  await backupOriginalProfiles();

  const ENBFiles =
    (userPreferences.get(USER_PREFERENCE_KEYS.ENB_PROFILE) as string) ||
    (await getENBPresets())[0].real;
  await copyENBFiles(ENBFiles, false);

  logger.info(`Build customized: ${await buildCustomized()}`);
}
