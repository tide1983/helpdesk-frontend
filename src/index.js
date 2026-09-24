import { api } from './api';
import { renderTickets, renderDescription, showModal, showConfirm } from './ui';

const app = document.getElementById('app');

app.innerHTML = `
  <div class="container">
    <div class="header">
      <button class="btn" id="add-btn">Добавить тикет</button>
    </div>
    <div id="tickets"></div>
  </div>
`;

const ticketsEl = document.getElementById('tickets');

/* ---------- Загрузка списка ---------- */

async function loadTickets() {
  ticketsEl.innerHTML = '<div class="loader">Загрузка...</div>';

  try {
    const tickets = await api.getAllTickets();
    renderTickets(ticketsEl, tickets, {
      onShow: handleShow,
      onToggle: handleToggle,
      onEdit: handleEdit,
      onDelete: handleDelete,
    });
  } catch (e) {
    ticketsEl.innerHTML = `<div class="empty">Ошибка загрузки: ${e.message}</div>`;
  }
}

/* ---------- Обработчики ---------- */

async function handleShow(id, el) {
  try {
    const ticket = await api.getTicketById(id);
    renderDescription(el, ticket.description);
  } catch (e) {
    alert('Не удалось загрузить описание: ' + e.message);
  }
}

async function handleToggle(id, status) {
  try {
    await api.updateTicket(id, { status });
    await loadTickets();
  } catch (e) {
    alert('Не удалось обновить статус: ' + e.message);
  }
}

function handleEdit(ticket) {
  // Сначала подгружаем полное описание
  api.getTicketById(ticket.id).then((full) => {
    showModal({
      title: 'Изменить тикет',
      fields: [
        {
          name: 'name',
          label: 'Краткое описание',
          required: true,
          value: full.name,
        },
        {
          name: 'description',
          label: 'Подробное описание',
          type: 'textarea',
          value: full.description || '',
        },
      ],
      submitText: 'Ок',
      onSubmit: async (data) => {
        try {
          await api.updateTicket(ticket.id, {
            name: data.name,
            description: data.description,
            status: full.status,
          });
          await loadTickets();
        } catch (e) {
          alert('Не удалось сохранить: ' + e.message);
        }
      },
    });
  }).catch((e) => {
    alert('Не удалось загрузить тикет: ' + e.message);
  });
}

function handleDelete(id) {
  showConfirm({
    title: 'Удалить тикет',
    message: 'Вы уверены, что хотите удалить тикет? Это действие необратимо.',
    confirmText: 'Ок',
    onConfirm: async () => {
      try {
        await api.deleteTicket(id);
        await loadTickets();
      } catch (e) {
        alert('Не удалось удалить: ' + e.message);
      }
    },
  });
}

/* ---------- Создание тикета ---------- */

document.getElementById('add-btn').addEventListener('click', () => {
  showModal({
    title: 'Добавить тикет',
    fields: [
      {
        name: 'name',
        label: 'Краткое описание',
        required: true,
      },
      {
        name: 'description',
        label: 'Подробное описание',
        type: 'textarea',
      },
    ],
    submitText: 'Ок',
    onSubmit: async (data) => {
      try {
        await api.createTicket({
          name: data.name,
          description: data.description,
          status: false,
        });
        await loadTickets();
      } catch (e) {
        alert('Не удалось создать тикет: ' + e.message);
      }
    },
  });
});

/* ---------- Старт ---------- */

loadTickets();