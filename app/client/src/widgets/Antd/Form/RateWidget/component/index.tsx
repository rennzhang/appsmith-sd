import React, { useMemo } from "react";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { RadioOption } from "../constants";
import type { ButtonProps } from "antd";
import { ConfigProvider, Rate } from "antd";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { RateProps } from "antd/lib";
import { Icon } from "@blueprintjs/core";
import { IconNames, type IconName } from "@blueprintjs/icons";
console.log(" IconNames", IconNames);
export interface RadioGroupContainerProps {
  labelPosition?: AntdLabelPosition;
}

export interface StyledRadioGroupProps {
  alignment: Alignment;
  height?: number;
  labelPosition?: AntdLabelPosition;
  optionCount: number;
  accentColor: string;
  isDynamicHeightEnabled?: boolean;
  children?: React.ReactNode;
}

function RateComponent(props: RateComponentProps) {
  const {
    accentColor,
    alignment,
    allowClear,
    allowHalf,
    animateLoading,
    customText,
    defaultValue,
    disabled,
    displayContent,
    height,
    iconName,
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
    maxValue,
    minValue,
    onValueChange,
    options,
    required,
    tooltips,
    value,
    widgetName,
  } = props;

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const handleChange: RateProps["onChange"] = (val) => {
    const newValue =
      minValue && val < minValue
        ? minValue
        : maxValue && val > maxValue
        ? maxValue
        : val;
    onValueChange(newValue);
  };

  const characterMemo = useMemo(() => {
    return displayContent === "icon" ? (
      <Icon className="antd-rate-icon" color="currentColor" icon={iconName} />
    ) : (
      customText
    );
  }, [iconName, customText, displayContent]);

  return (
    <AntdFormItemContainer
      accentColor={accentColor}
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
            Rate: {
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
          <Rate
            allowClear={allowClear}
            allowHalf={allowHalf}
            character={characterMemo}
            defaultValue={defaultValue}
            disabled={disabled}
            onChange={handleChange}
            tooltips={tooltips}
            value={value}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

type RateComponentPropsExtends = RateProps & ComponentProps;

export interface RateComponentProps extends RateComponentPropsExtends {
  options: RadioOption[];
  onValueChange: (updatedOptionValue: number) => void;
  loading: boolean;
  isDynamicHeightEnabled?: boolean;
  alignment: Alignment;
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
  maxValue?: number;
  minValue?: number;
  iconName: IconName;
  customText?: string;
  displayContent?: "icon" | "text";
}

export default RateComponent;
