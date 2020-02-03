const apiUrl = `https://almsearch.dev.azure.com/payvision/Warriors/_apis/search/workitemsearchresults?api-version=5.1-preview.1`;
const basicFields = {
  $skip: 0,
  $top: 20,
  filters: null,
  $orderBy: [
    {
      field: 'system.id',
      sortOrder: 'DESC'
    }
  ]
};

export async function searchAzure(token, searchText) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append('Authorization', `Basic ${token}`);

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(Object.assign({}, basicFields, { searchText })),
    redirect: 'follow'
  };

  return await fetch(apiUrl, requestOptions).then(res => res.json());
}
