import { TableDropdown } from "@ant-design/pro-components";
import { Alignment } from "@blueprintjs/core";
import React from "react";
import { Colors } from "constants/Colors";

import type { AntdTableProps, ButtonAction } from "../../constants";
import { ButtonTypes, ColumnTypes } from "../../constants";
import IconRenderer from "widgets/Antd/Components/IconRenderer";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
type RenderMenuButtonProps = {
  button: ButtonAction;
  onClick: (button: ButtonAction) => void;
  configToken: any;
  isHide?: (button: ButtonAction) => boolean;
  isLoading?: (button: ButtonAction) => boolean;
};
type RenderButtonProps = {
  button: ButtonAction;
  onClick: (button: ButtonAction) => void;
  configToken: any;
  isHide?: (button: ButtonAction) => boolean;
  isLoading?: (button: ButtonAction) => boolean;
};
export const useButtonRender = () => {
  const renderMenuItemContent = (
    menuItem: any,
    onMenuItemClick: (menuItem: ButtonAction) => void,
  ) => (
    <div
      className="inline-flex justify-center items-center"
      style={{
        color: menuItem.textColor,
        backgroundColor: menuItem.backgroundColor,
      }}
    >
      {menuItem.iconAlign !== Alignment.RIGHT && menuItem.iconName && (
        <IconRenderer
          className="mr-1"
          color={menuItem.iconColor || "currentColor"}
          icon={menuItem.iconName}
          size={14}
        />
      )}
      <span
        onClick={() => {
          onMenuItemClick(menuItem);
        }}
      >
        {menuItem.label}
      </span>
      {menuItem.iconAlign === Alignment.RIGHT && menuItem.iconName && (
        <IconRenderer
          className="ml-1"
          color={menuItem.iconColor || "currentColor"}
          icon={menuItem.iconName}
          size={14}
        />
      )}
    </div>
  );

  const renderMenuButton = ({
    button,
    configToken,
    isHide,
    isLoading,
    onClick,
  }: RenderMenuButtonProps) => {
    const isHidden = isHide ? isHide(button) : false;
    return (
      !isHidden && (
        <TableDropdown
          key="actionGroup"
          menus={Object.values(button.menuItems || {})
            .filter((c) => c.isVisible)
            ?.map((c) => ({
              disabled: c.isDisabled,
              key: c.id,
              name: renderMenuItemContent(c, onClick),
            }))}
          style={{ color: button.buttonColor }}
        >
          <ButtonComponent
            borderRadius={button.borderRadius}
            boxShadow={button.boxShadow}
            buttonColor={button.buttonColor || Colors.AZURE_RADIANCE}
            buttonSize={button.buttonSize || "sm"}
            buttonVariant={button.buttonVariant || "TERTIARY"}
            followParentTheme
            iconAlign={button.iconAlign}
            iconColor={button.iconColor}
            iconName={button.menuIconName}
            iconSize={14}
            isDisabled={button.isDisabled}
            key={button.id}
            loading={isLoading ? isLoading(button) : false}
            placement="CENTER"
            text={button.menuButtonLabel}
            tooltip={button.menuTooltip}
            widgetId={button.widgetId}
          />
        </TableDropdown>
      )
    );
  };

  const renderActionButton = ({
    button,
    configToken,
    isHide,
    isLoading,
    onClick,
  }: RenderButtonProps) => {
    const isHidden = isHide ? isHide(button) : false;
    return (
      !isHidden && (
        <ButtonComponent
          {...button}
          buttonColor={button.buttonColor || Colors.AZURE_RADIANCE}
          buttonSize={button.buttonSize || "sm"}
          buttonVariant={button.buttonVariant || "TERTIARY"}
          configToken={configToken}
          iconName={
            button.buttonType === ButtonTypes.BUTTON || !button.buttonType
              ? button.iconName
              : button.btnIconName
          }
          key={button.id}
          loading={isLoading ? isLoading(button) : false}
          onClick={() => {
            onClick?.(button);
          }}
          placement={button.placement || "CENTER"}
          text={
            button.buttonType === ButtonTypes.ICON_BUTTON
              ? ""
              : button.buttonLabel
          }
        />
      )
    );
  };

  const getTableButtonRender = (
    buttonActions: Record<string, ButtonAction>,
    {
      configToken,
      isHide,
      isLoading,
      onClick,
    }: {
      onClick: (button: ButtonAction) => void;
      configToken?: any;
      isHide?: (button: ButtonAction) => boolean;
      isLoading?: (button: ButtonAction) => boolean;
    },
  ) => {
    const sortedButtons = Object.values(buttonActions)
      .sort((a, b) => a.index - b.index)
      .filter((c) => c.showButton);

    return sortedButtons.map((button) =>
      button.buttonType === ButtonTypes.MENU_BUTTON
        ? renderMenuButton({ button, onClick, configToken, isHide, isLoading })
        : renderActionButton({
            button,
            onClick,
            configToken,
            isHide,
            isLoading,
          }),
    );
  };
  return {
    renderActionButton,
    getTableButtonRender,
  };
};

export default useButtonRender;
