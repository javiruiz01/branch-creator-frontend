<script>
  import { beforeUpdate, afterUpdate } from "svelte";

  export let list;
  let autoscroll;
  let div;

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

  beforeUpdate(() => {
    autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight;
  });

  afterUpdate(() => {
    if (autoscroll) {
      div.scrollTo(0, div.scrollHeight);
    }
  });
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
