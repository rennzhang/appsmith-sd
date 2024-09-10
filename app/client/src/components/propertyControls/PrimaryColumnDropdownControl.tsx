import React from "react";
import type { ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import type { ColumnProperties } from "widgets/TableWidget/component/Constants";
import type { SegmentedControlOption } from "design-system";
import { Select, Option } from "design-system";
import type { DSEventDetail } from "utils/AppsmithUtils";
import {
  DSEventTypes,
  DS_EVENT,
  emitInteractionAnalyticsEvent,
} from "utils/AppsmithUtils";

class PrimaryColumnDropdownControl extends BaseControl<
  ControlProps & {
    filterUniqueValueKey?: boolean;
  }
> {
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
  findUniqueValueKeys = (ary: any[] = []) => {
    try {
      const valueKeys: Record<string, any> = {};
      if (ary.length === 0 || !ary) {
        return [];
      }
      (ary || [])?.forEach((obj) => {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === "object") return;
          const v = JSON.stringify(value) || "";
          valueKeys[v] = valueKeys[v] === undefined ? key : null;
        }
      });

      return [...new Set(Object.values(valueKeys).filter(Boolean))];
    } catch (error) {
      return [];
    }
  };

  setDefaultValue = (props: any, options: any[]) => {
    if (this.props.defaultValue) {
      if (typeof this.props.defaultValue === "string") {
        this.onItemSelect(this.props.defaultValue);
      } else if (typeof this.props.defaultValue === "function") {
        this.onItemSelect(
          this.props.defaultValue({
            ...props,
            options,
          }),
        );
      }
    }
  };

  render() {
    // Get columns from widget properties
    const columns: Record<string, ColumnProperties> =
      this.props.widgetProperties.primaryColumns;

    let options: any[] = [];

    for (const i in columns) {
      options.push({
        label: columns[i].label,
        id: columns[i].id,
        value: i,
      });
    }

    if (this.props.filterUniqueValueKey) {
      options = this.findUniqueValueKeys(
        this.props.widgetProperties?.__evaluation__?.evaluatedValues
          ?.tableData || [],
      ).map((key) => ({
        label: key,
        id: key,
        value: key,
      }));
    }
    const selected: SegmentedControlOption = options.find(
      (option) => option.value === this.props.propertyValue,
    );

    if (this.props.defaultValue && !selected) {
      this.setDefaultValue(this.props, options);
    }

    return (
      <div className="w-full h-full" ref={this.containerRef}>
        <Select
          onSelect={this.onItemSelect}
          placeholder="未选择"
          value={selected ? selected.value : undefined}
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

  onItemSelect = (value?: string): void => {
    if (value) {
      this.updateProperty(this.props.propertyName, value);
    }
  };

  static getControlType() {
    return "PRIMARY_COLUMNS_DROPDOWN";
  }
}

export interface PrimaryColumnDropdownControlProps extends ControlProps {
  propertyValue: string;
}

export default PrimaryColumnDropdownControl;
