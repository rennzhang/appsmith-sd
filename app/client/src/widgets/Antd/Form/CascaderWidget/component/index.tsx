import type { ReactNode } from "react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "rc-tree-select/assets/index.less";
import type { DefaultValueType } from "rc-tree-select/lib/interface";
import type { DefaultOptionType } from "rc-tree-select/lib/TreeSelect";
import styled from "styled-components";
import type { RenderMode, TextSize } from "constants/WidgetConstants";
import type { Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { CascaderProps } from "antd";
import { ConfigProvider, Cascader } from "antd";
import type { InputStatus } from "antd/es/_util/statusUtils";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { SizeType } from "antd/es/config-provider/SizeContext";

export interface CascaderComponentProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  widgetName: string;
  defaultValue?: CascaderProps["value"];
  allowClear?: boolean;
  disabled?: boolean;
  placeholder?: string;
  loading?: boolean;
  dropdownStyle?: React.CSSProperties;
  onOptionChange?: string;
  onChange?: (value?: DefaultValueType, labelList?: ReactNode[]) => void;
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  onDropdownOpen?: () => void;
  onDropdownClose?: () => void;
  labelStyle?: string;
  labelTooltip?: string;
  compactMode?: boolean;
  width?: number;
  isValid?: boolean;
  isDynamicHeightEnabled?: boolean;
  borderRadius?: string;
  boxShadow?: string;
  colorPrimary?: string;
  widgetId?: string;
  filterText?: string;
  renderMode?: RenderMode;
  options?: DefaultOptionType[];
  required?: boolean;
  isHoverExpand?: boolean;
  isSearchable?: boolean;
  status?: InputStatus;
  selectedOption?: CascaderProps["value"];
  isMultiple?: boolean;
  errorMessage: string;
  controlSize?: SizeType;
  onSearch?: (value: string) => void;
  onCascaderSearch?: string;
  value?: CascaderProps["value"];
}

function CascaderComponent(props: CascaderComponentProps): JSX.Element {
  console.log("级联选择 props", props);

  const {
    allowClear,
    borderRadius,
    boxShadow,
    colorPrimary,
    compactMode,
    controlSize,
    defaultValue,
    disabled,
    // expandAll,
    errorMessage,
    filterText,
    isDynamicHeightEnabled,
    isHoverExpand,
    isSearchable,
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
    onChange,
    onDropdownClose,
    onDropdownOpen,
    options,
    placeholder,
    renderMode,
    required,
    selectedOption,
    status,
    widgetId,
    widgetName,
  } = props;

  const [selectedValue, setSelectedValue] = useState<CascaderProps["value"]>(
    [],
  );

  useEffect(() => {
    setSelectedValue(props.value || []);
  }, [props.value]);

  useEffect(() => {
    if (defaultValue) {
      setSelectedValue(defaultValue);
    }
  }, [defaultValue]);

  useEffect(() => {
    setSelectedValue(selectedOption || []);
  }, [selectedOption]);

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
    const props: ProFormItemProps = {
      required,
      rules: [
        {
          type: "array",
          required: required,
          message: errorMessage,
          validateTrigger: ["onChange", "onBlur"],
        },
      ],
    };

    return props;
  }, [required, errorMessage]);
  const onSelectionChange = useCallback((value?: any[], labelList?: any[]) => {
    console.log("级联选择 onSelectionChange value", value, labelList);
    setSelectedValue(value);
    onChange?.(value, labelList || []);
  }, []);

  const fieldNamesValue = useMemo(() => {
    const defaultFieldNames = {
      value: props.valueKey || "value",
      label: props.labelKey || "label",
      children: props.childrenKey || "children",
    };
    return defaultFieldNames;
  }, [props.valueKey, props.labelKey, props.childrenKey]);

  const handleFilter = (inputValue: string, path: DefaultOptionType[]) =>
    path.some(
      (option) =>
        (option.label as string)
          .toLowerCase()
          .indexOf(inputValue.toLowerCase()) > -1,
    );
  console.log("AntdCascaderComponent", {
    options,
    selectedValue,
    props,
  });

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
              colorPrimary: colorPrimary,
            },
            Select: {
              colorPrimary: colorPrimary,
              borderRadius: (borderRadius as unknown as number) || 0,
            },
            Cascader: {
              borderRadius: (borderRadius as unknown as number) || 0,
              boxShadow: boxShadow,
              colorPrimary: colorPrimary,
            },
            Dropdown: {
              colorPrimary: colorPrimary,
            },
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={widgetName}
          tooltip={labelTooltip}
          {...validateProps}
          {...colLayoutMemo}
        >
          <Cascader
            allowClear={allowClear}
            changeOnSelect
            disabled={disabled}
            expandTrigger={isHoverExpand ? "hover" : "click"}
            fieldNames={fieldNamesValue}
            multiple={props.isMultiple}
            onChange={onSelectionChange}
            onDropdownVisibleChange={(open) =>
              open ? onDropdownOpen?.() : onDropdownClose?.()
            }
            onSearch={(value) => props.onSearch?.(value)}
            options={options}
            placeholder={(placeholder as any) || "请选择"}
            showSearch={isSearchable ? { filter: handleFilter } : false}
            size={controlSize}
            status={status}
            style={{
              marginBottom: 0,
            }}
            value={selectedValue}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export default CascaderComponent;
