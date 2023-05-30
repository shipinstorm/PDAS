import * as React from 'react';
import { useState } from 'react';

import { styled, alpha } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Unstable_Grid2';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

// Customized button for filter settings
const StyledButton = styled(Button)(({ theme }) => ({
  border: '2px solid #4D4D4D',
  color: '#4D4D4D',
  backgroundColor: 'transparent',
  fontWeight: 'bold',
  '&:hover': {
    backgroundColor: 'transparent',
    border: '2px solid #404040',
    color: '#404040',
  },
}));

// Customized menu for filter settings
const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'left',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'left',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 0,
    marginTop: 0,
    minWidth: 150,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

function Filter({
  elementRef,
  autoCompleteValue,
  handleAutoCompleteValueChange,
  filterQueryFlag,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(elementRef.current);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Customized checkbox for filter settings
  const StyledCheckbox = ({type, value, className}) => {
    return (
      <Checkbox
        sx={{
          color: '#A7A5A7',
          padding: '9px !important',
          '&.Mui-checked': {
            color: '#A7A5A7',
          },
        }}
        className={className}
        checked={filterQueryFlag[type] ? filterQueryFlag[type][value] : false}
        onChange={(event) => {
          /**
           * Update autoCompleteValue
           * Checked: Push to the array
           * Unchecked: Pop from the array
           */
          if (event.target.checked) {
            // Styled checkbox checked
            autoCompleteValue.push({
              header: type,
              title: value
            });
            handleAutoCompleteValueChange(autoCompleteValue);
          } else {
            // Styled checkbox unchecked
            autoCompleteValue = autoCompleteValue.filter((completeValue) => {
              return completeValue.header !== type || completeValue.title !== value;
            })
            handleAutoCompleteValueChange(autoCompleteValue);
          }
        }}
      />
    )
  }

  return (
    <div className='filter-button'>
      <Button
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{
          height: '30px',
          width: '90px',
          background: '#383838 !important',
          color: '#848285 !important',
          '&:hover': {
            background: '#383838 !important',
          }
        }}
      >
        Filter
      </Button>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <Grid container style={{width: '550px'}}>
          <Grid xs={6} display={"flex"} alignItems={"center"} justifyContent={"start"}>
            Search
            <FormControl sx={{ m: 1, minWidth: 120 }}>
              <Select
                id="filter-search"
                sx={{
                  border: '2px solid #848285',
                  color: '#848285',
                  '& .MuiSelect-icon': {
                    color: '#848285 !important',
                  },
                }}
                value={filterQueryFlag["show"]}
                onChange={(event) => {
                  // Remove duplicated tag
                  let newAutoCompleteValue = autoCompleteValue.filter((completeValue) => {
                    return completeValue.header !== "show" || completeValue.title !== event.target.value;
                  })

                  // Add new tag if there's no change in autoCompleteValue
                  if (newAutoCompleteValue.length === autoCompleteValue.length) {
                    autoCompleteValue.push({
                      header: "show",
                      title: event.target.value
                    });
                  }
                  handleAutoCompleteValueChange(autoCompleteValue);
                }}
              >
                <MenuItem value={"All Shows"}>All Shows</MenuItem>
                <MenuItem value={"1923"}>1923</MenuItem>
                <MenuItem value={"CASA"}>CASA</MenuItem>
                <MenuItem value={"GARLAND"}>GARLAND</MenuItem>
                <MenuItem value={"LEGACY"}>LEGACY</MenuItem>
                <MenuItem value={"NURSE"}>NURSE</MenuItem>
                <MenuItem value={"PULP"}>PULP</MenuItem>
                <MenuItem value={"WISH"}>WISH</MenuItem>
                <MenuItem value={"ZERMATT"}>ZERMATT</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={6} display={"flex"} alignItems={"center"} justifyContent={"start"}>
            Since
            <TextField
              id="datetime-local"
              type="datetime-local"
              sx={{
                marginLeft: '10px',
                width: 200,
                border: '2px solid #848285',
                color: '#848285',
                borderRadius: '4px',
                filter: 'invert(0.7)',
              }}
              InputLabelProps={{
                shrink: true,
              }}
              value={filterQueryFlag.after}
              onChange={(event) => {
                // Remove after tag
                autoCompleteValue = autoCompleteValue.filter((completeValue) => {
                  return completeValue.header !== 'after';
                })

                // Add after tag with newValue
                autoCompleteValue.push({
                  header: 'after',
                  title: event.target.value
                });
                handleAutoCompleteValueChange(autoCompleteValue);
              }}
            />
          </Grid>
          <Grid xs={12} className="filter-title">Display</Grid>
          <Grid xs={12}>
            <FormControlLabel
              control={
                <StyledCheckbox type="display" value="hidden" />
              }
              label="Show Hidden Jobs"
            />
          </Grid>
          <Grid xs={12} className="filter-title">Department</Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Anim" className="filter-check-anim" />
              }
              label="Anim"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Crowd" className="filter-check-crowd" />
              }
              label="Crowd"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Effects" />
              }
              label="Effects"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Layout" />
              }
              label="Layout"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Lighting" />
              }
              label="Lighting"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Look" />
              }
              label="Look"
              className='filter-check-look'
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Modeling" />
              }
              label="Modeling"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Rig" />
              }
              label="Rig"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Sim" />
              }
              label="Sim"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Stereo" />
              }
              label="Stereo"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="dept" value="Tanim" />
              }
              label="Tanim"
            />
          </Grid>
          <Grid xs={12} className="filter-title">Type</Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="type" value="AutoRender" />
              }
              label="AutoRender"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="type" value="TechCheck" />
              }
              label="TechCheck"
            />
          </Grid>
          <Grid xs={12} className="filter-title">Status</Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="status" value="exited" />
              }
              label="Exited"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="status" value="dependent" />
              }
              label="Dependent"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="status" value="queued" />
              }
              label="Queued"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="status" value="running" />
              }
              label="Running"
            />
          </Grid>
          <Grid xs={3}>
            <FormControlLabel
              control={
                <StyledCheckbox type="status" value="done" />
              }
              label="Done"
            />
          </Grid>
          <Grid xs={12} display={'flex'} justifyContent={'end'} alignItems={'center'} className='filter-footer'>
            <span onClick={() => handleAutoCompleteValueChange([])} className="filter-clear-button">Clear All Filters</span>
            <StyledButton variant="outlined" onClick={() => handleClose()}>Close</StyledButton>
          </Grid>
        </Grid>
      </StyledMenu>
    </div>
  )
}

export default Filter;