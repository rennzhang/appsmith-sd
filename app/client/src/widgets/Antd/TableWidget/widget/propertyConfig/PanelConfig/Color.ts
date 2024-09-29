import { ValidationTypes } from "constants/WidgetValidation";
import type { TableWidgetProps } from "widgets/Antd/TableWidget/constants";
import { ColumnTypes } from "widgets/Antd/TableWidget/constants";
import { hideByColumnType } from "../../propertyUtils";

export default {
  sectionName: "颜色",
  children: [
    {
      propertyName: "cellBackground",
      label: "单元格背景",
      helpText: "设置单元格背景颜色",
      controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
      isJSConvertible: true,
      customJSControl: "TABLE_COMPUTE_VALUE",
      dependencies: ["primaryColumns", "columnOrder"],
      isBindProperty: true,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.TEXT,
          params: {
            regex: /^(?![<|{{]).+/,
          },
        },
      },
      isTriggerProperty: false,
    },
    {
      propertyName: "textColor",
      label: "文本颜色",
      helpText: "Controls the color of text in the column",
      controlType: "PRIMARY_COLUMNS_COLOR_PICKER_V2",
      isJSConvertible: true,
      customJSControl: "TABLE_COMPUTE_VALUE",
      dependencies: ["primaryColumns", "columnOrder"],
      isBindProperty: true,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.TEXT,
          params: {
            regex: /^(?![<|{{]).+/,
          },
        },
      },
      isTriggerProperty: false,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.TEXT,
          ColumnTypes.DATE,
          ColumnTypes.NUMBER,
          ColumnTypes.URL,
        ]);
      },
    },
  ],
};
