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

  function handleArrowKeys(nextSelectableElement) {
    nextSelectableElement =
      nextSelectableElement || document.body.querySelector("#searchbox");
    nextSelectableElement.focus();
  }

  function getBackgroundColor({ "system.workitemtype": type }) {
    return workItemTypes[type].color;
  }

  function getTitle({ "system.title": title }) {
    return title;
  }

  function onKeyDown(event, fields) {
    const {
      code,
      target: { previousSibling, nextSibling }
    } = event;

    switch (code) {
      case "Space":
      case "Enter":
        event.preventDefault();
        handleSelection(fields);
        break;
      case "ArrowUp":
        event.preventDefault();
        handleArrowKeys(previousSibling);
        break;
      case "ArrowDown":
        event.preventDefault();
        handleArrowKeys(nextSibling);
        break;
    }
  }
</script>

<style>
  .results {
    position: absolute;
    top: 4.0625rem;
    background-color: var(--theme-background);
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
    outline: 0;
    -webkit-appearance: none;
  }
  .result:focus {
    border: 1px solid #0070c9;
    box-shadow: 0 0 0 1px rgba(131, 192, 253, 0.5);
    border-radius: 4px;
  }

  .result:hover {
    background-color: var(--theme-background-hover);
  }

  .result__icon {
    border-radius: 50%;
    width: 0.5rem;
    height: 0.5rem;
    background-color: var(--backgroundColor);
  }

  .result__title {
    margin-left: 12px;
    color: var(--theme-font);
  }
</style>

<ul tabindex="-1" class="results scrollable-container" bind:this={div}>
  {#each list as { fields }, i}
    <li
      class="result result_{i}"
      tabindex="0"
      on:keydown={e => onKeyDown(e, fields)}
      on:click={() => handleSelection(fields)}>
      <div>
        <div
          class="result__icon"
          style="--backgroundColor:{getBackgroundColor(fields)}" />
      </div>
      <div class="result__title">{getTitle(fields)}</div>
    </li>
  {/each}
</ul>
