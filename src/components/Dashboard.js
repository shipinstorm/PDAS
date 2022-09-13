import React from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom"

import SearchBar from './SearchBar/SearchBar';
import HeaderButtons from './HeaderButtons';
import DetailsPane from './DetailsPane';
import JobList from './JobList';
import LogPane from './LogPane';
import { dGraphData, dArrayData, dTaskData } from "../services/mockData";
import ElasticSearchService from "../services/ElasticSearch.service";

import '../css/MaterialIcons.css';
import '../css/App.css';

export default function Dashboard() {
	const navigate = useNavigate();

	/**
	 * The useSearchParams hook is used to read and modify the query string in the URL for the current location.
	 * Like React's own useState hook, useSearchParams returns an array of two values: the current location's search params and a function that may be used to update them.
	 */
	const [searchParams, ] = useSearchParams();
	let searchParamsObject = {
		"query": searchParams.get('q'),
		"expanded": searchParams.get("exp"),
		"details": searchParams.get("details"),
		"log": searchParams.get("log"),
	};

	const getInitSearchQuery = () => {
		let res = [];

		if (!searchParamsObject.query) return res;

		const filterArray = searchParamsObject.query.split(',');
		filterArray.map((array) => {
			const tmp = array.split(/:(.*)/s);
			res.push({
				header: tmp[0],
				title: tmp[1],
			});
		})

		return res;
	}

	// Initialize from searchParamsObject
	const [viewDetails, setViewDetails] = useState(searchParamsObject.details === 'true' ? true : false);
	const [viewLog, setViewLog] = useState(searchParamsObject.log === 'true' ? true : false);
	const [graphData, setGraphData] = useState([]);
	const [searchArrayData, setSearchArrayData] = useState([]);
	const [searchTaskData, setSearchTaskData] = useState([]);
	const [jobListLoading, setJobListLoading] = useState(true);
	const [rowsExpanded, setRowsExpanded] = useState(searchParamsObject.expanded ? JSON.parse("[" + searchParamsObject.expanded + "]") : []);
	const [searchQuery, setSearchQuery] = useState('');
	const [initSearchQuery, ] = useState(getInitSearchQuery());
	const [autoCompleteValue, setAutoCompleteValue] = useState(initSearchQuery);
	const [filterQueryFlag, setFilterQueryFlag] = useState([]);
	// For MUIDataTable pagination
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [currentPage, setCurrentPage] = useState(0);

	const searchQueryHandle = (newSearchQuery, from=currentPage * rowsPerPage, size=rowsPerPage * 2) => {
		var now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

		let elasticSearchQuery = '(';
		let urlSearchQuery = '';
		let tmpFilterQueryFlag = {
			status: {},
			dept: {},
			type: {},
			display: {},
			show: "All Shows",
			after: filterQueryFlag.after ? filterQueryFlag.after : now.toISOString().slice(0,16)
		};
		
		// Sort query by title
		newSearchQuery.sort((a, b) => {
			return a.header.charCodeAt(0) - b.header.charCodeAt(0);
		});
		
		// Generate ElasticSearch query
		let beforeHeader = '';
		const generateSubQuery = (header) => {
			if (beforeHeader !== header) {
				if (beforeHeader !== '') {
					elasticSearchQuery = elasticSearchQuery.slice(0, -4);
					elasticSearchQuery += ') AND '
				}
				elasticSearchQuery += '(';
				beforeHeader = header;
			}
		}
		newSearchQuery.map((query) => {
			if (query.header === 'user') {
				generateSubQuery(query.header);
				elasticSearchQuery += 'icoda_username:' + query.title + ' OR ';
				urlSearchQuery += 'user:' + query.title + ',';
			} else if (query.header === 'title') {
				generateSubQuery(query.header);
				elasticSearchQuery += 'title:' + query.title + ' OR ';
				urlSearchQuery += 'title:' + query.title + ',';
			} else if (query.header === 'status') {
				generateSubQuery(query.header);
				tmpFilterQueryFlag.status[query.title] = true;
				elasticSearchQuery += '_statusname:' + query.title + ' OR ';
				urlSearchQuery += 'status:' + query.title + ',';
			} else if (query.header === 'dept') {
				generateSubQuery(query.header);
				tmpFilterQueryFlag.dept[query.title] = true;
				elasticSearchQuery += 'title:*' + query.title + '* OR ';
				urlSearchQuery += 'dept:' + query.title + ',';
			} else if (query.header === 'type') {
				generateSubQuery(query.header);
				tmpFilterQueryFlag.type[query.title] = true;
				elasticSearchQuery += 'title:*' + query.title + '* OR ';
				urlSearchQuery += 'type:' + query.title + ',';
			} else if (query.header === 'show') {
				generateSubQuery(query.header);
				tmpFilterQueryFlag.show = query.title;
				elasticSearchQuery += 'title:*' + query.title + '* OR ';
				urlSearchQuery += 'show:' + query.title + ',';
			} else if (query.header === 'display') {
				generateSubQuery(query.header);
				tmpFilterQueryFlag.display[query.title] = true;
				elasticSearchQuery += 'title:*' + query.title + '* OR ';
				urlSearchQuery += 'display:' + query.title + ',';
			} else if (query.header === 'after') {
				generateSubQuery(query.header);
				tmpFilterQueryFlag.after = query.title;
				elasticSearchQuery += '_submittime:[' + query.title + ' TO *] OR ';
				urlSearchQuery += 'after:' + query.title + ',';
			}
		})
		if (elasticSearchQuery === '(') {
			elasticSearchQuery = '';
		} else {
			elasticSearchQuery = elasticSearchQuery.slice(0, -4) + '))';
		}
		urlSearchQuery = urlSearchQuery.slice(0, -1);
		setSearchQuery(urlSearchQuery);

		setFilterQueryFlag(tmpFilterQueryFlag);

		/**
		 * This is for ElasticSearch
		 * Comment out below section when you work with Mock Data
		 */
		ElasticSearchService.getDgraphs(elasticSearchQuery, from, size).then(
		 	(result) => {
				let tmpGraphData = [];
				for (var i = 0; i < from; i++) {
					tmpGraphData.push({});
				}
				result.hits.hits.map(doc => tmpGraphData.push(doc._source));
				setGraphData(tmpGraphData);
				setJobListLoading(false);
			}
		)
				
		navigate('/search?q=' + urlSearchQuery + '&exp=' + rowsExpanded.toString() + '&details=' + viewDetails + '&log=' + viewLog);

		/**
		 * This is for Mock Data
		 * Comment out below section when you work with ElasticSearch
		 */
		let icoda_username = [], title = [], status = [], after = [], dept = [], type = [], show = [];
		newSearchQuery.map((query) => {
			if (query.header === 'user') {
				icoda_username.push(query.title)
			} else if (query.header === 'title') {
				title.push(query.title)
			} else if (query.header === 'status') {
				status.push(query.title)
			} else if (query.header === 'dept') {
				dept.push(query.title)
			} else if (query.header === 'type') {
				type.push(query.title)
			} else if (query.header === 'show') {
				show.push(query.title)
			} else if (query.header === 'after') {
				after.push(query.title)
			}
		})

		let tmpGraphData = dGraphData.hits.hits.filter(doc => {
			return (!icoda_username.length || icoda_username.includes(doc._source.icoda_username)) &&
				(!title.length || title.includes(doc._source.title)) &&
				(!status.length || status.includes(doc._source._statusname));
		});
		// Query after
		if (after.length === 1) {
			tmpGraphData = tmpGraphData.filter(doc => {
				return doc._source._submittime >= after[0];
			})
		}
		setGraphData(tmpGraphData.map((doc) => doc._source))
		setJobListLoading(false);
	}

	useEffect(() => {
		/**
		 * When a user first logs or navigates to the base url
		 * Auto populate the search bar to query for jobs submitted by them in the last two days.
		 */
		if (searchParamsObject.details == null && searchParamsObject.expanded == null && searchParamsObject.log == null && searchParamsObject.query == null) {
			var yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setMinutes(yesterday.getMinutes() - yesterday.getTimezoneOffset());

			initSearchQuery.push({
				header: 'after',
				title: yesterday.toISOString().slice(0, 16),
			});

			initSearchQuery.push({
				header: 'user',
				title: 'lean',
			});
		}
		
		rowsExpanded.map(row => toggleJob(row))
		setAutoCompleteValue(initSearchQuery);
		searchQueryHandle(initSearchQuery);
	}, []);
	
	const toggleDetails = () => {
		navigate('/search?q=' + searchQuery + '&exp=' + rowsExpanded.toString() + '&details=' + !viewDetails + '&log=' + viewLog);
		setViewDetails(!viewDetails);
	}

	const toggleLog = () => {
		navigate('/search?q=' + searchQuery + '&exp=' + rowsExpanded.toString() + '&details=' + viewDetails + '&log=' + !viewLog);
		setViewLog(!viewLog);
	}

	const toggleJob = (jobId) => {
		// ElasticSearchService.getArrays(graphData[jobId].did).then((resultArray) => {
			let newArrayData = searchArrayData;
			// newArrayData[jobId] = resultArray.hits.hits.map(doc => doc._source);
			newArrayData[jobId] = dArrayData.hits.hits.map(doc => doc._source);
			setSearchArrayData(newArrayData);
			setJobListLoading(false);

			let newTaskData = searchTaskData;
			newTaskData[jobId] = new Array();
			setSearchTaskData(newTaskData);
			setJobListLoading(false);
			newArrayData[jobId].map((array) => {
				// ElasticSearchService.getTasks(graphData[jobId].did, array.aid).then((resultTask) => {
					let newTaskData = searchTaskData;
					// newTaskData[jobId][array.aid] = resultTask.hits.hits.map(doc => doc._source);
					newTaskData[jobId][array.aid] = dTaskData.hits.hits.map(doc => doc._source);
					setSearchTaskData(newTaskData);
				// });
			})
		// });
	}

	const rowsExpandedHandle = (expanded) => {
		const newExpanded = expanded.map((exp) => {
			return exp.dataIndex;
		})
		setRowsExpanded(newExpanded);
		navigate('/search?q=' + searchQuery + '&exp=' + newExpanded.toString() + '&details=' + viewDetails + '&log=' + viewLog);
	}

	const convertToSearchGraphData = (graphData) => {
		let data = [], uniqueChars, tmp;
		tmp = graphData.map((d) => {
			return d.icoda_username;
		})
		uniqueChars = [...new Set(tmp)];
		uniqueChars.map((d) => {
			data.push({
				title: '' + d,
				header: 'user'
			})
		})
		tmp = graphData.map((d) => {
			return d.title;
		})
		uniqueChars = [...new Set(tmp)];
		uniqueChars.map((d) => {
			data.push({
				title: '' + d,
				header: 'title'
			})
		})
		tmp = graphData.map((d) => {
			return d._statusname;
		})
		uniqueChars = [...new Set(tmp)];
		uniqueChars.map((d) => {
			data.push({
				title: '' + d,
				header: 'status'
			})
		})
		return data;
	}

	const searchGraphData = convertToSearchGraphData(graphData);

	return (
		<div className="app">
			<div className="app-header">
				<div className="app-searchbar">
					<div className="coda-logo">CODA</div>
					<SearchBar
						graphData={searchGraphData}
						autoCompleteValue={autoCompleteValue}
						setAutoCompleteValue={setAutoCompleteValue}
						setSearchQuery={searchQueryHandle}
						filterQueryFlag={filterQueryFlag}
					/>
				</div>
				<HeaderButtons toggleDetails={toggleDetails} toggleLog={toggleLog} />
			</div>
			<div className="main-content">
				<JobList
					viewDetails={viewDetails} 
					viewLog={viewLog} 
					loading={jobListLoading} 
					graphData={graphData} 
					searchArrayData={searchArrayData}
					searchTaskData={searchTaskData}
					onToggleClick={(jobId) => toggleJob(jobId)}
					rowsExpanded={rowsExpanded}
					setRowsExpanded={(expanded) => rowsExpandedHandle(expanded)}
					rowsPerPage={rowsPerPage}
					setRowsPerPage={setRowsPerPage}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
					autoCompleteValue={autoCompleteValue}
					setSearchQuery={searchQueryHandle}
				/>
				<DetailsPane isHidden={!viewDetails}/>
				<LogPane isHidden={!viewLog} viewDetails={viewDetails} />
			</div>
		</div>
	);
}