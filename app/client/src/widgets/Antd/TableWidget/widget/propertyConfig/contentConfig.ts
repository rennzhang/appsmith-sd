import {
  createMessage,
  TABLE_WIDGET_TOTAL_RECORD_TOOLTIP,
} from "@appsmith/constants/messages";
import type { PropertyPaneConfig } from "constants/PropertyControlConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { TableWidgetProps } from "widgets/Antd/TableWidget/constants";
import {
  BUTTON_DEFAULT_CONFIG,
  ButtonTypes,
  ColumnTypes,
  TableInlineEditTypes,
} from "widgets/Antd/TableWidget/constants";
import { composePropertyUpdateHook } from "widgets/WidgetUtils";
import {
  tableDataValidation,
  totalRecordsCountValidation,
  uniqueColumnNameValidation,
  updateColumnOrderHook,
  updateCustomColumnAliasOnLabelChange,
} from "../propertyUtils";
import panelConfig from "./PanelConfig";
import ActionPanelConfig from "./ActionPanelConfig";
import { ButtonVariantTypes } from "components/constants";

import { JSONFormConfig, JSONFormDefaults } from "./JSONForm";

export default [
  {
    sectionName: "数据",
    children: [
      // 表格类型，拖拽排序表格、可编辑表格、普通表格
      {
        helperText(props) {
          // 给出表格类型为拖拽排序表格、可编辑表格、普通表格的提示，要显示出区别
          if (props.tableType === "dragSort") {
            return "拖拽排序表格，支持拖拽排序、新增单行、普通的编辑模式";
          } else if (props.tableType === "edit") {
            return "可编辑表格，支持新增多行、实时保存的更高级编辑模式";
          } else {
            return "普通表格，支持常见场景的数据展示、列排序、新增单行、删除等操作";
          }
        },
        helpText: "表格类型",
        placeholderText: "请选择表格类型",
        propertyName: "tableType",
        label: "表格类型",
        controlType: "DROP_DOWN",
        defaultValue: "normal",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.TEXT,
        },

        options: [
          {
            label: "普通表格",
            value: "normal",
          },
          {
            label: "拖拽排序表格",
            value: "dragSort",
          },
          {
            label: "可编辑表格",
            value: "edit",
          },
        ],
        dependencies: [
          "allowAddNewRow",
          "tableType",
          "toolBarActions",
          "addNewRowText",
          "addNewRowPosition",
          "saveDataSourceText",
          "saveDataSourceTooltip",
          "saveDataSourceOnClick",
          "primaryColumns",
        ],
        updateHook: (
          props: TableWidgetProps,
          propertyPath: string,
          propertyValue: any,
        ) => {
          const isEdit = propertyValue === "edit";
          const propertiesToUpdate: Array<{
            propertyPath: string;
            propertyValue: any;
          }> = [
            {
              propertyPath: "allowAddNewRow",
              propertyValue: isEdit,
            },
            {
              propertyPath: "isVisibleSearch",
              propertyValue: !isEdit,
            },
            {
              propertyPath: "serverSidePaginationEnabled",
              propertyValue: !isEdit,
            },
            {
              propertyPath: "toolBarActions",
              propertyValue: {
                ...props.toolBarActions,
                addNewRow: {
                  ...props.toolBarActions.addNewRow,
                  isHiddenItem: isEdit,
                },
                saveDataSource: {
                  ...props.toolBarActions.saveDataSource,
                  isHiddenItem: !isEdit,
                },
              },
            },
          ];

          const { primaryColumns } = props;
          // const propertiesToAdd: Record<string, unknown> = {};
          Object.keys(primaryColumns).forEach((columnId) => {
            // propertiesToAdd[`primaryColumns.${columnId}.isEditable`] = true;
            propertiesToUpdate.push({
              propertyPath: `primaryColumns.${columnId}.isCellEditable`,
              propertyValue: isEdit,
            });
            propertiesToUpdate.push({
              propertyPath: `primaryColumns.${columnId}.isEditable`,
              propertyValue: isEdit,
            });
          });
          return propertiesToUpdate;
        },
      },
      // 表格标题
      {
        helpText: "表格标题",
        propertyName: "headerTitle",
        label: "标题",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,

        placeholderText: "请输入表格标题",
        validation: {
          type: ValidationTypes.TEXT,
        },
      },
      {
        helpText: "表格数组数据",
        propertyName: "tableData",
        label: "数据",
        controlType: "ONE_CLICK_BINDING_CONTROL",
        controlConfig: {
          searchableColumn: true,
        },
        placeholderText: '[{ "name": "John" }]',
        inputType: "ARRAY",
        isBindProperty: true,
        isTriggerProperty: false,
        isJSConvertible: true,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: tableDataValidation,
            expected: {
              type: "Array",
              example: `[{ "name": "John" }]`,
              autocompleteDataType: AutocompleteDataType.ARRAY,
            },
          },
        },
        evaluationSubstitutionType: EvaluationSubstitutionType.SMART_SUBSTITUTE,
        shouldSwitchToNormalMode: (
          isDynamic: boolean,
          isToggleDisabled: boolean,
          triggerFlag?: boolean,
        ) => triggerFlag && isDynamic && !isToggleDisabled,
      },
      {
        helpText: "表格数据列定义",
        propertyName: "primaryColumns",
        controlType: "PRIMARY_COLUMNS_ANTD",
        label: "数据列",
        updateHook: composePropertyUpdateHook([
          updateColumnOrderHook,
          updateCustomColumnAliasOnLabelChange,
        ]),
        dependencies: [
          "tableType",
          "primaryColumnId",
          "primaryColumns",
          "columnOrder",
          "childStylesheet",
          "tableInlineEditType",
          "textColor",
          "textSize",
          "fontStyle",
          "cellBackground",
          "verticalAlignment",
          "horizontalAlignment",
        ],
        isBindProperty: false,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: uniqueColumnNameValidation,
            expected: {
              type: "唯一列名",
              example: "abc",
              autocompleteDataType: AutocompleteDataType.STRING,
            },
          },
        },
        panelConfig,
      },
      {
        propertyName: "tableInlineEditType",
        helpText: "选择如何保存编辑的单元格数据",
        label: "更新模式",
        controlType: "ICON_TABS",
        defaultValue: TableInlineEditTypes.ROW_LEVEL,
        fullWidth: true,
        isBindProperty: true,
        isTriggerProperty: false,
        hidden: (props: TableWidgetProps) => {
          return !Object.values(props.primaryColumns).find(
            (column) => column.isEditable,
          );
        },
        dependencies: ["primaryColumns", "columnOrder", "childStylesheet"],
        options: [
          {
            label: "行更新",
            value: TableInlineEditTypes.ROW_LEVEL,
          },
          {
            label: "自定义更新",
            value: TableInlineEditTypes.CUSTOM,
          },
        ],
        updateHook: (
          props: TableWidgetProps,
          propertyPath: string,
          propertyValue: any,
        ) => {
          return [
            {
              propertyPath: "autoGenerateTableForm",
              propertyValue: propertyValue === TableInlineEditTypes.CUSTOM,
            },
          ];
        },
      },
      // 自动生成表单
      {
        helpText: "自动生成表单",
        propertyName: "autoGenerateTableForm",
        label: "自动生成表单",
        isBindProperty: true,
        isTriggerProperty: false,
        isJSConvertible: true,
        controlType: "SWITCH",
        hidden: (props: TableWidgetProps) => {
          return props.tableInlineEditType !== TableInlineEditTypes.CUSTOM;
        },
        dependencies: ["tableInlineEditType"],
      },
      {
        helpText: "调整表单配置",
        propertyName: "autoFormConfig",
        controlType: "OPEN_CONFIG_PANEL",
        buttonConfig: {
          label: "配置",
          icon: "settings-2-line",
        },
        label: "配置表单",
        isBindProperty: false,
        isTriggerProperty: false,
        hidden: (props: TableWidgetProps) => {
          return (
            !props.autoGenerateTableForm ||
            props.tableInlineEditType !== TableInlineEditTypes.CUSTOM
          );
        },
        dependencies: ["tableInlineEditType", "autoGenerateTableForm"],
        panelConfig: JSONFormConfig,
      },
      {
        helpText:
          "数据主键值唯一，用于表格的 selectedRows 和 triggeredRows、行内编辑等功能，该列必须存在且不允许编辑",
        propertyName: "primaryColumnId",
        dependencies: ["tableData", "primaryColumns"],
        evaluatedDependencies: ["tableData", "primaryColumns"],
        label: "主键列",
        controlType: "PRIMARY_COLUMNS_DROPDOWN",
        isBindProperty: true,
        isTriggerProperty: false,
        filterUniqueValueKey: true,
        defaultValue: (props: TableWidgetProps) => {
          return (
            props.options?.find((opt: any) =>
              opt?.label?.toLowerCase()?.includes("id"),
            )?.value ||
            props.options?.[0]?.value ||
            ""
          );
        },
        validation: {
          type: ValidationTypes.TEXT,
        },
      },
    ],
  },
  {
    // 操作栏配置
    sectionName: "操作栏配置",
    children: [
      // 操作栏宽度
      {
        helpText: "操作栏宽度",
        propertyName: "actionWidth",
        label: "操作栏宽度",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        defaultValue: 140,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.NUMBER,
          params: {
            min: 0,
          },
        },
      },
      {
        helpText: "操作栏按钮配置",
        propertyName: "columnActions",
        controlType: "MENU_ITEMS",
        label: "操作栏按钮",
        isBindProperty: false,
        isTriggerProperty: false,
        createButtonText: "添加按钮",
        presetLabel: "Action",
        panelConfig: ActionPanelConfig,
        isHideToggleVisibility: true,
        defaultProperties: {
          ...BUTTON_DEFAULT_CONFIG,
          menuButtonLabel: undefined,
          iconName: "",
          btnIconName: "ant-design:SettingOutlined",
          menuIconName: "ant-design:EllipsisOutlined",
          menuVariant: ButtonVariantTypes.TERTIARY,
          buttonLabel: "按钮",
          tooltip: "",
          iconAlign: "left",
          menuTooltip: "",
          onBtnClick: "{{showAlert('请先配置按钮的动作', 'warning');}}",
          menuItems: {
            menuItemfs0i704r9c: {
              id: "menuItemfs0i704r9c",
              index: 0,
              label: "Menu Item 1",
              widgetId: "",
              isDisabled: false,
              isVisible: true,
              backgroundColor: "",
              textColor: "",
              // onBtnClick: "{{showAlert('请先配置按钮的动作', 'warning');}}",
            },
          },
        },
      },
    ],
  },
  // 编辑行配置
  {
    sectionName: "行编辑配置",
    hidden: (props: TableWidgetProps) => {
      const editableColumn = [];
      Object.values(props.primaryColumns).map((column) => {
        if (column.isCellEditable) {
          editableColumn.push(column);
        }
      });
      return !(
        props.tableInlineEditType == TableInlineEditTypes.ROW_LEVEL &&
        editableColumn.length
      );
    },
    dependencies: ["tableInlineEditType", "primaryColumns"],
    children: [
      {
        helpText: "行编辑状态下的操作列按钮配置",
        propertyName: "editingActions",
        controlType: "MENU_ITEMS",
        label: "编辑状态操作列按钮",
        isBindProperty: false,
        isTriggerProperty: false,
        panelConfig: ActionPanelConfig,
        isHideToggleVisibility: true,
        isHideAddButton: true,
        dependencies: ["tableInlineEditType"],
      },
      // editType
      {
        helpText: "行内编辑模式",
        propertyName: "editType",
        label: "编辑模式",
        controlType: "ICON_TABS",
        defaultValue: "multiple",
        options: [
          {
            label: "多行编辑",
            value: "multiple",
          },
          {
            label: "单行编辑",
            value: "single",
          },
        ],
        isBindProperty: false,
        isTriggerProperty: false,
        hidden: (props: TableWidgetProps) => {
          return props.tableType == "edit";
        },
        dependencies: ["tableType"],
      },
      // 默认编辑行
      {
        helpText: "默认编辑行的 key",
        propertyName: "defaultUpdatedKeys",
        label: "默认编辑行",
        controlType: "TABLE_PRIMARY_KEYS_DROPDOWN",
        isMultiSelect: (props: TableWidgetProps) => {
          return props.widgetProperties.editType === "multiple";
        },
        singleArray: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.UNION,
          params: {
            types: [
              {
                type: ValidationTypes.UNION,
                params: {
                  types: [
                    {
                      type: ValidationTypes.TEXT,
                    },
                    {
                      type: ValidationTypes.NUMBER,
                    },
                  ],
                },
              },
              {
                type: ValidationTypes.ARRAY,
                params: {
                  children: {
                    type: ValidationTypes.UNION,
                    params: {
                      types: [
                        {
                          type: ValidationTypes.TEXT,
                        },
                        {
                          type: ValidationTypes.NUMBER,
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        },
        hidden: (props: TableWidgetProps) => {
          return props.defaultExpandAllRows || props.tableType == "edit";
        },
        dependencies: ["tableData", "primaryColumnId", "editType"],
        evaluatedDependencies: ["tableData", "primaryColumnId", "editType"],
      },
      {
        helpText: "行内编辑模式下，单元格值改变时触发",
        propertyName: "onRowValueChange",
        label: "onRowValueChange",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
    ],
  },
  {
    sectionName: "新增行数据",
    children: [
      {
        propertyName: "allowAddNewRow",
        helpText: "显示新增一行按钮，可以在工具栏中配置按钮样式",
        isJSConvertible: true,
        label: "允许新增一行",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
        hidden: (props: TableWidgetProps) => {
          return props.tableType == "edit";
        },
      },
      // 按钮文本
      {
        propertyName: "addNewRowText",
        helpText: "新增行按钮文本",
        label: "新增行按钮文本",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        isTriggerProperty: false,
        dependencies: ["allowAddNewRow", "tableType"],
        defaultValue: "新增一行",
        validation: {
          type: ValidationTypes.TEXT,
        },
        hidden: (props: TableWidgetProps) => {
          return !props.allowAddNewRow || props.tableType == "edit";
        },
      },
      // position
      {
        propertyName: "addNewRowPosition",
        helpText: "控制新增行在表格中的位置",
        label: "新增行位置",
        controlType: "ICON_TABS",
        defaultValue: "bottom",
        options: [
          {
            label: "顶部",
            value: "top",
          },
          {
            label: "底部",
            value: "bottom",
          },
        ],
        isBindProperty: true,
        isTriggerProperty: false,
        hidden: (props: TableWidgetProps) => {
          return !props.allowAddNewRow;
        },
        dependencies: ["allowAddNewRow"],
      },
      {
        propertyName: "defaultNewRow",
        helpText: "默认新增行数据",
        label: "默认行数据",
        controlType: "INPUT_TEXT",
        dependencies: ["allowAddNewRow"],
        placeholderText: "请输入默认行数据",
        hidden: (props: TableWidgetProps) => {
          return !props.allowAddNewRow;
        },
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.OBJECT,
          params: {
            default: {},
          },
        },
      },
    ],
  },
  {
    sectionName: "查询配置",
    children: [
      // defaultPageSize
      {
        helpText: "默认每页显示数量",
        propertyName: "defaultPageSize",
        label: "默认每页条数",
        controlType: "INPUT_TEXT",
        placeholderText: "10",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.NUMBER,
          params: {
            min: 1,
            default: 10,
          },
        },
      },
      {
        propertyName: "isVisiblePagination",
        helpText: "是否显示分页器",
        label: "显示分页器",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        helpText:
          "在 API 请求参数中绑定页号 Table.pageNo，onPageChange 换页的时候调用 API",
        propertyName: "serverSidePaginationEnabled",
        label: "服务端分页",
        controlType: "SWITCH",
        isBindProperty: false,
        isTriggerProperty: false,
      },
      {
        helpText: createMessage(TABLE_WIDGET_TOTAL_RECORD_TOOLTIP),
        propertyName: "totalRecordsCount",
        label: "总行数",
        controlType: "INPUT_TEXT",
        placeholderText: "配置表格总行数",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.FUNCTION,
          params: {
            fn: totalRecordsCountValidation,
            expected: {
              type: "Number",
              example: "10",
              autocompleteDataType: AutocompleteDataType.STRING,
            },
          },
        },
        hidden: (props: TableWidgetProps) => !props.serverSidePaginationEnabled,
        dependencies: ["serverSidePaginationEnabled"],
      },
      // disabled
      {
        propertyName: "paginationDisabled",
        helpText: "是否禁用分页器",
        label: "禁用分页器",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        helpText:
          "当表格查询相关内容变更时触发，如分页、表单参数、查询按钮、重置按钮等等",
        propertyName: "onPageChange",
        label: "onQuery",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        hidden: (props: TableWidgetProps) => !props.serverSidePaginationEnabled,
        dependencies: ["serverSidePaginationEnabled"],
      },
      {
        helpText: "表格页大小改变时触发",
        propertyName: "onPageSizeChange",
        label: "onPageSizeChange",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        hidden: (props: TableWidgetProps) => !props.serverSidePaginationEnabled,
        dependencies: ["serverSidePaginationEnabled"],
      },
    ],
  },
  {
    sectionName: "搜索过滤",
    children: [
      {
        propertyName: "isVisibleSearch",
        helpText: "是否显示表格上方搜索表单",
        label: "允许搜索",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      // 开启查询表单验
      {
        helpText: "是否启用查询表单校验",
        propertyName: "enableSearchFormValidation",
        label: "启用查询表单校验",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      // {
      //   propertyName: "enableClientSideSearch",
      //   label: "前端搜索",
      //   helpText: "仅在加载的数据上搜索所有结果",
      //   controlType: "SWITCH",
      //   isBindProperty: false,
      //   isTriggerProperty: false,
      //   hidden: (props: TableWidgetProps) => !props.isVisibleSearch,
      //   dependencies: ["isVisibleSearch"],
      // },
      // {
      //   propertyName: "defaultSearchText",
      //   label: "默认搜索内容",
      //   helpText: "添加一个默认搜索关键字",
      //   controlType: "INPUT_TEXT",
      //   placeholderText: "{{global.user.name}}",
      //   isBindProperty: true,
      //   isTriggerProperty: false,
      //   validation: { type: ValidationTypes.TEXT },
      //   hidden: (props: TableWidgetProps) => !props.isVisibleSearch,
      //   dependencies: ["isVisibleSearch"],
      // },
      // {
      //   propertyName: "onSearchTextChanged",
      //   label: "onSearchTextChanged",
      //   helpText: "修改搜索关键字时触发",
      //   controlType: "ACTION_SELECTOR",
      //   isJSConvertible: true,
      //   isBindProperty: true,
      //   isTriggerProperty: true,
      //   hidden: (props: TableWidgetProps) => !props.isVisibleSearch,
      //   dependencies: ["isVisibleSearch"],
      // },
    ],
  },
  {
    sectionName: "勾选行配置",
    children: [
      // 是否允许勾选
      {
        propertyName: "allowRowSelection",
        label: "允许勾选",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        defaultValue: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      // 勾选类型 checkbox | radio
      {
        helpText: "勾选类型",
        propertyName: "rowSelectionType",
        label: "勾选类型",
        controlType: "ICON_TABS",
        defaultValue: "checkbox",
        options: [
          { label: "多选", value: "checkbox" },
          { label: "单选", value: "radio" },
        ],
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
        dependencies: ["allowRowSelection"],
      },
      // 默认选中行的键数组
      {
        helpText: "默认选中行的键数组",
        propertyName: "defaultSelectedRowKeys",
        label: "默认选中行",
        controlType: "PRIMARY_KEYS_DROPDOWN",
        isMultiSelect: (props: TableWidgetProps) => {
          return props.rowSelectionType === "checkbox";
        },
        placeholderText: "[0, 1, 2]",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.ARRAY,
          params: {
            children: {
              type: ValidationTypes.NUMBER,
              params: {
                default: [],
              },
            },
          },
        },
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
        dependencies: [
          "allowRowSelection",
          "rowSelectionType",
          "filteredTableData",
          "primaryColumnId",
        ],
        evaluatedDependencies: ["filteredTableData", "primaryColumnId"],
      },

      // 是否隐藏全选checkbox
      {
        propertyName: "hideSelectAll",
        label: "隐藏全选",
        helpText: "是否隐藏全选checkbox",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
        hidden: (props: TableWidgetProps) =>
          !props.allowRowSelection || props.rowSelectionType === "radio",
        dependencies: ["allowRowSelection", "rowSelectionType"],
      },
      // 选择框是否固定在左侧
      {
        propertyName: "rowSelectionFixed",
        label: "固定选择框",
        helpText: "选择框是否固定在左侧",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
        dependencies: ["allowRowSelection"],
      },
      // selectionColumnWidth
      {
        propertyName: "selectionColumnWidth",
        label: "选择列宽度",
        helpText: "选择列宽度",
        controlType: "INPUT_TEXT",
        isBindProperty: true,
        defaultValue: 60,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.NUMBER },
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
        dependencies: ["allowRowSelection"],
      },
      {
        helpText: "表格行选中操作按钮",
        propertyName: "rowSelectionActions",
        controlType: "MENU_ITEMS",
        label: "行选中操作按钮",
        isBindProperty: false,
        isTriggerProperty: false,
        createButtonText: "添加按钮",
        presetLabel: "Action",
        panelConfig: ActionPanelConfig,
        isHideToggleVisibility: true,
        defaultProperties: {
          ...BUTTON_DEFAULT_CONFIG,
          menuButtonLabel: undefined,
          iconName: "",
          btnIconName: "ant-design:SettingOutlined",
          menuIconName: "ant-design:EllipsisOutlined",
          menuVariant: ButtonVariantTypes.TERTIARY,
          buttonLabel: "按钮",
          tooltip: "",
          iconAlign: "left",
          menuTooltip: "",
          onBtnClick: "{{showAlert('请先配置按钮的动作', 'warning');}}",

          menuItems: {
            menuItemfs0i704r9c: {
              id: "menuItemfs0i704r9c",
              index: 0,
              label: "Menu Item 1",
              widgetId: "",
              isDisabled: false,
              isVisible: true,
              backgroundColor: "",
              textColor: "",
              // onBtnClick: "{{showAlert('请先配置按钮的动作', 'warning');}}",
            },
          },
        },
        dependencies: ["rowSelectionActions", "allowRowSelection"],
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
      },
      // onSelect
      {
        helpText: "表格行被选中时触发",
        propertyName: "onSelect",
        label: "onSelect",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
        dependencies: ["allowRowSelection"],
      },

      // 选中行变化时触发
      {
        helpText: "表格选中行变化时触发",
        propertyName: "onSelectionChange",
        label: "onRowSelectionChange",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        hidden: (props: TableWidgetProps) => !props.allowRowSelection,
        dependencies: ["allowRowSelection"],
      },
    ],
  },
  {
    sectionName: "树形数据显示配置",
    children: [
      // childrenColumnName
      {
        helpText: "树形数据的子节点字段名",
        propertyName: "childrenColumnName",
        label: "子节点字段名",
        controlType: "INPUT_TEXT",
        defaultValue: "children",
        placeholderText: "children",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.TEXT },
      },
      // defaultExpandAllRows
      {
        helpText: "是否默认展开所有行",
        propertyName: "defaultExpandAllRows",
        label: "默认展开所有行",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: false,
        isTriggerProperty: false,
        defaultValue: false,
      },
      // defaultExpandedRowKeys
      {
        helpText: "默认展开的行键数组",
        propertyName: "defaultExpandedRowKeys",
        label: "默认展开行",
        controlType: "TABLE_PRIMARY_KEYS_DROPDOWN",
        placeholderText: "[0]",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.ARRAY,
        },

        hidden: (props: TableWidgetProps) => {
          return props.defaultExpandAllRows;
        },
        dependencies: ["defaultExpandAllRows", "tableData", "primaryColumnId"],
        evaluatedDependencies: ["tableData", "primaryColumnId"],
      },
      // expandRowByClick
      {
        helpText: "点击行时展开子节点",
        propertyName: "expandRowByClick",
        label: "点击行展开",
        controlType: "SWITCH",
        isBindProperty: false,
        isTriggerProperty: false,
        defaultValue: false,
      },
      // onExpand 事件
      {
        helpText: "展开或收起树形数据时触发",
        propertyName: "onExpand",
        label: "onExpand",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
    ],
  },
  {
    sectionName: "排序",
    hidden: (props: TableWidgetProps) => props.tableType == "edit",
    dependencies: ["tableType"],
    children: [
      // 是否开启远程排序
      {
        helpText: "是否开启远程排序，开启后需要配合 onSort 事件重新请求数据",
        propertyName: "isRemoteSort",
        label: "远程排序",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        helpText:
          "表格列排序时触发，如开启远程排序，可使用该项配置查询请求数据",
        propertyName: "onSort",
        label: "onSort",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
      // onDragSortEnd
      {
        helpText: "拖拽排序结束时触发",
        propertyName: "onDragSortEnd",
        label: "onDragSortEnd",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
        hidden: (props: TableWidgetProps) => props.tableType !== "dragSort",
        dependencies: ["tableType"],
      },
    ],
  },

  {
    sectionName: "属性",
    children: [
      // virtual
      {
        helpText: "是否为虚拟列表，开启此配置后，表格单元格将开启自动换行",
        propertyName: "isVirtual",
        defaultValue: false,
        isJSConvertible: true,
        label: "虚拟列表",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      {
        propertyName: "animateLoading",
        label: "加载时显示动画",
        controlType: "SWITCH",
        helpText: "组件依赖的数据加载时显示加载动画",
        defaultValue: true,
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
      {
        propertyName: "isVisibleDownload",
        helpText: "是否显示下载按钮",
        label: "支持下载",
        controlType: "SWITCH",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: false,
        validation: { type: ValidationTypes.BOOLEAN },
      },
    ],
  },
  // 查询表单配置

  {
    sectionName: "工具栏配置",
    children: [
      {
        helpText: "控制工具栏列设置的显示/隐藏",
        propertyName: "isVisibleCellSetting",
        label: "是否显示列设置按钮",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      {
        helpText: "控制工具栏刷新按钮的显示/隐藏",
        propertyName: "isVisibleRefresh",
        label: "是否显示刷新按钮",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      {
        helpText: "控制工具栏全屏按钮的显示/隐藏",
        propertyName: "isVisibleFullScreen",
        label: "是否显示全屏按钮",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      {
        helpText: "控制工具栏行密度按钮的显示/隐藏",
        propertyName: "isVisibleDensity",
        label: "是否显示密度按钮",
        controlType: "SWITCH",
        isBindProperty: true,
        isTriggerProperty: false,
        validation: {
          type: ValidationTypes.BOOLEAN,
        },
      },
      {
        helpText: "工具栏按钮配置",
        propertyName: "toolBarActions",
        controlType: "MENU_ITEMS",
        label: "工具栏按钮",
        isBindProperty: false,
        isTriggerProperty: false,
        createButtonText: "添加按钮",
        presetLabel: "Action",
        panelConfig: ActionPanelConfig,
        isHideToggleVisibility: true,
        defaultProperties: {
          ...BUTTON_DEFAULT_CONFIG,
          menuButtonLabel: undefined,
          iconName: "",
          btnIconName: "ant-design:SettingOutlined",
          menuIconName: "ant-design:EllipsisOutlined",
          menuVariant: ButtonVariantTypes.TERTIARY,
          buttonLabel: "按钮",
          tooltip: "",
          iconAlign: "left",
          menuTooltip: "",
          onBtnClick: "{{showAlert('请先配置按钮的动作', 'warning');}}",
          menuItems: {
            menuItemfs0i704r9c: {
              id: "menuItemfs0i704r9c",
              index: 0,
              label: "Menu Item 1",
              widgetId: "",
              isDisabled: false,
              isVisible: true,
              backgroundColor: "",
              textColor: "",
              // onBtnClick: "{{showAlert('请先配置按钮的动作', 'warning');}}",
            },
          },
        },
      },
    ],
  },
  // 行配置
  {
    sectionName: "行配置",
    children: [
      {
        helpText: "行点击事件",
        propertyName: "onRowClick",
        label: "行点击事件",
        controlType: "ACTION_SELECTOR",
        isJSConvertible: true,
        isBindProperty: true,
        isTriggerProperty: true,
      },
    ],
  },
] as PropertyPaneConfig[];
