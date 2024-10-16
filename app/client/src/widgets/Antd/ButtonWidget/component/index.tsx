import React, { useMemo, useRef, useState } from "react";
import styled from "styled-components";
import type { MaybeElement } from "@blueprintjs/core";
import { Alignment } from "@blueprintjs/core";
import { Button, ConfigProvider, Tooltip, Popconfirm } from "antd";
import type { IconName } from "@blueprintjs/icons";
import type { SeedToken } from "antd/es/theme/interface";
// antd Button component
import type { ComponentToken as ButtonComponentToken } from "antd/es/button/style";
import type { ComponentProps } from "widgets/BaseComponent";

import { useScript, ScriptStatus, AddScriptTo } from "utils/hooks/useScript";
import {
  GOOGLE_RECAPTCHA_KEY_ERROR,
  GOOGLE_RECAPTCHA_DOMAIN_ERROR,
  createMessage,
} from "@appsmith/constants/messages";

import ReCAPTCHA from "react-google-recaptcha";
import _ from "lodash";
import type {
  ButtonPlacement,
  ButtonVariant,
  RecaptchaType,
} from "components/constants";
import {
  ButtonPlacementTypes,
  ButtonVariantTypes,
  CheckboxGroupAlignmentTypes,
  RecaptchaTypes,
} from "components/constants";
import type { ButtonProps } from "design-system";
import { toast } from "design-system";
import IconRenderer from "../../Components/IconRenderer";

const RecaptchaWrapper = styled.div`
  position: relative;
  .grecaptcha-badge {
    visibility: hidden;
  }
`;

export enum ButtonType {
  SUBMIT = "submit",
  RESET = "reset",
  BUTTON = "button",
}

interface RecaptchaProps {
  googleRecaptchaKey?: string;
  clickWithRecaptcha?: (token: string) => void;
  handleRecaptchaV2Loading?: (isLoading: boolean) => void;
  recaptchaType?: RecaptchaType;
}
interface ButtonComponentProps extends ComponentProps {
  buttonWidth?: number;
  isGhost?: boolean;
  loading?: boolean;
  followParentTheme?: boolean;
  iconSize?: number;
  configToken?: Partial<ButtonComponentToken & SeedToken>;
  text?: string;
  icon?: IconName | MaybeElement;
  tooltip?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  isDisabled?: boolean;
  isLoading?: boolean;
  rightIcon?: IconName | MaybeElement;
  type?: ButtonType;
  buttonColor?: string;
  buttonVariant?: ButtonVariant;
  borderRadius?: string;
  boxShadow?: string;
  boxShadowColor?: string;
  iconName?: IconName;
  iconAlign?: Alignment;
  placement?: ButtonPlacement;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  buttonSize?: ButtonProps["size"];
  iconColor?: string;
  textColor?: string;
  popconfirmMessage?: string;
}

const StyledDButtonBox = styled.div<{
  buttonWidth?: number;
  boxShadow?: string;
  borderRadius?: string;
}>`
  padding: 0;
  min-width: ${({ buttonWidth }) => buttonWidth}px;
  overflow: hidden;
  box-shadow: ${({ boxShadow }) => boxShadow};
  border-radius: ${({ borderRadius }) => borderRadius};
`;
const StyledDropdownBtnContent = styled.div<{
  placement?: ButtonPlacement;
  borderRadius?: string;
  iconSize?: number;
}>`
  width: 100%;
  justify-content: ${({ placement }) =>
    CheckboxGroupAlignmentTypes[placement || ButtonPlacementTypes.CENTER]};
  .bp3-icon {
    color: inherit !important;
  }
  svg {
    width: ${({ iconSize }) => iconSize}px;
    height: ${({ iconSize }) => iconSize}px;
  }
`;

// To be used with the canvas
function ButtonComponent(props: ButtonComponentProps & RecaptchaProps) {
  const {
    borderRadius,
    boxShadow,
    buttonColor,
    buttonSize,
    buttonVariant,
    buttonWidth,
    configToken,
    followParentTheme,
    iconAlign,
    iconColor,
    iconName,
    iconSize,
    isGhost,
    loading,
    onClick,
    placement,
    popconfirmMessage,
  } = props;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!popconfirmMessage) {
      onClick?.(event);
    }
  };

  const buttonType = useMemo(() => {
    switch (buttonVariant) {
      case ButtonVariantTypes.SECONDARY:
        return "default";
      case ButtonVariantTypes.TERTIARY:
        return "link";
      default:
        return "primary";
    }
  }, [buttonVariant]);
  const buttonContent = useMemo(
    () => (
      <StyledDButtonBox
        borderRadius={borderRadius}
        boxShadow={boxShadow}
        buttonWidth={buttonWidth}
      >
        <Button
          block
          className="w-full"
          disabled={props.isDisabled}
          ghost={isGhost}
          loading={loading}
          onClick={handleClick}
          size={buttonSize}
          style={{ width: buttonWidth }}
          type={buttonType}
        >
          <StyledDropdownBtnContent
            className="w-full h-full flex items-center"
            iconSize={iconSize}
            placement={placement}
          >
            {iconAlign !== Alignment.RIGHT && iconName && (
              <IconRenderer
                className={props.text ? "mr-1" : ""}
                color={iconColor}
                icon={iconName}
                size={iconSize}
              />
            )}
            {props.text && (
              <span style={{ color: props.textColor }}>{props.text}</span>
            )}
            {iconAlign === Alignment.RIGHT && iconName && (
              <IconRenderer
                className={props.text ? "ml-1" : ""}
                color={iconColor}
                icon={iconName}
                size={iconSize}
              />
            )}
          </StyledDropdownBtnContent>
        </Button>
      </StyledDButtonBox>
    ),
    [
      borderRadius,
      boxShadow,
      buttonWidth,
      buttonSize,
      buttonType,
      iconAlign,
      iconName,
      iconSize,
      props.text,
      props.textColor,
      props.isDisabled,
      props.isGhost,
      props.loading,
      props.onClick,
      props.placement,
      props.popconfirmMessage,
    ],
  );
  const buttonWithTheme = (
    <ConfigProvider
      theme={{
        inherit: true,
        components: {
          Button: {
            algorithm: true,
            colorPrimary: buttonColor || undefined,
            colorLink: buttonColor || undefined,
            borderRadius: (borderRadius as unknown as number) || 0,
            ...(configToken || {}),
          },
        },
      }}
    >
      {buttonContent}
    </ConfigProvider>
  );

  const getButton = useMemo(() => {
    if (followParentTheme) {
      return buttonContent;
    }
    return buttonWithTheme;
  }, [followParentTheme, buttonContent, buttonWithTheme]);

  console.log("AntdButtonComponent", props);

  return (
    <Tooltip placement="top" title={props.tooltip}>
      {popconfirmMessage ? (
        <Popconfirm
          cancelText="取消"
          okText="确认"
          onConfirm={onClick as () => void}
          title={popconfirmMessage}
        >
          {getButton}
        </Popconfirm>
      ) : (
        getButton
      )}
    </Tooltip>
  );
}

export default ButtonComponent;
