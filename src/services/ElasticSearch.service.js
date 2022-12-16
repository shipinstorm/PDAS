import { logPaneData } from "./logPaneData";

export const baseUrl = 'http://coda-rest.dyn.fa.disney.com/';
export const nfsBaseURL = 'http://coda-rest-nfs-dev.dyn.fa.disney.com/';
export const elasticsearchURL = 'https://wdas-elastic.fas.fa.disney.com:9200/coda_6';

class ElasticSearchService {
  static getDgraphs(query, from, size, hidden) {
    let searchQuery = (hidden ? '' : '!clienthide:1 ') + (query ? ('_exists_:did !_exists_:aid ' + query) : '_exists_:did !_exists_:aid');
    let searchUrl = elasticsearchURL + '/_search?default_operator=AND&sort=did:desc&from=' + from + '&size=' + size + '&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl).then(res => res.json());
  }

  static getArrays(did) {
    let searchQuery = '_exists_:aid !_exists_:tid did:' + did;
    let searchUrl = elasticsearchURL + '/_search?default_operator=AND&sort=aid:asc&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl).then(res => res.json());
  }

  static getTasks(did, aid) {
    let searchQuery = '_exists_:tid did:' + did + ' aid: ' + aid;
    let searchUrl = elasticsearchURL + '/_search?default_operator=AND&sort=tid:asc&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl).then(res => res.json());
  }

  static setDgraphMeta(did, key, value, errorCallback) {
    let searchUrl = baseUrl + 'noauth/actions/setMeta/dgraph.' + did + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    }).then(res => res);
  };

  static setArrayMeta(did, aid, key, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let searchUrl = baseUrl + 'noauth/actions/setMeta/array.' + did + '.' + aid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res);
  };

  static setTaskMeta(did, aid, tid, key, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let searchUrl = baseUrl + 'noauth/actions/setMeta/task.' + did + '.' + aid + '.' + tid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => {
      let body = res.json();
      return body.data || {};
    });
  };

  static getPoolData() {
    let searchUrl = baseUrl + 'noauth/getMeta/stats.cpupools?usecache=True&expire=30';
    return fetch(searchUrl).then(res => res.json());
  };

  static getLogHtml(dgraphId, arrayId, taskId) {
    let searchUrl = nfsBaseURL + 'logJSON/' + dgraphId + '/' + arrayId + '/' + taskId + '/' + 1024000;
    return fetch(searchUrl).then(res => res.json()).catch(() => logPaneData);
  }

  static networkCheck() {
    return new Promise((resolve, reject) => { resolve({}) });
    // let headers = new Headers();
    // // if(CodaGlobals.devmode === false) {
    // //   headers.append('X-Requested-With', 'XMLHtt•pRequest');
    // // }
    // let searchUrl = baseUrl+'noauth/health_rest';
    // return fetch(searchUrl, {
    //   headers: headers
    // }).then(res => {
    //   let body = res.json();
    //   return body.data || { };
    // });
  }

  static playImages(dgraphId, arrayId = 0, taskId = 0) {
    return new Promise((resolve, reject) => { resolve([]) });
    // let headers = new Headers();
    // let searchUrl = '';
    // console.log("[DEBUG] In playImages()")
    // if (taskId) {
    //   console.log("[DEBUG] - dgraphId=" + dgraphId)
    //   console.log("[DEBUG] - arrayId=" + arrayId)
    //   console.log("[DEBUG] - taskId=" + taskId)
    //   searchUrl = nfsBaseURL + 'imagepaths/' + dgraphId + '/' + arrayId + '/' + taskId;
    //   return fetch(searchUrl, {
    //     headers: headers
    //   }).then(res => {
    //     let body = res.json();
    //     return body.data || { };
    //   })
    // }
    // else if (arrayId) {
    //   console.log("[DEBUG] - dgraphId=" + dgraphId)
    //   console.log("[DEBUG] - arrayId=" + arrayId)
    //   searchUrl = nfsBaseURL + 'imagepaths/' + dgraphId + '/' + arrayId;
    //   return fetch(searchUrl, {
    //     headers: headers
    //   }).then(res => {
    //     let body = res.json();
    //     return body.data || { };
    //   })
    // }
    // console.log("[DEBUG] - dgraphId=" + dgraphId)
    // searchUrl = nfsBaseURL + 'imagepaths/' + dgraphId;
    // return fetch(searchUrl, {
    //   headers: headers
    // }).then(res => {
    //   let body = res.json();
    //   return body.data || { };
    // })
  }
}

export default ElasticSearchService;
