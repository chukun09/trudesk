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
 *  Updated:    2/15/19 6:05 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'
import { isEqual } from 'lodash'
import { updatePermissions } from 'actions/settings'
import { showModal } from 'actions/common'

import Button from 'components/Button'
import SettingItem from 'components/Settings/SettingItem'
import EnableSwitch from 'components/Settings/EnableSwitch'
import PermissionGroupPartial from './permissionGroupPartial'

import helpers from 'lib/helpers'

function defaultGrants() {
  return {
    all: false,
    create: false,
    view: false,
    update: false,
    delete: false,
    special: []
  }
}

@observer
class PermissionBody extends React.Component {
  @observable isAdmin = ''
  @observable isAgent = ''
  @observable hasHierarchy = ''
  grants = []

  @observable ticketGrants = defaultGrants()
  @observable commentGrants = defaultGrants()
  @observable accountGrants = defaultGrants()
  @observable groupGrants = defaultGrants()
  @observable teamGrants = defaultGrants()
  @observable departmentGrants = defaultGrants()
  @observable reportGrants = defaultGrants()
  @observable noticeGrants = defaultGrants()

  constructor(props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount() {
    this.isAdmin = this.props.role.get('isAdmin') || false
    this.isAgent = this.props.role.get('isAgent') || false
    this.hasHierarchy = this.props.role.get('hierarchy') || false
    this.grants = this.props.role.get('grants').toArray() || []

    this.parseGrants()
  }

  componentDidUpdate() {
    if (this.isAdmin === '') this.isAdmin = this.props.role.get('isAdmin') || false
    if (this.isAgent === '') this.isAgent = this.props.role.get('isAgent') || false
    if (this.hasHierarchy === '') this.hasHierarchy = this.props.role.get('hierarchy') || false
    if (this.grants.length < 1) this.grants = this.props.role.get('grants').toArray() || []

    this.parseGrants()
  }

  parseGrants() {
    if (!this.grants) return
    const parsedGrants = helpers.parseRoleGrants(this.grants)

    if (parsedGrants.tickets && !isEqual(parsedGrants.tickets, this.ticketGrants))
      this.ticketGrants = parsedGrants.tickets

    if (parsedGrants.comments && !isEqual(parsedGrants.comments, this.commentGrants))
      this.commentGrants = parsedGrants.comments

    if (parsedGrants.accounts && !isEqual(parsedGrants.accounts, this.accountGrants))
      this.accountGrants = parsedGrants.accounts

    if (parsedGrants.groups && !isEqual(parsedGrants.groups, this.groupGrants)) this.groupGrants = parsedGrants.groups
    if (parsedGrants.teams && !isEqual(parsedGrants.teams, this.teamGrants)) this.teamGrants = parsedGrants.teams
    if (parsedGrants.departments && !isEqual(parsedGrants.departments, this.departmentGrants))
      this.departmentGrants = parsedGrants.departments

    if (parsedGrants.reports && !isEqual(parsedGrants.reports, this.reportGrants))
      this.reportGrants = parsedGrants.reports

    if (parsedGrants.notices && !isEqual(parsedGrants.notices, this.noticeGrants))
      this.noticeGrants = parsedGrants.notices
  }

  onEnableSwitchChanged(e, name) {
    this[name] = e.target.checked
  }

  static mapTicketSpecials() {
    return [
      { title: 'Print', perm: 'print' },
      { title: 'Notes', perm: 'notes' },
      { title: 'Manage Public Tickets', perm: 'public' },
      { title: 'Can View All Tickets in Assigned Groups', perm: 'viewall' }
    ]
  }

  static mapAccountSpecials() {
    return [{ title: 'Import', perm: 'import' }]
  }

  static mapNoticeSpecials() {
    return [
      { title: 'Activate', perm: 'activate' },
      { title: 'Deactivate', perm: 'deactivate' }
    ]
  }

  onSubmit(e) {
    e.preventDefault()
    const obj = {}
    obj._id = this.props.role.get('_id')
    if (this.isAdmin) {
      obj.admin = ['*']
      obj.settings = ['*']
    }
    if (this.isAgent) obj.agent = ['*']
    obj.hierarchy = this.hasHierarchy

    obj.tickets = PermissionBody.buildPermArray(this.ticketPermGroup)
    obj.comments = PermissionBody.buildPermArray(this.commentPermGroup)
    obj.accounts = PermissionBody.buildPermArray(this.accountPermGroup)
    obj.groups = PermissionBody.buildPermArray(this.groupPermGroup)
    obj.teams = PermissionBody.buildPermArray(this.teamPermGroup)
    obj.departments = PermissionBody.buildPermArray(this.departmentPermGroup)
    obj.reports = PermissionBody.buildPermArray(this.reportPermGroup)
    obj.notices = PermissionBody.buildPermArray(this.noticePermGroup)

    this.props.updatePermissions(obj)
  }

  static buildPermArray(permGroup) {
    let arr = []
    if (permGroup.all) arr = ['*']
    else {
      if (permGroup.create) arr.push('create')
      if (permGroup.view) arr.push('view')
      if (permGroup.update) arr.push('update')
      if (permGroup.delete) arr.push('delete')
      if (permGroup.special) arr.push(permGroup.special.join(' '))
    }

    return arr
  }

  showDeletePermissionRole(e) {
    e.preventDefault()
    this.props.showModal('DELETE_ROLE', { role: this.props.role })
  }

  render() {
    return (
      <div>
        <form onSubmit={e => this.onSubmit(e)}>
          <SettingItem
            title={'Quản Trị Viên'}
            tooltip={'Vai trò được xem xét là một quản trị viên. Cho phép quản lý của trình trudesk.'}
            subtitle={'Vai trò này có được xác định là vai trò quản trị viên không?'}
            component={
              <EnableSwitch
                stateName={'isAdmin_' + this.props.role.get('_id')}
                label={'Bật'}
                checked={this.isAdmin}
                onChange={e => this.onEnableSwitchChanged(e, 'isAdmin')}
              />
            }
          />
          <SettingItem
            title={'Nhân Viên Hỗ Trợ'}
            subtitle={'Vai trò này có được xác định là vai trò nhân viên hỗ trợ không?'}
            tooltip={'Vai trò được xem xét là vai trò nhân viên hỗ trợ. Cho phép xem trạng thái nhân viên và hiển thị trong danh sách nhân viên.'}
            component={
              <EnableSwitch
                stateName={'isAgent_' + this.props.role.get('_id')}
                label={'Bật'}
                checked={this.isAgent}
                onChange={e => this.onEnableSwitchChanged(e, 'isAgent')}
              />
            }
          />
          <SettingItem
            title={'Cho Phép Hệ Thống Cấp Cao'}
            subtitle={'Cho phép vai trò này quản lý các tài nguyên thuộc sở hữu của các vai trò được xác định dưới đây.'}
            component={
              <EnableSwitch
                stateName={'hasHierarchy_' + this.props.role.get('_id')}
                label={'Bật'}
                checked={this.hasHierarchy}
                onChange={e => this.onEnableSwitchChanged(e, 'hasHierarchy')}
              />
            }
          />
          <PermissionGroupPartial
            ref={i => (this.ticketPermGroup = i)}
            title={'Ticket'}
            role={this.props.role}
            grants={this.ticketGrants}
            roleSpecials={PermissionBody.mapTicketSpecials()}
            subtitle={'Quyền Ticket'}
          />
          <PermissionGroupPartial
            ref={i => (this.commentPermGroup = i)}
            title={'Bình Luận'}
            role={this.props.role}
            grants={this.commentGrants}
            subtitle={'Quyền Bình Luận Trên Ticket'}
          />
          <PermissionGroupPartial
            ref={i => (this.accountPermGroup = i)}
            title={'Tài Khoản'}
            role={this.props.role}
            roleSpecials={PermissionBody.mapAccountSpecials()}
            grants={this.accountGrants}
            subtitle={'Quyền Tài Khoản'}
          />
          <PermissionGroupPartial
            ref={i => (this.groupPermGroup = i)}
            title={'Nhóm'}
            role={this.props.role}
            grants={this.groupGrants}
            subtitle={'Quyền Nhóm'}
          />
          <PermissionGroupPartial
            ref={i => (this.teamPermGroup = i)}
            title={'Teams'}
            role={this.props.role}
            grants={this.teamGrants}
            subtitle={'Quyền Teams'}
          />
          <PermissionGroupPartial
            ref={i => (this.departmentPermGroup = i)}
            title={'Phòng Ban'}
            role={this.props.role}
            grants={this.departmentGrants}
            subtitle={'Quyền Phòng Ban'}
          />
          <PermissionGroupPartial
            ref={i => (this.reportPermGroup = i)}
            title={'Báo Cáo'}
            role={this.props.role}
            grants={this.reportGrants}
            subtitle={'Quyền Báo Cáo'}
          />
          <PermissionGroupPartial
            ref={i => (this.noticePermGroup = i)}
            title={'Thông Báo'}
            role={this.props.role}
            grants={this.noticeGrants}
            roleSpecials={PermissionBody.mapNoticeSpecials()}
            subtitle={'Quyền Thông Báo'}
          />
          <div className={'uk-margin-large-bottom'}>
            <h2 className='text-light'>Vùng Nguy Hiểm</h2>
            <div className='danger-zone'>
              <div className='dz-box uk-clearfix'>
                <div className='uk-float-left'>
                  <h5>Xóa vai trò quyền này?</h5>
                  <p>Khi bạn xóa vai trò quyền này, không thể hoàn tác. Hãy chắc chắn.</p>
                </div>
                <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                  <Button
                    text={'Xóa'}
                    small={true}
                    style={'danger'}
                    onClick={e => this.showDeletePermissionRole(e)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className='box uk-clearfix'>
              <div className='uk-float-right' style={{ paddingTop: '10px' }}>
                <Button type={'submit'} style={'success'} waves={true} text={'Lưu Quyền'} />
              </div>
            </div>
          </div>
        </form>
      </div>

    )
  }
}

PermissionBody.propTypes = {
  role: PropTypes.object.isRequired,
  updatePermissions: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired
}

export default connect(null, { updatePermissions, showModal })(PermissionBody)
