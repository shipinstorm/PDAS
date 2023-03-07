import {Component, Input, NgModule, EventEmitter, Output, SimpleChanges, Renderer} from '@angular/core';
import {Subject, Observable} from 'rxjs/Rx';
import {Dgraph, Array, Task, DgraphService, ImagePath, ImageDir} from './dgraph.service';
import {DgraphListComponent} from './dgraph-list.component';
import {ActionMenuHolderComponent} from '../action-menu/action-menu-holder.component';
import {CodaModalComponent} from '../modals/coda-modal.component';
import CodaGlobals = require('../codaGlobals');
declare var moment: any;

@Component({
    selector:'dgraph-action-menu',
    template:``
})

@NgModule({
})

export default function DgraphActionMenuComponent() {
    @Input() items: any[];    // items is selectedItems
    @Input() codaModal: CodaModalComponent;
    @Input() selectedItem: any;
    @Output() openDetails = new EventEmitter();
    @Output() openError = new EventEmitter();
    @Output() toggleDetails = new EventEmitter();
    @Output() actionSuccess = new EventEmitter();
    @Output() hideActionSuccess = new EventEmitter();
    @Output() unhideActionSuccess = new EventEmitter();
    rightClickAction: string;
    links: any;
    title: any;
    errorMessage: any;
    requeueAction;
    requeueAllAction;
    requeueRunAction;
    requeueExitAction;
    requeueLocallyAction;
    killAction;
    killToDoneAction;
    breakDependenciesAction;
    viewDetails;
    viewLog;
    playImagesAction;
    copyInfoAction;
    imagePath: string;
    excludeConfirmLists: string[];
    setJobVisibility;
    hosts: {};
    rvLinkURL: string;

    constructor(private _dgraphService: DgraphService, renderer: Renderer){
        renderer.listenGlobal('document', 'keydown', (event) => {
            if(event.ctrlKey && event.shiftKey && event.keyCode === 72 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
                event.preventDefault();
                this.setVisibility(this.selectedItem);
            }

            if(event.ctrlKey && event.shiftKey && event.keyCode === 75 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
                event.preventDefault();
                this.killShortcut();
            }

            if(event.ctrlKey && event.shiftKey && event.keyCode === 76 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
                event.preventDefault();
                this.openError.emit();
            }

            if(event.ctrlKey && event.shiftKey && event.keyCode === 86 && document.activeElement != document.getElementById('search') && event.target.type != "textarea") {
                event.preventDefault();
                this.toggleDetails.emit();
            }


        });
        this.killAction = {name:'Kill', horizontalBefore: false, subject:new Subject(), icon: 'ban-circle', altText: 'Ctrl+Shift+K'};
        this.killToDoneAction = {name:'Kill & Mark as Done', horizontalBefore: false, subject:new Subject()};
        this.copyInfoAction = {name:'Copy Job ID to Clipboard', title: 'Copy Job ID to Clipboard', horizontalBefore: true, subject:new Subject(), icon: 'copy'};
        this.requeueAllAction = {name: 'Requeue All', horizontalBefore: false, subject:new Subject()}
        this.requeueRunAction = {name:'Requeue Running', horizontalBefore: false, subject:new Subject()};
        this.requeueExitAction = {name:'Requeue Exited', horizontalBefore: false, subject:new Subject()};
        this.requeueAction = {name:'Requeue', horizontalBefore: true, icon: 'retweet', subject: new Subject(), sublinks:[this.requeueAllAction, this.requeueRunAction, this.requeueExitAction]};
        this.requeueLocallyAction = {name:'Requeue Locally', horizontalBefore: false, subject:new Subject()};
        this.breakDependenciesAction = {name:'Break Dependencies', title: 'Break Dependencies', horizontalBefore: true, icon: 'scissors', subject: new Subject()};
        this.playImagesAction = {name:'Play Image Sequence', title: 'Play Image Sequence', horizontalBefore: true, subject:new Subject(), icon: 'play', altText: 'Space'};
        this.viewDetails = {name:'View Job Details', title: 'View Job Details', horizontalBefore: true, subject:new Subject(), icon: 'info-sign', altText:'Ctrl+Shift+V'};
        this.viewLog = {name:'View Log', title: 'View Log', horizontalBefore: false, subject:new Subject(), icon: 'file', altText:'Ctrl+Shift+L'};
        this.setJobVisibility = {name:'Set Job Visibility', horizontalBefore: true, subject:new Subject(), altText: 'Ctrl+Shift+H'};
        this.links = [this.killAction, this.killToDoneAction, this.copyInfoAction, this.requeueAction, this.requeueLocallyAction, this.breakDependenciesAction, this.playImagesAction, this.viewDetails, this.viewLog, this.setJobVisibility];
        this.excludeConfirmLists = [this.copyInfoAction, this.playImagesAction, this.viewDetails, this.viewLog, this.setJobVisibility, this.requeueLocallyAction];
    }

    ngOnInit(){
        this.links.forEach(link => {
            if (link.subject){
                link.subject.subscribe(val => this.rightClickCallback(val))
            }
          if (link.sublinks){
            link.sublinks.forEach(sublink => {
                if (sublink.subject){
                    sublink.subject.subscribe(val => this.rightClickCallback(val))
                }
            });
          }
      });

        if (this._dgraphService.user['username']){
            this._dgraphService.populateHostList();
        }

    }

    ngOnChanges(changes){
        if ((changes.items && this.items) || (changes.selectedItem && this.selectedItem)) {
            // If we're accessing externally, diable the playImagesAction
            // If we're accesssing internally, re-enable the playImagesAction
            this.playImagesAction.disabled = CodaGlobals.external_ip;
            if (this.items.length == 1 && this.selectedItem){
                this.killAction.title = 'Kill '+this.getItemId(this.items[0]);

                this.killToDoneAction.title = 'Kill '+this.getItemId(this.items[0])+' & Mark as Done';

                if (this.items[0].tid){
                    this.requeueAction.title = 'Requeue '+this.getItemId(this.items[0]);
                    this.requeueAction.sublinks = null;
                } else {
                    this.requeueAllAction.title = 'All';

                    this.requeueRunAction.title = 'Running';

                    this.requeueExitAction.title = 'Exited';

                    this.requeueAction.title = 'Requeue';
                    this.requeueAction.sublinks = [this.requeueAllAction, this.requeueRunAction, this.requeueExitAction];

                    this.requeueLocallyAction.title = 'Requeue Locally';

                }
                this.copyInfoAction.disabled = false;
                this.viewDetails.disabled = false;
                // Only show the log item for tasks
                if (this.items[0].tid){
                    this.viewLog.disabled = false;
                } else {
                    this.viewLog.disabled = true;
                }

                this.requeueLocallyAction.title = 'Requeue '+this.getItemId(this.items[0])+' Locally';

                //only show Hide menu item if selected item is a dgraph
                if (!this.items[0].aid){
                    if (this.links.indexOf(this.setJobVisibility) < 0) {
                        this.links.push(this.setJobVisibility);
                    }
                    if(this.selectedItem.clienthide == 1) {
                        this.setJobVisibility.title = 'Unhide '+this.getItemId(this.items[0]);
                        this.setJobVisibility.icon = 'eye-open';
                    }
                    else {
                        this.setJobVisibility.title = 'Hide '+this.getItemId(this.items[0]);
                        this.setJobVisibility.icon = 'eye-close';
                    }
                } else {
                    let i  = this.links.indexOf(this.setJobVisibility)
                    if (i > -1) {
                        this.links.splice(i, 1)
                    }
                }


            } else {
                this.killAction.title = 'Kill';

                this.killToDoneAction.title = 'Kill & Mark as Done';

                this.requeueAllAction.title = 'All';

                this.requeueRunAction.title = 'Running';

                this.requeueExitAction.title = 'Exited';

                this.requeueAction.title = 'Requeue';
                this.requeueAction.sublinks = [this.requeueAllAction, this.requeueRunAction, this.requeueExitAction];

                this.requeueLocallyAction.title = 'Requeue Locally';

                this.copyInfoAction.disabled = true;
                this.viewDetails.disabled = true;
                this.viewLog.disabled = true;

                //only show Hide menu item if there is a dgraph selected
                if (this.items.filter(item => {return !item.aid}).length > 0) {
                    if (this.links.indexOf(this.setJobVisibility) < 0) {
                        this.links.push(this.setJobVisibility);
                    }

                    if(this.selectedItem && this.selectedItem.clienthide == 1) {
                        this.setJobVisibility.title = 'Unhide selected dgraphs';
                        this.setJobVisibility.icon = 'eye-open';
                    }
                    else {
                        this.setJobVisibility.title = 'Hide selected dgraphs';
                        this.setJobVisibility.icon = 'eye-close';
                    }
                } else {
                    let i  = this.links.indexOf(this.setJobVisibility)
                    if (i > -1) {
                        this.links.splice(i, 1)
                    }
                }

            }

        }
    }

    const getItemId = (item) => {
      let itemId = item.did;
      itemId += item.aid ? '.'+item.aid : "";
      itemId += item.tid ? '.'+item.tid : "";
      return itemId;
    }

    rightClickCallback(val){
      if(this.excludeConfirmLists.indexOf(val) > -1 || (this.items.length == 1 && this.items[0].tid)) {
          //call it without the confirm if it's in the exclude list
          this.rightClickCallbackMain(val);
        } else {
          let confirmModalObj: any = {}
          if (this.items.length == 1 && this.selectedItem){
              switch(val) {
                  case this.killAction:
                    confirmModalObj.modalTitle = 'Kill all jobs?';
                    confirmModalObj.modalBody = 'Do you want to kill all jobs from: \n"'+this.selectedItem.title+'"\n(Job ID: '+this.getItemId(this.items[0])+')';
                    confirmModalObj.confirmBtn = 'Kill All';
                    break;
                  case this.killToDoneAction:
                    confirmModalObj.modalTitle = 'Kill all jobs & Mark as Done?';
                    confirmModalObj.modalBody = 'Do you want to kill all jobs and mark them as done from: \n"'+this.selectedItem.title+'"\n(Job ID: '+this.getItemId(this.items[0])+')';
                    confirmModalObj.confirmBtn = 'Kill All & Mark Done';
                    break;
                  case this.requeueAllAction:
                    confirmModalObj.modalTitle = 'Requeue all jobs?';
                    confirmModalObj.modalBody = 'Do you want to requeue all jobs from: \n"'+this.selectedItem.title+'"\n(Job ID: '+this.getItemId(this.items[0])+')';
                    confirmModalObj.confirmBtn = 'Requeue All';
                    break;
                  case this.requeueRunAction:
                    confirmModalObj.modalTitle = 'Requeue running jobs?';
                    confirmModalObj.modalBody = 'Do you want to requeue all running jobs from: \n"'+this.selectedItem.title+'"\n(Job ID: '+this.getItemId(this.items[0])+')';
                    confirmModalObj.confirmBtn = 'Requeue Running';
                    break;
                  case this.requeueExitAction:
                    confirmModalObj.modalTitle = 'Requeue exited jobs?';
                    confirmModalObj.modalBody = 'Do you want to requeue all exited jobs from: \n"'+this.selectedItem.title+'"\n(Job ID: '+this.getItemId(this.items[0])+')';
                    confirmModalObj.confirmBtn = 'Requeue Exited';
                    break;
                  case this.breakDependenciesAction:
                    confirmModalObj.modalTitle = "Break Dependencies?";
                    confirmModalObj.modalBody = "Break dependencies for "+this.getItemId(this.items[0])+"?";
                    confirmModalObj.confirmBtn = 'Break';
                    break;
                }
          } else {
              switch(val) {
                  case this.killAction:
                    confirmModalObj.modalTitle = 'Kill selected jobs?';
                    confirmModalObj.modalBody = "Do you want to kill all jobs from "+this.items.length+" selected items?";
                    confirmModalObj.confirmBtn = "Kill "+this.items.length+" item";
                    break;
                  case this.killToDoneAction:
                    confirmModalObj.modalTitle = 'Kill selected jobs & Mark as Done?';
                    confirmModalObj.modalBody = "Do you want to kill all jobs from "+this.items.length+" selected items and mark them as done?";
                    confirmModalObj.confirmBtn = 'Kill All & Mark Done';
                    break;
                  case this.requeueAllAction:
                    confirmModalObj.modalTitle = 'Requeue selected jobs?';
                    confirmModalObj.modalBody = "Do you want to requeue all jobs from "+this.items.length+" selected items?";
                    confirmModalObj.confirmBtn = "Requeue "+this.items.length+" items";
                    break;
                  case this.requeueRunAction:
                    confirmModalObj.modalTitle = 'Requeue running from selected jobs?';
                    confirmModalObj.modalBody = "Do you want to requeue all running jobs from "+this.items.length+" selected items?";
                    confirmModalObj.confirmBtn = "Requeue Running from "+this.items.length+" items";
                    break;
                  case this.requeueExitAction:
                    confirmModalObj.modalTitle = 'Requeue exited from selected jobs?';
                    confirmModalObj.modalBody = "Do you want to requeue all exited jobs from "+this.items.length+" selected items?";
                    confirmModalObj.confirmBtn = "Requeue Exited from "+this.items.length+" items";
                    break;
                  case this.breakDependenciesAction:
                    confirmModalObj.modalTitle = "Break Dependencies?";
                    confirmModalObj.modalBody = "Break dependencies for "+this.items.length+" selected items?"
                    confirmModalObj.confirmBtn = 'Break';
                }
          }
          this.codaModal.showConfirm(confirmModalObj, () => this.rightClickCallbackMain(val));
        }
    }

    rightClickCallbackMain(val: string){
        this.rightClickAction = val;

        switch (this.rightClickAction) {
            case this.requeueAction:
            case this.requeueAllAction:
                for (let item of this.items){
                    if (!item.aid){
                        this._dgraphService.requeueAll(Number(item.did))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    } else if (!item.tid){
                        this._dgraphService.requeueAll(Number(item.did), Number(item.aid))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    } else if (item.tid){
                        this._dgraphService.requeueAll(Number(item.did), Number(item.aid), Number(item.tid))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    }
                }
                break;
            case this.requeueRunAction:
                for (let item of this.items){
                    if (!item.aid){
                        this._dgraphService.requeueRun(Number(item.did))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    } else if (!item.tid){
                        this._dgraphService.requeueRun(Number(item.did), Number(item.aid))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    } else if (item.tid){
                        this._dgraphService.requeueRun(Number(item.did), Number(item.aid), Number(item.tid))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing running...", time: new moment(), runningOnly: true, substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    }
                }
                break;
            case this.requeueExitAction:
                for (let item of this.items){
                    if (!item.aid){
                        this._dgraphService.requeueExit(Number(item.did))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    } else if (!item.tid){
                        this._dgraphService.requeueExit(Number(item.did), Number(item.aid))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    } else if (item.tid){
                        this._dgraphService.requeueExit(Number(item.did), Number(item.aid), Number(item.tid))
                            .subscribe(
                                title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing exited...", time: new moment(), exitedOnly: true, substatus: "requeueing..."}); },
                                error => this.errorMessage = <any>error
                            );
                    }
                }
                break;
            case this.killAction:
                this.doKillAction();
                break;
            case this.killToDoneAction:
                this.doKillToDoneAction();
                break;
            case this.requeueLocallyAction:
                this.requeueLocally();
                break;
            case this.breakDependenciesAction:
                this.breakDependencies();
                break;
            case this.viewDetails:
                this.openDetails.emit();
                break;
            case this.viewLog:
                this.openError.emit();
                break;
            case this.setJobVisibility:
                this.setVisibility(this.selectedItem);
                break;
            case this.playImagesAction:
                this.playImages();
                break;
            case this.copyInfoAction:
                let jobIdTextArea = <HTMLTextAreaElement>document.createElement("textarea");
                jobIdTextArea.value = this.getItemId(this.items[0]);
                document.body.appendChild(jobIdTextArea);
                jobIdTextArea.select();
                try {
                    document.execCommand('copy');
                } catch (err) {
                    console.log('error copying job id: '+err);
                }
                document.body.removeChild(jobIdTextArea);
        }
    }

    const doKillAction = () => {
      for (let item of items){
        if (!item.aid){
          this._dgraphService.kill(Number(item.did))
              .subscribe(
                  title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "killing...", time: new moment(), substatus: "killing..."}); },
                  error => this.errorMessage = <any>error
              );
        } else if (!item.tid){
          this._dgraphService.kill(Number(item.did), Number(item.aid))
              .subscribe(
                  title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "killing...", time: new moment(), substatus: "killing..."}); },
                  error => this.errorMessage = <any>error
              );
        } else if (item.tid){
          this._dgraphService.kill(Number(item.did), Number(item.aid), Number(item.tid))
              .subscribe(
                  title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "killing...", time: new moment(), substatus: "killing..."}); },
                  error => this.errorMessage = <any>error
              );
        }
      }
    };

    doKillToDoneAction() {
        for (let item of this.items){
            if (!item.aid){
                this._dgraphService.killToDone(Number(item.did))
                    .subscribe(
                        title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "killing...", time: new moment(), substatus: "killing..."}); },
                        error => this.errorMessage = <any>error
                    );
            } else if (!item.tid){
                this._dgraphService.killToDone(Number(item.did), Number(item.aid))
                    .subscribe(
                        title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "killing...", time: new moment(), substatus: "killing..."}); },
                        error => this.errorMessage = <any>error
                    );
            } else if (item.tid){
                this._dgraphService.killToDone(Number(item.did), Number(item.aid), Number(item.tid))
                    .subscribe(
                        title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "killing...", time: new moment(), substatus: "killing..."}); },
                        error => this.errorMessage = <any>error
                    );
            }
        }
    }

    sendRequeueRequest(listOfHosts: any, isexclusive: boolean) {
        for(let item of this.items) {
            if (!item.aid){
                this._dgraphService.requeueLocal(listOfHosts, isexclusive, Number(item.did))
                .subscribe(
                    title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..."}); },
                    error => this.errorMessage = <any>error
                );
            } else if (!item.tid){
                this._dgraphService.requeueLocal(listOfHosts, isexclusive, Number(item.did), Number(item.aid))
                .subscribe(
                    title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..."}); },
                    error => this.errorMessage = <any>error
                );
            } else if (item.tid){
                this._dgraphService.requeueLocal(listOfHosts, isexclusive, Number(item.did), Number(item.aid), Number(item.tid))
                .subscribe(
                    title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "requeueing...", time: new moment(), substatus: "requeueing..."}); },
                    error => this.errorMessage = <any>error
                );
            }
        }
    }

    requeueLocally(id?: string) {
        let confirmModalObj: any = {}
        let val = this.requeueLocallyAction
        confirmModalObj.modalTitle = 'Requeue locally on which machine(s)?';
        confirmModalObj.confirmBtn = 'Requeue';
        confirmModalObj.exclusiveMsg = 'Run only on these hosts. Do not spill to the farm';

        this.codaModal.showRequeueLocally(this._dgraphService.hosts, confirmModalObj, () => this.sendRequeueRequest(this.codaModal.selectedHosts, this.codaModal.local_exclusive));
    }

    killShortcut() {
        let confirmModalObj: any = {}
        confirmModalObj.modalTitle = "Kill all jobs?";
        confirmModalObj.modalBody = 'Do you want to kill all jobs from: \n"'+this.selectedItem.title+'"\n(Job ID: '+this.getItemId(this.items[0])+')';
        if(this.items.length > 1) {
            confirmModalObj.modalTitle = "Kill selected jobs?";
            confirmModalObj.modalBody = "Do you want to kill all jobs from "+this.items.length+" selected items?";
        }

        this.codaModal.showKillOptions(confirmModalObj, () => this.doKillAction(), () => this.doKillToDoneAction());
    }

    breakDependencies() {
        for (let item of this.items) {
            if (!item.aid){
                this._dgraphService.breakDgraphDependencies(Number(item.did))
                .subscribe(
                    title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..."}); },
                    error => this.errorMessage = <any>error
                );
            } else if (!item.tid) {
                this._dgraphService.breakArrayDependencies(Number(item.did), Number(item.aid))
                .subscribe(
                    title => { this.actionSuccess.emit({itemId: this.getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..."}); },
                    error => this.errorMessage = <any>error
                );
            } else if (item.tid) {
                this._dgraphService.breakTaskDependencies(Number(item.did), Number(item.aid), Number(item.tid))
                .subscribe(
                    title => {  this.actionSuccess.emit({itemId: this.getItemId(item), status: "removing deps...", time: new moment(), substatus: "removing dependencies..."}); },
                    error => this.errorMessage = <any>error
                );
            }
        }
    }

    // Start the playback action.
    playImages() {
        console.log("[DEBUG] In playImages()")

        // Early out if there are no selected items.
        if (this.items) {
            this.codaModal.showLoad();
        } else {
            return;
        }

        let subscription;

        // Build a string list of selected job ids, converting each data
        // structure into a string of "did.aid.tid", "did.aid" or "did".
        let idList = this.items.map(item => {
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
        subscription = new Observable<string>(observer => {
            this._dgraphService.getRVSpec(idList)
                .then(
                    rvSpec => { observer.next(rvSpec.rvSpec); observer.complete(); },
                    error => {
                        console.log("[ERROR] (1) Problem getting rvspec: " + error)
                        observer.complete();
                    }
                );
        }).subscribe(
            data => rvSpec = data,
            error => console.log("[ERROR] (2) Problem getting rvspec: " + error.toString()),
            () => this.playImagesCallBack(rvSpec)
        );

        // Cancel the playback if requested.
        this.codaModal.cancelCallback = function() {
            if (subscription) {
                console.log("Canceling loading imagePaths and RV callback.");
                subscription.unsubscribe();
            }
        };
    }


    setVisibility(job: Dgraph) {
        if(job) {
            let code = "1";

            //sets visibility based on first job selected
            if(job.clienthide && job.clienthide == 1) {
               code = "0";
            }

            if (code == "1") {
                //check that all items are finished - we don't allow hiding of unfinished jobs
                let unfinishedJobs = [];
                for (let item of this.items){
                    if (!item.aid){
                        let statuses = item._dgraphstatus;
                        // 0=queued 1=run 7=depend 5=suspend 6=nostatus
                        if (statuses.includes(0) || statuses.includes(1) || statuses.includes(7) || statuses.includes(5) || statuses.includes(6)){
                            unfinishedJobs.push(item);
                        }
                    }
                }
                if (unfinishedJobs.length > 0){
                    let errorModalObj: any = {}
                    errorModalObj.modalTitle = "Can't hide unfinished jobs"
                    errorModalObj.modalBody = "The following jobs you have selected are unfinished:\n"+unfinishedJobs.map((item) => { return this.getItemId(item)}).join(', ');
                    errorModalObj.modalBodyDetails = "Please kill job or wait for it to finish before hiding."
                    this.codaModal.showError(errorModalObj, null);
                } else {
                    for(let item of this.items) {
                        if (!item.aid){
                            this._dgraphService.setDgraphMeta(Number(this.getItemId(item)), "clienthide", code)
                            .subscribe(
                                title => { this.actionSuccess.emit("Job successfully hidden.");
                                        this.hideActionSuccess.emit({itemId: this.getItemId(item), visibilityCode: code, time: new moment()});},
                                error => this.errorMessage = <any>error
                            );
                        }
                    }
                }
            } else {
                for(let item of this.items) {
                    if (!item.aid){
                        this._dgraphService.setDgraphMeta(Number(this.getItemId(item)), "clienthide", code)
                        .subscribe(
                            title => { this.actionSuccess.emit("Job successfully unhidden.");
                                    this.unhideActionSuccess.emit({itemId: this.getItemId(item), visibilityCode: code, time: new moment()});},
                            error => this.errorMessage = <any>error
                        );
                    }
                }
            }
        }

    }


    playImagesCallBack(rvSpec: string) {
        console.log("[DEBUG] In playImagesCallBack()")

        // No image paths (array is empty or length is 0 or
        // only object in array is empty; last one happens when individual tasks
        // are selected and have no imagePaths)
        if (typeof rvSpec == "undefined") {

            let dialogModalObj: any = {}
            dialogModalObj.modalTitle = "Playback Error";
            dialogModalObj.modalBody = "No images found.";
            dialogModalObj.modalBodyDetails = "The selection does not contain any playable images.";

            //this.codaModal.showDialog(dialogModalObj);
            this.codaModal.showError(dialogModalObj, null);
            console.log("[WARN  503.1] Error fetching rvspec: " + rvSpec);
            return;
        }

        // Finally, if we got here, start the playback by opening the rvlink
        // url.
        this.rvLinkURL = this._dgraphService.constructPlaybackUrl(rvSpec);
        if (this.rvLinkURL.length > 0) {
            location.href = this.rvLinkURL;
        }
        this.codaModal.hideLoad();
    }

}
