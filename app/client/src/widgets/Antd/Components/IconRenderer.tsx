import React from "react";
import type { IconName } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
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
  className,
  color,
  icon,
  size,
  text,
  type = "icon",
}) => {
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
        className={className}
        style={{
          color,
          fontSize: size ? `${size}px` : undefined,
        }}
        twoToneColor={color}
      />
    ) : null;
  }

  return (
    <Icon
      className={className}
      color={color}
      icon={icon as IconName}
      size={size}
    />
  );
};

export default IconRenderer;
