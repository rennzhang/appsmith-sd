import styled from "styled-components";

import { Colors } from "constants/Colors";

type StyledWrapperProps = {
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: string;
  borderWidth?: number;
  boxShadow?: string;
  withoutPadding?: boolean;
  withBottomMargin?: boolean;
  labelTextSize?: string;
  labelTextColor?: string;
  labelStyle?: string;
  isLastField?: boolean;
};

const NESTED_FORM_WRAPPER_PADDING = 10;
const DEFAULT_BORDER_RADIUS = 0;
const DEFAULT_BORDER_WIDTH = 0;
const DEFAULT_BOX_SHADOW = "none";
const DEFAULT_BORDER_COLOR = Colors.GREY_3;

const NestedFormWrapper = styled.div<StyledWrapperProps>`
  background-color: ${({ backgroundColor }) =>
    backgroundColor || Colors.GREY_1};
  padding: ${({ withoutPadding }) =>
    withoutPadding ? 0 : NESTED_FORM_WRAPPER_PADDING}px;
  border-color: ${({ borderColor }) => borderColor || DEFAULT_BORDER_COLOR};
  border-style: solid;
  border-radius: ${({ borderRadius }) => borderRadius || DEFAULT_BORDER_RADIUS};
  border-width: ${({ borderWidth }) => borderWidth || DEFAULT_BORDER_WIDTH}px;
  box-shadow: ${({ boxShadow }) => boxShadow || DEFAULT_BOX_SHADOW};
  margin-bottom: 16px;

  > div > .ant-form-item > .ant-form-item-row > .ant-form-item-label label {
    font-size: ${({ labelTextSize }) => labelTextSize || "14px"};
    ${({ labelTextColor }) => labelTextColor && `color: ${labelTextColor};`}
    font-weight: ${({ labelStyle }) => labelStyle?.includes("BOLD") && "bold"};
    font-style: ${({ labelStyle }) =>
      labelStyle?.includes("ITALIC") && "italic"};
  }
  &.is-last-field {
    margin-bottom: 0;
  }
  &.in-array {
    padding-bottom: 0;
  }
`;

export default NestedFormWrapper;
