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
 *  Updated:    2/6/19 12:30 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import BaseModal from './BaseModal'
import Button from 'components/Button'

import { createTag } from 'actions/tickets'

class CreateTagModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      name: ''
    }
  }

  onNameChange(e) {
    this.setState({
      name: e.target.value
    })
  }

  onSubmit(e) {
    e.preventDefault()
    if (this.props.page === 'settings')
      return this.props.createTag({ name: this.state.name, currentPage: this.props.currentPage })

    this.props.createTag({ name: this.state.name })
  }

  render() {
    return (
      <BaseModal>
        <form className='uk-form-stacked' onSubmit={e => this.onSubmit(e)}>
          <div>
            <h2 className={'nomargin mb-5'}>Tạo Tags</h2>
            <p className='uk-text-muted'>Tags phân loại các yêu cầu, giúp dễ dàng xác định vấn đề</p>

            <label>Tên Tags</label>
            <input
              type='text'
              className={'md-input'}
              name={'name'}
              data-validation='length'
              data-validation-length='min2'
              data-validation-error-msg='Vui lòng nhập tên Tags hợp lệ. Tên Tags phải chứa ít nhất 2 ký tự.'
              value={this.state.name}
              onChange={e => this.onNameChange(e)}
            />
          </div>
          <div className='uk-modal-footer uk-text-right'>
            <Button text={'Đóng'} extraClass={'uk-modal-close'} flat={true} waves={true} />
            <Button text={'Tạo'} type={'submit'} flat={true} waves={true} style={'success'} />
          </div>
        </form>
      </BaseModal>

    )
  }
}

CreateTagModal.propTypes = {
  createTag: PropTypes.func.isRequired,
  page: PropTypes.string,
  currentPage: PropTypes.number
}

export default connect(
  null,
  { createTag }
)(CreateTagModal)
