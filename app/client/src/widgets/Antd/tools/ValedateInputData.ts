type ValidationMessage = {
  name: string;
  message: string;
};
import type { ValidationResponse } from "constants/WidgetValidation";

import _ from "lodash";
export function validationNumberOrUndefined(value: any, props: any, _?: any) {
  if (_?.isNil(value) || value === "")
    return {
      isValid: true,
      parsed: undefined,
      messages: [{ name: "", message: "" }],
    };

  if (!_?.isNumber(parseInt(value)))
    return {
      isValid: false,
      parsed: undefined,
      messages: [{ name: "TypeError", message: "必须为数字" }],
    };

  return {
    isValid: true,
    parsed: Number(value),
    messages: [{ name: "", message: "" }],
  };
}
export function selectOptionsCustomValidation(
  options: any,
  props: any,
  _: any,
): ValidationResponse {
  const labelField = props.fieldNames?.label || "label";
  const valueField = props.fieldNames?.value || "value";
  const optionsField = props.fieldNames?.options || "options";

  const validateOptions = (opts: any[]): ValidationResponse => {
    const uniqueValues = new Set();
    let valueType = "";
    let isValid = true;
    let message = { name: "", message: "" };

    const checkOption = (option: any, index: number) => {
      const label = option[labelField];
      const value = option[valueField];
      const subOptions = option[optionsField];

      if (subOptions) {
        return validateOptions(subOptions);
      }

      if (!valueType) {
        valueType = typeof value;
      }

      if (uniqueValues.has(value)) {
        isValid = false;
        message = {
          name: "ValidationError",
          message: `路径:${valueField} 必须唯一。发现重复值`,
        };
        return false;
      }
      uniqueValues.add(value);

      if (
        _.isNil(label) ||
        label === "" ||
        (typeof label !== "string" && typeof label !== "number")
      ) {
        isValid = false;
        message = {
          name: "ValidationError",
          message: `索引 ${index} 处的条目无效。键 ${labelField} 的值无效：此值不是字符串或数字类型`,
        };
        return false;
      }

      if (_.isNil(value) || typeof value !== valueType) {
        isValid = false;
        message = {
          name: "TypeError",
          message: "选项中所有 value 属性必须具有相同的类型",
        };
        return false;
      }

      return true;
    };

    for (let i = 0; i < opts.length; i++) {
      if (!checkOption(opts[i], i)) {
        return {
          isValid,
          parsed: [],
          messages: [message],
        };
      }
    }

    return {
      isValid,
      parsed: opts,
      messages: [message],
    };
  };

  const invalidResponse = {
    isValid: false,
    parsed: [],
    messages: [
      {
        name: "TypeError",
        message:
          '此值不符合 Array<{ "label": "string", "value": "string" | number }> 类型',
      },
    ],
  };

  try {
    if (_.isString(options)) {
      options = JSON.parse(options);
    }

    if (Array.isArray(options)) {
      return validateOptions(options);
    } else {
      return invalidResponse;
    }
  } catch (e) {
    return invalidResponse;
  }
}
export function defaultValueValidation(
  _value: any,
  props: any,
  _: any,
): ValidationResponse {
  const invalidResponse = {
    isValid: false,
    parsed: _value,
    messages: [
      {
        name: "TypeError",
        message: "请提供数组格式数据",
      },
    ],
  };
  try {
    if (props.mode == "void 0") {
      return {
        isValid: true,
        parsed: _value,
        messages: [],
      };
    }

    if (!_value) {
      return {
        isValid: true,
        parsed: [],
        messages: [],
      };
    }
    try {
      if (_.isString(_value)) {
        _value = JSON.parse(_value as string);
      }

      if (Array.isArray(_value) || _.isObject(_value)) {
        return {
          isValid: true,
          parsed: _value,
          messages: [],
        };
      } else {
        return invalidResponse;
      }
    } catch (e) {
      return invalidResponse;
    }
  } catch (error) {}
  return invalidResponse;
}

