import Api from "./Api";
import type { AxiosPromise } from "axios";
import type { ApiResponse } from "api/ApiResponses";

type SavePhalApiConfigParams = {
  datasourceId: string;
  workSpaceId: string;
  groupId: string;
  appSmithAppKey?: string;
  appSmithAppSecret?: string;
  isCreate?: boolean;
};
class PhalApi extends Api {
  static url = "v1/master";

  static syncPhalApiConfig({
    appSmithAppKey,
    appSmithAppSecret,
    datasourceId,
    groupId,
    isCreate,
    workSpaceId,
  }: SavePhalApiConfigParams): AxiosPromise<ApiResponse<string>> {
    const url = isCreate
      ? `${PhalApi.url}/addInterfaceConfig`
      : `${PhalApi.url}/updateInterfaceConfig`;
    return Api.post(url, {
      dataSourceId: datasourceId,
      workspaceId: workSpaceId,
      groupId,
      appSmithAppKey,
      appSmithSecret: appSmithAppSecret,
    });
  }
  // Api endpoint to get "Appsmith token" from server
  static addPhalApiConfig({
    appSmithAppKey,
    appSmithAppSecret,
    datasourceId,
    groupId,
    workSpaceId,
  }: SavePhalApiConfigParams): AxiosPromise<ApiResponse<string>> {
    return Api.post(`${PhalApi.url}/addInterfaceConfig`, {
      datasourceId: datasourceId,
      workSpaceId: workSpaceId,
      groupId,
      appSmithAppKey,
      appSmithAppSecret,
    });
  }
  // Api endpoint to get "Appsmith token" from server
  static updatePhalApiConfig({
    appSmithAppKey,
    appSmithAppSecret,
    datasourceId,
    groupId,
    workSpaceId,
  }: SavePhalApiConfigParams): AxiosPromise<ApiResponse<string>> {
    return Api.post(`${PhalApi.url}/updateInterfaceConfig`, {
      datasourceId: datasourceId,
      workSpaceId: workSpaceId,
      groupId,
      appSmithAppKey,
      appSmithAppSecret,
    });
  }
}

export default PhalApi;
