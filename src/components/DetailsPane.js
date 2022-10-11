import { useState } from 'react';

import '../assets/css/DetailsPane.scss';

function DetailsPane({
  isHidden,
  jobSelected
}) {
  let className = "details-pane";
  className += isHidden ? " hidden" : "";

  const [showMetaData, setShowMetaData] = useState(false);
  
  return (
    <div className={className}>
      <div className='Details'>
        {/* <span>Select job to view details</span> */}
        <p className='Details-No-Margin'>
          Job ID:&nbsp;
          <span className='Details-Light'>{jobSelected}</span>
        </p>
        <p className='Details-Title'>sleep 100</p>
        <div className='Details-Row'>
          <p className='Details-Header'>gwhitted</p>
          <p className='Details-Right'>5:44 pm</p>
        </div>
        <div className='Details-Row'>
          <p className='Details-Header'>Frames</p>
          <p className='Details-Dark'>No available frames</p>
        </div>
        <div className='Details-Row'>
          <p className='Details-Header'>Status</p>
        </div>
        <div className='Details-Row'>
          <p className='Details-Header'>
            Memory&nbsp;
            <span className='Details-Dark'>(MB)</span>
          </p>
          <p className='Details-Light'>
            500&nbsp;
            <span className='Details-Dark'>reserved</span>
          </p>
        </div>
        <div className='Details-Row'>
          <p className='Details-Header'>Elapsed Time</p>
          <p className='Details-Light'>1m</p>
        </div>
        <div className='Details-Row'>
          <p className='Details-Header'>Priority</p>
          <p className='Details-Light'>1000</p>
        </div>
        {showMetaData &&
        <>
          <div className='Details-Row'>
            <p className='Details-Header'>_active</p>
            <p className='Details-Light'>true</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arraydepend</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arraydone</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arrayexit</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arraykilled</p>
            <p className='Details-Light'>1</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arrayqueued</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arrayrunning</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_arraysuspended</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_depend</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_dgraphendtime</p>
            <p className='Details-Light'>0</p>
          </div>
          <div className='Details-Row'>
            <p className='Details-Header'>_dgraphstatus</p>
            <p className='Details-Light'>0</p>
          </div>
        </>}
        <div
          className='Details-Show-Metadata'
          onClick={() => {
            setShowMetaData(!showMetaData);
          }}
        >
          Show All Metadata
        </div>
      </div>
    </div>
  )
}

export default DetailsPane;
