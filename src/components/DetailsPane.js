import { useState } from 'react';
import { useSelector } from 'react-redux';

import { submitTime } from '../utils/utils';

import '../assets/css/DetailsPane.scss';

function DetailsPane({
  isHidden,
  jobSelected
}) {
  let className = "details-pane";
  className += isHidden ? " hidden" : "";

  const [showMetaData, setShowMetaData] = useState(false);
  const graphData = useSelector((state) => state.global.graphData);
  const arrayData = useSelector((state) => state.global.arrayData);
  const taskData = useSelector((state) => state.global.taskData);
  let jobID = null;
  let graphID = null, arrayID = null, taskID = null;
  if (jobSelected) {
    jobID = jobSelected.toString().split('.');
  }
  if (jobID) {
    graphID = jobID.length >= 1 ? jobID[0] : null;
    arrayID = jobID.length >= 2 ? jobID[1] : null;
    taskID = jobID.length >= 3 ? jobID[2] : null;
  }

  let selectedGraphData = graphData.filter((data) => data.did === Number(graphID));
  let selectedArrayData, selectedTaskData;
  if (arrayID) {
    selectedArrayData = arrayData[Number(graphID)].filter((data) => data.aid === Number(arrayID));
    if (taskID) {
      selectedTaskData = taskData[Number(graphID)][Number(arrayID)].filter((data) => data.tid === Number(taskID));
    }
  }
  console.log(selectedGraphData);
  
  return (
    <div className={className}>
      <div className='Details'>
        {jobSelected === '' &&
        <span>Select job to view details</span>}
        {jobSelected !== '' &&
        <>
          <p className='Details-No-Margin'>
            Job ID:&nbsp;
            <span className='Details-Light'>{jobSelected}</span>
          </p>
          <p className='Details-Title'>{selectedGraphData[0].title}</p>
          <div className='Details-Row'>
            <p className='Details-Header'>{selectedGraphData[0].icoda_username}</p>
            <p className='Details-Right'>{submitTime(selectedGraphData[0]._submittime)}</p>
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
              <p className='Details-Light'>{selectedGraphData[0].depend}</p>
            </div>
            <div className='Details-Row'>
              <p className='Details-Header'>_arraydone</p>
              <p className='Details-Light'>{selectedGraphData[0]._done}</p>
            </div>
            <div className='Details-Row'>
              <p className='Details-Header'>_arrayexit</p>
              <p className='Details-Light'>{selectedGraphData[0]._exit}</p>
            </div>
            <div className='Details-Row'>
              <p className='Details-Header'>_arraykilled</p>
              <p className='Details-Light'>{selectedGraphData[0]._killed}</p>
            </div>
            <div className='Details-Row'>
              <p className='Details-Header'>_arrayqueued</p>
              <p className='Details-Light'>{selectedGraphData[0]._queued}</p>
            </div>
            <div className='Details-Row'>
              <p className='Details-Header'>_arrayrunning</p>
              <p className='Details-Light'>{selectedGraphData[0]._running}</p>
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
        </>}
      </div>
    </div>
  )
}

export default DetailsPane;
