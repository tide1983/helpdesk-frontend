import './styles.css';

/**
 * Форматирует timestamp в строку вида "10.03.19 08:40"
 */
export function formatDate(timestamp) {
  const d = new Date(timestamp);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = String(d.getFullYear()).slice(-2);
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

/**
 * Отрисовывает список тикетов.
 */
export function renderTickets(container, tickets, handlers) {
  container.innerHTML = '';

  if (!tickets.length) {
    container.innerHTML = '<div class="empty">Тикетов пока нет</div>';
    return;
  }

  tickets.forEach((t) => {
    const el = document.createElement('div');
    el.className = 'ticket';
    el.dataset.id = t.id;

    el.innerHTML = `
      <span class="ticket__check ${t.status ? 'done' : ''}">✓</span>
      <span class="ticket__name ${t.status ? 'done' : ''}">${escapeHtml(t.name)}</span>
      <span class="ticket__date">${formatDate(t.created)}</span>
      <button type="button" class="btn-icon ticket__edit" title="Редактировать">✎</button>
      <button type="button" class="btn-icon ticket__delete" title="Удалить">✕</button>
    `;

    // Клик по телу тикета (не по кнопкам и не по чекбоксу) — показать описание
    el.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('.ticket__check')) return;
      handlers.onShow(t.id, el);
    });

    // Клик по кружку — переключить статус
    el.querySelector('.ticket__check').addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onToggle(t.id, !t.status);
    });

    el.querySelector('.ticket__edit').addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onEdit(t);
    });

    el.querySelector('.ticket__delete').addEventListener('click', (e) => {
      e.stopPropagation();
      handlers.onDelete(t.id);
    });

    container.appendChild(el);
  });
}

/**
 * Показывает/скрывает описание под тикетом.
 */
export function renderDescription(el, text) {
  const next = el.nextElementSibling;
  if (next && next.classList.contains('ticket__desc')) {
    next.remove();
    return;
  }
  const desc = document.createElement('div');
  desc.className = 'ticket__desc';
  desc.textContent = text || 'Без описания';
  el.insertAdjacentElement('afterend', desc);
}

/**
 * Универсальное модальное окно с полями.
 */
export function showModal({ title, fields = [], onSubmit, submitText = 'Ок' }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const form = document.createElement('form');
  form.className = 'modal';

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  form.appendChild(titleEl);

  const inputs = {};

  fields.forEach((f) => {
    const label = document.createElement('label');
    label.textContent = f.label;
    label.htmlFor = `field-${f.name}`;
    form.appendChild(label);

    const input = f.type === 'textarea'
      ? document.createElement('textarea')
      : document.createElement('input');

    input.id = `field-${f.name}`;
    input.name = f.name;
    input.required = !!f.required;
    if (f.type === 'textarea') input.rows = 4;
    if (f.value != null) input.value = f.value;

    inputs[f.name] = input;
    form.appendChild(input);
  });

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn modal__cancel';
  cancelBtn.textContent = 'Отмена';

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn modal__confirm';
  submitBtn.textContent = submitText;

  actions.appendChild(cancelBtn);
  actions.appendChild(submitBtn);
  form.appendChild(actions);

  cancelBtn.addEventListener('click', () => backdrop.remove());

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {};
    Object.entries(inputs).forEach(([key, input]) => {
      data[key] = input.value.trim();
    });
    onSubmit(data);
    backdrop.remove();
  });

  backdrop.appendChild(form);
  document.body.appendChild(backdrop);

  // Автофокус на первое поле
  const firstInput = form.querySelector('input, textarea');
  if (firstInput) firstInput.focus();
}

/**
 * Модальное окно подтверждения (для удаления).
 */
export function showConfirm({ title, message, onConfirm, confirmText = 'Ок' }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'modal';

  const titleEl = document.createElement('h3');
  titleEl.textContent = title;
  modal.appendChild(titleEl);

  const text = document.createElement('p');
  text.textContent = message;
  modal.appendChild(text);

  const actions = document.createElement('div');
  actions.className = 'modal__actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'btn modal__cancel';
  cancelBtn.textContent = 'Отмена';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'btn modal__confirm';
  confirmBtn.textContent = confirmText;

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  modal.appendChild(actions);

  cancelBtn.addEventListener('click', () => backdrop.remove());
  confirmBtn.addEventListener('click', () => {
    onConfirm();
    backdrop.remove();
  });

  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
}

/**
 * Простая защита от XSS при вставке имени тикета.
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}