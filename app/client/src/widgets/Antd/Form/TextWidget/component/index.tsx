import React from "react";
import { ConfigProvider } from "antd";
import styled from "styled-components";
import { ProFormItem } from "@ant-design/pro-components";
import type { ProFormItemProps } from "@ant-design/pro-components";
import { AntdLabelPosition } from "components/constants";
import { AntdFormItemContainer } from "widgets/Antd/Style";

export interface TextDisplayComponentProps {
  defaultValue?: string;
  labelAlignment?: "left" | "right";
  labelPosition?: AntdLabelPosition;
  labelStyle?: string;
  labelText?: string;
  labelTextColor?: string;
  labelTextSize?: number | string;
  labelWidth?: number | string;
  widgetName: string;
  tooltip?: string;
  disabled?: boolean;
  required?: boolean;
  textSize?: string;
  textColor?: string;
  textStyle?: string;
}

const TextContent = styled.div<{
  textColor?: string;
  textSize?: string;
  textStyle?: string;
}>`
  padding: 4px 11px;
  min-height: 32px;
  display: flex;
  align-items: center;
  color: ${(props) => props.textColor};
  font-size: ${(props) => props.textSize};
  font-weight: ${({ textStyle }) => textStyle?.includes("BOLD") && "bold"};
  font-style: ${({ textStyle }) => textStyle?.includes("ITALIC") && "italic"};
`;

const AntdTextDisplay = (props: TextDisplayComponentProps) => {
  const {
    defaultValue,
    disabled,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelWidth,
    required,
    textColor,
    textSize,
    textStyle,
    tooltip,
    widgetName,
  } = props;

  const colLayoutMemo = React.useMemo(() => {
    if (labelPosition === AntdLabelPosition.Left) {
      return {
        labelCol: { sm: { span: labelWidth } },
        wrapperCol: { sm: { span: 24 - +(labelWidth || 6) } },
      };
    }
    return {};
  }, [labelPosition, labelWidth]);

  return (
    <AntdFormItemContainer
      className="antd-text-display-container"
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
          },
        }}
      >
        <ProFormItem
          label={labelText}
          labelAlign={labelAlignment}
          name={widgetName}
          required={required}
          tooltip={tooltip}
          {...colLayoutMemo}
        >
          <TextContent
            textColor={textColor}
            textSize={textSize}
            textStyle={textStyle}
          >
            {defaultValue}
          </TextContent>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};

export default AntdTextDisplay;
