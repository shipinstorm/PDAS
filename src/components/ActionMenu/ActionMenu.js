import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames";
import { Subject } from "rxjs";
import {
  modalConfirmObj,
  modalUpdateType,
  modalUpdateFlag,
  modalHostsObj,
  modalUpdateValue,
  modalUpdateCallBack,
} from "../../store/actions/modalAction";
import { ModalType } from "../../types/ModalType";
import "./ActionMenu.scss";

export default function DgraphActionMenuComponent({
  targetId,
  classes,
  toggleDetails,
  toggleLog,
  mainContentWrapperTop,
}) {
  const dispatch = useDispatch();

  const contextRef = useRef(null);

  // Global Variables from Redux State
  const externalIP = useSelector((state) => state.global.externalIP);
  const imagePaths = useSelector((state) => state.global.imagePaths);
  const elasticSearchService = useSelector((state) => state.global.elasticSearchService);

  // Job Variables from Redux State
  const selectedGraphData = useSelector((state) => state.job.graphSelected);
  const selectedArrayData = useSelector((state) => state.job.arraySelected);
  const selectedTaskData = useSelector((state) => state.job.taskSelected);
  const items = useSelector((state) => state.job.jobSelected);

  // Modal Variables from Redux State
  const modalCallBack = useSelector((state) => state.modal.modalCallBack);
  const modalType = useSelector((state) => state.modal.modalType);
  const modalValue = useSelector((state) => state.modal.modalValue);
  const local_exclusive = useSelector((state) => state.modal.localExclusive);
  const selectedHosts = useSelector((state) => state.modal.selectedHosts);

  const selectedItem = {
    ...selectedGraphData,
    ...selectedArrayData,
    ...selectedTaskData,
  };

  const [contextData, setContextData] = useState({
    visible: false,
    posX: 0,
    posY: 0,
  });

  useEffect(() => {
    if (modalCallBack === 1) {
      if (modalType === ModalType.Confirm) {
        rightClickCallbackMain(modalValue);
      } else if (modalType === ModalType.RequeueLocally) {
        sendRequeueRequest(selectedHosts, local_exclusive);
      }
    } else if (modalCallBack === 2) {
      doKillAction();
    } else if (modalCallBack === 3) {
      doKillToDoneAction();
    } else if (modalCallBack === 4) {
    }
    dispatch(modalUpdateCallBack(0));
  }, [modalCallBack]);

  useEffect(() => {
    const contextMenuEventHandler = (event) => {
      const targetElement = document.getElementsByClassName(targetId)[0];
      if (targetElement && targetElement.contains(event.target)) {
        event.preventDefault();
        setContextData({
          visible: true,
          posX: event.clientX,
          posY: event.clientY,
        });
      } else if (
        contextRef.current &&
        !contextRef.current.contains(event.target)
      ) {
        setContextData({ ...contextData, visible: false });
      }
    };

    const offClickHandler = (event) => {
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setContextData({ ...contextData, visible: false });
      }
    };

    document.addEventListener("contextmenu", contextMenuEventHandler);
    document.addEventListener("click", offClickHandler);
    return () => {
      document.removeEventListener("contextmenu", contextMenuEventHandler);
      document.removeEventListener("click", offClickHandler);
    };
  }, [contextData, targetId]);

  useLayoutEffect(() => {
    if (
      contextData.posX + contextRef.current?.offsetWidth >
      window.innerWidth
    ) {
      setContextData({
        ...contextData,
        posX: contextData.posX - contextRef.current?.offsetWidth,
      });
    }
    if (
      contextData.posY + contextRef.current?.offsetHeight >
      window.innerHeight
    ) {
      setContextData({
        ...contextData,
        posY: contextData.posY - contextRef.current?.offsetHeight,
      });
    }
  }, [contextData]);

  const [rightClickAction, setRightClickAction] = useState();

  const [title, setTitle] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [requeueAllAction, setRequeueAllAction] = useState({
    name: "Requeue All",
    horizontalBefore: false,
    subject: new Subject(),
    className: "requeueAllAction",
  });
  const [requeueRunAction, setRequeueRunAction] = useState({
    name: "Requeue Running",
    horizontalBefore: false,
    subject: new Subject(),
    className: "requeueRunAction",
  });
  const [requeueExitAction, setRequeueExitAction] = useState({
    name: "Requeue Exited",
    horizontalBefore: false,
    subject: new Subject(),
    className: "requeueExitAction",
  });
  const [requeueLocallyAction, setRequeueLocallyAction] = useState({
    name: "Requeue Locally",
    horizontalBefore: false,
    subject: new Subject(),
    className: "requeueLocallyAction",
  });
  const [requeueAction, setRequeueAction] = useState({
    name: "Requeue",
    horizontalBefore: true,
    icon: "retweet",
    subject: new Subject(),
    sublinks: [requeueAllAction, requeueRunAction, requeueExitAction],
    className: "requeueAction",
  });
  const [killAction, setKillAction] = useState({
    name: "Kill",
    horizontalBefore: false,
    subject: new Subject(),
    icon: "ban-circle",
    altText: "Ctrl+Shift+K",
    className: "killAction",
  });
  const [killToDoneAction, setKillToDoneAction] = useState({
    name: "Kill & Mark as Done",
    horizontalBefore: false,
    subject: new Subject(),
    className: "killToDoneAction",
  });
  const [breakDependenciesAction, setBreakDependenciesAction] = useState({
    name: "Break Dependencies",
    title: "Break Dependencies",
    horizontalBefore: true,
    icon: "scissors",
    subject: new Subject(),
    className: "breakDependenciesAction",
  });
  const [viewDetails, setViewDetails] = useState({
    name: "View Job Details",
    title: "View Job Details",
    horizontalBefore: true,
    subject: new Subject(),
    icon: "info-sign",
    altText: "Ctrl+Shift+V",
    className: "viewDetails",
  });
  const [viewLog, setViewLog] = useState({
    name: "View Log",
    title: "View Log",
    horizontalBefore: false,
    subject: new Subject(),
    icon: "file",
    altText: "Ctrl+Shift+L",
    className: "viewLog",
  });
  const [playImagesAction, setPlayImagesAction] = useState({
    name: "Play Image Sequence",
    title: "Play Image Sequence",
    horizontalBefore: true,
    subject: new Subject(),
    icon: "play",
    altText: "Space",
    className: "playImagesAction",
  });
  const [copyInfoAction, setCopyInfoAction] = useState({
    name: "Copy Job ID to Clipboard",
    title: "Copy Job ID to Clipboard",
    horizontalBefore: true,
    subject: new Subject(),
    icon: "copy",
    className: "copyInfoAction",
  });
  const [imagePath, setImagePath] = useState();
  const [jobVisibility, setJobVisibility] = useState({
    name: "Set Job Visibility",
    horizontalBefore: true,
    subject: new Subject(),
    altText: "Ctrl+Shift+H",
    className: "jobVisibility",
  });
  const [links, setLinks] = useState([
    killAction,
    killToDoneAction,
    copyInfoAction,
    requeueAction,
    requeueLocallyAction,
    breakDependenciesAction,
    playImagesAction,
    viewDetails,
    viewLog,
    jobVisibility,
  ]);
  const [excludeConfirmLists, setExcludeConfirmLists] = useState([
    copyInfoAction,
    playImagesAction,
    viewDetails,
    viewLog,
    jobVisibility,
    requeueLocallyAction,
  ]);
  const [hosts, setHosts] = useState({});
  const [rvLinkURL, setRVLinkURL] = useState();

  useEffect(() => {
    window.addEventListener("keydown", (event) => {
      if (
        event.keyCode === 32 &&
        document.activeElement !== document.getElementById("search") &&
        event.target.type !== "textarea"
      ) {
        event.preventDefault();
        playImages();
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.keyCode === 72 &&
        document.activeElement !== document.getElementById("search") &&
        event.target.type !== "textarea"
      ) {
        event.preventDefault();
        setVisibility(selectedItem);
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.keyCode === 75 &&
        document.activeElement !== document.getElementById("search") &&
        event.target.type !== "textarea"
      ) {
        event.preventDefault();
        killShortcut();
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.keyCode === 76 &&
        document.activeElement !== document.getElementById("search") &&
        event.target.type !== "textarea"
      ) {
        event.preventDefault();
        toggleLog();
      }

      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.keyCode === 86 &&
        document.activeElement !== document.getElementById("search") &&
        event.target.type !== "textarea"
      ) {
        event.preventDefault();
        toggleDetails();
      }
    });

    // if (elasticSearchService.user['username']) {
    //   elasticSearchService.populateHostList();
    // }
  }, []);

  useEffect(() => {
    let tmpLinks = links;
    tmpLinks.forEach((link) => {
      if (link.subject) {
        link.subject = new Subject();
        link.subject.subscribe((val) =>
          rightClickCallback(val, items, selectedItem)
        );
      }

      if (link.sublinks) {
        link.sublinks.forEach((sublink) => {
          if (sublink.subject) {
            sublink.subject = new Subject();
            sublink.subject.subscribe((val) =>
              rightClickCallback(val, items, selectedItem)
            );
          }
        });
      }
    });

    let tmpKillAction = killAction;
    let tmpKillToDoneAction = killToDoneAction;
    let tmpCopyInfoAction = copyInfoAction;
    let tmpRequeueAllAction = requeueAllAction;
    let tmpRequeueRunAction = requeueRunAction;
    let tmpRequeueExitAction = requeueExitAction;
    let tmpRequeueAction = requeueAction;
    let tmpRequeueLocallyAction = requeueLocallyAction;
    let tmpBreakDependenciesAction = breakDependenciesAction;
    let tmpPlayImagesAction = playImagesAction;
    let tmpViewDetails = viewDetails;
    let tmpViewLog = viewLog;
    let tmpJobVisibility = jobVisibility;
    let tmpExcludeConfirmLists = excludeConfirmLists;

    if (items || selectedItem) {
      // If we're accessing externally, disable the playImagesAction
      // If we're accessing internally, re-enable the playImagesAction
      tmpPlayImagesAction.disabled = externalIP;

      if (
        items.length &&
        imagePaths[getItemId(items[0])] &&
        !Object.keys(imagePaths[getItemId(items[0])]).length
      )
        tmpPlayImagesAction.disabled = true;

      if (items.length === 1 && selectedItem) {
        tmpKillAction.title = "Kill " + getItemId(items[0]);

        tmpKillToDoneAction.title =
          "Kill " + getItemId(items[0]) + " & Mark as Done";

        if (items[0].tid) {
          tmpRequeueAction.title = "Requeue " + getItemId(items[0]);
          tmpRequeueAction.sublinks = null;
        } else {
          tmpRequeueAllAction.title = "All";

          tmpRequeueRunAction.title = "Running";

          tmpRequeueExitAction.title = "Exited";

          tmpRequeueAction.title = "Requeue";
          tmpRequeueAction.sublinks = [
            tmpRequeueAllAction,
            tmpRequeueRunAction,
            tmpRequeueExitAction,
          ];

          tmpRequeueLocallyAction.title = "Requeue Locally";
        }
        tmpCopyInfoAction.disabled = false;
        tmpViewDetails.disabled = false;
        // Only show the log item for tasks
        if (items[0].tid) {
          tmpViewLog.disabled = false;
        } else {
          tmpViewLog.disabled = true;
        }

        tmpRequeueLocallyAction.title =
          "Requeue " + getItemId(items[0]) + " Locally";

        // only show Hide menu item if selected item is a dgraph
        if (!items[0].aid) {
          if (tmpLinks.indexOf(tmpJobVisibility) < 0) {
            tmpLinks.push(tmpJobVisibility);
          }

          if (selectedItem.clienthide === 1) {
            tmpJobVisibility.title = "Unhide " + getItemId(items[0]);
            tmpJobVisibility.icon = "eye-open";
          } else {
            tmpJobVisibility.title = "Hide " + getItemId(items[0]);
            tmpJobVisibility.icon = "eye-close";
          }
        } else {
          let i = tmpLinks.indexOf(tmpJobVisibility);

          if (i > -1) {
            tmpLinks.splice(i, 1);
          }
        }
      } else {
        tmpKillAction.title = "Kill";

        tmpKillToDoneAction.title = "Kill & Mark as Done";

        tmpRequeueAllAction.title = "All";

        tmpRequeueRunAction.title = "Running";

        tmpRequeueExitAction.title = "Exited";

        tmpRequeueAction.title = "Requeue";
        tmpRequeueAction.sublinks = [
          tmpRequeueAllAction,
          tmpRequeueRunAction,
          tmpRequeueExitAction,
        ];

        tmpRequeueLocallyAction.title = "Requeue Locally";

        tmpCopyInfoAction.disabled = true;
        tmpViewDetails.disabled = true;
        tmpViewLog.disabled = true;

        // only show Hide menu item if there is a dgraph selected
        if (
          items.filter((item) => {
            return !item.aid;
          }).length > 0
        ) {
          if (tmpLinks.indexOf(tmpJobVisibility) < 0) {
            tmpLinks.push(tmpJobVisibility);
          }

          if (selectedItem && selectedItem.clienthide === 1) {
            tmpJobVisibility.title = "Unhide selected dgraphs";
            tmpJobVisibility.icon = "eye-open";
          } else {
            tmpJobVisibility.title = "Hide selected dgraphs";
            tmpJobVisibility.icon = "eye-close";
          }
        } else {
          let i = tmpLinks.indexOf(tmpJobVisibility);

          if (i > -1) {
            tmpLinks.splice(i, 1);
          }
        }
      }
    }

    setKillAction(tmpKillAction);
    setKillToDoneAction(tmpKillToDoneAction);
    setCopyInfoAction(tmpCopyInfoAction);
    setRequeueAllAction(tmpRequeueAction);
    setRequeueRunAction(tmpRequeueRunAction);
    setRequeueExitAction(tmpRequeueExitAction);
    setRequeueAction(tmpRequeueAction);
    setRequeueLocallyAction(tmpRequeueLocallyAction);
    setBreakDependenciesAction(tmpBreakDependenciesAction);
    setPlayImagesAction(tmpPlayImagesAction);
    setViewDetails(tmpViewDetails);
    setViewLog(tmpViewLog);
    setJobVisibility(tmpJobVisibility);
    setLinks(tmpLinks);
    setExcludeConfirmLists(tmpExcludeConfirmLists);
  }, [items, selectedItem, imagePaths]);

  const getItemId = (item) => {
    let itemId = item.did;
    itemId += item.aid ? "." + item.aid : "";
    itemId += item.tid ? "." + item.tid : "";
    return itemId;
  };

  const rightClickCallback = (val, items, selectedItem) => {
    if (
      excludeConfirmLists.indexOf(val) > -1 ||
      (items.length === 1 && items[0].tid)
    ) {
      // call it without the confirm if it's in the exclude list
      rightClickCallbackMain(val);
    } else {
      let confirmModalObj = {};
      if (items.length === 1 && selectedItem) {
        switch (val) {
          case killAction:
            confirmModalObj.modalTitle = "Kill all jobs?";
            confirmModalObj.modalBody =
              'Do you want to kill all jobs from: \n"' +
              selectedItem.title +
              '"\n(Job ID: ' +
              getItemId(items[0]) +
              ")";
            confirmModalObj.confirmBtn = "Kill All";
            break;
          case killToDoneAction:
            confirmModalObj.modalTitle = "Kill all jobs & Mark as Done?";
            confirmModalObj.modalBody =
              'Do you want to kill all jobs and mark them as done from: \n"' +
              selectedItem.title +
              '"\n(Job ID: ' +
              getItemId(items[0]) +
              ")";
            confirmModalObj.confirmBtn = "Kill All & Mark Done";
            break;
          case requeueAllAction:
            confirmModalObj.modalTitle = "Requeue all jobs?";
            confirmModalObj.modalBody =
              'Do you want to requeue all jobs from: \n"' +
              selectedItem.title +
              '"\n(Job ID: ' +
              getItemId(items[0]) +
              ")";
            confirmModalObj.confirmBtn = "Requeue All";
            break;
          case requeueRunAction:
            confirmModalObj.modalTitle = "Requeue running jobs?";
            confirmModalObj.modalBody =
              'Do you want to requeue all running jobs from: \n"' +
              selectedItem.title +
              '"\n(Job ID: ' +
              getItemId(items[0]) +
              ")";
            confirmModalObj.confirmBtn = "Requeue Running";
            break;
          case requeueExitAction:
            confirmModalObj.modalTitle = "Requeue exited jobs?";
            confirmModalObj.modalBody =
              'Do you want to requeue all exited jobs from: \n"' +
              selectedItem.title +
              '"\n(Job ID: ' +
              getItemId(items[0]) +
              ")";
            confirmModalObj.confirmBtn = "Requeue Exited";
            break;
          case breakDependenciesAction:
            confirmModalObj.modalTitle = "Break Dependencies?";
            confirmModalObj.modalBody =
              "Break dependencies for " + getItemId(items[0]) + "?";
            confirmModalObj.confirmBtn = "Break";
            break;
          default:
            break;
        }
      } else {
        switch (val) {
          case killAction:
            confirmModalObj.modalTitle = "Kill selected jobs?";
            confirmModalObj.modalBody =
              "Do you want to kill all jobs from " +
              items.length +
              " selected items?";
            confirmModalObj.confirmBtn = "Kill " + items.length + " item";
            break;
          case killToDoneAction:
            confirmModalObj.modalTitle = "Kill selected jobs & Mark as Done?";
            confirmModalObj.modalBody =
              "Do you want to kill all jobs from " +
              items.length +
              " selected items and mark them as done?";
            confirmModalObj.confirmBtn = "Kill All & Mark Done";
            break;
          case requeueAllAction:
            confirmModalObj.modalTitle = "Requeue selected jobs?";
            confirmModalObj.modalBody =
              "Do you want to requeue all jobs from " +
              items.length +
              " selected items?";
            confirmModalObj.confirmBtn = "Requeue " + items.length + " items";
            break;
          case requeueRunAction:
            confirmModalObj.modalTitle = "Requeue running from selected jobs?";
            confirmModalObj.modalBody =
              "Do you want to requeue all running jobs from " +
              items.length +
              " selected items?";
            confirmModalObj.confirmBtn =
              "Requeue Running from " + items.length + " items";
            break;
          case requeueExitAction:
            confirmModalObj.modalTitle = "Requeue exited from selected jobs?";
            confirmModalObj.modalBody =
              "Do you want to requeue all exited jobs from " +
              items.length +
              " selected items?";
            confirmModalObj.confirmBtn =
              "Requeue Exited from " + items.length + " items";
            break;
          case breakDependenciesAction:
            confirmModalObj.modalTitle = "Break Dependencies?";
            confirmModalObj.modalBody =
              "Break dependencies for " + items.length + " selected items?";
            confirmModalObj.confirmBtn = "Break";
            break;
          default:
            break;
        }
      }
      dispatch(modalConfirmObj(confirmModalObj));
      dispatch(modalUpdateType(ModalType.Confirm));
      dispatch(modalUpdateFlag(1));
      dispatch(modalUpdateValue(val));
    }
  };

  const rightClickCallbackMain = (val) => {
    setRightClickAction(val);

    switch (val) {
      case requeueAction:
      case requeueAllAction:
        for (let item of items) {
          if (!item.aid) {
            elasticSearchService.requeueAll(Number(item.did))
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          } else if (!item.tid) {
            elasticSearchService.requeueAll(Number(item.did), Number(item.aid))
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          } else if (item.tid) {
            elasticSearchService.requeueAll(
              Number(item.did),
              Number(item.aid),
              Number(item.tid)
            )
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          }
        }
        break;
      case requeueRunAction:
        for (let item of items) {
          if (!item.aid) {
            elasticSearchService.requeueRun(Number(item.did))
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          } else if (!item.tid) {
            elasticSearchService.requeueRun(Number(item.did), Number(item.aid))
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          } else if (item.tid) {
            elasticSearchService.requeueRun(
              Number(item.did),
              Number(item.aid),
              Number(item.tid)
            )
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          }
        }
        break;
      case requeueExitAction:
        for (let item of items) {
          if (!item.aid) {
            elasticSearchService.requeueExit(Number(item.did))
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          } else if (!item.tid) {
            elasticSearchService.requeueExit(Number(item.did), Number(item.aid))
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          } else if (item.tid) {
            elasticSearchService.requeueExit(
              Number(item.did),
              Number(item.aid),
              Number(item.tid)
            )
              .then((title) => {
                // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..." });
              })
              .catch((error) => setErrorMessage(error));
          }
        }
        break;
      case killAction:
        doKillAction();
        break;
      case killToDoneAction:
        doKillToDoneAction();
        break;
      case requeueLocallyAction:
        requeueLocally();
        break;
      case breakDependenciesAction:
        breakDependencies();
        break;
      case viewDetails:
        toggleDetails();
        break;
      case viewLog:
        toggleLog();
        break;
      case setJobVisibility:
        setVisibility(selectedItem);
        break;
      case playImagesAction:
        playImages();
        break;
      case copyInfoAction:
        // let jobIdTextArea = <HTMLTextAreaElement>document.createElement("textarea");
        // jobIdTextArea.value = getItemId(items[0]);
        // document.body.appendChild(jobIdTextArea);
        // jobIdTextArea.select();
        // try {
        //     document.execCommand('copy');
        // } catch (err) {
        //     console.log('error copying job id: '+err);
        // }
        // document.body.removeChild(jobIdTextArea);
        break;
      default:
        break;
    }
  };

  const doKillAction = () => {
    for (let item of items) {
      if (!item.aid) {
        elasticSearchService.kill(Number(item.did))
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (!item.tid) {
        elasticSearchService.kill(Number(item.did), Number(item.aid))
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (item.tid) {
        elasticSearchService.kill(
          Number(item.did),
          Number(item.aid),
          Number(item.tid)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
          })
          .catch((error) => setErrorMessage(error));
      }
    }
  };

  const doKillToDoneAction = () => {
    for (let item of items) {
      if (!item.aid) {
        elasticSearchService.killToDone(Number(item.did))
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (!item.tid) {
        elasticSearchService.killToDone(Number(item.did), Number(item.aid))
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (item.tid) {
        elasticSearchService.killToDone(
          Number(item.did),
          Number(item.aid),
          Number(item.tid)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
          })
          .catch((error) => setErrorMessage(error));
      }
    }
  };

  const sendRequeueRequest = (listOfHosts, isexclusive) => {
    for (let item of items) {
      if (!item.aid) {
        elasticSearchService.requeueLocal(
          listOfHosts,
          isexclusive,
          Number(item.did)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (!item.tid) {
        elasticSearchService.requeueLocal(
          listOfHosts,
          isexclusive,
          Number(item.did),
          Number(item.aid)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (item.tid) {
        elasticSearchService.requeueLocal(
          listOfHosts,
          isexclusive,
          Number(item.did),
          Number(item.aid),
          Number(item.tid)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
          })
          .catch((error) => setErrorMessage(error));
      }
    }
  };

  const requeueLocally = () => {
    let confirmModalObj = {};
    confirmModalObj.modalTitle = "Requeue locally on which machine(s)?";
    confirmModalObj.confirmBtn = "Requeue";
    confirmModalObj.exclusiveMsg =
      "Run only on these hosts. Do not spill to the farm";

    dispatch(modalConfirmObj(confirmModalObj));
    dispatch(modalUpdateType(ModalType.RequeueLocally));
    dispatch(modalHostsObj(elasticSearchService.hosts));
    dispatch(modalUpdateFlag(1));
  };

  const killShortcut = () => {
    let confirmModalObj = {};
    confirmModalObj.modalTitle = "Kill all jobs?";
    confirmModalObj.modalBody =
      'Do you want to kill all jobs from: \n"' +
      selectedItem.title +
      '"\n(Job ID: ' +
      getItemId(items[0]) +
      ")";
    if (items.length > 1) {
      confirmModalObj.modalTitle = "Kill selected jobs?";
      confirmModalObj.modalBody =
        "Do you want to kill all jobs from " +
        items.length +
        " selected items?";
    }

    dispatch(modalConfirmObj(confirmModalObj));
    dispatch(modalUpdateType(ModalType.KillOptions));
    dispatch(modalUpdateFlag(1));
  };

  const breakDependencies = () => {
    for (let item of items) {
      if (!item.aid) {
        elasticSearchService.breakDgraphDependencies(Number(item.did))
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (!item.tid) {
        elasticSearchService.breakArrayDependencies(
          Number(item.did),
          Number(item.aid)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..." });
          })
          .catch((error) => setErrorMessage(error));
      } else if (item.tid) {
        elasticSearchService.breakTaskDependencies(
          Number(item.did),
          Number(item.aid),
          Number(item.tid)
        )
          .then((title) => {
            // actionSuccess.emit({ itemId: getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..." });
          })
          .catch((error) => setErrorMessage(error));
      }
    }
  };

  // Start the playback action.
  const playImages = () => {
    if (playImagesAction.disabled) return;

    console.log("[DEBUG] In playImages()");

    // Early out if there are no selected items.
    if (items) {
      dispatch(modalUpdateFlag(4));
    } else {
      return;
    }

    // Build a string list of selected job ids, converting each data
    // structure into a string of "did.aid.tid", "did.aid" or "did".
    let idList = items.map((item) => {
      if (item.tid) {
        return item.did + "." + item.aid + "." + item.tid;
      } else if (item.aid) {
        return item.did + "." + item.aid;
      } else {
        return item.did;
      }
    });
    console.log("[DEBUG] - items=" + idList.join(","));

    // Create an Observable for the service call to fetch the rvspec for the
    elasticSearchService.getRVSpec(idList, externalIP)
      .then((rvSpec) => playImagesCallBack(rvSpec.rvSpec))
      .catch((error) => console.log("[ERROR] (1) Problem getting rvspec: " + error));

    // Cancel the playback if requested.
    // codaModal.cancelCallback = function () {
    //   if (subscription) {
    //     console.log("Canceling loading imagePaths and RV callback.");
    //     subscription.unsubscribe();
    //   }
    // };
  };

  const setVisibility = (job) => {
    if (job) {
      let code = "1";

      //sets visibility based on first job selected
      if (job.clienthide && job.clienthide === 1) {
        code = "0";
      }

      if (code === "1") {
        //check that all items are finished - we don't allow hiding of unfinished jobs
        let unfinishedJobs = [];
        for (let item of items) {
          if (!item.aid) {
            let statuses = item._dgraphstatus;
            // 0=queued 1=run 7=depend 5=suspend 6=nostatus
            if (
              statuses.includes(0) ||
              statuses.includes(1) ||
              statuses.includes(7) ||
              statuses.includes(5) ||
              statuses.includes(6)
            ) {
              unfinishedJobs.push(item);
            }
          }
        }
        if (unfinishedJobs.length > 0) {
          let errorModalObj = {};
          errorModalObj.modalTitle = "Can't hide unfinished jobs";
          errorModalObj.modalBody =
            "The following jobs you have selected are unfinished:\n" +
            unfinishedJobs
              .map((item) => {
                return getItemId(item);
              })
              .join(", ");
          errorModalObj.modalBodyDetails =
            "Please kill job or wait for it to finish before hiding.";
          dispatch(modalConfirmObj(errorModalObj));
          dispatch(modalUpdateType(ModalType.Error));
          dispatch(modalUpdateFlag(1));
        } else {
          for (let item of items) {
            if (!item.aid) {
              elasticSearchService.setDgraphMeta(
                Number(getItemId(item)),
                "clienthide",
                code
              )
                .then((title) => {
                  // actionSuccess.emit("Job successfully hidden.");
                  // hideActionSuccess.emit({ itemId: getItemId(item), visibilityCode: code, time: new moment() });
                })
                .catch((error) => setErrorMessage(error));
            }
          }
        }
      } else {
        for (let item of items) {
          if (!item.aid) {
            elasticSearchService.setDgraphMeta(
              Number(getItemId(item)),
              "clienthide",
              code
            )
              .then((title) => {
                // actionSuccess.emit("Job successfully unhidden.");
                // unhideActionSuccess.emit({ itemId: getItemId(item), visibilityCode: code, time: new moment() });
              })
              .catch((error) => setErrorMessage(error));
          }
        }
      }
    }
  };

  const playImagesCallBack = (rvSpec) => {
    console.log("[DEBUG] In playImagesCallBack()");

    // No image paths (array is empty or length is 0 or
    // only object in array is empty; last one happens when individual tasks
    // are selected and have no imagePaths)
    if (typeof rvSpec == "undefined") {
      let dialogModalObj = {};
      dialogModalObj.modalTitle = "Playback Error";
      dialogModalObj.modalBody = "No images found.";
      dialogModalObj.modalBodyDetails =
        "The selection does not contain any playable images.";

      // dispatch(modalUpdateFlag(2));
      dispatch(modalConfirmObj(dialogModalObj));
      dispatch(modalUpdateType(ModalType.Error));
      dispatch(modalUpdateFlag(1));
      console.log("[WARN  503.1] Error fetching rvspec: " + rvSpec);
      return;
    }

    // Finally, if we got here, start the playback by opening the rvlink
    // url.
    // rvLinkURL = elasticSearchService.constructPlaybackUrl(rvSpec);
    // if (rvLinkURL.length > 0) {
    //   location.href = rvLinkURL;
    // }
    dispatch(modalUpdateFlag(3));
  };

  return (
    <div
      ref={contextRef}
      className="contextMenu dgraph-menu-container"
      style={{
        display: `${contextData.visible ? "block" : "none"}`,
        left: contextData.posX,
        top: contextData.posY - mainContentWrapperTop,
      }}
    >
      <div className={`optionsList ${classes?.listWrapper}`}>
        {links &&
          links.length > 0 &&
          links.map((link, index) => {
            return (
              <div key={index} className={"dgraph-menu " + link.className}>
                {link?.horizontalBefore && (
                  <div>
                    <hr />
                  </div>
                )}
                {!link?.sublinks && (
                  <div
                    className={classNames(
                      "link",
                      link?.disabled ? "disabled" : ""
                    )}
                    onClick={
                      !link?.disabled ? () => link.subject.next(link) : null
                    }
                  >
                    {link?.icon && (
                      <span
                        className={"glyphicon glyphicon-" + link?.icon}
                      ></span>
                    )}
                    {!link?.icon && <span className="no-icon"></span>}
                    {link?.title}
                    {link?.altText && (
                      <small className="pull-right">{link?.altText}</small>
                    )}
                  </div>
                )}
                {link?.sublinks && (
                  <div
                    className={classNames(
                      "link has-sublinks",
                      link?.disabled ? "disabled" : ""
                    )}
                  >
                    {link?.icon && (
                      <span
                        className={"glyphicon glyphicon-" + link?.icon}
                      ></span>
                    )}
                    {!link?.icon && <span className="no-icon"></span>}
                    {link?.title}
                    <div className="menu-sublinks pull-right">
                      {link?.sublinks.map((sublink, index) => {
                        return (
                          <span
                            key={index}
                            onClick={() => sublink.subject.next(sublink)}
                            className={"requeueAction-" + sublink.title}
                          >
                            {sublink?.title}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}