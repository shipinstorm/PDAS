import React, { useState } from 'react';

import MUIDataTable from 'mui-datatables';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { createTheme, ThemeProvider } from '@mui/material/styles';

// function submitDate(dateString) {
//   let date = new Date(dateString+"Z");
//   return (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
// }

function submitTime(dateString) {
  let date = new Date(dateString+"Z");
  let hours = date.getHours();
  let minutes = date.getMinutes();
  minutes = minutes < 10 ? "0"+minutes : minutes;
  if (hours > 12){
    return (hours-12)+":"+minutes+" pm";
  } else {
    return hours+":"+minutes+" am";
  }
}

const ExpandableTableRow = ({ children, expandComponent, ...otherProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <TableRow {...otherProps}>
        <TableCell
          padding="checkbox"
          sx={{
            '& .MuiButtonBase-root': {
              color: '#848285 !important',
            },
          }}
        >
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
          </IconButton>
        </TableCell>
        {children}
      </TableRow>
      {isExpanded && expandComponent}
    </>
  );
};

function JobList(props) {
  const [columnOrder, setColumnOrder] = useState(localStorage.columnOrder ? JSON.parse("[" + localStorage.columnOrder + "]") : [0, 1, 2, 3, 4, 5, 6, 7]);

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

  const data = props.graphData.map((jobs) => {
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
    expandableRowsOnClick: true,
    rowsExpanded: props.rowsExpanded,
    columnOrder: columnOrder,

    onRowExpansionChange: (currentRowsExpanded, allRowsExpanded, rowsExpanded) => {
      props.onToggleClick(currentRowsExpanded[0].index)
      props.setRowsExpanded(allRowsExpanded)
    },

    renderExpandableRow: (rowData, rowMeta) => {
      const did = rowData[1];
      
      const [searchArrayData, searchTaskData] = [props.searchArrayData[rowMeta.dataIndex], props.searchTaskData[rowMeta.dataIndex]];
      if (!searchArrayData || !searchArrayData.length || !searchTaskData || !searchTaskData.length) {
        return (
          <TableRow>
            <TableCell></TableCell>
            <TableCell colSpan={columns.length}></TableCell>
          </TableRow>
        );
      }
      return searchArrayData.map((arrayRow)=> {
        const childArrayText = `${did}.${arrayRow.aid}`;
        const tmpArray1 = [
          { name: '' },
          { name: childArrayText },
          { name: '' },
          { name: '' },
          { name: '' },
          { name: '' },
          { name: '' },
          { name: '' },
        ]
        return (
          <ExpandableTableRow
            key={childArrayText}
            expandComponent={
              searchTaskData[arrayRow.aid].map((taskRow) => {
                const childTaskText = `${childArrayText}.${taskRow.aid}`;
                const tmpArray2 = [
                  { name: '' },
                  { name: childTaskText },
                  { name: taskRow.title },
                  { name: taskRow._statusname },
                  { name: taskRow._exechost ? taskRow._exechost : '' + '(' + taskRow._granted?.cpus + ')' },
                  { name: '' },
                  { name: '' + taskRow._memused + '/' + taskRow._granted?.memory },
                  { name: '' },
                ]
                return (
                <TableRow key={childTaskText}>
                  <TableCell padding="checkbox" />
                  {[...Array(8)].map((value, index) => {
                    return (
                      <TableCell key={index}>{tmpArray2[columnOrder[index]].name}</TableCell>
                    )
                  })}
                </TableRow>
                )
              })
            }
          >
            {[...Array(8)].map((value, index) => {
              return (
                <TableCell key={index}>{tmpArray1[columnOrder[index]].name}</TableCell>
              )
            })}
          </ExpandableTableRow>
        );
      });
    },

    onColumnOrderChange: (newColumnOrder) => {
      localStorage.setItem('columnOrder', newColumnOrder);
      setColumnOrder(newColumnOrder);
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

export default JobList;