import { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import IconButton from '@material-ui/core/IconButton';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

import ElasticSearchService from "../../services/ElasticSearch.service";

import { globalImagePaths } from "../../store/actions/globalAction";
import { jobRowsSelected } from '../../store/actions/jobAction';

import TaskTableRow from "./TaskTableRow";

const ExpandableTableRow = ({ children, expandComponent, isSelected, ...otherProps }) => {
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

export default function ArrayTableRow({
  searchArrayData,
  searchTaskData,
  did,
  columnOrder,
  jobSelected,
  setJobSelected,
  setViewLog
}) {
  const dispatch = useDispatch();
  const imagePaths = useSelector((state) => state.global.imagePaths);

  return (
    searchArrayData.map((arrayRow)=> {
      const childArrayText = `${did}.${arrayRow.aid}`;
      const isSelected = (jobSelected === childArrayText);
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
            <TaskTableRow
              searchTaskData={searchTaskData}
              arrayRow={arrayRow}
              childArrayText={childArrayText}
              columnOrder={columnOrder}
              jobSelected={jobSelected}
              setJobSelected={setJobSelected}
              setViewLog={setViewLog}
            />
          }
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            /**
             * Remove select of graph data when array is selected
             */
            dispatch(jobRowsSelected([]));
            setJobSelected(childArrayText);
            let jobID = childArrayText.toString().split('.');
            imagePaths[jobID[0]+'.'+jobID[1]] = ElasticSearchService.playImages(jobID[0], jobID[1]);
            dispatch(globalImagePaths(imagePaths));
          }}
          isSelected={isSelected}
        >
          {[...Array(8)].map((value, index) => {
            return (
              <TableCell
                key={index}
                sx={isSelected ?
                { background: '#383838 !important' } :
                { background: '#282828 !important' }}
              >
                {tmpArray1[columnOrder[index]].name}
              </TableCell>
            )
          })}
        </ExpandableTableRow>
      );
    })
  )
}