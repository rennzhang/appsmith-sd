import React, { useMemo } from "react";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { SwitchProps } from "antd";
import { ConfigProvider, Switch } from "antd";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
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

function SwitchComponent(props: SwitchComponentProps) {
  const {
    accentColor,
    alignment,
    animateLoading,
    boxShadow,
    checkedIconName,
    checkedText,
    controlSize,
    defaultValue,
    disabled,
    displayContent,
    height,
    hoverColor,
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
    onValueChange,
    required,
    uncheckedIconName,
    uncheckedText,
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

  const handleChange: SwitchProps["onChange"] = (val) => {
    onValueChange(val);
  };

  const checkedChildrenMemo = useMemo(() => {
    if (displayContent === "none") return;
    return displayContent === "icon" ? (
      <Icon
        className="antd-inner-icon"
        color="currentColor"
        icon={checkedIconName}
      />
    ) : (
      checkedText
    );
  }, [checkedIconName, uncheckedIconName, displayContent]);

  const unCheckedChildrenMemo = useMemo(() => {
    if (displayContent === "none") return;
    return displayContent === "icon" ? (
      <Icon
        className="antd-inner-icon"
        color="currentColor"
        icon={uncheckedIconName}
      />
    ) : (
      uncheckedText
    );
  }, [checkedIconName, uncheckedIconName, displayContent]);

  /** @description  */
  const handelClick: SwitchProps["onClick"] = (val, e) => {
    props.handelClick(val, e);
    console.log("开关组件 SwitchComponent handelClick", { val, e });
  };

  console.group("开关组件 SwitchComponent");
  console.log("props", props);
  console.groupEnd();
  return (
    <AntdFormItemContainer
      accentColor={accentColor}
      alignment={alignment}
      boxShadow={boxShadow}
      className="antd-switch-container"
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
            Switch: {
              colorPrimary: accentColor,
              colorPrimaryHover: hoverColor,
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
          <Switch
            checked={value}
            checkedChildren={checkedChildrenMemo}
            defaultChecked={defaultValue}
            disabled={disabled}
            loading={loading}
            onChange={handleChange}
            onClick={handelClick}
            size={controlSize}
            unCheckedChildren={unCheckedChildrenMemo}
          />
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

type SwitchComponentPropsExtends = SwitchProps & ComponentProps;

export interface SwitchComponentProps extends SwitchComponentPropsExtends {
  onValueChange: (updatedValue: boolean) => void;
  handelClick: (val: boolean, e: React.MouseEvent) => void;
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
  iconName: IconName;
  displayContent?: "icon" | "text" | "none";
  value: boolean;
  defaultValue: boolean;
  controlSize: "small" | "default";
  checkedText: string;
  uncheckedText: string;
  checkedIconName: IconName;
  uncheckedIconName: IconName;
  hoverColor: string;
  boxShadow: string;
}

export default SwitchComponent;
