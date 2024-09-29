import { TableDropdown } from "@ant-design/pro-components";
import { Alignment } from "@blueprintjs/core";
import React from "react";
import { Colors } from "constants/Colors";

import type { ButtonAction } from "../../constants";
import { ButtonTypes, ColumnTypes } from "../../constants";
import IconRenderer from "widgets/Antd/Components/IconRenderer";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";

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
  type RenderMenuButtonProps = {
    button: ButtonAction;
    onClick: (button: ButtonAction) => void;
  };
  const renderMenuButton = ({ button, onClick }: RenderMenuButtonProps) => (
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
        configToken={{ paddingInline: 0, controlHeight: 22 }}
        iconAlign={button.iconAlign}
        iconColor={button.iconColor}
        iconName={button.menuIconName}
        iconSize={14}
        isDisabled={button.isDisabled}
        key={button.id}
        placement="CENTER"
        text={button.menuButtonLabel}
        tooltip={button.menuTooltip}
        widgetId={button.widgetId}
      />
    </TableDropdown>
  );

  type RenderButtonProps = {
    button: ButtonAction;
    onClick: (button: ButtonAction) => void;
  };
  const renderActionButton = ({ button, onClick }: RenderButtonProps) => (
    <ButtonComponent
      borderRadius={button.borderRadius}
      boxShadow={button.boxShadow}
      buttonColor={button.buttonColor || Colors.AZURE_RADIANCE}
      buttonSize={button.buttonSize || "sm"}
      buttonVariant={button.buttonVariant || "TERTIARY"}
      configToken={{ paddingInline: 0, controlHeight: 22 }}
      iconAlign={button.iconAlign}
      iconColor={button.iconColor}
      iconName={
        button.buttonType === ButtonTypes.BUTTON
          ? button.iconName
          : button.btnIconName
      }
      isDisabled={button.isDisabled}
      key={button.id}
      onClick={() => {
        onClick(button);
        // handleButtonClick(button, props, record, recordIndex, action);
      }}
      placement="CENTER"
      popconfirmMessage={button.popconfirmMessage}
      text={
        button.buttonType === ButtonTypes.ICON_BUTTON ? "" : button.buttonLabel
      }
      tooltip={button.tooltip}
      widgetId={button.widgetId}
    />
  );

  const getTableButtonRender = (
    buttonActions: Record<string, ButtonAction>,
    onClick: (button: ButtonAction) => void,
  ) => {
    const sortedButtons = Object.values(buttonActions)
      .sort((a, b) => a.index - b.index)
      .filter((c) => c.showButton);

    return sortedButtons.map((button) =>
      button.buttonType === ButtonTypes.MENU_BUTTON
        ? renderMenuButton({ button, onClick })
        : renderActionButton({ button, onClick }),
    );
  };
  return {
    getTableButtonRender,
  };
};

export default useButtonRender;
