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
 *  Updated:    1/20/19 4:46 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Log from '../../../logger'

import $ from 'jquery'
import axios from 'axios'
import UIKit from 'uikit'
import helpers from 'lib/helpers'

import { updateSetting } from 'actions/settings'
import { getTagsWithPage, tagsUpdateCurrentPage, deleteStatus } from 'actions/tickets'
import { showModal } from 'actions/common'

import EnableSwitch from 'components/Settings/EnableSwitch'
import NumberWithSave from 'components/Settings/NumberWithSave'
import Button from 'components/Button'
import ButtonGroup from 'components/ButtonGroup'
import TicketTypeBody from './ticketTypeBody'
import SettingSubItem from 'components/Settings/SettingSubItem'
import Zone from 'components/ZoneBox/zone'
import ZoneBox from 'components/ZoneBox'
import Grid from 'components/Grid'
import EditPriorityPartial from './editPriorityPartial'
import GridItem from 'components/Grid/GridItem'
import SettingItem from 'components/Settings/SettingItem'
import SingleSelect from 'components/SingleSelect'
import SplitSettingsPanel from 'components/Settings/SplitSettingsPanel'
import SpinLoader from 'components/SpinLoader'
import EditStatusPartial from './editStatusPartial'
import TicketStatusContainer from 'containers/Settings/Tickets/ticketStatusContainer'

class TicketsSettings extends React.Component {
  constructor(props) {
    super(props)

    this.getTicketTags = this.getTicketTags.bind(this)
  }

  static toggleEditPriority(e) {
    const $parent = $(e.target).parents('.priority-wrapper')
    const $v = $parent.find('.view-priority')
    const $e = $parent.find('.edit-priority')
    if ($v && $e) {
      $v.toggleClass('hide')
      $e.toggleClass('hide')
    }
  }

  static toggleEditStatus(e) {
    const $parent = $(e.target).parents('.status-wrapper')
    const $v = $parent.find('.view-status')
    const $e = $parent.find('.edit-status')
    if ($v && $e) {
      $v.toggleClass('hide')
      $e.toggleClass('hide')
    }
  }

  static toggleEditTag(e) {
    const $target = $(e.target)
    const $parent = $target.parents('.tag-wrapper')
    const $v = $parent.find('.view-tag')
    const $e = $parent.find('.edit-tag')
    if ($v && $e) {
      $v.toggleClass('hide')
      $e.toggleClass('hide')
    }
  }

