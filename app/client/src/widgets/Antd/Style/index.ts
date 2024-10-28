import type { ButtonPlacement } from "components/constants";
import {
  CheckboxGroupAlignmentTypes,
  ButtonPlacementTypes,
  AntdLabelPosition,
} from "components/constants";

import styled from "styled-components";

export const AntdProformContainer = styled.div<{
  fixedFooter?: boolean;
  scrollContents?: boolean;
  labelAlign?: string;
  backgroundColor?: string;
  borderRadius?: string;
  borderColor?: string;
  borderWidth?: string;
  boxShadow?: string;
}>`
  &.antd-pro-form-jsonform {
    height: 100%;
    background-color: ${({ backgroundColor }) => backgroundColor};
    border-radius: ${({ borderRadius }) => borderRadius};
    border: ${({ borderWidth }) => borderWidth}px solid
      ${({ borderColor }) => borderColor};
    box-shadow: ${({ boxShadow }) => boxShadow};
    overflow: hidden;

    .ant-pro-form-list-container,
    .ant-space-item {
      flex: 1 1 100%;
    }
    .ant-space {
      width: 100%;
    }

    .ant-form {
      ${({ fixedFooter, scrollContents }) =>
        scrollContents ? "display: flex; flex-direction: column;" : ""};
      justify-content: ${({ fixedFooter }) =>
        fixedFooter ? "space-between" : ""};
      height: 100%;
      overflow: ${({ fixedFooter, scrollContents }) =>
        fixedFooter ? "hidden" : scrollContents ? "auto" : "hidden"};
    }

    .antd-pro-form-content {
      overflow: ${({ fixedFooter }) => (fixedFooter ? "auto" : "")};
    }
    .t--jsonformfield-root {
      padding-inline: 16px;
      padding-bottom: 0;
      margin-bottom: 0;
      overflow: ${({ fixedFooter, scrollContents }) =>
        fixedFooter ? "auto" : scrollContents ? "auto" : ""};
    }
    .antd-pro-form-submitter {
      padding-inline: 16px;
      padding-bottom: 16px;

      padding-top: ${({ fixedFooter }) => (fixedFooter ? "10px" : "")};
      background-color: ${({ backgroundColor }) => backgroundColor};
      ${({ fixedFooter }) =>
        fixedFooter ? "position: sticky; bottom: 0;" : ""};
    }

    .ant-form-vertical
      .ant-form-item:not(.ant-form-item-horizontal)
      .ant-form-item-label
      > label {
      height: auto;
    }

    .ant-form-item-control {
      margin-bottom: 16px;
    }
    .antd-jsonform-accordion-object > div > div > div > :last-child {
      margin-bottom: 0;

      .ant-form-item-control {
        margin-bottom: 0;
      }
    }
  }

  .antd-pro-form-title {
    font-size: 20px;
    font-weight: bold;
    margin: 16px 0;
    padding-inline: 16px;
  }
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
  colorPrimary?: string;
  labelAlign?: "left" | "right";
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
  div.ant-form-item
    div.ant-row.ant-form-item-row
    div.ant-form-item-label-wrap
    label {
    height: auto;
  }
  .ant-form-item-control .ant-form-item-control-input .ant-select-selector,
  .ant-transfer-list,
  .antd-input,
  .ant-picker,
  .ant-switch,
  div.ant-upload.ant-upload-select,
  .ant-radio-group-outline {
    box-shadow: ${({ boxShadow }) => boxShadow};
    overflow: hidden;
  }

  .ant-upload,
  .ant-picker,
  .ant-slider:not(.ant-slider-vertical) {
    width: 100%;
  }

  div.ant-upload.ant-upload-drag,
  .ant-tree,
  &.antd-jsonform-object-container {
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
    color: ${({ colorPrimary }) => colorPrimary};
  }

  .ant-rate .bp3-icon.antd-rate-icon,
  .ant-switch .bp3-icon.antd-inner-icon,
  &.antd-slider-container .bp3-icon.antd-inner-icon {
    color: inherit !important;
  }

  &.antd-slider-container .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &.antd-slider-container .icon-wrapper.vertical {
    flex-direction: column;
  }

  &.antd-jsonform-object-container {
    > .ant-form-item > .ant-form-item-row > .ant-form-item-label {
      text-align: ${({ labelAlign }) =>
        labelAlign == "left" ? "start" : "end"};
    }
    > .ant-form-item > .ant-form-item-row > .ant-form-item-control {
      margin-bottom: 0;
    }
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
