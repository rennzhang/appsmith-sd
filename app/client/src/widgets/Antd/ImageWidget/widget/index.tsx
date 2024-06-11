import type { WidgetType } from "constants/WidgetConstants";
import { RenderModes } from "constants/WidgetConstants";
import { useEffect } from "react";
import type { WidgetProps, WidgetState } from "widgets/BaseWidget";
import BaseWidget from "widgets/BaseWidget";
import ImageComponent from "../component";

import { EventType } from "constants/AppsmithActionConstants/ActionConstants";
import { ValidationTypes } from "constants/WidgetValidation";
import type { SetterConfig, Stylesheet } from "entities/AppTheming";
import type { DerivedPropertiesMap } from "utils/WidgetFactory";
import { DefaultAutocompleteDefinitions } from "widgets/WidgetUtils";
import type { AutocompletionDefinitions } from "widgets/constants";
import { HeightControlPaneConfig } from "utils/WidgetFeatures";

class ImageWidget extends BaseWidget<ImageWidgetProps, WidgetState> {
  constructor(props: ImageWidgetProps) {
    super(props);
    this.onImageClick = this.onImageClick.bind(this);
  }

  static getAutocompleteDefinitions(): AutocompletionDefinitions {
    return {
      "!doc":
        "Image widget is used to display images in your app. Images must be either a URL or a valid base64.",
      "!url": "https://docs.appsmith.com/widget-reference/image",
      image: "string",
      isVisible: DefaultAutocompleteDefinitions.isVisible,
    };
  }

  static getSetterConfig(): SetterConfig {
    return {
      __setters: {
        setVisibility: {
          path: "isVisible",
          type: "boolean",
        },
        setImage: {
          path: "image",
          type: "string",
        },
      },
    };
  }

