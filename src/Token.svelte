<script>
  import { token } from "./Store.js";
  import Input from "./Input.svelte";

  let userToken;

  function handleClick(event) {
    event.preventDefault();
    token.update(token => (token = userToken));
  }

  function handleChange({ target }) {
    userToken = target.value;
  }
</script>

<style>
  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  button {
    margin-top: 2rem;
    text-decoration: none;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 2px;
    background: none;
    border: none;
    outline: none;
    cursor: pointer;
    position: relative;
    font-weight: 200;
  }

  .animate {
    position: absolute;
    width: 1.1rem;
    top: 0;
    right: -1.1rem;
  }

  button:hover > .animate {
    animation: bounce 0.5s ease-in-out;
  }

  @keyframes bounce {
    0% {
      right: -1.1rem;
    }
    50% {
      right: -1.4rem;
    }
    100% {
      right: -1.1rem;
    }
  }
</style>

<form on:submit={event => handleClick(event)}>
  <Input {handleChange} placeholder="Set your token" />
  <div>
    <button>
      Submit
      <span class="animate">→</span>
    </button>
  </div>
</form>
