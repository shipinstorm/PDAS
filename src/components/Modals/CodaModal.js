import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import classNames from "classnames"
import { ModalType } from "../../types/ModalType";
import { modalUpdateCallBack, modalConfirmObj, modalLocalExclusive, modalSelectedHosts, modalUpdateFlag } from "../../store/actions/modalAction";

// Wait this many milliseconds before allowing callback to close modal
const thresholdShow_msec = 600;

export default function CodaModal() {
  const dispatch = useDispatch();

  // Modal Variables from Redux State
  const modalFlag = useSelector((state) => state.modal.modalFlag);
  const modalType = useSelector((state) => state.modal.modalType);
  const confirmObj = useSelector((state) => state.modal.confirmObj);
  const hostsObj = useSelector((state) => state.modal.hostsObj);
  const local_exclusive = useSelector((state) => state.modal.localExclusive);
  const selectedHosts = useSelector((state) => state.modal.selectedHosts);

  const [loadingObj, setLoadingObj] = useState({});
  const [errorObj, setErrorObj] = useState(null);
  const [modal_type, setModalType] = useState(ModalType.Loading);
  const [loading, setLoading] = useState(false);
  const [hosts, setHosts] = useState([]);
  const [show, setShow] = useState(false);
  const [lastShow, setLastShow] = useState(Date.now());
  const [hideTimeout, setHideTimeout] = useState();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const doCancel = () => {
    dispatch(modalUpdateFlag(0));
    dispatch(modalUpdateCallBack(4));
  }

  const doConfirm = () => {
    dispatch(modalUpdateFlag(0));
    dispatch(modalUpdateCallBack(1));
  }

  const doKill = () => {
    dispatch(modalUpdateFlag(0));
    dispatch(modalUpdateCallBack(2));
  }

  const doKillToDone = () => {
    dispatch(modalUpdateFlag(0));
    dispatch(modalUpdateCallBack(3));
  }

  useEffect(() => {
    if (modalFlag === 0) {
      handleClose();
    } else if (modalFlag === 1) {
      if (modalType === ModalType.Confirm) {
        setModalType(ModalType.Confirm);
        handleShow();
      } else if (modalType === ModalType.Error) {
        setErrorObj(errorObj);
        setModalType(ModalType.Error);
        handleShow();
      } else if (modalType === ModalType.KillOptions) {
        setModalType(ModalType.KillOptions);
        handleShow();
      } else if (modalType === ModalType.RequeueLocally) {
        setModalType(ModalType.RequeueLocally);
        setHosts([]);
        let tmpSelectedHosts = [];
        dispatch(modalLocalExclusive(false));
        // assigns a value for each hostname
        for (let hostIndex in hostsObj) {
          let hostname = { hostname: hostsObj[hostIndex], value: false }
          setHosts([...hosts, hostname]);
        }

        let tmpConfirmObj = {};
        // handles special cases (if there are no machines found or there is only one machine found)
        if (hosts.length === 0) {
          tmpConfirmObj.modalTitle = "No machines available to requeue locally";
        } else if (hosts.length === 1) {
          tmpSelectedHosts.push(hosts[0].hostname);
          tmpConfirmObj.modalTitle = "Requeue locally on " + hosts[0].hostname + "?";
          tmpConfirmObj.confirmBtn = "Confirm";
          tmpConfirmObj.exclusiveMsg = "Run only on this host. Do not spill to the farm";
        }
        dispatch(modalConfirmObj(tmpConfirmObj));
        dispatch(modalSelectedHosts(tmpSelectedHosts));

        handleShow();
      }
    } else if (modalFlag === 2) {
      setModalType(ModalType.Loading);
      setLoadingObj(confirmObj);

      // Leave the previous text up for a minimum time, then switch to info text
      let timeDiff = Date.now() - lastShow;
      if (timeDiff > thresholdShow_msec) {
        setLoading(false);
        handleShow();
      } else {
        setTimeout(function () {
          // let diff = thresholdShow_msec - timeDiff;
          setLoading(false);
          handleShow();
        }, (thresholdShow_msec - timeDiff));
      }

      // Schedule hide to be 2*threshold after max delay of previous text above
      setHideTimeout(setTimeout(
        () => handleClose(), (3 * thresholdShow_msec)
      ));
    } else if (modalFlag === 3) {
      /**
       * Prevent it from hiding too quickly (depending on callback) after showing.
       * It has to be shown for at least thresholdShow_msec before getting hidden
       */
      let timeDiff = Date.now() - lastShow;
      if (timeDiff > thresholdShow_msec) {
        handleClose();
      } else {
        setHideTimeout(setTimeout(
          () => handleClose, (thresholdShow_msec - timeDiff)
        ));
      }
    } else if (modalFlag === 4) {
      setLoading(true);
      setModalType(ModalType.Loading);
      handleShow();
      setLastShow(Date.now());
      clearTimeout(hideTimeout);
    }
  }, [modalFlag])

  const refreshOptions = (hostname) => {
    for (let hostIndex in hosts) {
      if (hosts[hostIndex].hostname !== hostname) {
        continue;
      }

      let tmpSelectedHosts = selectedHosts;
      // manages the selected hosts
      if (!hosts[hostIndex].value) {
        tmpSelectedHosts.push(hostname);
      } else {
        for (let selectedIndex in tmpSelectedHosts) {
          if (tmpSelectedHosts[selectedIndex] === hostname) {
            tmpSelectedHosts.splice(selectedIndex, 1);
          }
        }
      }
      dispatch(modalSelectedHosts(tmpSelectedHosts));
    }

  }

  return (
    <div className={classNames("modal", show ? "show" : "fade")} tabindex="-1" role="dialog" aria-hidden="true">
      <div className={classNames("modal-dialog modal-sm", modal_type !== ModalType.Loading ? "confirm-dialog" : "")}>
        {/* Modal content */}
        {modal_type === ModalType.Loading && <div className="modal-content">
          {/* <div className="modal-header"></div> */}
          <div className="modal-body">
            <div className="loading-div">
              <div className="modal-loading-msg">
                {
                  loading && <div>
                    Loading
                    <div className="load-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </div>
                    Please wait.
                    <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doCancel()}>Cancel</button>
                  </div>}
                {!loading && <div>
                  {loadingObj.modalBody}
                  <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doCancel()}>Cancel</button>
                </div>}
              </div>
            </div>
          </div>
        </div>}
        {modal_type === ModalType.Confirm && <div className="modal-content">
          <div className="modal-header">
            <span className="glyphicon glyphicon-question-sign"></span> {confirmObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal"></span>
          </div>
          <div className="modal-body">{confirmObj.modalBody}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => doCancel()}>Cancel</button>
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doConfirm()}> {confirmObj.confirmBtn} </button>
          </div>
        </div>}
        {modal_type === ModalType.Error && <div className="modal-content error-modal">
          <div className="modal-header">
            <span className="glyphicon glyphicon-remove-sign"></span> {errorObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal"></span>
          </div>
          <div className="modal-body">{errorObj.modalBody}<br />{errorObj.modalBodyDetails}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => doConfirm()}>Ok</button>
          </div>
        </div>}

        {modal_type === ModalType.KillOptions && <div className="modal-content">
          <div className="modal-header">
            <span className="glyphicon glyphicon-question-sign"></span> {confirmObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal"></span>
          </div>
          <div className="modal-body">{confirmObj.modalBody}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doKill()}> Yes </button>
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doKillToDone()}> Kill to Done </button>
            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => doCancel()}>Cancel</button>
          </div>
        </div>}

        {modal_type === ModalType.RequeueLocally && <div className="modal-content">
          <div className="modal-header">
            {hosts.length > 0 && <span className="glyphicon glyphicon-question-sign"></span>}
            {confirmObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal" ></span>
          </div>

          {hosts.length > 1 && <div className="form-horizontal">
            <div className="category-body">
              <div className="modal-row">
                {
                  hosts.map((host) => {
                    return (
                      <div className="checkbox-inline col-xs-4">
                        <label><input type="checkbox" id="host.hostname" onClick={() => refreshOptions(host.hostname)} />{host.hostname}</label>
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>}
          {hosts.length > 0 && <div className="form-horizontal">
            <div className="category-body">
              <div className="modal-row">
                <div><hr /></div>
                <div className="checkbox-inline col-xs-4">
                  <label title="Checked: Jobs will only run on the selected hosts above
  Unchecked: Jobs will spill over to the renderfarm in addition to these hosts">
                    <input type="checkbox" title="Checked: Jobs will only run on the selected hosts above
  Unchecked: Jobs will spill over to the renderfarm in addition to these hosts"
                      id="local_exclusive" checked={local_exclusive}
                      onChange={() => dispatch(modalLocalExclusive(!local_exclusive))} />
                    {confirmObj.exclusiveMsg}
                  </label>
                </div>
              </div>
            </div>
            {hosts.length > 0 && <div className="modal-footer">
              <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => doCancel()}>Cancel</button>
              <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doConfirm()}> {confirmObj.confirmBtn} </button>
            </div>}
          </div>}
        </div>}
      </div>
    </div>
  )
}