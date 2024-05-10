import { theme } from "antd";
import type { MenuProps } from "antd";
import { Tag, Dropdown, Button } from "antd";
import { throttle } from "lodash";
import { useState, useEffect, useRef } from "react";
import React from "react";

import {
  DownOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  CloseSquareOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
export type MyRoute = {
  path: string;
  name: string;
  title: string;
  pageId: string;
  isPage: boolean;
  isInitRoute?: boolean;
  active?: boolean;
};

type PageTitleProps = {
  currentRoute: MyRoute;
  routes: MyRoute[];
  goToPath: (path: string) => void;
};
const { useToken } = theme;

const PageNavList = (props: PageTitleProps) => {
  const { token } = useToken();
  const [activeNav, setActiveNav] = useState<MyRoute>(props.currentRoute);
  const [arrowBtnVisible, setArrowBtnVisible] = useState<boolean>(false);
  // nav tag list功能
  const [navTagList, setNavTagList] = useState<MyRoute[]>([props.currentRoute]);

  const [navListContainer, setNavListContainer] = useState<Element | null>(
    null,
  );
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <span>
          <ArrowLeftOutlined className="mr-1" />
          关闭左侧
        </span>
      ),
      onClick: () => {
        const curIdx = navTagList.findIndex((v) => v.path == activeNav.path);
        const newTagList: MyRoute[] = [];
        navTagList.map(
          (v, i) => (i >= curIdx || v.isInitRoute) && newTagList.push(v),
        );
        setNavTagList(newTagList);
      },
    },
    {
      key: "2",
      label: (
        <span>
          <ArrowRightOutlined className="mr-1" />
          关闭右侧
        </span>
      ),
      onClick: () => {
        const curIdx = navTagList.findIndex((v) => v.path == activeNav.path);
        const newTagList: MyRoute[] = [];
        navTagList.map(
          (v, i) => (i <= curIdx || v.isInitRoute) && newTagList.push(v),
        );
        setNavTagList(newTagList);
      },
    },
    {
      key: "3",
      label: (
        <span>
          <CloseOutlined className="mr-1" />
          关闭其他
        </span>
      ),
      onClick: () => {
        const { currentRoute } = props;
        const curIdx = navTagList.findIndex((v) => v.path == currentRoute.path);
        const newTagList: MyRoute[] = [];
        navTagList.map(
          (v, i) => (i == curIdx || v.isInitRoute) && newTagList.push(v),
        );
        setNavTagList(newTagList);
      },
    },
    {
      key: "4",
      label: (
        <span>
          <CloseSquareOutlined className="mr-1" />
          关闭全部
        </span>
      ),
      onClick: () => {
        const { currentRoute } = props;
        setNavTagList([
          navTagList.find((v, i) => v.isInitRoute) || currentRoute,
        ]);
        props.goToPath(navTagList[0].path);
      },
    },
  ];

  const scrollList = (
    direction: "right" | "left" | "custom",
    scrollTo?: number,
  ) => {
    const navListDiv =
      navListContainer || document.querySelector(".nav-tag-list");
    const scrollMap = {
      right: 2000,
      left: -2000,
      custom: scrollTo,
    };

    navListDiv?.scrollBy({
      left: scrollMap[direction],
      behavior: "smooth",
    });
  };
  const handleScroll = throttle((event) => {
    const navListDiv =
      navListContainer || document.querySelector(".nav-tag-list");
    const isLeftEdge = navListDiv?.scrollLeft === 0;
    const isRightEdge =
      (navListDiv?.scrollWidth || 0) -
        ((navListDiv?.scrollLeft || 0) + (navListDiv?.clientWidth || 0)) <
      10;

    document.body.style.overscrollBehaviorX = "none";
    // 阻止默认的点击行为
    event.preventDefault();
    const delta = event.deltaX || event.deltaY;
    if (delta > 0 && isLeftEdge) {
      scrollList("right");
    } else if (delta < 0 && isRightEdge) {
      scrollList("left");
    }
  }, 200); // 设置节流时间间隔为100ms
  useEffect(() => {
    const _navListContainer = document.querySelector(".nav-tag-list");
    setNavListContainer(_navListContainer);

    _navListContainer?.addEventListener("wheel", handleScroll);
    _navListContainer?.addEventListener("touchstart", handleScroll);
    _navListContainer?.addEventListener("touchmove", handleScroll);

    _navListContainer?.addEventListener("mouseleave", () => {
      document.body.style.overscrollBehaviorX = "unset";
    });
    return () => {
      _navListContainer?.removeEventListener("wheel", handleScroll);
      _navListContainer?.removeEventListener("touchstart", handleScroll);
      _navListContainer?.removeEventListener("touchmove", handleScroll);
    };
  }, []);

  useEffect(() => {
    const currentRoute = props.currentRoute;
    setActiveNav(currentRoute);

    if (currentRoute) {
      let currentIdx = -1;
      const isExist = navTagList.find((nav, i) => {
        return (currentIdx = i), nav.path === currentRoute.path;
      });
      if (!isExist) {
        currentRoute.active = true;
        setNavTagList([...navTagList, currentRoute]);
        if (
          (navListContainer?.scrollWidth || 0) >
          (navListContainer?.clientWidth || 0)
        ) {
          setArrowBtnVisible(true);
          setTimeout(() => {
            scrollList("right");
          });
        }
      } else {
        // const curTagEle = navListContainer?.childNodes[
        //   currentIdx
        // ] as HTMLElement;
        // if (!curTagEle) return;
        // const scrollTo =
        //   curTagEle.offsetLeft -
        //   (navListContainer?.scrollLeft + (navListContainer as any).offsetLeft);
        // scrollList("custom", scrollTo);
      }
    }
  }, [props.currentRoute]);

  return (
    <div className="nav-tag-container pt-1 flex justify-between pl-2">
      {arrowBtnVisible && (
        <div
          className="inline-flex px-2  justify-center items-center cursor-pointer"
          onClick={() => scrollList("left")}
        >
          <LeftOutlined />
        </div>
      )}
      <div className="nav-tag-list w-full overflow-hidden whitespace-nowrap">
        {navTagList.map((item, idx) => {
          return (
            <Tag
              bordered={false}
              className="py-1 px-3 font-normal"
              closable={item.isInitRoute ? false : true}
              key={item.path}
              onClick={() => {
                setActiveNav(item);
                props.goToPath(item.path);
              }}
              onClose={() => {
                if (item.path == activeNav.path) {
                  const preTag = navTagList[idx == 0 ? 0 : idx - 1];
                  setActiveNav(preTag);
                  props.goToPath(preTag.path);
                }
                setNavTagList(
                  navTagList.filter((nav) => nav.path !== item.path),
                );
              }}
              style={{
                color:
                  item.path == activeNav.path
                    ? token.colorPrimary
                    : token.colorTextSecondary,
                background: token.colorBgContainer,
                fontSize: token.fontSize,
                cursor: "pointer",
              }}
            >
              {item.title}
            </Tag>
          );
        })}
      </div>
      {arrowBtnVisible && (
        <div
          className="inline-flex px-2  justify-center items-center cursor-pointer"
          onClick={() => scrollList("right")}
        >
          <RightOutlined />
        </div>
      )}
      <div className="nav-list-control">
        <Dropdown menu={{ items }}>
          <Tag
            bordered={false}
            className="py-1 px-2 font-normal"
            key="list-control"
            style={{
              color: token.colorTextSecondary,
              background: token.colorBgContainer,
              fontSize: token.fontSize,
              cursor: "pointer",
            }}
          >
            <DownOutlined />
          </Tag>
        </Dropdown>
      </div>
    </div>
  );
};

export default PageNavList;
