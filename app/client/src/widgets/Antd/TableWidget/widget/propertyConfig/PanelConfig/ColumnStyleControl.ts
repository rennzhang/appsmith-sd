import { ValidationTypes } from "constants/WidgetValidation";
import type { TableWidgetProps } from "widgets/Antd/TableWidget/constants";
import { ColumnTypes } from "widgets/Antd/TableWidget/constants";
import { hideByColumnType } from "../../propertyUtils";

export default {
  sectionName: "列样式",
  children: [
    // 列宽度
    {
      propertyName: "columnWidth",
      label: "列宽度",
      placeholderText: "80",
      controlType: "INPUT_TEXT",
      helpText: "设置列宽度",
      isJSConvertible: true,
      isBindProperty: true,
      dependencies: ["primaryColumns", "columnOrder"],
      isTriggerProperty: false,
      customJSControl: "TABLE_COMPUTE_VALUE",
      validation: {
        type: ValidationTypes.NUMBER,
        params: {
          minValue: 0,
        },
      },
    },
  ],
};
