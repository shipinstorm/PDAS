import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useSelector } from "react-redux";

import classNames from 'classnames';

// import { CodaModalComponent } from '../modals/coda-modal.component';

import ElasticSearchService from "../../services/ElasticSearch.service";

import './ActionMenu.scss';

export default function DgraphActionMenuComponent({ codaModal, targetId, options, classes }) {
  const selectedGraphData = useSelector((state) => state.job.graphSelected);
  const selectedArrayData = useSelector((state) => state.job.arraySelected);
  const selectedTaskData = useSelector((state) => state.job.taskSelected);
  const selectedItem = {...selectedGraphData, ...selectedArrayData, ...selectedTaskData};
  const items = useSelector((state) => state.job.jobSelected);

  const externalIP = useSelector((state) => state.global.externalIP);

  const [contextData, setContextData] = useState({ visible: false, posX: 0, posY: 0 });
  const contextRef = useRef(null);

  useEffect(() => {
    const contextMenuEventHandler = (event) => {
      const targetElement = document.getElementById(targetId)
      if (targetElement && targetElement.contains(event.target)) {
        event.preventDefault();
        setContextData({ visible: true, posX: event.clientX, posY: event.clientY - 91 })
      } else if (contextRef.current && !contextRef.current.contains(event.target)) {
        setContextData({ ...contextData, visible: false })
      }
    }

    const offClickHandler = (event) => {
      if (contextRef.current && !contextRef.current.contains(event.target)) {
        setContextData({ ...contextData, visible: false })
      }
    }

    document.addEventListener('contextmenu', contextMenuEventHandler)
    document.addEventListener('click', offClickHandler)
    return () => {
      document.removeEventListener('contextmenu', contextMenuEventHandler)
      document.removeEventListener('click', offClickHandler)
    }
  }, [contextData, targetId])

  useLayoutEffect(() => {
    if (contextData.posX + contextRef.current?.offsetWidth > window.innerWidth) {
      setContextData({ ...contextData, posX: contextData.posX - contextRef.current?.offsetWidth })
    }
    if (contextData.posY + contextRef.current?.offsetHeight > window.innerHeight) {
      setContextData({ ...contextData, posY: contextData.posY - contextRef.current?.offsetHeight })
    }
  }, [contextData])

  const [rightClickAction, setRightClickAction] = useState();
  const [links, setLinks] = useState();
  const [title, setTitle] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [requeueAction, setRequeueAction] = useState();
  const [requeueAllAction, setRequeueAllAction] = useState();
  const [requeueRunAction, setRequeueRunAction] = useState();
  const [requeueExitAction, setRequeueExitAction] = useState();
  const [requeueLocallyAction, setRequeueLocallyAction] = useState();
  const [killAction, setKillAction] = useState();
  const [killToDoneAction, setKillToDoneAction] = useState();
  const [breakDependenciesAction, setBreakDependenciesAction] = useState();
  const [viewDetails, setViewDetails] = useState();
  const [viewLog, setViewLog] = useState();
  const [playImagesAction, setPlayImagesAction] = useState();
  const [copyInfoAction, setCopyInfoAction] = useState();
  const [imagePath, setImagePath] = useState();
  const [excludeConfirmLists, setExcludeConfirmLists] = useState();
  const [jobVisibility, setJobVisibility] = useState();
  const [hosts, setHosts] = useState({});
  const [rvLinkURL, setRVLinkURL] = useState();

  useEffect(() => {
    // renderer.listenGlobal('document', 'keydown', (event) => {
    //   if (event.ctrlKey && event.shiftKey && event.keyCode === 72 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
    //     event.preventDefault();
    //     setVisibility(selectedItem);
    //   }

    //   if (event.ctrlKey && event.shiftKey && event.keyCode === 75 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
    //     event.preventDefault();
    //     killShortcut();
    //   }

    //   if (event.ctrlKey && event.shiftKey && event.keyCode === 76 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
    //     event.preventDefault();
    //     openError.emit();
    //   }

    //   if (event.ctrlKey && event.shiftKey && event.keyCode === 86 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
    //     event.preventDefault();
    //     toggleDetails.emit();
    //   }
    // });

    let tmpKillAction = { name: 'Kill', horizontalBefore: false, icon: 'ban-circle', altText: 'Ctrl+Shift+K' };
    let tmpKillToDoneAction = { name: 'Kill & Mark as Done', horizontalBefore: false };
    let tmpCopyInfoAction = { name: 'Copy Job ID to Clipboard', title: 'Copy Job ID to Clipboard', horizontalBefore: true, icon: 'copy' };
    let tmpRequeueAllAction = { name: 'Requeue All', horizontalBefore: false }
    let tmpRequeueRunAction = { name: 'Requeue Running', horizontalBefore: false };
    let tmpRequeueExitAction = { name: 'Requeue Exited', horizontalBefore: false };
    let tmpRequeueAction = { name: 'Requeue', horizontalBefore: true, icon: 'retweet', sublinks: [tmpRequeueAllAction, tmpRequeueRunAction, tmpRequeueExitAction] };
    let tmpRequeueLocallyAction = { name: 'Requeue Locally', horizontalBefore: false };
    let tmpBreakDependenciesAction = { name: 'Break Dependencies', title: 'Break Dependencies', horizontalBefore: true, icon: 'scissors' };
    let tmpPlayImagesAction = { name: 'Play Image Sequence', title: 'Play Image Sequence', horizontalBefore: true, icon: 'play', altText: 'Space' };
    let tmpViewDetails = { name: 'View Job Details', title: 'View Job Details', horizontalBefore: true, icon: 'info-sign', altText: 'Ctrl+Shift+V' };
    let tmpViewLog = { name: 'View Log', title: 'View Log', horizontalBefore: false, icon: 'file', altText: 'Ctrl+Shift+L' };
    let tmpJobVisibility = { name: 'Set Job Visibility', horizontalBefore: true, altText: 'Ctrl+Shift+H' };
    let tmpLinks = [tmpKillAction, tmpKillToDoneAction, tmpCopyInfoAction, tmpRequeueAction, tmpRequeueLocallyAction, tmpBreakDependenciesAction, tmpPlayImagesAction, tmpViewDetails, tmpViewLog, tmpJobVisibility];
    let tmpExcludeConfirmLists = [tmpCopyInfoAction, tmpPlayImagesAction, tmpViewDetails, tmpViewLog, tmpJobVisibility, tmpRequeueLocallyAction];

    // links.forEach(link => {
    //   if (link.subject) {
    //     link.subject.subscribe(val => rightClickCallback(val))
    //   }

    //   if (link.sublinks) {
    //     link.sublinks.forEach(sublink => {
    //       if (sublink.subject) {
    //         sublink.subject.subscribe(val => rightClickCallback(val))
    //       }
    //     });
    //   }
    // });

    // if (ElasticSearchService.user['username']) {
    //   ElasticSearchService.populateHostList();
    // }

    if (items || selectedItem) {
      // If we're accessing externally, disable the playImagesAction
      // If we're accessing internally, re-enable the playImagesAction
      tmpPlayImagesAction.disabled = externalIP;
      if (items.length === 1 && selectedItem) {
        tmpKillAction.title = 'Kill ' + getItemId(items[0]);

        tmpKillToDoneAction.title = 'Kill ' + getItemId(items[0]) + ' & Mark as Done';

        if (items[0].tid) {
          tmpRequeueAction.title = 'Requeue ' + getItemId(items[0]);
          tmpRequeueAction.sublinks = null;
        } else {
          tmpRequeueAllAction.title = 'All';

          tmpRequeueRunAction.title = 'Running';

          tmpRequeueExitAction.title = 'Exited';

          tmpRequeueAction.title = 'Requeue';
          tmpRequeueAction.sublinks = [tmpRequeueAllAction, tmpRequeueRunAction, tmpRequeueExitAction];

          tmpRequeueLocallyAction.title = 'Requeue Locally';
        }
        tmpCopyInfoAction.disabled = false;
        tmpViewDetails.disabled = false;
        // Only show the log item for tasks
        if (items[0].tid) {
          tmpViewLog.disabled = false;
        } else {
          tmpViewLog.disabled = true;
        }

        tmpRequeueLocallyAction.title = 'Requeue ' + getItemId(items[0]) + ' Locally';

        // only show Hide menu item if selected item is a dgraph
        if (!items[0].aid) {
          if (tmpLinks.indexOf(tmpJobVisibility) < 0) {
            tmpLinks.push(tmpJobVisibility);
          }
          if (selectedItem.clienthide === 1) {
            tmpJobVisibility.title = 'Unhide ' + getItemId(items[0]);
            tmpJobVisibility.icon = 'eye-open';
          }
          else {
            tmpJobVisibility.title = 'Hide ' + getItemId(items[0]);
            tmpJobVisibility.icon = 'eye-close';
          }
        } else {
          let i = tmpLinks.indexOf(tmpJobVisibility)
          if (i > -1) {
            tmpLinks.splice(i, 1)
          }
        }
      } else {
        tmpKillAction.title = 'Kill';

        tmpKillToDoneAction.title = 'Kill & Mark as Done';

        tmpRequeueAllAction.title = 'All';

        tmpRequeueRunAction.title = 'Running';

        tmpRequeueExitAction.title = 'Exited';

        tmpRequeueAction.title = 'Requeue';
        tmpRequeueAction.sublinks = [tmpRequeueAllAction, tmpRequeueRunAction, tmpRequeueExitAction];

        tmpRequeueLocallyAction.title = 'Requeue Locally';

        tmpCopyInfoAction.disabled = true;
        tmpViewDetails.disabled = true;
        tmpViewLog.disabled = true;

        // only show Hide menu item if there is a dgraph selected
        if (items.filter(item => { return !item.aid }).length > 0) {
          if (tmpLinks.indexOf(tmpJobVisibility) < 0) {
            tmpLinks.push(tmpJobVisibility);
          }

          if (selectedItem && selectedItem.clienthide === 1) {
            tmpJobVisibility.title = 'Unhide selected dgraphs';
            tmpJobVisibility.icon = 'eye-open';
          }
          else {
            tmpJobVisibility.title = 'Hide selected dgraphs';
            tmpJobVisibility.icon = 'eye-close';
          }
        } else {
          let i = tmpLinks.indexOf(tmpJobVisibility)
          if (i > -1) {
            tmpLinks.splice(i, 1)
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

    console.log(tmpLinks);
  }, []);

  const getItemId = (item) => {
    let itemId = item.did;
    itemId += item.aid ? '.' + item.aid : "";
    itemId += item.tid ? '.' + item.tid : "";
    return itemId;
  }

  const rightClickCallback = (val) => {
    if (excludeConfirmLists.indexOf(val) > -1 || (items.length === 1 && items[0].tid)) {
      // call it without the confirm if it's in the exclude list
      rightClickCallbackMain(val);
    } else {
      let confirmModalObj = {}
      if (items.length === 1 && selectedItem) {
        switch (val) {
          case killAction:
            confirmModalObj.modalTitle = 'Kill all jobs?';
            confirmModalObj.modalBody = 'Do you want to kill all jobs from: \n"' + selectedItem.title + '"\n(Job ID: ' + getItemId(items[0]) + ')';
            confirmModalObj.confirmBtn = 'Kill All';
            break;
          case killToDoneAction:
            confirmModalObj.modalTitle = 'Kill all jobs & Mark as Done?';
            confirmModalObj.modalBody = 'Do you want to kill all jobs and mark them as done from: \n"' + selectedItem.title + '"\n(Job ID: ' + getItemId(items[0]) + ')';
            confirmModalObj.confirmBtn = 'Kill All & Mark Done';
            break;
          case requeueAllAction:
            confirmModalObj.modalTitle = 'Requeue all jobs?';
            confirmModalObj.modalBody = 'Do you want to requeue all jobs from: \n"' + selectedItem.title + '"\n(Job ID: ' + getItemId(items[0]) + ')';
            confirmModalObj.confirmBtn = 'Requeue All';
            break;
          case requeueRunAction:
            confirmModalObj.modalTitle = 'Requeue running jobs?';
            confirmModalObj.modalBody = 'Do you want to requeue all running jobs from: \n"' + selectedItem.title + '"\n(Job ID: ' + getItemId(items[0]) + ')';
            confirmModalObj.confirmBtn = 'Requeue Running';
            break;
          case requeueExitAction:
            confirmModalObj.modalTitle = 'Requeue exited jobs?';
            confirmModalObj.modalBody = 'Do you want to requeue all exited jobs from: \n"' + selectedItem.title + '"\n(Job ID: ' + getItemId(items[0]) + ')';
            confirmModalObj.confirmBtn = 'Requeue Exited';
            break;
          case breakDependenciesAction:
            confirmModalObj.modalTitle = "Break Dependencies?";
            confirmModalObj.modalBody = "Break dependencies for " + getItemId(items[0]) + "?";
            confirmModalObj.confirmBtn = 'Break';
            break;
          default:
            break;
        }
      } else {
        switch (val) {
          case killAction:
            confirmModalObj.modalTitle = 'Kill selected jobs?';
            confirmModalObj.modalBody = "Do you want to kill all jobs from " + items.length + " selected items?";
            confirmModalObj.confirmBtn = "Kill " + items.length + " item";
            break;
          case killToDoneAction:
            confirmModalObj.modalTitle = 'Kill selected jobs & Mark as Done?';
            confirmModalObj.modalBody = "Do you want to kill all jobs from " + items.length + " selected items and mark them as done?";
            confirmModalObj.confirmBtn = 'Kill All & Mark Done';
            break;
          case requeueAllAction:
            confirmModalObj.modalTitle = 'Requeue selected jobs?';
            confirmModalObj.modalBody = "Do you want to requeue all jobs from " + items.length + " selected items?";
            confirmModalObj.confirmBtn = "Requeue " + items.length + " items";
            break;
          case requeueRunAction:
            confirmModalObj.modalTitle = 'Requeue running from selected jobs?';
            confirmModalObj.modalBody = "Do you want to requeue all running jobs from " + items.length + " selected items?";
            confirmModalObj.confirmBtn = "Requeue Running from " + items.length + " items";
            break;
          case requeueExitAction:
            confirmModalObj.modalTitle = 'Requeue exited from selected jobs?';
            confirmModalObj.modalBody = "Do you want to requeue all exited jobs from " + items.length + " selected items?";
            confirmModalObj.confirmBtn = "Requeue Exited from " + items.length + " items";
            break;
          case breakDependenciesAction:
            confirmModalObj.modalTitle = "Break Dependencies?";
            confirmModalObj.modalBody = "Break dependencies for " + items.length + " selected items?"
            confirmModalObj.confirmBtn = 'Break';
            break;
          default:
            break;
        }
      }
      codaModal.showConfirm(confirmModalObj, () => rightClickCallbackMain(val));
    }
  }

  const rightClickCallbackMain = (val) => {
    setRightClickAction(val);

    switch (rightClickAction) {
      case requeueAction:
      case requeueAllAction:
        for (let item of items) {
          if (!item.aid) {
            ElasticSearchService.requeueAll(Number(item.did))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          } else if (!item.tid) {
            ElasticSearchService.requeueAll(Number(item.did), Number(item.aid))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          } else if (item.tid) {
            ElasticSearchService.requeueAll(Number(item.did), Number(item.aid), Number(item.tid))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          }
        }
        break;
      case requeueRunAction:
        for (let item of items) {
          if (!item.aid) {
            ElasticSearchService.requeueRun(Number(item.did))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          } else if (!item.tid) {
            ElasticSearchService.requeueRun(Number(item.did), Number(item.aid))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          } else if (item.tid) {
            ElasticSearchService.requeueRun(Number(item.did), Number(item.aid), Number(item.tid))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          }
        }
        break;
      case requeueExitAction:
        for (let item of items) {
          if (!item.aid) {
            ElasticSearchService.requeueExit(Number(item.did))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          } else if (!item.tid) {
            ElasticSearchService.requeueExit(Number(item.did), Number(item.aid))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
          } else if (item.tid) {
            ElasticSearchService.requeueExit(Number(item.did), Number(item.aid), Number(item.tid))
              .subscribe(
                title => {
                  // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..." });
                },
                error => setErrorMessage(error)
              );
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
        break;
      case viewLog:
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
  }

  const doKillAction = () => {
    for (let item of items) {
      if (!item.aid) {
        ElasticSearchService.kill(Number(item.did))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
            },
            error => setErrorMessage(error)
          );
      } else if (!item.tid) {
        ElasticSearchService.kill(Number(item.did), Number(item.aid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
            },
            error => setErrorMessage(error)
          );
      } else if (item.tid) {
        ElasticSearchService.kill(Number(item.did), Number(item.aid), Number(item.tid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
            },
            error => setErrorMessage(error)
          );
      }
    }
  };

  const doKillToDoneAction = () => {
    for (let item of items) {
      if (!item.aid) {
        ElasticSearchService.killToDone(Number(item.did))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
            },
            error => setErrorMessage(error)
          );
      } else if (!item.tid) {
        ElasticSearchService.killToDone(Number(item.did), Number(item.aid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
            },
            error => setErrorMessage(error)
          );
      } else if (item.tid) {
        ElasticSearchService.killToDone(Number(item.did), Number(item.aid), Number(item.tid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "killing...", time: new moment(), substatus: "killing..." });
            },
            error => setErrorMessage(error)
          );
      }
    }
  }

  const sendRequeueRequest = (listOfHosts, isexclusive) => {
    for (let item of items) {
      if (!item.aid) {
        ElasticSearchService.requeueLocal(listOfHosts, isexclusive, Number(item.did))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
            },
            error => setErrorMessage(error)
          );
      } else if (!item.tid) {
        ElasticSearchService.requeueLocal(listOfHosts, isexclusive, Number(item.did), Number(item.aid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
            },
            error => setErrorMessage(error)
          );
      } else if (item.tid) {
        ElasticSearchService.requeueLocal(listOfHosts, isexclusive, Number(item.did), Number(item.aid), Number(item.tid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..." });
            },
            error => setErrorMessage(error)
          );
      }
    }
  }

  const requeueLocally = () => {
    let confirmModalObj = {}
    let val = requeueLocallyAction
    confirmModalObj.modalTitle = 'Requeue locally on which machine(s)?';
    confirmModalObj.confirmBtn = 'Requeue';
    confirmModalObj.exclusiveMsg = 'Run only on these hosts. Do not spill to the farm';

    codaModal.showRequeueLocally(ElasticSearchService.hosts, confirmModalObj, () => sendRequeueRequest(codaModal.selectedHosts, codaModal.local_exclusive));
  }

  const killShortcut = () => {
    let confirmModalObj = {}
    confirmModalObj.modalTitle = "Kill all jobs?";
    confirmModalObj.modalBody = 'Do you want to kill all jobs from: \n"' + selectedItem.title + '"\n(Job ID: ' + getItemId(items[0]) + ')';
    if (items.length > 1) {
      confirmModalObj.modalTitle = "Kill selected jobs?";
      confirmModalObj.modalBody = "Do you want to kill all jobs from " + items.length + " selected items?";
    }

    codaModal.showKillOptions(confirmModalObj, () => doKillAction(), () => doKillToDoneAction());
  }

  const breakDependencies = () => {
    for (let item of items) {
      if (!item.aid) {
        ElasticSearchService.breakDgraphDependencies(Number(item.did))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..." });
            },
            error => setErrorMessage(error)
          );
      } else if (!item.tid) {
        ElasticSearchService.breakArrayDependencies(Number(item.did), Number(item.aid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..." });
            },
            error => setErrorMessage(error)
          );
      } else if (item.tid) {
        ElasticSearchService.breakTaskDependencies(Number(item.did), Number(item.aid), Number(item.tid))
          .subscribe(
            title => {
              // actionSuccess.emit({ itemId: getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..." });
            },
            error => setErrorMessage(error)
          );
      }
    }
  }

  // Start the playback action.
  const playImages = () => {
    console.log("[DEBUG] In playImages()")

    // Early out if there are no selected items.
    if (items) {
      codaModal.showLoad();
    } else {
      return;
    }

    let subscription;

    // Build a string list of selected job ids, converting each data
    // structure into a string of "did.aid.tid", "did.aid" or "did".
    let idList = items.map(item => {
      if (item.tid) {
        return item.did + "." + item.aid + "." + item.tid
      } else if (item.aid) {
        return item.did + "." + item.aid
      } else {
        return item.did
      }
    });
    console.log("[DEBUG] - items=" + idList.join(","))

    // Create an Observable for the service call to fetch the rvspec for the
    let rvSpec;
    // subscription = new Observable < string > (observer => {
    //   ElasticSearchService.getRVSpec(idList)
    //     .then(
    //       rvSpec => { observer.next(rvSpec.rvSpec); observer.complete(); },
    //       error => {
    //         console.log("[ERROR] (1) Problem getting rvspec: " + error)
    //         observer.complete();
    //       }
    //     );
    // }).subscribe(
    //   data => rvSpec = data,
    //   error => console.log("[ERROR] (2) Problem getting rvspec: " + error.toString()),
    //   () => playImagesCallBack(rvSpec)
    // );

    // Cancel the playback if requested.
    codaModal.cancelCallback = function () {
      if (subscription) {
        console.log("Canceling loading imagePaths and RV callback.");
        subscription.unsubscribe();
      }
    };
  }


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
            if (statuses.includes(0) || statuses.includes(1) || statuses.includes(7) || statuses.includes(5) || statuses.includes(6)) {
              unfinishedJobs.push(item);
            }
          }
        }
        if (unfinishedJobs.length > 0) {
          let errorModalObj = {}
          errorModalObj.modalTitle = "Can't hide unfinished jobs"
          errorModalObj.modalBody = "The following jobs you have selected are unfinished:\n" + unfinishedJobs.map((item) => { return getItemId(item) }).join(', ');
          errorModalObj.modalBodyDetails = "Please kill job or wait for it to finish before hiding."
          codaModal.showError(errorModalObj, null);
        } else {
          for (let item of items) {
            if (!item.aid) {
              ElasticSearchService.setDgraphMeta(Number(getItemId(item)), "clienthide", code)
                .subscribe(
                  title => {
                    // actionSuccess.emit("Job successfully hidden.");
                    // hideActionSuccess.emit({ itemId: getItemId(item), visibilityCode: code, time: new moment() });
                  },
                  error => setErrorMessage(error)
                );
            }
          }
        }
      } else {
        for (let item of items) {
          if (!item.aid) {
            ElasticSearchService.setDgraphMeta(Number(getItemId(item)), "clienthide", code)
              .subscribe(
                title => {
                  // actionSuccess.emit("Job successfully unhidden.");
                  // unhideActionSuccess.emit({ itemId: getItemId(item), visibilityCode: code, time: new moment() });
                },
                error => setErrorMessage(error)
              );
          }
        }
      }
    }

  }


  const playImagesCallBack = (rvSpec) => {
    console.log("[DEBUG] In playImagesCallBack()")

    // No image paths (array is empty or length is 0 or
    // only object in array is empty; last one happens when individual tasks
    // are selected and have no imagePaths)
    if (typeof rvSpec == "undefined") {

      let dialogModalObj = {}
      dialogModalObj.modalTitle = "Playback Error";
      dialogModalObj.modalBody = "No images found.";
      dialogModalObj.modalBodyDetails = "The selection does not contain any playable images.";

      //codaModal.showDialog(dialogModalObj);
      codaModal.showError(dialogModalObj, null);
      console.log("[WARN  503.1] Error fetching rvspec: " + rvSpec);
      return;
    }

    // Finally, if we got here, start the playback by opening the rvlink
    // url.
    // rvLinkURL = ElasticSearchService.constructPlaybackUrl(rvSpec);
    // if (rvLinkURL.length > 0) {
    //   location.href = rvLinkURL;
    // }
    codaModal.hideLoad();
  }

  return (
    <div ref={contextRef} className='contextMenu dgraph-menu-container' style={{ display: `${contextData.visible ? 'block' : 'none'}`, left: contextData.posX, top: contextData.posY }}>
      <div className={`optionsList ${classes?.listWrapper}`}>
        {
          links && links.length > 0 && links.map((link) => {
            return (
              <div className="dgraph-menu">
                {
                  link?.horizontalBefore && <div><hr /></div>
                }
                {
                  !link?.sublinks && (
                    <div className={classNames("link", link?.disabled ? "disabled" : "")} onClick={!link?.disabled ? null : null}>
                      {link?.icon &&
                        <span className={"glyphicon glyphicon-" + link?.icon}></span>
                      }
                      {
                        !link?.icon && <span className="no-icon"></span>
                      }
                      {link?.title}
                      {
                        link?.altText && <small className="pull-right">{link?.altText}</small>
                      }
                    </div>)
                }
                {
                  link?.sublinks && <div className={classNames("link has-sublinks", link?.disabled ? "disabled" : "")}>
                    {
                      link?.icon && <span className={'glyphicon glyphicon-' + link?.icon}></span>
                    }
                    {
                      !link?.icon && <span className="no-icon"></span>
                    }
                    {link?.title}
                    <div className="menu-sublinks pull-right">
                      {link?.sublinks.map((sublink) => {
                        return (
                          <span>{sublink?.title}</span>
                        )
                      })}

                    </div>
                  </div>
                }
              </div>
            )
          })
        }
      </div>
    </div>
  )
}
