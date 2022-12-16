import { useEffect, useState, Fragment } from "react";
import { Waypoint } from "react-waypoint";
import { useDispatch, useSelector } from "react-redux";

import MUIDataTable from "mui-datatables";

import IconButton from "@material-ui/core/IconButton";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import originStatuses from "../../assets/data/statuses.json";

import ElasticSearchService from "../../services/ElasticSearch.service";

import { globalImagePaths } from "../../store/actions/globalAction";
import { jobJobSelected, jobRowsSelected } from "../../store/actions/jobAction";

import {
  elapsedTime,
  submittedTime,
  setStatusPercents,
} from "../../utils/utils";

import ArrayTableRow from "./ArrayTableRow";

const ExpandableTableRow = ({
  children,
  expandComponent,
  updateRowsExpanded,
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
              updateRowsExpanded(!isExpanded);
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

  const graphData = useSelector((state) => state.global.graphData);
  const arrayData = useSelector((state) => state.global.arrayData);
  const taskData = useSelector((state) => state.global.taskData);
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const rowsSelected = useSelector((state) => state.job.rowsSelected);
  const jobSelected = useSelector((state) => state.job.jobSelected);

  const [columnOrder, setColumnOrder] = useState(
    localStorage.columnOrder
      ? JSON.parse("[" + localStorage.columnOrder + "]")
      : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  );
  const [currentRowsExpanded, setCurrentRowsExpanded] = useState([]);
  const [allRowsExpanded, setAllRowsExpanded] = useState([]);

  useEffect(() => {
    let tmpAllRowsExpanded = [];
    props.rowsExpanded.map((exp) => {
      graphData.map((graph, index) => {
        if (graph.did === exp) {
          tmpAllRowsExpanded = [
            ...tmpAllRowsExpanded,
            {
              index: index,
              dataIndex: index,
            },
          ];
        }
      });
    });
    setAllRowsExpanded(tmpAllRowsExpanded);
  }, [graphData]);

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
      name: "done",
      label: "Done",
    },
    {
      name: "running",
      label: "Running",
    },
    {
      name: "queued",
      label: "Queued",
    },
    {
      name: "dependent",
      label: "Dependent",
    },
    {
      name: "exitKilled",
      label: "Exit, killed",
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

  const data = graphData.map((jobs) => {
    return {
      username: jobs.icoda_username,
      jobid: jobs.did,
      title: jobs.title,
      status: jobs._statusname,
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
    expandableRowsOnClick: false,
    pagination: false,
    columnOrder: columnOrder,
    // Row select for DetailsPane
    selectableRows: "single",
    selectableRowsOnClick: true,
    rowsSelected: rowsSelected,

    customRowRender: (data, dataIndex, rowIndex) => {
      const did = data[1];
      const isSelected = jobSelected == did;
      const isExpanded = props.rowsExpanded.includes(did);
      const [searchArrayData, searchTaskData] = [arrayData[did], taskData[did]];
      let tmp = graphData.filter((data) => data.did === did);
      let tmpGraphData = tmp[0] ? tmp[0] : {};

      let statuses = setStatusPercents(originStatuses, tmpGraphData, 0);
      data[3] = statuses[0].value;
      data[4] = statuses[1].value;
      data[5] = statuses[4].value;
      data[6] = statuses[5].value;
      data[7] = statuses[2].value + statuses[3].value + statuses[7].value;

      const updateRowsExpanded = async (isExpanded) => {
        let tmpCurrentRowsExpanded = [],
          tmpAllRowsExpanded = [];

        if (isExpanded) {
          tmpCurrentRowsExpanded = [
            {
              index: rowIndex,
              dataIndex: dataIndex,
            },
          ];
          tmpAllRowsExpanded = [
            ...allRowsExpanded,
            {
              index: rowIndex,
              dataIndex: dataIndex,
            },
          ];
        } else {
          tmpCurrentRowsExpanded = [];
          tmpAllRowsExpanded = allRowsExpanded.filter((row) => {
            return row.index !== rowIndex || row.dataIndex !== dataIndex;
          });
        }
        setCurrentRowsExpanded(tmpCurrentRowsExpanded);
        setAllRowsExpanded(tmpAllRowsExpanded);
        await props.onToggleClick(graphData[rowIndex].did);
        props.setRowsExpanded(tmpAllRowsExpanded);
      };

      return (
        <ExpandableTableRow
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
          onClick={() => {
            dispatch(jobRowsSelected([rowIndex]));
            /**
             * Select current row
             * jobSelected: current row's id
             */
            dispatch(jobJobSelected(did));
            imagePaths[did] = ElasticSearchService.playImages(did);
            dispatch(globalImagePaths(imagePaths));
          }}
          updateRowsExpanded={updateRowsExpanded}
          isSelected={isSelected}
          isExpanded={isExpanded}
        >
          {[...Array(12)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={
                  isSelected
                    ? {
                        background: "#383838 !important",
                        // overflow: 'hidden',
                        // textOverflow: 'ellipsis',
                        // whiteSpace: 'nowrap'
                      }
                    : {
                        background: "#282828 !important",
                        // overflow: 'hidden',
                        // textOverflow: 'ellipsis',
                        // whiteSpace: 'nowrap'
                      }
                }
              >
                {columnOrder[index] === 3 && (
                  <span className="text-done">{data[columnOrder[index]]}</span>
                )}
                {columnOrder[index] === 4 && (
                  <span className="text-running">
                    {data[columnOrder[index]]}
                  </span>
                )}
                {columnOrder[index] === 5 && (
                  <span className="text-queued">
                    {data[columnOrder[index]]}
                  </span>
                )}
                {columnOrder[index] === 6 && (
                  <span className="text-dependent">
                    {data[columnOrder[index]]}
                  </span>
                )}
                {columnOrder[index] === 7 && (
                  <span className="text-exit">{data[columnOrder[index]]}</span>
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
                {columnOrder[index] !== 3 &&
                  columnOrder[index] !== 4 &&
                  columnOrder[index] !== 5 &&
                  columnOrder[index] !== 6 &&
                  columnOrder[index] !== 7 &&
                  columnOrder[index] !== 10 &&
                  data[columnOrder[index]]}
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
              title={"coda-ui-react"}
              columns={columns}
              options={options1}
            />
            <div className="job-rows">Loading...</div>
          </ThemeProvider>
        </CacheProvider>
      </div>
    );
  } else {
    return (
      <div className="job-list">
        <CacheProvider value={muiCache}>
          <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title={"coda-ui-react"}
              data={data}
              columns={columns}
              options={options2}
            />
          </ThemeProvider>
        </CacheProvider>
      </div>
    );
  }
}

export default GraphTable;
