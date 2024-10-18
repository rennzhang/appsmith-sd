import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
// import { RadioGroup, Radio, Classes } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { RadioOption } from "../constants";
import type { ButtonProps, RadioChangeEvent } from "antd";
import { ConfigProvider, Radio, Space } from "antd";
import {
  ProFormItem,
  ProFormItemProps,
  ProFormRadio,
} from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { TextSize, TextSizes } from "constants/WidgetConstants";
export interface RadioGroupContainerProps {
  compactMode: boolean;
  labelPosition?: AntdLabelPosition;
}

export interface StyledRadioGroupProps {
  alignment: Alignment;
  compactMode: boolean;
  height?: number;
  isInline: boolean;
  labelPosition?: AntdLabelPosition;
  optionCount: number;
  colorPrimary: string;
  isDynamicHeightEnabled?: boolean;
  children?: React.ReactNode;
}

function RadioGroupComponent(props: RadioGroupComponentProps) {
  const {
    accessor,
    alignment,
    animateLoading,
    colorPrimary,
    compactMode,
    controlSize,
    defaultValue,
    disabled,
    height,
    isDynamicHeightEnabled,
    isInline,
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
    options,
    radioButtonStyle,
    radioType,
    required,
    widgetName,
  } = props;

  const [value, setValue] = useState(props.value);
  useEffect(() => {
    setValue(props.value);
  }, [props.value]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  const fieldNamesValue = useMemo(() => {
    const defaultFieldNames = {
      value: props.valueKey || "value",
      label: props.labelKey || "label",
      children: props.childrenKey || "children",
    };
    return defaultFieldNames;
  }, [props.valueKey, props.labelKey, props.childrenKey]);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const handleChange = (e: RadioChangeEvent) => {
    console.log("e.target.value", e);
    setValue(e.target.value);
    onChange?.(e.target.value);
  };

  const RadioComponent = useMemo(() => {
    return options.map((option) => {
      const { label, value } = fieldNamesValue;
      return (
        <Radio key={option[value]} value={option[value]}>
          {option[label]}
        </Radio>
      );
    });
  }, [options, fieldNamesValue]);

  console.log("AntdRadioGroupComponent", props, value);

  return (
    <AntdFormItemContainer
      alignment={alignment}
      className="antd-radio-container"
      labelPosition={labelPosition}
      labelStyle={labelStyle}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: labelTextColor,
              labelFontSize: labelTextSize as unknown as number,
            },
            Radio: {
              colorPrimary: colorPrimary,
            },
            Button: {},
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={accessor || widgetName}
          rules={[{ required: required, message: `此项为必填项` }]}
          tooltip={labelTooltip}
          {...colLayoutMemo}
        >
          <Radio.Group
            buttonStyle={radioButtonStyle ? "solid" : "outline"}
            disabled={disabled}
            onChange={handleChange}
            optionType={radioType === "button" ? "button" : "default"}
            options={radioType === "button" ? options : undefined}
            size={controlSize}
            style={{
              marginBottom: 0,
              // margin: 16,
            }}
            value={value}
          >
            {radioType !== "button" && (
              <Space direction={isInline ? "horizontal" : "vertical"}>
                {/* {RadioComponent} */}
                {options.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Space>
            )}
          </Radio.Group>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export interface RadioGroupComponentProps {
  accessor?: string;
  defaultValue?: string;
  onSelectionChange?: string;
  widgetName?: string;
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  radioButtonStyle?: boolean;
  options: RadioOption[];
  onChange?: (updatedOptionValue: string) => void;
  value?: string;
  disabled?: boolean;
  loading?: boolean;
  isDynamicHeightEnabled?: boolean;
  isInline?: boolean;
  alignment?: Alignment;
  compactMode?: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  labelWidth?: number;
  labelTooltip?: string;
  widgetId?: string;
  height?: number;
  colorPrimary?: string;
  required?: boolean;
  animateLoading?: boolean;
  radioType?: "button" | "radio";
  controlSize?: ButtonProps["size"];
}

export default RadioGroupComponent;
