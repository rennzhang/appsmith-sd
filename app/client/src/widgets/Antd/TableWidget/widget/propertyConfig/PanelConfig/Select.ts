import { ValidationTypes } from "constants/WidgetValidation";
import { get } from "lodash";
import type { TableWidgetProps } from "widgets/TableWidgetV2/constants";
import { ColumnTypes } from "widgets/TableWidgetV2/constants";
import {
  getBasePropertyPath,
  hideByColumnType,
  selectColumnOptionsValidation,
} from "../../propertyUtils";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import { SelectValidator } from "widgets/Antd/tools";
import { EvaluationSubstitutionType } from "entities/DataTree/types";
import { getDefaultValueDropdownPropConfig, getFieldNamesPropConfig } from "widgets/Antd/Form/CONST/DEFAULT_CONFIG";


const dependencies=[
  "tableData",
  "primaryColumns",
  "filteredTableData",
  "editingColumnId",
  "editingColumnIndex",
  "orderedTableColumns",
]
export default {
  sectionName: "选择器配置",
  hidden: (props: TableWidgetProps, propertyPath: string) => {
    return hideByColumnType(props, propertyPath, [ColumnTypes.SELECT], true);
  },
  children: [
    {
      propertyName: "options",
      helpText: "可供选择的选项列表",
      label: "选项数据",
      controlType: "OPTION_INPUT",
      // controlType: "DROP_DOWN",
      // controlType: "INPUT_TEXT",
      // inputType: "AUTOCOMPLETE",
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
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.SELECT]);
      },
    },
    getDefaultValueDropdownPropConfig({
      dependencies: dependencies,
      evaluatedDependencies: dependencies,
    }),
    getFieldNamesPropConfig("label", {
      validation: {
        dependentPaths: dependencies
      },
      dependencies: dependencies,
      evaluatedDependencies: dependencies,
    }),
    getFieldNamesPropConfig("value", {
      validation: {
        dependentPaths: dependencies
      },
      dependencies: dependencies,
      evaluatedDependencies: dependencies,
    }),
    // {
    //   helpText: "自定义字段名, 用于自定义选项的label和value",
    //   propertyName: "fieldNames",
    //   label: "自定义字段名",
    //   controlType: "INPUT_TEXT",
    //   dependencies: ["primaryColumns"],

    //   defaultValue: {
    //     label: "label",
    //     value: "value",
    //   },
    //   isJSConvertible: false,
    //   isBindProperty: true,
    //   isTriggerProperty: false,
    //   validation: {
    //     type: ValidationTypes.OBJECT,
    //     params: {
    //       required: true,
    //       allowedKeys: [
    //         {
    //           name: "label",
    //           type: ValidationTypes.TEXT,
    //           params: {
    //             default: "label",
    //             required: true,
    //           },
    //         },
    //         {
    //           name: "value",
    //           type: ValidationTypes.TEXT,
    //           params: {
    //             default: "value",
    //             required: true,
    //           },
    //         },
    //         {
    //           name: "options",
    //           type: ValidationTypes.TEXT,
    //           params: {
    //             default: "options",
    //             required: false,
    //           },
    //         },
    //       ],
    //     },
    //   },
    // },
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
