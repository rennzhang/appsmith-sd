import { useEffect } from "react";
import type { InjectedFormProps } from "redux-form";
import {
  AUTH_LOGIN_URL,
  SETUP,
  FORGOT_PASSWORD_URL,
  SIGN_UP_URL,
  APPLICATIONS_URL,
} from "constants/routes";
import Helmet from "react-helmet";
import type { RouteComponentProps } from "react-router-dom";
import { Redirect, useHistory, withRouter } from "react-router-dom";
import {
  SIGNUP_PAGE_TITLE,
  SIGNUP_PAGE_EMAIL_INPUT_PLACEHOLDER,
  SIGNUP_PAGE_PASSWORD_INPUT_PLACEHOLDER,
  SIGNUP_PAGE_LOGIN_LINK_TEXT,
  SIGNUP_PAGE_SUBMIT_BUTTON_TEXT,
  SIGNUP_PAGE_SUCCESS_LOGIN_BUTTON_TEXT,
  ALREADY_HAVE_AN_ACCOUNT,
  createMessage,
  SIGNUP_PAGE_SUBTITLE,
  LOGIN_PAGE_FORGOT_PASSWORD_TEXT,
  LOGIN_PAGE_SIGN_UP_LINK_TEXT,
  NEW_TO_APPSMITH,
} from "@appsmith/constants/messages";
import { Link } from "design-system";

import type { SignupFormValues } from "pages/UserAuth/helpers";
import AnalyticsUtil from "utils/AnalyticsUtil";

import { useSelector } from "react-redux";

import Container from "pages/UserAuth/Container";
import {
  getIsFormLoginEnabled,
  getIsFormSignupEnable,
} from "@appsmith/selectors/tenantSelectors";
import { useHtmlPageTitle } from "@appsmith/utils";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import {
  LoginForm,
  ProConfigProvider,
  ProFormText,
} from "@ant-design/pro-components";
import { theme } from "antd";
import { LOGIN_SUBMIT_PATH } from "@appsmith/constants/ApiConstants";

import { message } from "antd";
import { getIsSafeRedirectURL } from "utils/helpers";
import { getCurrentUser } from "selectors/usersSelectors";
import { isEmptyString } from "utils/formhelpers";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

type SignUpFormProps = InjectedFormProps<
  SignupFormValues,
  { emailValue: string }
> &
  RouteComponentProps<{ email: string }> & { emailValue: string };

