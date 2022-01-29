import { userPreferences, USER_PREFERENCE_KEYS } from "@/main/config";
import { createReadStream, ReadStream } from "fs";
import { logger } from "./logger";
import fetch from "node-fetch";
import FormData from "form-data";

const fileList = ["loadorder.txt", "plugins.txt", "modlist.txt"];
const profileDict: { [key: string]: string } = {
  "1_Wildlander-ULTRA": "wildlander-ultra-profile",
  "2_Wildlander-HIGH": "wildlander-high-profile",
  "3_Wildlander-MEDIUM": "wildlander-medium-profile",
  "4_Wildlander-LOW": "wildlander-low-profile",
  "5_Wildlander-POTATO": "wildlander-potato-profile",
};
const modDirectory = userPreferences.get(USER_PREFERENCE_KEYS.MOD_DIRECTORY);

const getFile = async (
  fileName: string,
  profile: string
): Promise<ReadStream> => {
  const path = `${modDirectory}/profiles/${profile}/${fileName}`;
  return createReadStream(path, "utf-8");
};

const uploadList = async (profile: string) => {
  const formData = new FormData();
  formData.append("name", `${profile}`);
  formData.append("game_id", "4");
  formData.append("expires_at", "24h");
  for (let i = 0; i < fileList.length; i++) {
    formData.append("files[]", await getFile(fileList[i], profile));
  }
  const response = await fetch("https://api.loadorderlibrary.com/v1/lists", {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  });
  return await response.json();
};

export const buildCustomized = async () => {
  const profile = userPreferences.get(USER_PREFERENCE_KEYS.PRESET);
  const uploadResponse = await uploadList(profile);
  const listUrl = uploadResponse["data"]["url"];
  logger.debug(`List URL: ${listUrl}`);
  const endListUrl = listUrl.substring(listUrl.lastIndexOf("/") + 1);
  const response = await fetch(
    `https://api.loadorderlibrary.com/v1/compare/${endListUrl}/${profileDict[profile]}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );
  const differences = (await response.json())["data"]["differences"];
  return differences.length != 0;
};
