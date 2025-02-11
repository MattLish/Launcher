import { StartupService } from "@/main/services/startup.service";
import { Constructor } from "@loopback/context";
import { WindowService } from "@/main/services/window.service";
import { logger } from "@/main/logger";
import { BootMixin } from "@loopback/boot";
import { Application } from "@loopback/core";
import { Controller } from "@/main/decorators/controller.decorator";
import { ErrorService } from "@/main/services/error.service";

const serviceNamespace = "services";

export class LauncherApplication extends BootMixin(Application) {
  constructor() {
    super();

    this.projectRoot = __dirname;

    this.onStart(async () => {
      try {
        await this.registerHandlers();

        const startupService = await this.getServiceByClass(StartupService);
        startupService.registerStartupCommands();
        await startupService.runStartup();

        await this.startBrowser();
      } catch (error) {
        const errorService = await this.getServiceByClass(ErrorService);
        await errorService.handleError(
          "Failed to start application",
          (error as Error).message
        );
        process.exit(1);
      }
    });
  }

  public getServiceByClass<T>(cls: Constructor<T>): Promise<T> {
    return this.get(`${serviceNamespace}.${cls.name}`);
  }

  private async registerHandlers() {
    logger.silly("Registering handlers");

    for (const controllerBinding of this.findByTag("controller")) {
      (await this.get<Controller>(controllerBinding.key)).registerHandlers();
    }

    logger.silly("Registered handlers");
  }

  private async startBrowser() {
    const renderService = await this.getServiceByClass(WindowService);
    await renderService.createBrowserWindow();
  }
}
