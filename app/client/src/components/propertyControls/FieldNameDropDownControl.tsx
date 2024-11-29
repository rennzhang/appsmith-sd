import React from "react";
import styled from "styled-components";
import { Option, Select, Text, Icon } from "design-system";
import type { ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import { get, isNil, last } from "lodash";
import { isDynamicValue } from "utils/DynamicBindingUtils";
import type { DSEventDetail } from "utils/AppsmithUtils";
import { DSEventTypes, DS_EVENT } from "utils/AppsmithUtils";
import { emitInteractionAnalyticsEvent } from "utils/AppsmithUtils";
import { getValidationErrorForProperty } from "./utils";
import equal from "fast-deep-equal";

const FlagWrapper = styled.span`
  font-family: "Twemoji Country Flags";
  font-size: 20px;
  line-height: 19px;
  margin-right: 10px;
  height: 100%;
  position: relative;
  top: 1px;
  overflow: initial !important;
`;

const ErrorMessage = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  color: var(--ads-v2-color-fg-error);
  margin-top: 5px;
`;
const findIdField = (options: any[], patterns: string[]) => {
  const targetPatterns = patterns.map((pattern) => new RegExp(pattern, "i"));
  return (
    options.find((opt) =>
      targetPatterns.some((pattern) => pattern.test(opt.label.toLowerCase())),
    )?.value || options?.[0]?.value
  );
};
class FieldNameDropDownControl extends BaseControl<DropDownControlProps> {
  containerRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.containerRef.current?.addEventListener(
      DS_EVENT,
      this.handleAdsEvent as (arg0: Event) => void,
    );
  }

  componentDidUpdate(prevProps: Readonly<DropDownControlProps>): void {
    const options = this.getOptions();
    if (!equal(this.getOptions(prevProps), options)) {
      this.getRecommendValue(options);
    }
  }
  componentWillUnmount() {
    this.containerRef.current?.removeEventListener(
      DS_EVENT,
      this.handleAdsEvent as (arg0: Event) => void,
    );
  }

  getRecommendValue(options: any[]) {
    const defaultFidldNames = {
      valueKey: "value",
      labelKey: "label",
      childrenKey: "children",
    };

    let recommendValue = this.props.defaultValue;

    const propertyName = this.props.propertyName;

    if (propertyName.includes("valueKey")) {
      recommendValue = findIdField(options, ["id", "value", "key"]) ?? "value";
    } else if (propertyName.includes("label")) {
      recommendValue =
        findIdField(options, ["label", "name", "title", "text"]) ?? "label";
    } else if (propertyName.includes("children")) {
      recommendValue =
        findIdField(options, ["children", "options", "child", "group"]) ??
        "children";
    }

    if (this.props.propertyValue !== recommendValue) {
      console.log("FIELD_NAME_DROP_DOWN getRecommendValue", {
        props: this.props,
        options,
        recommendValue,
      });
      this.batchUpdateProperties({
        [this.props.propertyName]: recommendValue,
      });

      this.props.updateHook?.(
        this.props.widgetProperties,
        this.props.propertyName,
        recommendValue,
      );
    }

    return recommendValue;
  }
  handleAdsEvent = (e: CustomEvent<DSEventDetail>) => {
    if (
      e.detail.component === "Dropdown" &&
      e.detail.event === DSEventTypes.KEYPRESS
    ) {
      emitInteractionAnalyticsEvent(this.containerRef.current, {
        key: e.detail.meta.key,
      });
      e.stopPropagation();
    }
  };

  getIsMultiSelect() {
    return (
      this.props.isMultiSelect || this.props.widgetProperties.isMultiSelect
    );
  }

  getOptions(prevProps?: typeof this.props) {
    const targetProps = prevProps ? prevProps : this.props;
    const options =
      typeof targetProps.options === "function"
        ? targetProps.options({
            ...targetProps,
            ...targetProps.widgetProperties,
          }) || []
        : targetProps?.options || [];
    return options;
  }

  render() {
    let defaultSelected: string | string[] | undefined = undefined;
    const isMultiSelect = this.getIsMultiSelect();
    if (isMultiSelect) {
      defaultSelected = [];
    }
    const options = this.getOptions();

    // this.setState({ options });

    if (this.props.defaultValue) {
      if (isMultiSelect) {
        const defaultValueSet = new Set(this.props.defaultValue);
        defaultSelected = options
          .filter((option) => defaultValueSet.has(option.value))
          .map((option) => option.value);
      } else {
        defaultSelected = options.find(
          (option) => option.value === this.props.defaultValue,
        )?.value;
      }
    }

    let selected: string | string[];

    if (isMultiSelect) {
      let propertyValue: any[] = (this.props.propertyValue as any) || [];
      if (!Array.isArray(propertyValue)) {
        propertyValue = [propertyValue];
      }
      const propertyValueSet = new Set(propertyValue);
      selected = options
        .filter((option) => propertyValueSet.has(option.value))
        .map((option) => option.value);
    } else {
      const computedValue =
        !isNil(this.props.propertyValue) &&
        isDynamicValue(this.props.propertyValue) &&
        // "dropdownUsePropertyValue" comes from the property config. This is set to true when
        // the actual propertyValue (not the evaluated) is to be used for finding the option from "options".
        !this.props.dropdownUsePropertyValue
          ? this.props.evaluatedValue
          : this.props.propertyValue;

      console.log("FIELD_NAME_DROP_DOWN render computedValue", computedValue);

      selected = options.find(
        (option) => option.value === computedValue,
      )?.value;
      if (!this.props.parentPropertyValue && selected) {
        this.onSelect(selected as string);
      }

      if (this.props.alwaysShowSelected && !selected) {
        selected = computedValue;
      }
    }

    const errors = getValidationErrorForProperty(
      this.props.widgetProperties,
      this.props.propertyName,
    );

    const errorMessage = errors?.[errors.length - 1]?.errorMessage?.message;

    console.log("FIELD_NAME_DROP_DOWN render", {
      defaultValue: this.props.defaultValue,
      options,
      selected,
      defaultSelected,
      props: this.props,
      errorMessage,
    });

    return (
      <div className="w-full h-full" ref={this.containerRef}>
        <Select
          // defaultValue={defaultSelected}
          isMultiSelect={isMultiSelect}
          isValid={!errors.length}
          onDeselect={this.onDeselect}
          onSelect={this.onSelect}
          optionFilterProp="label"
          optionLabelProp={this.props.hideSubText ? "label" : "children"}
          placeholder={this.props.placeholderText}
          showSearch={this.props.enableSearch}
          value={selected}
          virtual={this.props.virtual || false}
        >
          {options.map((option, index) => (
            <Option
              className="t--dropdown-option"
              key={index}
              label={option.label}
              value={option.value}
            >
              <div className="flex flex-row w-full">
                {/* Show Flag if present */}
                {option.leftElement && (
                  <FlagWrapper>{option.leftElement}</FlagWrapper>
                )}

                {/* Show icon if present */}
                {option.icon && (
                  <Icon className="mr-1" name={option.icon} size="md" />
                )}

                {option.subText ? (
                  this.props.hideSubText ? (
                    // Show subText below the main text eg - DatePicker control
                    <div className="w-full flex flex-col">
                      <Text kind="action-m">{option.label}</Text>
                      <Text kind="action-s">{option.subText}</Text>
                    </div>
                  ) : (
                    // Show subText to the right side eg - Label fontsize control
                    <div className="w-full flex justify-between items-end">
                      <Text kind="action-m">{option.label}</Text>
                      <Text kind="action-s">{option.subText}</Text>
                    </div>
                  )
                ) : (
                  // Only show the label eg - Auto height control
                  <Text kind="action-m">{option.label}</Text>
                )}
              </div>
            </Option>
          ))}
        </Select>
        {errorMessage && (
          <ErrorMessage data-testid="t---dropdown-control-error">
            {errorMessage}
          </ErrorMessage>
        )}
      </div>
    );
  }

  onSelect = (value?: string): void => {
    if (!isNil(value)) {
      let selectedValue: string | string[] = this.props.propertyValue;
      if (this.getIsMultiSelect()) {
        if (Array.isArray(selectedValue)) {
          const index = selectedValue.indexOf(value);
          if (index >= 0) {
            selectedValue = [
              ...selectedValue.slice(0, index),
              ...selectedValue.slice(index + 1),
            ];
          } else {
            selectedValue = [...selectedValue, value];
          }
        } else {
          selectedValue = [selectedValue, value];
        }
      } else {
        selectedValue = value;
      }

      console.log(
        ` FIELD_NAME_DROP_DOWN onSelect`,
        this.props.propertyName,
        selectedValue,
      );
      this.updateProperty(this.props.propertyName, selectedValue);
    }
  };

  onDeselect = (value?: string) => {
    if (!isNil(value)) {
      let selectedValue: string | string[] = this.props.propertyValue;
      if (this.getIsMultiSelect()) {
        if (Array.isArray(selectedValue)) {
          const index = selectedValue.indexOf(value);
          if (index >= 0) {
            selectedValue = [
              ...selectedValue.slice(0, index),
              ...selectedValue.slice(index + 1),
            ];
          }
        } else {
          selectedValue = [];
        }
      } else {
        selectedValue = "";
      }

      this.updateProperty(this.props.propertyName, selectedValue);
    }
  };

  isOptionSelected = (selectedOption: any) => {
    return selectedOption.value === this.props.propertyValue;
  };

  static getControlType() {
    return "FIELD_NAME_DROP_DOWN";
  }

  static canDisplayValueInUI(
    config: DropDownControlProps,
    value: any,
  ): boolean {
    const options =
      typeof config?.options === "function"
        ? config?.options(config.widgetProperties)
        : config?.options || [];

    const allowedValues = new Set(
      options?.map((x: { value: string | number }) => x.value.toString()),
    );
    console.log("canDisplayValueInUI ", config);

    if (config.isMultiSelect || config.widgetProperties.isMultiSelect) {
      try {
        const values = JSON.parse(value);
        for (const x of values) {
          if (!allowedValues.has(x.toString())) return false;
        }
      } catch {
        return false;
      }
      return true;
    } else {
      return allowedValues.has(value);
    }
  }
}

export interface DropDownControlProps extends ControlProps {
  options?: any[] | ((props: ControlProps["widgetProperties"]) => any[]);
  defaultValue?: string;
  virtual?: boolean;
  placeholderText: string;
  searchPlaceholderText: string;
  isMultiSelect?: boolean;
  dropdownHeight?: string;
  enableSearch?: boolean;
  propertyValue: string;
  optionWidth?: string;
  hideSubText?: boolean;
  dropdownUsePropertyValue?: boolean;
  alwaysShowSelected?: boolean;
}

export default FieldNameDropDownControl;
