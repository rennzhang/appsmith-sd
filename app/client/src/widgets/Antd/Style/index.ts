import type { ButtonPlacement } from "components/constants";
import {
  CheckboxGroupAlignmentTypes,
  ButtonPlacementTypes,
  AntdLabelPosition,
} from "components/constants";

import styled from "styled-components";

export const AntdProformContainer = styled.div<{
  labelAlign?: string;
}>`
  .antd-pro-form-container-styled
    form.ant-form-vertical.ant-form.ant-pro-form
    div.ant-form-item
    div.ant-form-item-label
    > label {
    white-space: initial;
    height: auto;
  }
  .antd-pro-form-container-styled
    .ant-form.ant-form-horizontal.ant-form-default
    div.ant-form-item
    div.ant-form-item-row {
    flex-flow: row nowrap;
  }

  .antd-pro-form-container-styled
    .ant-pro-form
    .ant-form-label-right
    .ant-col.ant-col-24.ant-form-item-label {
    text-align: end;
  }
`;
export const AntdFormItemContainer = styled.div<{
  labelStyle?: string;
  alignment?: string;
  boxShadow?: string;
  borderRadius?: string;
  labelPosition?: AntdLabelPosition;
  accentColor?: string;
}>`
  width: 100%;
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-item-row {
    flex-flow: ${({ labelPosition }) =>
      labelPosition == AntdLabelPosition.Left ? "row nowrap" : "row wrap"};
  }
  .ant-form-item-control {
    ${({ labelPosition }) =>
      labelPosition == AntdLabelPosition.Top ? "width: 100%;" : ""};
  }
  .ant-form-item-row .ant-form-item-label {
    font-weight: ${({ labelStyle }) => labelStyle?.includes("BOLD") && "bold"};
    font-style: ${({ labelStyle }) =>
      labelStyle?.includes("ITALIC") && "italic"};
    overflow: ${({ labelPosition }) =>
      labelPosition == AntdLabelPosition.Left ? "unset" : "hidden"};
  }
  div.ant-form-item div.ant-form-item-label-wrap label {
    height: auto;
  }
  .ant-form-item-control .ant-form-item-control-input .ant-select-selector,
  .ant-transfer-list,
  .antd-input,
  .ant-picker,
  .ant-switch,
  div.ant-upload.ant-upload-select {
    box-shadow: ${({ boxShadow }) => boxShadow};
    overflow: hidden;
  }

  .ant-upload,
  .ant-picker {
    width: 100%;
  }

  div.ant-upload.ant-upload-drag,
  .ant-tree {
    box-shadow: ${({ boxShadow }) => boxShadow};
    border-radius: ${({ borderRadius }) => borderRadius};
  }

  .ant-input-textarea-show-count {
    margin-bottom: 22px;
  }

  .ant-radio-wrapper,
  .ant-checkbox-wrapper {
    flex-direction: ${({ alignment }) =>
      alignment === "left" ? "row-reverse" : "row"};
  }

  .ant-tree-switcher {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ant-rate {
    color: ${({ accentColor }) => accentColor};
  }

  .ant-rate .bp3-icon.antd-rate-icon,
  .ant-switch .bp3-icon.antd-inner-icon {
    color: inherit !important;
  }
`;

export const AntdImageContainer = styled.div<{
  borderRadius: string;
  boxShadow?: string;
  defaultImageUrl: string;
  imageUrl: string;
  objectFit?: string;
  horizontalPositionMemo: string;
  verticalPositionMemo: string;
}>`
  height: 100%;
  .ant-image {
    // max-width: 100%;
    // max-height: 100%;
  }

  img,
  .ant-image-mask {
    object-fit: ${({ objectFit }) => objectFit || "contain"} !important;
    border-radius: ${({ borderRadius }) => borderRadius};
    box-shadow: ${({ boxShadow }) => boxShadow || "none"};
    overflow: hidden;
    object-position: ${({ horizontalPositionMemo, verticalPositionMemo }) =>
      `${horizontalPositionMemo} ${verticalPositionMemo}`};
  }
`;

export const ImagePreviewContainer = styled.div`
  .toolbar-wrapper {
    position: fixed;
    bottom: 32px;
    left: 50%;
    padding: 0px 24px;
    color: #fff;
    font-size: 20px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 100px;
    transform: translateX(-50%);
  }

  .toolbar-wrapper .anticon {
    padding: 12px;
    cursor: pointer;
  }

  .toolbar-wrapper .anticon[disabled] {
    cursor: not-allowed;
    opacity: 0.3;
  }

  .toolbar-wrapper .anticon:hover {
    opacity: 0.3;
  }
`;

export const AntdImageBackground = styled.div<{
  borderRadius: string;
  boxShadow?: string;
  imageUrl: string;
  defaultImageUrl: string;
  objectFit?: string;
}>`
  border-radius: ${({ borderRadius }) => borderRadius};
  box-shadow: ${({ boxShadow }) => boxShadow || "none"};
  background-image: url(${({ defaultImageUrl, imageUrl }) =>
    imageUrl || defaultImageUrl});

  overflow: hidden;
  height: 100%;
  position: relative;
  display: flex;
  background-size: ${({ objectFit }) => objectFit || "contain"};

  width: 100%;
  background-position: center center;
  background-repeat: no-repeat;
}
`;

export const BtnContent = styled.div<{
  placement?: ButtonPlacement;
  borderRadius?: string;
}>`
  justify-content: ${({ placement }) =>
    CheckboxGroupAlignmentTypes[placement || ButtonPlacementTypes.CENTER]};
  .bp3-icon {
    color: inherit !important;
  }
`;
