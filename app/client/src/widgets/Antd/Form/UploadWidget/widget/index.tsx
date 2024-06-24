import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import zh_CN from "./zh_CN";
import type { WidgetType } from "constants/WidgetConstants";
import { FILE_SIZE_LIMIT_FOR_BLOBS } from "constants/WidgetConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import { EvaluationSubstitutionType } from "entities/DataTree/dataTreeFactory";
import { klona } from "klona";
import _ from "lodash";
import { isAutoLayout } from "utils/autoLayout/flexWidgetUtils";

import { createBlobUrl } from "utils/AppsmithUtils";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import { importUppy } from "utils/importUppy";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import FilePickerComponent from "../component";
import FileDataTypes from "../constants";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type { AutocompletionDefinitions } from "widgets/constants";
import parseFileData from "./FileParser";
import { FilePickerGlobalStyles } from "./index.styled";
import ButtonStyleConfig from "widgets/Antd/DropdownWidget/widget/propertyConfig/styleConfig";
import { HeightControlPaneConfig } from "utils/WidgetFeatures";
import { Alignment } from "@blueprintjs/core";
import derivedProperties from "./parseDerivedProperties";
import { AntdLabelPosition } from "components/constants";

const ARRAY_CSV_HELPER_TEXT = `注意：非 csv 类型文件数据都是空值，组件中使用大文件可能会让应用变得卡顿`;

class FilePickerWidget extends BaseWidget<
  FilePickerWidgetProps,
  FilePickerWidgetState
