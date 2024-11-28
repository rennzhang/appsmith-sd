import type { ValidationResponse } from "constants/WidgetValidation";
import { get, isString, isArray, uniq, isPlainObject, map } from "lodash";
import { EVAL_VALUE_PATH } from "utils/DynamicBindingUtils";
import type { WidgetProps } from "widgets/BaseWidget";
import type { SelectWidgetProps } from "../Form/SelectWidget/widget";

export function getChildrenColumnNameOptions(widget: WidgetProps) {
  const targetPath =
    widget.dataTreePath?.split(".")?.slice(1, -1)?.join(".") || "";
  const propsData = get(widget, targetPath) || widget;
  let sourceData = targetPath
    ? get(propsData, `tableData`)
    : get(widget, `${EVAL_VALUE_PATH}.tableData`);
  const opt1 = get(
    widget,
    `${EVAL_VALUE_PATH}.${targetPath}.tableData`.replace("..", "."),
  );
  if (opt1 && Array.isArray(opt1)) {
    sourceData = opt1;
  }

  console.log("getChildrenColumnNameOptions", {
    widget,
    sourceData,
    targetPath,
    propsData,
  });

  // if (widget.type === "ANTD_PRO_TABLE_WIDGET") {
  //   sourceData =
  //     (widget?.__evaluation__?.evaluatedValues as any)?.orderedTableColumns?.[
  //       widget.editingColumnIndex
  //     ]?.options || [];
  // }

  let parsedValue: Record<string, unknown> | undefined = sourceData;

  if (isString(sourceData)) {
    try {
      parsedValue = JSON.parse(sourceData);
    } catch (e) {}
  }

  if (isArray(parsedValue)) {
    const result = uniq(
      parsedValue.reduce((keys, obj) => {
        if (isPlainObject(obj)) {
          Object.entries(obj).forEach(([key, value]) => {
            const valueIsArray = Array.isArray(value);

            const isChildrenKey =
              propsData.propertyName === "childrenColumnName";
            if (isChildrenKey && valueIsArray) {
              keys.push(key);
            } else if (!isChildrenKey && !valueIsArray) {
              keys.push(key);
            }
          });
        }
        return keys;
      }, []),
    ).map((d: unknown) => ({
      label: d,
      value: d,
    }));
    console.log("getChildrenColumnNameOptions result", result);

    return result;
  } else {
    return [];
  }
}
export const findUniqueValueKeys = (sourceData: any[] = []) => {
  console.log("findUniqueValueKeys sourceData", sourceData);

  if (!sourceData || sourceData.length === 0 || !Array.isArray(sourceData)) {
    return [];
  }

  // 获取第一行的所有 key
  const keys = Object.keys(sourceData[0]);

  // 过滤出值唯一且不是复杂数据类型的字段
  return keys.filter((key) => {
    // 获取该字段的所有值
    const values = map(sourceData, key);

    // 排除复杂数据类型
    const isComplexType = values.some(
      (value) => typeof value === "object" || Array.isArray(value),
    );
    if (isComplexType) {
      return false;
    }

    // 检查值是否唯一
    return uniq(values).length === sourceData.length;
  });
};

export function getDefaultValueOptions(widget: WidgetProps) {
  const targetPath =
    widget.dataTreePath?.split(".")?.slice(1, -1)?.join(".") || "";
  const propsData = get(widget, targetPath) || widget;
  let sourceData = targetPath
    ? get(propsData, `options`)
    : get(widget, `${EVAL_VALUE_PATH}.options`);

  const opt1 = get(
    widget,
    `${EVAL_VALUE_PATH}.${targetPath}.options`.replace("..", "."),
  );
  if (opt1 && Array.isArray(opt1)) {
    sourceData = opt1;
  }

  console.log("getDefaultValueOptions", {
    targetPath,
    propsData,
    widget,
    sourceData,
  });

  const labelKey = propsData.labelKey || "label";
  const valueKey = propsData.valueKey || "value";

  let parsedValue: Record<string, any>[] | undefined = sourceData;

  if (isString(sourceData)) {
    try {
      parsedValue = JSON.parse(sourceData);
    } catch (e) {
      parsedValue = [];
    }
  }

  return (parsedValue as any[])?.map?.((d: any) => {
    if (isPlainObject(d)) {
      return {
        label: d[labelKey],
        value: d[valueKey],
      };
    }
    return {
      label: d,
      value: d,
    };
  });
}

