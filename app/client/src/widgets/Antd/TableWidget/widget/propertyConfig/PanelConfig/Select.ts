import { ValidationTypes } from "constants/WidgetValidation";

import { hideByColumnType } from "../../propertyUtils";
import {
  getDefaultValueDropdownPropConfig,
  getFieldNamesPropConfig,
} from "widgets/Antd/Form/CONST/DEFAULT_CONFIG";
import type { TableWidgetProps } from "widgets/Antd/TableWidget/constants";
import { ColumnTypes } from "widgets/Antd/TableWidget/constants";

const dependencies = [
  "tableData",
  "primaryColumns",
  "filteredTableData",
  "editingColumnId",
  "editingColumnIndex",
  "orderedTableColumns",
];
export default {
  sectionName: "选项配置",
  hidden: (props: TableWidgetProps, propertyPath: string) => {
    return hideByColumnType(
      props,
      propertyPath,
      [ColumnTypes.SELECT, ColumnTypes.CHECKBOX, ColumnTypes.RADIO],
      true,
    );
  },
  children: [
    {
      propertyName: "options",
      helpText: "可供选择的选项列表",
      label: "选项数据",
      controlType: "OPTION_INPUT",
      placeholderText: "请输入选项数据",
      isJSConvertible: true,
      isBindProperty: true,
      defaultValue: [],
      validation: {
        type: ValidationTypes.ARRAY,
        params: {
          children: {
            type: ValidationTypes.OBJECT,
            params: {
              required: true,
            },
          },
        },
      },
      isTriggerProperty: false,
      dependencies,
      evaluatedDependencies: dependencies,
      updateHook: (
        props: TableWidgetProps,
        propertyPath: string,
        propertyValue: unknown,
      ) => {
        const propertiesToUpdate: Array<{
          propertyPath: string;
          propertyValue: unknown;
        }> = [];

        // 获取当前编辑的列ID
        const [, columnId] = propertyPath.split(".");

        // 将options同步更新到表单配置中
        propertiesToUpdate.push({
          propertyPath: `autoFormConfig.config.schema.__root_schema__.children.${columnId}.options`,
          propertyValue: propertyValue,
        });

        return propertiesToUpdate;
      },
    },
    getDefaultValueDropdownPropConfig({
      dependencies: dependencies,
      evaluatedDependencies: dependencies,
      updateHook: (
        props: TableWidgetProps,
        propertyPath: string,
        propertyValue: unknown,
      ) => {
        // 获取当前编辑的列ID
        const [, columnId] = propertyPath.split(".");
        return [
          {
            propertyPath: `autoFormConfig.config.schema.__root_schema__.children.${columnId}.defaultValue`,
            propertyValue: propertyValue,
          },
        ];
      },
    }),
    getFieldNamesPropConfig("label", {
      validation: {
        dependentPaths: dependencies,
      },
      dependencies: dependencies,
      evaluatedDependencies: dependencies,
      updateHook: (
        props: TableWidgetProps,
        propertyPath: string,
        propertyValue: unknown,
      ) => {
        // 获取当前编辑的列ID
        const [, columnId] = propertyPath.split(".");
        return [
          {
            propertyPath: `autoFormConfig.config.schema.__root_schema__.children.${columnId}.labelKey`,
            propertyValue: propertyValue,
          },
        ];
      },
    }),
    getFieldNamesPropConfig("value", {
      validation: {
        dependentPaths: dependencies,
      },
      dependencies: dependencies,
      evaluatedDependencies: dependencies,
      updateHook: (
        props: TableWidgetProps,
        propertyPath: string,
        propertyValue: unknown,
      ) => {
        // 获取当前编辑的列ID
        const [, columnId] = propertyPath.split(".");
        return [
          {
            propertyPath: `autoFormConfig.config.schema.__root_schema__.children.${columnId}.valueKey`,
            propertyValue: propertyValue,
          },
        ];
      },
    }),
    {
      helpText: "设置占位文本",
      propertyName: "placeholder",
      label: "占位符",
      controlType: "INPUT_TEXT",
      placeholderText: "请输入占位文本",
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      dependencies: ["primaryColumns"],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.SELECT]);
      },
    },
    {
      propertyName: "mode",
      label: "选择模式",
      helpText: "选择模式配置，单选或多选",
      controlType: "ICON_TABS",
      fullWidth: false,
      options: [
        { label: "单选", value: "void 0" },
        { label: "多选", value: "multiple" },
      ],
      defaultValue: "void 0",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.TEXT },
      dependencies: ["primaryColumns"],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.SELECT]);
      },
    },
    {
      propertyName: "disabled",
      label: "禁用",
      helpText: "让组件不可交互",
      controlType: "SWITCH",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: false,
      validation: { type: ValidationTypes.BOOLEAN },
      dependencies: ["primaryColumns"],
    },
  ],
};
