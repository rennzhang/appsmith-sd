import {
  CaretDownFilled,
  DoubleRightOutlined,
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  PlusCircleFilled,
  QuestionCircleFilled,
  SearchOutlined,
  CrownFilled,
} from "@ant-design/icons";
import ReactDOM from "react-dom";
import { Icon } from "@blueprintjs/core";
import { builderURL, viewerURL } from "RouteBuilder";

import type { ProSettings } from "@ant-design/pro-components";
import {
  PageContainer,
  ProCard,
  ProConfigProvider,
  ProLayout,
  SettingDrawer,
} from "@ant-design/pro-components";
import css from "@emotion/css";
import {
  Button,
  ConfigProvider,
  Divider,
  Dropdown,
  Input,
  Popover,
  theme,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import defaultProps from "./_defaultProps";
import { useSelector } from "react-redux";
import {
  getCurrentApplication,
  getViewModePageList,
} from "selectors/editorSelectors";
import { useLocation } from "react-router";
import history from "utils/history";
import type { User } from "@sentry/react";
import type {
  ApplicationPayload,
  Page,
} from "@appsmith/constants/ReduxActionConstants";
import { View } from "@tarojs/components";
import { APP_MODE } from "entities/App";
import { size } from "lodash";
import { mapClearTree } from "utils/treeUtils";
import { makeRouteNode } from "../utils";
import { getAppMode } from "selectors/entitiesSelector";

const Item: React.FC<{ children: React.ReactNode }> = (props) => {
  const { token } = theme.useToken();
  return (
    <div
      className={css`
        color: ${token.colorTextSecondary};
        font-size: 14px;
        cursor: pointer;
        line-height: 22px;
        margin-bottom: 8px;
        &:hover {
          color: ${token.colorPrimary};
        }
      `}
      style={{
        width: "33.33%",
      }}
    >
      {props.children}
      <DoubleRightOutlined
        style={{
          marginInlineStart: 4,
        }}
      />
    </div>
  );
};

const List: React.FC<{ title: string; style?: React.CSSProperties }> = (
  props,
) => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        width: "100%",
        ...props.style,
      }}
    >
      <div
        style={{
          fontSize: 16,
          color: token.colorTextHeading,
          lineHeight: "24px",
          fontWeight: 500,
          marginBlockEnd: 16,
        }}
      >
        {props.title}
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {new Array(6).fill(1).map((_, index) => {
          return <Item key={index}>具体的解决方案-{index}</Item>;
        })}
      </div>
    </div>
  );
};

const MenuCard = (viewerLayout: any) => {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
      }}
    >
      <Divider
        style={{
          height: "1.5em",
        }}
        type="vertical"
      />
    </div>
  );
};

// const SearchInput = () => {
//   const { token } = theme.useToken();
//   return (
//     <div
//       aria-hidden
//       key="SearchOutlined"
//       onMouseDown={(e) => {
//         e.stopPropagation();
//         e.preventDefault();
//       }}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         marginInlineEnd: 24,
//       }}
//     >

//       <PlusCircleFilled
//         style={{
//           color: token.colorPrimary,
//           fontSize: 24,
//         }}
//       />
//     </div>
//   );
// };

type SidebarProps = {
  currentApplicationDetails?: ApplicationPayload;
  pages: Page[];
  currentWorkspaceId: string;
  currentUser: User | undefined;
  showUserSettings: boolean;
};

