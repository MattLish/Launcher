<template>
  <BaseDropdown
    :options="resolutions"
    :current-selection="selectedResolution"
    :show-tooltip="containsUltrawide"
    v-if="resolutions !== null && selectedResolution !== null"
    :grow="true"
    @selected="onResolutionSelected"
  >
    <div class="l-row">
      <span class="material-icons c-resolution__info-icon u-text"> info </span>
      <div>
        Ultra-widescreen resolutions are not supported in this modpack.
        <BaseLink
          href="https://github.com/Wildlander-mod/Support/wiki/FAQ#does-this-pack-support-ultrawide-resolutions"
          :underline="true"
        >
          More info.
        </BaseLink>
      </div>
    </div>
  </BaseDropdown>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import BaseDropdown, {
  SelectOption,
} from "@/renderer/components/BaseDropdown.vue";
import { Resolution as ResolutionType } from "@/Resolution";
import BaseLink from "@/renderer/components/BaseLink.vue";
import BaseInput from "@/renderer/components/BaseInput.vue";
import { RESOLUTION_EVENTS } from "@/main/controllers/resolution/resolution.events";
import { logger } from "@/main/logger";
import {
  injectStrict,
  SERVICE_BINDINGS,
} from "@/renderer/services/service-container";
import { asyncFilter } from "@/shared/util/asyncFilter";

@Options({
  components: { BaseLink, BaseDropdown, BaseInput },
})
export default class Resolution extends Vue {
  selectedResolution: SelectOption | null = null;
  resolutions: SelectOption[] | null = null;
  containsUltrawide = false;

  private ipcService = injectStrict(SERVICE_BINDINGS.IPC_SERVICE);

  async created() {
    const resolutions = await this.getResolutions();
    this.containsUltrawide =
      (
        await asyncFilter(resolutions, async ({ width, height }) => {
          return this.ipcService.invoke(
            RESOLUTION_EVENTS.IS_UNSUPPORTED_RESOLUTION,
            {
              width,
              height,
            }
          );
        })
      ).length > 0;

    this.resolutions = await this.resolutionsToSelectOptions(resolutions);
    [this.selectedResolution] = await this.resolutionsToSelectOptions([
      await this.getResolutionPreference(),
    ]);
  }

  async getResolutionPreference(): Promise<ResolutionType> {
    return await this.ipcService.invoke<ResolutionType>(
      RESOLUTION_EVENTS.GET_RESOLUTION_PREFERENCE
    );
  }

  async getResolutions(): Promise<ResolutionType[]> {
    return this.ipcService.invoke(RESOLUTION_EVENTS.GET_RESOLUTIONS);
  }

  private async resolutionsToSelectOptions(
    resolutions: ResolutionType[]
  ): Promise<SelectOption[]> {
    return await Promise.all(
      resolutions.map(async ({ height, width }) => ({
        text: `${width} x ${height}`,
        value: { width, height },
        disabled: await this.ipcService.invoke(
          RESOLUTION_EVENTS.IS_UNSUPPORTED_RESOLUTION,
          {
            width,
            height,
          }
        ),
      }))
    );
  }

  async onResolutionSelected(option: SelectOption) {
    logger.debug(`User selected resolution ${JSON.stringify(option.value)}`);
    const value = option.value as ResolutionType;
    await this.ipcService.invoke(RESOLUTION_EVENTS.SET_RESOLUTION_PREFERENCE, {
      height: value.height,
      width: value.width,
    });
    this.selectedResolution = option;
  }
}
</script>

<style scoped lang="scss">
@import "~@/assets/scss";

.c-resolution__info-icon {
  font-size: $font-size;
  margin-right: $size-spacing--small;
}
</style>
