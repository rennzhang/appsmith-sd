import { useMemo } from "react";
import type { ProTableProps } from "@ant-design/pro-components";
import type { AntdTableProps, ButtonAction } from "../../constants";
import { InlineEditingSaveOptions, ColumnTypes } from "../../constants";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
import { Colors } from "constants/Colors";

const createButtonComponent = (
  buttonConfig: ButtonAction,
  defaultColor: string,
) => (
  <ButtonComponent
    buttonColor={buttonConfig.buttonColor || defaultColor}
    buttonSize="sm"
    buttonVariant="TERTIARY"
    configToken={{ paddingInline: 0, controlHeight: 22 }}
    iconAlign={buttonConfig.iconAlign}
    iconName={
      buttonConfig.columnType === ColumnTypes.BUTTON
        ? buttonConfig.iconName
        : buttonConfig.btnIconName
    }
    text={
      buttonConfig.columnType === ColumnTypes.ICON_BUTTON
        ? ""
        : buttonConfig.buttonLabel
    }
    widgetId={buttonConfig.widgetId}
  />
);

const getButtonConfigs = (buttons: ButtonAction[], id: string): ButtonAction =>
  buttons.find((b) => b.id === id) as ButtonAction;

export const useEditableState = (props: AntdTableProps) => {
  return useMemo((): ProTableProps<any, any>["editable"] => {
    if (props.inlineEditingSaveOption === InlineEditingSaveOptions.ROW_LEVEL) {
      const sortedButtons = Object.values(props.editingActions)
        .sort((a, b) => a.index - b.index)
        .filter((c) => c.showButton);

      const saveButtonConfig = getButtonConfigs(sortedButtons, "save");
      const cancelButtonConfig = getButtonConfigs(sortedButtons, "cancel");
      const deleteButtonConfig = getButtonConfigs(sortedButtons, "delete");

      return {
        type: "multiple",
        deletePopconfirmMessage: "确定删除吗？",
        saveText: createButtonComponent(
          saveButtonConfig,
          Colors.AZURE_RADIANCE,
        ),
        cancelText: createButtonComponent(
          cancelButtonConfig,
          Colors.AZURE_RADIANCE,
        ),
        deleteText: createButtonComponent(
          deleteButtonConfig,
          Colors.AZURE_RADIANCE,
        ),
        onSave: async (key, row) => {
          if (saveButtonConfig) {
            await props.columnActionClick(saveButtonConfig.onBtnClick, row, 0);
          }
        },
        onCancel: async (key, row) => {
          if (cancelButtonConfig) {
            await props.columnActionClick(
              cancelButtonConfig.onBtnClick,
              row,
              0,
            );
          }
        },
        onDelete: async (key, row) => {
          if (deleteButtonConfig) {
            await props.columnActionClick(
              deleteButtonConfig.onBtnClick,
              row,
              0,
            );
          }
        },
      };
    }
    return undefined;
  }, [
    props.inlineEditingSaveOption,
    props.editingActions,
    props.columnActionClick,
  ]);
};
