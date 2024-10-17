import type { ValidationResponse } from "constants/WidgetValidation";
import { get, isString, isArray, uniq, isPlainObject } from "lodash";
import { EVAL_VALUE_PATH } from "utils/DynamicBindingUtils";
import type { WidgetProps } from "widgets/BaseWidget";
import type { SelectWidgetProps } from "../Form/SelectWidget/widget";

export function getDefaultValueOptions(widget: WidgetProps) {
  let sourceData = get(widget, `${EVAL_VALUE_PATH}.options`);
  let jsonFormPath = "";
  if (widget.type === "ANTD_JSON_FORM_WIDGET") {
    // "AntdJSONForm1.schema.__root_schema__.children.name.defaultValue" => schema.__root_schema__.children.name 截取第一个点和最后一个点之前的字符
    jsonFormPath =
      widget.dataTreePath?.split(".")?.slice(1, -1)?.join(".") || "";
    sourceData = get(widget, `${jsonFormPath}.options`);
  }

  console.log("getDefaultValueOptions", widget, jsonFormPath);

  let labelKey = widget.labelKey || "label";
  let valueKey = widget.valueKey || "value";
  if (widget.type === "ANTD_PRO_TABLE_WIDGET") {
    sourceData =
      (widget?.__evaluation__?.evaluatedValues as any)?.orderedTableColumns?.[
        widget.editingColumnIndex
      ]?.options || [];

    labelKey =
      widget.primaryColumns[widget.editingColumnId].labelKey || "label";
    valueKey =
      widget.primaryColumns[widget.editingColumnId].valueKey || "value";
  }
  let parsedValue: Record<string, any>[] | undefined = sourceData;

  if (isString(sourceData)) {
    try {
      parsedValue = JSON.parse(sourceData);
    } catch (e) {}
  }

  return (parsedValue as any[])?.map((d: any) => {
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

export function getLabelValueKeyOptions(widget: WidgetProps) {
  console.log("getLabelValueKeyOptions", widget);

  let sourceData = get(widget, `${EVAL_VALUE_PATH}.options`);
  let jsonFormPath = "";
  if (widget.type === "ANTD_JSON_FORM_WIDGET") {
    // "AntdJSONForm1.schema.__root_schema__.children.name.defaultValue" => schema.__root_schema__.children.name 截取第一个点和最后一个点之前的字符
    jsonFormPath =
      widget.dataTreePath?.split(".")?.slice(1, -1)?.join(".") || "";
    sourceData = get(widget, `${jsonFormPath}.options`);
  }

  if (widget.type === "ANTD_PRO_TABLE_WIDGET") {
    sourceData =
      (widget?.__evaluation__?.evaluatedValues as any)?.orderedTableColumns?.[
        widget.editingColumnIndex
      ]?.options || [];
  }

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
              "childrenKey" in widget || widget.propertyName === "childrenKey";
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
    console.log("getLabelValueKeyOptions result", result);

    return result;
  } else {
    return [];
  }
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
