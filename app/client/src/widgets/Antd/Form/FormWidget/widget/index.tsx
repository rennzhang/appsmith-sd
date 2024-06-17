import React from "react";
import _, { get, some } from "lodash";
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

  componentDidUpdate(prevProps: ContainerWidgetProps<any>) {
    super.componentDidUpdate(prevProps);
    this.updateFormData();
    // Check if the form is dirty
    const hasChanges = this.checkFormValueChanges(this.getChildContainer());

    if (hasChanges !== this.props.hasChanges) {
      this.props.updateWidgetMetaProperty("hasChanges", hasChanges);
    }
  }

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
      setTimeout(() => {
        this.context.syncUpdateWidgetMetaProperty?.(
          "y1v6xjt9jb",
          "value",
          "test",
        );
      }, 2000);
      if (!equal(formData, this.props.data)) {
        this.props.updateWidgetMetaProperty("data", formData);
      }
    }
  }

  getFormData(formWidget: ContainerWidgetProps<WidgetProps>) {
    const formData: any = {};
    console.log(
      "表单组件 getFormData formWidget.children",
      this,
      formWidget.children,
    );

    if (formWidget.children)
      formWidget.children.forEach((widgetData) => {
        if (!_.isNil(widgetData.value)) {
          formData[widgetData.widgetName] = widgetData.value;
        }
      });
    return formData;
  }

  renderChildWidget(): React.ReactNode {
    const childContainer = this.getChildContainer();

    if (childContainer.children) {
      const isInvalid = this.checkInvalidChildren(childContainer.children);
      childContainer.children = childContainer.children.map(
        (child: WidgetProps) => {
          const grandChild = { ...child };
          if (isInvalid) grandChild.isFormValid = false;
          // Add submit and reset handlers
          grandChild.onReset = this.handleResetInputs;
          return grandChild;
        },
      );
    }

    return (
      <ProForm
        getChildContainer={this.getChildContainer}
        widgetId={this.props.widgetId}
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
    };
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return (widget: FormWidgetProps, extraDefsToDefine?: ExtraDef) => ({
      "!doc":
        "Form is used to capture a set of data inputs from a user. Forms are used specifically because they reset the data inputs when a form is submitted and disable submission for invalid data inputs",
      "!url": "https://docs.appsmith.com/widget-reference/form",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      data: generateTypeDef(widget.data, extraDefsToDefine),
      hasChanges: "bool",
    });
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "string",
        },
      },
    };
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return { positioning: Positioning.Fixed };
  }
}

export interface FormWidgetProps extends ContainerComponentProps {
  name: string;
  data: Record<string, unknown>;
  hasChanges: boolean;
}

export default FormWidget;
