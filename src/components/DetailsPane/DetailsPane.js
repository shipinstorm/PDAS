import { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import GraphStatus from "../GraphTable/GraphStatus/GraphStatus";
import ArrayStatus from "../GraphTable/GraphStatus/ArrayStatus";

import SelectImage from '../../assets/images/select.png';
import SpinnerDark from "../../assets/images/spinner_dark.gif";

import ElasticSearchService from "../../services/ElasticSearch.service";
import { baseUrl, nfsBaseURL } from "../../services/ElasticSearch.service";

import { globalExternalIP } from "../../store/actions/globalAction";

import { elapsedTime, submittedTime } from '../../utils/utils';

import './DetailsPane.scss';



export default function DetailsPane() {
  const dispatch = useDispatch();
  
  const editVal1 = useRef(null);
  const editVal2 = useRef(null);
  const editVal3 = useRef(null);
  const editVal4 = useRef(null);
  const editVal5 = useRef(null);
  const editVal6 = useRef(null);

  const externalIP = useSelector((state) => state.global.externalIP);
  const codaHealth = useSelector((state) => state.global.codaHealth);
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const selectedGraphData = useSelector((state) => state.job.graphSelected);
  const selectedArrayData = useSelector((state) => state.job.arraySelected);
  const selectedTaskData = useSelector((state) => state.job.taskSelected);

  const [graphData, setGraphData] = useState({});
  const [arrayData, setArrayData] = useState({});
  const [taskData, setTaskData] = useState({});

  const [poolData, setPoolData] = useState({});
  const [showErrorMsg, setShowErrorMsg] = useState(false);
  const [displayIdStr, setDisplayIdStr] = useState();
  const [idCopyLink, setIdCopyLink] = useState("");
  const [metadataKeys, setMetadataKeys] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [currentImgUrlRequest, setCurrentImgUrlRequest] = useState();
  const [hidePlayImage, setHidePlayImage] = useState(true);
  const [noFrames, setNoFrames] = useState(false);
  const [showPoolDetail, setShowPoolDetail] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [subPools, setSubPools] = useState([]);
  const [statusHistoryExpanded, setStatusHistoryExpanded] = useState();
  const [statusHover, setStatusHover] = useState([]);
  const [showEditIcon, setShowEditIcon] = useState({});
  const [editMode, setEditMode] = useState({});
  const [savingEdit, setSavingEdit] = useState({});
  const [savedEdit, setSavedEdit] = useState({});
  const [expandedObj, setExpandedObj] = useState({});

  useEffect(() => {
    if (selectedGraphData && !(Object.keys(selectedGraphData).length === 0)) {
      ElasticSearchService.getDgraph(selectedGraphData.did)
      .then((resultArray) => {
        setGraphData(resultArray.dgraph[0]);
      });
    } else if (selectedArrayData && !(Object.keys(selectedArrayData).length === 0)) {
      ElasticSearchService.getArray(selectedArrayData.did, selectedArrayData.aid)
      .then((resultArray) => {
        setArrayData(resultArray.array[0]);
      });
    } else if (selectedTaskData && !(Object.keys(selectedTaskData).length === 0)) {
      ElasticSearchService.getTask(selectedTaskData.did, selectedTaskData.aid, selectedTaskData.tid)
      .then((resultArray) => {
        setTaskData(resultArray);
      });
    }

    refreshPools();
    checkNetwork();
    if (displayIdStr !== getDisplayId()) {
      setShowImage(false);
      setImgUrl(undefined);
      setHidePlayImage(true);
      setNoFrames(false);
      // if (currentImgUrlRequest) { currentImgUrlRequest.unsubscribe(); }
      setShowEditIcon({});
      setEditMode({});
      setSavingEdit({});
      setSavedEdit({});
      setExpandedObj({});
      /*
      for (let propName in changes) {
        let chng = changes[propName];
        let cur  = JSON.stringify(chng.currentValue);
        let prev = JSON.stringify(chng.previousValue);
        console.log(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
      }
      */
      if (!externalIP) {
        // setCurrentImgUrlRequest(
        // getImgUrl().subscribe(url => {
        let url = getImgUrl();
        if (url) {
          setImgUrl(url);
          let imgElement = document.getElementById('framePreview');
          if (imgElement && imgElement.complete && imgElement.src === url) {
            setShowImage(true);
          }
        } else {
          setNoFrames(true);
        }
        // })
        // );
      }

    }
    let previousIdStr = displayIdStr;
    setDisplayIdStr(getDisplayId());
    setIdCopyLink(getIdCopyLink());
    setMetadataKeys(getMetadataKeys());
    if (previousIdStr !== displayIdStr) {
      setShowMore(false);
      setStatusHistoryExpanded(false);
      setStatusHover([]);
    }
  }, [selectedGraphData, selectedArrayData, selectedTaskData]);

  const graph = () => {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    return selectedGraphData // 👈 null and undefined check
      && !(Object.keys(selectedGraphData).length === 0
        && Object.getPrototypeOf(selectedGraphData) === Object.prototype);
  }

  const array = () => {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    return selectedArrayData // 👈 null and undefined check
      && !(Object.keys(selectedArrayData).length === 0
        && Object.getPrototypeOf(selectedArrayData) === Object.prototype);
  }

  const task = () => {
    // because Object.keys(new Date()).length === 0;
    // we have to do some additional check
    return selectedTaskData // 👈 null and undefined check
      && !(Object.keys(selectedTaskData).length === 0
        && Object.getPrototypeOf(selectedTaskData) === Object.prototype);
  }

  const getDisplayId = () => {
    if (graph()) {
      return String(selectedGraphData.did);
    } else if (array()) {
      return selectedArrayData.did + "." + selectedArrayData.aid;
    } else if (task()) {
      return selectedTaskData.did + "." + selectedTaskData.aid + "." + selectedTaskData.tid;
    }
  }

  const getIdCopyLink = () => {
    if (graph()) {
      return "/search?q=did:" + selectedGraphData.did + "&sel=" + selectedGraphData.did + "&view=d";
    } else if (array()) {
      return "/search?q=did:" + selectedArrayData.did + "&exp=" + selectedArrayData.did + "&sel=" + selectedArrayData.did + "." + selectedArrayData.aid + "&view=d";
    } else if (task()) {
      return "/search?q=did:" + selectedTaskData.did + "&exp=" + selectedTaskData.did + "." + selectedTaskData.aid + "&sel=" + selectedTaskData.did + "." + selectedTaskData.aid + "." + selectedTaskData.tid + "&view=d";
    }
  }

  const getMetadataKeys = () => {
    if (graph()) {
      return Object.keys(selectedGraphData).sort();
    } else if (array()) {
      return Object.keys(selectedArrayData).sort();
    } else if (task()) {
      return Object.keys(selectedTaskData).sort();
    }
  }

  const getImgUrl = () => {
    // return new Observable(observer => {
    if (task()) {
      let imgUrl = nfsBaseURL + "image/" + selectedTaskData.did + "/" + selectedTaskData.aid + "/" + selectedTaskData.tid;
      // observer.next(imgUrl);◘
      return imgUrl;
    } else if (array()) {
      imagePaths[selectedArrayData.did + '.' + selectedArrayData.aid] && imagePaths[selectedArrayData.did + '.' + selectedArrayData.aid].then(imagePaths => {
        if (imagePaths && imagePaths.length > 0) {
          let firstImg = imagePaths[0];
          // observer.next(nfsBaseURL+"image/" + firstImg.did+"/" + firstImg.aid + "/" + firstImg.tid);
          return (nfsBaseURL + "image/" + firstImg.did + "/" + firstImg.aid + "/" + firstImg.tid);
        } else {
          // observer.next(undefined);
          return (undefined);
        }
      });
    } else if (graph()) {
      imagePaths[selectedGraphData.did] && imagePaths[selectedGraphData.did].then(imagePaths => {
        if (imagePaths && imagePaths.length > 0) {
          let firstImg = imagePaths[0];
          // observer.next(nfsBaseURL+"image/" + firstImg.did+"/" + firstImg.aid + "/" + firstImg.tid);
          return (nfsBaseURL + "image/" + firstImg.did + "/" + firstImg.aid + "/" + firstImg.tid);
        } else {
          // observer.next(undefined);
          return (undefined);
        }
      });
    }
    // });
  }

  const playImage = (id) => {

  }

  const successLoadingImg = (event) => {
    setShowImage(true);
  }

  const errorLoadingImg = (event) => {
    if (task()) {
      ElasticSearchService.getImagePaths(selectedTaskData.did, selectedTaskData.aid, selectedTaskData.tid)
        .subscribe(imagePaths => {
          if (imagePaths && imagePaths.length > 0) {
            console.log("Image exists, must login");
            //TODO popup login for SSO/icoda image
            //alert("Image exists, must login");
            setNoFrames(true); // for now
            setShowImage(false);
          } else {
            setNoFrames(true);
            setShowImage(false);
          }
        },
          error => {
            console.log("[ERROR] Problem in errorLoadingImg: " + error.error)
          });
      // // TODO check for already loaded dgraph/array image paths and handle login case if needed
      // } else if(this.imagePaths && this.imagePaths.length > 0) {
      //   console.log(this.imagePaths[0]);
      //   console.log("Image exists, must login");
      //   // TODO popup login for SSO/icoda image
      //   // alert("Image exists, must login");
      //   setNoFrames(true); //for now
      //   setShowImage(false);
    } else {
      setNoFrames(true);
      setShowImage(false);
    }
  }

  const imgMouseOver = () => {
    setHidePlayImage(false);
  }

  const imgMouseLeave = () => {
    setHidePlayImage(true);
  }

  const copyToClipboard = (event, targetId) => {
    const targetElem = document.getElementById(targetId);
    const savedReadOnly = targetElem.readOnly;
    let successCopy = true;
    // otherwise blur doesn't work well on Safari
    targetElem.readOnly = false;
    targetElem.select();
    try {
      successCopy = document.execCommand('copy');
    } catch (err) {
      successCopy = false;
    }
    if (successCopy) {
      targetElem.blur();
    }
    targetElem.readOnly = savedReadOnly;
  }

  const togglePoolDetail = () => {
    setShowPoolDetail(!showPoolDetail);
    if (showPoolDetail) {
      // Build array of subPools to show for the More pool details
      var subPoolWords = [];
      let tmpSubPools = [];
      if (graph() && selectedGraphData._poolname) {
        subPoolWords = selectedGraphData._poolname.split(".");
      } else if (graph() && selectedGraphData.cpupool) {
        subPoolWords = selectedGraphData.cpupool.split(".");
      } else if (array() && selectedArrayData._poolname) {
        subPoolWords = selectedArrayData._poolname.split(".");
      } else if (array() && selectedArrayData.cpupool) {
        subPoolWords = selectedArrayData.cpupool.split(".");
      } else if (task() && selectedTaskData._poolname) {
        subPoolWords = selectedTaskData._poolname.split(".");
      }
      for (var i = subPoolWords.length; i > 0; i--) {
        tmpSubPools.push(subPoolWords.slice(0, i).join("."));
      }
      setSubPools(tmpSubPools);

      let me = this;
      document.body.onclick = function (event) {
        if (event.target !== document.getElementById('poolDetailMainToggle') &&
          event.target !== document.getElementById('poolDetailTriangleToggle') &&
          document.getElementById('poolDetail') &&
          !document.getElementById('poolDetail').contains(event.srcElement)) {
          me.showPoolDetail = false;
        }
      }
      document.addEventListener('scroll', function (e) {
        me.showPoolDetail = false;
      }, true);
    } else {
      document.body.onclick = null;
    }
  }

  const getStatusHistData = (statusHistList) => {
    let primaryStatuses = ["queued", "run", "done", "exit", "userkill", "syskill", "wait", "usersus", "requeue", "reqsus", "resync", "depend", "paused"];
    let primaryPrefixes = ["run on host", "paused on host", "requeue due to", "reqsus due to"];
    let statusHistData = [];

    let prevDate;
    let hoverMsgs = [];
    for (let status of statusHistList.slice().reverse()) {
      let tmp = new Date(status.ts * 1000);

      if (primaryStatuses.indexOf(status.msg) > -1 || primaryPrefixes.filter((prefix) => { return status.msg.startsWith(prefix) }).length > 0) {
        if (statusHistData.length > 0) {
          statusHistData[statusHistData.length - 1]['hover'] = hoverMsgs;
        }
        hoverMsgs = [];
        
        let currDate = tmp.toLocaleDateString();
        let date = currDate !== prevDate ? currDate : undefined;
        let time = tmp.getHours() + ":" + tmp.getMinutes();
        statusHistData.push({ 'date': date, 'time': time, 'msg': status.msg });
        if (date) {
          prevDate = date;
        }
      } else {
        let time = tmp.getHours() + ":" + tmp.getMinutes();
        hoverMsgs.unshift({ 'time': time, 'msg': status.msg });
      }
    }

    return statusHistData;
  }

  const toggleStatusHistory = () => {
    setStatusHistoryExpanded(!statusHistoryExpanded);
  }

  const statusHoverEnter = (index) => {
    statusHover[index] = true;
    let listener = this.renderer.listenGlobal('document', 'mousemove', (event) => {
      if (!event.target.classList.contains('hoverable-msg')) {
        for (let i in statusHover) {
          statusHover[i] = false;
        }
        listener(); //unbinds the event listener
      }
    });
  }

  const toggleShowMore = () => {
    setShowMore(!showMore);
  }

  const fieldHover = (field) => {
    let tmpShowEditIcon = {};
    tmpShowEditIcon[field] = true;
    setShowEditIcon(tmpShowEditIcon);
  }

  const fieldHoverLeave = (field) => {
    showEditIcon[field] = false;
    setShowEditIcon({ ...showEditIcon });
  }

  const editField = (field) => {
    let tmpEditMode = {};
    tmpEditMode[field] = true;
    setEditMode(tmpEditMode);
  }

  const cancelEdit = (field) => {
    editMode[field] = false;
    setEditMode({ ...editMode });
    showEditIcon[field] = false;
    setShowEditIcon({ ...showEditIcon });
  }

  const saveEdit = (field, val, topItemField = null, errorMsg = null, success = null) => {
    let editedField = topItemField || field;
    let savedError = (errMsg) => {
      // codaModal.showError({
      //   modalTitle: "Invalid Value",
      //   modalBody: errorMsg ? errorMsg : "There was an error saving changes to "+field+":",
      //   modalBodyDetails: errMsg
      // }, () => {
      //   savingEdit[editedField] = false;
      //   setSavingEdit(savingEdit);
      //   editMode[editedField] = true;
      //   setEditMode(editMode);
      // });
    }
    try {
      let newVal = JSON.parse(val);
      savingEdit[editedField] = true;
      setSavingEdit({ ...savingEdit });
      editMode[editedField] = false;
      setEditMode({ ...editMode });
      let savedSuccess = () => {
        // saved successfully
        selectedObj()[field] = newVal;
        if (success) { success(); }
        savingEdit[editedField] = false;
        setSavingEdit({ ...savingEdit });
        showEditIcon[editedField] = false;
        setShowEditIcon({ ...showEditIcon });
        savedEdit[editedField] = true;
        setSavedEdit({ ...savedEdit });
        window.setTimeout(() => {
          savedEdit[editedField] = false;
          setSavedEdit({ ...savedEdit });
        }, 15000);
      };
      if (graph()) {
        ElasticSearchService.setDgraphMeta(selectedGraphData.did, field, val, savedError)
          .then(result => {
            savedSuccess();
          })
          .catch(error => {
            savedError(error);
          });
      } else if (array()) {
        ElasticSearchService.setArrayMeta(selectedArrayData.did, selectedArrayData.aid, field, val)
          .then(result => {
            savedSuccess();
          })
          .catch(error => {
            savedError(error);
          });
      } else if (task()) {
        ElasticSearchService.setTaskMeta(selectedTaskData.did, selectedTaskData.aid, selectedTaskData.tid, field, val)
          .then(result => {
            savedSuccess();
          })
          .catch(error => {
            savedError(error);
          });
      }
    } catch (e) {
      savedError(e.message);
    }
  }

  const isObject = (val) => {
    return val instanceof Object;
  }

  const adjustHeight = (textarea) => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 1;
  }

  const selectedObj = () => {
    return {...selectedGraphData, ...selectedArrayData, ...selectedTaskData};
  }

  const toggleObj = (field) => {
    expandedObj[field] = !expandedObj[field];
    setExpandedObj({ ...expandedObj });
  }

  const editTitle = (val) => {
    saveEdit("title", '"' + val + '"', "_topItems.title", "There was an error saving changes to the title:");
  }

  const editMemoryRes = (val) => {
    let field;
    let fullVal;
    if (task()) {
      field = "taskresources";
      fullVal = selectedTaskData['taskresources'] ? JSON.parse(JSON.stringify(selectedTaskData['taskresources'])) : {};
      fullVal.memory = val;
    } else if (array()) {
      field = "arrayresources";
      fullVal = selectedArrayData['arrayresources'] ? JSON.parse(JSON.stringify(selectedArrayData['arrayresources'])) : {};
      fullVal.memory = val;
    } else {
      field = "dgraphresources";
      fullVal = selectedGraphData['dgraphresources'] ? JSON.parse(JSON.stringify(selectedGraphData['dgraphresources'])) : {};
      fullVal.memory = val;
    }
    saveEdit(field, JSON.stringify(fullVal), "_topItems.mem", "There was an error saving changes to memory reserved:", () => {
      selectedObj()['dgraphresources.memory'] = val;
    });
  }

  const editPool = (val) => {
    saveEdit('cpupool', '"' + val + '"', "_topItems.pool", "There was an error saving changes to pool:")
  }

  const editPriority = (val) => {
    saveEdit('dgraphprio', val, "_topItems.prio", "There was an error saving changes to priority:");
  }

  const editNotes = (val) => {
    saveEdit('notes', '"' + val + '"', "_topItems.notes", "There was an error saving changes to notes:");
  }

  const checkNetwork = (callback = null) => {
    ElasticSearchService.networkCheck()
      .then(result => {
        dispatch(globalExternalIP(false));
        if (callback) { callback(); }
      })
      .catch(error => {
        if (error.status === 403) {
          dispatch(globalExternalIP(true));
        } else {
          console.log("networkCheck error");
          console.log(error);
        }
        if (callback) { callback(); }
      })
  }

  const refreshPools = () => {
    ElasticSearchService.getPoolData()
      .then(data => {
        let tmpPoolData = data.data;
        var totalSpec = 0;
        var totalNonspec = 0;
        var totalAvailable = 0;
        var tempSubPools = [];
        for (let item in tmpPoolData) {
          totalSpec += tmpPoolData[item]['speccount'];
          totalNonspec += tmpPoolData[item]['realcount'];
          totalAvailable += tmpPoolData[item]['entitled'];
          if ('splits' in tmpPoolData[item]) {
            var mytemp = makePoolTopLevel(item, tmpPoolData[item]['splits']);
            tempSubPools.push(mytemp);
          }
        }
        for (let i = 0; i < tempSubPools.length; i++) {
          for (var key in tempSubPools[i]) {
            tmpPoolData[key] = tempSubPools[i][key];
          }
        }
        tmpPoolData['Total'] = { 'speccount': totalSpec, 'realcount': totalNonspec, 'entitled': totalAvailable };
        setPoolData(tmpPoolData);
      });
  }

  // This recursive function copies all the subPools into top-level items
  // in tempDict to match the pool keys that exist on specific tasks
  const makePoolTopLevel = (name, splits) => {
    var tempDict = {};
    var tempSubPools = [];
    for (let subPool in splits) {
      if ('splits' in splits[subPool]) {
        tempDict[name + '.' + subPool] = splits[subPool];
        tempSubPools.push(makePoolTopLevel(name + '.' + subPool, splits[subPool]['splits']));
      }
      for (var i = 0; i < tempSubPools.length; i++) {
        for (let key in tempSubPools[i]) {
          tempDict[key] = tempSubPools[i][key]
        }
      }
      tempSubPools = [];
      tempDict[name + '.' + subPool] = splits[subPool];
    }
    return tempDict;
  }

  return (
    <>
      {!(graph() || array() || task()) &&
        <div className="loading-div object-details-content">
          <br /><br />
          <div style={{ textAlign: 'center' }}><img src={SelectImage} alt='' /></div>
          <br />
          Select job to view details
        </div>}

      {(graph() || array() || task()) &&
        <div className="object-details-content">
          <div className="panel panel-default">
            <div className="panel-heading container-fluid">
              <div className="row">
                <div className="col-xs-12 pull-left">
                  <small>Job ID: </small>
                  <a href={idCopyLink}>{displayIdStr}</a>
                </div>
              </div>
              <div className="row">
                {!editMode['_topItems.title'] && !savingEdit['_topItems.title'] &&
                  <h5
                    className="col-xs-12 panel-title pull-left editable"
                    onMouseOver={() => fieldHover("_topItems.title")}
                    onMouseLeave={() => fieldHoverLeave("_topItems.title")}
                    onClick={() => editField('_topItems.title')}
                  >
                    {selectedGraphData?.title}{selectedArrayData?.title}{selectedTaskData?.title}
                    {showEditIcon['_topItems.title'] && <span className="glyphicon glyphicon-pencil"></span>}
                  </h5>}
                {editMode['_topItems.title'] && !savingEdit['_topItems.title'] &&
                  <p className="col-xs-12 edit-metadata">
                    <textarea
                      ref={editVal1}
                      id="editTextArea"
                      onInput={(event) => adjustHeight(event.target)}
                      rows="1"
                    >
                      {selectedObj().title}
                    </textarea>
                    <br />
                    <button
                      className="btn-sm btn-primary"
                      onClick={() => editTitle(editVal1.current.value)}
                    >
                      <small><span className="glyphicon glyphicon-save"></span>Save</small>
                    </button>
                    <button
                      className="btn-sm btn-default"
                      onClick={() => cancelEdit('_topItems.title')}
                    >
                      <small>Cancel</small>
                    </button>
                  </p>}
                {savedEdit['_topItems.title'] && <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                {savingEdit['_topItems.title'] && <p className="col-xs-8 form-control-static edit-spinner"><img src={SpinnerDark} alt='' /></p>}
              </div>
              <div className="row">
                <div className="col-xs-9 pull-left">{selectedGraphData?.icoda_username}{selectedArrayData?.icoda_username}{selectedTaskData?.icoda_username}</div>
                <div className="col-xs-3 text-right">
                  {submittedTime(selectedGraphData?._submittime, selectedArrayData?._submittime, selectedTaskData?._submittime)}
                </div>
              </div>
            </div>

            {showImage &&
              <div className="container-fluid">
                <div className="row" >
                  <div className="col-xs-12 text-center">
                    <div
                      onClick={() => playImage(displayIdStr)}
                      onMouseOver={() => imgMouseOver()}
                      onMouseLeave={() => imgMouseLeave()}
                      className='img-div'
                    >
                      {!hidePlayImage &&
                        <div className="playImage">
                          <span className="glyphicon glyphicon-new-window"></span>
                        </div>}
                      {imgUrl &&
                        <img
                          id="framePreview"
                          src={imgUrl}
                          onLoad={(event) => successLoadingImg(event)}
                          onError={(event) => errorLoadingImg(event)}
                          className="img-thumbnail"
                          alt=""
                        />}
                    </div>
                  </div>
                </div>
              </div>}

            {externalIP &&
              <div className="container-fluid">
                <div className="row" >
                  <div className="col-xs-12 text-center">
                    <div className='external-img-placeholder'>
                      <span className="glyphicon glyphicon-picture"></span>
                      <br />Not available outside the network
                    </div>
                  </div>
                </div>
              </div>}
          </div>

          <div className="detail-form">
            <div className="detail-form-scrollbox container-fluid">
              <form className="form-horizontal ">
                <fieldset>
                  <div className="row">
                    <label htmlFor="frames" className="col-xs-4 control-label text-left">Frames</label>
                    {!showImage && !noFrames && !externalIP && <p className="col-xs-8 form-control-static dimmed-text loading-dots">Looking</p>}
                    {noFrames && <p className="col-xs-8 form-control-static dimmed-text">No available frames</p>}
                    {showImage && <p className="col-xs-8 form-control-static"><button className="rv-link" onClick={() => playImage(displayIdStr)}>View in RV...</button></p>}
                    {externalIP && <p className="col-xs-8 form-control-static dimmed-text">Not available</p>}
                  </div>

                  <div className="row">
                    <label htmlFor="status" className="col-xs-4 control-label text-left">Status</label>
                    <div className="col-xs-8 form-control-static">
                      {graph() && <GraphStatus selectedGraphData={selectedGraphData} />}
                      {array() && <ArrayStatus selectedArrayData={selectedArrayData} />}
                      {/* {task() && <span className="status-color {task._statusname | statusClass:'task'}">{task._statusname | statusName:"task"}</span>} */}
                    </div>
                  </div>

                  <div className="row">
                    <label htmlFor="memory" className="col-xs-4 control-label text-left">Memory <small>(MB)</small></label>
                    {!editMode['_topItems.mem'] && !savingEdit['_topItems.mem'] &&
                      <p className="col-xs-8 form-control-static">
                        {
                  /**
                   * Allow for memory use to be 25% beyond the reservation before alerting.  25% is an arbitrary choice.  Feel free to adjust in the future
                   * The job must also be using more than 10GB.  This is also an arbitrary choice.  Feel free to adjust in the future
                   */}
                        {task() &&
                          <span className={(selectedTaskData?._memused > selectedTaskData?.dgraphresources?.memory * 1.25) && (selectedTaskData?._memused > 10240) ? "memory-maxed" : ""}>
                            {selectedTaskData?._memused}
                          </span>}
                        {task() && <span>/</span>}
                        <span
                          className="editable"
                          onMouseOver={() => fieldHover("_topItems.mem")}
                          onMouseLeave={() => fieldHoverLeave("_topItems.mem")}
                          onClick={() => editField('_topItems.mem')}
                        >
                          {selectedGraphData?.dgraphresources?.memory}{selectedArrayData?.dgraphresources?.memory}{selectedTaskData?.dgraphresources?.memory}
                        </span>
                        <small>
                          &nbsp;
                          {task() && <span>used/</span>}
                          reserved
                        </small>
                        {showEditIcon['_topItems.mem'] && <span className="glyphicon glyphicon-pencil"></span>}
                        {savedEdit['_topItems.mem'] && <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                      </p>}
                    {editMode['_topItems.mem'] && !savingEdit['_topItems.mem'] &&
                      <p className="col-xs-4 form-control-static edit-metadata edit-memory">
                        <textarea
                          ref={editVal2}
                          id="editTextArea"
                          onInput={(event) => adjustHeight(event.target)}
                          rows="1"
                        >
                          {selectedObj().dgraphresources.memory}
                        </textarea>
                        <small> reserved</small>
                        <br />
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => editMemoryRes(editVal2.current.value)}
                        >
                          <small><span className="glyphicon glyphicon-save"></span>Save</small>
                        </button>
                        <button
                          className="btn-sm btn-default"
                          onClick={() => cancelEdit('_topItems.mem')}
                        >
                          <small>Cancel</small>
                        </button>
                      </p>}
                    {savingEdit['_topItems.mem'] && <p className="col-xs-8 form-control-static edit-spinner"><img src={SpinnerDark} alt='' /></p>}
                  </div>

                  <div className="row">
                    <label htmlFor="runtime" className="col-xs-4 control-label text-left">Elapsed Time</label>
                    <p className="col-xs-8 form-control-static">
                      {elapsedTime(selectedGraphData, selectedArrayData, selectedTaskData)}
                    </p>
                  </div>

                  {(selectedGraphData?._poolname || selectedGraphData?.cpupool || selectedArrayData?._poolname || selectedArrayData?.cpupool || selectedTaskData?._poolname || selectedTaskData?.cpupool) &&
                    <div className="row">
                      <label htmlFor="pool" className="col-xs-4 control-label text-left">Pool</label>
                      {!editMode['_topItems.pool'] && !savingEdit['_topItems.pool'] &&
                        <div
                          className="col-xs-5 form-control-static pool-nowrap pool-lowpad-right editable"
                          onMouseOver={() => fieldHover("_topItems.pool")}
                          onMouseLeave={() => fieldHoverLeave("_topItems.pool")}
                          onClick={() => editField('_topItems.pool')}
                          title={selectedGraphData?._poolname || selectedGraphData?.cpupool + selectedArrayData?._poolname || selectedArrayData?.cpupool + selectedTaskData?._poolname || selectedTaskData?.cpupool}
                        >
                          {selectedGraphData?._poolname || selectedGraphData?.cpupool}{selectedArrayData?._poolname || selectedArrayData?.cpupool}{selectedTaskData?._poolname || selectedTaskData?.cpupool}
                          {showEditIcon['_topItems.pool'] &&
                            <span className="glyphicon glyphicon-pencil"></span>}
                          {savedEdit['_topItems.pool'] &&
                            <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                        </div>}
                      {!editMode['_topItems.pool'] && !savingEdit['_topItems.pool'] &&
                        <div className="col-xs-3 form-control-static">
                          <div
                            className="pool-show-more"
                            onClick={() => togglePoolDetail()}
                          // onScroll={() => hidePoolDetail()}
                          >
                            <span className="glyphicon glyphicon-chevron-down" id="poolDetailTriangleToggle"></span>
                            <span id="poolDetailMainToggle">more</span>
                          </div>

                          {/* Pool more detail popup */}
                          {showPoolDetail &&
                            <div id="poolDetail" className="pool-detail-dropbox">
                              <div><small>
                                <div className="row pool-pad slot-grid pull-right">
                                  <div className="col-xs-4 pool-separator text-right">
                                    {selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === false &&
                                      <span className="pool-slot-text glyphicon glyphicon-circle-arrow-right"></span>}
                                    <span
                                      className={selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === false ? "pool-main" : ""}
                                    >
                                      Normal
                                    </span>
                                  </div>
                                  <div className="col-xs-4 pool-separator text-right">
                                    {selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === true &&
                                      <span className="pool-slot-text glyphicon glyphicon-circle-arrow-right"></span>}
                                    <span
                                      className={selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === true ? "pool-main" : ""}
                                    >
                                      Spec
                                    </span>
                                  </div>
                                  <div className="col-xs-4 text-right">Available</div>
                                </div>
                                <div className="pull-right slot-name">Slots:</div>
                              </small></div>
                              {(((selectedGraphData?._poolname || selectedGraphData?.cpupool) && (poolData[selectedGraphData?.cpupool] || poolData[selectedGraphData?._poolname]))
                                || ((selectedArrayData?._poolname || selectedArrayData?.cpupool) && (poolData[selectedArrayData?.cpupool] || poolData[selectedArrayData?._poolname]))
                                || ((selectedTaskData?._poolname || selectedTaskData?.cpupool) && (poolData[selectedTaskData?.cpupool] || poolData[selectedTaskData?._poolname]))) &&
                                <div>
                                  <div className="text-left slot-name">{selectedGraphData?._poolname || selectedGraphData?.cpupool}{selectedArrayData?._poolname || selectedArrayData?.cpupool}{selectedTaskData?._poolname || selectedTaskData?.cpupool}</div>
                                  <div className="row pool-hint pool-pad slot-grid pull-right">
                                    {/* Get top level pool data from dgraph */}
                                    {(poolData[selectedGraphData?.cpupool] || poolData[selectedGraphData?._poolname]) &&
                                      <div
                                        className={poolData[selectedGraphData?.cpupool]['realcount'] >= poolData[selectedGraphData?.cpupool]['entitled'] ?
                                          "col-xs-4 text-right pool-separator pool-maxed" :
                                          'col-xs-4 text-right pool-separator'}
                                      >
                                        {JSON.stringify(poolData[selectedGraphData?.cpupool]['realcount'])}
                                      </div>}
                                    {(poolData[selectedGraphData?.cpupool] || poolData[selectedGraphData?._poolname]) &&
                                      <div className="col-xs-4 text-right pool-separator">
                                        {JSON.stringify(poolData[selectedGraphData?.cpupool]['speccount'])}
                                      </div>}
                                    {(poolData[selectedGraphData?.cpupool] || poolData[selectedGraphData?._poolname]) &&
                                      <div className="col-xs-4 text-right">
                                        {JSON.stringify(poolData[selectedGraphData?.cpupool]['entitled'])}
                                      </div>}
                                    {/* Get top level pool data from array */}
                                    {(poolData[selectedArrayData?.cpupool] || poolData[selectedArrayData?._poolname]) &&
                                      <div
                                        className={poolData[selectedArrayData?._poolname]['realcount'] >= poolData[selectedArrayData?._poolname]['entitled'] ?
                                          "col-xs-4 text-right pool-separator pool-maxed" :
                                          "col-xs-4 text-right pool-separator"}
                                      >
                                        {JSON.stringify(poolData[selectedArrayData?._poolname]['realcount']) || JSON.stringify(poolData[selectedArrayData?.cpupool]['realcount'])}
                                      </div>}
                                    {(poolData[selectedArrayData?._poolname] || poolData[selectedArrayData?.cpupool]) &&
                                      <div className="col-xs-4 text-right pool-separator">
                                        {JSON.stringify(poolData[selectedArrayData?._poolname]['speccount']) || JSON.stringify(poolData[selectedArrayData?.cpupool]['speccount'])}
                                      </div>}
                                    {(poolData[selectedArrayData?._poolname] || poolData[selectedArrayData?.cpupool]) &&
                                      <div className="col-xs-4 text-right">
                                        {JSON.stringify(poolData[selectedArrayData?._poolname]['entitled']) || JSON.stringify(poolData[selectedArrayData?.cpupool]['entitled'])}
                                      </div>}
                                    {/* Get top level pool data from task */}
                                    {poolData[selectedTaskData?._poolname] &&
                                      <div
                                        className={poolData[selectedTaskData?._poolname]['realcount'] >= poolData[selectedTaskData?._poolname]['entitled'] ?
                                          "col-xs-4 text-right pool-separator pool-maxed" :
                                          selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === false ?
                                            "col-xs-4 text-right pool-separator pool-main" :
                                            "col-xs-4 text-right pool-separator"}
                                      >
                                        {JSON.stringify(poolData[selectedTaskData?._poolname]['realcount']) || JSON.stringify(poolData[selectedTaskData?.cpupool]['realcount'])}
                                      </div>}
                                    {poolData[selectedTaskData?._poolname] &&
                                      <div
                                        className={selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === true ?
                                          "col-xs-4 text-right pool-separator pool-main" :
                                          "col-xs-4 text-right pool-separator"}
                                      >
                                        {JSON.stringify(poolData[selectedTaskData?._poolname]['speccount']) || JSON.stringify(poolData[selectedTaskData?.cpupool]['speccount'])}
                                      </div>}
                                    {poolData[selectedTaskData?._poolname] &&
                                      <div className="col-xs-4 text-right">
                                        {JSON.stringify(poolData[selectedTaskData?._poolname]['entitled']) || JSON.stringify(poolData[selectedTaskData?.cpupool]['entitled'])}
                                      </div>}
                                  </div>
                                </div>}

                              {
                                subPools.map((subPool) => {
                                  return (
                                    <div>
                                      {poolData[subPool] && <div className="text-left slot-name pool-hint">{subPool}</div>}
                                      <div className="row pool-hint pool-pad slot-grid pull-right">
                                        {poolData[subPool] &&
                                          <div
                                            className={poolData[subPool]['realcount'] >= poolData[subPool]['entitled'] ?
                                              "col-xs-4 text-right pool-separator pool-maxed" :
                                              "col-xs-4 text-right pool-separator"}
                                          >
                                            {poolData[subPool]['realcount']}
                                          </div>}
                                        {poolData[subPool] && <div className="col-xs-4 text-right pool-separator">{poolData[subPool]['speccount']}</div>}
                                        {poolData[subPool] && <div className="col-xs-4 text-right">{poolData[subPool]['entitled']}</div>}
                                      </div>
                                    </div>
                                  )
                                })
                              }

                              <div>
                                <div className="text-left slot-name pool-hint">Total</div>
                                <div className="row pool-hint pool-pad slot-grid pull-right">
                                  <div
                                    className={poolData['Total']['realcount'] >= poolData['Total']['entitled'] ?
                                      "col-xs-4 text-right pool-separator pool-maxed" :
                                      "col-xs-4 text-right pool-separator"}
                                  >
                                    {poolData["Total"]['realcount']}
                                  </div>
                                  <div className="col-xs-4 text-right pool-separator">{poolData["Total"]['speccount']}</div>
                                  <div className="col-xs-4 text-right">{poolData["Total"]['entitled']}</div>
                                </div>
                              </div>
                              <div>
                                <div className="btn btn-link btn-xs text-left">
                                  <a href={baseUrl + 'noauth/status'} target="_blank">View all pool info...</a>
                                </div>
                              </div>
                            </div>}
                        </div>}
                      {editMode['_topItems.pool'] && !savingEdit['_topItems.pool'] &&
                        <p className="col-xs-8 form-control-static edit-metadata">
                          <textarea
                            ref={editVal3}
                            id="editTextArea"
                            onInput={(event) => adjustHeight(event.target)}
                            rows="1"
                          >
                            {selectedObj()._poolname || selectedObj().cpupool}
                          </textarea>
                          <br />
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => editPool(editVal3.current.value)}
                          >
                            <small><span className="glyphicon glyphicon-save"></span>Save</small>
                          </button>
                          <button
                            className="btn-sm btn-default"
                            onClick={() => cancelEdit('_topItems.pool')}
                          >
                            <small>Cancel</small>
                          </button>
                        </p>}
                      {savingEdit['_topItems.pool'] &&
                        <p className="col-xs-8 form-control-static edit-spinner"><img src={SpinnerDark} alt="" /></p>}
                    </div>}

                  {/* Pool summary boxes */}
                  {!editMode['_topItems.pool'] && !savingEdit['_topItems.pool']
                    && (((selectedGraphData?._poolname || selectedGraphData?.cpupool) && (poolData[selectedGraphData?.cpupool] || poolData[selectedGraphData?._poolname]))
                      || ((selectedArrayData?._poolname || selectedArrayData?.cpupool) && (poolData[selectedArrayData?.cpupool] || poolData[selectedArrayData?._poolname]))
                      || ((selectedTaskData?._poolname || selectedTaskData?.cpupool) && (poolData[selectedTaskData?.cpupool] || poolData[selectedTaskData?._poolname]))) &&
                    <div className="row">
                      <label className="col-xs-4 control-label"></label>
                      <div className="container-fluid col-xs-8">
                        <div
                          className={selectedTaskData?._isspeculative === true ?
                            "pool col-xs-4 form-control-static text-right pool-other" :
                            selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === false ?
                              "pool col-xs-4 form-control-static text-right pool-main" :
                              "pool col-xs-4 form-control-static text-right"}
                        >
                          <small>
                            {selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === false &&
                              <span className="pool-slot-text glyphicon glyphicon-circle-arrow-right"></span>}
                            <span
                              className={selectedTaskData?._isspeculative === true ?
                                "pool-other" :
                                selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === false ?
                                  "pool-main" :
                                  ""}
                            >
                              Normal
                            </span>
                          </small>
                          {(poolData[selectedGraphData?.cpupool] || poolData[selectedGraphData?._poolname]) &&
                            <div
                              className={poolData[selectedGraphData?.cpupool]['realcount'] >= poolData[selectedGraphData?.cpupool]['entitled'] ?
                                "text-right pool-maxed" :
                                "text-right"}
                            >
                              {JSON.stringify(poolData[selectedGraphData?.cpupool]['realcount']) || JSON.stringify(poolData[selectedGraphData?._poolname]['realcount'])}
                            </div>}
                          {poolData[selectedArrayData?._poolname] &&
                            <div
                              className={poolData[selectedArrayData?._poolname]['realcount'] >= poolData[selectedArrayData?._poolname]['entitled'] ?
                                "text-right pool-maxed" :
                                "text-right"}
                            >
                              {JSON.stringify(poolData[selectedArrayData?._poolname]['realcount']) || JSON.stringify(poolData[selectedArrayData?.cpupool]['realcount'])}
                            </div>}
                          {poolData[selectedTaskData?._poolname] &&
                            <div
                              className={poolData[selectedTaskData?._poolname]['realcount'] >= poolData[selectedTaskData?._poolname]['entitled'] ?
                                "text-right pool-maxed" :
                                "text-right"}
                            >
                              {JSON.stringify(poolData[selectedTaskData?._poolname]['realcount']) || JSON.stringify(poolData[selectedTaskData?.cpupool]['realcount'])}
                            </div>}
                        </div>
                        <div
                          className={selectedTaskData?._isspeculative === false ?
                            "pool col-xs-4 form-control-static text-right pool-other" :
                            selectedTaskData?._isspeculative === true ?
                              "pool col-xs-4 form-control-static text-right pool-main" :
                              "pool col-xs-4 form-control-static text-right"}
                        >
                          <small>
                            {selectedTaskData?._statusname === 'run' && selectedTaskData?._isspeculative === true &&
                              <span className="pool-slot-text glyphicon glyphicon-circle-arrow-right"></span>}
                            <span
                              className={selectedTaskData?._isspeculative === false ?
                                "text-right pool-other" :
                                selectedTaskData?._statusname === 'run' ?
                                  "text-right pool-main" :
                                  "text-right"}
                            >
                              Spec
                            </span>
                          </small>
                          {poolData[selectedGraphData?.cpupool] &&
                            <div className="text-right pool-other">{poolData[selectedGraphData.cpupool]['speccount']}</div>}
                          {poolData[selectedArrayData?._poolname] &&
                            <div className="text-right pool-other">{poolData[selectedArrayData._poolname]['speccount']}</div>}
                          {poolData[selectedTaskData?._poolname] &&
                            <div className="text-right">{poolData[selectedTaskData._poolname]['speccount']}</div>}
                        </div>
                        <div className="pool pool-allocated pool-other col-xs-4 form-control-static text-right"><small>Available</small>
                          {poolData[selectedGraphData?.cpupool] &&
                            <div className="text-right">{poolData[selectedGraphData.cpupool]['entitled']}</div>}
                          {poolData[selectedArrayData?._poolname] &&
                            <div className="text-right">{poolData[selectedArrayData._poolname]['entitled']}</div>}
                          {poolData[selectedTaskData?._poolname] &&
                            <div className="text-right">{poolData[selectedTaskData._poolname]['entitled']}</div>}
                        </div>
                      </div>
                    </div>}

                  {/* Only show the running status line if the task is running */}
                  {!editMode['_topItems.pool'] && !savingEdit['_topItems.pool'] && task?._statusname === 'run' && (task?._poolname || task?.cpupool) &&
                    <div className="row">
                      <label className="col-xs-4 control-label"></label>
                      <p className="col-xs-8 form-control-static text-left pool-text dimmed-text">
                        Job is running in
                        {task?._isspeculative === false &&
                          <span className="pool-slot-text">normal</span>}
                        {task?._isspeculative === true &&
                          <span className="pool-slot-text">speculative</span>}
                        slot
                      </p>
                    </div>}

                  <div className="row">
                    <label htmlFor="priority" className="col-xs-4 control-label text-left">Priority</label>
                    {!editMode['_topItems.prio'] && !savingEdit['_topItems.prio'] &&
                      <p
                        className="col-xs-8 form-control-static editable"
                        onMouseOver={() => fieldHover("_topItems.prio")}
                        onMouseLeave={() => fieldHoverLeave("_topItems.prio")}
                        onClick={() => editField('_topItems.prio')}
                      >
                        {selectedGraphData?.dgraphprio}{selectedArrayData?.dgraphprio}{selectedTaskData?.dgraphprio}
                        {showEditIcon['_topItems.prio'] &&
                          <span className="glyphicon glyphicon-pencil"></span>}
                        {savedEdit['_topItems.prio'] &&
                          <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                      </p>}
                    {editMode['_topItems.prio'] && !savingEdit['_topItems.prio'] &&
                      <p className="col-xs-8 form-control-static edit-metadata">
                        <textarea
                          ref={editVal4}
                          id="editTextArea"
                          onInput={(event) => adjustHeight(event.target)}
                          rows="1"
                        >
                          {selectedGraphData?.dgraphprio || selectedArrayData?.dgraphprio || selectedTaskData?.dgraphprio}
                        </textarea>
                        <br />
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => editPriority(editVal4.current.value)}
                        >
                          <small><span className="glyphicon glyphicon-save"></span>Save</small>
                        </button>
                        <button
                          className="btn-sm btn-default"
                          onClick={() => cancelEdit('_topItems.prio')}
                        >
                          <small>Cancel</small>
                        </button>
                      </p>}
                    {savingEdit['_topItems.prio'] &&
                      <p className="col-xs-8 form-control-static edit-spinner"><img src={SpinnerDark} alt="" /></p>}
                  </div>

                  {array() && task() &&
                    <div className="row">
                      <label htmlFor="runtime" className="col-xs-4 control-label text-left">Reason</label>
                      {array() && selectedArrayData?._reason &&
                        <p className="col-xs-8 form-control-static">{selectedArrayData?._reason}<br /></p>}
                      {task() && selectedTaskData?._reason &&
                        <p className="col-xs-8 form-control-static">{selectedTaskData?._reason}<br /></p>}
                    </div>}

                  {(selectedGraphData?.notes || selectedArrayData?.notes || selectedTaskData?.notes) &&
                    <div className="row">
                      <label htmlFor="notes" className="col-xs-4 control-label text-left">Notes</label>
                      {!editMode['_topItems.notes'] && !savingEdit['_topItems.notes'] &&
                        <p
                          className="col-xs-8 form-control-static editable"
                          onMouseOver={() => fieldHover("_topItems.notes")}
                          onMouseLeave={() => fieldHoverLeave("_topItems.notes")}
                          onClick={() => editField('_topItems.notes')}
                        >
                          {selectedGraphData?.notes}{selectedArrayData?.notes}{selectedTaskData?.notes}
                          {showEditIcon['_topItems.notes'] &&
                            <span className="glyphicon glyphicon-pencil"></span>}
                          {savedEdit['_topItems.notes'] &&
                            <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                        </p>}
                      {editMode['_topItems.notes'] && !savingEdit['_topItems.notes'] &&
                        <p className="col-xs-8 form-control-static edit-metadata">
                          <textarea
                            ref={editVal5}
                            id="editTextArea"
                            onInput={(event) => adjustHeight(event.target)}
                            rows="1"
                          >
                            {selectedGraphData?.notes || selectedArrayData?.notes || selectedTaskData?.notes}
                          </textarea>
                          <br />
                          <button
                            className="btn-sm btn-primary"
                            onClick={() => editNotes(editVal5.current.value)}
                          >
                            <small><span className="glyphicon glyphicon-save"></span>Save</small>
                          </button>
                          <button
                            className="btn-sm btn-default"
                            onClick={() => cancelEdit('_topItems.notes')}
                          >
                            <small>Cancel</small>
                          </button>
                        </p>}
                      {savingEdit['_topItems.notes'] &&
                        <p className="col-xs-8 form-control-static edit-spinner"><img src={SpinnerDark} alt="" /></p>}
                    </div>}

                  {(selectedGraphData?._exechost || selectedArrayData?._exechost || selectedTaskData?._exechost) &&
                    <div className="row">
                      <label htmlFor="exechost" className="col-xs-4 control-label text-left">Exec Host</label>
                      <p className="col-xs-8 form-control-static">{selectedGraphData?._exechost}{selectedArrayData?._exechost}{selectedTaskData?._exechost}</p>
                    </div>}

                  {(selectedGraphData?.imagepath || selectedArrayData?.imagepath || selectedTaskData?.imagepath) &&
                    <div className="row">
                      <label htmlFor="directory" className="col-xs-4 control-label text-left">Directory</label>
                      <div className="col-xs-8 form-control-static">
                        <span className="input-group">
                          <input
                            // #dirInput
                            id="directory-target"
                            type="text"
                            className="form-control input-sm"
                            value={selectedGraphData?.imagepath?.split('/').slice(0, -1).join('/') + selectedArrayData?.imagepath?.split('/').slice(0, -1).join('/') + selectedTaskData?.imagepath?.split('/').slice(0, -1).join('/')}
                          />
                          <span className="input-group-btn">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              href="#"
                              tooltip="Copy to Clipboard"
                              title="Copy to clipboard"
                              onClick={(event) => copyToClipboard(event, 'directory-target')}
                            >
                              Copy
                            </button>
                          </span>
                        </span>
                      </div>
                    </div>}

                  {(selectedGraphData?.n_rapfile || selectedArrayData?.n_rapfile || selectedTaskData?.n_rapfile) &&
                    <div className="row">
                      <label htmlFor="rapFile" className="col-xs-4 control-label text-left">Rapfile</label>
                      <div className="col-xs-8 form-control-static">
                        <span className="input-group">
                          <input
                            // #rapfileInput
                            id="rapFile-target"
                            type="text"
                            className="form-control input-sm"
                            value={selectedGraphData?.n_rapfile + selectedArrayData?.n_rapfile + selectedTaskData?.n_rapfile}
                          />
                          <span className="input-group-btn">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              href="#"
                              tooltip="Copy to Clipboard"
                              title="Copy to clipboard"
                              onClick={(event) => copyToClipboard(event, 'rapFile-target')}
                            >
                              Copy
                            </button>
                          </span>
                        </span>
                      </div>
                    </div>}

                  {task() &&
                    <div className="row">
                      <label htmlFor="statusHistory" className="col-xs-4 control-label text-left">History</label>
                      {taskData?._statushist &&
                        <div className="col-xs-8 form-control-static status-history">
                          {!statusHistoryExpanded &&
                            <ul>
                              {getStatusHistData(taskData?._statushist).length > 5 &&
                                <span
                                  className="glyphicon glyphicon-triangle-right"
                                  onClick={() => toggleStatusHistory()}
                                />}
                              {
                                getStatusHistData(taskData?._statushist).slice(0, 5).map((status, index) => {
                                  return (
                                    <>
                                      {status.date &&
                                        <div><small>{status.date}</small></div>}
                                      <span className="status-time">{status.time}:</span>
                                      <div className="status-msg">
                                        {status.hover && status.hover.length > 0 &&
                                          <span
                                            className="hoverable-msg"
                                            onMouseEnter={() => statusHoverEnter(index)}
                                          >
                                            {status.msg}
                                          </span>}
                                        {(!status.hover || status.hover.length < 1) &&
                                          <span>{status.msg}</span>}
                                        {statusHover[index] && status.hover.length > 0 &&
                                          <div className="hover-div">
                                            {
                                              status.hover.map((hoverStatus) => {
                                                return (
                                                  <>
                                                    <span className="hoverTime">{hoverStatus.time}:</span> {hoverStatus.msg}
                                                  </>
                                                )
                                              })
                                            }
                                          </div>}
                                      </div>
                                    </>
                                  )
                                })
                              }
                              {getStatusHistData(taskData?._statushist).length > 5 &&
                                <li
                                  className="show-more"
                                  onClick={() => toggleStatusHistory()}
                                >
                                  <span className="glyphicon glyphicon-chevron-down" />more
                                </li>}
                            </ul>}
                          {statusHistoryExpanded &&
                            <ul>
                              <span
                                className="glyphicon glyphicon-triangle-bottom"
                                onClick={() => toggleStatusHistory()}
                              />
                              {
                                getStatusHistData(taskData?._statushist).map((status, index) => {
                                  <>
                                    {status.date &&
                                      <div><small>{status.date}</small></div>}
                                    <span className="status-time">{status.time}:</span>
                                    <div className="status-msg">
                                      {status.hover && status.hover.length > 0 &&
                                        <span
                                          className="hoverable-msg"
                                          onMouseEnter={() => statusHoverEnter(index)}
                                        >
                                          {status.msg}
                                        </span>}
                                      {(!status.hover || status.hover.length < 1) &&
                                        <span>{status.msg}</span>}
                                      {statusHover[index] && status.hover.length > 0 &&
                                        <div className="hover-div">
                                          {
                                            status.hover.map((hoverStatus) => {
                                              return (
                                                <>
                                                  <span className="hoverTime">{hoverStatus.time}:</span> {hoverStatus.msg}
                                                </>
                                              )
                                            })
                                          }
                                        </div>}
                                    </div>
                                  </>
                                })
                              }
                            </ul>}
                        </div>}
                    </div>}

                  {((codaHealth && codaHealth['rqinfod'].status === 'red') || showErrorMsg) &&
                    <div className="obj-details-error-message text-center">
                      <p><strong><span className="glyphicon glyphicon-exclamation-sign"></span> We're sorry.</strong></p>
                      <p>You can't access more details for the moment.</p>
                    </div>}

                  {!showMore && codaHealth && codaHealth['rqinfod'].status !== 'red' && !showErrorMsg &&
                    <div className="row">
                      <div className="col-xs-12">
                        <br />
                        <div
                          className="btn btn-default btn-sm btn-block"
                          id="show-all-metadata"
                          onClick={() => toggleShowMore()}
                        >
                          Show All Metadata
                        </div>
                      </div>
                    </div>}

                  {showMore && codaHealth && codaHealth['rqinfod'].status !== 'red' && !showErrorMsg &&
                    <div className="show-more">
                      {
                        metadataKeys && metadataKeys.length > 0 && metadataKeys.map((item) => {
                          return (
                            <div className="row">
                              {item !== 'arrays' && item !== 'tasks' &&
                                <>
                                  <label className="col-xs-4 control-label text-left crop-long-text" title={item}>{item}</label>
                                  {!editMode[item] && !savingEdit[item] && isObject(selectedObj()[item]) && expandedObj[item] &&
                                    <p className="col-xs-8 form-control-static">
                                      <span
                                        className="glyphicon glyphicon-triangle-bottom"
                                        onClick={() => toggleObj(item)}
                                      />
                                      {item.charAt(0) !== '_' &&
                                        <span
                                          onMouseOver={() => fieldHover(item)}
                                          onMouseLeave={() => fieldHoverLeave(item)}
                                          onClick={() => editField(item)}
                                          className="editable"
                                        >
                                          <pre>{JSON.stringify(selectedObj()[item])}</pre>
                                          {showEditIcon[item] &&
                                            <span className="glyphicon glyphicon-pencil"></span>}
                                        </span>}
                                      {item.charAt(0) === '_' &&
                                        <span><pre>{JSON.stringify(selectedObj()[item])}</pre></span>}
                                      {savedEdit[item] &&
                                        <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                                    </p>}
                                  {!editMode[item] && !savingEdit[item] && isObject(selectedObj()[item]) && !expandedObj[item] &&
                                    <p className="col-xs-8 form-control-static collapsed-obj">
                                      <span
                                        className="glyphicon glyphicon-triangle-right"
                                        onClick={() => toggleObj(item)}
                                      />
                                      {item.charAt(0) !== '_' &&
                                        <span
                                          onMouseOver={() => fieldHover(item)}
                                          onMouseLeave={() => fieldHoverLeave(item)}
                                          onClick={() => editField(item)}
                                          className="editable"
                                        >
                                          <span className="crop-long-text" style={{ maxWidth: "185px" }}>{JSON.stringify(selectedObj()[item])}</span>
                                          {showEditIcon[item] &&
                                            <span className="glyphicon glyphicon-pencil collapsed-obj"></span>}
                                        </span>}
                                      {item.charAt(0) === '_' &&
                                        <span className="crop-long-text" style={{ maxWidth: "185px" }}>{JSON.stringify(selectedObj()[item])}</span>}
                                      {savedEdit[item] &&
                                        <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                                    </p>}
                                  {!editMode[item] && !savingEdit[item] && !isObject(selectedObj()[item]) &&
                                    <p className="col-xs-8 form-control-static">
                                      {item.charAt(0) !== '_' &&
                                        <span
                                          onMouseOver={() => fieldHover(item)}
                                          onMouseLeave={() => fieldHoverLeave(item)}
                                          onClick={() => editField(item)}
                                          className="editable"
                                        >
                                          <span style={{ maxWidth: "185px" }}>{JSON.stringify(selectedObj()[item])}</span>
                                          {showEditIcon[item] &&
                                            <span className="glyphicon glyphicon-pencil"></span>}
                                        </span>}
                                      {item.charAt(0) === '_' &&
                                        <span>{JSON.stringify(selectedObj()[item])}</span>}
                                      {savedEdit[item] &&
                                        <span className="edit-saved-span"><br /><small><span className="glyphicon glyphicon-ok"></span>saved</small></span>}
                                    </p>}
                                  {editMode[item] &&
                                    <p className="col-xs-8 form-control-static edit-metadata">
                                      <textarea
                                        ref={editVal6}
                                        id="editTextArea"
                                        onInput={(event) => adjustHeight(event.target)}
                                        rows="1"
                                      >
                                        {JSON.stringify(selectedObj()[item])}
                                      </textarea>
                                      <br />
                                      <button
                                        className="btn-sm btn-primary"
                                        onClick={() => saveEdit(item, editVal6.current.value)}
                                      >
                                        <small><span className="glyphicon glyphicon-save"></span>Save</small>
                                      </button>
                                      <button
                                        className="btn-sm btn-default"
                                        onClick={() => cancelEdit(item)}
                                      >
                                        <small>Cancel</small>
                                      </button>
                                    </p>}
                                  {savingEdit[item] &&
                                    <p className="col-xs-8 form-control-static edit-spinner"><img src={SpinnerDark} alt="" /></p>}
                                </>}
                            </div>
                          )
                        })
                      }
                    </div>}
                </fieldset>
              </form>
            </div>
          </div>
        </div>}
    </>
  )
}