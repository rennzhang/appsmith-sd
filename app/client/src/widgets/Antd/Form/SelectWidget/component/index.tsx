import { memo, useEffect, useMemo, useState } from "react";
import "rc-tree-select/assets/index.less";
import type { DefaultValueType } from "rc-tree-select/lib/interface";
import type { RenderMode, TextSize } from "constants/WidgetConstants";
import { AntdLabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { SelectProps } from "antd";
import { ConfigProvider, Select, Spin } from "antd";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { SizeType } from "antd/es/config-provider/SizeContext";
import { omit, isEqual } from "lodash";
import { simpleDiff } from "widgets/Antd/tools/tool";

export interface SelectComponentProps {
  animateLoading?: boolean;
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  widgetName: string;
  disabled?: boolean;
  loading?: boolean;
  placeholderText?: string;
  onOptionSearch?: string;
  onValueChange?: string;
  updateSelectInfo?: (selectInfo: any) => void;
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  labelTooltip?: string;
  compactMode?: boolean;
  width?: number;
  isValid?: boolean;
  isDynamicHeightEnabled?: boolean;
  borderRadius: string;
  boxShadow?: string;
  colorPrimary?: string;
  widgetId?: string;
  filterText?: string;
  renderMode?: RenderMode;
  options?: SelectProps["options"];
  required?: boolean;
  mode?: SelectProps["mode"];
  errorMessage: string;
  defaultExpandAll?: boolean;
  controlSize?: SizeType;
  allowClear?: boolean;
  defaultValue?: DefaultValueType;
  maxTagCount?: number;
  maxTagTextLength?: number;
  showSearch?: boolean;
  value?: DefaultValueType;
  tokenSeparators?: string[];
  handleSearch?: (value: string) => void;
  handleValueChange?: (value: any, label: any) => void;
  accessor?: string | string[];
}

function SelectComponent(props: SelectComponentProps): JSX.Element {
  const {
    accessor,
    allowClear,
    animateLoading,
    borderRadius,
    boxShadow,
    // expandAll,
    colorPrimary,
    compactMode,
    controlSize,
    defaultExpandAll,
    defaultValue,
    disabled,
    errorMessage,
    filterText,
    handleValueChange,
    isDynamicHeightEnabled,
    isValid,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    loading,
    maxTagCount,
    maxTagTextLength,
    onValueChange,
    options,
    placeholderText,
    renderMode,
    required,
    showSearch,
    tokenSeparators,
    updateSelectInfo,
    widgetId,
    widgetName,
    // height
  } = props;

  const [value, setValue] = useState<any>();
  useEffect(() => {
    setValue(props.value);
    // setValue(
    //   props.value
    //     ? { value: (props.value as any) || undefined, label: "" }
    //     : undefined,
    // );
  }, [props.value]);

  useEffect(() => {
    setValue(defaultValue);

    // if (defaultValue) {
    //   setValue(
    //     defaultValue
    //       ? { value: (defaultValue as any) || undefined, label: "" }
    //       : undefined,
    //   );
    // }
  }, [defaultValue]);
  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const validateProps = useMemo<ProFormItemProps>(() => {
    const data: ProFormItemProps = {
      required,
      rules: [
        {
          required: required,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
          validator: async (_rule, value) => {
            if (required) {
              if (Array.isArray(value) && value.length === 0) {
                return Promise.reject(errorMessage);
              }
              if (!Array.isArray(value) && !value) {
                return Promise.reject(errorMessage);
              }
            }
            return Promise.resolve();
          },
        },
      ],
    };

    return data;
  }, [required, errorMessage]);

  const fieldNamesValue = useMemo(() => {
    const defaultFieldNames = {
      value: props.valueKey || "value",
      label: props.labelKey || "label",
      children: props.childrenKey || "children",
    };
    return defaultFieldNames;
  }, [props.valueKey, props.labelKey, props.childrenKey]);

  const handleFilter: SelectProps["filterOption"] = (inputValue, node) => {
    const labelName = fieldNamesValue.label as string;
    const valueName = fieldNamesValue.value as string;
    if (
      node?.[labelName].includes(inputValue) ||
      String(node?.[valueName]).includes(String(inputValue))
    ) {
      return true;
    }

    return false;
  };

  let changeExtraInfo = {} as any;

  const onSelect: SelectProps["onSelect"] = (
    selectedKeysValue,
    triggerNode,
  ) => {
    console.group("Antd 选择器组件 onSelect");
    console.log("onSelect", selectedKeysValue);
    console.log("triggerNode", triggerNode);
    console.groupEnd();

    changeExtraInfo = {
      ...changeExtraInfo,
      triggerNode,
    };
    updateSelectInfo?.(changeExtraInfo);
  };

  const onChange: SelectProps["onChange"] = async (
    selectedKeysValue,
    labelList,
  ) => {
    const { mode } = props;
    const isMultiple = mode === "multiple" || mode === "tags";
    const value = isMultiple
      ? selectedKeysValue.map(({ value }: any) => value)
      : selectedKeysValue?.value;

    const label = isMultiple
      ? selectedKeysValue.map(({ label }: any) => label)
      : selectedKeysValue?.label;

    setValue(selectedKeysValue);
    console.group("Antd 选择器组件 onChange");
    console.log("onChange", selectedKeysValue);
    console.log(" value", value);
    console.log(" label", label);

    console.groupEnd();

    changeExtraInfo = {
      ...changeExtraInfo,
    };

    handleValueChange?.(value, label);
  };

  const handleSearch = (val: string) => {
    props.handleSearch?.(val || "");
  };

  console.group("Antd 选择器组件");
  console.log("Antd 选择器组件 props", props);
  console.log("Antd 选择器组件 value", value);

  console.groupEnd();
  return (
    <AntdFormItemContainer
      boxShadow={boxShadow}
      className="antd-radio-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: labelTextColor,
              labelFontSize: (labelTextSize as unknown as number) || 0,
            },
            Input: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
            },
            Select: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
              colorPrimary: colorPrimary,
            },
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={accessor || widgetName}
          tooltip={labelTooltip}
          {...validateProps}
          {...colLayoutMemo}
        >
          <Spin spinning={animateLoading}>
            <Select
              allowClear={allowClear}
              defaultValue={defaultValue ?? undefined}
              disabled={disabled}
              fieldNames={fieldNamesValue}
              filterOption={handleFilter}
              maxTagCount={maxTagCount}
              maxTagTextLength={maxTagTextLength}
              mode={props.mode}
              onChange={onChange}
              onSearch={handleSearch}
              onSelect={onSelect}
              options={options}
              placeholder={placeholderText}
              showSearch={showSearch}
              size={controlSize}
              tokenSeparators={tokenSeparators}
              value={value ?? undefined}
              labelInValue
              // listHeight={height}
            />
          </Spin>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}
const arePropsEqual = (
  prevProps: SelectComponentProps,
  nextProps: SelectComponentProps,
) => {
  const _prevProps = omit(prevProps, "inputRef");
  const _nextProps = omit(nextProps, "inputRef");
  // 开发环境打印diff;
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(_prevProps, _nextProps);
    diffProps &&
      console.log("AntdSelect memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
        isSame: isEqual(_prevProps, _nextProps),
      });
  }

  return isEqual(_prevProps, _nextProps);
};

export default memo(SelectComponent, arePropsEqual);

// export default SelectComponent;
