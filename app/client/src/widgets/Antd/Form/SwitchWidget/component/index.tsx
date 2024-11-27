import React, { memo, useEffect, useMemo, useState } from "react";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { SwitchProps } from "antd";
import { ConfigProvider, Switch, theme } from "antd";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import { type IconName } from "@blueprintjs/icons";
import IconRenderer from "widgets/Antd/Components/IconRenderer";
import type { TextSize } from "constants/WidgetConstants";
import { isEqual } from "lodash";
import { simpleDiff } from "widgets/Antd/tools/tool";
export interface RadioGroupContainerProps {
  labelPosition?: AntdLabelPosition;
}

export interface StyledRadioGroupProps {
  alignment: Alignment;
  height?: number;
  labelPosition?: AntdLabelPosition;
  optionCount: number;
  colorPrimary: string;
  isDynamicHeightEnabled?: boolean;
  children?: React.ReactNode;
}

function SwitchComponent(props: SwitchComponentProps) {
  const {
    accessor,
    alignment,
    animateLoading,
    boxShadow,
    checkedIconName,
    checkedText,
    colorPrimary,
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
    onChange,
    required,
    uncheckedIconName,
    uncheckedText,

    widgetName,
  } = props;
  const [value, setValue] = useState(props.value);
  useEffect(() => {
    if (props.value !== value) {
      setValue(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
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

  const handleChange: SwitchProps["onChange"] = (val) => {
    setValue(val);
    onChange?.(val);
  };

  const checkedChildrenMemo = useMemo(() => {
    if (displayContent === "none") return;
    return displayContent === "icon" ? (
      <IconRenderer
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
      <IconRenderer
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
    props.handelClick?.(val, e);
    console.log("开关组件 SwitchComponent handelClick", { val, e });
  };

  console.group("开关组件 SwitchComponent");
  console.log("props", props);
  console.groupEnd();
  return (
    <AntdFormItemContainer
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
              labelFontSize: labelTextSize as unknown as number,
            },
            Switch: {
              colorPrimary: colorPrimary,
              colorPrimaryHover: hoverColor || "#4096ff",
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

type SwitchComponentPropsExtends = SwitchProps & Partial<ComponentProps>;

export type SwitchComponentProps = SwitchComponentPropsExtends & {
  accessor?: string | string[];
  onSwitchClick?: string;
  onSwitchChange?: string;
  onChange?: (updatedValue: boolean) => void;
  handelClick?: (val: boolean, e: React.MouseEvent) => void;
  loading?: boolean;
  isDynamicHeightEnabled?: boolean;
  alignment?: Alignment;
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
  iconName?: IconName;
  displayContent?: "icon" | "text" | "none";
  value?: boolean;
  defaultValue?: boolean;
  controlSize?: "small" | "default";
  checkedText?: string;
  uncheckedText?: string;
  checkedIconName?: IconName;
  uncheckedIconName?: IconName;
  hoverColor?: string;
  boxShadow?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  isVisible?: boolean;
};

const arePropsEqual = (
  prevProps: SwitchComponentProps,
  nextProps: SwitchComponentProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    diffProps &&
      console.log("SwitchComponent memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
        isSame: JSON.stringify(prevProps) === JSON.stringify(nextProps),
      });
  }
  return isEqual(prevProps, nextProps);
};

const SwitchComponentMemo = memo(SwitchComponent, arePropsEqual);

export default SwitchComponentMemo;
