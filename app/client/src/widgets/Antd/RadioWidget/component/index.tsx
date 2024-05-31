import React, { useCallback } from "react";
import styled from "styled-components";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
// import { RadioGroup, Radio, Classes } from "@blueprintjs/core";
import type { LabelPosition } from "components/constants";
import type { RadioOption } from "../constants";
import type { ButtonProps, RadioChangeEvent } from "antd";
import { ConfigProvider } from "antd";
import { ProFormRadio } from "@ant-design/pro-components";
export interface RadioGroupContainerProps {
  compactMode: boolean;
  labelPosition?: LabelPosition;
}

export const RadioGroupContainer = styled.div<{
  labelStyle?: string;
  alignment?: string;
}>`
  width: 100%;
  .ant-form-item-label {
    font-weight: ${({ labelStyle }) => labelStyle?.includes("BOLD") && "bold"};
    font-style: ${({ labelStyle }) =>
      labelStyle?.includes("ITALIC") && "italic"};
  }
  .ant-form-item-control .ant-radio-wrapper {
    flex-direction: ${({ alignment }) =>
      alignment == "left" ? "row" : "row-reverse"};
  }
`;

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
  } = props;
  console.log(" labelStyle", labelStyle);
  const optionCount = (options || []).length;

  const handleChange = useCallback(
    (e: RadioChangeEvent) => {
      onRadioSelectionChange(e.target.value);
    },
    [onRadioSelectionChange],
  );

  return (
    <RadioGroupContainer
      alignment={alignment}
      className="antd-radio-container"
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
        <ProFormRadio.Group
          disabled={disabled}
          fieldProps={{
            value: selectedOptionValue,
            onChange: handleChange,
            buttonStyle: radioButtonStyle ? "solid" : "outline",
            size: buttonSize,
          }}
          label={labelText}
          layout={inline ? "horizontal" : "vertical"}
          options={options}
          radioType={radioType}
          required={required}
          style={{
            marginBottom: 0,
            // margin: 16,
          }}
          tooltip={labelTooltip}
        />
      </ConfigProvider>
    </RadioGroupContainer>
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
  labelAlignment?: Alignment;
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
