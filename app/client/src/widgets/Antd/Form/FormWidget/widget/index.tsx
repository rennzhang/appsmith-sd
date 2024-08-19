import type { MutableRefObject } from "react";
import React from "react";
import _, { cloneDeep, get, last, some } from "lodash";
import equal from "fast-deep-equal/es6";
import type { WidgetType } from "constants/WidgetConstants";
import type { ContainerWidgetProps } from "widgets/ContainerWidget/widget";
import { ContainerWidget } from "widgets/ContainerWidget/widget";
import type { ContainerComponentProps } from "widgets/ContainerWidget/component";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import { Positioning } from "utils/autoLayout/constants";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type { ExtraDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import { generateTypeDef } from "utils/autocomplete/dataTreeTypeDefCreator";
import type { AutocompletionDefinitions } from "widgets/constants";
import type { SetterConfig } from "entities/AppTheming";
import type { WidgetProps } from "widgets/BaseWidget";
import ProForm from "../components/index";
import { ValidationTypes } from "constants/WidgetValidation";
import type { PropertyPaneConfig } from "constants/PropertyControlConstants";
// controlType 类型
import type { PropertyControlType } from "components/propertyControls";
import type {
  FormInstance,
  ProFormInstance,
  ProFormProps,
} from "@ant-design/pro-components";
import { AntdFormInstanceProps } from "./childPanels/FormInstance";
import { INSTANCE_INVALID_VALUE } from "../../CONST/DEFAULT_CONFIG";
import { mergeWidgetConfig } from "utils/helpers";
import { AutocompleteDataType } from "utils/autocomplete/AutocompleteDataType";
// import FormItemLayoutConfig from "./childPanels/FormItemLayoutConfig";
class FormWidget extends ContainerWidget {
  checkInvalidChildren = (children: WidgetProps[]): boolean => {
    return some(children, (child) => {
      if ("children" in child) {
        return this.checkInvalidChildren(child.children || []);
      }
      if ("isValid" in child) {
        return !child.isValid;
      }
      return false;
    });
  };

  handleResetInputs = () => {
    super.resetChildrenMetaProperty(this.props.widgetId);
  };

  componentDidMount() {
    super.componentDidMount();
    this.updateFormData();

    // Check if the form is dirty
    const hasChanges = this.checkFormValueChanges(this.getChildContainer());

    if (hasChanges !== this.props.hasChanges) {
      this.props.updateWidgetMetaProperty("hasChanges", hasChanges);
    }
  }

  batchUpdateChildrenProperty = async (
    children: WidgetProps[],
    propertyName: string,
    propertyValue: any,
  ) => {
    children.map(async (child: WidgetProps) => {
      await this.context?.batchUpdateWidgetProperty?.(
        child.widgetId,
        {
          modify: { [propertyName]: propertyValue },
          triggerPaths: [propertyName],
        },
        true,
      );
    });
  };
  overridChildPropsOnDidUpdate = async (
    prevProps: ContainerWidgetProps<any>,
    isNewWdget?: boolean,
  ) => {
    const shouldUpdateValues: Record<string, any> = {
      isDisabled: this.props.isDisabled,
      labelAlignment: this.props.labelAlignment,
      // isRequired: this.props.isRequired,
      controlSize: this.props.controlSize,
      isRequired: this.props.isRequired,
    };

    if (isNewWdget && this.props.isFullWidth) {
      shouldUpdateValues.rightColumn = 64;
      shouldUpdateValues.leftColumn = 0;
    }

    const childContainer = isNewWdget
      ? [last(this.props?.childWidgets?.[0].children)]
      : this.getChildContainer().children;
    Object.entries(shouldUpdateValues).forEach(([field, value]) => {
      if (isNewWdget || this.props[field] !== prevProps[field]) {
        this.batchUpdateChildrenProperty(childContainer, field, value);
      }
    });
  };

  componentDidUpdate(prevProps: ContainerWidgetProps<any>) {
    super.componentDidUpdate(prevProps);
    this.updateFormData();
    // Check if the form is dirty
    const hasChanges = this.checkFormValueChanges(this.getChildContainer());

    if (hasChanges !== this.props.hasChanges) {
      this.props.updateWidgetMetaProperty("hasChanges", hasChanges);
    }

    // 当 form 组件新增子组件时，延迟 300ms 覆盖更新子组件属性，如禁用、必填、控件大小等
    if (
      this.props?.childWidgets?.[0].children?.length >
      prevProps?.childWidgets?.[0].children?.length
    ) {
      setTimeout(() => {
        this.overridChildPropsOnDidUpdate(prevProps, true);
      }, 300);
    } else {
      // 当 form 组件部分属性变化时，覆盖更新子组件属性，如禁用、必填、控件大小等
      this.overridChildPropsOnDidUpdate(prevProps);
    }
  }

  // componentWillUnmount(): void {}

  checkFormValueChanges(
    containerWidget: ContainerWidgetProps<WidgetProps>,
  ): boolean {
    const childWidgets = containerWidget.children || [];

    const hasChanges = childWidgets.some((child) => child.isDirty);
    if (!hasChanges) {
      return childWidgets.some(
        (child) =>
          child.children?.length &&
          this.checkFormValueChanges(get(child, "children[0]")),
      );
    }

    return hasChanges;
  }

  getChildContainer = () => {
    const { childWidgets = [] } = this.props;
    return { ...childWidgets[0] };
  };

  updateFormData() {
    const firstChild = this.getChildContainer();
    if (firstChild) {
      const formData = this.getFormData(firstChild);

      if (!equal(formData, this.props.data)) {
        this.props.updateWidgetMetaProperty("data", formData);
      }
    }
  }
  updateWidgetProps = async (path: string, value: any) => {
    this.props.updateWidgetMetaProperty(path, value);
  };

  getFormData(formWidget: ContainerWidgetProps<WidgetProps>) {
    const formData: any = {};

    if (formWidget.children)
      formWidget.children.forEach((widgetData) => {
        if (!_.isNil(widgetData.value)) {
          formData[widgetData.widgetName] = widgetData.value;
        }
      });
    return formData;
  }

  getFormDefaultData = (formWidget: ContainerWidgetProps<WidgetProps>) => {
    const formData: any = {};
    if (formWidget.children) {
      formWidget.children.forEach((widgetData) => {
        if (!_.isNil(widgetData.defaultValue)) {
          formData[widgetData.widgetName] = widgetData.defaultValue;
        }
      });
    }
    return formData;
  };

  getFormItems = (formWidget: ContainerWidgetProps<WidgetProps>) => {
    const items: {
      name: string;
      label: string;
    }[] = [];
    if (formWidget.children) {
      formWidget.children.forEach((widgetData) => {
        items.push({
          name: widgetData.widgetName,
          label: widgetData.labelText,
        });
      });
    }
    return items;
  };

  renderChildWidget(): React.ReactNode {
    const childContainer = this.getChildContainer();

    if (childContainer.children) {
      const isInvalid = this.checkInvalidChildren(childContainer.children);
      childContainer.children = childContainer.children.map(
        (child: WidgetProps) => {
          const grandChild = {
            ...child,
            isDisabled: this.props.isDisabled,
            formParentWidgetId: this.props.widgetId,

            // isRequired: this.props.isRequired,
            // labelPosition:
            //   this.props.formLayout === "horizontal" ? "left" : "top",
          } as any;
          if (isInvalid) grandChild.isFormValid = false;

          // Add submit and reset handlers
          grandChild.onReset = this.handleResetInputs;
          return grandChild;
        },
      );
    }
    console.group("表单组件 renderChildWidget");
    console.log(" this", this);
    console.log(" props", this.props);
    console.log(" childContainer", childContainer);
    console.log("表单组件 默认值", this.getFormDefaultData(childContainer));
    console.groupEnd();

    const initialValues = this.getFormDefaultData(childContainer);

    const formItems = this.getFormItems(childContainer);
    return (
      <ProForm
        disabled={this.props.isDisabled}
        formItems={formItems}
        formLayout={this.props.formLayout}
        getChildContainer={this.getChildContainer}
        getFormData={this.getFormData}
        initialValues={initialValues}
        isKeyPressSubmit={this.props.isKeyPressSubmit}
        labelAlign={this.props.labelAlignment}
        labelCol={this.props.labelCol}
        labelFlex={this.props.labelFlex}
        updateWidgetProps={this.updateWidgetProps}
        wrapperCol={this.props.wrapperCol}
        labelWrap={this.props.labelWrap}
        // setFormRef={this.setFormRef}
        size={this.props.controlSize}
        {...this.props}
      >
        {super.renderChildWidget(childContainer)}
      </ProForm>
    );
  }

  static getWidgetType(): WidgetType {
    return "ANTD_FORM_WIDGET";
  }

  static getStylsheetConfig() {
    return {
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "{{appsmith.theme.boxShadow.appBoxShadow}}",
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      hasChanges: false,
      errorFields: [],
    };
  }
  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "功能",
        children: [
          {
            helpText: "是否使用回车提交",
            propertyName: "isKeyPressSubmit",
            label: "回车提交",
            defaultValue: false,
            controlType: "SWITCH",
            isBindProperty: false,
            isTriggerProperty: false,
            isJSConvertible: true,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },
      // 校验
      {
        sectionName: "校验",
        children: [
          {
            helpText: "控制所有表单项是否必填",
            propertyName: "isRequired",
            label: "必填",
            defaultValue: false,
            controlType: "SWITCH",
            isBindProperty: false,
            isTriggerProperty: false,
            isJSConvertible: true,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          // 失败时弹出提示的内容
          {
            helpText: "校验失败时的提示信息，不填写时不会出现任何提示",
            propertyName: "validateMessage",
            label: "校验失败提示信息",
            controlType: "INPUT_TEXT",

            // defaultValue: "请完善表单内容",
            placeholderText: "请完善表单内容",
            isBindProperty: false,
            isTriggerProperty: false,
            isJSConvertible: true,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                expected: {
                  type: "string |\nother data (only works in mustache syntax)",
                  example:
                    "abc | {{AntdForm1.errorFields[0].label[0] + '是必填项'}}",
                  autocompleteDataType: AutocompleteDataType.STRING,
                },
              },
            },
            hidden: (props: FormWidgetProps) => !props.isRequired,
            dependencies: ["isRequired"],
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            propertyName: "isVisible",
            label: "是否显示",
            helpText: "控制组件的显示/隐藏",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            controlType: "SWITCH",
            helpText: "让组件不可交互",
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
      AntdFormInstanceProps,
    ];
  }
  static getPropertyPaneStyleConfig() {
    return mergeWidgetConfig(
      [
        {
          sectionName: "样式",
          children: [
            // controlSize 控制
            {
              helpText: "表单控件大小",
              propertyName: "controlSize",
              label: "表单尺寸",
              controlType: "ICON_TABS",
              options: [
                {
                  label: "小",
                  value: "small",
                },
                {
                  label: "默认",
                  value: "middle",
                },
                {
                  label: "大",
                  value: "large",
                },
              ],
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.TEXT },
            },
            // isFullWidth
            {
              helpText: "新增的子组件是否占满宽度",
              propertyName: "isFullWidth",
              label: "默认宽度占满",
              controlType: "SWITCH",
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.BOOLEAN },
            },
            // 表单布局控制
            {
              helpText: "表单布局控制",
              propertyName: "formLayout",
              label: "表单布局",
              // controlType 类型
              controlType: "ICON_TABS" as PropertyControlType,
              options: [
                {
                  label: "水平",
                  value: "horizontal",
                },
                {
                  label: "垂直",
                  value: "vertical",
                },
              ],
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.TEXT },
            },

            // labelAlignment
            {
              helpText: "标签对齐方式",
              propertyName: "labelAlignment",
              label: "标签对齐",
              controlType: "ICON_TABS",
              options: [
                {
                  label: "左对齐",
                  value: "left",
                },
                {
                  label: "右对齐",
                  value: "right",
                },
              ],
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.TEXT },
              dependencies: ["formLayout"],
              hidden: (props: FormWidgetProps) =>
                props.formLayout === "vertical",
            },

            // labelWrap 控制
            {
              helpText: "标签是否换行",
              propertyName: "labelWrap",
              label: "标签换行",
              defaultValue: false,
              controlType: "SWITCH",
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.BOOLEAN },
              dependencies: ["formLayout"],
              hidden: (props: FormWidgetProps) =>
                props.formLayout === "vertical",
            },
            // labelWidth 控制
            {
              helpText: "标签宽度达到一定长度后换行",
              propertyName: "labelFlex",
              label: "标签宽度",
              controlType: "INPUT_TEXT",
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.NUMBER },
              dependencies: ["labelWrap"],
              hidden: (props: FormWidgetProps) => !props.labelWrap,
            },
            // labelCol 控制
            {
              helpText: "标签栅格占位格数",
              propertyName: "labelCol",
              label: "标签宽度",
              controlType: "INPUT_TEXT" as PropertyControlType,
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.OBJECT },
              dependencies: ["labelWrap"],
              hidden: (props: FormWidgetProps) =>
                props.labelWrap || props.formLayout === "vertical",
            },
            // wrapperCol 控制
            {
              helpText: "表单控件栅格占位格数",
              propertyName: "wrapperCol",
              label: "控件宽度",
              controlType: "INPUT_TEXT",
              isBindProperty: false,
              isTriggerProperty: false,
              isJSConvertible: true,
              validation: { type: ValidationTypes.OBJECT },
              dependencies: ["labelWrap"],
              hidden: (props: FormWidgetProps) =>
                props.labelWrap || props.formLayout === "vertical",
            },
          ],
        },
      ],
      super.getPropertyPaneStyleConfig(),
    );
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: FormWidgetProps, extraDefsToDefine?: ExtraDef) => {
      return {
        "!doc":
          "Form is used to capture a set of data inputs from a user. Forms are used specifically because they reset the data inputs when a form is submitted and disable submission for invalid data inputs",
        "!url": "https://docs.appsmith.com/widget-reference/form",
        isVisible: DefaultAutocompleteDefinitions.isVisible,
        data: generateTypeDef(widget.data, extraDefsToDefine),
        errorFields: generateTypeDef(widget.errorFields, extraDefsToDefine),
        hasChanges: "bool",
      };
    };
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "string",
        },
        validateFields: {
          path: "validateFieldsParams",
          type: "array",
        },
      },
    };
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return { positioning: Positioning.Fixed };
  }
}
type FormWidgetPropsExtends = ContainerComponentProps & ProFormProps;
export interface FormWidgetProps extends FormWidgetPropsExtends {
  name: string;
  data: Record<string, unknown>;
  errorFields: ReturnType<FormInstance["getFieldsError"]>;
  hasChanges: boolean;
  labelWrap?: boolean;
  formLayout?: "horizontal" | "vertical";
  isRequired: boolean;
  showValidateMessage: boolean;
}

export default FormWidget;
