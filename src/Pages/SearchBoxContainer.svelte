<script>
  import { getBranchName } from "../WorkItem";
  import { searchAzure } from "../azure.service";
  import { token, newBranchName } from "../Store.js";
  import Input from "../Components/Input.svelte";
  import List from "../Components/List.svelte";
  import Loader from "../Components/Loader.svelte";

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
    copyToClipboard(getBranchName(type, id, title));
  }

  function copyToClipboard(branchName) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(branchName)
        .then(() => newBranchName.update(name => (name = branchName)));
    } else {
      const listener = e => {
        e.clipboardData.setData("text/plain", branchName);
        e.preventDefault();
      };
      document.addEventListener("copy", listener, false);
      document.execCommand("copy");
      document.removeEventListener("copy", listener, false);
    }
  }

  function handleKeyDown(event) {
    if (event.code === "ArrowDown") {
      event.preventDefault();
      const firstListElement = document.body.querySelector(".result_0");
      if (firstListElement) firstListElement.focus();
    }
  }
</script>

<style>
  .search-box {
    width: 100%;
    position: relative;
  }
</style>

<div class="search-box">
  <Input
    {handleChange}
    {handleKeyDown}
    placeholder="Work item Id"
    label="searchbox" />
  <Loader {loading} />
  <List list={searchResults} {handleSelection} />
</div>
