import type { PropsWithChildren } from "react";
import React, { useMemo } from "react";
import styled from "styled-components";

import Tooltip from "components/editorComponents/Tooltip";
import { Colors } from "constants/Colors";
import { IconWrapper } from "constants/IconConstants";
import type { TextSize } from "constants/WidgetConstants";
import { FontStyleTypes } from "constants/WidgetConstants";
import { THEMEING_TEXT_SIZES } from "constants/ThemeConstants";
import type { AlignWidget } from "widgets/constants";
import { importSvg } from "design-system-old";
import { ProFormItem } from "@ant-design/pro-components";
import { ConfigProvider } from "antd";
import { locale } from "moment";
import { borderRadius } from "react-select/src/theme";
import { AntdFormItemContainer } from "widgets/Antd/Style";
import { AntdLabelPosition } from "components/constants";

const HelpIcon = importSvg(() => import("assets/icons/control/help.svg"));

type AlignField = AlignWidget;

type StyledLabelTextProps = {
  color: string;
  fontSize: string;
  fontStyle: string;
  fontWeight: string;
  isRequiredField: boolean;
  textDecoration: string;
};

export type LabelStyles = {
  labelStyle?: string;
  labelTextColor?: string;
  labelTextSize?: string;
};

export type FieldLabelProps = PropsWithChildren<
  LabelStyles & {
    className?: string;
    isLastField?: boolean;
    isRootField?: boolean;
    accessor?: string;
    widgetName?: string;
    direction?: "row" | "column";
    isRequiredField?: boolean;
    labelText: string;
    tooltip?: string;
    alignField?: AlignField;
    boxShadow?: string;
    labelPosition?: AntdLabelPosition;
    labelAlignment?: "left" | "right";
    labelWidth?: number;
    labelTooltip?: string;
    hideLabel?: boolean;
  }
>;

type StyledLabelTextWrapperProps = {
  direction: FieldLabelProps["direction"];
};

type StyledLabelProps = {
  direction?: FieldLabelProps["direction"];
};

const LABEL_TEXT_WRAPPER_MARGIN_BOTTOM = 4;
const LABEL_TEXT_MARGIN_RIGHT_WITH_REQUIRED = 2;
const TOOLTIP_CLASSNAME = "tooltip-wrapper";
// Default spacing between elements like label/tooltip etc
const DEFAULT_GAP = 10;

/**
 * align-items: flex-start is to keep fields like checkbox to always be
 * at the start even when the field label breaks to new line, otherwise
 * the checkbox might center align.
 */
const StyledLabel = styled.label<StyledLabelProps>`
  align-items: flex-start;
  display: flex;
  flex-direction: ${({ direction }) => direction};
`;

const StyledLabelTextWrapper = styled.div<StyledLabelTextWrapperProps>`
  align-items: center;
  display: flex;
  margin-bottom: ${({ direction }) =>
    direction === "row" ? 0 : LABEL_TEXT_WRAPPER_MARGIN_BOTTOM}px;

  & .${TOOLTIP_CLASSNAME} {
    line-height: 0;
  }
`;

const StyledRequiredMarker = styled.div`
  color: ${Colors.CRIMSON};
  margin-right: ${DEFAULT_GAP}px;
`;

const StyledLabelText = styled.p<StyledLabelTextProps>`
  margin-bottom: 0;
  margin-right: ${({ isRequiredField }) =>
    isRequiredField ? LABEL_TEXT_MARGIN_RIGHT_WITH_REQUIRED : DEFAULT_GAP}px;
  color: ${({ color }) => color};
  font-size: ${({ fontSize }) => fontSize};
  font-weight: ${({ fontWeight }) => fontWeight};
  font-style: ${({ fontStyle }) => fontStyle};
  text-decoration: ${({ textDecoration }) => textDecoration};
`;

export const BASE_LABEL_TEXT_SIZE = THEMEING_TEXT_SIZES.sm as TextSize;

function FieldLabel(props: FieldLabelProps) {
  const {
    accessor,
    boxShadow,
    children,
    className,
    hideLabel,
    isLastField,
    isRootField,
    labelAlignment,
    labelPosition,
    labelStyle,
    labelText,
    labelTextColor,
    labelTextSize,
    labelTooltip,
    labelWidth,
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
  console.log("FieldLabel", {
    labelText,
    labelTooltip,
    labelPosition,
    labelAlignment,
    isRootField,
    props,
  });

  return (
    <AntdFormItemContainer
      className={className}
      labelAlign={labelAlignment}
      labelPosition={labelPosition}
    >
      <ProFormItem
        label={hideLabel ? "" : labelText}
        labelAlign={labelAlignment}
        name={accessor || widgetName}
        tooltip={labelTooltip}
        {...colLayoutMemo}
      >
        {children}
      </ProFormItem>
    </AntdFormItemContainer>
  );
}

export default FieldLabel;
