import React from "react";
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from "react-router-dom";

import {
	globalGraphData,
	globalArrayData,
	globalTaskData,
	globalImagePaths,
	globalViewLog
} from '../../store/actions/globalAction';
import {
	jobRowsSelected,
	jobJobSelected,
	jobGraphSelected,
	jobArraySelected,
	jobTaskSelected
} from '../../store/actions/jobAction';

import { dGraphData, dArrayData, dTaskData } from "../../services/mockData";
import ElasticSearchService from "../../services/ElasticSearch.service";

import { generateSearchQueries } from '../../utils/utils';

import SearchBar from '../SearchBar/SearchBar';
import HeaderButtons from '../HeaderButtons';
import DetailsPane from "../DetailsPane/DetailsPane";
import GraphTable from '../GraphTable/GraphTable';
import LogPane from '../LogPane/LogPane';

import '../../assets/css/MaterialIcons.css';
import '../../assets/css/App.css';

export default function Dashboard() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const imagePaths = useSelector((state) => state.global.imagePaths);

	/**
	 * The useSearchParams hook is used to read and modify the query string in the URL for the current location.
	 * Like React's own useState hook, useSearchParams returns an array of two values: the current location's search params and a function that may be used to update them.
	 */
	const [searchParams,] = useSearchParams();
	let searchParamsObject = {
		"query": searchParams.get('q'),
		"selected": searchParams.get('sel'),
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
			if (tmp[1]) {
				res.push({
					header: tmp[0],
					title: tmp[1],
				});
			} else {
				res.push({
					header: '',
					title: tmp[0],
				});
			}
		})

		return res;
	}

	const logPaneRef = useRef(null);
	// Initialize from searchParamsObject
	const [viewDetails, setViewDetails] = useState(searchParamsObject.details === 'true' ? true : false);
	// For LogPane Resize
	const [isLogPaneResizing, setIsLogPaneResizing] = useState(false);
	const [logPaneHeight, setLogPaneHeight] = useState(searchParamsObject.log === 'true' ? 268 : 6);

	const graphData = useSelector((state) => state.global.graphData);
	const arrayData = useSelector((state) => state.global.arrayData);
	const taskData = useSelector((state) => state.global.taskData);
	const viewLog = useSelector((state) => state.global.viewLog);
	const jobSelected = useSelector((state) => state.job.jobSelected);
	const [jobListLoading, setJobListLoading] = useState(true);
	const [rowsExpandedJobID, setRowsExpandedJobID] = useState(searchParamsObject.expanded ? JSON.parse("[" + searchParamsObject.expanded + "]") : []);
	const [rowsExpandedIndex, setRowsExpandedIndex] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [initSearchQuery,] = useState(getInitSearchQuery());
	const [autoCompleteValue, setAutoCompleteValue] = useState(initSearchQuery);
	const [filterQueryFlag, setFilterQueryFlag] = useState([]);

	useEffect(() => {
		dispatch(jobJobSelected(searchParamsObject.selected ? searchParamsObject.selected : ''));
		dispatch(globalViewLog(searchParamsObject.log === 'true' ? true : false));
	}, []);

	const startResizing = React.useCallback((mouseDownEvent) => {
		setIsLogPaneResizing(true);
	}, []);

	const stopResizing = React.useCallback(() => {
		setIsLogPaneResizing(false);
	}, []);

	const resize = React.useCallback(
		(mouseMoveEvent) => {
			if (isLogPaneResizing) {
				setLogPaneHeight(
					logPaneRef.current.getBoundingClientRect().bottom -
					mouseMoveEvent.clientY
				);
				if (logPaneRef.current.getBoundingClientRect().bottom - mouseMoveEvent.clientY > 8 && !viewLog) {
					navigate('/search?q=' + searchQuery + '&sel=' + jobSelected + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + true);
					dispatch(globalViewLog(true));
				} else if (logPaneRef.current.getBoundingClientRect().bottom - mouseMoveEvent.clientY <= 8 && viewLog) {
					navigate('/search?q=' + searchQuery + '&sel=' + jobSelected + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + false);
					dispatch(globalViewLog(false));
				}
			}
		},
		[isLogPaneResizing]
	);
		
	useEffect(() => {
		if (viewLog && logPaneHeight <= 8) {
			setLogPaneHeight(200);
		} else if (!viewLog && logPaneHeight > 8) {
			setLogPaneHeight(0);
		;}
	}, [viewLog]);

	React.useEffect(() => {
		window.addEventListener("mousemove", resize);
		window.addEventListener("mouseup", stopResizing);
		return () => {
			window.removeEventListener("mousemove", resize);
			window.removeEventListener("mouseup", stopResizing);
		};
	}, [resize, stopResizing]);

	const searchQueryHandle = (newSearchQuery, expandFlag = false, firstRun = false) => {
		let from = 0;
		let size = 50;

		if (expandFlag) {
			from = graphData.length;
		}

		// Sort query by title
		newSearchQuery.sort((a, b) => {
			return a.header.charCodeAt(0) - b.header.charCodeAt(0);
		});

		const [urlSearchQuery, elasticSearchQuery, tmpFilterQueryFlag] = generateSearchQueries(newSearchQuery, filterQueryFlag);

		setSearchQuery(urlSearchQuery);
		setFilterQueryFlag(tmpFilterQueryFlag);

		/**
		 * This is for ElasticSearch
		 * Comment out below section when you work with Mock Data
		 */
		// ElasticSearchService.getDgraphs(elasticSearchQuery, from, size, tmpFilterQueryFlag.display.hidden).then(
		//  	(result) => {
		// 		let tmpGraphData = [];
		// 		if (expandFlag) {
		// 			tmpGraphData = graphData;
		// 		}
		// 		result.hits.hits.map(doc => tmpGraphData.push(doc._source));
		// 		let tmpRowsExpanded = [];
		// 		rowsExpandedJobID.map((exp) => {
		// 			result.hits.hits.map((doc, index) => {
		// 				if (doc._source.did == exp)
		// 					tmpRowsExpanded.push(index);
		// 			})
		// 		})
		// 		if (firstRun && searchParamsObject.selected) {
		// 			tmpGraphData.map((data, index) => {
		// 				if(data.did.toString() == searchParamsObject.selected.toString()) {
		// 					dispatch(jobRowsSelected([index]));
		// 				}
		// 			})
		// 		}
		// 		setRowsExpandedIndex(tmpRowsExpanded);
		// 		dispatch(globalGraphData(tmpGraphData));
		// 		setJobListLoading(false);
		// 	}
		// )

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
		dispatch(globalGraphData(tmpGraphData.map((doc) => doc._source)));
		setJobListLoading(false);



		navigate('/search?q=' + urlSearchQuery + '&sel=' + jobSelected + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + viewLog);
	}

	useEffect(() => {
		navigate('/search?q=' + searchQuery + '&sel=' + jobSelected + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + viewLog);
	}, [jobSelected])

	useEffect(() => {
		let jobID = null;
		let graphID = null, arrayID = null, taskID = null;
		if (jobSelected) {
			jobID = jobSelected.toString().split('.');
		}
		if (jobID) {
			graphID = jobID.length >= 1 ? jobID[0] : null;
			arrayID = jobID.length >= 2 ? jobID[1] : null;
			taskID = jobID.length >= 3 ? jobID[2] : null;
		}

		let tmp = null;
		if (taskID) {
			tmp = (taskData[Number(graphID)] && taskData[Number(graphID)][Number(arrayID)]) ? taskData[Number(graphID)][Number(arrayID)].filter((data) => data.tid === Number(taskID)) : [{}];
			dispatch(jobGraphSelected({}));
			dispatch(jobArraySelected({}));
			dispatch(jobTaskSelected(tmp[0] ? tmp[0] : {}));
		} else if (arrayID) {
			tmp = arrayData[Number(graphID)] ? arrayData[Number(graphID)].filter((data) => data.aid === Number(arrayID)) : [{}];
			dispatch(jobGraphSelected({}));
			dispatch(jobArraySelected(tmp[0] ? tmp[0] : {}));
			dispatch(jobTaskSelected({}));
		} else {
			tmp = graphData.filter((data) => data.did === Number(graphID));
			dispatch(jobGraphSelected(tmp[0] ? tmp[0] : {}));
			dispatch(jobArraySelected({}));
			dispatch(jobTaskSelected({}));
		}
	}, [graphData, arrayData, taskData, jobSelected]);

	useEffect(() => {
		async function foo() {
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

			await Promise.all(rowsExpandedJobID.map(async (row) => { await toggleJob(row); }));
			setAutoCompleteValue(initSearchQuery);
			searchQueryHandle(initSearchQuery, false, true);

			let jobID = searchParamsObject.selected ? searchParamsObject.selected.split('.') : [];
			if (jobID[2]) {
				imagePaths[jobID[0] + '.' + jobID[1] + '.' + jobID[2]] = ElasticSearchService.playImages(jobID[0], jobID[1], jobID[2]);
				dispatch(globalImagePaths(imagePaths));
			} else if (jobID[1]) {
				imagePaths[jobID[0] + '.' + jobID[1]] = ElasticSearchService.playImages(jobID[0], jobID[1]);
				dispatch(globalImagePaths(imagePaths));
			} else if (jobID[0]) {
				imagePaths[jobID[0]] = ElasticSearchService.playImages(jobID[0]);
				dispatch(globalImagePaths(imagePaths));
			}

			if (jobID[0]) {
				await toggleJob(jobID[0]);
			}
		}
		foo();
	}, []);

	const toggleDetails = () => {
		navigate('/search?q=' + searchQuery + '&sel=' + jobSelected + '&exp=' + rowsExpandedJobID.toString() + '&details=' + !viewDetails + '&log=' + viewLog);
		setViewDetails(!viewDetails);
	}

	const toggleLog = () => {
		navigate('/search?q=' + searchQuery + '&sel=' + jobSelected + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + !viewLog);
		dispatch(globalViewLog(!viewLog));
	}

	const toggleJob = async (jobId) => {
		// await ElasticSearchService.getArrays(jobId).then(async (resultArray) => {
		let newArrayData = arrayData;
		// newArrayData[jobId] = resultArray.hits.hits.map(doc => doc._source);
		newArrayData[jobId] = dArrayData.hits.hits.map(doc => doc._source);

		let newTaskData = taskData;
		newTaskData[jobId] = new Array();
		await Promise.all(newArrayData[jobId].map(async (array) => {
			// await ElasticSearchService.getTasks(jobId, array.aid).then((resultTask) => {
			// newTaskData[jobId][array.aid] = resultTask.hits.hits.map(doc => doc._source);
			newTaskData[jobId][array.aid] = dTaskData.hits.hits.map(doc => doc._source);
			// });
		}))
		dispatch(globalArrayData(newArrayData));
		dispatch(globalTaskData(newTaskData));
		setJobListLoading(false);
		// });
	}

	const rowsExpandedHandle = (expanded) => {
		const newExpanded = expanded.map((exp) => {
			return graphData[exp.dataIndex].did;
		})
		let tmpRowsExpanded = [];
		newExpanded.map((exp) => {
			graphData.map((graph, index) => {
				if (graph.did === exp) {
					tmpRowsExpanded.push(index);
				}
			})
		})
		setRowsExpandedIndex(tmpRowsExpanded);
		setRowsExpandedJobID(newExpanded);
	}
	
	return (
		<div className="app">
			<div className="app-header">
				<div className="app-searchbar">
					<div className="coda-logo">CODA</div>
					<SearchBar
						autoCompleteValue={autoCompleteValue}
						setAutoCompleteValue={setAutoCompleteValue}
						setSearchQuery={searchQueryHandle}
						filterQueryFlag={filterQueryFlag}
					/>
				</div>
				<HeaderButtons toggleDetails={toggleDetails} toggleLog={toggleLog} />
			</div>
			<div className="main-content">
				<div className="app-container">
					<div className="app-frame" style={{ bottom: logPaneHeight }}>
						<GraphTable
							viewDetails={viewDetails}
							loading={jobListLoading}
							onToggleClick={async (jobId) => { await toggleJob(jobId); }}
							rowsExpanded={rowsExpandedIndex}
							setRowsExpanded={(expanded) => rowsExpandedHandle(expanded)}
							autoCompleteValue={autoCompleteValue}
							setSearchQuery={searchQueryHandle}
						/>
					</div>
					<div
						ref={logPaneRef}
						className="app-sidebar"
						style={{ height: logPaneHeight }}
						onMouseDown={(e) => e.preventDefault()}
					>
						<div className="app-sidebar-resizer" onMouseDown={startResizing} />
						<div className="app-sidebar-content">
							<LogPane />
						</div>
					</div>
				</div>
				{viewDetails && <DetailsPane />}
			</div>
		</div>
	);
}
