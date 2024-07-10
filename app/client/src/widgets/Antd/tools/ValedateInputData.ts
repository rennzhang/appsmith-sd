type ValidationMessage = {
  name: string;
  message: string;
};

type ValidationResponse = {
  isValid: boolean;
  parsed: unknown[];
  messages: ValidationMessage[];
};

import _ from "lodash";

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
          message: `path:${valueField} must be unique. Duplicate values found`,
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
          message: `Invalid entry at index: ${index}. Value of key: ${labelField} is invalid: This value does not evaluate to type string or number`,
        };
        return false;
      }

      if (_.isNil(value) || typeof value !== valueType) {
        isValid = false;
        message = {
          name: "TypeError",
          message: "All value properties in options must have the same type",
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
          'This value does not evaluate to type Array<{ "label": "string", "value": "string" | number }>',
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
    parsed: [],
    messages: [
      {
        name: "TypeError",
        message: "传入的值应该是数组",
      },
    ],
  };
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
}

export const SelectValidator = {
  optionsCustomValidation: selectOptionsCustomValidation,
  defaultValueValidation,
};
