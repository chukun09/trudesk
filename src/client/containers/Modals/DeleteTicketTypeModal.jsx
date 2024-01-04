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
 *  Updated:    2/4/19 1:44 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { deleteTicketType } from 'actions/tickets'
import BaseModal from './BaseModal'
import Button from 'components/Button'
import SingleSelect from 'components/SingleSelect'

import helpers from 'lib/helpers'

class DeleteTicketTypeModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedType: ''
    }
  }

  getTicketTypes() {
    return this.props.settings && this.props.settings.get('ticketTypes')
      ? this.props.settings.get('ticketTypes').toArray()
      : []
  }

  onSelectChanged(e) {
    this.setState({
      selectedType: e.target.value
    })
  }

  onFormSubmit(e) {
    e.preventDefault()
    if (!this.state.selectedType) {
      helpers.UI.showSnackbar('Không thể nhận loại ticket mới. Đang hủy...', true)
      return true
    }

    this.props.deleteTicketType(this.props.type.get('_id'), this.state.selectedType)
  }

  render() {
    const { type } = this.props
    const mappedTypes = this.getTicketTypes()
      .filter(obj => {
        return type.get('name') !== obj.get('name')
      })
      .map(item => {
        return { text: item.get('name'), value: item.get('_id') }
      })
    return (
      <BaseModal {...this.props} options={{ bgclose: false }}>
        <form className={'uk-form-stacked'} onSubmit={e => this.onFormSubmit(e)}>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <h2>Xóa Loại Ticket</h2>
            <span>
              Vui lòng chọn loại ticket mà bạn muốn gán lại cho các ticket khác để xóa loại ticket này.
            </span>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <div className='uk-float-left' style={{ width: '100%' }}>
              <label className={'uk-form-label nopadding nomargin'}>Loại</label>
              <SingleSelect
                showTextbox={false}
                items={mappedTypes}
                onSelectChange={e => this.onSelectChanged(e)}
                value={this.state.selectedType}
              />
            </div>
          </div>
          <div className='uk-margin-medium-bottom uk-clearfix'>
            <span className='uk-text-danger'>
              CẢNH BÁO: Thao tác này sẽ thay đổi tất cả các ticket có loại <strong>{type.get('name')}</strong> thành loại ticket đã chọn.
              <br />
              <strong>Thao tác này không thể hoàn tác!</strong>
            </span>
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Hủy'} flat={true} waves={true} extraClass={'uk-modal-close'} />
            <Button text={'Xóa'} style={'danger'} flat={true} type={'submit'} />
          </div>
        </form>
      </BaseModal>

    )
  }
}

DeleteTicketTypeModal.propTypes = {
  type: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  deleteTicketType: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(
  mapStateToProps,
  { deleteTicketType }
)(DeleteTicketTypeModal)
