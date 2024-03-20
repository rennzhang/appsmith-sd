import React, { useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import Interweave from "interweave";
import type { IButtonProps } from "@blueprintjs/core";
import { Position } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";

import type { ComponentProps } from "widgets/BaseComponent";
import type { MenuItem } from "../constants";
import { useScript, AddScriptTo } from "utils/hooks/useScript";
import {
  GOOGLE_RECAPTCHA_KEY_ERROR,
  GOOGLE_RECAPTCHA_DOMAIN_ERROR,
  createMessage,
} from "@appsmith/constants/messages";

import ReCAPTCHA from "react-google-recaptcha";
import type { RecaptchaType } from "components/constants";
import { RecaptchaTypes } from "components/constants";
import { toast } from "design-system";
import { Breadcrumb } from "antd";

const RecaptchaWrapper = styled.div`
  position: relative;
  .grecaptcha-badge {
    visibility: hidden;
  }
`;

const ToolTipWrapper = styled.div`
  height: 100%;
  && .bp3-popover2-target {
    height: 100%;
    width: 100%;
    & > div {
      height: 100%;
    }
  }
`;

const TooltipStyles = createGlobalStyle`
  .btnTooltipContainer {
    .bp3-popover2-content {
      max-width: 350px;
      overflow-wrap: anywhere;
      padding: 10px 12px;
      border-radius: 0px;
    }
  }
`;

export type BaseBreadcrumbProps = {
  getVisibleItems: () => Array<MenuItem>;

  separator?: string;
};

// To be used in any other part of the app
export function BaseBreadcrumb(props: BaseBreadcrumbProps) {
  const { getVisibleItems, separator } = props;
  const visibleItems = getVisibleItems();

  return <Breadcrumb items={visibleItems} separator={separator} />;
}

interface RecaptchaProps {
  googleRecaptchaKey?: string;
  handleRecaptchaV2Loading?: (isLoading: boolean) => void;
  recaptchaType?: RecaptchaType;
}

interface ButtonComponentProps extends ComponentProps {
  tooltip?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  isDisabled?: boolean;
  isLoading: boolean;

  className?: string;
  getVisibleItems: () => Array<MenuItem>;

  separator?: string;
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
          props.clickWithRecaptcha(token);
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

  let validGoogleRecaptchaKey = props.googleRecaptchaKey;
  if (validGoogleRecaptchaKey && !checkValidJson(validGoogleRecaptchaKey)) {
    validGoogleRecaptchaKey = undefined;
  }
  const status = useScript(
    `https://www.google.com/recaptcha/api.js?render=${validGoogleRecaptchaKey}`,
    AddScriptTo.HEAD,
  );
  return <div className={props.className}>{props.children}</div>;
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

// To be used with the canvas
function ButtonComponent(props: ButtonComponentProps & RecaptchaProps) {
  const btnWrapper = (
    <BtnWrapper
      className={props.className}
      googleRecaptchaKey={props.googleRecaptchaKey}
      handleRecaptchaV2Loading={props.handleRecaptchaV2Loading}
      isDisabled={props.isDisabled}
      isLoading={props.isLoading}
      onClick={props.onClick}
      recaptchaType={props.recaptchaType}
    >
      <BaseBreadcrumb
        getVisibleItems={props.getVisibleItems}
        separator={props.separator || "/"}
      />
    </BtnWrapper>
  );
  if (props.tooltip) {
    return (
      <ToolTipWrapper>
        <TooltipStyles />
        <Popover2
          autoFocus={false}
          content={<Interweave content={props.tooltip} />}
          hoverOpenDelay={200}
          interactionKind="hover"
          portalClassName="btnTooltipContainer"
          position={Position.TOP}
        >
          {btnWrapper}
        </Popover2>
      </ToolTipWrapper>
    );
  } else {
    return btnWrapper;
  }
}

export default ButtonComponent;
