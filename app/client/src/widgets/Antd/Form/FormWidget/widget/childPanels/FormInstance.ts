import type { ValidationResponse } from "constants/WidgetValidation";
import { ValidationTypes } from "constants/WidgetValidation";
import { INSTANCE_INVALID_VALUE } from "widgets/Antd/Form/CONST/DEFAULT_CONFIG";

// 参照sourceDataArrayValidation，要求返回值可以是 undefined可以是数组，可以是对象
export function validateFieldsParamsValidation(
  options: unknown,
  props: any,
  _: any,
): ValidationResponse {
  const invalidResponse = {
    isValid: false,
    parsed: [],
    messages: [
      {
        name: "TypeError",
        message: "传入的值应该是数组、对象或无参数",
      },
    ],
  };

  if (typeof options == "number") {
    return {
      isValid: true,
      parsed: options,
      messages: [],
    };
  }
  try {
    if (_.isString(options)) {
      if ((options as string)?.includes?.("void 0")) {
        return {
          isValid: true,
          parsed: options,
          messages: [],
        };
      }
      options = JSON.parse(options as string);
    }

    if (Array.isArray(options) || _.isObject(options)) {
      return {
        isValid: true,
        parsed: options,
        messages: [],
      };
    } else {
      return invalidResponse;
    }
  } catch (e) {
    return invalidResponse;
  }
}
export const AntdFormInstanceProps = {
  hidden: () => true,
  sectionName: "表单实例方法相关",
  children: [
    {
      propertyName: "validateFieldsParams",
      label: "validateFieldsParams",
      helpText: "校验表单字段的参数",
      controlType: "JS_DATA",
      isJSConvertible: true,
      isBindProperty: false,
      isTriggerProperty: true,
      validation: {
        type: ValidationTypes.FUNCTION,
        params: {
          fn: validateFieldsParamsValidation,
        },
      },
    },
  ],
};
