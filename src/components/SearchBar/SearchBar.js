import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

import { Autocomplete, TextField } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';

import Filter from './Filter.js';
import Tag from './Tag';

function SearchBar({
  autoCompleteValue,
  setAutoCompleteValue,
  setSearchQuery,
  filterQueryFlag,
}) {
  const elementRef = useRef();
  const isFirstRun = useRef(true);

  const elasticSearchService = useSelector((state) => state.global.elasticSearchService);
  // const graphData = useSelector((state) => state.global.graphData);
  const [editTagIndex, setEditTagIndex] = useState(-1);

  const [searchGraphData, setSearchGraphData] = useState([]);

  // const convertToSearchGraphData = (graphData) => {
  //   let data = [], uniqueChars, tmp;
  //   tmp = graphData.map((d) => {
  //     if (d) {
  //       return d.icoda_username;
  //     }
  //   })
  //   uniqueChars = [...new Set(tmp)];
  //   uniqueChars.map((d) => {
  //     data.push({
  //       title: '' + d,
  //       header: 'user'
  //     })
  //   })
  //   tmp = graphData.map((d) => {
  //     return d.title;
  //   })
  //   uniqueChars = [...new Set(tmp)];
  //   uniqueChars.map((d) => {
  //     data.push({
  //       title: '' + d,
  //       header: 'title'
  //     })
  //   })
  //   tmp = graphData.map((d) => {
  //     return d._statusname;
  //   })
  //   uniqueChars = [...new Set(tmp)];
  //   uniqueChars.map((d) => {
  //     data.push({
  //       title: '' + d,
  //       header: 'status'
  //     })
  //   })
  //   return data;
  // }

  // useEffect(() => {
  //   setSearchGraphData(convertToSearchGraphData(graphData));
  // }, [graphData])

  const handleInputChange = (event, newValue) => {
    elasticSearchService.getSearchSuggestions(newValue).then(response => {
      setSearchGraphData(response);
    });

    // Work In Progress: fetch title suggestions separately since they take so long to come back
    // elasticSearchService.getTitleSearchSuggestions(newValue).then(response => {
    //   let newSearchGraphData = searchGraphData.filter(suggestion => suggestion.header != "title").concat(response);
    //   setSearchGraphData(newSearchGraphData);
    // });
  }

  // Update searchQuery and redraw table
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
    } else {
      setSearchQuery(autoCompleteValue);
    }
  }, [autoCompleteValue]);

  const handleAutoCompleteValueChange = (newValue) => {
    // Update searchQuery and redraw table
    setAutoCompleteValue(newValue);
    setSearchQuery(newValue);
  }

  const removeTag = (header, title) => {
    setAutoCompleteValue(autoCompleteValue.filter(entry => entry.header !== header || entry.title !== title))
  }

  return (
    <div className="search-bar">
      {editTagIndex === -1 &&
        <Autocomplete
          id="tags-standard"
          freeSolo
          multiple
          filterSelectedOptions
          options={searchGraphData}
          className="autocomplete-searchbar"
          getOptionLabel={(option) => option.title}
          groupBy={option => option.header}
          onInputChange={(event, newInputValue) => {
            handleInputChange(event, newInputValue);
          }}
          onChange={(e, newValue) => {
            /**
             * Fix searchQuery
             * ['35225744', {title: 'lliu', header: 'user'}]
             * =>
             * [{title: '35225744', header: ''}, {title: 'lliu', header: 'user'}]
             */
            newValue = newValue.map((value) => {
              if (typeof value === "string") {
                return {
                  'title': value,
                  'header': ''
                }
              }

              return value;
            })
            // Remove duplicated items
            newValue = newValue.filter((value, index, self) => {
              return index === self.findIndex((t) => {
                return t.header === value.header && t.title === value.title;
              })
            })
            // Update searchQuery and redraw table
            setAutoCompleteValue(newValue)
          }}
          sx={{
            '& .MuiAutocomplete-inputRoot': {
              paddingRight: '100px !important',
            },
          }}
          value={autoCompleteValue}
          renderGroup={(param) => {
            return (
              <div className="autocomplete-group">
                <div className="autocomplete-left">{param.group}</div>
                <ul className="autocomplete-right">
                  {param.children}
                </ul>
              </div>
            )
          }}
          renderTags={(values, getTagProps, ownerState) => {
            return values.map((value, index) => {
              return (
                <Tag
                  key={index}
                  index={index}
                  value={value}
                  removeTag={removeTag}
                  editTagIndex={editTagIndex}
                  setEditTagIndex={setEditTagIndex}
                  autoCompleteValue={autoCompleteValue}
                  handleAutoCompleteValueChange={handleAutoCompleteValueChange}
                />
              )
            })
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                ref={elementRef}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <span className="material-icons search-icon">search</span>
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Filter
                        elementRef={elementRef}
                        autoCompleteValue={autoCompleteValue}
                        handleAutoCompleteValueChange={handleAutoCompleteValueChange}
                        filterQueryFlag={filterQueryFlag}
                      />
                    </InputAdornment>
                  ),
                  disableUnderline: true,
                }}
                variant="standard"
                style={{
                  backgroundColor: '#4b4b4b',
                  borderRadius: '2px'
                }}
                placeholder={autoCompleteValue ? "" : "Search by name, shot, job id, etc..."}
              />
            )
          }}
        />}
      {editTagIndex !== -1 &&
        <div className="tag-bar" ref={elementRef}>
          <span className="material-icons search-icon">search</span>
          {
            autoCompleteValue.map((value, index) => {
              return (
                <Tag
                  key={index}
                  index={index}
                  value={value}
                  removeTag={removeTag}
                  editTagIndex={editTagIndex}
                  setEditTagIndex={setEditTagIndex}
                  autoCompleteValue={autoCompleteValue}
                  handleAutoCompleteValueChange={handleAutoCompleteValueChange}
                />
              );
            })
          }
          <Filter
            elementRef={elementRef}
            autoCompleteValue={autoCompleteValue}
            handleAutoCompleteValueChange={handleAutoCompleteValueChange}
            filterQueryFlag={filterQueryFlag}
          />
        </div>}
    </div>
  )
}

export default SearchBar;
