// import { AutoComplete } from "antd";
// import React from "react";
import type {
  ProFormInstance,
  ProFormProps,
  SubmitterProps,
} from "@ant-design/pro-components";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { AntdProformContainer } from "widgets/Antd/Style";
// export default InputComponent;
import type { ValidateFields } from "rc-field-form/es/interface";
import { ConfigProvider, message, theme } from "antd";
import type { WidgetStyleContainerProps } from "components/designSystems/appsmith/WidgetStyleContainer";
import type { MouseEventHandler, ReactNode } from "react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AppPositioningTypes } from "reducers/entityReducers/pageListReducer";
import type { WidgetProps } from "widgets/BaseWidget";
import type { ContainerWidgetProps } from "widgets/ContainerWidget/widget";
import { isNumber } from "lodash";
import type { FieldError } from "rc-field-form/lib/interface";
import useTableButtonRender from "widgets/Antd/TableWidget/component/hooks/useTableButtonRender";
import {
  CheckboxGroupAlignmentTypes,
  type CheckboxGroupAlignment,
} from "components/constants";
import type { BoxShadow } from "components/designSystems/appsmith/WidgetStyleContainer";
import type { Color } from "constants/Colors";

export interface ProformContainerComponentProps {
  isDisabled?: boolean;
  className?: string;
  showCancel?: boolean;
  onCancel?: () => void;
  scrollContents: boolean;
  initialValues?: Record<string, any>;
  borderColor?: Color;
  borderRadius?: number;
  borderWidth?: number;
  boxShadow?: BoxShadow;
  boxShadowColor?: string;
  hideFooter?: boolean;
  formRef: React.RefObject<ProFormInstance<any>> | null;
  validateOnly?: boolean;
  validateFieldsParams?: any;
  getFormData: (formWidget: ContainerWidgetProps<WidgetProps>) => any;
  children: ReactNode;
  backgroundImage?: string;
  shouldScrollContents?: boolean;
  resizeDisabled?: boolean;
  selected?: boolean;
  focused?: boolean;
  detachFromLayout?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onClickCapture?: MouseEventHandler<HTMLDivElement>;
  backgroundColor?: string;
  noScroll?: boolean;
  minHeight?: number;
  useAutoLayout?: boolean;
  direction?: string;
  justifyContent?: string;
  alignItems?: string;
  dropDisabled?: boolean;
  appPositioningType?: AppPositioningTypes;
  isListItemContainer?: boolean;
  disabled?: boolean;
  isKeyPressSubmit?: boolean;
  formLayout?: "horizontal" | "vertical" | "inline";
  size?: ProFormProps["size"];
  labelWrap?: ProFormProps["labelWrap"];

  labelWidth?: number;
  widgetName: string;
  labelFlex?: number;
  wrapperCol?: string;
  labelCol?: string;
  labelAlign?: "left" | "right";
  updateWidgetProps: (path: string, value: any) => void;
  validateFieldsParamsChange?: number;
  validateMessage?: string;
  formItems: { name: string; label: string }[];
  isSubmitting: boolean;
  resetButtonLabel?: string;
  submitButtonLabel?: string;
  showReset?: boolean;
  title?: string;
  onSubmit?: (values: any) => void;
  disabledWhenInvalid?: boolean;
  colorPrimary?: string;
  titleColor?: string;
  fixedFooter: boolean;
  maxHeight?: number;
  submitButtonStyles?: any;
  resetButtonStyles?: any;
  buttonAlignment?: CheckboxGroupAlignment;
}

