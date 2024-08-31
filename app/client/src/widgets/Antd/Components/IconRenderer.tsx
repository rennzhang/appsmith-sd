import React from "react";
import { Icon, IconName } from "@blueprintjs/core";
import * as AntIcons from "@ant-design/icons";

interface IconRendererProps {
  icon?: string;
  color?: string;
  type?: "icon" | "text" | "none";
  text?: string;
  className?: string;
  size?: number;
}

const ANT_PREFIX = "ant-design:";

const IconRenderer: React.FC<IconRendererProps> = ({
  icon,
  color,
  type = "icon",
  text,
  className,
  size,
}) => {
  console.group("Antd IconRenderer");
  console.log("icon", icon);
  console.log("color", color);
  console.log("type", type);
  console.log("text", text);
  console.log("className", className);
  console.log("size", size);
  console.groupEnd();
  if (type === "none" || (!icon && !text)) return null;

  if (type === "text") {
    return text ? <span style={{ color }}>{text}</span> : null;
  }

  if (!icon || icon === "NONE") return null;

  if (icon.startsWith(ANT_PREFIX)) {
    const iconName = icon.slice(ANT_PREFIX.length);
    const AntIcon = AntIcons[
      iconName as keyof typeof AntIcons
    ] as React.FC<any>;
    return AntIcon ? (
      <AntIcon
        twoToneColor={color}
        style={{
          color,
          fontSize: size ? `${size}px` : undefined,
        }}
        className={className}
      />
    ) : null;
  }

  return (
    <Icon
      icon={icon as IconName}
      color={color}
      className={className}
      size={size}
    />
  );
};

export default IconRenderer;
