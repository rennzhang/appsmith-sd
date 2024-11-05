import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import type { TextSize } from "constants/WidgetConstants";
import { isArray } from "lodash";
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

function CheckboxGroupComponent(props: CheckboxComponentProps) {
  const {
    accessor,
    alignment,
    animateLoading,
    colorPrimary,
    compactMode,
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
    required,
    widgetName,
  } = props;
  const [value, setValue] = useState<CheckboxValueType[]>([]);
  useEffect(() => {
    const _value = isArray(props.value) ? props.value : [props.value];
    setValue(_value);
  }, [props.value]);

  useEffect(() => {
    if (defaultValue) {
      const _defaultValue = isArray(props.defaultValue)
        ? props.defaultValue
        : [props.defaultValue];

      setValue(_defaultValue);
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
  const handleChange: CheckboxGroupProps["onChange"] = (checkedValue) => {
    console.group("多选框 onChange");
    console.log("多选框 onChange");
    console.log(" checkedValue", checkedValue);
    console.groupEnd();
    setValue(checkedValue);
    onChange?.(checkedValue);
  };

  const CheckBoxComponent = useMemo(() => {
    return options.map((option) => {
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

  console.group("Antd 复选框组件");
  console.log("Antd 复选框组件 value", value);
  console.groupEnd();

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
              colorPrimary: colorPrimary,
            },
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
          <Checkbox.Group
            disabled={disabled}
            onChange={handleChange}
            style={{
              marginBottom: 0,
              // margin: 16,
            }}
            value={value}
          >
            <Space direction={isInline ? "horizontal" : "vertical"}>
              {CheckBoxComponent}
            </Space>
          </Checkbox.Group>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

export interface CheckboxComponentProps {
  defaultValue?: any;
  accessor?: string | string[];
  valueKey?: string;
  labelKey?: string;
  childrenKey?: string;
  onValueChange?: string;
  options: { value: string; label: string; [key: string]: any }[];
  onChange?: (value: CheckboxValueType[]) => void;
  value?: CheckboxProps["value"];
  disabled?: boolean;
  loading?: boolean;
  isDynamicHeightEnabled?: boolean;
  isInline?: boolean;
  alignment: Alignment;
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
  widgetName?: string;
}

export default CheckboxGroupComponent;
