import React, { useEffect, useMemo, useState, useCallback } from "react";
import type { Key, ReactNode } from "react";
import type { ProTableProps, ActionType } from "@ant-design/pro-components";
import type { AntdTableProps, ButtonAction } from "../../constants";
import {
  TableInlineEditTypes,
  ColumnTypes,
  ButtonTypes,
} from "../../constants";
import ButtonComponent from "widgets/Antd/ButtonWidget/component";
import { Colors } from "constants/Colors";
import { AddNewRowActions } from "../Constants";
import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { isEqual } from "lodash";

const ButtonComponentWrapper = React.memo(
  ({
    buttonConfig,
    defaultColor,
  }: {
    buttonConfig: ButtonAction;
    defaultColor: string;
  }) => (
    <ButtonComponent
      borderRadius={buttonConfig.borderRadius}
      boxShadow={buttonConfig.boxShadow}
      buttonColor={buttonConfig.buttonColor || defaultColor}
      buttonSize={buttonConfig.buttonSize || "sm"}
      buttonVariant={buttonConfig.buttonVariant || "TERTIARY"}
      configToken={{ paddingInline: 0, controlHeight: 22 }}
      iconAlign={buttonConfig.iconAlign}
      iconColor={buttonConfig.iconColor || defaultColor}
      iconName={
        buttonConfig.buttonType === ButtonTypes.BUTTON
          ? buttonConfig.iconName
          : buttonConfig.btnIconName
      }
      text={
        buttonConfig.buttonType === ButtonTypes.ICON_BUTTON
          ? ""
          : buttonConfig.buttonLabel
      }
      widgetId={buttonConfig.widgetId}
    />
  ),
  (prevProps, nextProps) => {
    console.log("prevProps", prevProps);
    console.log("nextProps", nextProps);
    return !isEqual(prevProps.buttonConfig, nextProps.buttonConfig);
  },
);

const getButtonConfigs = (
  buttons: ButtonAction[],
  id: string,
): ButtonAction | undefined => buttons.find((b) => b.id === id);

export const useEditableState = (
  props: AntdTableProps,
  actionRef: React.RefObject<ActionType>,
) => {
  const [editableKeys, setEditableKeys] = useState<Key[]>([]);
  const {
    editableKeys: propsEditableKeys,
    editingActions,
    editType,
    primaryColumnId,
    tableData,
    tableInlineEditType,
  } = props;
  useEffect(() => {
    const keys = propsEditableKeys?.length > 0 ? propsEditableKeys : [];

    setEditableKeys(keys as Key[]);
  }, [props.editableKeys, props.tableData, props.primaryColumnId]);

  const handleAddNewRow = useCallback(() => {
    const newId = Date.now();
    props.handleAddNewRow(newId);
    actionRef.current?.addEditRecord(
      {
        id: newId,
        ...(props.defaultNewRow || {}),
      },
      {
        newRecordType: "cache",
        position: props.addNewRowPosition,
      },
    );
  }, [
    props.handleAddNewRow,
    props.defaultNewRow,
    props.addNewRowPosition,
    actionRef,
  ]);

  const addNewRowBtn = useMemo<ReactNode>(
    () =>
      props.allowAddNewRow && props.tableType !== "edit" ? (
        <Button
          icon={<PlusOutlined />}
          key="button"
          onClick={handleAddNewRow}
          type="primary"
        >
          {props.addNewRowText || "新增"}
        </Button>
      ) : null,
    [props.allowAddNewRow, props.addNewRowText, handleAddNewRow],
  );

  const editable = useMemo((): ProTableProps<any, any>["editable"] => {
    const {
      handleEditableRowChange,
      handleEditableValuesChange,
      handleRowBtnClick,
    } = props;

    if (tableInlineEditType === TableInlineEditTypes.ROW_LEVEL) {
      const sortedButtons = Object.values(editingActions)
        .sort((a, b) => a.index - b.index)
        .filter((c) => c.showButton);

      const saveButtonConfig = getButtonConfigs(sortedButtons, "save");
      const cancelButtonConfig = getButtonConfigs(sortedButtons, "cancel");
      const deleteButtonConfig = getButtonConfigs(sortedButtons, "delete");

      console.log("Antd 表格 editable: ", {
        saveButtonConfig,
        cancelButtonConfig,
        deleteButtonConfig,
      });
      return {
        type: editType || "multiple",
        editableKeys,
        deletePopconfirmMessage: "确定删除吗？",
        saveText: saveButtonConfig && (
          <ButtonComponentWrapper
            buttonConfig={saveButtonConfig}
            defaultColor={Colors.AZURE_RADIANCE}
          />
        ),
        cancelText: cancelButtonConfig && (
          <ButtonComponentWrapper
            buttonConfig={cancelButtonConfig}
            defaultColor={Colors.AZURE_RADIANCE}
          />
        ),
        deleteText: deleteButtonConfig && (
          <ButtonComponentWrapper
            buttonConfig={deleteButtonConfig}
            defaultColor={Colors.AZURE_RADIANCE}
          />
        ),
        onSave: async (key, row, originRow, newLineConfig) => {
          console.log("Antd 表格 onSave: ", {
            key,
            row,
            originRow,
            newLineConfig,
          });
          if (saveButtonConfig) {
            await handleRowBtnClick(saveButtonConfig.onBtnClick, originRow);
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
            await handleRowBtnClick(cancelButtonConfig.onBtnClick, originRow);
          }
        },
        onDelete: async (key, row) => {
          if (deleteButtonConfig) {
            await handleRowBtnClick(deleteButtonConfig.onBtnClick, row);
          }
        },
        onChange: (key, row) => {
          console.log("表格 editable onChange: ", key, row);
          setEditableKeys(key);
          handleEditableRowChange({ editableKeys: key, editableRecords: row });
        },
        onValuesChange: (record, dataSource) => {
          console.log("表格 editable onValuesChange: ", record, dataSource);
          if (!record) return;
          handleEditableValuesChange({
            record: record,
            rowIndex: record.rowIndex,
          });
        },
      };
    }
    return undefined;
  }, [
    editingActions,
    editableKeys,
    props.tableType,
    tableInlineEditType,
    editType,
  ]);

  return {
    editable,
    addNewRowBtn,
  };
};
