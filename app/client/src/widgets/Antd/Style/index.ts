import { LabelPosition } from "design-system-old";
import styled from "styled-components";

export const AntdFormItemContainer = styled.div<{
  labelStyle?: string;
  alignment?: string;
  boxShadow?: string;
  labelPosition?: LabelPosition;
}>`
  width: 100%;
  .ant-form-item-row {
    flex-flow: ${({ labelPosition }) =>
      labelPosition == LabelPosition.Left ? "row nowrap" : "row wrap"};
  }
  .ant-form-item-control {
    ${({ labelPosition }) =>
      labelPosition == LabelPosition.Top ? "width: 100%;" : ""};
  }
  .ant-form-item-row .ant-form-item-label {
    font-weight: ${({ labelStyle }) => labelStyle?.includes("BOLD") && "bold"};
    font-style: ${({ labelStyle }) =>
      labelStyle?.includes("ITALIC") && "italic"};
    overflow: ${({ labelPosition }) =>
      labelPosition == LabelPosition.Left ? "unset" : "hidden"};
  }
  .ant-form-item-control .ant-form-item-control-input .ant-select-selector {
    box-shadow: ${({ boxShadow }) => boxShadow};
  }
  .ant-transfer-list {
    box-shadow: ${({ boxShadow }) => boxShadow};
    overflow: hidden;
  }
`;
