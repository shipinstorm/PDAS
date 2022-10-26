const baseUrl = 'http://coda-rest.dyn.fa.disney.com';
const elasticsearchURL = 'https://wdas-elastic.fas.fa.disney.com:9200/coda_6';

class ElasticSearchService {
  static getDgraphs(query, from, size, hidden) {
    let searchQuery = (hidden ? '' : '!clienthide:1 ') + (query ? ('_exists_:did !_exists_:aid ' + query) : '_exists_:did !_exists_:aid');
    let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=did:desc&from=' + from + '&size=' + size + '&q=' + encodeURIComponent(searchQuery);
    return fetch(searchUrl).then(res => res.json());
  }

  static getArrays(did) {
    let searchQuery = '_exists_:aid !_exists_:tid did:'+did;
    let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=aid:asc&q='+encodeURIComponent(searchQuery);
    return fetch(searchUrl).then(res => res.json());
  }

  static getTasks(did, aid) {
    let searchQuery = '_exists_:tid did:'+did+' aid: '+aid;
    let searchUrl = elasticsearchURL+'/_search?default_operator=AND&sort=tid:asc&q='+encodeURIComponent(searchQuery);
    return fetch(searchUrl).then(res => res.json());
  }

  static setDgraphMeta(did, key, value, errorCallback) {
    let searchUrl = baseUrl + 'noauth/actions/setMeta/dgraph.' + did + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    }).then(res => res.json());
  };

  static setArrayMeta(did, aid, key, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let searchUrl = baseUrl + 'noauth/actions/setMeta/array.' + did + '.' + aid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res.json());
  };

  static setTaskMeta(did, aid, tid, key, value) {
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    let searchUrl = baseUrl + 'noauth/actions/setMeta/task.' + did + '.' + aid + '.' + tid + '.' + key;
    return fetch(searchUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(value),
    }).then(res => res.json());
  };

  static getPoolData = () => {
    let searchUrl = baseUrl + 'noauth/getMeta/stats.cpupools?usecache=True&expire=30';
    return fetch(searchUrl).then(res => res.json());
  };

  static networkCheck = () => {
    let headers = new Headers();
    // if(CodaGlobals.devmode === false) {
    //   headers.append('X-Requested-With', 'XMLHtt•pRequest');
    // }
    let searchUrl = baseUrl+'noauth/health_rest';
    return fetch(searchUrl, {
      headers: headers
    }).then(res => res.json());
  }
}

export default ElasticSearchService;