const dateDefaultValueValidation = (value: any, props: any) => {
  const defaultValue = value || "";

  console.log(
    "dateDefaultValueValidation defaultValue",
    defaultValue,
    props.isRangePicker,
  );
  if (props.isRangePicker) {
    let parsed;
    let isValid;
    let isArray;
    let errMessage;
    try {
      parsed = JSON.parse(defaultValue || "[]");
    } catch (error) {
      isValid = false;
      parsed = defaultValue;
      errMessage = "JSON 解析错误, 请提供正确的 JSON 格式数据";
      return {
        isValid,
        parsed,
        messages: [
          {
            name: "TypeError",
            message: errMessage,
          },
        ],
      };
    }
    isArray = isValid = Array.isArray(parsed);
    errMessage = isArray ? "" : "日期范围选择模式下，应提供数组格式数据";
    // 不能超过两个，并且每个元素都是字符串
    if (isValid) {
      isValid = parsed.length <= 2;
      if (isValid) {
        isValid = parsed.every(
          (item: any) =>
            typeof item === "string" || item === null || item === undefined,
        );
        errMessage = isValid ? "" : "请提供 YYYY-MM-dd 格式数据，最大长度为 2";
      }
    }

    return {
      isValid,
      parsed: defaultValue,
      messages: isValid
        ? []
        : [
            {
              name: "TypeError",
              message: errMessage,
            },
          ],
    };
  }

  const isValidPlaceholder = typeof defaultValue === "string";
  return {
    isValid: isValidPlaceholder,
    parsed: defaultValue,
    messages: isValidPlaceholder
      ? []
      : [
          {
            name: "TypeError",
            message: "请输入占位文本",
          },
        ],
  };
};
export function labelKeyValidation1(
  value: unknown,
  props: any,
  _?: any,
  __?: any,
  path?: string,
): ValidationResponse {
  try {
    console.log("labelKeyValidation", { value, props, path });
    return {
      parsed: [],
      isValid: true,
      messages: [],
    };
  } catch (error) {
    return {
      parsed: [],
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `value does not evaluate to type: string | Array<string>`,
        },
      ],
    };
  }
}
export function labelKeyValidation(
  value: unknown,
  props: any,
  _?: any,
  __?: any,
  path?: string,
): ValidationResponse {
  const _value = value || _.get(props, path);
  let sourceData: any = [];

  let keys: any[] = [];
  let parsedValue: any[] | undefined;
  try {
    sourceData = props.options;
    if (props.type === "ANTD_PRO_TABLE_WIDGET") {
      sourceData =
        props.orderedTableColumns?.[props.editingColumnIndex]?.options || [];
    }
    parsedValue = sourceData;
    if (_.isString(sourceData)) {
      try {
        parsedValue = JSON.parse(sourceData);
      } catch (e) {}
    }
    if (_.isArray(parsedValue)) {
      keys = _.uniq(
        parsedValue?.reduce((_keys, obj) => {
          if (_.isPlainObject(obj)) {
            Object.keys(obj).forEach((d) => keys.push(d));
          }

          return keys;
        }, []),
      ).map((d: unknown) => ({
        label: d,
        value: d,
      }));
    }
    console.log("labelKeyValidation", {
      parsedValue,
      _value,
      path,
      props,
      keys,
    });
    /*
     * Validation rules
     *  1. Can be a string.
     *  2. Can be an Array of string, number, boolean (only for option Value).
     */

    if (_value === "" || _.isNil(_value)) {
      return {
        parsed: "",
        isValid: false,
        messages: [
          {
            name: "ValidationError",
            message: `${path}: 值必须是字符串`,
          },
        ],
      };
    }

    if (!keys.find((key) => key.label === _value)) {
      return {
        parsed: "",
        isValid: false,
        messages: [
          {
            name: "ValidationError",
            message: `${path}: 值必须是源数据的键值之一`,
          },
        ],
      };
    }
    // children 必须是数组，判断parsedValue数据中children字段是否为数组

    if (path?.includes("children")) {
      let childrenIsValid = true;
      parsedValue?.forEach((item) => {
        if (item.hasOwnProperty("children") && !Array.isArray(item.children)) {
          childrenIsValid = false;
        }
      });
      console.log("labelKeyValidation childrenIsValid", {
        childrenIsValid,
        value,
        props,
        keys,
      });

      if (!childrenIsValid) {
        return {
          parsed: _value,
          isValid: false,
          messages: [
            {
              name: "ValidationError",
              message: `${path}: children 字段必须是数组`,
            },
          ],
        };
      }
    }
  } catch (error) {
    // 添加错误处理
    console.error("labelKeyValidation 错误:", error);
  }

  const isValid = parsedValue?.every(
    (d: unknown, i: number, arr: unknown[]) => arr.indexOf(d) === i,
  );

  return {
    parsed: _value,
    isValid: !!isValid,
    messages: isValid
      ? []
      : [
          {
            name: "ValidationError",
            message: `${path}: 发现重复值，值必须唯一`,
          },
        ],
  };
}

export const SelectValidator = {
  optionsCustomValidation: selectOptionsCustomValidation,
  defaultValueValidation,
};

export const DatePickerValidator = {
  defaultValueValidation: dateDefaultValueValidation,
};
