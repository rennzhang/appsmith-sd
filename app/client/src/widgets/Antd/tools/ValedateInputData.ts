type ValidationMessage = {
  name: string;
  message: string;
};
import type { ValidationResponse } from "constants/WidgetValidation";

import type { LoDashStatic } from "lodash";
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
export function childrenKeyValidation(
  value: unknown,
  props: any,
  _?: any,
  __?: any,
  path?: string,
): ValidationResponse {
  if (props.type === "ANTD_JSON_FORM_WIDGET") {
    return {
      parsed: value,
      isValid: true,
      messages: [],
    };
  }
  const targetPath = path?.split(".").slice(0, -1).join(".");
  const propsData = _.get(props, targetPath || "") || props;
  const _value = value || _.get(props, path || "");

  let sourceData: any = propsData.options;
  console.log("childrenKeyValidation", propsData.options, {
    sourceData,
    value,
    _value,
    path,
    props,
    propsData,
  });
  let parsedValue: any[] | undefined;
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

  // children 必须是数组，判断parsedValue数据中children字段是否为数组
  if (!_.isArray(parsedValue)) {
    return {
      parsed: _value,
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `${path}: 源数据必须是数组`,
        },
      ],
    };
  }

  let childrenIsValid = true;
  parsedValue?.forEach((item) => {
    if (item.hasOwnProperty("children") && !_.isArray(item.children)) {
      childrenIsValid = false;
    }
  });

  console.log("childrenKeyValidation childrenIsValid", {
    childrenIsValid,
    value,
    props,
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

  // 验证children数组中的每个元素是否都有label和value属性
  const isValidChildren = parsedValue?.every((item) => {
    if (item.hasOwnProperty("children")) {
      return item.children.every(
        (child: any) =>
          child.hasOwnProperty(propsData.labelKey) &&
          child.hasOwnProperty(propsData.valueKey),
      );
    }
    return true;
  });

  if (!isValidChildren) {
    return {
      parsed: _value,
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `${path}: children 数组中的每个元素都必须包含 label 和 value 属性`,
        },
      ],
    };
  }

  return {
    parsed: _value,
    isValid: true,
    messages: [],
  };
}

export function labelKeyValidation(
  value: unknown,
  props: any,
  _: LoDashStatic,
  __: any,
  path?: string,
) {
  const _value = value || _.get(props, path || "");

  /*
   * Validation rules
   *  1. Can be a string.
   *  2. Can be an Array of string, number, boolean (only for option Value).
   */
  console.log("labelKeyValidation", { value, _value, props, path });

  if (_value === "" || _.isNil(_value)) {
    return {
      parsed: "",
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `值的类型必须是字符串或字符串数组`,
        },
      ],
    };
  }

  if (_.isString(_value)) {
    return {
      parsed: _value,
      isValid: true,
      messages: [],
    };
  } else if (_.isArray(_value)) {
    const errorIndex = _value.findIndex((d) => !_.isString(d));

    return {
      parsed: errorIndex === -1 ? _value : [],
      isValid: errorIndex === -1,
      messages:
        errorIndex !== -1
          ? [
              {
                name: "ValidationError",
                message: `索引 ${errorIndex} 处的值无效。该值必须是字符串类型`,
              },
            ]
          : [],
    };
  } else {
    return {
      parsed: "",
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: "值的类型必须是字符串或字符串数组",
        },
      ],
    };
  }
}
export function validationDefaultWithOptionComponent(
  value: unknown,
  props: any,
  _: LoDashStatic,
  __?: any,
  path?: string,
) {
  //取 path 第一个点和最后一个点之间的内容
  const targetPath = path?.split(".").slice(0, -1).join(".");
  const propsData = _.get(props, targetPath || "") || props;

  if (
    value &&
    _.isArray(propsData.options) &&
    propsData.options?.length > 0 &&
    !propsData.options.find((item: any) => item[propsData.valueKey] === value)
  ) {
    return {
      parsed: value,
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `默认值必须存在于源数据中`,
        },
      ],
    };
  }

  return {
    parsed: value,
    isValid: true,
    messages: [],
  };
}

export function valueKeyValidation(
  value: unknown,
  props: any,
  _: LoDashStatic,
  __?: any,
  path?: string,
) {
  const _value = value || _.get(props, path || "");

  if (!path?.includes(props.editingColumnId)) {
    return {
      parsed: _value,
      isValid: true,
    };
  }

  console.log("valueKeyValidation", { value, _value, props, path });
  /*
   * Validation rules
   *  1. Can be a string.
   *  2. Can be an Array of string, number, boolean (only for option Value).
   *  3. should be unique.
   */

  if (_value === "" || _.isNil(_value)) {
    return {
      parsed: "",
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `值的类型必须是字符串或数字（${path}）`,
        },
      ],
    };
  }

  let options: unknown[] = [];

  if (_.isString(_value)) {
    let sourceData: any[] = _.isArray(props.options) ? props.options : [];
    if (props.type === "ANTD_PRO_TABLE_WIDGET") {
      sourceData =
        props.orderedTableColumns?.[props.editingColumnIndex]?.options || [];
    }

    const keys = sourceData.reduce((keys, curr) => {
      Object.keys(curr).forEach((d) => keys.add(d));

      return keys;
    }, new Set());

    console.log("valueKeyValidation keys", {
      value,
      _value,
      props,
      path,
      keys,
    });

    if (!keys.has(_value)) {
      return {
        parsed: _value,
        isValid: false,
        messages: [
          {
            name: "ValidationError",
            message: `值键必须存在于源数据中（${path}）`,
          },
        ],
      };
    }

    options = sourceData.map((d: Record<string, unknown>) => d[_value]);
  } else if (_.isArray(_value)) {
    const errorIndex = _value.findIndex(
      (d) =>
        !(_.isString(d) || (_.isNumber(d) && !_.isNaN(d)) || _.isBoolean(d)),
    );

    if (errorIndex !== -1) {
      return {
        parsed: [],
        isValid: false,
        messages: [
          {
            name: "ValidationError",
            message: `索引 ${errorIndex} 处的值无效。该值必须是字符串、数字或布尔类型（${path}）`,
          },
        ],
      };
    } else {
      options = _value;
    }
  } else {
    return {
      parsed: "",
      isValid: false,
      messages: [
        {
          name: "ValidationError",
          message: `值的类型必须是字符串或字符串、数字、布尔值的数组（${path}）`,
        },
      ],
    };
  }

  const isValid = options.every(
    (d: unknown, i: number, arr: unknown[]) => arr.indexOf(d) === i,
  );

  return {
    parsed: _value,
    isValid: isValid,
    messages: isValid
      ? []
      : [
          {
            name: "ValidationError",
            message: `发现重复值，值必须唯一（${path}）`,
          },
        ],
  };
}

export const SelectValidator = {
  defaultValueValidation,
};

export const DatePickerValidator = {
  defaultValueValidation: dateDefaultValueValidation,
};
