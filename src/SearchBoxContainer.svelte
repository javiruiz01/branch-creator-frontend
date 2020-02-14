<script>
  import { searchAzure } from "./azure.service";
  import { token, newBranchName } from "./Store.js";
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
    searchAzure($token, value)
      .then(({ results }) => (searchResults = results))
      .finally(() => (loading = false));
  }

  function handleSelection({
    "system.workitemtype": type,
    "system.id": id,
    "system.title": title
  }) {
    const branchName = getBranchName(type, id, title);
    newBranchName.update(newBranchName => (newBranchName = branchName));
    const listener = e => {
      e.clipboardData.setData("text/plain", branchName);
      e.preventDefault();
    };
    document.addEventListener("copy", listener, false);
    document.execCommand("copy");
    document.removeEventListener("copy", listener, false);
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
