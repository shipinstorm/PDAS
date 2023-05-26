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
	jobJobSelectedId,
	jobJobExpanded,
	jobGraphSelected,
	jobArraySelected,
	jobTaskSelected,
	jobJobSelected
} from '../../store/actions/jobAction';

import { dGraphData, dArrayData, dTaskData } from "../../services/mockData";

import { generateSearchQueries } from '../../utils/utils';

import Banner from "../Banner/Banner";
import SearchBar from '../SearchBar/SearchBar';
import HeaderButtons from '../HeaderButtons';
import DetailsPane from "../DetailsPane/DetailsPane";
import GraphTable from '../GraphTable/GraphTable';
import LogPane from '../LogPane/LogPane';
import CodaModal from "../Modals/CodaModal";

import '../../assets/css/MaterialIcons.css';
import '../../assets/css/App.css';

export default function Dashboard() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

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
	const viewLog = useSelector((state) => state.global.viewLog);

	const graphData = useSelector((state) => state.global.graphData);
	const arrayData = useSelector((state) => state.global.arrayData);
	const taskData = useSelector((state) => state.global.taskData);
	const imagePaths = useSelector((state) => state.global.imagePaths);
	const elasticSearchService = useSelector((state) => state.global.elasticSearchService);

	const jobSelected = useSelector((state) => state.job.jobSelected);
	const jobSelectedId = useSelector((state) => state.job.jobSelectedId);
	const jobExpanded = useSelector((state) => state.job.jobExpanded);
	const [jobListLoading, setJobListLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const [initSearchQuery,] = useState(getInitSearchQuery());
	const [autoCompleteValue, setAutoCompleteValue] = useState(initSearchQuery);
	const [filterQueryFlag, setFilterQueryFlag] = useState([]);

	const navBarHeight = 60;
	const bannerHeight = 21;
	const [mainContentWrapperTop, setMainContentWrapperTop] = useState(navBarHeight + bannerHeight);

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
					dispatch(globalViewLog(true));
				} else if (logPaneRef.current.getBoundingClientRect().bottom - mouseMoveEvent.clientY <= 8 && viewLog) {
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
			;
		}
	}, [viewLog, logPaneHeight]);

	useEffect(() => {
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
		setJobListLoading(true);

		/**
		 * This is for ElasticSearch
		 * Comment out below section when you work with Mock Data
		 */
		// elasticSearchService.getDgraphs(elasticSearchQuery, from, size, tmpFilterQueryFlag.display.hidden).then(
		// 	(result) => {
		// 		let tmpGraphData = [];
		// 		if (expandFlag) {
		// 			tmpGraphData = graphData;
		// 		}
		// 		result.hits.hits.map(doc => tmpGraphData.push(doc._source));
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
	}

	useEffect(() => {
		navigate('/search?q=' + searchQuery + '&sel=' + jobSelectedId + '&exp=' + jobExpanded + '&details=' + viewDetails + '&log=' + viewLog);
	}, [navigate, searchQuery, jobSelectedId, jobExpanded, viewDetails, viewLog]);

	useEffect(() => {
		let jobID = null;
		let graphID = null, arrayID = null, taskID = null;
		if (jobSelectedId.length) {
			jobID = jobSelectedId[jobSelectedId.length - 1].split('.');
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

		let tmpJobSelected = jobSelected;
		if (jobSelected.length === jobSelectedId.length - 1) {
			dispatch(jobJobSelected([...tmpJobSelected, tmp[0]]));
		} else if (jobSelected.length === jobSelectedId.length + 1) {
			tmpJobSelected.pop();
			dispatch(jobJobSelected(tmpJobSelected));
		} else {
			tmpJobSelected = [];
			for (let i = 0; i < jobSelectedId.length; i++) {
				jobID = graphID = arrayID = taskID = null;
				jobID = jobSelectedId[i].split('.');
				if (jobID) {
					graphID = jobID.length >= 1 ? jobID[0] : null;
					arrayID = jobID.length >= 2 ? jobID[1] : null;
					taskID = jobID.length >= 3 ? jobID[2] : null;
				}

				tmp = null;
				if (taskID) {
					tmp = (taskData[Number(graphID)] && taskData[Number(graphID)][Number(arrayID)]) ? taskData[Number(graphID)][Number(arrayID)].filter((data) => data.tid === Number(taskID)) : [{}];
				} else if (arrayID) {
					tmp = arrayData[Number(graphID)] ? arrayData[Number(graphID)].filter((data) => data.aid === Number(arrayID)) : [{}];
				} else {
					tmp = graphData.filter((data) => data.did === Number(graphID));
				}
				tmpJobSelected = [...tmpJobSelected, tmp[0]];
			}
			dispatch(jobJobSelected(tmpJobSelected));
		}
	}, [dispatch, graphData, arrayData, taskData, jobSelectedId]);

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

			let tmpJobSelectedId = searchParamsObject.selected ? searchParamsObject.selected.split(",") : [];
			let tmpJobExpanded = searchParamsObject.expanded ? searchParamsObject.expanded.split(",") : [];

			setAutoCompleteValue(initSearchQuery);
			searchQueryHandle(initSearchQuery, false, true);
			await Promise.all(
				tmpJobExpanded.map(async (row) => {
					let jobID = row.split(".");
					await toggleJob(jobID[0]);
				})
			);

			tmpJobSelectedId.map(selected => {
				let jobID = selected.split(".");
				if (jobID[2]) {
					imagePaths[jobID[0] + '.' + jobID[1] + '.' + jobID[2]] = elasticSearchService.playImages(jobID[0], jobID[1], jobID[2]);
					dispatch(globalImagePaths(imagePaths));
				} else if (jobID[1]) {
					imagePaths[jobID[0] + '.' + jobID[1]] = elasticSearchService.playImages(jobID[0], jobID[1]);
					dispatch(globalImagePaths(imagePaths));
				} else if (jobID[0]) {
					imagePaths[jobID[0]] = elasticSearchService.playImages(jobID[0]);
					dispatch(globalImagePaths(imagePaths));
				}
			})

			// Update global variables from url
			dispatch(jobJobSelectedId(tmpJobSelectedId));
			dispatch(jobJobExpanded(tmpJobExpanded));
			dispatch(globalViewLog(searchParamsObject.log === 'true' ? true : false));
		}
		foo();
	}, []);

	const toggleDetails = () => {
		setViewDetails(!viewDetails);
	}

	const toggleLog = () => {
		dispatch(globalViewLog(!viewLog));
	}

	const toggleJob = async (jobId) => {
		setJobListLoading(true);
		// await elasticSearchService.getArrays(jobId).then(async (resultArray) => {
			let newArrayData = {};
			// newArrayData = { ...arrayData, [jobId]: resultArray.hits.hits.map(doc => doc._source) };
			newArrayData = { ...arrayData, [jobId]: dArrayData.hits.hits.map(doc => doc._source) };

			let newTaskData = {};
			let tmp = [];
			await Promise.all(newArrayData[jobId].map(async (array) => {
				// await elasticSearchService.getTasks(jobId, array.aid).then((resultTask) => {
					// tmp[array.aid] = resultTask.hits.hits.map(doc => doc._source);
					tmp[array.aid] = dTaskData.hits.hits.map(doc => doc._source);
				// });
			}))
			newTaskData = { ...taskData, [jobId]: tmp };
			dispatch(globalArrayData(newArrayData));
			dispatch(globalTaskData(newTaskData));
			setJobListLoading(false);
		// });
	}

	return (
		<div className="app">
			<Banner
				mainContentWrapperTop={mainContentWrapperTop}
				setMainContentWrapperTop={setMainContentWrapperTop}
			/>
			<div className="app-header">
				<div className="app-searchbar">
					<div className="coda-logo">CODA</div>
					<CodaModal />
					<SearchBar
						autoCompleteValue={autoCompleteValue}
						setAutoCompleteValue={setAutoCompleteValue}
						setSearchQuery={searchQueryHandle}
						filterQueryFlag={filterQueryFlag}
					/>
				</div>
				<HeaderButtons toggleDetails={toggleDetails} toggleLog={toggleLog} />
			</div>
			<div className="main-content-wrapper" style={{ top: mainContentWrapperTop }}>
				<div className="app-container" style={viewDetails ? { width: 'calc(100vw - 400px)' } : {}}>
					<div className="app-frame" style={{ height: 'calc(100% - ' + logPaneHeight + 'px)' }}>
						<GraphTable
							viewDetails={viewDetails}
							loading={jobListLoading}
							onToggleClick={async (jobId) => { await toggleJob(jobId); }}
							autoCompleteValue={autoCompleteValue}
							setSearchQuery={searchQueryHandle}
							toggleDetails={toggleDetails}
							toggleLog={toggleLog}
							mainContentWrapperTop={mainContentWrapperTop}
						/>
					</div>
					<div
						ref={logPaneRef}
						className="app-sidebar"
						style={{ height: logPaneHeight, width: 'calc(100% - ' + (viewDetails ? 400 : 0) + 'px)' }}
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