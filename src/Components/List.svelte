<script>
  import { beforeUpdate, afterUpdate } from "svelte";
  import { getBranchName, workItemTypes } from "../WorkItem";

  export let list;
  export let handleSelection;
  let autoscroll;
  let div;

  beforeUpdate(() => {
    autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight;
  });

  afterUpdate(() => {
    if (autoscroll) {
      div.scrollTo(0, div.scrollHeight);
    }
  });

  function getBackgroundColor({ "system.workitemtype": type }) {
    return workItemTypes[type].color;
  }

  function getTitle({ "system.title": title }) {
    return title;
  }
</script>

<style>
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

<ul class="results scrollable-container" bind:this={div}>
  {#each list as { fields }}
    <li class="result" on:click={() => handleSelection(fields)}>
      <div>
        <div
          class="result__icon"
          style="--backgroundColor:{getBackgroundColor(fields)}" />
      </div>
      <div class="result__title">{getTitle(fields)}</div>
    </li>
  {/each}
</ul>
