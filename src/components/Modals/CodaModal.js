import classNames from "classnames"

export default function CodaModal() {
  @Input() modalId: string;
  modalObj = null;
  thresholdShow_msec = 600; /*Wait this many millisecs before allowing callback to close modal */
  cancelCallback: Function;
  confirmCallback: Function;
  confirmObj;
  loadingObj: any = {}
  errorObj;
  modal_type = ModalType.Loading;
  modalType = ModalType; //so the template could access it
  loading = false;
  hosts: any = [];
  selectedHosts: any = [];
  local_exclusive = false;

  kill: Function;
  killToDone: Function;

  const ngAfterViewInit = () => {
    modalObj = $("#" + modalId);
    //modalObj.on('show.bs.modal', (e) => { });
    //modalObj.on('hidden.bs.modal', (e) => {});
    //showConfirm("Kill", () => { alert('hello')});
  }

  const doCancel = () => {
    cancelCallback && cancelCallback();
  }

  const doConfirm = () => {
    confirmCallback && confirmCallback();
  }

  const doKill = () => {
    kill && kill();
  }

  const doKillToDone = () => {
    killToDone && killToDone();
  }

  const showLoad = () => {
    loading = true;
    modal_type = ModalType.Loading;
    modalObj.modal('show');
    modalObj._lastShow = Date.now();
    clearTimeout(modalObj._hideTimeout);
  }

  const showConfirm = (confirmObj, confirmCallback) => {
    confirmObj = confirmObj;
    confirmCallback = confirmCallback;
    modal_type = ModalType.Confirm;
    modalObj.modal('show');
  }

  const showError = (errorObj, callback) => {
    errorObj = errorObj;
    modal_type = ModalType.Error;
    confirmCallback = callback;
    modalObj.modal('show');
  }

  const refreshOptions = (hostname) => {
    for (let hostIndex in hosts) {
      if (hosts[hostIndex].hostname != hostname) {
        continue;
      }

      //manages the selected hosts
      if (!hosts[hostIndex].value) {
        selectedHosts.push(hostname);
      } else {
        for (let selectedIndex in selectedHosts) {
          if (selectedHosts[selectedIndex] == hostname) {
            selectedHosts.splice(selectedIndex, 1);
          }
        }
      }
    }

  }

  const showKillOptions = (confirmObj, killFunction, killToDoneFunction) => {
    confirmObj = confirmObj;
    kill = killFunction;
    killToDone = killToDoneFunction;
    modal_type = ModalType.KillOptions;
    modalObj.modal('show');
  }

  const showRequeueLocally = (hostsObj, confirmObj, confirmCallback) => {
    confirmObj = confirmObj;
    modal_type = ModalType.RequeueLocally;
    confirmCallback = confirmCallback;
    hosts = []
    selectedHosts = []
    local_exclusive = false
    //assigns a value for each hostname
    for (let hostIndex in hostsObj) {
      let hostname = { hostname: hostsObj[hostIndex], value: false }
      hosts.push(hostname)
    }

    //handles special cases (if there are no machines found or there is only one machine found)
    if (hosts.length == 0) {
      confirmObj.modalTitle = "No machines available to requeue locally";
    } else if (hosts.length == 1) {
      selectedHosts.push(hosts[0].hostname);
      confirmObj.modalTitle = "Requeue locally on " + hosts[0].hostname + "?";
      confirmObj.confirmBtn = "Confirm";
      confirmObj.exclusiveMsg = "Run only on this host. Do not spill to the farm";
    }

    modalObj.modal('show');
  }

  const showDialog = (infoObj) => {
    modal_type = ModalType.Loading;
    loadingObj = infoObj;

    // Leave the previous text up for a minimum time, then switch to info text
    let timeDiff = Date.now() - modalObj._lastShow;
    if (timeDiff > thresholdShow_msec) {
      loading = false;
      modalObj.modal('show');
    } else {
      var myThis = this;
      setTimeout(function () {
        let diff = mythresholdShow_msec - timeDiff;
        myloading = false;
        mymodalObj.modal('show');
      }, (thresholdShow_msec - timeDiff));
    }

    // Schedule hide to be 2*threshold after max delay of previous text above
    modalObj._hideTimeout = setTimeout(
      () => modalObj.modal('hide'), (3 * thresholdShow_msec)
    );
  }

  const hideLoad = () => {
    /*
      Prevent it from hiding too quickly (depending on callback) after showing.
      It has to be shown for at least thresholdShow_msec before getting hidden
    */
    let timeDiff = Date.now() - modalObj._lastShow;
    if (timeDiff > thresholdShow_msec) {
      modalObj.modal('hide');
    } else {
      modalObj._hideTimeout = setTimeout(
        () => modalObj.modal('hide'), (thresholdShow_msec - timeDiff)
      );
    }
  }

  return (
    <div className={classNames("modal fade", modalType[modal_type])} id={modalId} role="dialog" data-backdrop='static'>
      <div className={classNames("modal-dialog modal-sm", modal_type != modalType.Loading ? "confirm-dialog" : "")}>
        // Modal content
        {modal_type == modalType.Loading && <div className="modal-content">
          // <div className="modal-header"></div>
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
        {modal_type == modalType.Confirm && <div className="modal-content">
          <div className="modal-header">
            <span className="glyphicon glyphicon-question-sign"></span> {confirmObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal"></span>
          </div>
          <div className="modal-body">{confirmObj.modalBody}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doConfirm()}> {confirmObj.confirmBtn} </button>
          </div>
        </div>}
        {modal_type == modalType.Error && <div className="modal-content error-modal">
          <div className="modal-header">
            <span className="glyphicon glyphicon-remove-sign"></span> {errorObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal"></span>
          </div>
          <div className="modal-body">{errorObj.modalBody}<br />{errorObj.modalBodyDetails}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={() => doConfirm()}>Ok</button>
          </div>
        </div>}

        {modal_type == modalType.KillOptions && <div className="modal-content">
          <div className="modal-header">
            <span className="glyphicon glyphicon-question-sign"></span> {confirmObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal"></span>
          </div>
          <div className="modal-body">{confirmObj.modalBody}</div>
          <div className="modal-footer">
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doKill()}> Yes </button>
            <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doKillToDone()}> Kill to Done </button>
            <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
          </div>
        </div>}

        {modal_type == modalType.RequeueLocally && <div className="modal-content">
          <div className="modal-header">
            {hosts.length > 0 && <span className="glyphicon glyphicon-question-sign"></span>}
            {confirmObj.modalTitle}
            <span className="close-modal-btn glyphicon glyphicon-remove" data-dismiss="modal" ></span>
          </div>

          {hosts.length > 1 && <div className="form-horizontal">
            <div className="category-body">
              <div className="modal-row">
                {
                  hosts.map(() => {
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
                      onChange={() => { local_exclusive = !local_exclusive }} />
                    {confirmObj.exclusiveMsg}
                  </label>
                </div>
              </div>
            </div>
            {hosts.length > 0 && <div className="modal-footer">
              <button type="button" className="btn btn-primary" data-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => doConfirm()}> {confirmObj.confirmBtn} </button>
            </div>}
          </div>}
        </div>}
      </div>
    </div>
  )
}