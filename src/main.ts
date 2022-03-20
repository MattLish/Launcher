import { app, protocol } from "electron";
import { isDevelopment } from "./main/services/config.service";
import { autoUpdater } from "electron-updater";
import { LauncherApplication } from "@/main/application";
import { logger } from "@/main/logger";
import { ErrorService } from "@/main/services/error.service";

// Ensure it's easy to tell where the logs for this application start
logger.debug("-".repeat(20));
autoUpdater.logger = require("electron-log");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

const start = async () => {
  const launcherApplication = new LauncherApplication();
  await launcherApplication.boot();
  await launcherApplication.start();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  try {
    await start();
  } catch (error) {
    const errorService = new ErrorService();
    await errorService.handleError(
      "Failed to start application",
      (error as Error).message
    );
    process.exit(1);
  }

  logger.debug("App started");
});
