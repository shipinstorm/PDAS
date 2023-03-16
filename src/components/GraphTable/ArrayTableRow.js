import { useDispatch, useSelector } from "react-redux";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";

import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import IconKilled from "../../assets/images/icon-killed.svg";
import IconExited from "../../assets/images/icon-exited.svg";
import IconRun from "../../assets/images/icon-run.svg";
import IconDependent from "../../assets/images/icon-dependent.svg";
import IconQueued from "../../assets/images/icon-queued.svg";
import IconDone from "../../assets/images/icon-done.svg";
import originStatuses from "../../assets/data/statuses.json";

import ElasticSearchService from "../../services/ElasticSearch.service";

import { globalImagePaths } from "../../store/actions/globalAction";
import { jobJobSelectedId, jobJobExpanded } from "../../store/actions/jobAction";

import { elapsedTime, setStatusPercents } from "../../utils/utils";

import TaskTableRow from "./TaskTableRow";

const ExpandableTableRow = ({
  key,
  children,
  expandComponent,
  isSelected,
  isExpanded,
  childArrayText,
  expandArrayRow,
  ...otherProps
}) => {
  return (
    <>
      <TableRow {...otherProps}>
        <TableCell
          padding="checkbox"
          sx={
            isSelected
              ? {
                  background: "#383838 !important",
                  "& .MuiButtonBase-root": {
                    color: "#848285 !important",
                  },
                }
              : {
                  "& .MuiButtonBase-root": {
                    color: "#848285 !important",
                  },
                }
          }
        >
          <IconButton
            onClick={(event) => {
              event.preventDefault();
              expandArrayRow(childArrayText);
            }}
          >
            {isExpanded ? (
              <KeyboardArrowDownIcon />
            ) : (
              <KeyboardArrowRightIcon />
            )}
          </IconButton>
        </TableCell>
        {children}
      </TableRow>
      {isExpanded && expandComponent}
    </>
  );
};

export default function ArrayTableRow({
  searchArrayData,
  searchTaskData,
  did,
  columnOrder,
}) {
  const dispatch = useDispatch();
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const graphData = useSelector((state) => state.global.graphData);
  const arrayData = useSelector((state) => state.global.arrayData);
  const jobSelectedId = useSelector((state) => state.job.jobSelectedId);
  const jobExpanded = useSelector((state) => state.job.jobExpanded);

  const expandArrayRow = async (childArrayText) => {
    let jobID = childArrayText.toString().split(".");

    /**
     * Update jobExpanded Array
     * Case 1: Remove childArrayText if it exists
     * Case 1: Add related elements with same jobID[0](same graphData)
     * Case 2: Add childArrayText if it doesn't exist
     * Case 2: Remove related elements with same jobID[0](same graphData)
     */
    const index = jobExpanded.indexOf(childArrayText);
    if (index > -1) {
      jobExpanded.splice(index, 1);
      dispatch(jobJobExpanded([...jobExpanded, jobID[0]]));
    } else {
      dispatch(jobJobExpanded([...jobExpanded.filter((job) => !job.includes(jobID[0])), childArrayText.toString()]))
    }
  };

  const selectArrayRow = (childArrayText) => {
    let jobID = childArrayText.toString().split(".");
    imagePaths[jobID[0] + "." + jobID[1]] = ElasticSearchService.playImages(jobID[0], jobID[1]);
    dispatch(globalImagePaths(imagePaths));

    /**
     * Update jobSelectedId Array
     * Remove childArrayText if it exists
     * Remove related elements with same jobID[0](same graphData)
     * Add childArrayText if it doesn't exist
     */
    const index = jobSelectedId.indexOf(childArrayText);
    if (index > -1) {
      jobSelectedId.splice(index, 1);
      dispatch(jobJobSelectedId(jobSelectedId.filter((job) => !job.includes(jobID[0]))));
    } else {
      dispatch(jobJobSelectedId([...jobSelectedId.filter((job) => !job.includes(jobID[0])), childArrayText.toString()]));
    }
  }

  return searchArrayData.map((arrayRow) => {
    let tmp;
    const childArrayText = `${did}.${arrayRow.aid}`;
    const isSelected = jobSelectedId.includes(childArrayText);
    const isExpanded = jobExpanded.includes(childArrayText);
    tmp = graphData.filter((data) => data.did === Number(did));
    const selectedGraphData = tmp[0] ? tmp[0] : {};
    tmp = arrayData[Number(did)]
      ? arrayData[Number(did)].filter(
          (data) => data.aid === Number(arrayRow.aid)
        )
      : [{}];
    const selectedArrayData = tmp[0] ? tmp[0] : {};
    const selectedTaskData = {};
    const tmpArray1 = [
      { name: "" },
      { name: childArrayText },
      { name: "" },
      { name: "" },
      { name: "" },
      {
        name: elapsedTime(
          selectedGraphData,
          selectedArrayData,
          selectedTaskData
        ),
      },
      { name: "" },
      { name: "" },
    ];

    let [statuses, status] = setStatusPercents(originStatuses, arrayData, 1);

    return (
      <ExpandableTableRow
        key={childArrayText}
        expandComponent={
          <TaskTableRow
            searchTaskData={searchTaskData}
            arrayRow={arrayRow}
            childArrayText={childArrayText}
            columnOrder={columnOrder}
          />
        }
        sx={{ cursor: "pointer" }}
        onClick={() => selectArrayRow(childArrayText)}
        isSelected={isSelected}
        isExpanded={isExpanded}
        childArrayText={childArrayText}
        expandArrayRow={expandArrayRow}
      >
        {[...Array(8)].map((value, index) => {
          return (
            <TableCell
              key={index}
              sx={
                isSelected
                  ? { background: "#383838 !important" }
                  : { background: "#282828 !important" }
              }
            >
              {columnOrder[index] === 3 && (
                <div className="statusContent">
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
                  {status === "" && (
                    <div className="empty-div"></div>
                  )}
                  <p className="text-done">{statuses[0].value}</p>
                  <p className="text-running">{statuses[1].value}</p>
                  <p className="text-queued">{statuses[4].value}</p>
                  <p className="text-dependent">{statuses[5].value}</p>
                  <p className="text-exit">
                    {statuses[2].value + statuses[3].value + statuses[7].value}
                  </p>
                </div>
              )}
              {/* {isMemMaxed[did] && isMemMaxed[did][arrayRow.aid] && ( */}
              {/* {columnOrder[index] === 10 && (
                <div className="memory-column">
                  <span
                    className="mem-maxed-tag"
                    title="One or more tasks in this Array are using more memory than was reserved"
                  >
                    <span className="glyphicon glyphicon-flag"></span>
                    <span>Maxed</span>
                  </span>
                </div>
              )} */}
              {columnOrder[index] !== 3 && tmpArray1[columnOrder[index]].name}
            </TableCell>
          );
        })}
      </ExpandableTableRow>
    );
  });
}
