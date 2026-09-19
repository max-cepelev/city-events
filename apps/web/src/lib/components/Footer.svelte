<footer class="site-footer">
  <span class="footer-brand">Пермь.События</span>
  <p class="footer-note">Единая афиша Перми · данные обновляются ежедневно</p>
  <nav class="social" aria-label="Мессенджеры">
    <a href="https://t.me" rel="external noopener">Telegram</a>
    <a href="https://max.ru" rel="external noopener">MAX</a>
  </nav>
</footer>

<style>
  .site-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-m);
    min-height: 98px;
    padding: var(--space-m) var(--page-padding);
    background: var(--foreground-primary);
    color: #ffffff;
  }

  .footer-brand {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 600;
  }

  .footer-note {
    margin: 0;
    color: rgb(255 255 255 / 67%);
    font-family: var(--font-caption);
    font-size: 12px;
  }

  .social {
    display: flex;
    gap: var(--space-m);
  }

  .social a {
    font-size: 13px;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    .site-footer {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
      padding: var(--space-l) var(--page-padding);
    }
  }
</style>
