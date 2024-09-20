import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { RadioOption } from "../constants";
import type { ButtonProps, RadioChangeEvent } from "antd";
import { Checkbox, ConfigProvider, Space } from "antd";
import type {
  CheckboxGroupProps,
  CheckboxValueType,
} from "antd/es/checkbox/Group";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { ProFormItem, ProFormRadio } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import type { CheckboxProps } from "antd/lib";
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

function CheckboxGroupComponent(props: RadioGroupComponentProps) {
  const {
    accentColor,
    alignment,
    animateLoading,
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
    onValueChange,
    options,
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
  const handleChange: CheckboxGroupProps["onChange"] = (checkedValue) => {
    console.group("多选框 onChange");
    console.log("多选框 onChange");
    console.log(" checkedValue", checkedValue);
    console.groupEnd();
    onValueChange(checkedValue);
  };

  const CheckBoxComponent = useMemo(() => {
    return options.map((option) => {
      const { label, value } = fieldNamesValue;
      console.log(
        "勾选组件 111111option",
        { option, value, fieldNamesValue, label },
        option[value],
        option[label],
      );

      return (
        <Checkbox
          key={option[fieldNamesValue.value]}
          value={option[fieldNamesValue.value]}
        >
          {option[fieldNamesValue.label]}
        </Checkbox>
      );
    });
  }, [options, fieldNamesValue]);

  return (
    <AntdFormItemContainer
      alignment={alignment}
      className="antd-checkbox-container"
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
            Checkbox: {
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
          <Checkbox.Group
            disabled={disabled}
            name={widgetName}
            onChange={handleChange}
            style={{
              marginBottom: 0,
              // margin: 16,
            }}
            value={value}
          >
            <Space direction={inline ? "horizontal" : "vertical"}>
              {CheckBoxComponent}
            </Space>
          </Checkbox.Group>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export interface RadioGroupComponentProps extends ComponentProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  options: { value: string; label: string; [key: string]: any }[];
  onValueChange: (value: CheckboxValueType[]) => void;
  value: CheckboxProps["value"];
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
}

export default CheckboxGroupComponent;
