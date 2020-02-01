<script>
  import { searchAzure } from "./azure.service";
  import { beforeUpdate, afterUpdate } from "svelte";
  import Input from "./Input.svelte";
  import Loader from "./Loader.svelte";

  const colors = {
    Bug: "rgb(204, 41, 61)",
    Enabler: "rgb(96, 175, 73)",
    Epic: "rgb(255, 123, 0)",
    Feature: "rgb(119, 59, 147)",
    Issue: "rgb(96, 175, 73)",
    Kaizen: "rgb(96, 175, 73)",
    Pentesting: "pentesting",
    Support: "rgb(96, 175, 73)",
    Task: "rgb(242, 203, 29)",
    "Tech Debt": "rgb(96, 175, 73)",
    "Test Case": "rgb(96, 175, 73)",
    "User Story": "rgb(0, 156, 204)"
  };

  let autoscroll;
  let div;
  let loading;
  let searchResults = [];
  $: isEmpty = searchResults.length === 0;

  beforeUpdate(() => {
    autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight;
  });

  afterUpdate(() => {
    if (autoscroll) {
      div.scrollTo(0, div.scrollHeight);
    }
  });

  async function handleChange({ target: { value } }) {
    if (!value) {
      searchResults = [];
      loading = false;
      return;
    }

    loading = true;
    const { results } = await searchAzure(value);
    loading = false;
    searchResults = results;
  }
</script>

<style>
  .center {
    display: grid;
    width: 100vw;
    height: 100vh;
    justify-items: center;
    align-items: center;
  }

  .container {
    justify-content: center;
    display: flex;
    flex-direction: column;
    width: 75%;
    height: 100%;
    max-width: 43.75rem;
    min-width: 18.75rem;
    position: relative;
  }

  .title {
    justify-self: center;
    align-self: center;
    margin-bottom: 1.25rem;
    font-size: 1.5rem;
    font-family: "Fira Code", sans-serif;
  }

  .search-box {
    width: 100%;
    position: relative;
  }

  .results {
    position: absolute;
    top: 4.0625rem;
    background-color: #d8d8d840;
    border-radius: 4px;
    max-height: 18.75rem;
    overflow-y: auto;
    width: 100%;
  }

  .result {
    padding: 0.625rem 0.9375rem;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .result:hover {
    background-color: #dcdce0;
  }

  .result__icon {
    border-radius: 50%;
    width: 0.5rem;
    height: 0.5rem;
    background-color: var(--backgroundColor);
  }

  .result__title {
    margin-left: 12px;
  }
</style>

<main class="center">
  <div class="container">
    <div class="title">
      <h1>Branch creator</h1>
    </div>
    <div class="search-box">
      <Input {handleChange} placeholder="Work item Id" />
      <Loader {loading} />
      <ul class="results scrollable-container" bind:this={div}>
        {#each searchResults as { fields }}
          <li class="result">
            <div>
              <div
                class="result__icon"
                style="--backgroundColor:{colors[fields['system.workitemtype']]}" />
            </div>
            <div class="result__title">{fields['system.title']}</div>
          </li>
        {/each}
      </ul>
    </div>
  </div>
</main>
