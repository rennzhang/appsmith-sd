import type { Key } from "react";
import { useMemo } from "react";
import type { ProTableProps } from "@ant-design/pro-components";
import type { AntdTableProps, ButtonAction } from "../../constants";
import { InlineEditingSaveOptions, ColumnTypes } from "../../constants";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
import { Colors } from "constants/Colors";
import { AddNewRowActions } from "../Constants";

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
    const { editType, tableData } = props;
    const _editableKeys = props.editableKeys;
    const editableIndices = props.editableIndices;
    // 优先使用editableKeys，其次使用editableIndices，editableIndices需要计算出对应的key
    const keys =
      _editableKeys?.length > 0
        ? _editableKeys
        : editableIndices?.map(
            (index) => tableData[index]?.[props.primaryColumnId || ""],
          );

    if (props.inlineEditingSaveOption === InlineEditingSaveOptions.ROW_LEVEL) {
      const sortedButtons = Object.values(props.editingActions)
        .sort((a, b) => a.index - b.index)
        .filter((c) => c.showButton);

      const saveButtonConfig = getButtonConfigs(sortedButtons, "save");
      const cancelButtonConfig = getButtonConfigs(sortedButtons, "cancel");
      const deleteButtonConfig = getButtonConfigs(sortedButtons, "delete");

      return {
        type: editType || "multiple",
        editableKeys: keys as Key[],
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
        onSave: async (key, row, originRow, newLineConfig) => {
          console.log("Antd 表格 onSave: ", {
            key,
            row,
            originRow,
            newLineConfig,
          });

          if (saveButtonConfig) {
            if (newLineConfig) {
              return props.handleAddNewRowAction(
                AddNewRowActions.SAVE,
                originRow,

                () => {
                  return "";
                },
              );
            }
            await props.handleRowActionClick(
              saveButtonConfig.onBtnClick,
              originRow,
            );
          }
        },
        onCancel: async (key, row, originRow, newLineConfig) => {
          console.log("Antd 表格 onCancel: ", {
            key,
            row,
            originRow,
            newLineConfig,
          });
          if (cancelButtonConfig) {
            if (newLineConfig) {
              return props.handleAddNewRowAction(
                AddNewRowActions.DISCARD,
                originRow,

                () => {
                  return "";
                },
              );
            }
            await props.handleRowActionClick(
              cancelButtonConfig.onBtnClick,
              originRow,
            );
          }
        },
        onDelete: async (key, row) => {
          if (deleteButtonConfig) {
            await props.handleRowActionClick(
              deleteButtonConfig.onBtnClick,
              row,
            );
          }
        },
        onChange: (key, row) => {
          console.log("表格 editable onChange: ", key, row);
          props.handleEditableRowChange({
            editableKeys: key,
            editableRecords: row,
          });
        },
        onValuesChange: (record, dataSource) => {
          console.log("表格 editable onValuesChange: ", record, dataSource);
          if (!record) return;
          requestAnimationFrame(() => {
            props.handleEditableValuesChange({
              originalIndex: record.__originalIndex__,
              record: record,
              rowIndex: record.rowIndex,
            });
          });
        },
      };
    }
    return undefined;
  }, [
    props.tableData,
    props.inlineEditingSaveOption,
    props.editingActions,
    props.editableKeys,
    props.editableIndices,
    props.handleRowActionClick,
    props.primaryColumnId,
  ]);
};
