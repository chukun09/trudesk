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
 *  Updated:    2/26/19 11:49 PM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

import { createAccount } from 'actions/accounts'
import { fetchGroups, unloadGroups } from 'actions/groups'
import { fetchTeams, unloadTeams } from 'actions/teams'
import { fetchRoles } from 'actions/common'

import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'
import MultiSelect from 'components/MultiSelect'

import $ from 'jquery'
import helpers from 'lib/helpers'

@observer
class CreateAccountModal extends React.Component {
  @observable username = ''
  @observable password = ''
  @observable passwordConfirm = ''
  @observable fullname = ''
  @observable email = ''
  @observable title = ''
  selectedRole = ''
  @observable isAgentRole = false

  constructor(props) {
    super(props)
    makeObservable(this)
  }

  componentDidMount() {
    this.props.fetchGroups({ type: 'all' })
    this.props.fetchTeams()
    this.props.fetchRoles()

    helpers.UI.inputs()
    helpers.formvalidator()
  }

  componentDidUpdate() {
    helpers.UI.reRenderInputs()
  }

  onInputChanged(e, name) {
    this[name] = e.target.value
  }

  onRoleSelectChange(e) {
    this.selectedRole = e.target.value

    const roleObject = this.props.roles.find(role => {
      return role.get('_id') === this.selectedRole
    })

    this.isAgentRole = roleObject.get('isAdmin') || roleObject.get('isAgent')

    if (!this.selectedRole || this.selectedRole.length < 1) this.roleSelectErrorMessage.classList.remove('hide')
    else this.roleSelectErrorMessage.classList.add('hide')
  }

  onGroupSelectChange() {
    const selectedGroups = this.groupSelect.getSelected()
    if (!selectedGroups || selectedGroups.length < 1) this.groupSelectErrorMessage.classList.remove('hide')
    else this.groupSelectErrorMessage.classList.add('hide')
  }

  onFormSubmit(e) {
    e.preventDefault()
    const $form = $(e.target)

    let isValid = true

    if (!$form.isValid(null, null, false)) isValid = false

    if (!this.selectedRole || this.selectedRole.length < 1) {
      this.roleSelectErrorMessage.classList.remove('hide')
      if (isValid) isValid = false
    } else this.roleSelectErrorMessage.classList.add('hide')

    const selectedGroups = this.groupSelect ? this.groupSelect.getSelected() : undefined
    if (selectedGroups) {
      if (selectedGroups.length < 1) {
        this.groupSelectErrorMessage.classList.remove('hide')
        if (isValid) isValid = false
      } else this.groupSelectErrorMessage.classList.add('hide')
    }

    if (!isValid) return

    const payload = {
      username: this.username,
      fullname: this.fullname,
      title: this.title,
      email: this.email,
      groups: this.groupSelect ? this.groupSelect.getSelected() : undefined,
      teams: this.teamSelect ? this.teamSelect.getSelected() : undefined,
      role: this.selectedRole,
      password: this.password.length > 3 ? this.password : undefined,
      passwordConfirm: this.passwordConfirm.length > 3 ? this.passwordConfirm : undefined
    }

    this.props.createAccount(payload)
  }

