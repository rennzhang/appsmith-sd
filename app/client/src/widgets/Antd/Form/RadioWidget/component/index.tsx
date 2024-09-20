import React, { useCallback, useMemo } from "react";
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
export interface RadioGroupContainerProps {
  compactMode: boolean;
  labelPosition?: AntdLabelPosition;
}

export interface StyledRadioGroupProps {
  alignment: Alignment;
  compactMode: boolean;
  height?: number;
  inline: boolean;
  labelPosition?: AntdLabelPosition;
  optionCount: number;
  accentColor: string;
  isDynamicHeightEnabled?: boolean;
  children?: React.ReactNode;
}

function RadioGroupComponent(props: RadioGroupComponentProps) {
  const {
    accentColor,
    alignment,
    animateLoading,
    compactMode,
    controlSize,
    disabled,
    height,
    inline,
    isDynamicHeightEnabled,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    loading,
    onRadioSelectionChange,
    options,
    radioButtonStyle,
    radioType,
    required,
    value,
    widgetName,
  } = props;
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
  const handleChange = useCallback(
    (e: RadioChangeEvent) => {
      onRadioSelectionChange(e.target.value);
    },
    [onRadioSelectionChange],
  );

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
              labelFontSize: labelTextSize,
            },
            Radio: {
              colorPrimary: accentColor,
            },
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={widgetName}
          rules={[{ required: required, message: `此项为必填项` }]}
          tooltip={labelTooltip}
          {...colLayoutMemo}
        >
          <Radio.Group
            buttonStyle={radioButtonStyle ? "solid" : "outline"}
            disabled={disabled}
            name={widgetName}
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
              <Space direction={inline ? "horizontal" : "vertical"}>
                {RadioComponent}
                {/* {options.map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))} */}
              </Space>
            )}
          </Radio.Group>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export interface RadioGroupComponentProps extends ComponentProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  radioButtonStyle?: boolean;
  options: RadioOption[];
  onRadioSelectionChange: (updatedOptionValue: string) => void;
  value: string;
  disabled: boolean;
  loading: boolean;
  isDynamicHeightEnabled?: boolean;
  inline: boolean;
  alignment: Alignment;
  compactMode: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelTextColor?: string;
  labelTextSize?: number;
  labelStyle?: string;
  labelWidth?: number;
  labelTooltip?: string;
  widgetId: string;
  height?: number;
  accentColor: string;
  required?: boolean;
  animateLoading?: boolean;
  radioType?: "button" | "radio";
  controlSize?: ButtonProps["size"];
}

export default RadioGroupComponent;
