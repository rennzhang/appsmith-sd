import React from "react";
import styled from "styled-components";
import { DATASOURCE_REST_API_FORM } from "@appsmith/constants/forms";
import type { Datasource } from "entities/Datasource";
import type { InjectedFormProps } from "redux-form";
import { getFormMeta, reduxForm } from "redux-form";
import AnalyticsUtil from "utils/AnalyticsUtil";
import FormControl from "pages/Editor/FormControl";
import { StyledInfo } from "components/formControls/InputTextControl";
import { connect } from "react-redux";
import type { AppState } from "@appsmith/reducers";
import { PluginType } from "entities/Action";
import { Button, Callout } from "design-system";
import {
  createDatasourceFromForm,
  redirectAuthorizationCode,
  toggleSaveActionFlag,
  updateDatasource,
} from "actions/datasourceActions";
import type { ReduxAction } from "@appsmith/constants/ReduxActionConstants";
import {
  datasourceToFormValues,
  formValuesToDatasource,
} from "transformers/RestAPIDatasourceFormTransformer";
import type {
  ApiDatasourceForm,
  AuthorizationCode,
  ClientCredentials,
} from "entities/Datasource/RestAPIForm";
import {
  ApiKeyAuthType,
  AuthType,
  GrantType,
} from "entities/Datasource/RestAPIForm";
import { createMessage, INVALID_URL } from "@appsmith/constants/messages";
import Collapsible from "./Collapsible";
import _ from "lodash";
import FormLabel from "components/editorComponents/FormLabel";
import CopyToClipBoard from "components/designSystems/appsmith/CopyToClipBoard";
import { updateReplayEntity } from "actions/pageActions";
import { ENTITY_TYPE } from "entities/AppsmithConsole";
import { TEMP_DATASOURCE_ID } from "constants/Datasource";
import { hasManageDatasourcePermission } from "@appsmith/utils/permissionHelpers";
import { Form } from "./DBForm";
import {
  getCurrentEnvName,
  getCurrentEnvironment,
} from "@appsmith/utils/Environments";

interface DatasourceRestApiEditorProps {
  initializeReplayEntity: (id: string, data: any) => void;
  updateDatasource: (
    formValues: Datasource,
    currEditingEnvId: string,
    onSuccess?: ReduxAction<unknown>,
  ) => void;
  currentEnvironment: string;
  isSaving: boolean;
  applicationId: string;
  datasourceId: string;
  pageId: string;
  location: {
    search: string;
  };
  datasource: Datasource;
  formData: ApiDatasourceForm;
  formName: string;
  pluginName: string;
  pluginPackageName: string;
  formMeta: any;
  messages?: Array<string>;
  datasourceName: string;
  showFilterComponent: boolean;
  createDatasource: (
    data: Datasource,
    onSuccess?: ReduxAction<unknown>,
  ) => void;
  toggleSaveActionFlag: (flag: boolean) => void;
  triggerSave?: boolean;
  datasourceDeleteTrigger: () => void;
  viewMode: boolean;
}

type Props = DatasourceRestApiEditorProps &
  InjectedFormProps<ApiDatasourceForm, DatasourceRestApiEditorProps>;

const FormInputContainer = styled.div`
  margin-top: 16px;
  .t--save-and-authorize-datasource {
    margin-left: 0;
  }
`;