  render() {
    const roles = this.props.roles
      .map(role => {
        return { text: role.get('name'), value: role.get('_id') }
      })
      .toArray()

    const groups = this.props.groups
      .map(group => {
        return { text: group.get('name'), value: group.get('_id') }
      })
      .toArray()

    const teams = this.props.teams
      .map(team => {
        return { text: team.get('name'), value: team.get('_id') }
      })
      .toArray()

    return (
      <BaseModal parentExtraClass={'pt-0'} extraClass={'p-0 pb-25'}>
        <div className={'uk-clearfix'}>
          <h5 style={{ fontWeight: 300 }}>Thêm Tài Khoản</h5>
          <div>
            <form className='nomargin' onSubmit={e => this.onFormSubmit(e)}>
              <div className='uk-margin-medium-bottom'>
                <label className='uk-form-label'>Tên Người Dùng</label>
                <input
                  type='text'
                  className={'md-input'}
                  value={this.username}
                  onChange={e => this.onInputChanged(e, 'username')}
                  data-validation={'length'}
                  data-validation-length={'min4'}
                  data-validation-error-msg={'Tên người dùng phải chứa ít nhất 4 ký tự.'}
                />
              </div>
              <div className='uk-margin-medium-bottom uk-clearfix'>
                <div className='uk-float-left' style={{ width: '50%', paddingRight: '20px' }}>
                  <label className={'uk-form-label'}>Họ Tên</label>
                  <input
                    type='text'
                    className={'md-input'}
                    value={this.fullname}
                    onChange={e => this.onInputChanged(e, 'fullname')}
                    data-validation={'length'}
                    data-validation-length={'min1'}
                    data-validation-error-msg={'Họ tên phải chứa ít nhất 1 ký tự.'}
                  />
                </div>
                <div className='uk-float-left uk-width-1-2'>
                  <label className={'uk-form-label'}>Chức Vụ</label>
                  <input
                    type='text'
                    className={'md-input'}
                    value={this.title}
                    onChange={e => this.onInputChanged(e, 'title')}
                  />
                </div>
              </div>
              <div className='uk-margin-medium-bottom uk-clearfix'>
                <div className='uk-float-left' style={{ width: '50%', paddingRight: '20px' }}>
                  <label className={'uk-form-label'}>Mật Khẩu</label>
                  <input
                    type='password'
                    className={'md-input'}
                    name={'password_confirmation'}
                    value={this.password}
                    onChange={e => this.onInputChanged(e, 'password')}
                  />
                </div>
                <div className='uk-float-left uk-width-1-2'>
                  <label className={'uk-form-label'}>Xác Nhận Mật Khẩu</label>
                  <input
                    type='password'
                    className={'md-input'}
                    name={'password'}
                    value={this.passwordConfirm}
                    onChange={e => this.onInputChanged(e, 'passwordConfirm')}
                    data-validation='confirmation'
                    data-validation-error-msg={'Mật khẩu không khớp'}
                  />
                </div>
              </div>
              <div className='uk-margin-medium-bottom'>
                <label className='uk-form-label'>Email</label>
                <input
                  type='email'
                  className={'md-input'}
                  value={this.email}
                  onChange={e => this.onInputChanged(e, 'email')}
                  data-validation='email'
                />
              </div>
              <div className='uk-margin-medium-bottom'>
                <label className={'uk-form-label'}>Vai Trò</label>
                <SingleSelect
                  items={roles}
                  width={'100'}
                  showTextbox={false}
                  onSelectChange={e => this.onRoleSelectChange(e)}
                />
                <span
                  className='hide help-block'
                  style={{ display: 'inline-block', marginTop: '10px', fontWeight: 'bold', color: '#d85030' }}
                  ref={r => (this.roleSelectErrorMessage = r)}
                >
                  Vui lòng chọn vai trò cho người dùng này
                </span>
              </div>
              {!this.isAgentRole && (
                <div>
                  <div className='uk-margin-medium-bottom'>
                    <label className='uk-form-label'>Nhóm</label>
                    <MultiSelect
                      items={groups}
                      onChange={e => this.onGroupSelectChange(e)}
                      ref={r => (this.groupSelect = r)}
                    />
                    <span
                      className={'hide help-block'}
                      style={{ display: 'inline-block', marginTop: '3px', fontWeight: 'bold', color: '#d85030' }}
                      ref={r => (this.groupSelectErrorMessage = r)}
                    >
                      Vui lòng chọn một nhóm cho người dùng này.
                    </span>
                  </div>
                </div>
              )}
              {this.isAgentRole && (
                <div>
                  <div className='uk-margin-medium-bottom'>
                    <label className='uk-form-label'>Nhóm</label>
                    <MultiSelect items={teams} onChange={() => { }} ref={r => (this.teamSelect = r)} />
                  </div>
                </div>
              )}
              <div className='uk-modal-footer uk-text-right'>
                <Button text={'Đóng'} flat={true} waves={true} extraClass={'uk-modal-close'} />
                <Button text={'Tạo Tài Khoản'} flat={true} waves={true} style={'success'} type={'submit'} />
              </div>
            </form>
          </div>
        </div>
      </BaseModal>
    )
  }
}

CreateAccountModal.propTypes = {
  common: PropTypes.object.isRequired,
  groups: PropTypes.object.isRequired,
  teams: PropTypes.object.isRequired,
  roles: PropTypes.object.isRequired,
  createAccount: PropTypes.func.isRequired,
  fetchGroups: PropTypes.func.isRequired,
  unloadGroups: PropTypes.func.isRequired,
  fetchTeams: PropTypes.func.isRequired,
  unloadTeams: PropTypes.func.isRequired,
  fetchRoles: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  roles: state.shared.roles,
  common: state.common,
  groups: state.groupsState.groups,
  teams: state.teamsState.teams
})

export default connect(mapStateToProps, {
  createAccount,
  fetchGroups,
  unloadGroups,
  fetchTeams,
  unloadTeams,
  fetchRoles
})(CreateAccountModal)
