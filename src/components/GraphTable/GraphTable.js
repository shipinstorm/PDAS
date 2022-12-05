import { useState, Fragment } from 'react';
import { Waypoint } from 'react-waypoint';
import { useDispatch, useSelector } from 'react-redux';

import MUIDataTable from 'mui-datatables';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";

import ElasticSearchService from '../../services/ElasticSearch.service';

import { globalImagePaths } from '../../store/actions/globalAction';
import { jobJobSelected, jobRowsSelected } from '../../store/actions/jobAction';

import { submittedTime } from '../../utils/utils';

import GraphStatus from './GraphStatus/GraphStatus';
import ArrayTableRow from './ArrayTableRow';

const ExpandableTableRow = ({ children, expandComponent, updateRowsExpanded, isSelected, ...otherProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow {...otherProps}>
        <TableCell
          padding="checkbox"
          sx={isSelected ?
            {
              background: '#383838 !important',
              '& .MuiButtonBase-root': {
                color: '#848285 !important',
              },
            } :
            {
              '& .MuiButtonBase-root': {
                color: '#848285 !important',
              }
            }}
        >
          <IconButton
            onClick={(event) => {
              event.preventDefault();
              setIsExpanded(!isExpanded);
              updateRowsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
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
  const [columnOrder, setColumnOrder] = useState(
    localStorage.columnOrder ?
    JSON.parse("[" + localStorage.columnOrder + "]") :
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  );
  const graphData = useSelector((state) => state.global.graphData);
  const arrayData = useSelector((state) => state.global.arrayData);
  const taskData = useSelector((state) => state.global.taskData);
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const rowsSelected = useSelector((state) => state.job.rowsSelected);
  const [currentRowsExpanded, setCurrentRowsExpanded] = useState([]);
  const [allRowsExpanded, setAllRowsExpanded] = useState([]);

  const muiCache = createCache({
    "key": "mui",
    "prepend": true
  });

  const getMuiTheme = () => createTheme({
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "#282828 !important",
            color: '#8D8D8D !important',
            '& > div:nth-of-type(3) > div > div > div': {
              border: 'none',
            }
          },
        }
      },
      MuiToolbar: {
        styleOverrides: {
          root: {
            backgroundColor: "#282828 !important",
            color: '#8D8D8D !important',
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            backgroundColor: "#282828 !important",
            color: '#8D8D8D !important',
            border: '2px solid #222222',
          }
        }
      },
      MuiButtonBase: {
        styleOverrides: {
          root: {
            color: '#848285 !important',
          }
        }
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            color: '#848285 !important',
          }
        }
      },
      MuiTablePagination: {
        styleOverrides: {
          displayedRows: {
            display: 'none',
          }
        }
      },
      MUIDataTable: {
        styleOverrides: {
          responsiveBase: {
            overflow: 'inherit',
          }
        }
      }
    }
  })

  const columns = [
    {
      name: 'username',
      label: 'User',
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
            )
          } else {
            return <Fragment>{value}</Fragment>;
          }
        }
      }
    },
    {
      name: 'jobid',
      label: 'Job ID'
    },
    {
      name: 'title',
      label: 'Title'
    },
    {
      name: 'done',
      label: 'Done'
    },
    {
      name: 'running',
      label: 'Running'
    },
    {
      name: 'exited',
      label: 'Exited'
    },
    {
      name: 'sysKilled',
      label: 'Sys Killed'
    },
    {
      name: 'inQueue',
      label: 'In Queue'
    },
    {
      name: 'dependent',
      label: 'Dependent'
    },
    {
      name: 'paused',
      label: 'Paused'
    },
    {
      name: 'killed',
      label: 'Killed'
    },
    {
      name: 'host',
      label: 'Host (th)'
    },
    {
      name: 'elapsed',
      label: 'Elapsed'
    },
    {
      name: 'memory',
      label: 'Memory (MB)'
    },
    {
      name: 'submitted',
      label: 'Submitted'
    },
  ]

  const data = graphData.map((jobs) => {
    return {
      username: jobs.icoda_username,
      jobid: jobs.did,
      title: jobs.title,
      status: jobs._statusname,
      submitted: submittedTime(jobs._submittime)
    }
  })

  const options1 = {
    draggableColumns: {
      enabled: true
    },
    resizableColumns: true,
    filter: true,
    filterType: "dropdown",
    viewColumns: true
  }

  const options2 = {
    draggableColumns: {
      enabled: true
    },
    resizableColumns: true,
    filter: true,
    filterType: "dropdown",
    viewColumns: true,
    expandableRows: true,
    expandableRowsHeader: false,
    expandableRowsOnClick: false,
    pagination: false,
    rowsExpanded: props.rowsExpanded,
    columnOrder: columnOrder,
    // Row select for DetailsPane
    selectableRows: 'single',
    selectableRowsOnClick: true,
    rowsSelected: rowsSelected,

    customRowRender: (data, dataIndex, rowIndex) => {
      const isSelected = false;
      const did = data[1];
      const [searchArrayData, searchTaskData] = [arrayData[did], taskData[did]];
      let tmp = graphData.filter((data) => data.did === did);
      let tmpGraphData = tmp[0] ? tmp[0] : {};

      const statuses = [
        { name: "done", mapping: "_done", percent: 0, statusClass: "done" },
        { name: "running", mapping: "_running", percent: 0, statusClass: "running" },
        { name: "exited", mapping: "_exit", percent: 0, statusClass: "exited" },
        { name: "sys killed", mapping: "_syskill", percent: 0, statusClass: "sys-killed" },
        { name: "in queue", mapping: "_queued", percent: 0, statusClass: "in-queue" },
        { name: "dependent", mapping: "_depend", percent: 0, statusClass: "dependent" },
        { name: "paused", mapping: "_suspended", percent: 0, statusClass: "paused" },
        { name: "killed", mapping: "_userkill", percent: 0, statusClass: "killed" }
      ];

      const setStatusPercents = () => {
        let total = 0;
        for (var status of statuses) {
          total += parseInt(tmpGraphData[status.mapping]);
        }
        if (total > 0) {
          for (var status of statuses) {
            status.percent = parseInt(tmpGraphData[status.mapping]) / total * 100;
            if (status.percent > 0 && status.percent < 1) {
              status.percent = 1;
            } else {
              status.percent = Math.round(status.percent)
            }
          }
        }
      }

      setStatusPercents();

      for (var i = 0; i < 8; i++) {
        data[3 + i] = statuses[i].percent + "%";
      }

      const updateRowsExpanded = async (isExpanded) => {
        let tmpCurrentRowsExpanded = [], tmpAllRowsExpanded = [];

        if (isExpanded) {
          tmpCurrentRowsExpanded = [{
            index: rowIndex,
            dataIndex: dataIndex
          }];
          tmpAllRowsExpanded = [...allRowsExpanded, {
            index: rowIndex,
            dataIndex: dataIndex
          }];
        } else {
          tmpCurrentRowsExpanded = [];
          tmpAllRowsExpanded = allRowsExpanded.filter((row) => {
            return row.index !== rowIndex || row.dataIndex !== dataIndex;
          });
        }
        setCurrentRowsExpanded(tmpCurrentRowsExpanded);
        setAllRowsExpanded(tmpAllRowsExpanded);
        await props.onToggleClick(graphData[tmpCurrentRowsExpanded[0].index].did)
        props.setRowsExpanded(tmpAllRowsExpanded)
      }

      return (
        <ExpandableTableRow
          expandComponent={(!searchArrayData || !searchArrayData.length || !searchTaskData || !searchTaskData.length) ?
            <TableRow>
              <TableCell colSpan={columns.length + 1}></TableCell>
            </TableRow> :
            <ArrayTableRow
              searchArrayData={searchArrayData}
              searchTaskData={searchTaskData}
              did={did}
              columnOrder={columnOrder}
            />
          }
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            dispatch(jobRowsSelected([rowIndex]));
            if (rowsSelected.length) {
              /**
               * Select current row
               * jobSelected: current row's id
               */
              dispatch(jobJobSelected(did));
              imagePaths[did] = ElasticSearchService.playImages(did);
              dispatch(globalImagePaths(imagePaths));
            } else {
              /**
               * Deselect current row
               * jobSelected: none
               */
               dispatch(jobJobSelected(''));
            }
          }}
          updateRowsExpanded={updateRowsExpanded}
          isSelected={isSelected}
        >
          {[...Array(15)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={
                  isSelected ?
                    {
                      background: '#383838 !important',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    } :
                    {
                      background: '#282828 !important',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                }
              >
                {data[columnOrder[index]]}
              </TableCell>
            )
          })}
        </ExpandableTableRow>
      );
    },

    onColumnOrderChange: (newColumnOrder) => {
      localStorage.setItem('columnOrder', newColumnOrder);
      setColumnOrder(newColumnOrder);
    },
  }

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
            <div className='job-rows'>
              Loading...
            </div>
          </ThemeProvider>
        </CacheProvider>
      </div>
    )
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
    )
  }
}

export default GraphTable;
