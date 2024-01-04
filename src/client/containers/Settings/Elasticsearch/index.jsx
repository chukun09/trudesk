/*
 *       .                             .o8                     oooo
 *    .o8                             "888                     `888
 *  .o888oo oooo d8b oooo  oooo   .oooo888   .ooooo.   .oooo.o  888  oooo
 *    888   `888""8P `888  `888  d88' `888  d88' `88b d88(  "8  888 .8P'
 *    888    888      888   888  888   888  888ooo888 `"Y88b.   888888.
 *    888 .  888      888   888  888   888  888    .o o.  )88b  888 `88b.
 *    "888" d888b     `V88V"V8P' `Y8bod88P" `Y8bod8P' 8""888P' o888o o888o
 *  ========================================================================
 *  Author:     Chris Brame
 *  Updated:    4/14/19 2:25 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { updateSetting, updateMultipleSettings } from 'actions/settings'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import EnableSwitch from 'components/Settings/EnableSwitch'

import Log from '../../../logger'
import axios from 'axios'
import helpers from 'lib/helpers'
import UIKit from 'uikit'

@observer
class ElasticsearchSettingsContainer extends React.Component {
  @observable esStatus = 'Not Configured'
  @observable esStatusClass = ''
  @observable indexCount = 0
  @observable inSyncText = 'Not Configured'
  @observable inSyncClass = ''
  @observable disableRebuild = false

  constructor(props) {
    super(props)
    makeObservable(this)

    this.state = {
      host: false,
      port: '',

      configured: false
    }

    this.getStatus = this.getStatus.bind(this)
    this.rebuildIndex = this.rebuildIndex.bind(this)
  }

  componentDidMount() {
    helpers.UI.inputs()
  }

  componentDidUpdate() {
    helpers.UI.reRenderInputs()

    if (!this.loaded && this.state.configured) {
      this.getStatus()
      this.loaded = true
    }
  }

  static getDerivedStateFromProps(nextProps, state) {
    if (nextProps.settings) {
      let stateObj = { ...state }
      if (state.host === false)
        stateObj.host = nextProps.settings.getIn(['settings', 'elasticSearchHost', 'value']) || false
      if (!state.port) stateObj.port = nextProps.settings.getIn(['settings', 'elasticSearchPort', 'value']) || ''

      if (!state.configured)
        stateObj.configured = nextProps.settings.getIn(['settings', 'elasticSearchConfigured', 'value']) || false

      return stateObj
    }

    return null
  }

  getSetting(name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  onEnableChanged(e) {
    const checked = e.target.checked
    const self = this
    this.props
      .updateSetting({
        stateName: 'elasticSearchEnabled',
        name: 'es:enable',
        value: checked,
        noSnackbar: true
      })
      .then(() => {
        if (checked && this.state.host && this.state.port) {
          this.setState({ configured: true }, () => {
            this.getStatus()
          })
        } else {
          this.setState({ configured: false }, () => {
            self.esStatus = 'Not Configured'
            self.esStatusClass = ''
            self.inSyncText = 'Not Configured'
            self.inSyncClass = ''
            self.indexCount = 0
          })
        }
      })
  }

  onInputChanged(e, settingName) {
    this.setState({
      [settingName]: e.target.value
    })
  }

  onFormSubmit(e) {
    e.preventDefault()

    const payload = [
      { name: 'es:host', value: this.state.host },
      { name: 'es:port', value: this.state.port }
    ]

    this.props.updateMultipleSettings(payload)
  }

  getStatus() {
    const self = this
    // self.esStatus = 'Please Wait...'
    // self.inSyncText = 'Please Wait...'
    // if (!this.state.configured) {
    //   this.esStatus = 'Not Configured'
    //   this.indexCount = 0
    //   this.inSyncText = 'Not Configured'
    //   this.inSyncClass = ''
    //
    //   return false
    // }

    axios
      .get('/api/v2/es/status')
      .then(res => {
        const data = res.data
        if (data.status.isRebuilding) {
          self.esStatus = 'Rebuilding...'
          self.esStatusClass = ''
        } else self.esStatus = data.status.esStatus
        if (self.esStatus.toLowerCase() === 'connected') self.esStatusClass = 'text-success'
        else if (self.esStatus.toLowerCase() === 'error') self.esStatusClass = 'text-danger'

        self.indexCount = data.status.indexCount.toLocaleString()
        if (data.status.inSync) {
          self.inSyncText = 'In Sync'
          self.inSyncClass = 'bg-success'
        } else {
          self.inSyncText = 'Out of Sync'
          self.inSyncClass = 'bg-warn'
        }

        if (data.status.isRebuilding) {
          setTimeout(self.getStatus, 3000)
          self.disableRebuild = true
        } else self.disableRebuild = false
      })
      .catch(err => {
        this.esStatus = 'Error'
        this.esStatusClass = 'text-danger'
        this.inSyncText = 'Unknown'
        this.inSyncClass = ''
        if (err.error && err.error.message) helpers.UI.showSnackbar('Error: ' + err.error.message, true)
        else helpers.UI.showSnackbar('Error: An unknown error occurred. Check Console.', true)
        Log.error(err)
      })
  }

  rebuildIndex() {
    const self = this
    UIKit.modal.confirm(
      'Bạn có chắc chắn muốn xây dựng lại chỉ mục không?',
      function () {
        self.esStatus = 'Đang xây dựng lại...'
        self.inSyncText = 'Out of Sync'
        self.inSyncClass = 'bg-warn'
        self.indexCount = 0
        axios
          .get('/api/v2/es/rebuild')
          .then(() => {
            self.esStatus = 'Đang xây dựng lại...'
            // $scope.esStatusClass = 'text-warning';
            helpers.UI.showSnackbar('Đang xây dựng lại Index...', false)
            self.disableRebuild = true
            setTimeout(self.getStatus, 3000)
          })
          .catch(function (err) {
            Log.error('[trudesk:settings:es:RebuildIndex]', err)
            helpers.UI.showSnackbar('Error: An unknown error occurred. Check Console.', true)
          })
      },
      {
        labels: { Ok: 'Có', Cancel: 'Không' },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  render() {
    return (
      <div className={this.props.active ? '' : 'hide'}>
        <SettingItem
          title={'Elasticsearch - Beta'}
          subtitle={'Bật động cơ Elasticsearch'}
          component={
            <EnableSwitch
              stateName={'elasticSearchEnabled'}
              label={'Bật'}
              checked={this.getSetting('elasticSearchEnabled')}
              onChange={e => this.onEnableChanged(e)}
            />
          }
        />
        <SettingItem
          title={'Trạng Thái Kết Nối'}
          subtitle={'Trạng thái kết nối hiện tại đến máy chủ Elasticsearch.'}
          component={<h4 className={`right mr-15 mt-15 ${this.esStatusClass}`}>{this.esStatus}</h4>}
        />
        <SettingItem
          title={'Tài Liệu Đã Được Lập Chỉ Mục'}
          subtitle={'Số lượng tài liệu đã được lập chỉ mục hiện tại.'}
          component={<h4 className={'right mr-15 mt-15'}>{this.indexCount}</h4>}
        />
        <SettingItem
          title={'Trạng Thái Chỉ Mục'}
          subtitle={'Trạng thái hiện tại của chỉ mục. Nếu trạng thái không phải là xanh, có thể cần phải xây dựng lại chỉ mục.'}
          extraClass={this.inSyncClass}
          component={<h4 className={'right mr-15 mt-15'}>{this.inSyncText}</h4>}
        />
        <SettingItem
          title={'Cấu Hình Máy Chủ Elasticsearch'}
          tooltip={'Thay đổi cài đặt máy chủ sẽ yêu cầu xây dựng lại chỉ mục và khởi động lại máy chủ.'}
          subtitle={'Cài đặt kết nối đến máy chủ Elasticsearch.'}
        >
          <form onSubmit={e => this.onFormSubmit(e)}>
            <div className='uk-margin-medium-bottom'>
              <label>Máy Chủ</label>
              <input
                type='text'
                className={'md-input md-input-width-medium'}
                value={this.state.host}
                disabled={!this.getSetting('elasticSearchEnabled')}
                onChange={e => this.onInputChanged(e, 'host')}
              />
            </div>
            <div className='uk-margin-medium-bottom'>
              <label>Cổng</label>
              <input
                type='text'
                className={'md-input md-input-width-medium'}
                value={this.state.port}
                disabled={!this.getSetting('elasticSearchEnabled')}
                onChange={e => this.onInputChanged(e, 'port')}
              />
            </div>
            <div className='uk-clearfix'>
              <Button
                text={'Áp Dụng'}
                type={'submit'}
                flat={true}
                waves={true}
                disabled={!this.getSetting('elasticSearchEnabled')}
                style={'success'}
                extraClass={'uk-float-right'}
              />
            </div>
          </form>
        </SettingItem>
        <SettingItem
          title={'Xây Dựng Lại Chỉ Mục'}
          subtitle={'Xóa chỉ mục và xây dựng lại'}
          tooltip={
            'Xây dựng lại chỉ nên xảy ra nếu chỉ mục không đồng bộ với cơ sở dữ liệu hoặc chưa được khởi tạo. Quá trình xây dựng lại sẽ mất một thời gian.'
          }
          component={
            <Button
              text={'Xây Dựng Lại'}
              flat={false}
              waves={true}
              style={'primary'}
              extraClass={'right mt-8 mr-5'}
              disabled={this.disableRebuild}
              onClick={this.rebuildIndex}
            />
          }
        />
      </div>

    )
  }
}

ElasticsearchSettingsContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
  updateMultipleSettings: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(mapStateToProps, { updateSetting, updateMultipleSettings })(ElasticsearchSettingsContainer)