  componentDidMount() {
    this.getTicketTags(null, 0)
    const $tagPagination = $('#tagPagination')
    this.tagsPagination = UIKit.pagination($tagPagination, {
      items: this.props.tagsSettings.totalCount ? this.props.tagsSettings.totalCount : 0,
      itemsOnPage: 16
    })
    $tagPagination.on('select.uk.pagination', this.getTicketTags)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.tagsSettings.totalCount !== this.props.tagsSettings.totalCount) {
      this.tagsPagination.pages = Math.ceil(this.props.tagsSettings.totalCount / 16)
        ? Math.ceil(this.props.tagsSettings.totalCount / 16)
        : 1
      this.tagsPagination.render()
      if (this.tagsPagination.currentPage > this.tagsPagination.pages - 1)
        this.tagsPagination.selectPage(this.tagsPagination.pages - 1)
    }
  }

  getSetting(name) {
    return this.props.settings.getIn(['settings', name, 'value'])
      ? this.props.settings.getIn(['settings', name, 'value'])
      : ''
  }

  getTicketTypes() {
    return this.props.settings && this.props.settings.get('ticketTypes')
      ? this.props.settings.get('ticketTypes').toArray()
      : []
  }

  getPriorities() {
    return this.props.settings && this.props.settings.get('priorities')
      ? this.props.settings.get('priorities').toArray()
      : []
  }

  getStatus() {
    return this.props.settings && this.props.settings.get('status') ? this.props.settings.get('status').toArray() : []
  }

  getTicketTags(e, page) {
    if (e) e.preventDefault()
    this.props.tagsUpdateCurrentPage(page)
    this.props.getTagsWithPage({ limit: 16, page })
  }

  onDefaultTicketTypeChange(e) {
    this.props.updateSetting({ name: 'ticket:type:default', value: e.target.value, stateName: 'defaultTicketType' })
  }

  onAllowPublicTicketsChange(e) {
    this.props.updateSetting({
      name: 'allowPublicTickets:enable',
      value: e.target.checked,
      stateName: 'allowPublicTickets',
      noSnackbar: true
    })
  }

  onAllowAgentUserTicketsChange(e) {
    this.props.updateSetting({
      name: 'allowAgentUserTickets:enable',
      value: e.target.checked,
      stateName: 'allowAgentUserTickets',
      noSnackbar: true
    })
  }

  onShowOverdueChange(e) {
    this.props.updateSetting({
      name: 'showOverdueTickets:enable',
      value: e.target.checked,
      stateName: 'showOverdueTickets',
      noSnackbar: true
    })
  }

  onPlayNewTicketSoundChange(e) {
    this.props.updateSetting({
      name: 'playNewTicketSound:enable',
      value: e.target.checked,
      stateName: 'playNewTicketSound',
      noSnackbar: true
    })
  }

  showModal(e, modal, props) {
    e.preventDefault()
    this.props.showModal(modal, props)
  }

  onRemovePriorityClicked(e, priority) {
    e.preventDefault()
    this.props.showModal('DELETE_PRIORITY', { priority })
  }

  onRemoveStatusClicked(e, stat) {
    e.preventDefault()
    console.log(stat)
    console.log(stat.get('_id'))
    this.props.deleteStatus(stat.get('id'))
  }

  onSubmitUpdateTag(e, tagId) {
    e.preventDefault()
    e.persist()
    const name = e.target.name.value
    if (name.length < 2) return helpers.UI.showSnackbar('Invalid Tag Name', true)

    axios
      .put(`/api/v1/tags/${tagId}`, { name })
      .then(res => {
        TicketsSettings.toggleEditTag(e)
        helpers.UI.showSnackbar(`Tag: ${res.data.tag.name} updated successfully`)
        this.getTicketTags(null, this.tagsPagination.currentPage)
      })
      .catch(err => {
        if (!err.response) return Log.error(err)

        const errorText = err.response.data.error
        Log.error(errorText, err.response)
        helpers.UI.showSnackbar(`Error: ${errorText}`, true)
      })
  }

  onRemoveTagClicked(e, tag) {
    UIKit.modal.confirm(
      `Xóa thẻ <strong>${tag.get()}</strong> thực sự<br />
      <i style="font-size: 13px; color: #e53935">Hành động này sẽ loại bỏ thẻ khỏi tất cả các Ticket liên quan.</i>`,
      () => {
        axios
          .delete(`/api/v1/tags/${tag.get('_id')}`)
          .then(res => {
            if (res.data.success) {
              helpers.UI.showSnackbar(`Successfully removed tag: ${tag.get('name')}`)

              this.getTicketTags(null, this.tagsPagination.currentPage)
            }
          })
          .catch(error => {
            const errorText = error.response.data.error
            helpers.UI.showSnackbar(`Error: ${errorText}`, true)
            Log.error(errorText, error.response)
          })
      },
      {
        labels: { Ok: 'Yes', Cancel: 'No' },
        confirmButtonClass: 'md-btn-danger'
      }
    )
  }

  render() {
    const { active, viewdata } = this.props
    const mappedTypes = this.getTicketTypes().map(function (type) {
      return { text: type.get('name'), value: type.get('_id') }
    })

    return (
      <div className={active ? 'active' : 'hide'}>
        <SettingItem
          title={'Loại Ticket Mặc Định'}
          subtitle={'Loại Ticket mặc định cho Ticket mới được tạo.'}
          component={
            <SingleSelect
              items={mappedTypes}
              defaultValue={this.getSetting('defaultTicketType')}
              onSelectChange={e => {
                this.onDefaultTicketTypeChange(e)
              }}
              width={'50%'}
              showTextbox={false}
            />
          }
        />
        <SettingItem
          title={'Cho Phép Ticket Công khai'}
          subtitle={
            <div>
              Cho phép người dùng chưa đăng ký tạo Ticket. (
              <a href={viewdata.get('hosturl') + '/newissue'}>{viewdata.get('hosturl') + '/newissue'}</a>)
            </div>
          }
          component={
            <EnableSwitch
              stateName={'allowPublicTickets'}
              label={'Bật'}
              checked={this.getSetting('allowPublicTickets')}
              onChange={e => {
                this.onAllowPublicTicketsChange(e)
              }}
            />
          }
        />
        <SettingItem
          title={'Cho Phép Nhân Viên Gửi Ticket Thay Mặt Người Dùng'}
          subtitle={<div>Cho phép nhân viên tạo Ticket thay mặt người dùng.</div>}
          tooltip={'Thiết lập có hiệu lực sau khi làm mới.'}
          component={
            <EnableSwitch
              stateName={'allowAgentUserTickets'}
              label={'Bật'}
              checked={this.getSetting('allowAgentUserTickets')}
              onChange={e => {
                this.onAllowAgentUserTicketsChange(e)
              }}
            />
          }
        />
        <SettingItem
          title={'Hiển Thị Ticket Quá Hạn'}
          subtitle={'Bật/Tắt sự nhấp nháy của Ticket dựa trên thời gian SLA của mức độ ưu tiên.'}
          tooltip={'Nếu tắt, thời gian SLA của mức độ ưu tiên sẽ không đánh dấu Ticket quá hạn.'}
          component={
            <EnableSwitch
              stateName={'showOverdueTickets'}
              label={'Bật'}
              checked={this.getSetting('showOverdueTickets')}
              onChange={e => {
                this.onShowOverdueChange(e)
              }}
            />
          }
        />
        <SettingItem
          title={'Độ Dài Tối Thiểu cho Tiêu Đề Ticket'}
          subtitle={'Giới hạn ký tự tối thiểu cho tiêu đề Ticket'}
          component={
            <NumberWithSave
              stateName={'minSubjectLength'}
              settingName={'ticket:minlength:subject'}
              value={this.getSetting('minSubjectLength')}
              width={'40%'}
            />
          }
        />
        <SettingItem
          title={'Độ Dài Tối Thiểu cho Vấn Đề Ticket'}
          subtitle={'Giới hạn ký tự tối thiểu cho vấn đề Ticket'}
          component={
            <NumberWithSave
              stateName={'minIssueLength'}
              settingName={'ticket:minlength:issue'}
              value={this.getSetting('minIssueLength')}
              width={'40%'}
            />
          }
        />
        <SplitSettingsPanel
          title={'Loại Ticket'}
          subtitle={'Tạo/Chỉnh Sửa Loại Ticket'}
          rightComponent={
            <Button
              text={'Tạo'}
              style={'success'}
              flat={true}
              extraClass={'md-btn-wave'}
              onClick={e => {
                this.showModal(e, 'CREATE_TICKET_TYPE')
              }}
            />
          }
          menuItems={this.getTicketTypes().map(function (type) {
            return { key: type.get('_id'), title: type.get('name'), bodyComponent: <TicketTypeBody type={type} /> }
          })}
        />
        <SettingItem
          title={'Mức Độ Ưu Tiên Của Ticket'}
          subtitle={'Mức độ ưu tiên của Ticket xác định mức độ SLA cho mỗi Ticket.'}
          component={
            <Button
              text={'Tạo'}
              style={'success'}
              flat={true}
              waves={true}
              extraClass={'mt-10 right'}
              onClick={e => this.showModal(e, 'CREATE_PRIORITY')}
            />
          }
        >
          <Zone>
            {this.getPriorities().map(p => {
              const disableRemove = p.get('default') ? p.get('default') : false
              return (
                <ZoneBox key={p.get('_id')} extraClass={'priority-wrapper'}>
                  <SettingSubItem
                    parentClass={'view-priority'}
                    title={p.get('name')}
                    titleCss={{ color: p.get('htmlColor') }}
                    subtitle={
                      <div>
                        SLA Quá Hạn: <strong>{p.get('durationFormatted')}</strong>
                      </div>
                    }
                    component={
                      <ButtonGroup classNames={'uk-float-right'}>
                        <Button text={'Chỉnh sửa'} small={true} onClick={e => TicketsSettings.toggleEditPriority(e)} />
                        <Button
                          text={'Xóa'}
                          small={true}
                          style={'danger'}
                          disabled={disableRemove}
                          onClick={e => this.onRemovePriorityClicked(e, p)}
                        />
                      </ButtonGroup>
                    }
                  />
                  <EditPriorityPartial priority={p} />
                </ZoneBox>
              )
            })}
          </Zone>
        </SettingItem>
        <TicketStatusContainer statuses={this.getStatus()} />
        <SettingItem
          title={'Tags Ticket'}
          subtitle={'Tạo/Chỉnh Sửa Tags Ticket'}
          component={
            <Button
              text={'Tạo'}
              style={'success'}
              flat={true}
              waves={true}
              extraClass={'mt-10 right'}
              onClick={e =>
                this.showModal(e, 'CREATE_TAG', { page: 'settings', currentPage: this.props.tagsSettings.currentPage })
              }
            />
          }
          footer={<ul id={'tagPagination'} className={'uk-pagination'} />}
        >
          <Grid extraClass={'uk-margin-medium-bottom'}>
            {this.props.tagsSettings.tags.size < 1 && (
              <div style={{ width: '100%', padding: '55px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '300' }}>Không Tìm Thấy Thẻ</h3>
              </div>
            )}
            <SpinLoader active={this.props.tagsSettings.loading} extraClass={'panel-bg'} />
            <GridItem width={'1-1'}>
              <Grid extraClass={'zone ml-0'}>
                {this.props.tagsSettings.tags.map(i => {
                  return (
                    <GridItem width={'1-2'} key={i.get('_id')} extraClass={'tag-wrapper br bb'}>
                      <Grid extraClass={'view-tag'}>
                        <GridItem width={'1-1'}>
                          <ZoneBox>
                            <Grid>
                              <GridItem width={'1-2'}>
                                <h5
                                  style={{
                                    fontSize: '16px',
                                    lineHeight: '31px',
                                    margin: 0,
                                    padding: 0,
                                    fontWeight: 300
                                  }}
                                >
                                  {i.get('name')}
                                </h5>
                              </GridItem>
                              <GridItem width={'1-2'} extraClass={'uk-text-right'}>
                                <ButtonGroup classNames={'mt-5'}>
                                  <Button
                                    text={'Chỉnh sửa'}
                                    flat={true}
                                    waves={true}
                                    small={true}
                                    onClick={e => TicketsSettings.toggleEditTag(e)}
                                  />
                                  <Button
                                    text={'Xóa'}
                                    flat={true}
                                    waves={true}
                                    style={'danger'}
                                    small={true}
                                    onClick={e => this.onRemoveTagClicked(e, i)}
                                  />
                                </ButtonGroup>
                              </GridItem>
                            </Grid>
                          </ZoneBox>
                        </GridItem>
                      </Grid>
                      <Grid extraClass={'edit-tag z-box uk-clearfix nbt hide'} style={{ paddingTop: '5px' }}>
                        <GridItem width={'1-1'}>
                          <form onSubmit={e => this.onSubmitUpdateTag(e, i.get('_id'))}>
                            <Grid>
                              <GridItem width={'2-3'}>
                                <input type='text' className={'md-input'} name={'name'} defaultValue={i.get('name')} />
                              </GridItem>
                              <GridItem width={'1-3'} style={{ paddingTop: '10px' }}>
                                <ButtonGroup classNames={'uk-float-right uk-text-right'}>
                                  <Button
                                    text={'Hủy'}
                                    flat={true}
                                    waves={true}
                                    small={true}
                                    onClick={e => TicketsSettings.toggleEditTag(e)}
                                  />
                                  <Button
                                    type={'submit'}
                                    text={'Lưu'}
                                    flat={true}
                                    waves={true}
                                    small={true}
                                    style={'success'}
                                  />
                                </ButtonGroup>
                              </GridItem>
                            </Grid>
                          </form>
                        </GridItem>
                      </Grid>
                    </GridItem>
                  )
                })}
              </Grid>
            </GridItem>
          </Grid>
        </SettingItem>

      </div>
    )
  }
}

TicketsSettings.propTypes = {
  active: PropTypes.bool.isRequired,
  viewdata: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  tagsSettings: PropTypes.object.isRequired,
  updateSetting: PropTypes.func.isRequired,
  getTagsWithPage: PropTypes.func.isRequired,
  tagsUpdateCurrentPage: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  deleteStatus: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  viewdata: state.common.viewdata,
  settings: state.settings.settings,
  tagsSettings: state.tagsSettings
})

export default connect(mapStateToProps, {
  updateSetting,
  getTagsWithPage,
  tagsUpdateCurrentPage,
  showModal,
  deleteStatus
})(TicketsSettings)
