import type { ReactNode } from "react";
import { useCallback, useContext, useMemo, useRef } from "react";
import { omit } from "lodash";

import FormContext from "../FormContext";
import type { CascaderComponentProps } from "widgets/Antd/Form/CascaderWidget/component";
import CascaderComponent from "widgets/Antd/Form/CascaderWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, CascaderWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import type { DefaultValueType } from "rc-tree-select/lib/interface";

type CascaderFieldComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  CascaderComponentProps;

export type CascaderFieldProps =
  BaseFieldComponentProps<CascaderFieldComponentProps>;

const COMPONENT_DEFAULT_VALUES: CascaderFieldComponentProps = {
  ...omit(CascaderWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: CascaderWidgetConfig.type,
};

function AntdCascaderField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: CascaderFieldProps) {
  const {
    executeAction,
    formControlSize,
    formLabelAlign,
    formLayout,
    updateFormData,
  } = useContext(FormContext);
  const commonProps = useFieldPropsHandler({
    name,
    schemaItem,
    passedDefaultValue,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [updateFilterText] = useUpdateInternalMetaState({
    propertyName: `${name}.searchText`,
  });
  const [updateSelectedValue] = useUpdateInternalMetaState({
    propertyName: `${name}.selectedValue`,
  });
  const [updateSelectedLabel] = useUpdateInternalMetaState({
    propertyName: `${name}.selectedLabel`,
  });

  const onSearchHandler = useCallback(
    (value: string) => {
      updateFilterText(value);

      if (schemaItem.onCascaderSearch && executeAction) {
        executeAction({
          triggerPropertyName: "onCascaderSearch",
          dynamicString: schemaItem.onCascaderSearch,
          event: {
            type: EventType.ON_SEARCH,
          },
        });
      }
    },
    [executeAction, name, schemaItem.onCascaderSearch, updateFilterText],
  );

  const onChangeHandler = useCallback(
    (value?: DefaultValueType, labelList?: ReactNode[]) => {
      console.log("onChangeHandler", { value, labelList });

      updateFormData({
        [name]: value,
      });
      updateSelectedValue(value);
      updateSelectedLabel(labelList);

      if (schemaItem.onOptionChange && executeAction) {
        executeAction({
          triggerPropertyName: "onOptionChange",
          dynamicString: schemaItem.onOptionChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [executeAction, name, schemaItem.onOptionChange, updateFormData],
  );

  const dropdownWidth = wrapperRef.current?.clientWidth;

  const fieldComponent = useMemo(() => {
    return (
      <CascaderComponent
        {...schemaItem}
        {...commonProps}
        onChange={onChangeHandler}
        onSearch={onSearchHandler}
      />
    );
  }, [
    schemaItem,
    commonProps,
    onSearchHandler,
    onChangeHandler,
    dropdownWidth,
    formControlSize,
    formLayout,
    formLabelAlign,
  ]);

  return fieldComponent;
}

AntdCascaderField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default AntdCascaderField;
