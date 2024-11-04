import { Alignment } from "@blueprintjs/core";

import {
  ButtonPlacementTypes,
  ButtonVariantTypes,
  CheckboxGroupAlignmentTypes,
} from "components/constants";
import type { OnButtonClickProps } from "components/propertyControls/ButtonControl";
import { ValidationTypes } from "constants/WidgetValidation";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import { EVALUATION_PATH } from "utils/DynamicBindingUtils";
import type { ButtonWidgetProps } from "widgets/ButtonWidget/widget";
import type { JSONFormWidgetProps } from ".";
import { JSONFORM_WIDGET_DEPENDENCIES, ROOT_SCHEMA_KEY } from "../constants";
import { ComputedSchemaStatus, computeSchema } from "./helper";
import generatePanelPropertyConfig from "./propertyConfig/generatePanelPropertyConfig";
import { CONFIG as ANTD_FORM_WIDGET_CONFIG } from "widgets/Antd/Form/FormWidget";
import { mergeWidgetConfig } from "utils/helpers";
import { cloneDeep } from "lodash";
import { CONFIG as ANTD_BUTTON_WIDGET_CONFIG } from "widgets/Antd/ButtonWidget";
const MAX_NESTING_LEVEL = 5;
console.log("ANTD_FORM_WIDGET_CONFIG", ANTD_FORM_WIDGET_CONFIG);

const panelConfig = generatePanelPropertyConfig(MAX_NESTING_LEVEL);
export const getSelfProps = (props: any) => {
  if (props.type == "ANTD_PRO_TABLE_WIDGET") {
    return props.autoFormConfig.config;
  }
  return props;
};

export const isTableWidget = (props: any) => {
  return props.widgetProperties.type === "ANTD_PRO_TABLE_WIDGET";
};

export const sourceDataValidationFn = (
  value: any,
  props: JSONFormWidgetProps,
  _?: any,
) => {
  if (value === "") {
    return {
      isValid: false,
      parsed: {},
      messages: [
        {
          name: "ValidationError",
          message: "Source data cannot be empty.",
        },
      ],
    };
  }

  if (_.isNumber(value) || _.isBoolean(value)) {
    return {
      isValid: false,
      parsed: {},
      messages: [
        {
          name: "ValidationError",
          message: `Source data cannot be ${value}`,
        },
      ],
    };
  }

  if (_.isNil(value)) {
    return {
      isValid: true,
      parsed: {},
    };
  }

  if (_.isPlainObject(value)) {
    return {
      isValid: true,
      parsed: value,
    };
  }

  try {
    return {
      isValid: true,
      parsed: JSON.parse(value as string),
    };
  } catch (e) {
    return {
      isValid: false,
      parsed: {},
      messages: [e as Error],
    };
  }
};

export const onGenerateFormClick = ({
  batchUpdateProperties,
  batchUpdatePropertiesWithAssociatedUpdates,
  props,
  updateProperty,
}: OnButtonClickProps) => {
  const updatePathArray = props.dataTreePath?.split(".").slice(1, -1);
  const updatePath = updatePathArray?.length
    ? updatePathArray?.join(".") + "."
    : "";

  const widgetProperties: JSONFormWidgetProps = getSelfProps(
    props.widgetProperties,
  );

  if (widgetProperties.autoGenerateForm) return;

  const currSourceData =
    widgetProperties.sourceData ||
    (widgetProperties[EVALUATION_PATH]?.evaluatedValues?.sourceData as
      | Record<string, any>
      | Record<string, any>[]);

  const prevSourceData = widgetProperties.schema?.__root_schema__?.sourceData;

  const { dynamicPropertyPathList, schema, status } = computeSchema({
    currentDynamicPropertyPathList: widgetProperties.dynamicPropertyPathList,
    currSourceData,
    fieldThemeStylesheets: widgetProperties.childStylesheet,
    prevSchema: widgetProperties.schema,
    prevSourceData,
    widgetName: widgetProperties.widgetName,
  });

  console.log("onGenerateFormClick", {
    props,
    currSourceData,
    widgetProperties,
    schema,
    status,
    dynamicPropertyPathList,
  });

  if (status === ComputedSchemaStatus.LIMIT_EXCEEDED) {
    batchUpdateProperties({
      [updatePath + "fieldLimitExceeded"]: true,
    });
    return;
  }

  if (status === ComputedSchemaStatus.UNCHANGED) {
    if (widgetProperties.fieldLimitExceeded) {
      batchUpdateProperties({
        [updatePath + "fieldLimitExceeded"]: false,
      });
    }
    return;
  }

  if (status === ComputedSchemaStatus.UPDATED) {
    batchUpdatePropertiesWithAssociatedUpdates([
      {
        propertyName: "dynamicPropertyPathList",
        propertyValue: dynamicPropertyPathList as any,
      },
      {
        propertyName: updatePath + "schema",
        propertyValue: schema,
      },
      {
        propertyName: "fieldLimitExceeded",
        propertyValue: false,
      },
    ]);
    // batchUpdateProperties({
    //   schema,
    //   fieldLimitExceeded: false,
    // });
  }
};

