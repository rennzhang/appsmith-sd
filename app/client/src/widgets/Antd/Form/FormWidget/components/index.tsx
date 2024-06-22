// import { AutoComplete } from "antd";
// import React from "react";
import type { ProFormInstance, ProFormProps } from "@ant-design/pro-components";
import { ProForm } from "@ant-design/pro-components";
import { AntdProformContainer } from "widgets/Antd/Style";
// export default InputComponent;
import { ConfigProvider } from "antd";
import type { WidgetStyleContainerProps } from "components/designSystems/appsmith/WidgetStyleContainer";
import type { MouseEventHandler, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AppPositioningTypes } from "reducers/entityReducers/pageListReducer";
import type { WidgetProps } from "widgets/BaseWidget";
import type { ContainerWidgetProps } from "widgets/ContainerWidget/widget";
import { INSTANCE_INVALID_VALUE } from "../../CONST/DEFAULT_CONFIG";
import { isNumber } from "lodash";

export interface ProformContainerComponentProps
  extends WidgetStyleContainerProps {
  validateFieldsParams?: any;
  getFormData: (formWidget: ContainerWidgetProps<WidgetProps>) => any;
  getChildContainer: () => ContainerWidgetProps<WidgetProps>;
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
  setFormRef?: (formRef: ProFormInstance<any>) => void;
  updateWidgetProps: (path: string, value: any) => void;
  validateFieldsParamsChange?: number;
}

type InputDataType = string | undefined;
const AntdProForm = (props: ProformContainerComponentProps) => {
  const {
    borderRadius,
    boxShadow,
    children,
    disabled,
    formLayout,
    getChildContainer,
    getFormData,
    initialValues,
    isKeyPressSubmit,
    labelAlign,
    labelCol,
    labelFlex,
    labelWidth,
    labelWrap,
    size,
    updateWidgetProps,
    validateFieldsParams: __vfp,

    widgetName,
    wrapperCol,
  } = props;

  const [value, setValue] = useState<InputDataType>();
  const [options, setOptions] = useState<{ value: string }[]>([]);

  const formRef = useRef<ProFormInstance<any>>();

  const handleValidateFields = async (params?: any) => {
    const _params = typeof params?.[1] == "string" ? [params] : params;
    const values = await formRef.current
      ?.validateFields(...(_params || []))
      .finally(() => {
        console.log(
          "表单组件 validateFields finally",
          formRef.current?.getFieldsError(),
        );
        const fieldsError = formRef.current?.getFieldsError();

        updateWidgetProps("fieldsError", fieldsError);
      });
    console.log("表单组件 handleValidateFields values", values);
    return values;
  };
  // 当validateFieldsParams有值时，调用validateFields方法
  useEffect(() => {
    console.log("表单组件 validateFieldsParams", __vfp);
    if (!__vfp || isNumber(__vfp)) return;
    const _data = __vfp?.includes?.("UNDEFINED") ? undefined : __vfp;

    handleValidateFields(_data);
  }, [props.validateFieldsParamsChange]);

  // setFormRef
  // useEffect(() => {
  //   formRef.current && updateWidgetProps?.("formRef",formRef);
  // }, [formRef, updateWidgetProps]);

  const formItemLayoutMemo = useMemo(() => {
    if (formLayout == "vertical") {
      return { labelCol: { span: 24 }, wrapperCol: { span: 24 } };
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
    console.log("getFormData", getFormData(getChildContainer?.()));

    console.log(" formRef.current", formRef.current);
    console.log(
      " formRef.current getFieldsError",
      formRef.current?.getFieldsError(),
    );
    const val1 = await handleValidateFields();
    console.log("validateFields:", val1);
    const val2 = await formRef.current?.validateFieldsReturnFormatValue?.();
    console.log("validateFieldsReturnFormatValue:", val2);
    console.groupEnd();
  };
  const handleFinishFailed = async (values: any) => {
    console.group("表单组件 handleFinishFailed");
    console.log("handleFinishFailed values", values);
    console.log("getFormData", getFormData(getChildContainer?.()));

    console.log(" formRef.current", formRef.current);
    console.log(
      " formRef.current getFieldsError",
      formRef.current?.getFieldsError(),
    );
    const val1 = await handleValidateFields();
    console.log("validateFields:", val1);
    const val2 = await formRef.current?.validateFieldsReturnFormatValue?.();
    console.log("validateFieldsReturnFormatValue:", val2);
    console.groupEnd();
  };

  const handleSubmit = async (values: any) => {
    console.group("表单组件 handleSubmit");
    console.log("handleSubmit values", values);
    console.log("getFormData", getFormData(getChildContainer?.()));
    console.log(" formRef.current", formRef.current);
    console.log(
      " formRef.current getFieldsError",
      formRef.current?.getFieldsError(),
    );
    const val1 = await formRef.current?.validateFields();
    console.log("validateFields:", val1);
    const val2 = await formRef.current?.validateFieldsReturnFormatValue?.();
    console.log("validateFieldsReturnFormatValue:", val2);
    console.groupEnd();
  };

  console.group("表单组件 AntdForm");
  console.log("表单组件 props", props);
  console.log(" formItemLayoutMemo", formItemLayoutMemo);
  console.groupEnd();
  return (
    <AntdProformContainer
      className={"antd-pro-form-container-styled"}
      labelAlign={labelAlign}
    >
      <ConfigProvider
        theme={{
          components: {
            Form: {
              // labelColor: labelTextColor,
              // labelFontSize: parseInt(labelTextSize || "0"),
            },
          },
        }}
      >
        <ProForm
          className={
            labelAlign?.toLowerCase() === "right" ? "ant-form-label-right" : ""
          }
          disabled={disabled}
          formRef={formRef}
          initialValues={initialValues}
          isKeyPressSubmit={isKeyPressSubmit}
          labelWrap={labelWrap}
          layout={formLayout}
          name={widgetName}
          onFinish={handleFinsh}
          onFinishFailed={handleFinishFailed}
          size={size}
          style={{ maxWidth: "100%" }}
          submitter={{
            onSubmit: handleSubmit,
          }}
          {...formItemLayoutMemo}
        >
          {children}
        </ProForm>
      </ConfigProvider>
    </AntdProformContainer>
  );
};

export default AntdProForm;
