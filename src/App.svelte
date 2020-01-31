<script>
  import { onMount } from "svelte";
  const apiUrl = `https://almsearch.dev.azure.com/payvision/Warriors/_apis/search/workitemsearchresults?api-version=5.1-preview.1`;

  let results = [];
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append(
    "Authorization",
    "Basic OnBid3BzaGxhdW54aXJlejZsNm5kM2pub2kyb2JjeGd2anpkaHZlN2M0YnhpeXNycnNrcmE="
  );

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: JSON.stringify({
      searchText: "130988",
      $skip: 0,
      $top: 1,
      filters: null,
      $orderBy: [
        {
          field: "system.id",
          sortOrder: "ASC"
        }
      ]
    }),
    redirect: "follow"
  };

  onMount(async () => {
    const res = await fetch(apiUrl, requestOptions);
    results = await res.json();
    console.log(results);
  });

  function handleChange({ target: { value } }) {
    console.log(value);
  }
</script>

<style>
  .container {
    display: grid;
    width: 100vw;
    height: 100vh;
    justify-items: center;
    align-items: center;
  }

  input[type="text"] {
    -webkit-appearance: none;
    outline: none;
    height: 3.438rem;
    border: none;
    background-color: #d8d8d840;
    font-size: 1.063rem;
    border-radius: 4px;
    padding: 0 16px;
    width: 50%;
    max-width: 43.75rem;
    min-width: 18.75rem;
  }
</style>

<main>
  <div class="container">
    <input
      on:input={handleChange}
      type="text"
      placeholder="Write here your work item ID" />
  </div>
</main>
