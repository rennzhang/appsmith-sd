import { memo, useCallback, useContext, useMemo, useRef } from "react";
import type { DraftValueType } from "rc-select/lib/Select";
import { omit } from "lodash";

import FormContext from "../FormContext";
import type { TreeSelectComponentProps as AntdTreeSelectComponentProps } from "widgets/Antd/Form/TreeSelectWidget/component";
import TreeSelectComponent from "widgets/Antd/Form/TreeSelectWidget/component";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, TreeSelectWidgetConfig } from "../constants";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import { diff } from "deep-diff";

type TreeSelectComponentProps = FieldComponentBaseProps &
  FieldEventProps &
  AntdTreeSelectComponentProps;

export type TreeSelectFieldProps =
  BaseFieldComponentProps<TreeSelectComponentProps>;

const COMPONENT_DEFAULT_VALUES: TreeSelectComponentProps = {
  ...omit(TreeSelectWidgetConfig.defaults, "defaultValue"),
  isDisabled: false,
  isRequired: false,
  isVisible: true,
  labelText: "",
  type: TreeSelectWidgetConfig.type,
};

function AntdTreeSelectField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: TreeSelectFieldProps) {
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
  const [updateSelectInfo] = useUpdateInternalMetaState({
    propertyName: `${name}.selectedInfo`,
  });

  const onSearchHandler = useCallback(
    (value: string) => {
      updateFilterText(value);

      if (schemaItem.onTreeSelectSearch && executeAction) {
        executeAction({
          triggerPropertyName: "onTreeSelectSearch",
          dynamicString: schemaItem.onTreeSelectSearch,
          event: {
            type: EventType.ON_SEARCH,
          },
        });
      }
    },
    [name, schemaItem.onTreeSelectSearch, updateFilterText],
  );

  const onChangeHandler = useCallback(
    (values: DraftValueType, labels: string[]) => {
      updateFormData({
        [name]: values,
      });
      updateSelectedLabel(labels);
      updateSelectedValue(values);

      if (schemaItem.onTreeSelectValueChange && executeAction) {
        executeAction({
          triggerPropertyName: "onTreeSelectValueChange",
          dynamicString: schemaItem.onTreeSelectValueChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [name, schemaItem.onTreeSelectValueChange, updateFormData],
  );

  const dropdownWidth = wrapperRef.current?.clientWidth;

  const fieldComponent = useMemo(() => {
    return (
      <TreeSelectComponent
        {...schemaItem}
        {...commonProps}
        onChange={onChangeHandler}
        onSearch={onSearchHandler}
        updateSelectInfo={updateSelectInfo}
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

const arePropsEqual = (
  prevProps: TreeSelectFieldProps,
  nextProps: TreeSelectFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = diff(prevProps, nextProps);

    diffProps &&
      console.log("AntdTreeSelectField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
        isSame: JSON.stringify(prevProps) === JSON.stringify(nextProps),
      });
  }
  return (
    prevProps.name === nextProps.name &&
    prevProps.passedDefaultValue === nextProps.passedDefaultValue &&
    JSON.stringify(prevProps.schemaItem) ===
      JSON.stringify(nextProps.schemaItem)
  );
};

const MemoizedTreeSelectField: FieldComponent<TreeSelectComponentProps> = memo(
  AntdTreeSelectField,
  arePropsEqual,
);
MemoizedTreeSelectField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedTreeSelectField;
