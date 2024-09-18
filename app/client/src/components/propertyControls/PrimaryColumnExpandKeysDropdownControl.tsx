import React from "react";
import { Select, Option } from "design-system";
import type { ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import type { DSEventDetail } from "design-system-old";
import { DS_EVENT, DSEventTypes } from "design-system-old";
import { emitInteractionAnalyticsEvent } from "utils/AppsmithUtils";

class PrimaryColumnExpandKeysDropdownControl extends BaseControl<ControlProps> {
  containerRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.containerRef.current?.addEventListener(
      DS_EVENT,
      this.handleAdsEvent as (arg0: Event) => void,
    );
  }

  componentWillUnmount() {
    this.containerRef.current?.removeEventListener(
      DS_EVENT,
      this.handleAdsEvent as (arg0: Event) => void,
    );
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

  setDefaultValue = (props: any, options: any[]) => {
    if (this.props.defaultValue) {
      if (typeof this.props.defaultValue === "string") {
        this.onExpandKeySelect(this.props.defaultValue);
      } else if (typeof this.props.defaultValue === "function") {
        this.onExpandKeySelect(
          this.props.defaultValue({
            ...props,
            options,
          }),
        );
      }
    }
  };
  render() {
    const { widgetProperties } = this.props;
    const evaluatedValues = widgetProperties?.__evaluation__?.evaluatedValues;
    const tableData = evaluatedValues?.tableData || [];
    const primaryColumnId = evaluatedValues?.primaryColumnId;

    const options: any[] = [];
    for (const row of tableData) {
      options.push({
        label: String(row[primaryColumnId]),
        value: row[primaryColumnId],
        id: row[primaryColumnId],
      });
    }

    const selectedExpandKeys = Array.isArray(this.props.propertyValue)
      ? this.props.propertyValue
      : [];

    if (this.props.defaultValue && !selectedExpandKeys) {
      this.setDefaultValue(this.props, options);
    }

    console.log("TABLE_EXPAND_KEYS_DROPDOWN", this.props, {
      options,
      tableData,
      primaryColumnId,
    });

    return (
      <div className="w-full h-full" ref={this.containerRef}>
        <Select
          isMultiSelect
          onDeselect={this.onExpandKeyDeselect}
          onSelect={this.onExpandKeySelect}
          placeholder="请选择要展开的行"
          value={selectedExpandKeys}
        >
          {options.map((option) => (
            <Option key={option.id} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
    );
  }

  onExpandKeySelect = (value: string): void => {
    const currentExpandKeys = Array.isArray(this.props.propertyValue)
      ? this.props.propertyValue
      : [];
    const newExpandKeys = [...currentExpandKeys, value];
    this.updateProperty(this.props.propertyName, newExpandKeys);
  };

  onExpandKeyDeselect = (value: string): void => {
    const currentExpandKeys = Array.isArray(this.props.propertyValue)
      ? this.props.propertyValue
      : [];
    const newExpandKeys = currentExpandKeys.filter((v) => v !== value);
    this.updateProperty(this.props.propertyName, newExpandKeys);
  };
  static getControlType() {
    return "TABLE_EXPAND_KEYS_DROPDOWN";
  }
}
export interface PrimaryColumnExpandKeysDropdownControlProps
  extends ControlProps {
  propertyValue: string;
}
export default PrimaryColumnExpandKeysDropdownControl;