class DatasourceRestAPIEditor extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }
  componentDidMount() {
    // set replay data
    this.props.initializeReplayEntity(
      this.props.datasource.id,
      this.props.initialValues,
    );
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.props.formData) return;

    // const { authType } = this.props.formData;

    // if (authType === AuthType.OAuth2) {
    //   this.ensureOAuthDefaultsAreCorrect();
    // } else if (authType === AuthType.apiKey) {
    //   this.ensureAPIKeyDefaultsAreCorrect();
    // }

    // if trigger save changed, save datasource
    if (
      prevProps.triggerSave !== this.props.triggerSave &&
      this.props.triggerSave
    ) {
      console.log(" savesavesavesavesave");
      this.save();
    }
  }

  isDirty(prop: any) {
    const { formMeta } = this.props;
    return _.get(formMeta, prop + ".visited", false);
  }

  ensureAPIKeyDefaultsAreCorrect = () => {
    if (!this.props.formData) return;
    const { authentication } = this.props.formData;
    if (!authentication || !_.get(authentication, "addTo")) {
      this.props.change("authentication.addTo", ApiKeyAuthType.Header);
    }
    if (!authentication || !_.get(authentication, "headerPrefix")) {
      this.props.change("authentication.headerPefix", "ApiKeyAuthType.Header");
    }
  };

  ensureOAuthDefaultsAreCorrect = () => {
    if (!this.props.formData) return;
    const { authentication } = this.props.formData;

    if (!authentication || !_.get(authentication, "grantType")) {
      this.props.change(
        "authentication.grantType",
        GrantType.ClientCredentials,
      );
    }

    if (
      !this.isDirty("authentication.headerPrefix") &&
      _.get(authentication, "headerPrefix") === undefined
    ) {
      this.props.change("authentication.headerPrefix", "Bearer");
    }

    if (_.get(authentication, "grantType") === GrantType.AuthorizationCode) {
      if (_.get(authentication, "isAuthorizationHeader") === undefined) {
        this.props.change("authentication.isAuthorizationHeader", true);
      }
    }

    if (_.get(authentication, "grantType") === GrantType.ClientCredentials) {
      if (_.get(authentication, "isAuthorizationHeader") === undefined) {
        this.props.change("authentication.isAuthorizationHeader", false);
      }
    }

    if (_.get(authentication, "grantType") === GrantType.AuthorizationCode) {
      if (
        _.get(authentication, "sendScopeWithRefreshToken") === undefined ||
        _.get(authentication, "sendScopeWithRefreshToken") === ""
      ) {
        this.props.change("authentication.sendScopeWithRefreshToken", false);
      }
    }

    if (_.get(authentication, "grantType") === GrantType.AuthorizationCode) {
      if (
        _.get(authentication, "refreshTokenClientCredentialsLocation") ===
          undefined ||
        _.get(authentication, "refreshTokenClientCredentialsLocation") === ""
      ) {
        this.props.change(
          "authentication.refreshTokenClientCredentialsLocation",
          "BODY",
        );
      }
    }
  };

  validate = (): boolean => {
    const { datasource, datasourceId, formData } = this.props;
    const createMode = datasourceId === TEMP_DATASOURCE_ID;
    const canManageDatasource = hasManageDatasourcePermission(
      datasource?.userPermissions || [],
    );
    if (!formData) return true;
    return !formData.url || (!createMode && !canManageDatasource);
  };

  getSanitizedFormData = () =>
    formValuesToDatasource(this.props.datasource, this.props.formData);

  save = (onSuccess?: ReduxAction<unknown>) => {
    this.props.toggleSaveActionFlag(true);
    const normalizedValues = this.getSanitizedFormData();

    AnalyticsUtil.logEvent("SAVE_DATA_SOURCE_CLICK", {
      pageId: this.props.pageId,
      appId: this.props.applicationId,
      environmentId: getCurrentEnvironment(),
      environmentName: getCurrentEnvName(),
      pluginName: this.props.pluginName || "",
      pluginPackageName: this.props.pluginPackageName || "",
    });

    if (this.props.datasource.id !== TEMP_DATASOURCE_ID) {
      return this.props.updateDatasource(
        normalizedValues,
        this.props.currentEnvironment,
        onSuccess,
      );
    }

    this.props.createDatasource(
      {
        ...normalizedValues,
        name: this.props.datasourceName,
      },
      onSuccess,
    );
  };

  urlValidator = (value: string) => {
    const validationRegex = "^(http|https)://";
    if (value) {
      const regex = new RegExp(validationRegex);

      return regex.test(value)
        ? { isValid: true, message: "" }
        : {
            isValid: false,
            message: createMessage(INVALID_URL),
          };
    }

    return { isValid: true, message: "" };
  };

  render = () => {
    return (
      <Form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        showFilterComponent={this.props.showFilterComponent}
        viewMode={this.props.viewMode}
      >
        {this.renderEditor()}
      </Form>
    );
  };

  renderEditor = () => {
    const { datasource, datasourceId, formData, isSaving, messages, pageId } =
      this.props;
    console.log(" formData", formData);
    const isAuthorized = _.get(
      datasource,
      "datasourceConfiguration.authentication.isAuthorized",
      false,
    );
    if (!formData) return;

    const { authentication } = formData;

    return (
      <>
        {messages &&
          messages.map((msg, i) => (
            <Callout key={i} kind="warning">
              {msg}
            </Callout>
          ))}
        {this.renderGeneralSettings()}
        {formData.authType &&
          formData.authType === AuthType.OAuth2 &&
          _.get(authentication, "grantType") ===
            GrantType.AuthorizationCode && (
            <FormInputContainer>
              <Button
                className="t--save-and-authorize-datasource"
                isDisabled={this.validate()}
                isLoading={isSaving}
                onClick={() =>
                  this.save(
                    redirectAuthorizationCode(
                      pageId,
                      datasourceId,
                      PluginType.API,
                    ),
                  )
                }
              >
                {isAuthorized ? "Save and Re-Authorize" : "Save and Authorize"}
              </Button>
            </FormInputContainer>
          )}
      </>
    );
  };

  renderGeneralSettings = () => {
    const { formData } = this.props;
    return (
      <section
        className="t--section-general"
        data-location-id="section-General"
        data-testid="section-General"
      >
        <FormInputContainer data-location-id={btoa("url")}>
          {this.renderInputTextControlViaFormControl({
            configProperty: "url",
            label: "URL",
            placeholderText: "https://example.com",
            dataType: "TEXT",
            encrypted: false,
            isRequired: true,
            fieldValidator: this.urlValidator,
          })}
        </FormInputContainer>
        <FormInputContainer
          data-location-id={btoa("authentication.appSmithAppKey")}
        >
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.appSmithAppKey",
            label: "AppKey",
            placeholderText: "App Key",
            dataType: "TEXT",
            encrypted: false,
            isRequired: true,
          })}
        </FormInputContainer>
        <FormInputContainer
          data-location-id={btoa("authentication.appSmithAppKey")}
        >
          {this.renderInputTextControlViaFormControl({
            configProperty: "authentication.appSmithAppSecret",

            label: "AppSecret",
            placeholderText: "App Secret",
            dataType: "PASSWORD",
            encrypted: false,
            isRequired: true,
          })}
        </FormInputContainer>
      </section>
    );
  };

  // All components in formControls must be rendered via FormControl.
  // FormControl is the common wrapper for all formcontrol components and contains common elements i.e. label, subtitle, helpertext
  renderInputTextControlViaFormControl({
    configProperty,
    controlType,
    dataType,
    encrypted,
    fieldValidator,
    isRequired,
    isSecretExistsPath,
    label,
    placeholderText,
  }: {
    controlType?: string;
    configProperty: string;
    label: string;
    placeholderText: string;
    dataType: "TEXT" | "PASSWORD" | "NUMBER";
    encrypted: boolean;
    isRequired: boolean;
    fieldValidator?: (value: string) => { isValid: boolean; message: string };
    isSecretExistsPath?: string;
  }) {
    return (
      <div className="mb-2">
        <FormControl
          config={{
            id: "",
            isValid: false,
            isRequired: isRequired,
            controlType: controlType || "INPUT_TEXT",
            dataType: dataType,
            configProperty: configProperty,
            encrypted: encrypted,
            label: label,
            conditionals: {},
            placeholderText: placeholderText,
            formName: this.props.formName,
            validator: fieldValidator,
            isSecretExistsPath,
          }}
          formName={this.props.formName}
          multipleConfig={[]}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: AppState, props: any) => {
  const { datasource, formName } = props;
  const hintMessages = datasource && datasource.messages;

  return {
    initialValues: datasourceToFormValues(datasource),
    formMeta: getFormMeta(formName)(state),
    messages: hintMessages,
    datasourceName: datasource?.name ?? "",
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    initializeReplayEntity: (id: string, data: any) =>
      dispatch(updateReplayEntity(id, data, ENTITY_TYPE.DATASOURCE)),
    updateDatasource: (
      formData: any,
      currEditingEnvId: string,
      onSuccess?: ReduxAction<unknown>,
    ) => dispatch(updateDatasource(formData, currEditingEnvId, onSuccess)),
    createDatasource: (formData: any, onSuccess?: ReduxAction<unknown>) =>
      dispatch(createDatasourceFromForm(formData, onSuccess)),
    toggleSaveActionFlag: (flag: boolean) =>
      dispatch(toggleSaveActionFlag(flag)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  reduxForm<ApiDatasourceForm, DatasourceRestApiEditorProps>({
    form: DATASOURCE_REST_API_FORM,
    enableReinitialize: true,
  })(DatasourceRestAPIEditor),
);
