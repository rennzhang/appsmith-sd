import styled from "styled-components";
import { Alignment, Icon } from "@blueprintjs/core";

import type { ButtonPlacement } from "components/constants";
import {
  ButtonVariantTypes,
  CheckboxGroupAlignmentTypes,
  ButtonPlacementTypes,
} from "components/constants";
import type { MenuButtonComponentProps, MenuItem } from "../constants";
import { Button, ConfigProvider, Dropdown } from "antd";
const StyledDropdownBox = styled.div<{
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
const BaseMenuItem = styled.div<{
  backgroundColor?: string;
  isCompact?: boolean;
}>`
  font-family: var(--wds-font-family);
  ${({ backgroundColor }) =>
    backgroundColor
      ? `background-color: ${backgroundColor} !important;`
      : `background: none !important`}
  ${({ isCompact }) =>
    isCompact &&
    `
      padding-top: 3px !important;
      padding-bottom: 3px !important;
      font-size: 12px;
  `}
`;
type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
// ts部分key 改为可选
type DropdownCompProps = PartialKeys<
  MenuButtonComponentProps,
  "width" | "widgetId"
>;

function DropdownComp(props: DropdownCompProps) {
  const {
    borderRadius,
    boxShadow,
    buttonColor,
    buttonSize,
    buttonVariant,
    getVisibleItems,
    iconAlign,
    iconName,
    isCompact,
    isDisabled,
    label,
    menuPosition,
    menuTrigger,
    onItemClicked,
    placement,
  } = props;

  const visibleItems = getVisibleItems();
  console.log(" visibleItems", visibleItems);
  const listItems = visibleItems.map((item: MenuItem, index: number) => {
    const {
      backgroundColor,
      // children,
      danger,
      disabled,
      iconAlign,
      iconColor,
      iconName,
      id,
      isDisabled,
      label,
      onClick,
      textColor,
    } = item;

    const disabledAlias = isDisabled || disabled;

    return {
      // children,
      danger,
      key: id,
      disabled: disabledAlias,
      label: (
        <BaseMenuItem
          backgroundColor={backgroundColor}
          className="flex items-center h-full w-full"
          isCompact={isCompact}
          key={id}
          onClick={() =>
            disabledAlias ? false : onItemClicked(onClick, index)
          }
        >
          {iconAlign !== Alignment.RIGHT && iconName ? (
            <Icon
              className="mr-1"
              color={iconColor || "currentColor"}
              icon={iconName}
            />
          ) : null}
          <span style={{ color: textColor }}>{label}</span>

          {iconAlign === Alignment.RIGHT && iconName ? (
            <Icon
              className="ml-1"
              color={iconColor || "currentColor"}
              icon={iconName}
            />
          ) : null}
        </BaseMenuItem>
      ),
    };
  });

  return (
    <Dropdown
      arrow
      autoAdjustOverflow
      autoFocus
      menu={{
        items: listItems,
      }}
      overlayStyle={{ width: "max-content" }}
      placement={menuPosition || "bottomLeft"}
      trigger={[menuTrigger || "hover"]}
    >
      <StyledDropdownBox borderRadius={borderRadius} boxShadow={boxShadow}>
        <ConfigProvider
          theme={{
            components: {
              Button: {
                algorithm: true,
                colorPrimary: buttonColor,
                colorLink: buttonColor,
                borderRadius: (borderRadius as unknown as number) || 0,
              },
            },
          }}
        >
          {/* large | middle | small */}
          <Button
            block
            className="w-full"
            disabled={isDisabled}
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
              {label}
              {iconAlign == Alignment.RIGHT && iconName ? (
                <Icon className="ml-1" icon={iconName} />
              ) : null}
            </StyledDropdownBtnContent>
          </Button>
        </ConfigProvider>
      </StyledDropdownBox>
    </Dropdown>
  );
}

function MenuButtonComponent(props: MenuButtonComponentProps) {
  console.log("MenuButtonComponent props", props);
  const {
    borderRadius,
    boxShadow,
    buttonColor,
    buttonSize,
    buttonVariant,
    configureMenuItems,
    getVisibleItems,
    iconAlign,
    iconName,
    isCompact,
    isDisabled,
    label,
    menuItems,
    menuItemsSource,
    menuPosition,
    menuTrigger,
    onItemClicked,
    placement,
    sourceData,
  } = props;

  return (
    <DropdownComp
      borderRadius={borderRadius}
      boxShadow={boxShadow}
      buttonColor={buttonColor}
      buttonSize={buttonSize}
      buttonVariant={buttonVariant}
      configureMenuItems={configureMenuItems}
      getVisibleItems={getVisibleItems}
      iconAlign={iconAlign}
      iconName={iconName}
      isCompact={isCompact}
      isDisabled={isDisabled}
      label={label}
      menuItems={menuItems}
      menuItemsSource={menuItemsSource}
      menuPosition={menuPosition}
      menuTrigger={menuTrigger}
      onItemClicked={onItemClicked}
      placement={placement}
      sourceData={sourceData}
    />
  );
}

export default MenuButtonComponent;
