import { Alignment } from "@blueprintjs/core";
import type { AntdLabelPosition } from "components/constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type { TextSize, WidgetType } from "constants/WidgetConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { get, isArray, last } from "lodash";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";
import { GRID_DENSITY_MIGRATION_V1 } from "widgets/constants";
import {
  isAutoHeightEnabledForWidget,
  DefaultAutocompleteDefinitions,
} from "widgets/WidgetUtils";
import CustomComponent from "../component";
import derivedProperties from "./parseDerivedProperties";
import type { AutocompletionDefinitions } from "widgets/constants";
import type { SelectProps } from "antd";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { mergeWidgetConfig } from "utils/helpers";
import {
  DEFAULT_STYLE_PANEL_CONFIG,
  FORM_LABEL_CONTENT_CONFIG,
  getDefaultValueDropdownPropConfig,
  getFieldNamesPropConfig,
} from "../../CONST/DEFAULT_CONFIG";
import type { Def } from "tern";
import { SelectValidator } from "widgets/Antd/tools";
import type {
  WidgetQueryConfig,
  WidgetQueryGenerationFormConfig,
} from "WidgetQueryGenerators/types";
import { UpdateWidgetPropertyPayload } from "actions/controlActions";
import { getParentPropertyPath } from "widgets/JSONFormWidget/widget/helper";
function getTypeDefOfTreeSelectInfo(isCheck?: boolean): string | Def {
  const def: Def = {
    event: "string",
    node: {
      title: "string",
      key: "string",
      children: "[def_11]",
      expanded: "bool",
      selected: "bool",
      checked: "bool",
      loaded: "bool",
      loading: "bool",
      halfChecked: "bool",
      dragOver: "bool",
      dragOverGapTop: "bool",
      dragOverGapBottom: "bool",
      pos: "string",
      active: "bool",
    },
  };

  if (isCheck) {
    def.checkedNodes = "[def_12]";
    def.checkedNodesPositions = "[def_13]";
    def.halfCheckedKeys = "[string]";
    def.checked = "bool";
  } else {
    def.selectedNodes = "[def_11]";
    def.selected = "bool";
  }
  return def;
}
class AntdSelectWidget extends BaseWidget<SelectWidgetProps, WidgetState> {
  static getPropertyUpdatesForQueryBinding(
    queryConfig: WidgetQueryConfig,
    widget: WidgetProps,
    formConfig: WidgetQueryGenerationFormConfig,
  ) {
    console.log(
      "Antd 选择器组件 getPropertyUpdatesForQueryBinding",
      queryConfig,
      widget,
      formConfig,
    );

    let modify;

    if (queryConfig.select) {
      modify = {
        sourceData: queryConfig.select.data,
        optionLabel: formConfig.aliases.find((d) => d.name === "label")?.alias,
        optionValue: formConfig.aliases.find((d) => d.name === "value")?.alias,
        defaultOptionValue: "",
        serverSideFiltering: true,
        onFilterUpdate: queryConfig.select.run,
      };
    }

    return {
      modify,
    };
  }
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "选项值唯一的数组",
            propertyName: "options",
            label: "源数据",
            controlType: "OPTION_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            controlConfig: {
              aliases: [
                {
                  name: "label",
                  isSearcheable: true,
                  isRequired: true,
                },
                {
                  name: "value",
                  isRequired: true,
                },
              ],
              sampleData: JSON.stringify(
                [
                  { name: "蓝", code: "BLUE" },
                  { name: "绿", code: "GREEN" },
                  { name: "红", code: "RED" },
                ],
                null,
                2,
              ),
            },
            placeholderText: '[{ "label": "label1", "value": "value1" }]',
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                children: {
                  type: ValidationTypes.OBJECT,
                  params: {
                    required: true,
                  },
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },

          getDefaultValueDropdownPropConfig({
            placeholderText: "请输入选项数据",
            dependencies: ["mode", "isMultiSelect"],
            defaultValue: undefined,
          }),
          getFieldNamesPropConfig("label"),
          getFieldNamesPropConfig("value"),
          // getFieldNamesPropConfig("options"),
        ],
      },
      FORM_LABEL_CONTENT_CONFIG,
      {
        sectionName: "校验",
        children: [
          {
            propertyName: "isRequired",
            label: "必填",
            helpText: "强制用户填写",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "普通校验或正则校验失败后显示的错误信息",
            propertyName: "errorMessage",
            label: "错误信息",
            controlType: "INPUT_TEXT",
            placeholderText: "输入不符合规范",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "添加提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置占位文本",
            propertyName: "placeholderText",
            label: "占位符",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入占位文本",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "控制组件的显示/隐藏",
            propertyName: "isVisible",
            label: "是否显示",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            helpText: "让组件不可交互",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
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
        ],
      },
      {
        sectionName: "组件配置",
        children: [
          {
            propertyName: "showSearch",
            label: "开启搜索",
            helpText: "输入内容搜索相关选项",
            controlType: "SWITCH",
            defaultValue: false,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "allowClear",
            label: "允许清空",
            helpText: "显示清空按钮用来清空选择",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },

          // treeExpandAction
          // {
          //   propertyName: "treeExpandAction",
          //   label: "展开方式",
          //   helpText: "展开方式",
          //   controlType: "ICON_TABS",
          //   options: [
          //     {
          //       label: "单击展开",
          //       value: "click",
          //     },
          //     {
          //       label: "双击展开",
          //       value: "doubleClick",
          //     },
          //   ],
          //   defaultValue: "click",
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          //   validation: { type: ValidationTypes.TEXT },
          // },
          // tokenSeparators
          {
            propertyName: "tokenSeparators",
            label: "自动分词",
            helpText: "自动分词的分隔符",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                default: [],
                unique: ["value"],
                children: {
                  type: ValidationTypes.TEXT,
                },
              },
            },
            hidden: (props: SelectWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return propsData.mode !== "tags";
            },
            dependencies: ["mode"],
          },
          // 模式
          {
            propertyName: "mode",
            label: "选择模式",
            helpText: "选择模式配置，单选或多选",
            controlType: "ICON_TABS",
            fullWidth: false,
            options: [
              { label: "单选", value: "void 0" },
              { label: "多选", value: "multiple" },
              { label: "标签", value: "tags" },
            ],
            defaultValue: "void 0",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            dependencies: ["options", "defaultValue"],
            updateHook: (
              props: any,
              propertyPath: string,
              propertyValue: any,
            ) => {
              console.log("Antd 选择器组件 updateHook", {
                props,
                propertyPath,
                propertyValue,
              });
              const isMultiSelect = propertyValue !== "void 0";
              const defaultValue = isMultiSelect
                ? [].concat(props.defaultValue)
                : Array.isArray(props.defaultValue)
                ? props.defaultValue[0]
                : props.defaultValue;
              return [
                {
                  propertyPath: "isMultiSelect",
                  propertyValue: propertyValue !== "void 0",
                },
                // defaultValue
                {
                  propertyPath: "defaultValue",
                  propertyValue: defaultValue,
                },
              ];
            },
          },

          // maxTagCount
          {
            propertyName: "maxTagCount",
            label: "最大标签数量",
            helpText: "最多显示的标签数量",
            controlType: "NUMERIC_INPUT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            hidden: (props: SelectWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return propsData.mode == "void 0";
            },
            dependencies: ["mode"],
          },
          // maxTagTextLength
          {
            propertyName: "maxTagTextLength",
            label: "最大标签文本长度",
            helpText: "最大显示的 tag 文本长度",
            controlType: "INPUT_TEXT",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
            hidden: (props: SelectWidgetProps, propertyPath: string) => {
              const _propertyPath = getParentPropertyPath(propertyPath);
              const propsData = get(props, _propertyPath) || props;
              return propsData.mode == "void 0";
            },
            dependencies: ["mode"],
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "选中值变化时触发",
            propertyName: "onValueChange",
            label: "onValueChange",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
          // onSearch
          {
            helpText: "搜索时触发",
            propertyName: "onOptionSearch",
            label: "onSearch",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      accentColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setDisabled: {
          path: "isDisabled",
          type: "boolean",
        },
        setRequired: {
          path: "isRequired",
          type: "boolean",
        },
      },
    };
  }

  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "属性",
          children: [
            // height
            // {
            //   propertyName: "height",
            //   label: "高度",
            //   controlType: "INPUT_TEXT",
            //   helpText: "设置组件的高度",
            //   placeholderText: "请输入高度",
            //   isBindProperty: true,
            //   isTriggerProperty: false,
            //   validation: { type: ValidationTypes.NUMBER },
            // },
          ],
        },
      ],
      DEFAULT_STYLE_PANEL_CONFIG,
    );
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: SelectWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        selectedInfo: getTypeDefOfTreeSelectInfo(),
        selectedNode: generateTypeDef(widget.selectedNode, extraDefsToDefine),
        "!doc":
          "TreeSelect is used to capture user input from a specified list of permitted inputs/Nested Inputs.",
        "!url": "https://docs.appsmith.com/widget-reference/treeselect",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        value: generateTypeDef(widget.value, extraDefsToDefine),
        // checkedLabels: generateTypeDef(widget.checkedLabels, extraDefsToDefine),
        selectedLabel: generateTypeDef(widget.selectedLabel, extraDefsToDefine),
        selectedValue: generateTypeDef(widget.selectedValue, extraDefsToDefine),
        isDisabled: "bool",
        isValid: generateTypeDef(widget.isValid, extraDefsToDefine),
        options: generateTypeDef(widget.options, extraDefsToDefine),
        searchText: "string",
      };
    };
  }

  static getDerivedPropertiesMap() {
    return {
      value: `{{this.selectedValue}}`,
      flattenedOptions: `{{(()=>{${derivedProperties.getFlattenedOptions}})()}}`,
      isValid: `{{(()=>{${derivedProperties.getIsValid}})()}}`,
    };
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {
      value: "selectedValue",
      selectedValue: "defaultValue",
      checkedLabels: "defaultLabel",
      selectedLabel: "defaultSelectedLabel",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      value: undefined,
      searchText: undefined,
      selectedValue: undefined,
      checkedLabels: undefined,
      selectedLabel: undefined,
      selectedNode: [],
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps: SelectWidgetProps): void {
    const { mode, selectedLabel, selectedValue, updateWidgetMetaProperty } =
      this.props;
    if (
      this.props.defaultValue !== prevProps.defaultValue &&
      this.props.isDirty
    ) {
      this.props.updateWidgetMetaProperty("isDirty", false);
    }

    if (this.props.defaultValue !== prevProps.defaultValue) {
      this?.onValueChange?.(this.props.defaultValue, this.props.defaultLabel);
    }

    if (mode !== prevProps.mode) {
      updateWidgetMetaProperty(
        "selectedValue",
        this.handleValueOrLabel(selectedValue, mode),
      );
      updateWidgetMetaProperty(
        "selectedLabel",
        this.handleValueOrLabel(selectedLabel, mode),
      );
      // updateWidgetMetaProperty("defaultValue", ");
    }
  }
  handleValueOrLabel = (input: any, mode: string) => {
    if (mode !== "void 0") {
      return input ? (Array.isArray(input) ? input : [input]) : [];
    } else {
      return last(input) ?? "";
    }
  };

  getPageView() {
    console.group("Antd 选择器组件 getPageView");
    console.log("Antd 选择器组件 this.props", this.props);
    console.log("Antd 选择器组件 this", this);
    console.groupEnd();
    const options = isArray(this.props.options) ? this.props.options : [];
    const isInvalid =
      "isValid" in this.props && !this.props.isValid && !!this.props.isDirty;
    const { componentWidth } = this.getComponentDimensions();
    return (
      <CustomComponent
        boxShadow={this.props.boxShadow}
        compactMode={
          !(
            (this.props.bottomRow - this.props.topRow) /
              GRID_DENSITY_MIGRATION_V1 >
            1
          )
        }
        disabled={this.props.isDisabled ?? false}
        errorMessage={this.props.errorMessage}
        isDynamicHeightEnabled={isAutoHeightEnabledForWidget(this.props)}
        isValid={!isInvalid}
        labelAlignment={this.props.labelAlignment}
        labelPosition={this.props.labelPosition}
        labelStyle={this.props.labelStyle}
        labelTextColor={this.props.labelTextColor}
        labelTextSize={this.props.labelTextSize}
        labelTooltip={this.props.labelTooltip}
        labelWidth={this.props.labelWidth}
        loading={this.props.isLoading}
        mode={this.props.mode}
        options={options}
        required={this.props.isRequired}
        width={componentWidth}
        {...this.props}
        handleSearch={this.handleSearch}
        onValueChange={this.onValueChange}
        updateSelectInfo={this.updateSelectInfo}
      />
    );
  }
  getFlattenedOptions = () => {
    const valueName = this.props.valueKey ?? "value";
    const labelName = this.props.labelKey ?? "label";

    const flat = (array?: any[]) => {
      if (!array) return [];
      let result: any[] = [];
      array.forEach((a) => {
        result.push({ [valueName]: a[valueName], [labelName]: a[labelName] });
        if (Array.isArray(a.children)) {
          result = result.concat(flat(a.children));
        }
      });
      return result;
    };
    return flat(this.props.options);
  };

  updateSelectInfo = (selectInfo: any) => {
    // selectedInfo
    this.props.updateWidgetMetaProperty("selectedInfo", selectInfo);
  };

  onValueChange = (value?: string | string[], label?: string | string[]) => {
    console.log("树选择组件 onValueChange", value, label);

    if (this.props.selectedValue !== value) {
      if (!this.props.isDirty) {
        this.props.updateWidgetMetaProperty("isDirty", true);
      }
      // delete (info as any).nativeEvent;

      this.props.updateWidgetMetaProperty("selectedValue", value);
      this.props.updateWidgetMetaProperty("selectedLabel", label, {
        triggerPropertyName: "onValueChange",
        dynamicString: this.props.onValueChange,
        event: {
          type: EventType.ON_OPTION_CHANGE,
        },
      });

      const flattenedOptions = this.getFlattenedOptions();
      const newSelectedNode = flattenedOptions.filter((option) =>
        value?.toString()?.includes(option.value?.toString()),
      );
      this.props.updateWidgetMetaProperty("selectedNode", newSelectedNode);
    }
  };
  handleSearch = (searchText: string) => {
    console.log("树选择组件 handleSearch", searchText, this.props);

    this.props.updateWidgetMetaProperty("searchText", searchText, {
      triggerPropertyName: "onOptionSearch",
      dynamicString: this.props.onOptionSearch,
      event: {
        type: EventType.ON_TEXT_CHANGE,
      },
    });
  };

  static getWidgetType(): WidgetType {
    return "ANTD_SELECT_WIDGET";
  }
}

export interface DropdownOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  children?: DropdownOption[];
}

export interface SelectWidgetProps extends WidgetProps {
  valueKey: string;
  labelKey: string;
  childrenKey: string;
  placeholderText?: string;
  selectedIndex?: number;
  options?: SelectProps["options"];
  onValueChange: (value?: string | string[], label?: string | string[]) => void;
  handleSearch: (searchText: string) => void;
  updateSelectInfo: (selectInfo: any) => void;

  defaultValue: string[];
  isRequired: boolean;
  isLoading: boolean;
  allowClear: boolean;
  checkedLabels: string[];
  // expandAll: boolean;
  labelText: string;
  labelPosition?: AntdLabelPosition;
  labelAlignment?: "left" | "right";
  labelWidth?: number;
  labelTextColor?: string;
  labelTextSize?: TextSize;
  labelStyle?: string;
  borderRadius: string;
  boxShadow?: string;
  accentColor: string;
  isDirty?: boolean;
}

export default AntdSelectWidget;
