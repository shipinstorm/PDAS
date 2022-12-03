import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ElasticSearchService from "../services/ElasticSearch.service";

function LogPane({
  jobSelected, viewDetails
}) {
  let className = "log-pane";
  className += viewDetails ? "" : " full-width";

  const [count, setCount] = useState(0);
  const [logJSON, setLogJSON] = useState();
  const [selectedTaskData, setSelectedTaskData] = useState({});
  const [hasError, setHasError] = useState(false);
  const [errorStepOffset, setErrorStepOffset] = useState('');
  const shared_error_step_offset = useSelector((state) => state.global.shared_error_step_offset);
  const taskData = useSelector((state) => state.global.taskData);

  useEffect(() => {
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

    let tmp = null;
    if (taskID) {
      tmp = (taskData[Number(graphID)] && taskData[Number(graphID)][Number(arrayID)]) ? taskData[Number(graphID)][Number(arrayID)].filter((data) => data.tid === Number(taskID)) : [{}];
      setSelectedTaskData(tmp[0]);
    } else {
      setSelectedTaskData({});
    }
  }, [taskData, jobSelected]);

  useEffect(() => {
    setErrorStepOffset(shared_error_step_offset);
    getLogHtml(selectedTaskData.did, selectedTaskData.aid, selectedTaskData.tid);
  }, [selectedTaskData]);

  const getLogHtml = (dgraphId, arrayId, taskId) => {
    ElasticSearchService.getLogHtml(dgraphId, arrayId, taskId)
      .then((logJSON) => {
        // If anything is selected, stop automatic reload
        if (!window.getSelection().toString()) {
          this.logJSON = this.sanitizer.bypassSecurityTrustHtml(logJSON.replace(/<style.*?>[\S\s]*<\/style>/g, ''));
        }
        setHasError(false);
      })
      .catch(() => {
        setLogJSON("The log file has not been created yet.  Please check back later.");
        setHasError(true);
      }
      );
  }

  const onClickNext = () => {
    var errorNum = [].slice.call(document.querySelectorAll('[id^=error]')).splice(1).length - 1;
    if (count < errorNum) {
      setCount(count + 1);
    }
    else {
      setCount(1);
    }
    document.getElementById('error' + count).scrollIntoView({ behavior: "smooth" });
  }

  const onClickPrev = () => {
    var errorNum = [].slice.call(document.querySelectorAll('[id^=error]')).splice(1).length - 1;

    if (count > 1) {
      setCount(count - 1);
    }
    else {
      setCount(errorNum);
    }
    document.getElementById('error' + count).scrollIntoView({ behavior: "smooth" });
  }

  const onClickRefresh = (selectedTaskData) => {
    setHasError(false);
    setLogJSON(null);
    setErrorStepOffset(shared_error_step_offset);
    getLogHtml(selectedTaskData.did, selectedTaskData.aid, selectedTaskData.tid);
  }

  return (
    <div>
      <div className={className}>
        Select a task to view log file
      </div>

      <div className="error-log">
        {logJSON && <div className="loading-div"> Loading error log for {selectedTaskData.did}.{selectedTaskData.aid}.{selectedTaskData.tid}...
          <br />
          <br />
          <img src="images/spinner_dark.gif" />
        </div>}
        {logJSON && <div>
          <div id="error-step" className="btn-group pull-right" role="group" aria-label="...">
            <button id="clickRefresh" onClick={() => onClickRefresh(selectedTaskData)} className="btn btn-primary btn-xs" type="button" value="Refresh Log">
              <span className="glyphicon glyphicon-refresh" aria-hidden="true"></span>
              Refresh Log
            </button>
            {hasError && <button id="clickPrev" onClick={() => onClickPrev()} className="btn btn-primary btn-xs" type="submit" value="Prev Error">
              <span className="glyphicon glyphicon-triangle-left" aria-hidden="true"></span>
              Prev Error
            </button>}
            {hasError && <button id="clickNext" onClick={() => onClickNext()} className="btn btn-primary btn-xs" type="submit" value="Next Error">
              Next Error
              <span className="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>
            </button>}
          </div>
          <div>{logJSON}</div>
        </div>}
      </div>
    </div >
  )
}

export default LogPane;