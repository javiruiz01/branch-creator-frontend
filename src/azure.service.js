const apiUrl = `https://almsearch.dev.azure.com/payvision/Warriors/_apis/search/workitemsearchresults?api-version=5.1-preview.1`;
const basicFields = {
  $skip: 0,
  $top: 20,
  filters: null,
  $orderBy: [
    {
      field: 'system.id',
      sortOrder: 'DESC',
    },
  ],
};

export async function searchAzure(token, searchText) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    Authorization: `Basic ${btoa(`:${token}`)}`,
  });

  const requestOptions = {
    method: 'POST',
    headers,
    body: JSON.stringify({ ...basicFields, searchText }),
    redirect: 'follow',
  };

  return await fetch(apiUrl, requestOptions).then((res) => res.json());
}