const generateFormCTADisabled = (widgetProps: JSONFormWidgetProps) => {
  console.log("generateFormCTADisabled", widgetProps);
  const selfProps = getSelfProps(widgetProps);
  return selfProps.autoGenerateForm;
};

export const contentConfig = mergeWidgetConfig(
  [
    {
      sortOrder: -9999,
      sectionName: "数据",
      children: [
        {
          propertyName: "sourceData",
          helpText: "样例 JSON 数据",
          label: "源数据",
          controlType: "INPUT_TEXT",
          placeholderText: '{ "name": "John", "age": 24 }',
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              fn: sourceDataValidationFn,
              expected: {
                type: "JSON",
                example: `{ "name": "John Doe", "age": 29 }`,
                autocompleteDataType: AutocompleteDataType.OBJECT,
              },
            },
          },
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
        },
        {
          propertyName: "autoGenerateForm",
          helpText:
            "注意：如果开启了自动生成表单，在源数据发生改变的时候，所有的表单字段都会重新生成。",
          label: "自动生成表单",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          customJSControl: "INPUT_TEXT",
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
        },
        {
          propertyName: "generateFormButton",
          label: "",
          controlType: "BUTTON",
          isJSConvertible: false,
          isBindProperty: false,
          buttonLabel: "生成表单",
          onClick: onGenerateFormClick,
          isDisabled: generateFormCTADisabled,
          isTriggerProperty: false,
          dependencies: [
            "autoGenerateForm",
            "schema",
            "fieldLimitExceeded",
            "childStylesheet",
            "dynamicPropertyPathList",
            ...JSONFORM_WIDGET_DEPENDENCIES,
          ],
          evaluatedDependencies: [
            "sourceData",
            ...JSONFORM_WIDGET_DEPENDENCIES,
          ],
        },
        {
          propertyName: `schema.${ROOT_SCHEMA_KEY}.children`,
          helpText: "字段配置",
          label: "字段配置",
          controlType: "ANTD_FIELD_CONFIGURATION",
          isBindProperty: false,
          isTriggerProperty: false,
          panelConfig,
          dependencies: [
            "schema",
            "childStylesheet",
            ...JSONFORM_WIDGET_DEPENDENCIES,
          ],
        },
      ],
    },
    {
      sortOrder: 300,
      sectionName: "属性",
      children: [
        {
          propertyName: "title",
          label: "标题",
          helpText: "表单标题",
          controlType: "INPUT_TEXT",
          placeholderText: "请输入表单标题",
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
        },
        {
          propertyName: "editTitle",
          label: "编辑表单标题",
          helpText: "编辑表单标题",
          controlType: "INPUT_TEXT",
          placeholderText: "请输入编辑表单标题",
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
          hidden: (props: JSONFormWidgetProps) =>
            props.type !== "ANTD_PRO_TABLE_WIDGET",
        },
        {
          propertyName: "jsonFormPopType",
          label: "表单弹窗类型",
          controlType: "ICON_TABS",
          defaultValue: "modal",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          options: [
            {
              label: "弹窗",
              value: "modal",
            },
            {
              label: "抽屉",
              value: "drawer",
            },
          ],
          hidden: (props: JSONFormWidgetProps) =>
            props.type !== "ANTD_PRO_TABLE_WIDGET",
        },
        {
          propertyName: "isVisible",
          helpText: "控制组件的显示/隐藏",
          label: "是否显示",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
          hidden: (props: JSONFormWidgetProps) =>
            props.type == "ANTD_PRO_TABLE_WIDGET",
        },
        {
          propertyName: "useSourceData",
          helpText: "使用源数据来填充隐藏字段，以便在表单数据中显示它们。",
          label: "隐藏数据中的字段。",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
        },
        {
          propertyName: "animateLoading",
          label: "加载时显示动画",
          controlType: "SWITCH",
          helpText: "组件依赖的数据加载时显示加载动画",
          defaultValue: true,
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
        },
        {
          propertyName: "disabledWhenInvalid",
          helpText: "父级表单校验不通过时禁用提交按钮",
          label: "表单校验不成功时禁用",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
        },
        {
          propertyName: "isFixedFooter",
          helpText: "让底部信息固定在表单底部",
          label: "固定底部",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
          hidden: (props: JSONFormWidgetProps) =>
            props.type === "ANTD_PRO_TABLE_WIDGET",
        },
        {
          propertyName: "allowScrollContents",
          helpText: "允许表单的内容滚动",
          label: "允许内容滚动",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
          hidden: (props: JSONFormWidgetProps) =>
            props.type === "ANTD_PRO_TABLE_WIDGET",
        },
        {
          propertyName: "showReset",
          helpText: "显示或隐藏表单重置按钮",
          label: "显示重置按钮",
          controlType: "SWITCH",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.BOOLEAN },
        },
        {
          propertyName: "submitButtonLabel",
          helpText: "修改提交按钮文案",
          label: "提交按钮文案",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
        },
        {
          propertyName: "resetButtonLabel",
          helpText: "修改重置按钮文案",
          label: "重置按钮文案",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
          dependencies: ["showReset"],
          hidden: (props: JSONFormWidgetProps) => !props.showReset,
        },
      ],
    },
    {
      sortOrder: 9999,
      sectionName: "事件",
      children: [
        {
          propertyName: "onSubmit",
          helpText: "点击提交按钮时触发",
          label: "提交时",
          controlType: "ACTION_SELECTOR",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: true,
        },
      ],
    },
  ],
  cloneDeep(ANTD_FORM_WIDGET_CONFIG.properties.contentConfig),
);

