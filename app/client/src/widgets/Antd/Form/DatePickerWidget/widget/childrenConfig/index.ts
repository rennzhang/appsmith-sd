import { ValidationTypes } from "constants/WidgetValidation";
import { EvaluationSubstitutionType } from "entities/DataTree/types";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { MenuButtonWidgetProps } from "widgets/MenuButtonWidget/constants";
import { getKeysFromSourceDataForEventAutocomplete } from "widgets/MenuButtonWidget/widget/helper";
import { ICON_NAMES } from "widgets/constants";
import { DisabledRuleOptions } from "../data";
import { get } from "lodash";

// 抽离获取propsData的通用函数
const getPropsData = (props: any, propertyPath: string) => {
  const _propertyPath = propertyPath.split(".disabledDateRule")[0];
  const targetPath = _propertyPath == propertyPath ? "" : _propertyPath;
  const data = get(props, targetPath) || props;

  return data;
};

export const disabledDateRuleConfig = {
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
          label: "禁用日期规则",
          propertyName: "disabledRule",
          controlType: "DROP_DOWN",
          isBindProperty: true,
          isTriggerProperty: false,
          // isMultiSelect: true,
          options: DisabledRuleOptions,
        },
        {
          helpText: "设置禁用的年份,",
          label: "特定年份",
          propertyName: "specificYear",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          placeholderText: "2022,2023",
          dependencies: ["disabledDateRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          // /^(19[7-9]\d|[2-9]\d{3})(,\s?(19[7-9]\d|[2-9]\d{3}))*$/
          validation: {
            type: ValidationTypes.UNION,
            params: {
              types: [
                {
                  type: ValidationTypes.REGEX,
                  params: {
                    regex: /^(-?\d{4})(,\s?-?\d{4})*$/,
                    message: "请输入正确的年份",
                    example: "2022,2023",
                  },
                },
                {
                  type: ValidationTypes.ARRAY,
                  params: {
                    children: {
                      type: ValidationTypes.TEXT,
                      example: "2022",
                      params: {
                        regex: /^(-?\d{4})(,\s?-?\d{4})*$/,
                      },
                    },
                  },
                },
              ],
              // regex: /^(19[7-9]\d|[2-9]\d{3})(,\s?(19[7-9]\d|[2-9]\d{3}))*$/,
              // example: "2022,2023",
            },
          },
          // validation: {
          //   type: ValidationTypes.ARRAY,
          //   params: {
          //     children: {
          //       type: ValidationTypes.TEXT,
          //       example: "2022",
          //       params: {
          //         regex: /^\d{4}/,
          //       },
          //     },
          //   },
          // },
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![
              propsData.disabledDateRule?.config?.disabledRule,
            ]?.includes("specificYear");
          },
        },
        {
          label: "特定季度",
          propertyName: "specificQuarters",
          controlType: "DROP_DOWN",
          isBindProperty: true,
          isTriggerProperty: false,
          placeholderText: "请选择季度",
          dependencies: ["disabledDateRule"],
          isMultiSelect: true,
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "specificQuarters",
            );
          },
          options: [
            { label: "第一季度", value: "1" },
            { label: "第二季度", value: "2" },
            { label: "第三季度", value: "3" },
            { label: "第四季度", value: "4" },
          ],
        },
        {
          label: "特定月份",
          propertyName: "specificMonths",
          controlType: "DROP_DOWN",
          isBindProperty: true,
          isTriggerProperty: false,
          dependencies: ["disabledDateRule"],
          isMultiSelect: true,
          placeholderText: "请选择月份",
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "specificMonths",
            );
          },
          options: [
            { label: "1月", value: "1" },
            { label: "2月", value: "2" },
            { label: "3月", value: "3" },
            { label: "4月", value: "4" },
            { label: "5月", value: "5" },
            { label: "6月", value: "6" },
            { label: "7月", value: "7" },
            { label: "8月", value: "8" },
            { label: "9月", value: "9" },
            { label: "10月", value: "10" },
            { label: "11月", value: "11" },
            { label: "12月", value: "12" },
          ],
        },
        {
          label: "禁用特定星期几",
          propertyName: "specificDaysOfWeek",
          controlType: "DROP_DOWN",
          isMultiSelect: true,
          isBindProperty: true,
          isTriggerProperty: false,
          dependencies: ["disabledDateRule"],
          placeholderText: "请选择星期几",
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "specificDaysOfWeek",
            );
          },
          options: [
            { label: "周一", value: "1" },
            { label: "周二", value: "2" },
            { label: "周三", value: "3" },
            { label: "周四", value: "4" },
            { label: "周五", value: "5" },
            { label: "周六", value: "6" },
            { label: "周日", value: "0" },
          ],
        },
        // specificDates
        {
          helpText: "设置禁用的日期",
          label: "指定日期",
          propertyName: "specificDates",
          controlType: "INPUT_TEXT",
          placeholderText: JSON.stringify(["2022-03-01", "2022-03-02"]),
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          dependencies: ["disabledDateRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.ARRAY,
            params: {
              default: [],
              children: {
                type: ValidationTypes.TEXT,
                example: "2022-03-01",
                params: {
                  regex: /^\d{4}-\d{2}-\d{2}$/,
                },
              },
            },
          },
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "specificDates",
            );
          },
        },
        {
          helpText:
            "设置每月禁用的日期，如1,10,20,31 代表每月的1号、10号、20号、31号禁用",
          label: "按月指定日期",
          placeholderText: "1,10,20,31",
          propertyName: "specificDaysOfMonth",
          controlType: "INPUT_TEXT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          dependencies: ["disabledDateRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.TEXT,
          },
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "specificDaysOfMonth",
            );
          },
        },
        {
          label: "偏移量规则",
          propertyName: "offsetWay",
          controlType: "ICON_TABS",
          options: [
            {
              label: "向前",
              value: "front",
            },
            {
              label: "向后",
              value: "back",
            },
            {
              label: "同时",
              value: "both",
            },
          ],
          isBindProperty: true,
          isTriggerProperty: false,
          dependencies: ["disabledDateRule"],
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "offsetRange",
            );
          },
        },
        // 前置偏移
        {
          helpText:
            "以今天为准，加上偏移量之前的日期全部禁用，如：-7 代表从今天向前减7天之前的日期全部禁用",
          label: "向前偏移量",
          propertyName: "frontOffset",
          controlType: "NUMERIC_INPUT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          dependencies: ["disabledDateRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.NUMBER,
          },
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return (
              ![propsData.disabledDateRule?.config?.disabledRule].includes(
                "offsetRange",
              ) || propsData.disabledDateRule?.config?.offsetWay == "back"
            );
          },
        },
        // 后置偏移
        {
          helpText:
            "以今天为准，加上偏移量之后的日期全部禁用，如：7 代表从今天向后加7天之后的日期全部禁用",
          label: "向后偏移量",
          propertyName: "backOffset",
          controlType: "NUMERIC_INPUT",
          isBindProperty: true,
          isTriggerProperty: false,
          isJSConvertible: true,
          dependencies: ["disabledDateRule"],
          evaluationSubstitutionType:
            EvaluationSubstitutionType.SMART_SUBSTITUTE,
          validation: {
            type: ValidationTypes.NUMBER,
          },
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return (
              ![propsData.disabledDateRule?.config?.disabledRule].includes(
                "offsetRange",
              ) || propsData.disabledDateRule?.config?.offsetWay == "front"
            );
          },
        },
        // 是否取交叉部分
        {
          helpText: "反选当前禁用日期",
          label: "反选",
          propertyName: "isInvertSelection",
          controlType: "SWITCH",
          isBindProperty: true,
          isTriggerProperty: false,
          dependencies: ["disabledDateRule"],
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "offsetRange",
            );
          },
        },
        // disabledDateFunction
        {
          propertyName: "customFunc",
          label: "自定义规则",
          controlType: "INPUT_TEXT",
          helpText: "自定义禁用日期规则",
          placeholderText: "请输入禁用日期函数",
          isJSConvertible: true,
          isBindProperty: true,
          isTriggerProperty: false,
          validation: {
            type: ValidationTypes.FUNCTION,
            params: {
              fn: (value: any) => {
                let disabledDateFn;

                try {
                  // 尝试解析用户代码
                  const userFunc = new Function(
                    "currentDate",
                    "return " + value,
                  );
                  // 如果解析成功,则执行用户函数并获取结果
                  disabledDateFn = userFunc;

                  return {
                    isValid: true,
                    parsed: value,
                    messages: [],
                  };
                } catch (error) {
                  // 如果解析失败,则说明用户输入的代码存在语法错误
                  console.error("日期选择 无效的函数代码:", error);
                  // 可以在这里显示错误提示或者使用默认的禁用日期函数
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
          dependencies: ["disabledDateRule"],
          hidden: (props: any, propertyPath: string) => {
            const propsData = getPropsData(props, propertyPath);
            return ![propsData.disabledDateRule?.config?.disabledRule].includes(
              "customFunc",
            );
          },
          // hidden: (props: any) =>
          //   ![props.disabledDateRule.config.disabledRule].includes(
          //     "customFunc",
          //   ),
        },
      ],
    },
  ],
  styleChildren: [],
};
