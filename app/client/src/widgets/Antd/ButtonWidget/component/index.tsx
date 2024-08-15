import React, { useRef, useState } from "react";
import styled from "styled-components";
import type { MaybeElement } from "@blueprintjs/core";
import { Alignment } from "@blueprintjs/core";
import { Button, ConfigProvider, Tooltip } from "antd";
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
import { Icon } from "@blueprintjs/core";

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
}

type RecaptchaV2ComponentPropType = {
  children: any;
  className?: string;
  isDisabled?: boolean;
  recaptchaType?: RecaptchaType;
  isLoading: boolean;
  handleError: (event: React.MouseEvent<HTMLElement>, error: string) => void;
};

function RecaptchaV2Component(
  props: RecaptchaV2ComponentPropType & RecaptchaProps,
) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isInvalidKey, setInvalidKey] = useState(false);
  const handleRecaptchaLoading = (isloading: boolean) => {
    props.handleRecaptchaV2Loading && props.handleRecaptchaV2Loading(isloading);
  };
  const handleBtnClick = async (event: React.MouseEvent<HTMLElement>) => {
    if (props.isDisabled) return;
    if (props.isLoading) return;
    if (isInvalidKey) {
      // Handle incorrent google recaptcha site key
      props.handleError(event, createMessage(GOOGLE_RECAPTCHA_KEY_ERROR));
    } else {
      handleRecaptchaLoading(true);
      try {
        await recaptchaRef?.current?.reset();
        const token = await recaptchaRef?.current?.executeAsync();
        if (token) {
          props?.clickWithRecaptcha?.(token);
        } else {
          // Handle incorrent google recaptcha site key
          props.handleError(event, createMessage(GOOGLE_RECAPTCHA_KEY_ERROR));
        }
        handleRecaptchaLoading(false);
      } catch (err) {
        handleRecaptchaLoading(false);
        // Handle error due to google recaptcha key of different domain
        props.handleError(event, createMessage(GOOGLE_RECAPTCHA_DOMAIN_ERROR));
      }
    }
  };
  return (
    <RecaptchaWrapper className={props.className} onClick={handleBtnClick}>
      {props.children}
      <ReCAPTCHA
        onErrored={() => setInvalidKey(true)}
        ref={recaptchaRef}
        sitekey={props.googleRecaptchaKey || ""}
        size="invisible"
      />
    </RecaptchaWrapper>
  );
}

type RecaptchaV3ComponentPropType = {
  children: any;
  className?: string;
  isDisabled?: boolean;
  recaptchaType?: RecaptchaType;
  isLoading: boolean;
  handleError: (event: React.MouseEvent<HTMLElement>, error: string) => void;
};

function RecaptchaV3Component(
  props: RecaptchaV3ComponentPropType & RecaptchaProps,
) {
  // Check if a string is a valid JSON string
  const checkValidJson = (inputString: string): boolean => {
    return !inputString.includes('"');
  };

  const handleBtnClick = (event: React.MouseEvent<HTMLElement>) => {
    if (props.isDisabled) return;
    if (props.isLoading) return;
    if (status === ScriptStatus.READY) {
      (window as any).grecaptcha.ready(() => {
        try {
          (window as any).grecaptcha
            .execute(props.googleRecaptchaKey, {
              action: "submit",
            })
            .then((token: any) => {
              props?.clickWithRecaptcha?.(token);
            })
            .catch(() => {
              // Handle incorrent google recaptcha site key
              props.handleError(
                event,
                createMessage(GOOGLE_RECAPTCHA_KEY_ERROR),
              );
            });
        } catch (err) {
          // Handle error due to google recaptcha key of different domain
          props.handleError(
            event,
            createMessage(GOOGLE_RECAPTCHA_DOMAIN_ERROR),
          );
        }
      });
    }
  };

  let validGoogleRecaptchaKey = props.googleRecaptchaKey;
  if (validGoogleRecaptchaKey && !checkValidJson(validGoogleRecaptchaKey)) {
    validGoogleRecaptchaKey = undefined;
  }
  const status = useScript(
    `https://www.google.com/recaptcha/api.js?render=${validGoogleRecaptchaKey}`,
    AddScriptTo.HEAD,
  );
  return (
    <div className={props.className} onClick={handleBtnClick}>
      {props.children}
    </div>
  );
}

const Wrapper = styled.div`
  height: 100%;
`;

