exports.TASK_STATUS_CODES = {
    "unknown": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "queued": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "run": { name: "running", statusClass: "running", sortPriority: 0 },
    "depend": { name: "dependent", statusClass: "dependent", sortPriority: 1 },
    "done": { name: "done", statusClass: "done", sortPriority: 2 },
    "exit": { name: "exited", statusClass: "exited", sortPriority: 0 },
    "userkill": { name: "killed", statusClass: "killed", sortPriority: 3 },
    "syskill": { name: "sys killed", statusClass: "sys-killed", sortPriority: 0 },
    "wait": { name: "wait", statusClass: "paused", sortPriority: 2 },
    "usersus": { name: "wait", statusClass: "paused", sortPriority: 2 },
    "requeue": { name: "requeue", statusClass: "requeue", sortPriority: 1 },
    "reqsus": { name: "wait", statusClass: "paused", sortPriority: 2 },
    "resync": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "paused": { name: "wait", statusClass: "paused", sortPriority: 2 }
};
exports.ARRAY_STATUS_CODES = {
    "unknown": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "queued": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "run": { name: "running", statusClass: "running", sortPriority: 0 },
    "done": { name: "done", statusClass: "done", sortPriority: 2 },
    "exit": { name: "exited", statusClass: "exited", sortPriority: 0 },
    "killed": { name: "killed", statusClass: "killed", sortPriority: 3 },
    "wait": { name: "wait", statusClass: "paused", sortPriority: 2 },
    "depend": { name: "dependent", statusClass: "dependent", sortPriority: 1 },
    "exit/run": { name: "exited", statusClass: "exit-run", sortPriority: 0 },
    "exit/wait": { name: "exited", statusClass: "exit-wait", sortPriority: 0 },
    "killed/run": { name: "killed", statusClass: "killed-run", sortPriority: 3 },
    "killed/wait": { name: "killed", statusClass: "killed-wait", sortPriority: 3 }
};
exports.DGRAPH_STATUS_CODES = {
    "unknown": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "queued": { name: "in queue", statusClass: "in-queue", sortPriority: 1 },
    "run": { name: "running", statusClass: "running", sortPriority: 0 },
    "done": { name: "done", statusClass: "done", sortPriority: 2 },
    "exit": { name: "exited", statusClass: "exited", sortPriority: 0 },
    "killed": { name: "killed", statusClass: "killed", sortPriority: 3 },
    "wait": { name: "wait", statusClass: "paused", sortPriority: 2 },
    "depend": { name: "dependent", statusClass: "dependent", sortPriority: 1 },
    "exit/run": { name: "exited", statusClass: "exit-run", sortPriority: 0 },
    "exit/wait": { name: "exited", statusClass: "exit-wait", sortPriority: 0 },
    "killed/run": { name: "killed", statusClass: "killed-run", sortPriority: 3 },
    "killed/wait": { name: "killed", statusClass: "killed-wait", sortPriority: 3 },
};