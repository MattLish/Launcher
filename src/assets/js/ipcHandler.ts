/**
 * Handles inter process communication
 */

import { app, dialog, ipcMain, shell } from "electron";
import path from "path";
import childProcess from "child_process";
import os from "os";
import { getConfig, resetConfig, saveCurrentConfig } from "./config";
import { getCurrentLogPath, openLogDirectory, toLog } from "./log";
import { launchGame } from "./modlists";
import { sendError } from "./errorHandler";

const configDirectory = path.join(os.homedir(), "Ultimate Skyrim Launcher");

let webContents: Electron.WebContents;
let win: Electron.BrowserWindow;

export function getWindow() {
  return win;
}

export function setWindow(window: Electron.BrowserWindow) {
  win = window;
}

export function getWebContents() {
  return webContents;
}

// Open hyperlinks in the default browser
ipcMain.on("follow-link", async (_event, { link }) => {
  try {
    toLog(`Opening link: ${link}`);
    await shell.openExternal(link);
  } catch (err) {
    sendError("B03-02-00", `Error while opening web link ${link}`, err);
  }
});

// Open path to folder
ipcMain.on("open-modlist-profile", async (_event, { path }) => {
  try {
    toLog("Opening explorer path: " + path);
    await shell.openPath(path);
  } catch (err) {
    sendError("B03-03-00", "Error while opening file path! Path:" + path, err);
  }
});

// Open logs folder
ipcMain.on("open-logs-directory", () => {
  try {
    shell.showItemInFolder(getCurrentLogPath());
  } catch (err) {
    sendError("B03-04-00", "Error while opening logs folder!", err);
  }
});
// Launch MO2. Error ID: B03-05
ipcMain.on("launch-mo2", () => {
  try {
    toLog("Launching MO2");
    const currentConfig = getConfig();
    const moPath = path.join(
      currentConfig.Options.ModDirectory,
      "\\ModOrganizer.exe"
    );
    childProcess.exec('"' + moPath + '"');
  } catch (err) {
    sendError("B03-05-00", "Error while opening MO2!", err);
  }
});
// Open Developer Console. Error ID: B03-06
ipcMain.on("open-dev-tools", _event => {
  try {
    toLog("Opening developer tools");
    _event.sender.openDevTools();
  } catch (err) {
    sendError("B03-06-00", "Error while opening developer tools!", err);
  }
});
// Open config file. Error ID: B03-07
ipcMain.on("open-config", async () => {
  try {
    await shell.openPath(path.join(configDirectory, "options.json"));
  } catch (err) {
    sendError("B03-07-00", "Error while opening config file!", err);
  }
});
// Stores webContents on app initialization. Error ID: B03-08
ipcMain.once("initialized", _event => {
  try {
    webContents = _event.sender;
  } catch (err) {
    sendError(
      "B03-08-00",
      "Error while receiving front-end initialization confirmation",
      err
    );
  }
});
// Get Directory. Error ID: B03-09
ipcMain.handle("get-directory", async () => {
  try {
    toLog("Getting directory");
    return dialog.showOpenDialogSync({
      buttonLabel: "Choose Folder",
      properties: ["openDirectory"]
    });
  } catch (err) {
    sendError("B03-09-00", "Error while getting directory path!", err);
  }
});
// Forwards errors sent from front-end to errorHandler.js. No Error ID
ipcMain.on("error", (_event, { code, message, err, tabbed }) => {
  // code = String
  // message = String
  // err = ErrorConstructor
  // tabbed = Number
  sendError(code, message, err, tabbed);
});
// Get configuration. No Error ID
ipcMain.handle("get-config", async () => {
  toLog("Front-end requesting config");
  return getConfig();
});
// Launch modlist. No Error ID
ipcMain.handle("launch-game", async () => {
  launchGame();
});
// Reset config to default. No Error ID
ipcMain.handle("reset-config", async () => {
  toLog("Resetting configurations.");
  return resetConfig();
});
// Open current log. No Error ID
ipcMain.on("open-log", async () => {
  await openLogDirectory();
});
// Update configuration file. No Error ID.
ipcMain.on("update-config", (_event, { newConfig }) => {
  // newConfig = JSON object
  toLog("Received new configuration from front-end");
  saveCurrentConfig(newConfig);
});
ipcMain.on("close", () => {
  win.close();
  app.quit();
});
ipcMain.on("minimize", () => {
  win.minimize();
});