export function SignUp(props: SignUpFormProps) {
  const history = useHistory();
  const isFormLoginEnabled = useSelector(getIsFormLoginEnabled);
  const isFormSignupEnabled = useSelector(getIsFormSignupEnable);
  const currentUser = useSelector(getCurrentUser);
  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    if (!isFormLoginEnabled) {
      const search = new URL(window.location.href)?.searchParams?.toString();
      history.replace({
        pathname: AUTH_LOGIN_URL,
        search,
      });
    }

    AnalyticsUtil.logEvent("SIGNUP_REACHED", {
      referrer: document.referrer,
    });
  }, []);
  const htmlPageTitle = useHtmlPageTitle();

  const { token } = theme.useToken();

  /** @description  */
  const onSubmit = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    return new Promise(async (resolve, reject) => {
      const data = {
        service: "App.User.UserLogin",
        username: email,
        password: password,
      };

      await fetch("/nodeApi/middleware/phalapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log(" response", res);
          if (res.ret == 200 && res.data.access_token) {
            localStorage.setItem("phalapi_token", res.data.access_token);
            message.success("登录成功！");
            history.push(APPLICATIONS_URL);
            resolve(true);
          } else {
            message.error(res.msg);
            reject();
          }
        })
        .catch((error) => {
          console.log(" error", error);

          message.error(error);
          reject();
        });
      reject();
    });
  };

  if (currentUser?.emptyInstance) {
    return <Redirect to={SETUP} />;
  }

  let loginURL = "/api/v1/" + LOGIN_SUBMIT_PATH;
  let signupURL = SIGN_UP_URL;
  let forgotPasswordURL = `${FORGOT_PASSWORD_URL}`;
  if (props.emailValue && !isEmptyString(props.emailValue)) {
    forgotPasswordURL += `?email=${props.emailValue}`;
  }
  const redirectUrl = queryParams.get("redirectUrl");
  if (redirectUrl != null && getIsSafeRedirectURL(redirectUrl)) {
    const encodedRedirectUrl = encodeURIComponent(redirectUrl);
    loginURL += `?redirectUrl=${encodedRedirectUrl}`;
    signupURL += `?redirectUrl=${encodedRedirectUrl}`;
  }
  return (
    <Container
      footer={null}
      subtitle={createMessage(SIGNUP_PAGE_SUBTITLE)}
      title={createMessage(SIGNUP_PAGE_TITLE)}
    >
      <Helmet>
        <title>{htmlPageTitle}</title>
      </Helmet>

      {isFormLoginEnabled && (
        <ProConfigProvider>
          <LoginForm
            containerStyle={{
              paddingBlock: "10px",
              paddingInline: "10px",
            }}
            onFinish={onSubmit}
            submitter={{
              searchConfig: {
                submitText: createMessage(
                  SIGNUP_PAGE_SUCCESS_LOGIN_BUTTON_TEXT,
                ),
              },
            }}
          >
            {
              <>
                <ProFormText
                  fieldProps={{
                    size: "large",
                    prefix: <MailOutlined className={"prefixIcon"} />,
                  }}
                  name="email"
                  placeholder={createMessage(
                    SIGNUP_PAGE_EMAIL_INPUT_PLACEHOLDER,
                  )}
                  rules={[
                    {
                      type: "email",
                      required: true,
                    },
                  ]}
                />
                <ProFormText.Password
                  fieldProps={{
                    size: "large",
                    prefix: <LockOutlined className={"prefixIcon"} />,
                    strengthText:
                      "密码应包含数字、字母和特殊字符，长度至少为8个字符。",
                    statusRender: (value: string) => {
                      const getStatus = () => {
                        if (value && value.length > 12) {
                          return "ok";
                        }
                        if (value && value.length > 6) {
                          return "pass";
                        }
                        return "poor";
                      };
                      const status = getStatus();
                      if (status === "pass") {
                        return (
                          <div style={{ color: token.colorWarning }}>
                            强度：中
                          </div>
                        );
                      }
                      if (status === "ok") {
                        return (
                          <div style={{ color: token.colorSuccess }}>
                            强度：强
                          </div>
                        );
                      }
                      return (
                        <div style={{ color: token.colorError }}>强度：弱</div>
                      );
                    },
                  }}
                  name="password"
                  placeholder={createMessage(
                    SIGNUP_PAGE_PASSWORD_INPUT_PLACEHOLDER,
                  )}
                  rules={[
                    {
                      required: true,
                      message: "请输入密码！",
                    },
                  ]}
                />
              </>
            }
          </LoginForm>
        </ProConfigProvider>
      )}
      {/* 底部提示 */}
      <div className="flex-space-between">
        {isFormSignupEnabled ? (
          <div className="flex myfont">
            {createMessage(NEW_TO_APPSMITH)}
            <Link
              className="a_link t--sign-up t--signup-link pl-[var(--ads-v2\-spaces-3)] fs-16"
              kind="primary"
              target="_self"
              to={signupURL}
            >
              {createMessage(LOGIN_PAGE_SIGN_UP_LINK_TEXT)}
            </Link>
          </div>
        ) : (
          <div />
        )}
        <div>
          <Link
            className="justify-center fs-16 a_link"
            target="_self"
            to={forgotPasswordURL}
          >
            {createMessage(LOGIN_PAGE_FORGOT_PASSWORD_TEXT)}
          </Link>
        </div>
      </div>
    </Container>
  );
}

// const selector = formValueSelector(SIGNUP_FORM_NAME);
// export default connect((state: AppState, props: SignUpFormProps) => {
//   const queryParams = new URLSearchParams(props.location.search);
//   return {
//     initialValues: {
//       email: queryParams.get("email"),
//     },
//     emailValue: selector(state, SIGNUP_FORM_EMAIL_FIELD_NAME),
//   };
// }, null)(
//   reduxForm<SignupFormValues, { emailValue: string }>({
//     validate,
//     form: SIGNUP_FORM_NAME,
//     touchOnBlur: true,
//   })(withRouter(SignUp)),
// );

export default withRouter(SignUp);