export default (props: SidebarProps) => {
  const { currentApplicationDetails } = props;
  const appMode = useSelector(getAppMode);
  const [query, setQuery] = useState("");
  const [settings, setSetting] = useState<Partial<ProSettings> | undefined>({
    fixSiderbar: true,
    layout: "mix",
    splitMenus: true,
  });
  const location = useLocation();

  const goToPath = (path: string) => {
    history.push(path);
  };
  const [pathname, setPathname] = useState(location.pathname);
  const [num, setNum] = useState(40);
  if (typeof document === "undefined") {
    return <div />;
  }
  const pages = useSelector(getViewModePageList);

  const currentApp = useSelector(getCurrentApplication);
  const viewerLayout = currentApp
    ? JSON.parse(currentApp?.viewerLayout || "{}")
    : {};

  const getPath = (it: any, pagesMap: any, title: string) => {
    if (!it.pageId) return "";
    const pageURL =
      appMode === APP_MODE.PUBLISHED
        ? viewerURL({
            pageId: pagesMap[title].pageId,
          })
        : builderURL({
            pageId: pagesMap[title].pageId,
          });
    return pageURL;
  };

  const handleMenuRootClick = (item: any) => {
    if (!query.includes("splitMenus=true")) return;

    if (item?.routes?.length) {
      handleMenuRootClick(item.routes[0]);
    } else {
      goToPath(item.path);
    }
  };
  const initState = useMemo(() => {
    let menudata: any = [];
    if (viewerLayout && pages.length) {
      try {
        const current = viewerLayout;
        const pagesMap = pages.reduce((a: any, c: any) => {
          a[c.pageName] = { ...c };
          return a;
        }, {});
        const newMenuTree: any = [];

        current.treeData.forEach(
          makeRouteNode(pagesMap, newMenuTree, current.outsiderTree),
        );

        menudata = current?.treeData.map((itdata: any, itIdx: number) => {
          return mapClearTree(
            itdata,
            (item: any) => {
              const path = getPath(item, pagesMap, item.title);
              if (
                current.outsiderTree.find((n: any) => n.pageId === item.pageId)
              ) {
                return false;
              }
              const res = {
                ...item,
                // name: item.title,
                name: (
                  <a
                    key={item.pageId}
                    onClick={() => handleMenuRootClick(menudata[itIdx])}
                  >
                    {item.title}
                  </a>
                ),
                path: path || item.title,
                routes: size(item.children) ? item.children : null,
                icon: (
                  <View
                    className={`van-icon van-icon-${
                      item.icon ? item.icon : "orders-o"
                    } taroify-icon taroify-icon--inherit hydrated`}
                  />
                ),
              };
              delete res.children;
              return res;
            },
            "routes",
          );
        });
        const newPages = Object.values(pagesMap)
          .filter(
            (p: any) =>
              !p.visited &&
              !current.outsiderTree.find((n: any) => n.pageId === p.pageId),
          )
          .map((p: any) => {
            const path = getPath(p, pagesMap, p.pageName);
            return {
              name: p.pageName,
              title: p.pageName,
              pageId: p.pageId,
              isPage: true,
              key: p.pageId,
              path: path || p.pageName,

              routes: null,
            };
          });

        // console.log(newPages, "newPages");
      } catch (e) {
        console.log(e);
      }
    } else {
      const pagesMap = pages.reduce((a: any, c: any) => {
        a[c.pageName] = { ...c };
        return a;
      }, {});
      menudata = pages.map((p) => {
        const path = getPath(p, pagesMap, p.pageName);
        return {
          name: p.pageName,
          title: p.pageName,
          pageId: p.pageId,
          isPage: true,
          key: p.pageId,
          path: path || p.pageName,

          routes: null,
        };
      });
    }
    return {
      menudata,
    };
  }, [viewerLayout, pages, currentApplicationDetails]);

  useEffect(() => {
    defaultProps.route.routes = initState.menudata;
    console.log(" initState.menudata", initState.menudata);
  }, [initState]);

  useEffect(() => {
    setQuery(window.location.search);
  }, [location]);

  // // 将treeData1递归转换成routes结构
  // function processChildren(children: any) {
  //   if (!children?.length) return [];
  //   return children.map((child: any) => {
  //     const res = {
  //       ...child,
  //       path: child.pageId
  //         ? viewerURL({
  //             pageId: child.pageId,
  //           })
  //         : child.title,
  //       name: child.title,
  //       icon: <Icon icon={child.icon} />,
  //       routes: processChildren(child.children || []),
  //     };
  //     delete res.children;
  //     return res;
  //   });
  // }

  // defaultProps.route.routes = processChildren(viewerLayout.treeData);

  return (
    <div
      id="test-pro-layout"
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProConfigProvider hashed={false}>
        <ConfigProvider
          getTargetContainer={() => {
            return document.getElementById("test-pro-layout") || document.body;
          }}
        >
          <ProLayout
            bgLayoutImgList={[
              {
                src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
                left: 85,
                bottom: 100,
                height: "303px",
              },
              {
                src: "https://img.alicdn.com/imgextra/i2/O1CN01O4etvp1DvpFLKfuWq_!!6000000000279-2-tps-609-606.png",
                bottom: -68,
                right: -45,
                height: "303px",
              },
              {
                src: "https://img.alicdn.com/imgextra/i3/O1CN018NxReL1shX85Yz6Cx_!!6000000005798-2-tps-884-496.png",
                bottom: 0,
                left: 0,
                width: "331px",
              },
            ]}
            prefixCls="my-prefix"
            {...defaultProps}
            // actionsRender={(props) => {
            //   if (props.isMobile) return [];
            //   if (typeof window === "undefined") return [];
            //   return [
            //     props.layout !== "side" && document.body.clientWidth > 1400 ? (
            //       <SearchInput />
            //     ) : undefined,
            //     <InfoCircleFilled key="InfoCircleFilled" />,
            //     <QuestionCircleFilled key="QuestionCircleFilled" />,
            //     <GithubFilled key="GithubFilled" />,
            //   ];
            // }}
            avatarProps={{
              src: "https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg",
              size: "small",
              title: props.currentUser?.username,
              render: (props, dom) => {
                return (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "logout",
                          icon: <LogoutOutlined />,
                          label: "退出登录",
                        },
                      ],
                    }}
                  >
                    {dom}
                  </Dropdown>
                );
              },
            }}
            headerTitleRender={(logo, title, _) => {
              const defaultDom = (
                <a>
                  <img
                    alt=""
                    height="32"
                    src={viewerLayout.logoUrl}
                    width="32px"
                  />
                  {viewerLayout.name}
                </a>
              );
              if (typeof window === "undefined") return defaultDom;
              if (document.body.clientWidth < 1400) {
                return defaultDom;
              }
              if (_.isMobile) return defaultDom;
              return (
                <>
                  {defaultDom}
                  <MenuCard viewerLayout={viewerLayout} />
                </>
              );
            }}
            location={{
              pathname,
            }}
            menu={{
              collapsedShowGroupTitle: true,
              defaultOpenAll: true,
            }}
            menuFooterRender={(props) => {
              if (props?.collapsed) return undefined;
              return (
                <div
                  style={{
                    textAlign: "center",
                    paddingBlockStart: 12,
                  }}
                >
                  <div>© 2021 Made with love</div>
                  <div>by Ant Design</div>
                </div>
              );
            }}
            menuItemRender={(item, dom) => (
              <div
                onClick={() => {
                  console.log("menuItemRender click", item || "/welcome");

                  setPathname(item.path || "/welcome");
                  if (item.isPage) goToPath(item.path || "/welcome");
                  console.log(location, pathname);
                }}
              >
                {dom}
              </div>
            )}
            onMenuHeaderClick={(e) => console.log(e)}
            token={{
              header: {
                colorBgMenuItemSelected: "rgba(0,0,0,0.04)",
              },
            }}
            {...settings}
          >
            <PageContainer
              token={{
                paddingInlinePageContainerContent: num,
              }}
            >
              <div id="ant-prolayout-container" />
              {/* {props.ContainerComp ? props.ContainerComp : null} */}
            </PageContainer>

            <SettingDrawer
              disableUrlParams={false}
              enableDarkTheme
              getContainer={(e: any) => {
                if (typeof window === "undefined") return e;
                return document.getElementById("test-pro-layout");
              }}
              onSettingChange={(changeSetting) => {
                setSetting(changeSetting);
              }}
              pathname={pathname}
              settings={settings}
            />
          </ProLayout>
        </ConfigProvider>
      </ProConfigProvider>
    </div>
  );
};
