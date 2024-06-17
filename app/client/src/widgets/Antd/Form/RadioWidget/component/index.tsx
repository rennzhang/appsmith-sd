import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
// import { RadioGroup, Radio, Classes } from "@blueprintjs/core";
import { LabelPosition } from "components/constants";
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
  labelPosition?: LabelPosition;
}

export interface StyledRadioGroupProps {
  alignment: Alignment;
  compactMode: boolean;
  height?: number;
  inline: boolean;
  labelPosition?: LabelPosition;
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
    buttonSize,
    compactMode,
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
    selectedOptionValue,
    widgetName,
  } = props;

  const handleChange = useCallback(
    (e: RadioChangeEvent) => {
      onRadioSelectionChange(e.target.value);
    },
    [onRadioSelectionChange],
  );

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
          labelCol={
            labelPosition == LabelPosition.Left
              ? { span: labelWidth }
              : undefined
          }
          name={widgetName}
          rules={
            required
              ? [
                  {
                    required: true,
                    message: `此项为必填项`,
                  },
                ]
              : []
          }
          tooltip={labelTooltip}
        >
          <Radio.Group
            buttonStyle={radioButtonStyle ? "solid" : "outline"}
            disabled={disabled}
            name={widgetName}
            onChange={handleChange}
            optionType={radioType === "button" ? "button" : "default"}
            size={buttonSize}
            style={{
              marginBottom: 0,
              // margin: 16,
            }}
            value={selectedOptionValue}
          >
            <Space direction={inline ? "horizontal" : "vertical"}>
              {options.map((option) => (
                <Radio key={option.value} value={option.value}>
                  {option.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export interface RadioGroupComponentProps extends ComponentProps {
  radioButtonStyle?: boolean;
  options: RadioOption[];
  onRadioSelectionChange: (updatedOptionValue: string) => void;
  selectedOptionValue: string;
  disabled: boolean;
  loading: boolean;
  isDynamicHeightEnabled?: boolean;
  inline: boolean;
  alignment: Alignment;
  compactMode: boolean;
  labelText: string;
  labelPosition?: LabelPosition;
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
  buttonSize?: ButtonProps["size"];
}

export default RadioGroupComponent;
