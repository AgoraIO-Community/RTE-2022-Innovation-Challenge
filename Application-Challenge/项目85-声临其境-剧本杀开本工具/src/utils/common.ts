export function get_uid() {
  const query = new URLSearchParams(location.search);
  let uid = query.get("uid");
  if (!uid) {
    uid = Math.random().toString(36).slice(2);
    update_query({ uid });
  }
  console.debug("uid =", uid);
  return uid;
}

function update_query(set: Record<string, string | undefined>) {
  const query = new URLSearchParams(location.search);
  for (const key of Object.keys(set)) {
    if (set[key] === undefined) {
      query.delete(key);
    } else {
      query.set(key, set[key]!);
    }
  }
  history.replaceState(null, "", "?" + query.toString());
}

export function search_parse() {
  let resultObj: any = {};
  let search = window.location.search;
  if(search && search.length > 1){
    search = search.substring(1);
    let items = search.split('&');
    items.forEach(item => {
      const pair = item.split("=");
      resultObj[pair[0]] = pair[1];
    })
  } 
  return resultObj;
}

export function findUid() {
  const query = new URLSearchParams(location.search);
  let uid = query.get("uid");
  return uid;
}