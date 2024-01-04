import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchGroups } from 'actions/groups'
import { generateReport } from 'actions/reports'

import Grid from 'components/Grid'
import GridItem from 'components/Grid/GridItem'
import TruCard from 'components/TruCard'
import Button from 'components/Button'
import DatePicker from 'components/DatePicker'
import SingleSelect from 'components/SingleSelect'

import moment from 'moment-timezone'
import helpers from 'lib/helpers'

const ReportTicketByGroups = () => {
  const groupsState = useSelector(state => state.groupsState)
  const dispatch = useDispatch()

  const [groups, setGroups] = useState([])

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedGroups, setSelectedGroups] = useState([])

  useEffect(() => {
    helpers.UI.inputs()
    helpers.formvalidator()

    dispatch(fetchGroups())

    setStartDate(
      moment()
        .utc(true)
        .subtract(30, 'days')
        .format(helpers.getShortDateFormat())
    )

    setEndDate(
      moment()
        .utc(true)
        .format(helpers.getShortDateFormat())
    )
  }, [])

  useEffect(() => {
    helpers.UI.reRenderInputs()
  }, [startDate, endDate])

  useEffect(() => {
    const g = groupsState.groups.map(group => ({ text: group.get('name'), value: group.get('_id') })).toArray()
    setGroups(g)
  }, [groupsState])

  const onFormSubmit = e => {
    e.preventDefault()
    dispatch(
      generateReport({
        type: 'tickets_by_group',
        filename: `report_tickets_by_group__${moment(startDate).format('MMDDYYYY')}`,
        startDate,
        endDate,
        groups: selectedGroups
      })
    )
  }

  return (
    <div>
      <TruCard
        hover={false}
        header={
          <div style={{ padding: '10px 15px' }}>
            <h4 style={{ width: '100%', textAlign: 'left', fontSize: '14px', margin: 0 }}>Ticket theo Nhóm</h4>
          </div>
        }
        extraContentClass={'nopadding'}
        content={
          <div>
            <p className='padding-15 nomargin uk-text-muted'>
              Vui lòng chọn ngày bắt đầu và ngày kết thúc cũng như những nhóm muốn bao gồm trong báo cáo.
            </p>
            <hr className='uk-margin-large-bottom' style={{ marginTop: 0 }} />
            <div className={'padding-15'}>
              <form onSubmit={e => onFormSubmit(e)}>
                <Grid>
                  <GridItem width={'1-2'}>
                    <label htmlFor='filterDate_Start' className={'uk-form-label nopadding nomargin'}>
                      Ngày bắt đầu
                    </label>
                    <DatePicker
                      name={'filterDate_start'}
                      format={helpers.getShortDateFormat()}
                      onChange={e => {
                        setStartDate(e.target.value)
                      }}
                      value={startDate}
                    />
                  </GridItem>
                  <GridItem width={'1-2'}>
                    <label htmlFor='filterDate_End' className={'uk-form-label nopadding nomargin'}>
                      Ngày kết thúc
                    </label>
                    <DatePicker
                      name={'filterDate_End'}
                      format={helpers.getShortDateFormat()}
                      onChange={e => {
                        setEndDate(e.target.value)
                      }}
                      value={endDate}
                    />
                  </GridItem>
                  <GridItem width={'1-1'}>
                    <div className='uk-margin-medium-top uk-margin-medium-bottom'>
                      <label htmlFor='groups' className={'uk-form-label'}>
                        Nhóm
                      </label>
                      <SingleSelect
                        multiple={true}
                        items={groups}
                        value={selectedGroups}
                        onSelectChange={(e, value) => {
                          setSelectedGroups(value)
                        }}
                      />
                    </div>
                    <div>
                      <Button text={'Tạo báo cáo'} type={'submit'} style={'primary'} waves={true} small={true} />
                    </div>
                  </GridItem>
                </Grid>
              </form>
            </div>
          </div>
        }
      />
    </div>

  )
}

export default ReportTicketByGroups