  static getPropertyPaneContentConfig() {
    return [
      {
        sectionName: "数据",
        children: [
          {
            helpText: "图片组件的展示模式",
            propertyName: "showMode",
            label: "展示模式",
            controlType: "ICON_TABS",
            fullWidth: false,
            options: [
              {
                label: "单图",
                value: "single",
              },
              {
                label: "相册",
                value: "album",
              },
              {
                label: "多图平铺",
                value: "tile",
              },
            ],
            defaultValue: "single",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            helpText: "图片地址或者 Base64 数据的集合",
            propertyName: "imageList",
            label: "图片列表",
            controlType: "INPUT_TEXT",
            placeholderText: "输入图片 URL / Base64",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.ARRAY },
            hidden: (props: ImageWidgetProps) => props.showMode == "single",
            dependencies: ["showMode"],
          },
          {
            helpText: "图片地址或者 Base64 数据",
            propertyName: "image",
            label: "图片",
            controlType: "INPUT_TEXT",
            placeholderText: "输入图片 URL / Base64",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.IMAGE_URL },
          },
          {
            helpText: "图片加载失败时显示的默认图片",
            propertyName: "defaultImage",
            label: "默认图片",
            controlType: "INPUT_TEXT",
            placeholderText: "输入图片 URL / Base64",
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.IMAGE_URL },
          },
        ],
      },
      {
        sectionName: "属性",
        children: [
          {
            helpText: "设置图片填充父容器的方式",
            propertyName: "objectFit",
            label: "图片填充方式",
            controlType: "DROP_DOWN",
            defaultValue: "contain",
            options: [
              {
                label: "包含",
                value: "contain",
              },
              {
                label: "封面",
                value: "cover",
              },
              {
                label: "填充",
                value: "fill",
              },
              {
                label: "原始大小",
                value: "none",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
              params: {
                allowedValues: ["contain", "cover", "fill", "none"],
              },
            },
          },

          {
            helpText:
              "当前填充模式可能会裁剪图片，可通过该属性调整图片水平位置",
            propertyName: "horizontalPosition",
            label: "图片水平位置",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "左对齐",
                value: "left",
              },
              {
                label: "居中",
                value: "center",
              },
              {
                label: "右对齐",
                value: "right",
              },
              {
                label: "百分比",
                value: "percentage",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
            hidden: (props: ImageWidgetProps) =>
              ["contain", "fill"].includes(props.objectFit),
            dependencies: ["objectFit"],
          },
          // 图片水平位置百分比
          {
            helpText:
              "当前填充模式可能会裁剪图片，可通过该属性调整图片水平位置",
            propertyName: "horizontalPositionPercentage",
            label: "水平位置百分比",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: 50,
            validation: {
              type: ValidationTypes.NUMBER,
            },
            hidden: (props: ImageWidgetProps) =>
              props.horizontalPosition !== "percentage" ||
              ["contain", "fill"].includes(props.objectFit),
            dependencies: ["objectFit", "horizontalPosition"],
          },
          {
            helpText:
              "当前填充模式可能会裁剪图片，可通过该属性调整图片垂直位置",
            propertyName: "verticalPosition",
            label: "图片垂直位置",
            controlType: "DROP_DOWN",
            options: [
              {
                label: "顶部",
                value: "top",
              },
              {
                label: "居中",
                value: "center",
              },
              {
                label: "底部",
                value: "bottom",
              },
              {
                label: "百分比",
                value: "percentage",
              },
            ],
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.TEXT,
            },
            hidden: (props: ImageWidgetProps) =>
              ["contain", "fill"].includes(props.objectFit),
            dependencies: ["objectFit"],
          },
          // 图片垂直位置百分比
          {
            helpText:
              "当前填充模式可能会裁剪图片，可通过该属性调整图片垂直位置",
            propertyName: "verticalPositionPercentage",
            label: "垂直位置百分比",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            defaultValue: 50,
            validation: {
              type: ValidationTypes.NUMBER,
            },
            hidden: (props: ImageWidgetProps) =>
              props.verticalPosition != "percentage" ||
              ["contain", "fill"].includes(props.objectFit),
            dependencies: ["objectFit", "verticalPosition"],
          },

          {
            helpText: "控制组件的显示/隐藏",
            propertyName: "isVisible",
            label: "是否显示",
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
          // {
          //   ...HeightControlPaneConfig,
          //   hidden: () => true,
          // },
        ],
      },
      {
        sectionName: "预览配置",
        children: [
          {
            helpText: "是否开启预览功能",
            propertyName: "enablePreview",
            label: "支持预览",
            controlType: "SWITCH",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
            defaultValue: true,
          },
          {
            helpText: "是否允许预览时旋转图片",
            propertyName: "enableRotation",
            label: "允许旋转",
            controlType: "SWITCH",
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "是否允许下载图片",
            propertyName: "enableDownload",
            label: "允许下载",
            controlType: "SWITCH",
            isJSConvertible: false,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.BOOLEAN },
          },
          {
            helpText: "控制打开预览后的缩放倍数",
            propertyName: "scaleStep",
            label: "预览缩放倍数",
            controlType: "INPUT_TEXT",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: {
              type: ValidationTypes.NUMBER,
            },
          },
        ],
      },
      {
        sectionName: "事件",
        children: [
          {
            helpText: "当用户点击图片时触发",
            propertyName: "onClick",
            label: "onClick",
            controlType: "ACTION_SELECTOR",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: true,
          },
        ],
      },
    ];
  }

  static getPropertyPaneStyleConfig() {
    return [
      {
        sectionName: "轮廓样式",
        children: [
          {
            propertyName: "borderRadius",
            label: "边框圆角",
            helpText: "边框圆角样式",
            controlType: "BORDER_RADIUS_OPTIONS",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
          {
            propertyName: "boxShadow",
            label: "阴影",
            helpText: "组件轮廓投影",
            controlType: "BOX_SHADOW_OPTIONS",
            isJSConvertible: true,
            isBindProperty: true,
            isTriggerProperty: false,
            validation: { type: ValidationTypes.TEXT },
          },
        ],
      },
    ];
  }

  static getDerivedPropertiesMap(): DerivedPropertiesMap {
    return {};
  }

  static getDefaultPropertiesMap(): Record<string, string> {
    return {};
  }
  // TODO Find a way to enforce this, (dont let it be set)
  static getMetaPropertiesMap(): Record<string, any> {
    return {};
  }

  static getStylesheetConfig(): Stylesheet {
    return {
      borderRadius: "{{appsmith.theme.borderRadius.appBorderRadius}}",
      boxShadow: "none",
    };
  }

  getPageView() {
    const { componentHeight, componentWidth } = this.getComponentDimensions();
    console.log("图片组件 props", this.props);

    const { objectFit, scaleStep } = this.props;
    return (
      <ImageComponent
        borderRadius={this.props.borderRadius}
        boxShadow={this.props.boxShadow}
        defaultImageUrl={this.props.defaultImage}
        disableDrag={(disable: boolean) => {
          this.disableDrag(disable);
        }}
        enableDownload={this.props.enableDownload}
        enablePreview={this.props.enablePreview}
        enableRotation={this.props.enableRotation}
        height={componentHeight}
        horizontalPosition={this.props.horizontalPosition}
        horizontalPositionPercentage={this.props.horizontalPositionPercentage}
        imageList={this.props.imageList}
        imageUrl={this.props.image}
        isLoading={this.props.isLoading}
        objectFit={objectFit}
        onClick={this.props.onClick ? this.onImageClick : undefined}
        scaleStep={scaleStep}
        showHoverPointer={this.props.renderMode === RenderModes.PAGE}
        showMode={this.props.showMode}
        verticalPosition={this.props.verticalPosition}
        verticalPositionPercentage={this.props.verticalPositionPercentage}
        widgetId={this.props.widgetId}
        width={componentWidth}
      />
    );
  }

  onImageClick() {
    if (this.props.onClick) {
      super.executeAction({
        triggerPropertyName: "onClick",
        dynamicString: this.props.onClick,
        event: {
          type: EventType.ON_CLICK,
        },
      });
    }
  }

  static getWidgetType(): WidgetType {
    return "ANTD_IMAGE_WIDGET";
  }
}

export type ImageShape = "RECTANGLE" | "CIRCLE" | "ROUNDED";

export interface ImageWidgetProps extends WidgetProps {
  image: string;
  imageShape: ImageShape;
  defaultImage: string;
  scaleStep: number;
  imageRotation?: number;
  enableDownload?: boolean;
  enableRotation?: boolean;
  objectFit: string;
  onClick?: string;
  borderRadius: string;
  boxShadow?: string;
}

export default ImageWidget;
