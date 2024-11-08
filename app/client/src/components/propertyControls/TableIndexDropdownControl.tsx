import React from "react";
import { Select, Option } from "design-system";
import type { ControlProps } from "./BaseControl";
import BaseControl from "./BaseControl";
import type { DSEventDetail } from "design-system-old";
import { DS_EVENT, DSEventTypes } from "design-system-old";
import { emitInteractionAnalyticsEvent } from "utils/AppsmithUtils";
import { ORIGINAL_INDEX_KEY } from "../../widgets/Antd/TableWidget/constants";

class TableIndexDropdownControl extends BaseControl<ControlProps> {
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

  setDefaultValue = (props: any, options: any[], isMultiSelect?: boolean) => {
    if (this.props.defaultValue) {
      if (typeof this.props.defaultValue === "string") {
        this.onKeySelect(this.props.defaultValue);
      } else if (typeof this.props.defaultValue === "function") {
        this.onKeySelect(
          this.props.defaultValue({
            ...props,
            options,
          }),
        );
      }
    }
  };

  getIsMultiSelect = () => {
    let _isMultiSelect = this.props.isMultiSelect;
    if (_isMultiSelect === undefined) return true;

    if (typeof this.props.isMultiSelect === "function") {
      _isMultiSelect = (this.props.isMultiSelect as any)?.({
        ...this.props,
      });
    }
    if (_isMultiSelect && !Array.isArray(this.props.propertyValue)) {
      this.updateProperty(this.props.propertyName, []);
    } else if (
      !_isMultiSelect &&
      Array.isArray(this.props.propertyValue) &&
      this.props.propertyValue.length > 1
    ) {
      this.updateProperty(this.props.propertyName, undefined);
    }
    return _isMultiSelect;
  };
  render() {
    const { widgetProperties } = this.props;
    const evaluatedValues = widgetProperties?.__evaluation__?.evaluatedValues;
    const tableData = evaluatedValues?.filteredTableData || [];

    const isMultiSelect = this.getIsMultiSelect();
    const options: any[] = [];
    for (const row of tableData) {
      options.push({
        label: String(row[ORIGINAL_INDEX_KEY]),
        value: row[ORIGINAL_INDEX_KEY],
        id: row[ORIGINAL_INDEX_KEY],
      });
    }

    const selectedKeys = isMultiSelect
      ? Array.isArray(this.props.propertyValue)
        ? this.props.propertyValue
        : []
      : Array.isArray(this.props.propertyValue)
      ? this.props.propertyValue[0]
      : this.props.propertyValue;

    if (this.props.defaultValue && !selectedKeys) {
      this.setDefaultValue(this.props, options, isMultiSelect);
    }

    return (
      <div className="w-full h-full" ref={this.containerRef}>
        <Select
          allowClear
          isMultiSelect={isMultiSelect}
          maxLength={6}
          onDeselect={this.onKeyDeselect}
          onSelect={(value) =>
            this.onKeySelect(value, isMultiSelect, this.props.singleArray)
          }
          placeholder="请选择行"
          value={selectedKeys}
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

  onKeySelect = (
    value: string,
    isMultiSelect?: boolean,
    singleArray?: boolean,
  ): void => {
    const currentExpandKeys = Array.isArray(this.props.propertyValue)
      ? this.props.propertyValue
      : [];
    if (isMultiSelect) {
      const newExpandKeys = [...currentExpandKeys, value];
      this.updateProperty(this.props.propertyName, newExpandKeys);
    } else {
      this.updateProperty(
        this.props.propertyName,
        singleArray ? [value] : value,
      );
    }
  };

  onKeyDeselect = (value: string): void => {
    const currentExpandKeys = Array.isArray(this.props.propertyValue)
      ? this.props.propertyValue
      : [];
    const newExpandKeys = currentExpandKeys.filter((v) => v !== value);
    this.updateProperty(this.props.propertyName, newExpandKeys);
  };
  static getControlType() {
    return "TABLE_INDEX_DROPDOWN";
  }
}
export interface TableIndexDropdownControlProps extends ControlProps {
  propertyValue: string;
}
export default TableIndexDropdownControl;