const AntdProForm = forwardRef((props: ProformContainerComponentProps, ref) => {
  const {
    backgroundColor,
    borderColor,
    borderRadius,
    borderWidth,
    boxShadow,
    children,
    className,
    colorPrimary,
    disabled,
    disabledWhenInvalid,
    fixedFooter,
    formItems,
    formLayout,
    formRef,
    hideFooter,
    initialValues,
    isDisabled,
    isKeyPressSubmit,
    isSubmitting,
    labelAlign,
    labelCol,
    labelFlex,
    labelWidth,
    labelWrap,
    maxHeight,
    onSubmit,
    resetButtonLabel,
    scrollContents,

    showReset,
    size,
    submitButtonLabel,
    title,
    titleColor,
    updateWidgetProps,
    validateFieldsParams: __vfp,
    validateMessage,
    widgetName,
    wrapperCol,
  } = props;

  const { renderActionButton } = useTableButtonRender();
  // 是否校验中
  const [validating, setValidating] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);

  // 自动更新initialValues
  useEffect(() => {
    console.log("表单组件 initialValues", initialValues);
    formRef?.current?.setFieldsValue(initialValues);
  }, [initialValues]);
  const updateErrorFidlds = (errorFields?: FieldError[]) => {
    // 按照formItems的顺序排序，返回格式和errorFields一致，并在每个item中增加label字段，只返回有错误的字段

    const sortErrorFields = formItems
      .map((item) => {
        const errorItem = errorFields?.find((c) => c.name[0] === item.name);
        const _label = formItems
          .filter((c) => c.name === item.name)
          .map((c) => c.label);
        if (errorItem) {
          return {
            ...errorItem,
            label: _label,
          };
        }
        return null;
      })
      .filter((item) => item !== null);
    updateWidgetProps("errorFields", sortErrorFields);

    console.log(
      "表单组件 handleValidateFields finally",
      errorFields,
      sortErrorFields,
    );
  };

  const handleValidateFields = async (namePath?: string[]) => {
    if (validating) return;
    await setValidating(true);

    const opt = { validateOnly: props.validateOnly } as any;
    const params = namePath?.length ? [namePath, opt] : [opt];

    const values = await formRef?.current
      ?.validateFields(...params)
      .finally(async () => {
        const errorFields = formRef.current
          ?.getFieldsError()
          .filter((item) => item.errors.length > 0 || item.warnings.length > 0);
        updateErrorFidlds(errorFields);

        if (validateMessage && errorFields?.length) {
          message.error(validateMessage);
        }

        await setValidating(false);
      });
    console.log("表单组件 handleValidateFields values", values);
    return values;
  };
  // 当validateFieldsParams有值时，调用validateFields方法
  useEffect(() => {
    console.log("表单组件 validateFieldsParams", __vfp, props);
    if (!__vfp || isNumber(__vfp)) return;
    const _data = __vfp?.includes?.("UNDEFINED") ? undefined : __vfp;

    handleValidateFields(_data);
  }, [props.validateFieldsParamsChange]);

  useImperativeHandle(ref, () => ({
    handleValidateFields,
    formRef,
  }));

  const formItemLayoutMemo = useMemo(() => {
    if (formLayout == "vertical") {
      return null;
    }
    if (labelWrap) {
      return {
        labelCol: { flex: +(labelFlex || "0") + "px" },
        wrapperCol: { flex: 1 },
      };
    } else {
      try {
        return {
          labelCol: JSON.parse(labelCol || "{}"),
          wrapperCol: JSON.parse(wrapperCol || "{}"),
        };
      } catch (error) {
        return { labelCol, wrapperCol };
      }
    }
  }, [labelFlex, labelWrap, labelCol, wrapperCol, formLayout]);
  const handleFinsh = async (values: any) => {
    console.group("表单组件 handleFinsh");
    console.log("handleFinsh values", values);
    // console.log("getFormData", getFormData(getChildContainer?.()));

    console.log(" formRef.current", formRef?.current);
    console.log(
      " formRef.current getFieldsError",
      formRef?.current?.getFieldsError(),
    );
    const val1 = await handleValidateFields();
    console.log("validateFields:", val1);
    const val2 = await formRef?.current?.validateFieldsReturnFormatValue?.();
    console.log("validateFieldsReturnFormatValue:", val2);
    console.groupEnd();

    onSubmit?.(values);
  };
  const handleFinishFailed = async (values: any) => {
    console.group("表单组件 handleFinishFailed");
    console.log("handleFinishFailed values", values);
    // console.log("getFormData", getFormData(getChildContainer?.()));

    setFieldErrors(formRef?.current?.getFieldsError() || []);
    console.log(" formRef.current", formRef?.current);
    console.log(
      " formRef.current getFieldsError",
      formRef?.current?.getFieldsError(),
    );
    const val1 = await handleValidateFields();
    console.log("validateFields:", val1);
    const val2 = await formRef?.current?.validateFieldsReturnFormatValue?.();
    console.log("validateFieldsReturnFormatValue:", val2);
    console.groupEnd();
  };

  const isFormValid = useMemo(() => {
    return fieldErrors.length === 0;
  }, [fieldErrors]);

  const isSubmitDisabled = useMemo(() => {
    return (disabledWhenInvalid && !isFormValid) || isDisabled;
  }, [disabledWhenInvalid, isFormValid, isDisabled]);

  // const handleSubmit = async (values: any) => {
  //   console.group("表单组件 handleSubmit");
  //   console.log("handleSubmit values", values);
  //   console.log("getFormData", getFormData(getChildContainer?.()));
  //   console.log(" formRef.current", formRef.current);
  //   console.log(
  //     " formRef.current getFieldsError",
  //     formRef.current?.getFieldsError(),
  //   );
  //   const val1 = await formRef.current?.validateFields();
  //   console.log("validateFields:", val1);
  //   const val2 = await formRef.current?.validateFieldsReturnFormatValue?.();
  //   console.log("validateFieldsReturnFormatValue:", val2);
  //   console.groupEnd();
  // };

  const [submitButtonColor, setSubmitButtonColor] = useState<string>("");
  useEffect(() => {
    setSubmitButtonColor(colorPrimary || "");
  }, [colorPrimary]);
  useEffect(() => {
    setSubmitButtonColor(props.submitButtonStyles?.buttonColor);
  }, [props.submitButtonStyles?.buttonColor]);

  const [resetButtonColor, setResetButtonColor] = useState<string>("");
  useEffect(() => {
    setResetButtonColor(colorPrimary || "");
  }, [colorPrimary]);
  useEffect(() => {
    setResetButtonColor(props.resetButtonStyles?.buttonColor);
  }, [props.resetButtonStyles?.buttonColor]);

  const submitterMemo = useMemo<SubmitterProps>(() => {
    return {
      render: ({ onReset, onSubmit }) => (
        <div
          className="antd-pro-form-submitter"
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: props.buttonAlignment,
          }}
        >
          {props.showCancel &&
            renderActionButton({
              button: {
                ...props.resetButtonStyles,
                buttonColor: resetButtonColor,
                buttonLabel: "取消",
                buttonSize: props.resetButtonStyles?.controlSize,
              },
              onClick: () => {
                props.onCancel?.();
                // onReset?.();
                // updateFormData({});
              },
              configToken: {},
            })}
          {showReset &&
            renderActionButton({
              button: {
                ...props.resetButtonStyles,
                buttonColor: resetButtonColor,
                buttonLabel: resetButtonLabel,
                loading: isSubmitting,
                buttonSize: props.resetButtonStyles?.controlSize,
                isDisabled: isDisabled,
              },
              onClick: () => {
                formRef?.current?.resetFields();
              },
              configToken: {},
            })}
          {renderActionButton({
            button: {
              ...props.submitButtonStyles,
              buttonColor: submitButtonColor,
              buttonLabel: submitButtonLabel,
              isDisabled: isSubmitDisabled,
              loading: isSubmitting,
              buttonSize: props.submitButtonStyles?.controlSize,
            },
            onClick: () => {
              formRef?.current?.submit();
              // onSubmit?.();
              // updateFormData({});
            },
            configToken: {},
          })}
        </div>
      ),
    };
  }, [
    isDisabled,
    hideFooter,
    isSubmitting,
    isSubmitDisabled,
    resetButtonLabel,
    showReset,
    submitButtonLabel,
    props.submitButtonStyles,
    props.resetButtonStyles,
    submitButtonColor,
    resetButtonColor,
    props.buttonAlignment,
  ]);

  console.group("表单组件 AntdForm");
  console.log("表单组件 props", props);
  console.log(" formItemLayoutMemo", formItemLayoutMemo);
  console.groupEnd();
  return (
    <AntdProformContainer
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      borderRadius={borderRadius as unknown as string}
      borderWidth={borderWidth as unknown as string}
      boxShadow={boxShadow}
      className={`antd-pro-form-container-styled antd-pro-form-jsonform ${className}`}
      fixedFooter={fixedFooter}
      labelAlign={labelAlign}
      maxHeight={maxHeight}
      scrollContents={scrollContents}
    >
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: colorPrimary || theme.defaultSeed.colorPrimary,
          },
          components: {
            Form: {
              // labelColor: labelTextColor,
              // labelFontSize: parseInt(labelTextSize || "0"),
            },
            Button: {
              colorPrimary: colorPrimary || theme.defaultSeed.colorPrimary,
            },
          },
        }}
      >
        <ProForm
          className={
            labelAlign?.toLowerCase() === "right" ? "ant-form-label-right" : ""
          }
          disabled={disabled}
          formRef={formRef || undefined}
          initialValues={initialValues}
          isKeyPressSubmit={isKeyPressSubmit}
          labelAlign={labelAlign}
          labelWrap={labelWrap}
          layout={formLayout}
          name={widgetName}
          onFinish={handleFinsh}
          onFinishFailed={handleFinishFailed}
          size={size}
          style={{ maxWidth: "100%" }}
          submitter={submitterMemo}
          title={title}
          {...formItemLayoutMemo}
        >
          <div className="antd-pro-form-content">
            {title && (
              <div
                className="antd-pro-form-title"
                style={{ color: titleColor || "unset" }}
              >
                {title}
              </div>
            )}

            {children}
          </div>
        </ProForm>
      </ConfigProvider>
    </AntdProformContainer>
  );
});

export default AntdProForm;
