import { useState } from 'react';
import { useSelector } from 'react-redux';

import MUIDataTable from 'mui-datatables';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import ArrayTableRow from './ArrayTableRow';

// function submitDate(dateString) {
//   let date = new Date(dateString+"Z");
//   return (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
// }

function submitTime(dateString) {
  if (!dateString) return "";

  let date = new Date(dateString+"Z");
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
  let hours = date.getHours();
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? "0"+minutes : minutes;
  if (hours > 12){
    return (hours-12)+":"+minutes+" pm";
  } else {
    return hours+":"+minutes+" am";
  }
}

function GraphTable(props) {
  const [columnOrder, setColumnOrder] = useState(localStorage.columnOrder ? JSON.parse("[" + localStorage.columnOrder + "]") : [0, 1, 2, 3, 4, 5, 6, 7]);
  const graphData = useSelector((state) => state.global.graphData);
	const arrayData = useSelector((state) => state.global.arrayData);
	const taskData = useSelector((state) => state.global.taskData);

  let className = "job-list";
  className += props.viewDetails ? "" : " full-width";
  className += props.viewLog ? "" : " full-height";

  const muiCache = createCache({
    "key": "mui",
    "prepend": true
  });

  const getMuiTheme = () => createTheme({
    components: {
      MuiPaper: {
        styleOverrides:{
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
        styleOverrides:{
          root: {
            backgroundColor: "#282828 !important",
            color: '#8D8D8D !important',
          }
        }
      },
      MuiTableCell: {
        styleOverrides:{
          root: {
            backgroundColor: "#282828 !important",
            color: '#8D8D8D !important',
            border: '2px solid #222222',
          }
        }
      },
      MuiButtonBase: {
        styleOverrides:{
          root: {
            color: '#848285 !important',
          }
        }
      },
      MuiSvgIcon: {
        styleOverrides:{
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
      }
    }
  })

  const columns = [
    {
      name: 'username',
      label: 'User'
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
      name: 'status',
      label: 'Status'
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
      submitted: submitTime(jobs._submittime)
    }
  })

  const options1 = {
    draggableColumns: {
      enabled: true
    },
    resizableColumns: true,
    filter:true,
    filterType: "dropdown",
    viewColumns:true
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
    rowsExpanded: props.rowsExpanded,
    columnOrder: columnOrder,
    rowsPerPage: props.rowsPerPage,
    page: props.currentPage,

    onRowExpansionChange: async (currentRowsExpanded, allRowsExpanded, rowsExpanded) => {
      await props.onToggleClick(graphData[currentRowsExpanded[0].index].did)
      props.setRowsExpanded(allRowsExpanded)
    },

    renderExpandableRow: (rowData, rowMeta) => {
      const did = rowData[1];

      const [searchArrayData, searchTaskData] = [arrayData[did], taskData[did]];
      if (!searchArrayData || !searchArrayData.length || !searchTaskData || !searchTaskData.length) {
        return (
          <TableRow>
            <TableCell colSpan={columns.length + 1}></TableCell>
          </TableRow>
        );
      }
      return (
        <ArrayTableRow
          searchArrayData={searchArrayData}
          searchTaskData={searchTaskData}
          did={did}
          columnOrder={columnOrder}
          jobSelected={props.jobSelected}
          setJobSelected={props.setJobSelected}
        />
      );
    },

    onColumnOrderChange: (newColumnOrder) => {
      localStorage.setItem('columnOrder', newColumnOrder);
      setColumnOrder(newColumnOrder);
    },

    onTableChange: (action, tableState) => {
      switch (action) {
        case 'changePage': case 'changeRowsPerPage':
          props.setCurrentPage(tableState.page);
          props.setRowsPerPage(tableState.rowsPerPage);
          props.setSearchQuery(props.autoCompleteValue, tableState.page * tableState.rowsPerPage, tableState.rowsPerPage * 2);
          break;
      }
    }
  }

  if (props.loading) {
    //TODO: make Loading div a loading spinner instead
    return (
      <div className={className}>
        <CacheProvider value={muiCache}>
		      <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title = {"coda-ui-react"}
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
      <div className={className}>
        <CacheProvider value={muiCache}>
		      <ThemeProvider theme={getMuiTheme()}>
            <MUIDataTable
              title = {"coda-ui-react"}
              data={data}
              columns={columns}
              options= {options2}
            />
          </ThemeProvider>
        </CacheProvider>
      </div>
    )
  }
}

export default GraphTable;
