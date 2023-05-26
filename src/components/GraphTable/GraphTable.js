import { useState, Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Waypoint } from "react-waypoint";

import MUIDataTable from "mui-datatables";

import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import IconKilled from "../../assets/images/icon-killed.svg";
import IconExited from "../../assets/images/icon-exited.svg";
import IconRun from "../../assets/images/icon-run.svg";
import IconDependent from "../../assets/images/icon-dependent.svg";
import IconQueued from "../../assets/images/icon-queued.svg";
import IconDone from "../../assets/images/icon-done.svg";
import SpinnerDarkGif from "../../assets/images/spinner_dark.gif";
import originStatuses from "../../assets/data/statuses.json";

import { globalImagePaths } from "../../store/actions/globalAction";
import { jobJobSelectedId, jobJobExpanded } from "../../store/actions/jobAction";

import {
  elapsedTime,
  submittedTime,
  setStatusPercents,
} from "../../utils/utils";

import ArrayTableRow from "./ArrayTableRow";
import DgraphActionMenuComponent from "../ActionMenu/ActionMenu";

import './GraphTable.scss';

const ExpandableTableRow = ({
  children,
  expandComponent,
  expandGraphRow,
  isSelected,
  isExpanded,
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
              expandGraphRow();
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

function GraphTable(props) {
  const dispatch = useDispatch();

  const elasticSearchService = useSelector((state) => state.global.elasticSearchService);
  const graphData = useSelector((state) => state.global.graphData);
  const arrayData = useSelector((state) => state.global.arrayData);
  const taskData = useSelector((state) => state.global.taskData);
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const jobSelectedId = useSelector((state) => state.job.jobSelectedId);
  const jobExpanded = useSelector((state) => state.job.jobExpanded);

  const [columnOrder, setColumnOrder] = useState(
    localStorage.columnOrder
      ? JSON.parse("[" + localStorage.columnOrder + "]")
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  );
  const [isMemMaxed, setIsMemMaxed] = useState({});

  const getTaskMemoryData = (dids) => {
    const tmpMemMaxed = isMemMaxed;
    elasticSearchService.getTaskMemoryData(dids)
      .then((result) => {
        for (let did of result.dids.buckets) {
          tmpMemMaxed[did.key] = null;
          for (let aid of did.aids.buckets) {
            for (let memGranted of aid.mem_granted.buckets) {
              // Allow the job to use 25% more memory than it reserved before alerting
              // 25% is somewhat arbitrary.  Feel free to change it in the future
              // The job must also be using more than 10GB.  This is also arbitrary
              if (memGranted.max_mem_used.value > memGranted.key * 1.25 && memGranted.max_mem_used.value > 10240) {
                if (!tmpMemMaxed[did.key]) {
                  tmpMemMaxed[did.key] = {};
                }
                tmpMemMaxed[did.key][aid.key] = true;
              }
            }
          }
        }
        setIsMemMaxed(tmpMemMaxed);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const collapseAll = () => {
    dispatch(jobJobSelectedId([]));
    dispatch(jobJobExpanded([]));
  }

  const muiCache = createCache({
    key: "mui",
    prepend: true,
  });

  const getMuiTheme = () =>
    createTheme({
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: "#282828 !important",
              color: "#8D8D8D !important",
              height: "100%",
              "& > div:nth-of-type(3) > div > div > div": {
                border: "none",
              },
            },
          },
        },
        MuiToolbar: {
          styleOverrides: {
            root: {
              backgroundColor: "#282828 !important",
              color: "#8D8D8D !important",
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              backgroundColor: "#282828 !important",
              color: "#8D8D8D !important",
              border: "2px solid #222222",
            },
          },
        },
        MuiButtonBase: {
          styleOverrides: {
            root: {
              color: "#848285 !important",
            },
          },
        },
        MuiSvgIcon: {
          styleOverrides: {
            root: {
              color: "#848285 !important",
            },
          },
        },
        MuiTablePagination: {
          styleOverrides: {
            displayedRows: {
              display: "none",
            },
          },
        },
        MUIDataTable: {
          styleOverrides: {
            responsiveBase: {
              overflow: "inherit",
              height: "100% !important"
            },
          },
        },
      },
    });

  const columns = [
    {
      name: "username",
      label: "User",
      options: {
        customBodyRender: (value, tableMeta, updateValue) => {
          const rowIndex = tableMeta.rowIndex;

          if (rowIndex === graphData.length - 10) {
            return (
              <Fragment>
                <Waypoint
                  onEnter={() => {
                    props.setSearchQuery(props.autoCompleteValue, true);
                  }}
                />
                {value}
              </Fragment>
            );
          } else {
            return <Fragment>{value}</Fragment>;
          }
        },
      },
    },
    {
      name: "jobid",
      label: "Job ID",
    },
    {
      name: "title",
      label: "Title",
    },
    {
      name: "status",
      label: "Status",
    },
    {
      name: "done",
      label: "D",
    },
    {
      name: "running",
      label: "R",
    },
    {
      name: "queued",
      label: "Q",
    },
    {
      name: "pending",
      label: "P",
    },
    {
      name: "exit",
      label: "E",
    },
    {
      name: "host",
      label: "Host (th)",
    },
    {
      name: "elapsed",
      label: "Elapsed",
    },
    {
      name: "memory",
      label: "Memory (MB)",
    },
    {
      name: "submitted",
      label: "Submitted",
    },
  ];

  const data1 = [
    {
      username: '',
      jobid: '',
      title: '',
      status: '',
      elapsed: '',
      submitted: '',
    }
  ]

  const data2 = graphData.map((jobs) => {
    let tmp = graphData.filter((data) => data.did === jobs.did);
    let tmpGraphData = tmp[0] ? tmp[0] : {};

    let [statuses, status, statusClass] = setStatusPercents(originStatuses, tmpGraphData, 0);

    return {
      username: jobs.icoda_username,
      jobid: jobs.did,
      title: jobs.title,
      status: jobs._statusname,
      done: statuses[0].value,
      running: statuses[1].value,
      queued: statuses[4].value,
      pending: statuses[5].value,
      exit: statuses[2].value + statuses[3].value + statuses[7].value,
      elapsed: elapsedTime(jobs, {}, {}),
      submitted: submittedTime(jobs._submittime),
    };
  });

  const options1 = {
    draggableColumns: {
      enabled: true,
    },
    resizableColumns: true,
    filter: true,
    filterType: "dropdown",
    viewColumns: true,

    customRowRender: (data, dataIndex, rowIndex) => {
      return (
        <TableRow>
          <TableCell colSpan={9}>
            <div className="loading-div">
              <img src={SpinnerDarkGif} alt="" />
              <br />
              Loading jobs...
            </div>
          </TableCell>
        </TableRow>
      )
    }
  };

  const options2 = {
    draggableColumns: {
      enabled: true,
    },
    resizableColumns: true,
    filter: true,
    filterType: "dropdown",
    viewColumns: true,
    expandableRows: true,
    expandableRowsHeader: false,
    expandableRowsOnClick: true,
    pagination: false,
    columnOrder: columnOrder,
    // Row select for DetailsPane
    selectableRows: "single",
    selectableRowsOnClick: true,

    customRowRender: (data, dataIndex, rowIndex) => {
      const did = data[1];
      const isSelected = (jobSelectedId.includes(did.toString()));
      const isExpanded = (jobExpanded.length > 0 && jobExpanded.findIndex(expanded => expanded.includes(did.toString())) >= 0) ? true : false;
      const [searchArrayData, searchTaskData] = [arrayData[did], taskData[did]];
      let tmp = graphData.filter((data) => data.did === did);
      let tmpGraphData = tmp[0] ? tmp[0] : {};

      let [statuses, status, statusClass] = setStatusPercents(originStatuses, tmpGraphData, 0);

      const expandGraphRow = async () => {
        /**
         * Update jobExpanded Array
         * Find related elements with same jobID[0](same graphData)
         * Remove related elements with same jobID[0](same graphData)
         * Add childArrayText if none exist
         */
        if (jobExpanded.filter(job => job.includes(did.toString())).length > 0) {
          dispatch(jobJobExpanded(jobExpanded.filter(job => !job.includes(did.toString()))));
        } else {
          dispatch(jobJobExpanded([...jobExpanded.filter(job => !job.includes(did.toString())), did.toString()]));
        }

        await props.onToggleClick(did.toString());
      };

      const selectGraphRow = (childGraphText) => {
        imagePaths[childGraphText] = elasticSearchService.playImages(childGraphText);
        dispatch(globalImagePaths(imagePaths));

        /**
         * Update jobSelectedId Array
         * Remove childGraphText if it exists
         * Remove related elements with same jobID[0](same graphData)
         * Add childGraphText if it doesn't exist
         */
        const index = jobSelectedId.indexOf(childGraphText);
        if (index > -1) {
          jobSelectedId.splice(index, 1);
          dispatch(jobJobSelectedId(jobSelectedId.filter((job) => !job.includes(childGraphText))));
        } else {
          dispatch(jobJobSelectedId([...jobSelectedId.filter((job) => !job.includes(childGraphText)), childGraphText]));
        }
      }

      return (
        <ExpandableTableRow
          id={"jobID-" + did.toString()}
          expandComponent={
            !searchArrayData ||
              !searchArrayData.length ||
              !searchTaskData ||
              !searchTaskData.length ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1}></TableCell>
              </TableRow>
            ) : (
              <ArrayTableRow
                searchArrayData={searchArrayData}
                searchTaskData={searchTaskData}
                did={did}
                columnOrder={columnOrder}
              />
            )
          }
          sx={{ cursor: "pointer" }}
          onClick={() => selectGraphRow(did.toString())}
          expandGraphRow={expandGraphRow}
          isSelected={isSelected}
          isExpanded={isExpanded}
        >
          {[...Array(13)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={
                  isSelected
                    ? { background: "#383838 !important" }
                    : { background: "#282828 !important" }
                }
                className={"row-" + statusClass}
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
                  </div>
                )}
                {columnOrder[index] === 4 && <p className="text-done">{data[4]}</p>}
                {columnOrder[index] === 5 && <p className="text-running">{data[5]}</p>}
                {columnOrder[index] === 6 && <p className="text-queued">{data[6]}</p>}
                {columnOrder[index] === 7 && <p className="text-dependent">{data[7]}</p>}
                {columnOrder[index] === 8 && <p className="text-exit">{data[8]}</p>}
                {isMemMaxed[did] && columnOrder[index] === 10 && (
                  <div className="column-cell memory-column pull-right text-center">
                    <span
                      className="mem-maxed-tag"
                      title="One or more tasks in this Array are using more memory than was reserved"
                    >
                      <span className="glyphicon glyphicon-flag"></span>
                      <span>Maxed</span>
                    </span>
                  </div>
                )}
                {columnOrder[index] !== 3 && columnOrder[index] !== 4 && columnOrder[index] !== 5 && columnOrder[index] !== 6 && columnOrder[index] !== 7 && columnOrder[index] !== 8 && data[columnOrder[index]]}
              </TableCell>
            );
          })}
        </ExpandableTableRow>
      );
    },

    onColumnOrderChange: (newColumnOrder) => {
      localStorage.setItem("columnOrder", newColumnOrder);
      setColumnOrder(newColumnOrder);
    },
  };

  if (props.loading) {
    //TODO: make Loading div a loading spinner instead
    return (
      <div className="job-list">
        <CacheProvider value={muiCache}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              data={data1}
              columns={columns}
              options={options1}
            />
          </ThemeProvider>
        </CacheProvider>
      </div >
    );
  } else {
    return (
      <div className="job-list">
        <CacheProvider value={muiCache}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={
                <div className="graphTableTitle">
                  <p>coda-ui-react</p>
                  {jobExpanded.length > 0 ? <KeyboardArrowDownIcon onClick={() => collapseAll()} /> : <KeyboardArrowRightIcon />}
                </div>
              }
              data={data2}
              columns={columns}
              options={options2}
            />
            <DgraphActionMenuComponent
              targetId="MuiTableBody-root"
              options={['View', 'Update', 'Delete']}
              classes={{
                listWrapper: 'customContextmenuArea1ListWrapper',
                listItem: 'customContextmenuArea1ListItem'
              }}
              toggleDetails={props.toggleDetails}
              toggleLog={props.toggleLog}
              mainContentWrapperTop={props.mainContentWrapperTop}
            />
          </ThemeProvider>
        </CacheProvider>
      </div>
    );
  }
}

export default GraphTable;