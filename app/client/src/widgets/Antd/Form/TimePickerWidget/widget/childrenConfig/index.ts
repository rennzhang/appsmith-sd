import { ValidationTypes } from "constants/WidgetValidation";
import { EvaluationSubstitutionType } from "entities/DataTree/types";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { MenuButtonWidgetProps } from "widgets/MenuButtonWidget/constants";
import { getKeysFromSourceDataForEventAutocomplete } from "widgets/MenuButtonWidget/widget/helper";
import { ICON_NAMES } from "widgets/constants";
import { DisabledRuleOptions } from "../data";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";
import type { TimePickerWidgetProps } from "..";
import { get } from "lodash";
export const disabledTimeRuleConfig = {
  editableTitle: false,
  titlePropertyName: "label",
  panelIdPropertyName: "id",
  updateHook: (
    props: MenuButtonWidgetProps,
    propertyPath: string,
    propertyValue: any,
  ) => {
    return undefined;
  },
  contentChildren: [
    {
      sectionName: "属性",
      children: [
        {
          label: "禁用时间规则",
          propertyName: "disabledRule",
          controlType: "DROP_DOWN",
          isBindProperty: true,
          isTriggerProperty: false,
          // isMultiSelect: true,
          options: DisabledRuleOptions,
        },
        // hideDisabledOptions
        {
          label: "隐藏禁用选项",
          helpText: "隐藏禁用的选项",
          propertyName: "hideDisabledOptions",
          controlType: "SWITCH",
          isBindProperty: true,
          isTriggerProperty: false,
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return [propsData.disabledTimeRule?.config?.disabledRule]?.includes(
              "none",
            );
          },
        },
        {
          helpText: "设置禁用的小时",
          label: "指定小时",
          propertyName: "specificHours",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          placeholderText: "1,3,7,11,13,17,19,23",
          dependencies: ["disabledTimeRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.UNION,
            params: {
              types: [
                {
                  type: ValidationTypes.REGEX,
                  params: {
                    regex: /^([01]?[0-9]|2[0-3])(,\s?[01]?[0-9]|2[0-3])*$/,
                    errMsg: "请输入正确的值",
                    example: "1,3,7,11,13,17,19,23",
                  },
                },
                {
                  type: ValidationTypes.ARRAY,
                  params: {
                    children: {
                      type: ValidationTypes.TEXT,
                      example: "[1, 3, 7, 11, 13, 17, 19, 23]",
                      params: {
                        errMsg: "请输入正确的值",
                        regex: /^([01]?[0-9]|2[0-3])(,\s?[01]?[0-9]|2[0-3])*$/,
                      },
                    },
                  },
                },
              ],
            },
          },
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return ![
              propsData.disabledTimeRule?.config?.disabledRule,
            ]?.includes("specificHMS");
          },
        },
        {
          helpText: "设置禁用的分钟",
          label: "指定分钟",
          propertyName: "specificMinutes",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          placeholderText: "1,5,10,30,45",
          dependencies: ["disabledTimeRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.UNION,
            params: {
              types: [
                {
                  type: ValidationTypes.REGEX,
                  params: {
                    // 0-59分钟
                    regex: /^([0-5]?[0-9])(,\s?[0-5]?[0-9])*$/,
                    errMsg: "请输入正确的值",
                    example: "1,5,10,30,45",
                  },
                },
                {
                  type: ValidationTypes.ARRAY,
                  params: {
                    children: {
                      type: ValidationTypes.TEXT,
                      example: "[1,5,10,30,45]",
                      params: {
                        errMsg: "请输入正确的值",

                        regex: /^([0-5]?[0-9])(,\s?[0-5]?[0-9])*$/,
                      },
                    },
                  },
                },
              ],
            },
          },
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return ![
              propsData.disabledTimeRule?.config?.disabledRule,
            ]?.includes("specificHMS");
          },
        },
        {
          helpText: "设置禁用的秒",
          label: "指定秒",
          propertyName: "specificSeconds",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          placeholderText: "1,5,10,30,45",
          dependencies: ["disabledTimeRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.UNION,
            params: {
              types: [
                {
                  type: ValidationTypes.REGEX,
                  params: {
                    // 0-59分钟
                    regex: /^([0-5]?[0-9])(,\s?[0-5]?[0-9])*$/,
                    errMsg: "请输入正确的值",
                    example: "1,5,10,30,45",
                  },
                },
                {
                  type: ValidationTypes.ARRAY,
                  params: {
                    children: {
                      type: ValidationTypes.TEXT,
                      example: "[1,5,10,30,45]",
                      params: {
                        errMsg: "请输入正确的值",
                        regex: /^([0-5]?[0-9])(,\s?[0-5]?[0-9])*$/,
                      },
                    },
                  },
                },
              ],
            },
          },
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return ![
              propsData.disabledTimeRule?.config?.disabledRule,
            ]?.includes("specificHMS");
          },
        },
        {
          helpText: "设置需要禁用的时间集合",
          label: "指定时间",
          propertyName: "specificTime",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          placeholderText: "08:00:00,12:20:00,18:35:00",
          dependencies: ["disabledTimeRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.UNION,
            params: {
              types: [
                {
                  type: ValidationTypes.REGEX,
                  params: {
                    regex:
                      /^(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d|(?:[01]\d|2[0-3]):[0-5]\d|(?:[01]\d|2[0-3]))(?:,(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d|(?:[01]\d|2[0-3]):[0-5]\d|(?:[01]\d|2[0-3])))*$/,
                    errMsg: "请输入正确的值",
                    example: "08:00:00,12:20:00,18:35:00",
                  },
                },
                {
                  type: ValidationTypes.ARRAY,
                  params: {
                    children: {
                      type: ValidationTypes.TEXT,
                      example: JSON.stringify([
                        "08:00:00",
                        "12:20:00",
                        "18:35:00",
                        "20",
                        "22:20",
                      ]),
                      params: {
                        regex:
                          /^(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d|(?:[01]\d|2[0-3]):[0-5]\d|(?:[01]\d|2[0-3]))(?:,(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d|(?:[01]\d|2[0-3]):[0-5]\d|(?:[01]\d|2[0-3])))*$/,
                        errMsg: "请输入正确的值",
                      },
                    },
                  },
                },
              ],
            },
          },
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return ![
              propsData.disabledTimeRule?.config?.disabledRule,
            ]?.includes("specificTime");
          },
        },

        {
          helpText: "设置禁用的时间范围",
          label: "禁用范围",
          propertyName: "customRanges",
          controlType: "JS_DATA",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,

          dependencies: ["disabledTimeRule"],
          placeholderText: JSON.stringify([
            "08:00:00-10:00:00",
            "11:20-11:45",
            "14-16",
          ]),
          // defaultValue: [],
          validation: {
            type: ValidationTypes.ARRAY,
            params: {
              children: {
                type: ValidationTypes.TEXT,
                example: JSON.stringify([
                  "08:00:00-10:00:00",
                  "11:20-11:45",
                  "14-16",
                ]),
                params: {
                  expected: {
                    type: `"HH:MM:SS-HH:MM:SS" | "HH:MM-HH:MM" | "HH-HH"`,
                    example: `"08:00:00-10:00:00"`,
                    autocompleteDataType: AutocompleteDataType.STRING,
                  },
                  regex:
                    /^(?:(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d|(?:[01]\d|2[0-3])-(?:[01]\d|2[0-3])|(?:[01]\d|2[0-3]):[0-5]\d-(?:[01]\d|2[0-3]):[0-5]\d)$/,
                  errMsg:
                    '请输入正确的值，格式支持： "HH:MM:SS-HH:MM:SS"、"HH:MM-HH:MM"、"HH-HH"',
                },
              },
            },
          },
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return ![
              propsData.disabledTimeRule?.config?.disabledRule,
            ]?.includes("customRanges");
          },
        },
        // // 是否取交叉部分
        // {
        //   helpText: "反选当前禁用时间",
        //   label: "反选",
        //   propertyName: "isInvertSelection",
        //   controlType: "SWITCH",
        //   isBindProperty: true,
        //   isTriggerProperty: false,
        //   dependencies: ["disabledTimeRule"],
        //   hidden: (props: any) =>
        //     ![props.disabledTimeRule.config.disabledRule].includes(
        //       "customRanges",
        //     ),
        // },
        // disabledTimeFunction
        {
          propertyName: "customFunc",
          label: "自定义规则",
          controlType: "INPUT_TEXT",
          helpText: "自定义禁用时间规则",
          placeholderText: "请输入禁用时间函数",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              fn: (value: any) => {
                let disabledTimeFn;

                try {
                  // 尝试解析用户代码
                  const userFunc = new Function(
                    "currentDate",
                    "return " + value,
                  );
                  // 如果解析成功,则执行用户函数并获取结果
                  disabledTimeFn = userFunc;

                  return {
                    isValid: true,
                    parsed: value,
                    messages: [],
                  };
                } catch (error) {
                  // 如果解析失败,则说明用户输入的代码存在语法错误
                  console.error("时间选择 无效的函数代码:", error);
                  // 可以在这里显示错误提示或者使用默认的禁用时间函数
                  return {
                    isValid: false,
                    parsed: value,
                    messages: [
                      {
                        name: "TypeError",
                        message: "请输入正确的值",
                      },
                    ],
                  };
                }
              },
              expected: {
                type: "string",
                example: "(currentDate: Date) => boolean",
                autocompleteDataType: AutocompleteDataType.STRING,
              },
            },
          },
          dependencies: ["disabledTimeRule"],
          hidden: (props: TimePickerWidgetProps, propertyPath: string) => {
            const _propertyPath = propertyPath.split(".disabledTimeRule")[0];
            const propsData = get(props, _propertyPath) || props;
            return ![
              propsData.disabledTimeRule?.config?.disabledRule,
            ]?.includes("customFunc");
          },
          // hidden: (props: any) =>
          //   ![props.disabledTimeRule.config.disabledRule].includes(
          //     "customFunc",
          //   ),
        },
      ],
    },
  ],
  styleChildren: [],
};
