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
 *  Updated:    2/5/19 12:26 AM
 *  Copyright (c) 2014-2019. All rights reserved.
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import BaseModal from './BaseModal'
import SingleSelect from 'components/SingleSelect'
import Button from 'components/Button'

import { deletePriority } from 'actions/tickets'

import helpers from 'lib/helpers'

class DeletePriorityModal extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedPriority: ''
    }
  }

  onSubmit(e) {
    e.preventDefault()
    if (!this.state.selectedPriority) {
      helpers.UI.showSnackbar('Không thể nhận được ưu tiên mới. Đang hủy...', true)
      return true
    }

    this.props.deletePriority({ id: this.props.priority.get('_id'), newPriority: this.state.selectedPriority })
  }

  getPriorities() {
    return this.props.settings && this.props.settings.get('priorities')
      ? this.props.settings.get('priorities').toArray()
      : []
  }

  onSelectChanged(e) {
    this.setState({
      selectedPriority: e.target.value
    })
  }

  render() {
    const { priority } = this.props
    const mappedPriorities = this.getPriorities()
      .filter(obj => {
        return priority.get('name') !== obj.get('name')
      })
      .map(p => {
        return { text: p.get('name'), value: p.get('_id') }
      })
    return (
      <BaseModal>
        <div>
          <form onSubmit={e => this.onSubmit(e)}>
            <div className='uk-margin-medium-bottom uk-clearfix'>
              <h2>Xóa Mức Ưu Tiên</h2>
              <span>Vui lòng chọn mức ưu tiên mà bạn muốn chuyển các yêu cầu khác để xóa mức ưu tiên này</span>
              <hr style={{ margin: '10px 0' }} />
            </div>
            <div className='uk-margin-medium-bottom uk-clearfix'>
              <div className='uk-float-left' style={{ width: '100%' }}>
                <label className={'uk-form-label'}>Mức Ưu Tiên</label>
                <SingleSelect
                  items={mappedPriorities}
                  showTextbox={false}
                  width={'100%'}
                  value={this.state.selectedPriority}
                  onSelectChange={e => this.onSelectChanged(e)}
                />
              </div>
            </div>
            <div className='uk-margin-medium-bottom uk-clearfix'>
              <span className='uk-text-danger'>
                CẢNH BÁO: Thao tác này sẽ thay đổi tất cả các yêu cầu có mức ưu tiên: <strong>{priority.get('name')}</strong> thành mức ưu tiên được chọn ở trên.
              </span>
            </div>
            <div className='uk-modal-footer uk-text-right'>
              <Button type={'button'} flat={true} waves={true} text={'Hủy'} extraClass={'uk-modal-close'} />
              <Button type={'submit'} flat={true} waves={true} text={'Xóa'} style={'danger'} />
            </div>
          </form>
        </div>
      </BaseModal>

    )
  }
}

DeletePriorityModal.propTypes = {
  priority: PropTypes.object.isRequired,
  settings: PropTypes.object.isRequired,
  deletePriority: PropTypes.func.isRequired
}

const mapStateToProps = state => ({
  settings: state.settings.settings
})

export default connect(
  mapStateToProps,
  { deletePriority }
)(DeletePriorityModal)
