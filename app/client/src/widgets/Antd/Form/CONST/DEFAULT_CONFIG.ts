import { DynamicHeight } from "utils/WidgetFeatures";
import type { WidgetConfiguration } from "widgets/constants";

// 如果是对象，递归可选
type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const DEFAULT_CONFIG: DeepPartial<WidgetConfiguration> = {
  features: {
    dynamicHeight: {
      sectionIndex: 3,
      defaultValue: DynamicHeight.AUTO_HEIGHT,
      active: true,
    },
  },
  defaults: {
    errorMessage: "必填字段",
    rows: 8,
    columns: 20,
    labelPosition: "AUTO",
    isVisible: true,
    isRequired: false,
    isDisabled: false,
    allowClear: true,
    labelText: "标签",
    labelAlignment: "LEFT",
    labelWidth: 6,
  },
};
