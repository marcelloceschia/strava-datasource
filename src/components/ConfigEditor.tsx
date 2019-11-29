import React, { PureComponent, ChangeEvent } from 'react';
import { FormLabel, Select, Input, Button } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps, DataSourceSettings } from '@grafana/data';
import { SelectableValue } from '@grafana/data';
//@ts-ignore
import { getDatasourceSrv } from 'grafana/app/features/plugins/datasource_srv';
import StravaDatasource from '../datasource';
import { StravaJsonData, StravaSecureJsonData } from '../types';

export type Props = DataSourcePluginOptionsEditorProps<StravaJsonData>;

type StravaSettings = DataSourceSettings<StravaJsonData, StravaSecureJsonData>;

export interface State {
  config: StravaSettings;
}

export class ConfigEditor extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { options } = this.props;

    this.state = {
      config: ConfigEditor.defaults(options),
    };

    this.updateDatasource(this.state.config);
  }

  static getDerivedStateFromProps(props: Props, state: State) {
    return {
      ...state,
      config: ConfigEditor.defaults(props.options),
    };
  }

  static defaults = (options: any) => {
    options.jsonData.authType = options.jsonData.authType || 'credentials';
    options.jsonData.timeField = options.jsonData.timeField || '@timestamp';

    if (!options.hasOwnProperty('secureJsonData')) {
      options.secureJsonData = {};
    }

    if (!options.hasOwnProperty('jsonData')) {
      options.jsonData = {};
    }

    if (!options.hasOwnProperty('secureJsonFields')) {
      options.secureJsonFields = {};
    }

    return options;
  }

  updateDatasource = async (config: any) => {
    for (const j in config.jsonData) {
      if (config.jsonData[j].length === 0) {
        delete config.jsonData[j];
      }
    }

    for (const k in config.secureJsonData) {
      if (config.secureJsonData[k].length === 0) {
        delete config.secureJsonData[k];
      }
    }

    this.props.onOptionsChange({
      ...config,
    });
  }

  onResetAccessToken = () => {
    this.updateDatasource({
      ...this.state.config,
      secureJsonFields: {
        ...this.state.config.secureJsonFields,
        accessToken: false,
      },
    });
  }

  onResetClientSecret = () => {
    this.updateDatasource({
      ...this.state.config,
      secureJsonFields: {
        ...this.state.config.secureJsonFields,
        clientSecret: false,
      },
    });
  }

  onResetAuthCode = () => {
    this.updateDatasource({
      ...this.state.config,
      secureJsonFields: {
        ...this.state.config.secureJsonFields,
        authCode: false,
      },
    });
  }

  onAccessTokenChange = (accessToken: string) => {
    this.updateDatasource({
      ...this.state.config,
      secureJsonData: {
        ...this.state.config.secureJsonData,
        accessToken,
      },
    });
  }

  onClientIDChange = (clientID: string) => {
    this.updateDatasource({
      ...this.state.config,
      jsonData: {
        ...this.state.config.jsonData,
        clientID,
      },
    });
  }

  onClientSecretChange = (clientSecret: string) => {
    this.updateDatasource({
      ...this.state.config,
      secureJsonData: {
        ...this.state.config.secureJsonData,
        clientSecret,
      },
    });
  }

  onAuthCodeChange = (authCode: string) => {
    this.updateDatasource({
      ...this.state.config,
      secureJsonData: {
        ...this.state.config.secureJsonData,
        authCode,
      },
    });
  }

  fillAuthCodeFromLocation = () => {
    const authCodePattern = /code=([\w]+)/;
    const result = authCodePattern.exec(window.location.search);
    console.log(result);
    const authCode = result[1];
    this.updateDatasource({
      ...this.state.config,
      secureJsonData: {
        ...this.state.config.secureJsonData,
        authCode,
      },
    });
  }

  getConnectWithStravaHref = () => {
    const authUrl = 'https://www.strava.com/oauth/authorize';
    const currentLocation = window.location.href;
    const clientID = this.state.config.jsonData.clientID;
    const authScope = 'read_all,profile:read_all,activity:read_all';
    return `${authUrl}?client_id=${clientID}&response_type=code&redirect_uri=${currentLocation}&approval_prompt=force&scope=${authScope}`;
  }

  render() {
    const { config } = this.state;
    console.log(window.location);
    const connectWithStravaHref = this.getConnectWithStravaHref();

    return (
      <>
        <h3 className="page-heading">Strava API Details</h3>
        <div className="gf-form-group">
          <div className="gf-form-inline">
            <div className="gf-form">
              <FormLabel className="width-14">Client ID</FormLabel>
              <div className="width-30">
                <Input
                  className="width-30"
                  value={config.jsonData.clientID || ''}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => this.onClientIDChange(event.target.value)}
                />
              </div>
            </div>
          </div>
          {config.secureJsonFields.clientSecret ? (
            <div className="gf-form-inline">
              <div className="gf-form">
                <FormLabel className="width-14">Client Secret</FormLabel>
                <Input className="width-25" placeholder="Configured" disabled={true} />
              </div>
              <div className="gf-form">
                <div className="max-width-30 gf-form-inline">
                  <Button variant="secondary" type="button" onClick={this.onResetClientSecret}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="gf-form-inline">
              <div className="gf-form">
                <FormLabel className="width-14">Client Secret</FormLabel>
                <div className="width-30">
                  <Input
                    className="width-30"
                    value={config.secureJsonData.clientSecret || ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => this.onClientSecretChange(event.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          {config.secureJsonFields.authCode ? (
            <div className="gf-form-inline">
              <div className="gf-form">
                <FormLabel className="width-14">Auth Code</FormLabel>
                <Input className="width-25" placeholder="Configured" disabled={true} />
              </div>
              <div className="gf-form">
                <div className="max-width-30 gf-form-inline">
                  <Button variant="secondary" type="button" onClick={this.onResetAuthCode}>
                    Reset
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="gf-form-inline">
              <div className="gf-form">
                <FormLabel className="width-14">Auth Code</FormLabel>
                <div className="width-25">
                  <Input
                    value={config.secureJsonData.authCode || ''}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => this.onAuthCodeChange(event.target.value)}
                  />
                </div>
              </div>
                <div className="gf-form">
                  <div className="max-width-30 gf-form-inline">
                    <Button className="width-5" variant="secondary" type="button" onClick={this.fillAuthCodeFromLocation}>
                      Fill
                    </Button>
                  </div>
                </div>
            </div>
          )}
        </div>
        <div className="gf-form-group">
          <a type="button" href={connectWithStravaHref}>
            <img src="public/plugins/grafana-strava-datasource/img/btn_strava_connectwith_orange.svg" />
          </a>
        </div>
      </>
    );
  }
}