> {
  private isWidgetUnmounting: boolean;

  constructor(props: FilePickerWidgetProps) {
    super(props);
    this.isWidgetUnmounting = false;
    this.state = {
      areFilesLoading: false,
      isWaitingForUppyToLoad: false,
      isUppyModalOpen: false,
    };
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "Filepicker widget is used to allow users to upload files from their local machines to any cloud storage via API. Cloudinary and Amazon S3 have simple APIs for cloud storage uploads",
      "!url": "https://docs.appsmith.com/widget-reference/filepicker",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
      files: "[$__file__$]",
      isDisabled: "bool",
      isValid: "bool",
      isDirty: "bool",
      uploadedFileData: "array",
      targetFile: "file",
    };
  }

  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "属性",
        children: [
          // {
          //   propertyName: "uploadedFileData",
          //   label: "已上传文件",
          //   helpText: "已上传的文件数据",
          //   controlType: "INPUT_TEXT",
          //   isJSConvertible: true,
          //   isBindProperty: true,
          //   isTriggerProperty: true,
          // },
          {
            propertyName: "allowedFileTypes",
            helpText: "限制那些类型的文件可以上传",
            label: "支持文件类型",
            controlType: "DROP_DOWN",
            isMultiSelect: true,
            placeholderText: "选择文件类型",
            options: [
              { label: "任意文件类型", value: "*" },
              { label: "图片", value: "image/*" },
              { label: "视频", value: "video/*" },
              { label: "音频", value: "audio/*" },
              { label: "文本", value: "text/*" },
              { label: "Word文档", value: ".doc" },
              { label: "xlsx文档", value: ".xlsx" },
              { label: "PDF", value: ".pdf" },
              { label: "CSV", value: ".csv" },
              { label: "JSON", value: ".json" },
              { label: "XML", value: ".xml" },
              { label: "GIF", value: "image/gif" },
              { label: "JPEG", value: "image/jpeg" },
              { label: "PNG", value: ".png" },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.ARRAY,
              params: {
                unique: true,
                children: {
                  type: ValidationTypes.TEXT,
                },
              },
            },
            evaluationSubstitutionType:
              EvaluationSubstitutionType.SMART_SUBSTITUTE,
          },
          {
            helpText: "设置文件读取数据格式",
            propertyName: "fileDataType",
            label: "数据格式",
            controlType: "DROP_DOWN",
            helperText: (props: FilePickerWidgetProps) => {
              return props.fileDataType === FileDataTypes.Array
                ? ARRAY_CSV_HELPER_TEXT
                : "";
            },
            options: [
              {
                label: FileDataTypes.Base64,
                value: FileDataTypes.Base64,
              },
              {
                label: FileDataTypes.Binary,
                value: FileDataTypes.Binary,
              },
              {
                label: FileDataTypes.Text,
                value: FileDataTypes.Text,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
          },
          // {
          //   propertyName: "dynamicTyping",
          //   label: "解析 CSV 中的数据类型",
          //   helpText: "根据 csv 文件中的数据值自动推断数据类型",
          //   controlType: "SWITCH",
          //   isJSConvertible: false,
          //   isBindProperty: true,
          //   isTriggerProperty: false,
          //   hidden: (props: FilePickerWidgetProps) => {
          //     return props.fileDataType !== FileDataTypes.Array;
          //   },
          //   dependencies: ["fileDataType"],
          //   validation: { type: ValidationTypes.BOOLEAN },
          // },
          {
            propertyName: "maxNumFiles",
            label: "最大上传数量",
            helpText: "设置一次最多上传多少个文件",
            controlType: "INPUT_TEXT",
            placeholderText: "1",
            inputType: "INTEGER",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.NUMBER },
          },
          {
            propertyName: "multiple",
            defaultValue: false,
            label: "允许多选",
            helpText: "允许用户选择多个文件",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "directory",
            defaultValue: false,
            label: "允许文件夹",
            helpText: "允许用户选择文件夹",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDragger",
            defaultValue: false,
            label: "拖拽模式",
            helpText: "允许用户拖拽文件到组件中",
            controlType: "SWITCH",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },

      {
        sectionName: "校验",
        children: [
          {
            propertyName: "isRequired",
            label: "必填",
            helpText: "强制用户填写",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "maxFileSize",
            helpText: "设置每个上传文件大小的上限",
            label: "最大上传大小 (Mb)",
            controlType: "INPUT_TEXT",
            placeholderText: "5",
            inputType: "INTEGER",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                min: 1,
                max: 100,
                default: 5,
                passThroughOnZero: false,
              },
            },
          },
        ],
      },
      {
        sectionName: "展示文本",
        children: [
          {
            helpText: "设置按钮文本内容",
            propertyName: "label",
            label: "按钮内容",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: FilePickerWidgetProps) => props.isDragger,
          },
          // 设置拖拽组件的描述文案
          {
            propertyName: "dragText",
            label: "拖拽描述",
            helpText: "设置拖拽组件的描述文案",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue:
              "支持单次或批量上传，严禁上传涉密数据或其他被禁止的文件",
            hidden: (props: FilePickerWidgetProps) => !props.isDragger,
            validation: { type: ValidationTypes.TEXT },
            dependencies: ["isDragger"],
          },
          {
            helpText: "设置组件标签文本",
            propertyName: "labelText",
            label: "标签文本",
            controlType: "INPUT_TEXT",
            placeholderText: "请输入文本内容",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "设置组件标签位置",
            propertyName: "labelPosition",
            label: "位置",
            controlType: "ICON_TABS",
            fullWidth: false,
            hidden: (props: FilePickerWidgetProps) =>
              !props.labelText && isAutoLayout(),

            options: [
              { label: "自动", value: AntdLabelPosition.Auto },
              { label: "左", value: AntdLabelPosition.Left },
              { label: "上", value: AntdLabelPosition.Top },
            ],
            defaultValue: AntdLabelPosition.Left,
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            dependencies: ["labelText"],
          },
          {
            helpText: "设置组件标签的对齐方式",
            propertyName: "labelAlignment",
            label: "对齐",
            controlType: "LABEL_ALIGNMENT_OPTIONS",
            fullWidth: false,
            options: [
              {
                startIcon: "align-left",
                value: Alignment.LEFT,
              },
              {
                startIcon: "align-right",
                value: Alignment.RIGHT,
              },
            ],
            isBindProperty: false,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: FilePickerWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left &&
              !props.labelText,
            dependencies: ["labelPosition", "labelText"],
          },
          {
            helpText: "设置组件标签占用的列数",
            propertyName: "labelWidth",
            label: "宽度（所占列数）",
            controlType: "NUMERIC_INPUT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            min: 0,
            validation: {
              type: ValidationTypes.NUMBER,
              params: {
                natural: true,
              },
            },
            hidden: (props: FilePickerWidgetProps) =>
              props.labelPosition !== AntdLabelPosition.Left &&
              !props.labelText,
            dependencies: ["labelPosition", "labelText"],
          },
          {
            helpText: "提示信息",
            propertyName: "labelTooltip",
            label: "提示",
            controlType: "INPUT_TEXT",
            placeholderText: "添加提示信息",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
            hidden: (props: FilePickerWidgetProps) => !props.labelText,
            dependencies: ["labelText"],
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            propertyName: "isVisible",
            label: "是否显示",
            helpText: "控制组件的显示/隐藏",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "isDisabled",
            label: "禁用",
            helpText: "让组件不可交互",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            propertyName: "animateLoading",
            label: "加载时显示动画",
            controlType: "SWITCH",
            helpText: "组件依赖的数据加载时显示加载动画",
            defaultValue: true,
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
        ],
      },

      {
        sectionName: "事件",
        children: [
          {
            helpText: "用户选中文件后触发，文件 URL 存储在 AntdUpload.files 中",
            propertyName: "onFilesSelected",
            label: "onFilesSelected",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
      {
        ...HeightControlPaneConfig,
        hidden: () => true,
      },
    ];
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "标签样式",
        children: [
          {
            propertyName: "labelTextColor",
            label: "字体颜色",
            helpText: "设置标签字体颜色",
            controlType: "COLOR_PICKER",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelTextSize",
            label: "字体大小",
            helpText: "设置标签字体大小",
            controlType: "DROP_DOWN",
            defaultValue: "0.875rem",
            hidden: isAutoLayout,
            options: [
              {
                label: "S",
                value: "0.875rem",
                subText: "0.875rem",
              },
              {
                label: "M",
                value: "1rem",
                subText: "1rem",
              },
              {
                label: "L",
                value: "1.25rem",
                subText: "1.25rem",
              },
              {
                label: "XL",
                value: "1.875rem",
                subText: "1.875rem",
              },
              {
                label: "XXL",
                value: "3rem",
                subText: "3rem",
              },
              {
                label: "3XL",
                value: "3.75rem",
                subText: "3.75rem",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "labelStyle",
            label: "强调",
            helpText: "设置标签字体是否加粗或斜体",
            controlType: "BUTTON_GROUP",
            options: [
              {
                icon: "text-bold",
                value: "BOLD",
              },
              {
                icon: "text-italic",
                value: "ITALIC",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
        hidden: (props: FilePickerWidgetProps) => !props.labelText,
      },
      ...ButtonStyleConfig,
    ];
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {};
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {
      isValid: `{{ this.isRequired ? this.files.length > 0 : true }}`,
      files: `{{this.selectedFiles}}`,
      targetFile: `{{this.selectedFiles[0]}}`,
      uploadedFileData: `{{this.uploadedFileData}}`,
    };
  }

  static getMetaPropertiesMap(): Record<string, any> {
    return {
      targetFile: undefined,
      selectedFiles: [],
      uploadedFileData: {},
      isDirty: false,
      files: [],
    };
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      buttonColor: "{{appsmith.theme.colors.primaryColor}}",
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  /**
   * this function is called when user selects the files and it do two things:
   * 1. calls the action if any
   * 2. set isLoading prop to true when calling the action
   */
  onFilesSelected = async (fileList?: any[]) => {
    console.log(
      "上传组件 onFilesSelected fileList",
      fileList,
      this.props.onFilesSelected,
    );

    const selectedFiles = [];
    for (let i = 0, len = (fileList || [])?.length; i < len; i++) {
      const file = fileList?.[i];
      file.data = await parseFileData(
        file.originFileObj,
        this.props.fileDataType,
        file.type || "",
        file.extension,
        this.props.dynamicTyping,
      );
      console.log("上传组件 onFilesSelected data", file);

      selectedFiles.push({
        type: file.type,
        id: file.uid,
        meta: file,
        name: file.name,
        size: file.size,
        dataFormat: this.props.fileDataType,
        ...file,
      });
    }
    console.log("上传组件 onFilesSelected selectedFiles", selectedFiles);

    this.props.updateWidgetMetaProperty("targetFile", selectedFiles[0]);
    this.props.updateWidgetMetaProperty("selectedFiles", selectedFiles ?? []);
    if (this.props.onFilesSelected) {
      this.executeAction({
        triggerPropertyName: "onFilesSelected",
        dynamicString: this.props.onFilesSelected,
        event: {
          type: EventType.ON_FILES_SELECTED,
          callback: this.handleActionComplete,
        },
      });

      this.setState({ areFilesLoading: true });
    }
  };

  handleActionComplete = () => {
    this.setState({ areFilesLoading: false });
  };

  async componentDidUpdate(prevProps: FilePickerWidgetProps) {
    super.componentDidUpdate(prevProps);
  }

  async componentDidMount() {
    super.componentDidMount();
  }

  componentWillUnmount() {
    this.isWidgetUnmounting = true;
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "boolean",
        },
        setDisabled: {
          path: "isDisabled",
          type: "boolean",
        },
        setUploadedFileData: {
          path: "uploadedFileData",
          type: "array",
        },
      },
    };
  }

  getPageView() {
    console.log("上传组件 getPageView props", this.props);

    return (
      <>
        <FilePickerComponent
          allowedFileTypes={this.props.allowedFileTypes}
          borderRadius={this.props.borderRadius}
          boxShadow={this.props.boxShadow}
          buttonColor={this.props.buttonColor}
          buttonSize={this.props.buttonSize}
          buttonVariant={this.props.buttonVariant}
          directory={this.props.directory}
          dragText={this.props.dragText}
          iconAlign={this.props.iconAlign}
          iconColor={this.props.iconColor}
          iconName={this.props.iconName}
          iconSize={this.props.iconSize}
          isDisabled={this.props.isDisabled}
          isDragger={this.props.isDragger}
          isLoading={
            this.props.isLoading ||
            this.state.areFilesLoading ||
            this.state.isWaitingForUppyToLoad
          }
          key={this.props.widgetId}
          label={this.props.label}
          labelAlignment={this.props.labelAlignment}
          labelPosition={this.props.labelPosition}
          labelStyle={this.props.labelStyle}
          labelText={this.props.labelText}
          labelTextColor={this.props.labelTextColor}
          labelTextSize={this.props.labelTextSize}
          labelTooltip={this.props.labelTooltip}
          labelWidth={this.props.labelWidth}
          maxFileSize={this.props.maxFileSize}
          maxNumFiles={this.props.maxNumFiles}
          maxWidth={this.props.maxWidth}
          minHeight={this.props.minHeight}
          minWidth={this.props.minWidth}
          multiple={this.props.multiple}
          onFilesSelected={this.onFilesSelected}
          placement={this.props.placement}
          required={this.props.isRequired}
          shouldFitContent={this.isAutoLayoutMode}
          widgetId={this.props.widgetId}
        />

        {this.state.isUppyModalOpen && (
          <FilePickerGlobalStyles borderRadius={this.props.borderRadius} />
        )}
      </>
    );
  }

  static getWidgetType(): WidgetType {
    return "ANTD_UPLOAD_WIDGET";
  }
}

interface FilePickerWidgetState extends WidgetState {
  areFilesLoading: boolean;
  isWaitingForUppyToLoad: boolean;
  isUppyModalOpen: boolean;
}

interface FilePickerWidgetProps extends WidgetProps {
  label: string;
  maxNumFiles?: number;
  maxFileSize?: number;
  selectedFiles?: any[];
  allowedFileTypes: string[];
  onFilesSelected?: string;
  fileDataType: FileDataTypes;
  isRequired?: boolean;
  backgroundColor: string;
  borderRadius: string;
  boxShadow?: string;
  dynamicTyping?: boolean;
}

export type FilePickerWidgetV2Props = FilePickerWidgetProps;
export type FilePickerWidgetV2State = FilePickerWidgetState;

export default FilePickerWidget;
