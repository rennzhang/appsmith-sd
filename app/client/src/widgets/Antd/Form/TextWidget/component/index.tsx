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
}

const TextContent = styled.div`
  padding: 4px 11px;
  min-height: 32px;
  display: flex;
  align-items: center;
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
          <TextContent>{defaultValue}</TextContent>
        </ProFormItem>
      </ConfigProvider>
    </AntdFormItemContainer>
  );
};

export default AntdTextDisplay;
