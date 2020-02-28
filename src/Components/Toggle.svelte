<script>
  import { theme } from "../Store";

  const transitionClass = "color-theme-in-transition";
  let selectedTheme;
  theme.subscribe(value => {
    selectedTheme = value;
    document.documentElement.setAttribute("data-theme", value);
  });

  function switchTheme(selected) {
    theme.update(theme => (theme = selected));
    const { classList } = document.body;
    classList.add(transitionClass);
    window.setTimeout(() => classList.remove(transitionClass), 1000);
  }

  function handleKeyDown(event, theme) {
    if (event.code === "Space" || event.code === "Enter") {
      event.preventDefault();
      switchTheme(theme);
    }
  }
</script>

<style>
  .container {
    position: absolute;
    top: 1.875rem;
    right: 1.875rem;
  }

  .toggle {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: var(--theme-background);
    border-radius: 4px;
    position: relative;
  }
  .toggle-light,
  .toggle-dark {
    display: flex;
    justify-content: center;
    font-size: 1rem;
    font-family: "Fira Code", sans-serif;
    z-index: 1;
    padding: 1rem;
    cursor: pointer;
    width: 80px;
  }

  .focusable {
    outline: 0;
    border: 0;
  }

  .focusable:focus {
    border-color: #0070c9;
    box-shadow: 0 0 0 3px rgba(131, 192, 253, 0.5);
    border-radius: 4px;
  }

  .toggle-light {
    color: var(--theme-font);
  }
  .toggle-dark {
    color: black;
  }

  .selected {
    position: absolute;
    background-color: white;
    border-radius: 4px;
    height: 2.5rem;
    width: 75px;
    top: 4px;
    transition: all 0.1s ease-in-out;
  }

  .light {
    left: 4px;
    transform: translate(0);
  }

  .dark {
    transform: translate(110%);
  }
</style>

<div class="container">
  <div class="toggle">
    <div
      class="toggle-light focusable "
      tabindex="0"
      on:keydown={e => handleKeyDown(e, 'light')}
      on:click={() => switchTheme('light')}
      aria-label="Set light theme">
      Ligth
    </div>
    <div
      class="toggle-dark focusable "
      tabindex="0"
      on:keydown={e => handleKeyDown(e, 'dark')}
      on:click={() => switchTheme('dark')}
      aria-label="Set dark theme">
      Dark
    </div>
    <div
      class="selected"
      class:light={selectedTheme === 'light'}
      class:dark={selectedTheme === 'dark'} />
  </div>
</div>
