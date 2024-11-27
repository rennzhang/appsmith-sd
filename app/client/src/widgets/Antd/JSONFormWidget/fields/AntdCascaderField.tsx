import type { ReactNode } from "react";
import { memo, useCallback, useContext, useMemo, useRef } from "react";
import { omit } from "lodash";
import React from "react";

import FormContext from "../FormContext";
import type { CascaderComponentProps } from "widgets/Antd/Form/CascaderWidget/component";
import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import type {
  BaseFieldComponentProps,
  FieldComponent,
  FieldComponentBaseProps,
  FieldEventProps,
} from "../constants";
import { ActionUpdateDependency, CascaderWidgetConfig } from "../constants";
import useUpdateInternalMetaState from "./useUpdateInternalMetaState";
import type { DefaultValueType } from "rc-tree-select/lib/interface";
import { useFieldPropsHandler } from "../hooks/useFieldPropsHandler";
import { simpleDiff } from "widgets/Antd/tools/tool";

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

// 使用React.lazy进行组件懒加载
const CascaderComponent = React.lazy(
  () => import("widgets/Antd/Form/CascaderWidget/component"),
);

function AntdCascaderField({
  fieldClassName,
  name,
  passedDefaultValue,
  schemaItem,
}: CascaderFieldProps) {
  const { formControlSize, formLabelAlign, formLayout } =
    useContext(FormContext);
  const { callbackRef, ...commonProps } = useFieldPropsHandler({
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

      if (schemaItem.onCascaderSearch) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onCascaderSearch",
          dynamicString: schemaItem.onCascaderSearch,
          event: {
            type: EventType.ON_SEARCH,
          },
        });
      }
    },
    [name, schemaItem.onCascaderSearch, updateFilterText],
  );

  const onChangeHandler = useCallback(
    (value?: DefaultValueType, labelList?: ReactNode[]) => {
      console.log("onChangeHandler", { value, labelList });

      callbackRef.current.updateFormData({
        [name]: value,
      });
      updateSelectedValue(value);
      updateSelectedLabel(labelList);

      if (schemaItem.onOptionChange) {
        callbackRef.current.executeAction({
          triggerPropertyName: "onOptionChange",
          dynamicString: schemaItem.onOptionChange,
          event: {
            type: EventType.ON_OPTION_CHANGE,
          },
          updateDependencyType: ActionUpdateDependency.FORM_DATA,
        });
      }
    },
    [name, schemaItem.onOptionChange],
  );

  const dropdownWidth = wrapperRef.current?.clientWidth;

  const fieldComponent = useMemo(() => {
    return (
      <React.Suspense fallback={<div>加载中...</div>}>
        <CascaderComponent
          {...schemaItem}
          {...commonProps}
          onChange={onChangeHandler}
          onSearch={onSearchHandler}
        />
      </React.Suspense>
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
  prevProps: CascaderFieldProps,
  nextProps: CascaderFieldProps,
) => {
  // 开发环境打印diff
  if (process.env.NODE_ENV === "development") {
    const diffProps = simpleDiff(prevProps, nextProps);
    if (diffProps) {
      console.log("AntdCascaderField memo diff", {
        p: prevProps,
        n: nextProps,
        diff: diffProps,
      });
    }
  }
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
};

const MemoizedCascaderField: FieldComponent<CascaderFieldComponentProps> = memo(
  AntdCascaderField,
  arePropsEqual,
);
MemoizedCascaderField.componentDefaultValues = COMPONENT_DEFAULT_VALUES;

export default MemoizedCascaderField;