// ANTD_BUTTON_WIDGET_CONFIG
const generateButtonStyleControlsV2For = (prefix: string) => {
  return cloneDeep(ANTD_BUTTON_WIDGET_CONFIG.properties.styleConfig).map(
    (item) => {
      return {
        ...item,
        children: item.children.map((child) => {
          return {
            ...child,
            propertyName: `${prefix}.${child.propertyName}`,
          };
        }),
      };
    },
  );
};

export const styleConfig = mergeWidgetConfig(
  [
    // 弹窗样式
    {
      sectionName: "弹层样式",
      children: [
        // 弹窗宽度
        {
          propertyName: "modalWidth",
          helpText: "弹层宽度",
          label: "弹层宽度",
          controlType: "INPUT_TEXT",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          placeholderText: "520",
          validation: {
            type: ValidationTypes.NUMBER,
            params: {
              min: 320,
            },
          },
          hidden: (props: any) => {
            return props.type !== "ANTD_PRO_TABLE_WIDGET";
          },
        },
        // 弹窗高度
        {
          propertyName: "modalHeight",
          helpText: "弹窗高度",
          label: "弹窗高度",
          controlType: "INPUT_TEXT",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          placeholderText: "520",
          validation: {
            type: ValidationTypes.NUMBER,
            params: {
              min: 240,
            },
          },
          dependencies: ["jsonFormPopType"],
          hidden: (props: any) => {
            return (
              props.type !== "ANTD_PRO_TABLE_WIDGET" ||
              props.jsonFormPopType === "drawer"
            );
          },
        },
      ],
    },
    {
      sectionName: "样式",
      children: [
        // 按钮位置
        {
          propertyName: "buttonAlignment",
          helpText: "表单按钮对齐方式",
          label: "按钮对齐",
          controlType: "ICON_TABS",
          options: [
            {
              label: "左对齐",
              value: CheckboxGroupAlignmentTypes.START,
            },
            {
              label: "居中",
              value: CheckboxGroupAlignmentTypes.CENTER,
            },
            {
              label: "右对齐",
              value: CheckboxGroupAlignmentTypes.END,
            },
          ],
        },
      ],
    },
    {
      sectionName: "颜色配置",
      children: [
        // 表单主色 colorPrimary
        {
          propertyName: "colorPrimary",
          helpText: "表单主色",
          label: "主色",
          controlType: "COLOR_PICKER",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
        },
        // 标题颜色
        {
          propertyName: "titleColor",
          helpText: "表单标题颜色",
          label: "标题颜色",
          controlType: "COLOR_PICKER",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: { type: ValidationTypes.TEXT },
        },
      ],
    },

    {
      sectionName: "提交按钮样式",
      children: generateButtonStyleControlsV2For("submitButtonStyles"),
      dependencies: ["submitButtonStyles", ...JSONFORM_WIDGET_DEPENDENCIES],
      evaluatedDependencies: [
        "submitButtonStyles",
        ...JSONFORM_WIDGET_DEPENDENCIES,
      ],
    },
    {
      sectionName: "重置按钮样式",
      children: [...generateButtonStyleControlsV2For("resetButtonStyles")],
      dependencies: [
        "showReset",
        "resetButtonStyles",
        ...JSONFORM_WIDGET_DEPENDENCIES,
      ],
      evaluatedDependencies: [
        "showReset",
        "resetButtonStyles",
        ...JSONFORM_WIDGET_DEPENDENCIES,
      ],
      hidden: (props: JSONFormWidgetProps) => !props.showReset,
    },
  ],
  cloneDeep(ANTD_FORM_WIDGET_CONFIG.properties.styleConfig),
);
