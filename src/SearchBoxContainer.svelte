<script>
  import { searchAzure } from "./azure.service";
  import { token } from "./Store.js";
  import { getBranchName } from "./WorkItem";

  import Input from "./Input.svelte";
  import Loader from "./Loader.svelte";
  import List from "./List.svelte";

  let loading;
  let searchResults = [];

  async function handleChange({ target: { value } }) {
    if (!value) {
      searchResults = [];
      loading = false;
      return;
    }

    loading = true;
    const { results } = await searchAzure($token, value);
    searchResults = results;
    loading = false;
  }

  function handleSelection({
    "system.workitemtype": type,
    "system.id": id,
    "system.title": title
  }) {
    const branchName = getBranchName(type, id, title);
    console.log(branchName);
  }
</script>

<style>
  .search-box {
    width: 100%;
    position: relative;
  }
</style>

<div class="search-box">
  <Input {handleChange} placeholder="Work item Id" />
  <Loader {loading} />
  <List list={searchResults} {handleSelection} />
</div>
