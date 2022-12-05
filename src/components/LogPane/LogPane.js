import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import ElasticSearchService from "../../services/ElasticSearch.service";

function LogPane({
}) {
  const selectedTaskData = useSelector((state) => state.job.taskSelected);

  const [count, setCount] = useState(0);
  const [logJSON, setLogJSON] = useState();
  const [hasError, setHasError] = useState(false);
  const [errorStepOffset, setErrorStepOffset] = useState('');
  const shared_error_step_offset = useSelector((state) => state.global.shared_error_step_offset);


  useEffect(() => {
    if (Object.keys(selectedTaskData).length !== 0) {
      setErrorStepOffset(shared_error_step_offset);
      getLogHtml(selectedTaskData.did, selectedTaskData.aid, selectedTaskData.tid);
    }
  }, [selectedTaskData]);

  const getLogHtml = (dgraphId, arrayId, taskId) => {
    ElasticSearchService.getLogHtml(dgraphId, arrayId, taskId)
      .then((logJSON) => {
        console.log(logJSON);
        // If anything is selected, stop automatic reload
        if (!window.getSelection().toString()) {
          this.logJSON = this.sanitizer.bypassSecurityTrustHtml(logJSON.replace(/<style.*?>[\S\s]*<\/style>/g, ''));
        }
        setHasError(false);
      })
      .catch((logJSON) => {
        // setLogJSON("The log file has not been created yet.  Please check back later.");
        // setHasError(true);
        console.log(logJSON);
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
    <div id="error-log-wrapper">
      {Object.keys(selectedTaskData).length === 0 && <div className="log-pane">
        Select a task to view log file
      </div>}

      {Object.keys(selectedTaskData).length !== 0 && <div className="error-log">
        {!logJSON && <div className="loading-div"> Loading error log for {selectedTaskData.did}.{selectedTaskData.aid}.{selectedTaskData.tid}...
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
      </div>}
    </div>
  )
}

export default LogPane;