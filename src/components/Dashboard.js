import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from "react-router-dom"

import {
	globalGraphData,
	globalArrayData,
	globalTaskData
} from '../store/actions/globalAction';

import { dGraphData, dArrayData, dTaskData } from "../services/mockData";
import ElasticSearchService from "../services/ElasticSearch.service";

import { generateSearchQueries } from '../utils/utils';

import SearchBar from './SearchBar/SearchBar';
import HeaderButtons from './HeaderButtons';
import DetailsPane from './DetailsPane';
import GraphTable from './GraphTable/GraphTable';
import LogPane from './LogPane';

import '../assets/css/MaterialIcons.css';
import '../assets/css/App.css';

export default function Dashboard() {
	const navigate = useNavigate();
	const dispatch = useDispatch();

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

	/**
	 * Initialize from searchParamsObject
	 */
	const [viewDetails, setViewDetails] = useState(searchParamsObject.details === 'true' ? true : false);
	const [viewLog, setViewLog] = useState(searchParamsObject.log === 'true' ? true : false);
	const graphData = useSelector((state) => state.global.graphData);
	const arrayData = useSelector((state) => state.global.arrayData);
	const taskData = useSelector((state) => state.global.taskData);
	const [jobListLoading, setJobListLoading] = useState(true);
	const [rowsExpandedJobID, setRowsExpandedJobID] = useState(searchParamsObject.expanded ? JSON.parse("[" + searchParamsObject.expanded + "]") : []);
	const [rowsExpandedIndex, setRowsExpandedIndex] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [initSearchQuery, ] = useState(getInitSearchQuery());
	const [autoCompleteValue, setAutoCompleteValue] = useState(initSearchQuery);
	const [filterQueryFlag, setFilterQueryFlag] = useState([]);
	/**
	 * For DetailsPanel
	 */
	const [jobSelected, setJobSelected] = useState("");

	const searchQueryHandle = (newSearchQuery, expandFlag =false) => {
		let from = 0;
		let size = 200;

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
		ElasticSearchService.getDgraphs(elasticSearchQuery, from, size, tmpFilterQueryFlag.display.hidden).then(
		 	(result) => {
				let tmpGraphData = [];
				if (expandFlag) {
					tmpGraphData = graphData;
				}
				result.hits.hits.map(doc => tmpGraphData.push(doc._source));
				let tmpRowsExpanded = [];
				rowsExpandedJobID.map((exp) => {
					result.hits.hits.map((doc, index) => {
						if (doc._source.did == exp)
							tmpRowsExpanded.push(index);
					})
				})
				setRowsExpandedIndex(tmpRowsExpanded);
				dispatch(globalGraphData(tmpGraphData));
				setJobListLoading(false);
			}
		)

		navigate('/search?q=' + urlSearchQuery + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + viewLog);

		/**
		 * This is for Mock Data
		 * Comment out below section when you work with ElasticSearch
		 */
		// let icoda_username = [], title = [], status = [], after = [], dept = [], type = [], show = [];
		// newSearchQuery.map((query) => {
		// 	if (query.header === 'user') {
		// 		icoda_username.push(query.title)
		// 	} else if (query.header === 'title') {
		// 		title.push(query.title)
		// 	} else if (query.header === 'status') {
		// 		status.push(query.title)
		// 	} else if (query.header === 'dept') {
		// 		dept.push(query.title)
		// 	} else if (query.header === 'type') {
		// 		type.push(query.title)
		// 	} else if (query.header === 'show') {
		// 		show.push(query.title)
		// 	} else if (query.header === 'after') {
		// 		after.push(query.title)
		// 	}
		// })

		// let tmpGraphData = dGraphData.hits.hits.filter(doc => {
		// 	return (!icoda_username.length || icoda_username.includes(doc._source.icoda_username)) &&
		// 		(!title.length || title.includes(doc._source.title)) &&
		// 		(!status.length || status.includes(doc._source._statusname));
		// });
		// // Query after
		// if (after.length === 1) {
		// 	tmpGraphData = tmpGraphData.filter(doc => {
		// 		return doc._source._submittime >= after[0];
		// 	})
		// }
		// dispatch(globalGraphData(tmpGraphData.map((doc) => doc._source)));
		// setJobListLoading(false);
	}

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
	
			await Promise.all(rowsExpandedJobID.map(async (row) => {await toggleJob(row);}));
			setAutoCompleteValue(initSearchQuery);
			searchQueryHandle(initSearchQuery);
		}
		foo();
	}, []);

	const toggleDetails = () => {
		navigate('/search?q=' + searchQuery + '&exp=' + rowsExpandedJobID.toString() + '&details=' + !viewDetails + '&log=' + viewLog);
		setViewDetails(!viewDetails);
	}

	const toggleLog = () => {
		navigate('/search?q=' + searchQuery + '&exp=' + rowsExpandedJobID.toString() + '&details=' + viewDetails + '&log=' + !viewLog);
		setViewLog(!viewLog);
	}

	const toggleJob = async (jobId) => {
		await ElasticSearchService.getArrays(jobId).then(async (resultArray) => {
			let newArrayData = arrayData;
		  newArrayData[jobId] = resultArray.hits.hits.map(doc => doc._source);
			// newArrayData[jobId] = dArrayData.hits.hits.map(doc => doc._source);

			let newTaskData = taskData;
			newTaskData[jobId] = new Array();
			await Promise.all(newArrayData[jobId].map(async (array) => {
				await ElasticSearchService.getTasks(jobId, array.aid).then((resultTask) => {
					newTaskData[jobId][array.aid] = resultTask.hits.hits.map(doc => doc._source);
					// newTaskData[jobId][array.aid] = dTaskData.hits.hits.map(doc => doc._source);
				});
			}))
			dispatch(globalArrayData(newArrayData));
			dispatch(globalTaskData(newTaskData));
			setJobListLoading(false);
	  });
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
		navigate('/search?q=' + searchQuery + '&exp=' + newExpanded.toString() + '&details=' + viewDetails + '&log=' + viewLog);
	}

	const convertToSearchGraphData = (graphData) => {
		let data = [], uniqueChars, tmp;
		tmp = graphData.map((d) => {
			if (d) {
				return d.icoda_username;
			}
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
				<GraphTable
					viewDetails={viewDetails}
					viewLog={viewLog}
					loading={jobListLoading}
					onToggleClick={async (jobId) => {await toggleJob(jobId);}}
					rowsExpanded={rowsExpandedIndex}
					setRowsExpanded={(expanded) => rowsExpandedHandle(expanded)}
					autoCompleteValue={autoCompleteValue}
					setSearchQuery={searchQueryHandle}
					jobSelected={jobSelected}
					setJobSelected={setJobSelected}
				/>
				{viewDetails && <DetailsPane jobSelected={jobSelected} />}
				{viewLog && <LogPane viewDetails={viewDetails} />}
			</div>
		</div>
	);
}
