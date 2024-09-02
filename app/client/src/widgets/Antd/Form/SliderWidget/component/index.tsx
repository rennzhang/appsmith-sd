import React, { useMemo, useRef } from "react";
import type { ComponentProps } from "widgets/BaseComponent";
import { type Alignment } from "@blueprintjs/core";
import { AntdLabelPosition } from "components/constants";
import type { SliderSingleProps } from "antd";
import type { SliderRef } from "rc-slider/lib/Slider";
import { ConfigProvider, Slider } from "antd";
import { ProFormItem } from "@ant-design/pro-components";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import { IconNames, type IconName } from "@blueprintjs/icons";
import type {
  SliderBaseProps,
  SliderRangeProps,
  SliderTooltipProps,
} from "antd/es/slider";
import IconRenderer from "widgets/Antd/Components/IconRenderer";
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

function SliderComponent(props: SliderComponentProps) {
  const {
    accentColor,
    alignment,
    animateLoading,
    boxShadow,
    defaultValue,
    disabled,
    startAddonType,
    endAddonType,
    startAddonColor,
    endAddonColor,
    startAddonText,
    endAddonText,
    startAddonIcon,
    endAddonIcon,
    dots,
    draggableTrack,
    height,
    heightForVertical,
    hoverColor,
    iconName,
    isDynamicHeightEnabled,
    isInc: included,
    isRange,
    keyboard,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
    marks,
    max = 100,
    min = 0,
    onValueChange,
    open,
    placement,
    required,
    reverse,
    step,
    stepNull,
    tooltipFormatter,
    value,
    vertical,
    widgetName,
  } = props;

  const SliderDomRef = useRef<SliderRef>(null);

  const colLayoutMemo = useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  const handleChange = (val: number | number[]) => {
    console.log("滑动输入组件 onChange", val);

    onValueChange(val);
  };

  const startAddonMemo = useMemo(() => {
    if (startAddonType === "none") return null;
    return (
      <span style={{ color: startAddonColor }}>
        {startAddonType === "icon" ? (
          <IconRenderer
            className="antd-inner-icon"
            color={startAddonColor || "currentColor"}
            icon={startAddonIcon}
          />
        ) : (
          startAddonText
        )}
      </span>
    );
  }, [
    startAddonText,
    startAddonIcon,
    startAddonType,
    startAddonColor,
  ]);

  const endAddonMemo = useMemo(() => {
    if (endAddonType === "none") return null;
    return (
      <span style={{ color: endAddonColor }}>
        {endAddonType === "icon" ? (
          <IconRenderer
            className="antd-inner-icon"
            color={endAddonColor || "currentColor"}
            icon={endAddonIcon}
          />
        ) : (
          endAddonText
        )}
      </span>
    );
  }, [
    endAddonText,
    endAddonIcon,
    endAddonType,
    endAddonColor,
  ]);

  const tooltipMemo = useMemo<SliderBaseProps["tooltip"]>(() => {
    return {
      placement: placement,
      open,
      formatter: (value) => {
        console.log("滑动输入组件 tooltipMemo", value);

        if (!tooltipFormatter) return null;

        // #[5,35]% => `#${value}%`
        return tooltipFormatter.replace(/\[[^\]]*\]/, value?.toString() || "");
      },
    };
  }, [tooltipFormatter, open, placement]);

  const heightMemo = useMemo(() => {
    if (vertical) {
      return heightForVertical;
    }
    return undefined;
  }, [heightForVertical, vertical]);

  const stepMemo = useMemo(() => {
    if (stepNull) {
      return null;
    }
    return step;
  }, [step, stepNull]);

  const rangeMemo = useMemo(() => {
    if (isRange) {
      return {
        draggableTrack: draggableTrack,
      };
    }
    return false;
  }, [draggableTrack, isRange]);
  console.group("滑动输入组件 SliderComponent");
  console.log("props", props);
  console.log(" heightMemo", heightMemo);
  console.groupEnd();
  return (
    <AntdFormItemContainer
      accentColor={accentColor}
      alignment={alignment}
      boxShadow={boxShadow}
      className="antd-slider-container"
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
            Slider: {
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
          {/* <Slider defaultValue={37} marks={marks} /> */}
          <div
            className={`icon-wrapper flex items-center justify-center ${
              vertical ? "vertical" : ""
            }`}
            onMouseDownCapture={(event) => {
              SliderDomRef.current?.focus();
              event.preventDefault();
            }}
            style={{ height: heightMemo }}
          >
            {startAddonMemo}
            <Slider
              defaultValue={defaultValue as any}
              disabled={disabled}
              dots={dots}
              included={included}
              keyboard={keyboard}
              marks={marks}
              max={max}
              min={min}
              onChange={handleChange}
              range={rangeMemo}
              ref={SliderDomRef}
              reverse={reverse}
              step={stepMemo}
              tooltip={tooltipMemo}
              value={value as any}
              vertical={vertical}
            />
            {endAddonMemo}
          </div>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
}

type SliderComponentPropsExtends = SliderBaseProps & ComponentProps;

export interface SliderComponentProps extends SliderComponentPropsExtends {
  value: number | number[];
  defaultValue: number | number[];
  onValueChange: (updatedValue: number | number[]) => void;
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
  startAddonType: "icon" | "text" | "none";
  endAddonType: "icon" | "text" | "none";
  startAddonColor?: string;
  endAddonColor?: string;
  startAddonText: string;
  endAddonText: string;
  startAddonIcon: IconName;
  endAddonIcon: IconName;
  hoverColor: string;
  boxShadow: string;
  step: number;
  max: number;
  min: number;
  tooltipFormatter: string;
  open: boolean;
  placement: SliderTooltipProps["placement"];
  keyboard: boolean;
  heightForVertical: number;
  isInc: boolean;
  stepNull: boolean;
  isRange: boolean;
  draggableTrack: boolean;
}

export default SliderComponent;
