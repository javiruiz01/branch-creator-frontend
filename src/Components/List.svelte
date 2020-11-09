<script>
  import { beforeUpdate, afterUpdate } from 'svelte';
  import { getBranchName, workItemTypes } from '../WorkItem';

  export let list;
  export let handleSelection;

  function focusElementOrDefault(nextSelectableElement) {
    nextSelectableElement =
      nextSelectableElement || document.body.querySelector('#searchbox');
    nextSelectableElement.focus();
  }

  function getBackgroundColor({ 'system.workitemtype': rawType }) {
    const type = workItemTypes[rawType];
    return type == null ? 'black' : type.color;
  }

  function getTitle({ 'system.title': title }) {
    return title;
  }

  function onKeyDown(event, fields) {
    switch (event.code) {
      case 'Space':
      case 'Enter':
        event.preventDefault();
        handleSelection(fields);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusElementOrDefault(event.target.previousSibling);
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusElementOrDefault(event.target.nextSibling);
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'Tab':
        break;
      default:
        event.preventDefault();
        focusElementOrDefault(null);
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
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .result {
    border: 1px solid transparent;
    padding: 0.625rem 0.9375rem;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    outline: 0;
    -webkit-appearance: none;
    width: calc(100% - 6px);
  }

  .result:first-child {
    margin-top: 3px;
  }

  .result:last-child {
    margin-bottom: 3px;
  }

  .result:focus {
    border: 1px solid rgba(131, 192, 253, 0.5);
    box-shadow: 0 0 0 3px rgba(131, 192, 253, 0.5);
    border-radius: 4px;
    outline: none;
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

<ul tabindex="-1" class="results scrollable-container">
  {#each list as { fields }, i}
    <li
      class="result result_{i}"
      tabindex="0"
      on:keydown={(e) => onKeyDown(e, fields)}
      on:click={() => handleSelection(fields)}>
      <div
        class="result__icon"
        style="--backgroundColor:{getBackgroundColor(fields)}" />
      <div class="result__title">{getTitle(fields)}</div>
    </li>
  {/each}
</ul>
