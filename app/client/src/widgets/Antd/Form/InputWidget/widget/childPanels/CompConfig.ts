import { ValidationTypes } from "constants/WidgetValidation";
import type { PropertyControlType } from "components/propertyControls";
import { InputTypes } from "components/constants";
import type { AntdInputWidgetProps } from "../../types";
import { DynamicHeight } from "utils/WidgetFeatures";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps } from "widgets/BaseWidget";
import { isInputTypeEmailOrPassword } from "../Utilities";
import { FORM_LABEL_CONTENT_CONFIG } from "widgets/Antd/Form/CONST/DEFAULT_CONFIG";
import { validationNumberOrUndefined } from "widgets/Antd/tools";

export function minValueValidation(
  min: any,
  props: AntdInputWidgetProps,
  _?: any,
) {
  const max = props.maxNum;
  const value = min;
  min = Number(min);

  if (_?.isNil(value) || value === "") {
    return {
      isValid: true,
      parsed: undefined,
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  } else if (!Number.isFinite(min)) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "TypeError",
          message: "This value must be number",
        },
      ],
    };
  } else if (max !== undefined && min >= max) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "RangeError",
          message: "This value must be lesser than max value",
        },
      ],
    };
  } else {
    return {
      isValid: true,
      parsed: Number(min),
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  }
}
export function maxValueValidation(
  max: any,
  props: AntdInputWidgetProps,
  _?: any,
) {
  const min = props.minNum;
  const value = max;
  max = Number(max);

  if (_?.isNil(value) || value === "") {
    return {
      isValid: true,
      parsed: undefined,
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  } else if (!Number.isFinite(max)) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "TypeError",
          message: "This value must be number",
        },
      ],
    };
  } else if (min !== undefined && max <= min) {
    return {
      isValid: false,
      parsed: undefined,
      messages: [
        {
          name: "RangeError",
          message: "This value must be greater than min value",
        },
      ],
    };
  } else {
    return {
      isValid: true,
      parsed: Number(max),
      messages: [
        {
          name: "",
          message: "",
        },
      ],
    };
  }
}
function InputTypeUpdateHook(
  props: WidgetProps,
  propertyName: string,
  propertyValue: unknown,
) {
  const updates = [
    {
      propertyPath: propertyName,
      propertyValue: propertyValue,
    },
  ];

  if (propertyValue === InputTypes.MULTI_LINE_TEXT) {
    if (props.dynamicHeight === DynamicHeight.FIXED) {
      updates.push({
        propertyPath: "dynamicHeight",
        propertyValue: DynamicHeight.AUTO_HEIGHT,
      });
    }
  }

  //if input type is email or password default the autofill state to be true
  // the user needs to explicity set autofill to fault disable autofill
  updates.push({
    propertyPath: "shouldAllowAutofill",
    propertyValue: isInputTypeEmailOrPassword(propertyValue as any),
  });

  return updates;
}
export const InputControlProperty = [
  {
    sectionName: "数据",
    children: [
      {
        helpText: "设置组件默认值，当默认值改变后，组件当前值会自动更新",
        propertyName: "defaultValue",
        label: "默认值",
        controlType: "INPUT_TEXT",
        placeholderText: "请输入默认值",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },

        // validation: {
        //   type: ValidationTypes.FUNCTION,
        //   params: {
        //     fn: defaultValueValidation,
        //     expected: {
        //       type: "string or number",
        //       example: `John | 123`,
        //       autocompleteDataType: AutocompleteDataType.STRING,
        //     },
        //   },
        // },
      },
    ],
  },
  FORM_LABEL_CONTENT_CONFIG,
  {
    sectionName: "校验",
    children: [
      {
        propertyName: "isRequired",
        label: "必填",
        helpText: "强制用户填写",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        helpText: "设置最大输入字符长度",
        propertyName: "maxChars",
        label: "最大输入长度",
        controlType: "INPUT_TEXT",
        placeholderText: "255",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.NUMBER,
          params: { min: 1, natural: true, passThroughOnZero: false },
        },
        dependencies: ["inputType"],
      },
      {
        helpText: "设置数字输入的最小值",
        propertyName: "minNum",
        label: "最小值",
        controlType: "INPUT_TEXT",
        placeholderText: "1",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: minValueValidation,
            expected: {
              type: "number",
              example: `1`,
              autocompleteDataType: AutocompleteDataType.NUMBER,
            },
          },
        },
        hidden: (props: AntdInputWidgetProps) => {
          return props.inputType !== InputTypes.NUMBER;
        },
        dependencies: ["inputType"],
      },
      {
        helpText: "设置数字输入的最大值",
        propertyName: "maxNum",
        label: "最大值",
        controlType: "INPUT_TEXT",
        placeholderText: "100",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: maxValueValidation,
            expected: {
              type: "number",
              example: `100`,
              autocompleteDataType: AutocompleteDataType.NUMBER,
            },
          },
        },
        hidden: (props: AntdInputWidgetProps) => {
          return props.inputType !== InputTypes.NUMBER;
        },
        dependencies: ["inputType"],
      },
      {
        helpText: "对输入进行正则校验，校验失败时显示错误",
        propertyName: "regex",
        label: "正则校验",
        controlType: "INPUT_TEXT",
        placeholderText: "^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.REGEX },
      },
      {
        helpText: "使用 JS 表达式来校验输入的是否合法",
        propertyName: "validation",
        label: "普通校验",
        controlType: "INPUT_TEXT",
        placeholderText: "{{ Input1.text.length > 0 }}",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
          params: {
            default: true,
          },
        },
      },
      {
        helpText: "普通校验或正则校验失败后显示的错误信息",
        propertyName: "errorMessage",
        label: "错误信息",
        controlType: "INPUT_TEXT",
        placeholderText: "输入不符合规范",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
    ],
  },

  {
    sectionName: "属性",
    children: [
      {
        helpText: "显示帮助信息或者当前输入的详情",
        propertyName: "tooltip",
        label: "提示",
        controlType: "INPUT_TEXT",
        placeholderText: "至少输入6个字符",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      {
        helpText: "输入为空时显示的占位字符",
        propertyName: "placeholderText",
        label: "占位符",
        controlType: "INPUT_TEXT",
        placeholderText: "占位符",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      // searchLoading
      {
        propertyName: "searchLoading",
        label: "搜索加载中",
        helpText: "搜索时显示加载中状态",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "allowClear",
        label: "显示清除按钮",
        helpText: "是否显示清除按钮",
        controlType: "SWITCH" as PropertyControlType,
        defaultValue: false,
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: true,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },

      // showCount
      {
        propertyName: "showCount",
        label: "显示输入字数",
        helpText: "是否显示已输入的字数",
        controlType: "SWITCH" as PropertyControlType,
        defaultValue: false,
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: true,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      // textarea 行数设置，只有多行文本框才会显示，选项：固定值，自适应
      {
        propertyName: "textareaRowsControlType",
        label: "显示行数配置",
        helpText: "多行输入框的行数配置",
        controlType: "ICON_TABS" as PropertyControlType,
        options: [
          {
            label: "固定值",
            value: "固定值",
          },
          {
            label: "自适应",
            value: "自适应",
          },
        ],
        defaultValue: "tall",
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: true,
        validation: {
          type: ValidationTypes.NUMBER,
        },
        hidden: (props: AntdInputWidgetProps) =>
          props.inputType !== "MULTI_LINE_TEXT",
        dependencies: ["inputType"],
      },

      {
        propertyName: "textareaMinRows",
        label: "最小行数",
        helpText: "多行输入框的最小行数",
        controlType: "NUMERIC_INPUT" as PropertyControlType,
        defaultValue: 2,
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: true,
        validation: {
          type: ValidationTypes.NUMBER,
        },
        hidden: (props: AntdInputWidgetProps) =>
          props.inputType !== "MULTI_LINE_TEXT" ||
          props.textareaRowsControlType === "固定值",
        dependencies: ["inputType", "textareaRowsControlType"],
      },
      {
        propertyName: "textareaMaxRows",
        label: "最大行数",
        helpText: "多行输入框的最大行数",
        controlType: "NUMERIC_INPUT" as PropertyControlType,
        defaultValue: 6,
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: true,
        validation: {
          type: ValidationTypes.NUMBER,
        },
        hidden: (props: AntdInputWidgetProps) =>
          props.inputType !== "MULTI_LINE_TEXT" ||
          props.textareaRowsControlType === "固定值",
        dependencies: ["inputType", "textareaRowsControlType"],
      },
      {
        propertyName: "textareaRows",
        label: "显示行数",
        helpText: "多行输入框的行数",
        controlType: "NUMERIC_INPUT" as PropertyControlType,
        defaultValue: 4,
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: true,
        validation: {
          type: ValidationTypes.NUMBER,
        },
        hidden: (props: AntdInputWidgetProps) =>
          props.inputType !== "MULTI_LINE_TEXT" ||
          props.textareaRowsControlType === "自适应",
        dependencies: ["inputType", "textareaRowsControlType"],
      },
      {
        helpText: "控制组件的显示/隐藏",
        propertyName: "isVisible",
        label: "是否显示",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        helpText: "让组件不可交互",
        propertyName: "isDisabled",
        label: "禁用",
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
        helpText: "加载后自动聚焦到输入框",
        propertyName: "autoFocus",
        label: "自动聚焦",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
    ],
  },
    // 数字输入框属性
  {
    sectionName: "数字输入框属性",
    hidden: (props: AntdInputWidgetProps) => {
      return props.inputType !== InputTypes.NUMBER;
    },
    children: [
      // 是否使用 keyboard
      {
        helpText: "是否启用键盘快捷行为",
        propertyName: "keyboard",
        label: "键盘",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: true,
        // hidden: (props: AntdInputWidgetProps) => {
        //   return props.inputType !== InputTypes.NUMBER;
        // },
      },
      // controls
      {
        helpText: "是否显示增减按钮",
        propertyName: "controls",
        label: "是否显示增减按钮",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: false,
        // hidden: (props: AntdInputWidgetProps) => {
        //   return props.inputType !== InputTypes.NUMBER;
        // },
      },
      // stringMode
      {
        helpText: "字符值模式，开启后支持高精度小数",
        propertyName: "stringMode",
        label: "字符串模式",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: false,
        dependencies: ["inputType"],
        // hidden: (props: AntdInputWidgetProps) => {
        //   return props.inputType !== InputTypes.NUMBER;
        // },
      },
      // step
      {
        helpText: "设置步长",
        propertyName: "step",
        label: "步长",
        controlType: "INPUT_TEXT",
        placeholderText: "0.1",
        isBindProperty: true,
        defaultValue: 1,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
        dependencies: ["inputType"],
        hidden: (props: AntdInputWidgetProps) => {
          return props.inputType !== InputTypes.NUMBER;
        },
      },
      // decimalSeparator
      {
        helpText: "设置小数点分隔符",
        propertyName: "decimalSeparator",
        label: "小数点分隔符",
        controlType: "INPUT_TEXT",
        placeholderText: ".",
        isBindProperty: true,
        defaultValue: ".",
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        dependencies: ["inputType"],
        hidden: (props: AntdInputWidgetProps) => {
          return props.inputType !== InputTypes.NUMBER;
        },
      },
      // precision
      {
        helpText: "设置数字精度",
        propertyName: "precision",
        label: "精度",
        controlType: "INPUT_TEXT",
        placeholderText: "1",
        isBindProperty: true,
        // NUMBER or undefined
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: validationNumberOrUndefined,
            expected: {
              type: "number",
              example: `1`,
              autocompleteDataType: AutocompleteDataType.NUMBER,
            },
          },
        },
        isTriggerProperty: false,
        dependencies: ["inputType"],
        hidden: (props: AntdInputWidgetProps) => {
          return props.inputType !== InputTypes.NUMBER;
        },
      },
      // {
      //   helpText: "通过 formatter 格式化数字",
      //   propertyName: "formatterValue",
      //   label: "格式化",
      //   // controlType: "COMPUTE_VALUE_INPUT_TEXT",
      //   controlType: "INPUT_TEXT",
      //   defaultValue: "{{currentValue}}",
      //   placeholderText: "请输入提示信息",
      //   isJSConvertible: true,
      //   isBindProperty: true,
      //   isTriggerProperty: false,
      //   validation: { type: ValidationTypes.TEXT },
      // },
    ],
  },
  {
    sectionName: "事件",
    children: [
      // onSearch
      {
        helpText: "搜索时触发",
        propertyName: "onSearch",
        label: "onSearch",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        hidden: (props: AntdInputWidgetProps) => props.inputType !== InputTypes.SEARCH,
        dependencies: ["inputType"],
      },
      {
        helpText: "文本输入改变时触发",
        propertyName: "onTextChanged",
        label: "onChange",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
      {
        helpText: "输入聚焦时触发",
        propertyName: "onFocus",
        label: "onFocus",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
      {
        helpText: "输入失焦时触发",
        propertyName: "onBlur",
        label: "onBlur",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
      {
        helpText: "提交时触发（用户按了回车）",
        propertyName: "onSubmit",
        label: "onSubmit",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
      {
        helpText: "提交后清空输入信息",
        propertyName: "resetOnSubmit",
        label: "提交后重置",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
    ],
  },
];
