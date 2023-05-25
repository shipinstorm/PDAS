import { useEffect, useState } from "react";

import StatusBar from "./StatusBar";
import { DGRAPH_STATUS_CODES } from "./StatusCodes";

import IconKilled from "../../../assets/images/icon-killed.svg";
import IconExited from "../../../assets/images/icon-exited.svg";
import IconRun from "../../../assets/images/icon-run.svg";
import IconDependent from "../../../assets/images/icon-dependent.svg";
import IconQueued from "../../../assets/images/icon-queued.svg";
import IconDone from "../../../assets/images/icon-done.svg";

export default function GraphStatus({ selectedGraphData }) {
  const [selected, setSelected] = useState();
  const [pending, setPending] = useState();
  const [isSpeculative, setIsSpeculative] = useState();
  const [statuses, setStatuses] = useState([
    { name: "done", mapping: "_done", percent: 0, statusClass: "done" },
    {
      name: "running",
      mapping: "_running",
      percent: 0,
      statusClass: "running",
    },
    { name: "exited", mapping: "_exit", percent: 0, statusClass: "exited" },
    {
      name: "sys killed",
      mapping: "_syskill",
      percent: 0,
      statusClass: "sys-killed",
    },
    {
      name: "in queue",
      mapping: "_queued",
      percent: 0,
      statusClass: "in-queue",
    },
    {
      name: "dependent",
      mapping: "_depend",
      percent: 0,
      statusClass: "dependent",
    },
    {
      name: "paused",
      mapping: "_suspended",
      percent: 0,
      statusClass: "paused",
    },
    { name: "killed", mapping: "_userkill", percent: 0, statusClass: "killed" },
  ]);
  const [status, setStatus] = useState("");
  const [statusClass, setStatusClass] = useState("");
  const [donePercent, setDonePercent] = useState(0);
  const [numDone, setNumDone] = useState(0);
  const [numRun, setNumRun] = useState(0);
  const [numError, setNumError] = useState(0);
  const [numWait, setNumWait] = useState(0);
  const [numKill, setNumKill] = useState(0);

  useEffect(() => {
    setStatusPercents();
  }, [selectedGraphData]);

  const setStatusPercents = () => {
    let total = 0;
    setDonePercent(0);
    setNumDone(0);
    setNumRun(0);
    setNumError(0);
    setNumWait(0);
    setNumKill(0);
    for (var status of statuses) {
      total += parseInt(selectedGraphData[status.mapping]);
    }
    if (total > 0) {
      for (var status of statuses) {
        status.percent =
          (parseInt(selectedGraphData[status.mapping]) / total) * 100;
        if (status.percent > 0 && status.percent < 1) {
          status.percent = 1;
        } else {
          status.percent = Math.round(status.percent);
        }
        if (status.name === "done") {
          setDonePercent(status.percent);
        }
        setHoverTextCount(status);
      }
      setStatuses(statuses);
      checkForHundredPercent();
    }
    setStatusAndColor();
  };

  const setStatusAndColor = () => {
    if (DGRAPH_STATUS_CODES[selectedGraphData._statusname]) {
      setStatus(DGRAPH_STATUS_CODES[selectedGraphData._statusname].name);
      setStatusClass(
        DGRAPH_STATUS_CODES[selectedGraphData._statusname].statusClass
      );
    }
  };

  const setHoverTextCount = (status) => {
    switch (status.name) {
      case "done":
        setNumDone(numDone + parseInt(selectedGraphData[status.mapping]));
        break;
      case "running":
        setNumRun(numRun + parseInt(selectedGraphData[status.mapping]));
        break;
      case "exited":
        setNumError(numError + parseInt(selectedGraphData[status.mapping]));
        break;
      case "sys killed":
        setNumError(numError + parseInt(selectedGraphData[status.mapping]));
        break;
      case "killed":
        setNumKill(numKill + parseInt(selectedGraphData[status.mapping]));
        break;
      // Don't add depend count because it's already counted with queued (case default)
      case "dependent":
        break;
      default:
        setNumWait(numWait + parseInt(selectedGraphData[status.mapping]));
    }
  };

  const checkForHundredPercent = () => {
    let total = 0;
    for (var status of statuses) {
      total += status.percent;
    }
    if (total > 100 || total < 100) {
      let max = 0;
      let statusToAdjust;
      let newPercent = 0;
      for (var status of statuses) {
        if (status.percent > max) {
          max = status.percent;
          statusToAdjust = status;
          if (total > 100) {
            let difference = total - 100;
            newPercent = status.percent - difference;
          } else {
            let difference = 100 - total;
            newPercent = status.percent + difference;
          }
        }
      }
      statusToAdjust.percent = newPercent;
    }
  };

  return (
    <>
      {!pending && (
        // <div *ngIf="!pending" class="row status-numbers-text" [class.status-killed]="numKill>0" [style.display]="selected ? 'table' : ''" [hidden]="!hoverTextShow">
        <div
          className={
            numKill > 0
              ? "row status-numbers-text status-killed"
              : "row status-numbers-text"
          }
          style={
            selected
              ? {
                  display: "table",
                }
              : {}
          }
        >
          {/* this is to make hover text centered on status bar */}
          <div className="status-text text-right crop-long-text"></div>
          <span className="text-overflow-center">
            {numDone > 0 && <span className="status-done">{numDone} done</span>}
            {numRun > 0 && (
              <span className="status-run">
                {numDone > 0 && <span className="slash">/</span>}
                {numRun} run
              </span>
            )}
            {numError > 0 && (
              <span className="status-error">
                {(numDone > 0 || numRun > 0) && (
                  <span className="slash">/ </span>
                )}
                {numError} error
              </span>
            )}
            {numWait > 0 && (
              <span className="status-wait">
                {(numDone > 0 || numRun > 0 || numError > 0) && (
                  <span className="slash">/ </span>
                )}
                {numWait} wait
              </span>
            )}
            {numKill > 0 && (
              <span className="status-kill">
                {(numDone > 0 || numRun > 0 || numError > 0 || numWait > 0) && (
                  <span className="slash">/ </span>
                )}
                {numKill} kill
              </span>
            )}
          </span>
        </div>
      )}

      {!pending && (
        <div className={"row status-" + statusClass}>
          <div className="status-text text-center crop-long-text">
            {status === "killed" && (
              <img alt="" src={IconKilled} className="status-icon" />
            )}
            {status === "exited" && (
              <img alt="" src={IconExited} className="status-icon" />
            )}
            {status === "running" && (
              <img alt="" src={IconRun} className="status-icon" />
            )}
            {status === "dependent" && (
              <img alt="" src={IconDependent} className="status-icon" />
            )}
            {status === "in queue" && (
              <img alt="" src={IconQueued} className="status-icon" />
            )}
            {status === "done" && (
              <img alt="" src={IconDone} className="status-icon" />
            )}
            {/* {status} */}
            <span
              title="Running Speculatively"
              className={
                !isSpeculative || status != "running" ? "not-speculative" : ""
              }
            >
              (S)
            </span>
          </div>
          <StatusBar
            statuses={statuses}
            // onMouseEnter={() => {hoverTextShow=true}}
            // onMouseLeave={() => {hoverTextShow=false}}
          />
          {/* <div className="done-percentage text-left crop-long-text"> {donePercent}%</div> */}
        </div>
      )}
      {pending && (
        <div className="row">
          <div className="status-bar-div">{pending}</div>
        </div>
      )}
    </>
  );
}
