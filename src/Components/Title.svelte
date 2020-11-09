<script>
  import { mode } from '../Store';
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';

  $: isBranch = $mode === 'Branch';
  let buttonWidth = 'auto';

  onMount(() => void (buttonWidth = getWidth()));

  async function changeType() {
    mode.set(isBranch ? 'Commit message' : 'Branch');
    setTimeout(() => void (buttonWidth = getWidth()), 400);
  }

  function getWidth() {
    return isBranch ? '127px' : '241px';
  }
</script>

<style>
  .title {
    justify-self: center;
    align-self: center;
    margin-bottom: 1.25rem;
  }

  .title > h1 {
    font-size: 1.5rem;
    font-family: 'Fira Code', sans-serif;
    color: var(--theme-font);
    display: flex;
    align-items: center;
  }

  .change-button {
    /** Reset button styles */
    cursor: pointer;
    outline: none;
    appearance: none;
    border: none;

    display: flex;

    font-size: 1.5rem;
    font-family: 'Fira Code', sans-serif;
    color: var(--theme-font-light);
    max-width: 241px;
    padding: 1rem 0.5rem;
    background-color: var(--theme-background);
    border-radius: 0.375rem;
    position: relative;
    white-space: nowrap;

    transition-property: width;
    transition-duration: 150ms;
    transition-timing-function: ease-in-out;
  }

  .change-button:focus {
    border-color: #0070c9;
    box-shadow: 0 0 0 3px rgba(131, 192, 253, 0.5);
  }

  .change-button > div {
    width: 1.5rem;
    height: 1.5rem;
    align-self: center;
    flex-shrink: 0;
  }
</style>

<div class="title">
  <h1>
    <button
      type="button"
      on:click|preventDefault={changeType}
      style="width: {buttonWidth}"
      class="change-button">
      <div>
        <svg
          fill="none"
          stroke="var(--theme-font-light)"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
      </div>
      {#key isBranch}
        <span
          in:fly={{ x: 0, y: 25, duration: 500, delay: 500 }}
          out:fly={{ x: 0, y: -25, duration: 500 }}>{$mode}</span>
      {/key}
    </button>
    &nbsp;creator
  </h1>
</div>
