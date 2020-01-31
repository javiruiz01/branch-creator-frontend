const apiUrl = `https://almsearch.dev.azure.com/payvision/Warriors/_apis/search/workitemsearchresults?api-version=5.1-preview.1`;
const basicFields = {
  $skip: 0,
  $top: 1,
  filters: null,
  $orderBy: [
    {
      field: 'system.id',
      sortOrder: 'ASC'
    }
  ]
};

export async function searchAzure(searchText) {
  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  myHeaders.append(
    'Authorization',
    'Basic OnBid3BzaGxhdW54aXJlejZsNm5kM2pub2kyb2JjeGd2anpkaHZlN2M0YnhpeXNycnNrcmE='
  );

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify(Object.assign({}, basicFields, { searchText })),
    redirect: 'follow'
  };

  return await fetch(apiUrl, requestOptions).then(res => res.json());
}
