import { ValidationTypes } from "constants/WidgetValidation";
import { get } from "lodash";
import {
  getBasePropertyPath,
  hideByColumnType,
  showByColumnType,
  updateColumnLevelEditability,
  updateColumnOrderWhenFrozen,
} from "../../propertyUtils";
import { isColumnTypeEditable } from "../../utilities";
import { composePropertyUpdateHook } from "widgets/WidgetUtils";
import { ButtonVariantTypes } from "components/constants";
import { StickyType } from "widgets/TableWidgetV2/component/Constants";
import type { TableWidgetProps } from "widgets/Antd/TableWidget/constants";
import { ColumnTypes } from "widgets/Antd/TableWidget/constants";

export default {
  sectionName: "通用属性",
  children: [
    {
      propertyName: "isCellVisible",
      dependencies: ["primaryColumns", "columnType"],
      label: "是否显示",
      helpText: "控制当前列是否显示",
      defaultValue: true,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
    },
    {
      propertyName: "isVisibleCellSearch",
      label: "显示搜索表单",
      helpText: "支持表格上方显示搜索表单，用于远程搜索",
      defaultValue: true,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return showByColumnType(props, propertyPath, [
          ColumnTypes.INDEX,
          ColumnTypes.INDEX_BORDER,
        ]);
      },
    },
    // isCellCopyable
    {
      propertyName: "isCellCopyable",
      label: "支持复制",
      helpText: "支持表格单元格内容复制",
      defaultValue: true,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return showByColumnType(props, propertyPath, [
          ColumnTypes.INDEX,
          ColumnTypes.INDEX_BORDER,
        ]);
      },
    },
    // isVisibleCellFilters
    {
      propertyName: "isVisibleCellFilters",
      label: "启用列筛选",
      helpText: "启用列筛选",
      defaultValue: true,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return showByColumnType(props, propertyPath, [
          ColumnTypes.INDEX,
          ColumnTypes.INDEX_BORDER,
        ]);
      },
    },
    // 列排序
    {
      propertyName: "isVisibleCellSort",
      label: "显示排序",
      helpText: "开启后在当前列的表头显示排序按钮",
      defaultValue: false,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,

      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
    },

    {
      propertyName: "isDisabled",
      label: "禁用",
      helpText: "Controls the disabled state of the button",
      defaultValue: false,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      dependencies: ["primaryColumns", "columnOrder"],
    },
    {
      propertyName: "allowCellWrapping",
      dependencies: ["primaryColumns", "columnType"],
      label: "单元格换行",
      helpText: "允许单元格内容换行",
      defaultValue: false,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.TEXT,
          ColumnTypes.TEXTAREA,
          ColumnTypes.NUMBER,
          ColumnTypes.URL,
        ]);
      },
    },
    {
      propertyName: "isCellEditable",
      dependencies: [
        "primaryColumns",
        "columnOrder",
        "columnType",
        "childStylesheet",
        "tableInlineEditType",
      ],
      label: "支持编辑",
      helpText: "让表格单元格可以编辑",
      defaultValue: false,
      controlType: "SWITCH",
      customJSControl: "TABLE_COMPUTE_VALUE",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      updateHook: composePropertyUpdateHook([updateColumnLevelEditability]),
      validation: {
        type: ValidationTypes.ARRAY_OF_TYPE_OR_TYPE,
        params: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        const baseProperty = getBasePropertyPath(propertyPath);
        const columnType = get(props, `${baseProperty}.columnType`, "");
        const isDerived = get(props, `${baseProperty}.isDerived`, false);
        return !isColumnTypeEditable(columnType) || isDerived;
      },
    },
    {
      propertyName: "sticky",
      helpText: "你可以选择将数据列固定在表格左边或者右边",
      controlType: "ICON_TABS",
      defaultValue: StickyType.NONE,
      label: "固定列",
      fullWidth: true,
      isBindProperty: true,
      isTriggerProperty: false,
      dependencies: ["primaryColumns", "columnOrder"],
      options: [
        {
          startIcon: "contract-left-line",
          value: StickyType.LEFT,
        },
        {
          startIcon: "column-freeze",
          value: StickyType.NONE,
        },
        {
          startIcon: "contract-right-line",
          value: StickyType.RIGHT,
        },
      ],
      updateHook: updateColumnOrderWhenFrozen,
    },
  ],
};

export const GeneralStyle = {
  sectionName: "通用配置",
  children: [],
};
