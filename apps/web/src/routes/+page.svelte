<svelte:head>
  <title>City Events — городская афиша</title>
  <meta
    name="description"
    content="City Events собирает городские мероприятия в одной афише. MVP запускается для Перми."
  />
</svelte:head>

<main>
  <section aria-labelledby="page-title">
    <p class="eyebrow">Пермь · MVP</p>
    <h1 id="page-title">Городские события — в одном месте</h1>
    <p class="lead">
      Основа City Events готовится к каталогу: публичный сайт будет работать без регистрации,
      а управление афишей останется в защищённой административной панели.
    </p>
    <div class="status" role="status">
      <span aria-hidden="true"></span>
      Инфраструктурный этап
    </div>
  </section>
</main>

<style>
  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background:
      radial-gradient(circle at 15% 10%, rgba(255, 154, 92, 0.18), transparent 35rem),
      #f4f0e8;
    color: #25231f;
    font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  }

  main {
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 2rem;
  }

  section {
    width: min(100%, 70rem);
    border-top: 1px solid rgba(37, 35, 31, 0.35);
    padding-top: clamp(3rem, 10vw, 8rem);
  }

  .eyebrow {
    margin: 0 0 1.5rem;
    color: #a04320;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }

  h1 {
    max-width: 13ch;
    margin: 0;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(3.2rem, 9vw, 8.5rem);
    font-weight: 500;
    letter-spacing: -0.055em;
    line-height: 0.9;
  }

  .lead {
    max-width: 45rem;
    margin: 2.5rem 0 2rem;
    color: #555047;
    font-size: clamp(1.05rem, 2vw, 1.35rem);
    line-height: 1.6;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
    border: 1px solid rgba(37, 35, 31, 0.2);
    border-radius: 999px;
    padding: 0.6rem 0.9rem;
    font-size: 0.85rem;
  }

  .status span {
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: #bb572e;
    box-shadow: 0 0 0 0.25rem rgba(187, 87, 46, 0.14);
  }
</style>