export function getLabelValueKeyOptions(
  widget: WidgetProps,
  type?: "value" | "label" | "options" | "children",
) {
  const targetPath =
    widget.dataTreePath?.split(".")?.slice(1, -1)?.join(".") || "";
  const propsData = get(widget, targetPath) || widget;
  let sourceData = targetPath
    ? get(propsData, `options`)
    : get(widget, `${EVAL_VALUE_PATH}.options`);
  const opt1 = get(
    widget,
    `${EVAL_VALUE_PATH}.${targetPath}.options`.replace("..", "."),
  );
  if (opt1 && Array.isArray(opt1)) {
    sourceData = opt1;
  }

  console.log("getLabelValueKeyOptions-----" + widget.dataTreePath, {
    dataTreePath: widget.dataTreePath,
    type,
    widget,
    sourceData,
    targetPath,
    propsData,
  });

  // if (widget.type === "ANTD_PRO_TABLE_WIDGET") {
  //   sourceData =
  //     (widget?.__evaluation__?.evaluatedValues as any)?.orderedTableColumns?.[
  //       widget.editingColumnIndex
  //     ]?.options || [];
  // }

  let parsedValue: any = sourceData || [];

  if (isString(sourceData)) {
    try {
      parsedValue = JSON.parse(sourceData);
    } catch (e) {
      return [];
    }
  }
  if (!Array.isArray(parsedValue)) {
    return [];
  }
  let optKeys: string[] = [];
  if (type === "value") {
    optKeys = findUniqueValueKeys(parsedValue as any[]);
  } else if (type === "label") {
    optKeys = Object.keys(parsedValue?.[0] || {});
  } else if (type === "children") {
    optKeys = uniq(
      parsedValue?.reduce((keys, obj) => {
        if (isPlainObject(obj)) {
          Object.entries(obj).forEach(([key, value]) => {
            const valueIsArray = Array.isArray(value);

            const isChildrenKey =
              type === "children" || propsData.propertyName === "childrenKey";
            if (isChildrenKey && valueIsArray) {
              keys.push(key);
            } else if (!isChildrenKey && !valueIsArray) {
              keys.push(key);
            }
          });
        }
        return keys;
      }, []),
    );
  }
  const result = optKeys.map((d: unknown) => ({
    label: d,
    value: d,
  }));

  return result;
}

export function getLabelValueAdditionalAutocompleteData(props: WidgetProps) {
  const keys = getLabelValueKeyOptions(props);

  return {
    item: keys
      .map((d) => d.label)
      .reduce((prev: Record<string, string>, curr: unknown) => {
        prev[curr as string] = "";

        return prev;
      }, {}),
  };
}

export function defaultOptionValueValidation(
  value: unknown,
  props: SelectWidgetProps,
  _: any,
  __: any,
  propertyPath: string,
): ValidationResponse {
  // const propertyPathChunks = propertyPath?.split(".") || [];
  // const parentPath = propertyPathChunks.slice(0, -1).join(".");
  // const propsData = _.get(props, parentPath) || props;
  let isValid;
  let parsed;
  let message = { name: "", message: "" };
  const isServerSideFiltered = props.serverSideFiltering;
  // TODO: validation of defaultOption is dependent on serverSideFiltering and options, this property should reValidated once the dependencies change
  //this issue is been tracked here https://github.com/appsmithorg/appsmith/issues/15303
  let options = props.options;
  /*
   * Function to check if the object has `label` and `value`
   */
  const hasLabelValue = (obj: any) => {
    return (
      _.isPlainObject(value) &&
      obj.hasOwnProperty("label") &&
      obj.hasOwnProperty("value") &&
      _.isString(obj.label) &&
      (_.isString(obj.value) || _.isFinite(obj.value))
    );
  };

  /*
   * When value is "{label: 'green', value: 'green'}"
   */
  if (typeof value === "string") {
    try {
      const parsedValue = JSON.parse(value);
      if (_.isObject(parsedValue)) {
        value = parsedValue;
      }
    } catch (e) {}
  }

  if (_.isString(value) || _.isFinite(value) || hasLabelValue(value)) {
    /*
     * When value is "", "green", 444, {label: "green", value: "green"}
     */
    isValid = true;
    parsed = value;
  } else {
    isValid = false;
    parsed = undefined;
    message = {
      name: "TypeError",
      message:
        'value does not evaluate to type: string | number | { "label": "label1", "value": "value1" }',
    };
  }

  if (isValid && !_.isNil(parsed) && parsed !== "") {
    if (!Array.isArray(options) && typeof options === "string") {
      try {
        const parsedOptions = JSON.parse(options);
        if (Array.isArray(parsedOptions)) {
          options = parsedOptions;
        } else {
          options = [];
        }
      } catch (e) {
        options = [];
      }
    }
    const parsedValue = (parsed as any).hasOwnProperty("value")
      ? (parsed as any).value
      : parsed;
    const valueIndex = _.findIndex(
      options,
      (option: any) => option.value === parsedValue,
    );

    if (valueIndex === -1) {
      if (!isServerSideFiltered) {
        isValid = false;
        message = {
          name: "ValidationError",
          message: `Default value is missing in options. Please update the value.`,
        };
      } else {
        if (!hasLabelValue(parsed)) {
          isValid = false;
          message = {
            name: "ValidationError",
            message: `Default value is missing in options. Please use {label : <string | num>, value : < string | num>} format to show default for server side data.`,
          };
        }
      }
    }
  }
  return {
    isValid,
    parsed,
    messages: [message],
  };
}