function BtnWrapper(
  props: {
    children: any;
    className?: string;
    isDisabled?: boolean;
    isLoading: boolean;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  } & RecaptchaProps,
) {
  const hasOnClick = Boolean(
    props.onClick && !props.isLoading && !props.isDisabled,
  );
  if (!props.googleRecaptchaKey) {
    return (
      <Wrapper
        className={props.className}
        onClick={hasOnClick ? props.onClick : undefined}
      >
        {props.children}
      </Wrapper>
    );
  } else {
    const handleError = (
      event: React.MouseEvent<HTMLElement>,
      error: string,
    ) => {
      toast.show(error, {
        kind: "error",
      });
      props.onClick && !props.isLoading && props.onClick(event);
    };
    if (props.recaptchaType === RecaptchaTypes.V2) {
      return <RecaptchaV2Component {...props} handleError={handleError} />;
    } else {
      return <RecaptchaV3Component {...props} handleError={handleError} />;
    }
  }
}

const StyledDButtonBox = styled.div<{
  boxShadow?: string;
  borderRadius?: string;
}>`
  padding: 0;
  min-width: 0px;
  overflow: hidden;
  box-shadow: ${({ boxShadow }) => boxShadow};
  border-radius: ${({ borderRadius }) => borderRadius};
`;
const StyledDropdownBtnContent = styled.div<{
  placement?: ButtonPlacement;
  borderRadius?: string;
}>`
  justify-content: ${({ placement }) =>
    CheckboxGroupAlignmentTypes[placement || ButtonPlacementTypes.CENTER]};
  .bp3-icon {
    color: inherit !important;
  }
`;
// To be used with the canvas
function ButtonComponent(props: ButtonComponentProps & RecaptchaProps) {
  console.log("ButtonComponent props", props);
  const hasOnClick = Boolean(
    props.onClick && !props.isLoading && !props.isDisabled,
  );
  const {
    borderRadius,
    boxShadow,
    buttonColor,
    buttonSize,
    buttonVariant,
    configToken,
    iconAlign,
    iconName,
    placement,
  } = props;
  const btnWrapper = (
    <BtnWrapper
      className={props.className}
      clickWithRecaptcha={props.clickWithRecaptcha}
      googleRecaptchaKey={props.googleRecaptchaKey}
      handleRecaptchaV2Loading={props.handleRecaptchaV2Loading}
      isDisabled={props.isDisabled}
      isLoading={!!props.isLoading}
      recaptchaType={props.recaptchaType}
    >
      <ConfigProvider
        theme={{
          components: {
            Button: {
              algorithm: true,
              colorPrimary: buttonColor,
              colorLink: buttonColor,
              borderRadius: (borderRadius as unknown as number) || 0,
              ...(configToken || {}),
            },
          },
        }}
      >
        {/* large | middle | small */}
        <Button
          block
          className="w-full"
          disabled={props.isDisabled}
          ghost={buttonVariant === ButtonVariantTypes.SECONDARY}
          onClick={(e) => e.preventDefault()}
          size={buttonSize}
          type={
            buttonVariant === ButtonVariantTypes.TERTIARY ? "link" : "primary"
          }
        >
          <StyledDropdownBtnContent
            className="w-full h-full flex items-center"
            placement={placement}
          >
            {iconAlign !== Alignment.RIGHT && iconName ? (
              <Icon className="mr-1" icon={iconName} />
            ) : null}
            {props.text}
            {iconAlign == Alignment.RIGHT && iconName ? (
              <Icon className="ml-1" icon={iconName} />
            ) : null}
          </StyledDropdownBtnContent>
        </Button>
      </ConfigProvider>
    </BtnWrapper>
  );
  return (
    <Tooltip placement="top" title={props.tooltip}>
      <StyledDButtonBox borderRadius={borderRadius} boxShadow={boxShadow}>
        <ConfigProvider
          theme={{
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
          {/* large | middle | small */}
          <Button
            block
            className="w-full"
            disabled={props.isDisabled}
            ghost={buttonVariant === ButtonVariantTypes.SECONDARY}
            onClick={props.onClick}
            size={buttonSize}
            type={
              buttonVariant === ButtonVariantTypes.TERTIARY ? "link" : "primary"
            }
          >
            <StyledDropdownBtnContent
              className="w-full h-full flex items-center"
              placement={placement}
            >
              {iconAlign !== Alignment.RIGHT && iconName ? (
                <Icon className="mr-1" icon={iconName} />
              ) : null}
              {props.text}
              {iconAlign == Alignment.RIGHT && iconName ? (
                <Icon className="ml-1" icon={iconName} />
              ) : null}
            </StyledDropdownBtnContent>
          </Button>
        </ConfigProvider>
      </StyledDButtonBox>
    </Tooltip>
  );
}

export default ButtonComponent;
