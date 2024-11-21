import type { TableWidgetProps } from "widgets/Antd/TableWidget/constants";
import { ColumnTypes } from "widgets/Antd/TableWidget/constants";

import { get } from "lodash";
import {
  getBasePropertyPath,
  hideByColumnType,
  getColumnPath,
} from "../../propertyUtils";
import type { PropertyPaneConfig } from "constants/PropertyControlConstants";

export default {
  sectionName: "事件",
  hidden: (props: TableWidgetProps, propertyPath: string) => {
    const columnType = get(props, `${propertyPath}.columnType`, "");
    const isEditable = get(props, `${propertyPath}.isEditable`, "");
    if (!isEditable) {
      return ![ColumnTypes.SWITCH, ColumnTypes.IMAGE, ColumnTypes.URL].includes(
        columnType,
      );
    }
    return [ColumnTypes.INDEX_BORDER, ColumnTypes.INDEX].includes(columnType);
  },
  children: [
    // onChange input number
    {
      propertyName: "onCellTextChange",
      label: "onChange",
      helpText: "当输入框内容改变时触发",
      controlType: "ACTION_SELECTOR",
      dependencies: ["primaryColumns"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.NUMBER,
          ColumnTypes.TEXT,
          ColumnTypes.TEXTAREA,
          ColumnTypes.MONEY,
          ColumnTypes.PASSWORD,
          ColumnTypes.IMAGE,
        ]);
      },
    },
    // Image onClick
    {
      propertyName: "onUrlOrImgClick",
      label: "onClick",
      helpText: "当点击图片或链接时触发",
      controlType: "ACTION_SELECTOR",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.IMAGE,
          ColumnTypes.URL,
        ]);
      },
      dependencies: ["primaryColumns", "columnOrder"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
    },
    // onSelectChange SELECT 组件
    {
      propertyName: "onSelectChange",
      label: "onChange",
      helpText: "当选择框状态改变时触发",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [
          ColumnTypes.SELECT,
          ColumnTypes.TREE_SELECT,
        ]);
      },
      dependencies: ["primaryColumns"],
    },
    // onSwitchClick
    {
      propertyName: "onSwitchClick",
      label: "onSwitchClick",
      helpText: "当开关状态改变时触发，可以用于点击变更状态更新后台数据",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.SWITCH]);
      },
      additionalAutoComplete: () => ({
        checked: "",
      }),
      dependencies: ["primaryColumns"],
    },
    {
      propertyName: "onCheckChange",
      label: "onChange",
      helpText: "当前行处于编辑状态下，开关状态改变时触发",
      controlType: "ACTION_SELECTOR",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        const baseProperty = getBasePropertyPath(propertyPath);
        const columnType = get(props, `${baseProperty}.columnType`, "");
        const isEditable = get(props, `${baseProperty}.isEditable`, "");
        return ![ColumnTypes.SWITCH].includes(columnType) || !isEditable;
      },
      dependencies: ["primaryColumns"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
    },
    {
      propertyName: "onCheckChange",
      label: "onCheckChange",
      helpText: "当复选框状态改变时触发",
      controlType: "ACTION_SELECTOR",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.CHECKBOX]);
      },
      dependencies: ["primaryColumns"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
    },
    {
      propertyName: "onRadioChange",
      label: "onChange",
      helpText: "当单选框状态改变时触发",
      controlType: "ACTION_SELECTOR",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        return hideByColumnType(props, propertyPath, [ColumnTypes.RADIO]);
      },
      dependencies: ["primaryColumns"],
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
    },
    {
      propertyName: "onFilterUpdate",
      helpText: "过滤关键字变化时触发",
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        const baseProperty = getBasePropertyPath(propertyPath);
        const columnType = get(props, `${baseProperty}.columnType`, "");
        const isEditable = get(props, `${baseProperty}.isEditable`, "");
        const serverSideFiltering = get(
          props,
          `${baseProperty}.serverSideFiltering`,
          false,
        );
        return (
          columnType !== ColumnTypes.SELECT ||
          !isEditable ||
          !serverSideFiltering
        );
      },
      dependencies: ["primaryColumns"],
      label: "onFilterUpdate",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      additionalAutoComplete: () => ({
        filterText: "",
      }),
    },
    {
      propertyName: "onDateSelected",
      label: "onDateSelected",
      helpText: "when a date is selected in the calendar",
      controlType: "ACTION_SELECTOR",
      isJSConvertible: true,
      isBindProperty: true,
      isTriggerProperty: true,
      dependencies: ["primaryColumns"],
      hidden: (props: TableWidgetProps, propertyPath: string) => {
        const path = getColumnPath(propertyPath);
        return hideByColumnType(props, path, [ColumnTypes.DATE], true);
      },
    },
  ] as PropertyPaneConfig[],
};
